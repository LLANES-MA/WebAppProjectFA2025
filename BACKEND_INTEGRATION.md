# Backend Integration Guide

This document explains how the frontend email functionality integrates with the FrontDash backend architecture.

## Backend Architecture Overview

Based on the UML diagram, the FrontDash backend consists of:

### Services
- **FrontDashMain**: Main orchestrator
- **RestaurantService**: Manages Restaurant entities
- **AdminService**: Oversees Staff and admin operations
- **AuthService**: Handles Login authentication
- **OrderService**: Manages OrderEntity
- **DriverService**: Coordinates Driver entities
- **PaymentService**: Processes Payment entities

### Domain Entities
- **Restaurant**: Restaurant information
- **RestaurantAccount**: Links Restaurant to Login (username PK references Login)
- **Login**: Authentication credentials
- **Staff**: Staff members
- **Address**: Location information
- And others...

## Email Service Integration

### Email/Notification Service (Backend)

The backend should have an Email/Notification service that handles actual email delivery. This service should be called by:
- **RestaurantService**: When restaurant registration is completed
- **AdminService**: When admin approves a restaurant

### API Endpoints

#### 1. Restaurant Registration
```
POST /api/restaurants/register
Content-Type: application/json

Request Body:
{
  "restaurantName": "Pizza Place",
  "email": "owner@pizzaplace.com",
  "description": "...",
  "cuisineType": "Italian",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "phone": "(555) 123-4567",
  // ... other fields
  "status": "pending"
}

Response:
{
  "success": true,
  "restaurantId": 123,
  "message": "Registration successful"
}
```

**Backend Flow:**
1. RestaurantService receives registration data
2. Creates Restaurant entity with status='pending'
3. Calls Email/NotificationService to send pending approval email
4. Returns restaurant ID

#### 2. Restaurant Approval
```
POST /api/admin/restaurants/{restaurantId}/approve
Authorization: Bearer {admin_token}
Content-Type: application/json

Request Body: (optional)
{
  // Can be empty - backend generates credentials
}

Response:
{
  "success": true,
  "restaurantId": 123,
  "username": "owner@pizzaplace.com",
  "temporaryPassword": "TempPass123!",
  "message": "Restaurant approved successfully"
}
```

**Backend Flow:**
1. AdminService receives approval request
2. Updates Restaurant status to 'approved'
3. Creates Login entry via AuthService:
   - username = restaurant email
   - password = generated temporary password (hashed)
4. Creates RestaurantAccount linking Restaurant to Login
5. Calls Email/NotificationService to send approval email with credentials
6. Returns credentials (password should ideally be returned only once)

#### 3. Email Sending (Direct)
```
POST /api/notifications/email
Content-Type: application/json

Request Body:
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "Email body text",
  "html": "<html>...</html>" // optional
}

Response:
{
  "success": true,
  "messageId": "msg-123",
  "sentAt": "2024-01-15T10:30:00Z"
}
```

## Frontend Implementation

The frontend email service (`src/services/emailService.ts`) is designed to work in two modes:

### Development Mode (Default)
- Set `VITE_USE_BACKEND=false` (or omit it)
- Logs emails to console
- Simulates registration and approval locally

### Production Mode
- Set `VITE_USE_BACKEND=true`
- Set `VITE_API_BASE_URL` to your backend URL
- Makes actual API calls to backend services

### Environment Variables

Create a `.env` file in the project root:

```env
# Backend Configuration
VITE_USE_BACKEND=false
VITE_API_BASE_URL=http://localhost:8080/api

# Example for production:
# VITE_USE_BACKEND=true
# VITE_API_BASE_URL=https://api.frontdash.com/api
```

## Data Flow

### Restaurant Registration Flow

```
Frontend (RestaurantRegistration.tsx)
  ↓
App.tsx.handleRestaurantRegistrationComplete()
  ↓
emailService.registerRestaurant()
  ↓
POST /api/restaurants/register
  ↓
Backend RestaurantService
  ├── Creates Restaurant entity (status='pending')
  └── Calls Email/NotificationService
      └── Sends pending approval email
```

### Restaurant Approval Flow

```
Frontend (AdminDashboard.tsx)
  ↓
App.tsx.handleApproveRestaurant()
  ↓
emailService.approveRestaurant()
  ↓
POST /api/admin/restaurants/{id}/approve
  ↓
Backend AdminService
  ├── Updates Restaurant status to 'approved'
  ├── Creates Login via AuthService
  ├── Creates RestaurantAccount (links Restaurant → Login)
  └── Calls Email/NotificationService
      └── Sends approval email with credentials
```

## Backend Service Responsibilities

### RestaurantService
- Handle restaurant registration
- Create Restaurant entities
- Trigger pending approval emails
- Manage restaurant status updates

### AdminService
- Approve/reject restaurant registrations
- Coordinate with AuthService to create accounts
- Trigger approval emails with credentials

### AuthService
- Create Login entries
- Generate secure temporary passwords
- Hash passwords before storage
- Manage authentication

### Email/NotificationService (Backend)
- Send emails via SMTP/email provider
- Handle email templates
- Queue emails for reliability
- Log email delivery status

## Database Schema Integration

Based on the UML relationships:

### Restaurant Registration
1. Create `Restaurant` record
2. Set status = 'pending'
3. Store all restaurant information
4. No `RestaurantAccount` or `Login` created yet

### Restaurant Approval
1. Update `Restaurant.status` = 'approved'
2. Create `Login` record:
   - `username` = restaurant email
   - `password_hash` = hashed temporary password
3. Create `RestaurantAccount` record:
   - Links `Restaurant.id` to `Login.username`
4. Send approval email with credentials

## Security Considerations

1. **Password Generation**: Should ideally happen on backend, not frontend
2. **Password Transmission**: Temporary passwords should only be sent via email, never returned in API responses after initial creation
3. **Authentication**: Admin approval endpoint requires admin authentication token
4. **Rate Limiting**: Email endpoints should have rate limiting to prevent abuse
5. **Email Verification**: Consider verifying restaurant email before sending approval

## Testing

### Development Testing
- Use development mode to test UI flows
- Check console logs for email content
- Verify registration and approval flows work

### Integration Testing
- Connect to backend API
- Verify emails are actually sent
- Test error handling (network failures, API errors)
- Verify credentials are generated correctly

## Migration Path

1. **Phase 1**: Frontend works in dev mode (current state)
2. **Phase 2**: Backend implements API endpoints
3. **Phase 3**: Enable backend mode in frontend
4. **Phase 4**: Test end-to-end integration
5. **Phase 5**: Deploy to production

## Notes

- The frontend email service can work independently for development
- Backend services should handle all business logic
- Frontend should only orchestrate UI and API calls
- Email templates could be moved to backend for easier maintenance

