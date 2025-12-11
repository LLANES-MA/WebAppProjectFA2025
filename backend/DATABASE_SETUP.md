# Database Setup Guide

This guide will help you connect the FrontDash backend to your MySQL database.

## Prerequisites

- MySQL Server running on `MySQLServer`
- Database named `FrontDash` (or update the configuration)
- MySQL user credentials with appropriate permissions

## Setup Steps

### 1. Create the Database Schema

Run the SQL schema file to create all necessary tables:

```bash
mysql -h MySQLServer -u root -p < schema.sql
```

Or connect to MySQL and run:

```sql
mysql -h MySQLServer -u root -p
```

Then execute the contents of `schema.sql`:

```sql
CREATE DATABASE IF NOT EXISTS FrontDash;
USE FrontDash;
-- ... rest of schema.sql
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory with your database credentials:

```env
# Database Configuration
DB_HOST=MySQLServer
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=FrontDash

# Server Configuration
PORT=8080
CORS_ORIGIN=http://localhost:3000

# Email Configuration (optional)
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=http://localhost:3000
```

**Important:** Replace `your_password_here` with your actual MySQL password.

### 3. Install Dependencies

If you haven't already, install the MySQL driver:

```bash
npm install
```

This will install `mysql2` which is required for the database connection.

### 4. Test the Connection

Start the backend server:

```bash
npm run dev
```

You should see:
- `Connected to MySQL database: FrontDash` if the connection is successful
- `Error connecting to MySQL database:` if there's a connection issue

## Troubleshooting

### Connection Refused
- Verify MySQL Server is running on `MySQLServer`
- Check that the hostname/IP address is correct
- Ensure MySQL is listening on port 3306 (or update `DB_PORT`)

### Access Denied
- Verify your MySQL username and password are correct
- Ensure the MySQL user has permissions to access the `FrontDash` database
- Check MySQL user privileges: `SHOW GRANTS FOR 'root'@'%';`

### Database Not Found
- Create the database: `CREATE DATABASE FrontDash;`
- Or update `DB_NAME` in `.env` to match your existing database name

### Tables Not Found
- Run the `schema.sql` file to create all necessary tables
- Verify tables exist: `SHOW TABLES;` in the `FrontDash` database

## Database Schema

The database includes the following tables:

- `logins` - User authentication credentials
- `restaurants` - Restaurant information
- `restaurant_hours` - Operating hours for restaurants
- `menu_items` - Menu items for restaurants
- `restaurant_accounts` - Links restaurants to login accounts

See `schema.sql` for the complete schema definition.

## Connection Pool

The application uses a connection pool with the following default settings:

- Maximum connections: 10
- Connection timeout: enabled
- Keep-alive: enabled

These can be adjusted in `src/data/dbConnection.ts` if needed.

