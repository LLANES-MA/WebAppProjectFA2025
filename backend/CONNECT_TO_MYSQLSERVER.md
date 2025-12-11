# Connect to MySQLServer (Separate Machine)

If your MySQL database is on a separate machine called "MySQLServer", follow these steps:

## Step 1: Find MySQLServer IP Address

If MySQLServer is on your local network:
```bash
# Try to ping it (if it responds)
ping MySQLServer

# Or find it on your network
arp -a | grep -i mysql
```

If MySQLServer is a Windows machine:
- Check Windows machine's IP: `ipconfig` on Windows
- Or check your router's connected devices

## Step 2: Add MySQLServer to /etc/hosts (macOS/Linux)

```bash
sudo nano /etc/hosts
```

Add this line (replace with actual IP):
```
[IP_ADDRESS] MySQLServer
```

Example:
```
192.168.1.100 MySQLServer
```

## Step 3: Test Connection

```bash
# Test MySQL connection
mysql -h MySQLServer -u root -p FrontDash

# Or with IP directly
mysql -h [IP_ADDRESS] -u root -p FrontDash
```

## Step 4: Update .env File

Edit `backend/.env`:
```env
DB_HOST=MySQLServer
# OR use IP directly:
# DB_HOST=192.168.1.100

DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=FrontDash
```

## Step 5: Ensure MySQL Allows Remote Connections

On MySQLServer machine, MySQL must allow remote connections:

1. Edit MySQL config (`my.cnf` or `my.ini`):
   ```
   bind-address = 0.0.0.0
   ```

2. Grant remote access:
   ```sql
   GRANT ALL PRIVILEGES ON FrontDash.* TO 'root'@'%' IDENTIFIED BY 'password';
   FLUSH PRIVILEGES;
   ```

3. Restart MySQL service

## Step 6: Restart Backend

```bash
cd backend
# Stop current backend (Ctrl+C)
npm run dev
```

Look for:
- ✅ `Connected to MySQL database: FrontDash` = Success!
- ❌ `Error connecting to MySQL database:` = Check configuration

## Quick Test Script

Run the connection test:
```bash
cd backend
node test-db-connection.js
```

This will test multiple connection methods and show which works.

