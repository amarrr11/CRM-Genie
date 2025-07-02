from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import mysql.connector
import google.generativeai as genai
import os
import pandas as pd
import traceback
from datetime import datetime, timedelta
from dotenv import load_dotenv
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import plotly.express as px
import plotly.graph_objects as go
import json

# LangChain imports
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain, SequentialChain
from langchain.agents import initialize_agent, AgentType, Tool
from langchain.memory import ConversationBufferMemory
from langchain.tools import BaseTool
from langchain.schema import HumanMessage, SystemMessage

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

# Database configuration
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'crm')
}

def get_database_schema():
    """Get database schema for AI context"""
    try:
        connection = connect_to_db(db_config)
        if not connection:
            return "Database connection failed"
        
        cursor = connection.cursor()
        
        # Get table information
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        schema_description = "Database Schema:\n"
        
        for table in tables:
            table_name = table[0]
            cursor.execute(f"DESCRIBE {table_name}")
            columns = cursor.fetchall()
            
            schema_description += f"\nTable: {table_name}\n"
            for col in columns:
                schema_description += f"  - {col[0]} ({col[1]})\n"
        
        cursor.close()
        connection.close()
        return schema_description
        
    except Exception as e:
        return f"Error getting schema: {str(e)}"

class PredictiveAnalyticsTool(BaseTool):
    name = "predictive_analytics"
    description = "Analyze customer data and predict future trends, churn risk, and business opportunities"
    
    def _run(self, query: str) -> str:
        try:
            connection = connect_to_db(db_config)
            if not connection:
                return "Database connection failed"
            
            cursor = connection.cursor()
            
            # Get customer data for analysis
            cursor.execute("""
                SELECT 
                    c.id, c.name, c.email, c.visits, c.total_spend, 
                    c.last_active, c.created_at,
                    COUNT(o.id) as order_count,
                    AVG(o.spend) as avg_order_value,
                    DATEDIFF(CURRENT_TIMESTAMP, c.last_active) as days_inactive
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id
                GROUP BY c.id
            """)
            
            customers_data = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
            
            df = pd.DataFrame(customers_data, columns=columns)
            
            # Analyze based on query type
            if "churn" in query.lower():
                return self._analyze_churn_risk(df)
            elif "revenue" in query.lower() or "forecast" in query.lower():
                return self._predict_revenue(df)
            elif "segmentation" in query.lower():
                return self._customer_segmentation(df)
            else:
                return self._general_insights(df)
                
        except Exception as e:
            return f"Error in predictive analysis: {str(e)}"
    
    def _analyze_churn_risk(self, df):
        """Analyze customer churn risk"""
        # Simple churn prediction based on inactivity and spending patterns
        df['churn_risk'] = 0
        
        # High risk: inactive for >30 days and low spending
        high_risk = df[(df['days_inactive'] > 30) & (df['total_spend'] < 1000)]
        
        # Medium risk: inactive for >15 days or declining spending
        medium_risk = df[(df['days_inactive'] > 15) | (df['total_spend'] < 500)]
        
        # Low risk: active and high spending
        low_risk = df[(df['days_inactive'] <= 7) & (df['total_spend'] > 2000)]
        
        analysis = f"""
🔍 **Customer Churn Analysis**
        
🚨 **High Risk Customers ({len(high_risk)}):**
{self._format_customer_list(high_risk.head(5))}

⚠️ **Medium Risk Customers ({len(medium_risk)}):**
{self._format_customer_list(medium_risk.head(5))}

✅ **Low Risk Customers ({len(low_risk)}):**
{self._format_customer_list(low_risk.head(5))}

💡 **Recommendations:**
- Send personalized retention campaigns to high-risk customers
- Implement loyalty programs for medium-risk customers
- Upsell opportunities for low-risk customers
        """
        
        return analysis
    
    def _predict_revenue(self, df):
        """Predict future revenue"""
        # Simple linear regression for revenue prediction
        if len(df) < 5:
            return "Insufficient data for revenue prediction"
        
        # Create features for prediction
        X = df[['visits', 'order_count', 'avg_order_value']].fillna(0)
        y = df['total_spend']
        
        # Simple prediction model
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict next month revenue
        avg_visits = df['visits'].mean()
        avg_orders = df['order_count'].mean()
        avg_order_value = df['avg_order_value'].mean()
        
        predicted_revenue = model.predict([[avg_visits, avg_orders, avg_order_value]])[0]
        
        analysis = f"""
📈 **Revenue Prediction Analysis**
        
💰 **Current Total Revenue:** ₹{df['total_spend'].sum():,.2f}
📊 **Average Customer Value:** ₹{df['total_spend'].mean():,.2f}
🎯 **Predicted Next Month Revenue:** ₹{predicted_revenue:,.2f}
        
📋 **Key Metrics:**
- Total Customers: {len(df)}
- Active Customers: {len(df[df['days_inactive'] <= 30])}
- Average Order Value: ₹{avg_order_value:,.2f}
- Customer Retention Rate: {(len(df[df['days_inactive'] <= 30]) / len(df) * 100):.1f}%
        
💡 **Growth Opportunities:**
- Increase average order value by 10%: +₹{predicted_revenue * 0.1:,.2f}
- Improve retention by 5%: +₹{predicted_revenue * 0.05:,.2f}
        """
        
        return analysis
    
    def _customer_segmentation(self, df):
        """Customer segmentation analysis"""
        # Segment customers based on spending and activity
        df['segment'] = 'Regular'
        
        # VIP customers
        vip_mask = (df['total_spend'] > 5000) & (df['days_inactive'] <= 7)
        df.loc[vip_mask, 'segment'] = 'VIP'
        
        # High Value
        high_value_mask = (df['total_spend'] > 2000) & (df['days_inactive'] <= 15)
        df.loc[high_value_mask, 'segment'] = 'High Value'
        
        # At Risk
        at_risk_mask = (df['days_inactive'] > 30) | (df['total_spend'] < 500)
        df.loc[at_risk_mask, 'segment'] = 'At Risk'
        
        segment_counts = df['segment'].value_counts()
        
        analysis = f"""
👥 **Customer Segmentation Analysis**
        
🏆 **VIP Customers ({segment_counts.get('VIP', 0)}):**
- High spending (>₹5,000) and very active
- Focus: Premium services, exclusive offers
- Revenue contribution: {self._get_segment_revenue(df, 'VIP'):.1f}%

💎 **High Value Customers ({segment_counts.get('High Value', 0)}):**
- Good spending (>₹2,000) and active
- Focus: Upselling, loyalty programs
- Revenue contribution: {self._get_segment_revenue(df, 'High Value'):.1f}%

📊 **Regular Customers ({segment_counts.get('Regular', 0)}):**
- Standard customers
- Focus: Engagement, conversion
- Revenue contribution: {self._get_segment_revenue(df, 'Regular'):.1f}%

⚠️ **At Risk Customers ({segment_counts.get('At Risk', 0)}):**
- Inactive or low spending
- Focus: Retention campaigns
- Revenue contribution: {self._get_segment_revenue(df, 'At Risk'):.1f}%
        """
        
        return analysis
    
    def _general_insights(self, df):
        """General business insights"""
        total_revenue = df['total_spend'].sum()
        avg_customer_value = df['total_spend'].mean()
        active_customers = len(df[df['days_inactive'] <= 30])
        
        analysis = f"""
📊 **Business Intelligence Dashboard**
        
💰 **Financial Metrics:**
- Total Revenue: ₹{total_revenue:,.2f}
- Average Customer Value: ₹{avg_customer_value:,.2f}
- Top Customer: ₹{df['total_spend'].max():,.2f}
        
👥 **Customer Metrics:**
- Total Customers: {len(df)}
- Active Customers: {active_customers}
- Retention Rate: {(active_customers / len(df) * 100):.1f}%
- Average Visits: {df['visits'].mean():.1f}
        
📈 **Performance Insights:**
- Revenue per customer: ₹{total_revenue / len(df):,.2f}
- Most valuable segment: {self._get_most_valuable_segment(df)}
- Growth opportunity: {self._get_growth_opportunity(df)}
        """
        
        return analysis
    
    def _format_customer_list(self, df):
        """Format customer list for display"""
        if len(df) == 0:
            return "No customers in this category"
        
        result = ""
        for _, row in df.head(3).iterrows():
            result += f"- {row['name']} ({row['email']}) - ₹{row['total_spend']:,.2f}\n"
        return result
    
    def _get_segment_revenue(self, df, segment):
        """Get revenue contribution percentage for a segment"""
        segment_revenue = df[df['segment'] == segment]['total_spend'].sum()
        total_revenue = df['total_spend'].sum()
        return (segment_revenue / total_revenue * 100) if total_revenue > 0 else 0
    
    def _get_most_valuable_segment(self, df):
        """Get most valuable customer segment"""
        if len(df) == 0:
            return "No data available"
        
        # Simple logic: customers with highest average spending
        high_spenders = df[df['total_spend'] > df['total_spend'].quantile(0.8)]
        if len(high_spenders) > 0:
            return f"Top 20% customers (₹{high_spenders['total_spend'].mean():,.2f} avg)"
        return "Regular customers"
    
    def _get_growth_opportunity(self, df):
        """Identify growth opportunities"""
        if len(df) == 0:
            return "No data available"
        
        inactive_customers = len(df[df['days_inactive'] > 30])
        if inactive_customers > 0:
            return f"Re-engage {inactive_customers} inactive customers"
        
        low_spenders = len(df[df['total_spend'] < 1000])
        if low_spenders > 0:
            return f"Upsell to {low_spenders} low-spending customers"
        
        return "Focus on new customer acquisition"

# Initialize LangChain tools
predictive_tool = PredictiveAnalyticsTool()

# Create LangChain agent
def create_business_intelligence_agent():
    """Create a LangChain agent for business intelligence"""
    
    # Define tools
    tools = [
        Tool(
            name="predictive_analytics",
            func=predictive_tool._run,
            description="Analyze customer data for churn prediction, revenue forecasting, and business insights"
        )
    ]
    
    # Create agent
    agent = initialize_agent(
        tools,
        llm=ChatOpenAI(temperature=0.7, model="gpt-3.5-turbo"),
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
        handle_parsing_errors=True
    )
    
    return agent

@app.route('/api/query', methods=['POST'])
def handle_query():
    try:
        data = request.get_json()
        query_text = data.get('query', '').strip()
        
        if not query_text:
            return jsonify({'error': 'Query is required'}), 400
        
        # Check if it's a predictive analytics query
        predictive_keywords = [
            'predict', 'forecast', 'churn', 'risk', 'segmentation', 
            'insights', 'analysis', 'trends', 'opportunity', 'recommendation'
        ]
        
        is_predictive_query = any(keyword in query_text.lower() for keyword in predictive_keywords)
        
        if is_predictive_query:
            # Use LangChain agent for advanced analytics
            agent = create_business_intelligence_agent()
            result = agent.run(query_text)
            
            return jsonify({
                'data': result,
                'query': query_text,
                'type': 'predictive_analytics'
            })
        
        # Original SQL query logic for basic queries
        schema_description = get_database_schema()
        
        # Create prompt for SQL generation
        prompt = f"""
        You are a MySQL expert. Based on the schema below, write a SQL query that answers the user's question.
        
        **Schema:**
        {schema_description}
        
        **Question:**
        "{query_text}"
        
        **SQL Query:**
        """
        
        # Generate SQL using Gemini
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        sql_query = response.text.strip().replace('`', '').replace('sql', '').strip()
        
        # Execute query
        connection = connect_to_db(db_config)
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute(sql_query)
        results = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        
        # Handle export
        if "export" in query_text.lower():
            df = pd.DataFrame(results, columns=columns)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"query_results_{timestamp}.xlsx"
            filepath = os.path.join('exports', filename)
            
            # Ensure exports directory exists
            os.makedirs('exports', exist_ok=True)
            
            df.to_excel(filepath, index=False)
            
            # Log the campaign
            try:
                cursor.execute(
                    'INSERT INTO campaigns (admin_email, query_text, result_count) VALUES (?, ?, ?)',
                    ('ai_service@crm.com', query_text, len(results))
                )
                connection.commit()
            except:
                pass  # Campaign logging is optional
            
            cursor.close()
            connection.close()
            
            return send_file(filepath, as_attachment=True, download_name=filename)
        
        # Convert results to JSON
        data = [dict(zip(columns, row)) for row in results]
        
        # Log the campaign
        try:
            cursor.execute(
                'INSERT INTO campaigns (admin_email, query_text, result_count) VALUES (?, ?, ?)',
                ('ai_service@crm.com', query_text, len(results))
            )
            connection.commit()
        except:
            pass  # Campaign logging is optional
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'data': data,
            'query': sql_query,
            'type': 'sql_query'
        })
        
    except Exception as e:
        print(f"Error in handle_query: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'AI Service with LangChain'})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
