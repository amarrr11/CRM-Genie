const mysql = require('mysql2');

console.log('🔧 Setting up CRM Database...\n');

// First, connect without specifying database to create it
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Failed to connect to MySQL:', err.message);
    console.error('Please ensure MySQL is running and accessible.');
    process.exit(1);
  }
  
  console.log('✅ Connected to MySQL server');
  
  // Create database
  connection.query('CREATE DATABASE IF NOT EXISTS crm', (err) => {
    if (err) {
      console.error('❌ Error creating database:', err.message);
      process.exit(1);
    }
    
    console.log('✅ Database "crm" created/verified');
    
    // Use the database
    connection.query('USE crm', (err) => {
      if (err) {
        console.error('❌ Error using database:', err.message);
        process.exit(1);
      }
      
      console.log('✅ Using database "crm"');
      
      // Create tables
      const createCustomersTable = `
        CREATE TABLE IF NOT EXISTS customers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          visits INT DEFAULT 1,
          last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          total_spend DECIMAL(10, 2) DEFAULT 0.00,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createOrdersTable = `
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id INT,
          spend DECIMAL(10, 2) NOT NULL,
          order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
      `;

      const createCampaignsTable = `
        CREATE TABLE IF NOT EXISTS campaigns (
          id INT AUTO_INCREMENT PRIMARY KEY,
          admin_email VARCHAR(255) NOT NULL,
          query_text TEXT NOT NULL,
          result_count INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Execute table creation queries
      connection.query(createCustomersTable, (err) => {
        if (err) {
          console.error('❌ Error creating customers table:', err.message);
        } else {
          console.log('✅ Customers table created/verified');
        }
        
        connection.query(createOrdersTable, (err) => {
          if (err) {
            console.error('❌ Error creating orders table:', err.message);
          } else {
            console.log('✅ Orders table created/verified');
          }
          
          connection.query(createCampaignsTable, (err) => {
            if (err) {
              console.error('❌ Error creating campaigns table:', err.message);
            } else {
              console.log('✅ Campaigns table created/verified');
            }
            
            console.log('\n🎉 Database setup completed successfully!');
            console.log('You can now start your application with: npm start');
            
            connection.end();
          });
        });
      });
    });
  });
}); 