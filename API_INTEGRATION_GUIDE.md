# AutoCares API Integration Guide

This guide explains how to integrate backend APIs with the AutoCares frontend.

## 📋 API Endpoints Reference

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "vehicleType": "car",
  "vehicleModel": "Toyota Camry",
  "vehiclePlate": "ABC-1234"
}

Response (200):
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

#### POST /api/auth/login
Login user
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "user": { "id": "uuid", "email": "..." },
  "token": "jwt_token"
}
```

### Service Request Endpoints

#### POST /api/service-requests
Create a new service request
```json
Request:
{
  "userId": "uuid",
  "vehicleType": "car",
  "problemDescription": "Engine won't start",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "123 Main St, New York, NY",
  "imageUrl": "https://..."
}

Response (201):
{
  "success": true,
  "request": {
    "id": "uuid",
    "status": "pending",
    "createdAt": "2024-03-11T10:30:00Z"
  }
}
```

#### GET /api/service-requests/:id
Get service request details
```json
Response (200):
{
  "success": true,
  "request": {
    "id": "uuid",
    "userId": "uuid",
    "mechanicId": "uuid",
    "vehicleType": "car",
    "problemDescription": "...",
    "status": "on_the_way",
    "estimatedArrival": "2024-03-11T10:45:00Z",
    "createdAt": "2024-03-11T10:30:00Z"
  }
}
```

#### PUT /api/service-requests/:id
Update service request (admin/mechanic)
```json
Request:
{
  "status": "on_the_way",
  "mechanicId": "uuid",
  "estimatedArrival": "2024-03-11T10:45:00Z"
}

Response (200):
{
  "success": true,
  "request": { ... }
}
```

### Mechanics Endpoints

#### GET /api/mechanics
Search mechanics by location
```json
Query Parameters:
- latitude: number (required)
- longitude: number (required)
- radius: number (default: 10, in km)
- vehicleType: string (optional: car, bike, scooter)

Response (200):
{
  "success": true,
  "mechanics": [
    {
      "id": "uuid",
      "businessName": "John's Auto Repair",
      "distance": 1.2,
      "rating": 4.8,
      "reviews": 234,
      "verified": true,
      "phone": "+1(555)123-4567",
      "address": "123 Main St",
      "specialties": ["car_repair", "engine"],
      "experienceYears": 10
    }
  ]
}
```

#### GET /api/mechanics/:id
Get mechanic profile
```json
Response (200):
{
  "success": true,
  "mechanic": {
    "id": "uuid",
    "businessName": "...",
    "rating": 4.8,
    "reviews": [ ... ],
    "workingHours": { ... },
    "specialties": [ ... ]
  }
}
```

### Chat/Chatbot Endpoints

#### POST /api/chatbot/message
Send message to AI chatbot
```json
Request:
{
  "userId": "uuid",
  "message": "Why does my car not start?",
  "vehicleType": "car",
  "vehicleModel": "Toyota Camry"
}

Response (200):
{
  "success": true,
  "response": {
    "id": "uuid",
    "text": "Check the following: 1. Battery charge...",
    "timestamp": "2024-03-11T10:35:00Z"
  }
}
```

#### GET /api/chatbot/history/:userId
Get chat history
```json
Response (200):
{
  "success": true,
  "messages": [
    { "id": "uuid", "isUser": true, "text": "...", "timestamp": "..." },
    { "id": "uuid", "isUser": false, "text": "...", "timestamp": "..." }
  ]
}
```

### User Profile Endpoints

#### GET /api/profile/:userId
Get user profile
```json
Response (200):
{
  "success": true,
  "profile": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "vehicleType": "car",
    "vehicleModel": "Toyota Camry",
    "vehiclePlate": "ABC-1234",
    "rating": 4.9,
    "servicesUsed": 12,
    "totalSpent": 240.50
  }
}
```

#### PUT /api/profile/:userId
Update user profile
```json
Request:
{
  "fullName": "John Doe",
  "phone": "+1234567890",
  "vehicleModel": "Honda Civic",
  "vehiclePlate": "XYZ-5678"
}

Response (200):
{
  "success": true,
  "profile": { ... }
}
```

### Admin Endpoints

#### GET /api/admin/dashboard
Get admin dashboard stats
```json
Response (200):
{
  "success": true,
  "stats": {
    "totalUsers": 1243,
    "activeMechanics": 87,
    "dailyRequests": 142,
    "avgRating": 4.7,
    "weeklyTrend": [ { "day": "Mon", "requests": 24 } ],
    "recentRequests": [ ... ]
  }
}
```

#### GET /api/admin/users
Get all users (paginated)
```json
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- search: string (optional)

Response (200):
{
  "success": true,
  "users": [ ... ],
  "total": 1243,
  "page": 1,
  "pages": 62
}
```

#### GET /api/admin/mechanics
Get all mechanics
```json
Query Parameters:
- verified: boolean (optional)
- page: number (default: 1)

Response (200):
{
  "success": true,
  "mechanics": [ ... ]
}
```

#### POST /api/admin/mechanics/:id/verify
Verify a mechanic
```json
Request:
{
  "verified": true,
  "notes": "Verified and approved"
}

Response (200):
{
  "success": true,
  "mechanic": { ... }
}
```

## 🔄 Real-Time Updates (WebSocket)

For live service tracking:

```javascript
// Connect to WebSocket
const ws = new WebSocket('wss://your-api.com/ws/service-tracking/:requestId');

// Listen for updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update: { status, estimatedArrival, mechanicLocation, ... }
};

// Close connection
ws.close();
```

## 📊 Data Models

### User Profile
```typescript
interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  vehicleType: 'car' | 'bike' | 'scooter';
  vehicleModel: string;
  vehiclePlate: string;
  avatar_url?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Service Request
```typescript
interface ServiceRequest {
  id: string;
  userId: string;
  mechanicId?: string;
  vehicleType: string;
  problemDescription: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl?: string;
  status: 'pending' | 'assigned' | 'on_the_way' | 'completed' | 'cancelled';
  estimatedArrival?: string;
  completedAt?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Mechanic
```typescript
interface Mechanic {
  id: string;
  businessName: string;
  licenseNumber: string;
  phone: string;
  latitude: number;
  longitude: number;
  rating: number;
  isVerified: boolean;
  specialties: string[];
  experienceYears: number;
  avatar_url?: string;
  createdAt: string;
}
```

## 🔐 Authentication

All endpoints (except /auth/*) require Bearer token:

```bash
Authorization: Bearer <jwt_token>
```

## ⚙️ Implementation Steps

### 1. Create API Routes
```bash
mkdir -p app/api/{auth,service,mechanics,admin,chatbot}
```

### 2. Implement Route Handlers
Example: `app/api/service-requests/route.ts`
```typescript
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createServerClient()
  const data = await request.json()
  
  const { data: result, error } = await supabase
    .from('service_requests')
    .insert(data)
    .select()
  
  if (error) return Response.json({ error }, { status: 400 })
  return Response.json({ success: true, request: result[0] })
}
```

### 3. Update Frontend Calls
Replace mock data with API calls:
```typescript
// Before
const mockData = [ ... ]

// After
const { data } = await fetch('/api/service-requests')
const mechanic = await data.json()
```

### 4. Add Error Handling
```typescript
try {
  const response = await fetch('/api/endpoint', { method: 'POST' })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
} catch (error) {
  console.error('API Error:', error)
  // Show user-friendly error
}
```

## 🧪 Testing

Use cURL or Postman to test endpoints:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"..."}'

# Create service request
curl -X POST http://localhost:3000/api/service-requests \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleType":"car","problemDescription":"..."}'
```

## 📱 Mobile-Specific Considerations

1. **Offline Support**: Cache recent requests/responses
2. **Network Optimization**: Minimize payload size
3. **Real-time Updates**: Use WebSocket for tracking
4. **Battery Optimization**: Minimize polling frequency
5. **Location Services**: Use geolocation API efficiently

---

**API endpoints follow REST conventions and return JSON responses with consistent error format.**
