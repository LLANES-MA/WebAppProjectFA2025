#!/bin/bash
echo "🔧 FrontDash Database Configuration Helper"
echo ""
echo "Please provide your MySQL database connection details:"
echo ""
read -p "Database Host (e.g., MySQLServer, localhost, or IP address): " DB_HOST
read -p "Database Port [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}
read -p "Database User [root]: " DB_USER
DB_USER=${DB_USER:-root}
read -s -p "Database Password (press Enter if none): " DB_PASSWORD
echo ""
read -p "Database Name [FrontDash]: " DB_NAME
DB_NAME=${DB_NAME:-FrontDash}

echo ""
echo "Updating .env file..."
cat > .env << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# Server Configuration
PORT=8080
CORS_ORIGIN=http://localhost:3000

# Email Configuration (optional)
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=http://localhost:3000
EOF

echo "✅ Configuration updated!"
echo ""
echo "Testing connection..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} -e "USE $DB_NAME; SELECT 1;" 2>/dev/null; then
    echo "✅ Database connection successful!"
else
    echo "⚠️  Could not test connection. Please verify your credentials."
fi
