from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import openai
import os
import pandas as pd
import json
from datetime import datetime, timedelta
import re

app = Flask(__name__)
CORS(app)

# Set OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

def connect_to_db(config):
    try:
        connection = mysql.connector.connect(
            host=config['host'],
            user=config['user'],
            password=config['password'],
            database=config['database']
        )
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def generate_sql_query(natural_language_query):
    """Convert natural language to SQL query using OpenAI"""
    
    system_prompt = """
    You are a SQL expert. Convert natural language queries to MySQL SQL queries for a CRM database.
    
    Database schema:
    - customers table: id, name, email, visits, last_active (timestamp), total_spend, is_admin, created_at
    - orders table: id, customer_id, spend, order_date
    
    Rules:
    1. Only return the SQL query, no explanations
    2. Use proper MySQL syntax
    3. For date calculations, use DATE_SUB(CURDATE(), INTERVAL X DAY)
    4. For inactive users, compare last_active with current date
    5. Always include proper WHERE conditions
    6. If asking for count only, use COUNT(*)
    7. If asking for user data, select relevant customer fields
    
    Example queries:
    - "Users who spend > 10000 AND visits < 3" -> SELECT * FROM customers WHERE total_spend > 10000 AND visits < 3
    - "Users inactive for 90 days" -> SELECT * FROM customers WHERE last_active < DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    - "How many users spend > 5000" -> SELECT COUNT(*) as count FROM customers WHERE total_spend > 5000
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": natural_language_query}
            ],
            max_tokens=150,
            temperature=0.1
        )
        
        sql_query = response.choices[0].message.content.strip()
        # Clean up the SQL query
        sql_query = sql_query.replace('```sql', '').replace('```', '').strip()
        return sql_query
    
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return None

def execute_query(connection, sql_query):
    """Execute SQL query and return results"""
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(sql_query)
        results = cursor.fetchall()
        cursor.close()
        return results
    except Exception as e:
        print(f"Query execution error: {e}")
        return None

def is_count_query(query):
    """Check if the query is asking for count only"""
    count_keywords = ['how many', 'count', 'number of', 'total users', 'kitne log']
    return any(keyword in query.lower() for keyword in count_keywords)

def create_excel_file(data, filename):
    """Create Excel file from query results"""
    try:
        df = pd.DataFrame(data)
        excel_path = f"exports/{filename}.xlsx"
        
        # Create exports directory if it doesn't exist
        os.makedirs('exports', exist_ok=True)
        
        df.to_excel(excel_path, index=False)
        return excel_path
    except Exception as e:
        print(f"Excel creation error: {e}")
        return None

@app.route('/process-query', methods=['POST'])
def process_query():
    try:
        data = request.json
        natural_query = data.get('query')
        db_config = data.get('db_config')
        
        if not natural_query or not db_config:
            return jsonify({'error': 'Query and database config are required'}), 400
        
        # Connect to database
        connection = connect_to_db(db_config)
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        # Generate SQL query using OpenAI
        sql_query = generate_sql_query(natural_query)
        if not sql_query:
            return jsonify({'error': 'Failed to generate SQL query'}), 500
        
        print(f"Generated SQL: {sql_query}")
        
        # Execute query
        results = execute_query(connection, sql_query)
        connection.close()
        
        if results is None:
            return jsonify({'error': 'Query execution failed'}), 500
        
        # Check if it's a count query
        if is_count_query(natural_query):
            if results and len(results) > 0:
                if 'count' in results[0]:
                    count = results[0]['count']
                    return jsonify({
                        'type': 'count',
                        'count': count,
                        'message': f"Found {count} users matching your criteria"
                    })
            return jsonify({
                'type': 'count',
                'count': len(results),
                'message': f"Found {len(results)} users matching your criteria"
            })
        
        else:
            # Return data with Excel file option
            if results:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"campaign_results_{timestamp}"
                excel_path = create_excel_file(results, filename)
                
                return jsonify({
                    'type': 'data',
                    'results': results,
                    'count': len(results),
                    'excel_file': excel_path,
                    'message': f"Found {len(results)} users. Excel file generated."
                })
            else:
                return jsonify({
                    'type': 'data',
                    'results': [],
                    'count': 0,
                    'message': "No users found matching your criteria"
                })
    
    except Exception as e:
        print(f"Process query error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/download-excel/<filename>')
def download_excel(filename):
    try:
        from flask import send_file
        return send_file(f"exports/{filename}.xlsx", as_attachment=True)
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)