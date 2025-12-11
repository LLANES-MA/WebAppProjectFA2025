# Configure Database Connection to MySQLServer

## Issue
The backend is trying to connect to `MySQLServer` but the hostname doesn't resolve.

## Solutions

### Option 1: Add MySQLServer to /etc/hosts (if it's on your local network)

1. Find the IP address of MySQLServer:
   - If it's a Windows machine, check its IP: `ipconfig` on Windows
   - If it's a remote server, use its IP address

2. Add to /etc/hosts:
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

3. Test connection:
   ```bash
   mysql -h MySQLServer -u root -p FrontDash
   ```

### Option 2: Use IP Address Directly

Update `.env` file:
```env
DB_HOST=192.168.1.100  # Replace with actual IP
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=FrontDash
```

### Option 3: If MySQLServer is on Windows

Windows machine names often need to be accessed via:
- `MySQLServer.local` (if Bonjour is installed)
- Or use the IP address directly

### Option 4: Test Connection First

Before updating the backend, test the connection:
```bash
# Test with hostname
mysql -h MySQLServer -u root -p FrontDash

# Test with IP (if you know it)
mysql -h [IP_ADDRESS] -u root -p FrontDash

# Test with localhost (if MySQLServer is this machine)
mysql -h localhost -u root -p FrontDash
```

## After Configuration

1. Update `.env` with correct host and password
2. Restart backend:
   ```bash
   # Stop current backend (Ctrl+C or kill process)
   npm run dev
   ```
3. Check for connection message:
   - ✅ `Connected to MySQL database: FrontDash` = Success!
   - ❌ `Error connecting to MySQL database:` = Check configuration

## Quick Configuration Script

Run this to interactively configure:
```bash
./update-db-config.sh
```

Or manually edit `.env` file with your MySQLServer details.

