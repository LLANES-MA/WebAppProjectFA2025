# Verify Database Connection

## Quick Verification Steps

### 1. Check Backend Connection
```bash
curl http://localhost:8080/api/restaurants
```
Should return JSON with restaurants from database.

### 2. Check Frontend Configuration
Open browser console (F12) and look for:
- `🔍 RestaurantService Config:` - Shows API URL and backend enabled status
- `📡 Fetching restaurants from:` - Shows API calls being made
- `✅ Received restaurants:` - Shows data received

### 3. Verify .env Files

**Backend `.env`** (`backend/.env`):
```env
DB_HOST=Inzwis-MacBook-Air.local
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=FrontDash
```

**Frontend `.env`** (root `.env`):
```env
VITE_USE_BACKEND=true
VITE_API_BASE_URL=http://localhost:8080/api
```

### 4. Restart Servers

If changes were made to `.env` files:

**Backend:**
```bash
cd backend
# Stop current process (Ctrl+C)
npm run dev
```

**Frontend:**
```bash
# Stop current process (Ctrl+C)
npm run dev
```

### 5. Check Browser Console

Open browser DevTools (F12) → Console tab:
- Look for API call logs
- Check for CORS errors
- Verify data is being fetched

### 6. Test API Directly

In browser console, run:
```javascript
fetch('http://localhost:8080/api/restaurants')
  .then(r => r.json())
  .then(data => console.log('API Response:', data))
```

Should return restaurants from database.

## Troubleshooting

### If no data appears:
1. ✅ Check backend is running: `curl http://localhost:8080/health`
2. ✅ Check database has data: `mysql -h Inzwis-MacBook-Air.local -u root FrontDash -e "SELECT * FROM restaurants;"`
3. ✅ Check frontend .env has `VITE_USE_BACKEND=true`
4. ✅ Restart frontend to pick up .env changes
5. ✅ Check browser console for errors

### Common Issues:
- **CORS errors**: Backend CORS is configured for `http://localhost:3000`
- **404 errors**: Check API_BASE_URL is correct
- **Empty arrays**: Check database has approved restaurants
- **Connection refused**: Backend not running or wrong port

