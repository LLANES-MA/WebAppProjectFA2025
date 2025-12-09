#!/bin/bash
# Database Setup Script for FrontDash

echo "🚀 Setting up FrontDash Database..."
echo ""

# Check if MySQL is accessible
echo "Checking MySQL connection..."

# Try to connect and create database
if mysql -h MySQLServer -u root -e "CREATE DATABASE IF NOT EXISTS FrontDash;" 2>/dev/null; then
    echo "✅ Successfully connected to MySQLServer"
    HOST="MySQLServer"
elif mysql -h localhost -u root -e "CREATE DATABASE IF NOT EXISTS FrontDash;" 2>/dev/null; then
    echo "✅ Successfully connected to localhost"
    HOST="localhost"
else
    echo "⚠️  Could not connect without password. Please run manually:"
    echo "   mysql -h MySQLServer -u root -p < schema.sql"
    echo "   OR"
    echo "   mysql -h localhost -u root -p < schema.sql"
    exit 1
fi

# Run schema
echo ""
echo "Creating database tables..."
if mysql -h "$HOST" -u root FrontDash < schema.sql 2>/dev/null; then
    echo "✅ Database schema created successfully!"
    echo ""
    echo "Tables created:"
    mysql -h "$HOST" -u root FrontDash -e "SHOW TABLES;" 2>/dev/null
else
    echo "⚠️  Schema creation may require password. Please run:"
    echo "   mysql -h $HOST -u root -p FrontDash < schema.sql"
fi

echo ""
echo "✨ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your MySQL password if needed"
echo "2. Start the server: npm run dev"

