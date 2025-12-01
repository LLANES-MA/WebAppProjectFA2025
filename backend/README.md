# FrontDash Backend API

Backend API server for FrontDash food delivery platform.

## Architecture

This backend follows the architecture defined in the UML diagram:
- **FrontDashMain**: Main orchestrator that manages all services
- **RestaurantService**: Manages restaurant entities and registration
- **AdminService**: Handles admin operations and restaurant approval
- **AuthService**: Manages authentication and login creation
- **EmailService**: Handles email/notification delivery
- **OrderService**: Manages orders (placeholder)
- **DriverService**: Coordinates drivers (placeholder)
- **PaymentService**: Processes payments (placeholder)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
# Copy and edit environment variables
# See .env.example for required variables
```

### Configuration

Create a `.env` file with the following variables:

```env
PORT=8080
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Email Configuration (optional - will use dev mode if not set)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@frontdash.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Running

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:8080` (or the PORT specified in .env).

## API Endpoints

### Restaurant Registration
```
POST /api/restaurants/register
Content-Type: application/json

Body: {
  restaurantName: string,
  email: string,
  description: string,
  // ... see BACKEND_INTEGRATION.md for full schema
}

Response: {
  success: true,
  restaurantId: number,
  message: "Registration successful"
}
```

### Restaurant Approval
```
POST /api/admin/restaurants/:id/approve
Authorization: Bearer {admin_token}  # TODO: Implement auth

Response: {
  success: true,
  restaurantId: number,
  username: string,
  temporaryPassword: string,
  message: "Restaurant approved successfully"
}
```

### Get Pending Restaurants
```
GET /api/admin/restaurants/pending

Response: {
  success: true,
  restaurants: Restaurant[]
}
```

### Send Email (Direct)
```
POST /api/notifications/email
Content-Type: application/json

Body: {
  to: string,
  subject: string,
  body: string,
  html?: string
}

Response: {
  success: true,
  messageId: string,
  sentAt: string
}
```

### Get All Restaurants
```
GET /api/restaurants

Response: {
  success: true,
  restaurants: Restaurant[]
}
```

### Get Restaurant by ID
```
GET /api/restaurants/:id

Response: {
  success: true,
  restaurant: Restaurant
}
```

See `BACKEND_INTEGRATION.md` for complete API documentation.

## Database

Currently uses an in-memory database implementation. This can be easily replaced with:
- SQLite (for development)
- PostgreSQL (for production)
- MongoDB
- Any other database solution

The database interface is defined in `src/data/Database.ts`.

## Email Service

The email service supports two modes:

1. **Development Mode** (default): Logs emails to console
2. **Production Mode**: Sends actual emails via SMTP

Configure email settings in `.env` to enable production mode.

## Project Structure

```
backend/
├── src/
│   ├── models/          # Domain entities
│   ├── services/        # Business logic services
│   ├── controllers/     # HTTP request handlers
│   ├── routes/          # API route definitions
│   ├── data/            # Data access layer
│   ├── types/           # TypeScript type definitions
│   ├── FrontDashMain.ts # Main orchestrator
│   └── index.ts         # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Building

```bash
npm run build
```

### Type Checking

```bash
npx tsc --noEmit
```

## Testing

TODO: Add test suite

## License

ISC

