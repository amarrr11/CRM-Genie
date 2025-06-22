from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import mysql.connector
import google.generativeai as genai
import os
import pandas as pd
import traceback
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Set Gemini API key
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
print(f"Gemini API Key loaded: {'Yes' if os.getenv('GEMINI_API_KEY') else 'No'}")

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
    """Convert natural language to SQL query using Gemini"""
    
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
    6. If asking for count only, use COUNT(*) AS count
    7. If asking for user data, select relevant customer fields

    Example queries:
    - "Users who spend > 10000 AND visits < 3" -> SELECT * FROM customers WHERE total_spend > 10000 AND visits < 3
    - "Users inactive for 90 days" -> SELECT * FROM customers WHERE last_active < DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    - "How many users spend > 5000" -> SELECT COUNT(*) AS count FROM customers WHERE total_spend > 5000
    """

    try:
        print(f"Generating SQL for query: {natural_language_query}")
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"{system_prompt}\n\nQuery: {natural_language_query}\n\nSQL:"
        
        print("Calling Gemini API...")
        response = model.generate_content(prompt)
        print(f"Gemini response: {response}")
        
        if response and hasattr(response, 'text'):
            sql_query = response.text.strip()
            sql_query = sql_query.replace('```sql', '').replace('```', '').strip()
            print(f"Generated SQL query: {sql_query}")
            return sql_query
        else:
            print(f"Invalid response from Gemini: {response}")
            return None

    except Exception as e:
        print(f"Gemini API error: {e}")
        print(f"Error type: {type(e)}")
        traceback.print_exc()
        return None

def execute_query(connection, sql_query):
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
    count_keywords = ['how many', 'count', 'number of', 'total users', 'kitne log']
    return any(keyword in query.lower() for keyword in count_keywords)

def create_excel_file(data, filename):
    try:
        df = pd.DataFrame(data)
        excel_path = f"exports/{filename}.xlsx"
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

        connection = connect_to_db(db_config)
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        sql_query = generate_sql_query(natural_query)
        if not sql_query:
            return jsonify({'error': 'Failed to generate SQL query'}), 500

        print(f"Generated SQL: {sql_query}")

        results = execute_query(connection, sql_query)
        connection.close()

        if results is None:
            return jsonify({'error': 'Query execution failed'}), 500

        if is_count_query(natural_query):
            # Try both 'count' and 'COUNT(*)' keys
            count = None
            if results and isinstance(results[0], dict):
                count = results[0].get('count')
                if count is None:
                    # Try other possible keys
                    for k in results[0]:
                        if 'count' in k.lower():
                            count = results[0][k]
                            break
            if count is None:
                count = len(results)
            return jsonify({
                'type': 'count',
                'count': count,
                'message': f"Found {count} users matching your criteria"
            })

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
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/download-excel/<filename>')
def download_excel(filename):
    try:
        return send_file(f"exports/{filename}.xlsx", as_attachment=True)
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
