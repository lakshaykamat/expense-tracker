# Expense Tracker API Documentation

## Overview

RESTful API for expense tracking with JWT authentication. Built with NestJS and MongoDB.

**Base URL**: `https://your-backend.onrender.com`
**Local Development**: `http://localhost:8000`

## Authentication

The API uses **JWT Token-based authentication** with a hybrid approach:

- **Access Token**: 2 hours validity
- **Refresh Token**: 7 days validity

### Token Usage

All protected endpoints require the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

### Token Refresh Flow

When access token expires, use the refresh token to get new tokens:

```bash
POST /auth/refresh
{
  "refresh_token": "<refresh_token>"
}
```

## API Endpoints

### 📝 Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "639a7b8c9d1f2e3a4b5c6d7e",
      "email": "user@example.com"
    }
  },
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/auth/register"
}
```

**Validation Errors (400):**
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/auth/register",
  "message": "email must be an email"
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "639a7b8c9d1f2e3a4b5c6d7e",
      "email": "user@example.com"
    }
  },
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/auth/login"
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "639a7b8c9d1f2e3a4b5c6d7e",
      "email": "user@example.com"
    }
  },
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/auth/refresh"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "639a7b8c9d1f2e3a4b5c6d7e",
    "email": "user@example.com",
    "createdAt": "2025-12-30T10:00:00.000Z",
    "lastLoginAt": "2025-12-30T13:26:00.000Z"
  },
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/auth/me"
}
```

---

### 💰 Expenses

All expense endpoints require authentication.

#### Create Expense
```http
POST /expenses
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Coffee",
  "amount": 5.50,
  "description": "Morning coffee at Starbucks",
  "category": "Food",
  "date": "2025-12-30T12:00:00.000Z"
}
```

**Optional Fields:**
- `description` (string, optional)
- `category` (string, optional)
- `date` (string, optional) - defaults to current date

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Resource created successfully",
  "data": {
    "_id": "639a7b8c9d1f2e3a4b5c6d7f",
    "title": "Coffee",
    "amount": 5.5,
    "description": "Morning coffee at Starbucks",
    "category": "Food",
    "date": "2025-12-30T12:00:00.000Z",
    "userId": "639a7b8c9d1f2e3a4b5c6d7e",
    "createdAt": "2025-12-30T13:26:00.000Z",
    "updatedAt": "2025-12-30T13:26:00.000Z",
    "__v": 0
  },
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/expenses"
}
```

#### Get All Expenses
```http
GET /expenses
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resources retrieved successfully",
  "data": [
    {
      "_id": "639a7b8c9d1f2e3a4b5c6d7f",
      "title": "Coffee",
      "amount": 5.5,
      "description": "Morning coffee at Starbucks",
      "category": "Food",
      "date": "2025-12-30T12:00:00.000Z",
      "userId": "639a7b8c9d1f2e3a4b5c6d7e",
      "createdAt": "2025-12-30T13:26:00.000Z",
      "updatedAt": "2025-12-30T13:26:00.000Z",
      "__v": 0
    }
  ],
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/expenses"
}
```

**Note**: Expenses are returned sorted by `createdAt` in descending order (newest first).

#### Get Single Expense
```http
GET /expenses/:id
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "data": {
    "_id": "639a7b8c9d1f2e3a4b5c6d7f",
    "title": "Coffee",
    "amount": 5.5,
    "description": "Morning coffee at Starbucks",
    "category": "Food",
    "date": "2025-12-30T12:00:00.000Z",
    "userId": "639a7b8c9d1f2e3a4b5c6d7e",
    "createdAt": "2025-12-30T13:26:00.000Z",
    "updatedAt": "2025-12-30T13:26:00.000Z",
    "__v": 0
  },
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/expenses/639a7b8c9d1f2e3a4b5c6d7f"
}
```

#### Update Expense
```http
PATCH /expenses/:id
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Updated Coffee",
  "amount": 6.00,
  "category": "Beverages"
}
```

**Note**: Only include fields you want to update.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource updated successfully",
  "data": {
    "_id": "639a7b8c9d1f2e3a4b5c6d7f",
    "title": "Updated Coffee",
    "amount": 6,
    "description": "Morning coffee at Starbucks",
    "category": "Beverages",
    "date": "2025-12-30T12:00:00.000Z",
    "userId": "639a7b8c9d1f2e3a4b5c6d7e",
    "createdAt": "2025-12-30T13:26:00.000Z",
    "updatedAt": "2025-12-30T13:30:00.000Z",
    "__v": 0
  },
  "timestamp": "2025-12-30T13:30:00.000Z",
  "path": "/expenses/639a7b8c9d1f2e3a4b5c6d7f"
}
```

#### Delete Expense
```http
DELETE /expenses/:id
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Expense deleted successfully",
  "data": {
    "message": "Expense deleted successfully"
  },
  "timestamp": "2025-12-30T13:30:00.000Z",
  "path": "/expenses/639a7b8c9d1f2e3a4b5c6d7f"
}
```

#### Bulk Create Expenses
```http
POST /expenses/bulk
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "expenses": [
    {
      "title": "Coffee",
      "amount": 5.50,
      "description": "Morning coffee",
      "category": "Food",
      "date": "2025-12-30"
    },
    {
      "title": "Lunch",
      "amount": 12.00,
      "description": "Office lunch",
      "category": "Food",
      "date": "2025-12-30"
    },
    {
      "title": "Transport",
      "amount": 3.00,
      "category": "Transport",
      "date": "2025-12-30"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "3 expenses created successfully",
  "data": {
    "message": "3 expenses created successfully",
    "expenses": [
      {
        "_id": "639a7b8c9d1f2e3a4b5c6d7f",
        "title": "Coffee",
        "amount": 5.5,
        "description": "Morning coffee",
        "category": "Food",
        "date": "2025-12-30T00:00:00.000Z",
        "userId": "639a7b8c9d1f2e3a4b5c6d7e",
        "createdAt": "2025-12-30T13:26:00.000Z",
        "updatedAt": "2025-12-30T13:26:00.000Z"
      },
      {
        "_id": "639a7b8c9d1f2e3a4b5c6d80",
        "title": "Lunch",
        "amount": 12,
        "description": "Office lunch",
        "category": "Food",
        "date": "2025-12-30T00:00:00.000Z",
        "userId": "639a7b8c9d1f2e3a4b5c6d7e",
        "createdAt": "2025-12-30T13:26:00.000Z",
        "updatedAt": "2025-12-30T13:26:00.000Z"
      },
      {
        "_id": "639a7b8c9d1f2e3a4b5c6d81",
        "title": "Transport",
        "amount": 3,
        "category": "Transport",
        "date": "2025-12-30T00:00:00.000Z",
        "userId": "639a7b8c9d1f2e3a4b5c6d7e",
        "createdAt": "2025-12-30T13:26:00.000Z",
        "updatedAt": "2025-12-30T13:26:00.000Z"
      }
    ]
  },
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/expenses/bulk"
}
```

#### Bulk Update Expenses
```http
PATCH /expenses/bulk
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "updates": [
    {
      "id": "639a7b8c9d1f2e3a4b5c6d7f",
      "data": {
        "amount": 6.00,
        "category": "Beverages"
      }
    },
    {
      "id": "639a7b8c9d1f2e3a4b5c6d80",
      "data": {
        "title": "Updated Lunch",
        "amount": 15.00
      }
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Updated 2 expenses successfully",
  "data": {
    "message": "Updated 2 expenses successfully",
    "updated": [
      {
        "_id": "639a7b8c9d1f2e3a4b5c6d7f",
        "title": "Coffee",
        "amount": 6,
        "description": "Morning coffee",
        "category": "Beverages",
        "date": "2025-12-30T00:00:00.000Z",
        "userId": "639a7b8c9d1f2e3a4b5c6d7e",
        "createdAt": "2025-12-30T13:26:00.000Z",
        "updatedAt": "2025-12-30T13:30:00.000Z"
      },
      {
        "_id": "639a7b8c9d1f2e3a4b5c6d80",
        "title": "Updated Lunch",
        "amount": 15,
        "description": "Office lunch",
        "category": "Food",
        "date": "2025-12-30T00:00:00.000Z",
        "userId": "639a7b8c9d1f2e3a4b5c6d7e",
        "createdAt": "2025-12-30T13:26:00.000Z",
        "updatedAt": "2025-12-30T13:30:00.000Z"
      }
    ],
    "errors": []
  },
  "timestamp": "2025-12-30T13:30:00.000Z",
  "path": "/expenses/bulk"
}
```

**Partial Failure Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Updated 1 expenses successfully",
  "data": {
    "message": "Updated 1 expenses successfully",
    "updated": [
      {
        "_id": "639a7b8c9d1f2e3a4b5c6d7f",
        "title": "Coffee",
        "amount": 6,
        "description": "Morning coffee",
        "category": "Beverages",
        "date": "2025-12-30T00:00:00.000Z",
        "userId": "639a7b8c9d1f2e3a4b5c6d7e",
        "createdAt": "2025-12-30T13:26:00.000Z",
        "updatedAt": "2025-12-30T13:30:00.000Z"
      }
    ],
    "errors": [
      {
        "id": "invalid-id",
        "error": "Expense not found"
      }
    ]
  },
  "timestamp": "2025-12-30T13:30:00.000Z",
  "path": "/expenses/bulk"
}
```

#### Bulk Delete Expenses
```http
DELETE /expenses/bulk
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "ids": [
    "639a7b8c9d1f2e3a4b5c6d7f",
    "639a7b8c9d1f2e3a4b5c6d80",
    "639a7b8c9d1f2e3a4b5c6d81"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "3 expenses deleted successfully",
  "data": {
    "message": "3 expenses deleted successfully",
    "deletedCount": 3
  },
  "timestamp": "2025-12-30T13:30:00.000Z",
  "path": "/expenses/bulk"
}
```

**No Expenses Found Response:**
```json
{
  "statusCode": 404,
  "timestamp": "2025-12-30T13:30:00.000Z",
  "path": "/expenses/bulk",
  "message": "No expenses found to delete"
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/expenses",
  "message": "Error description"
}
```

### Common HTTP Status Codes

| Status Code | Description | Example |
|------------|-------------|---------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Invalid/missing token |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server errors |

### Authentication Errors

**401 Unauthorized - Missing Token:**
```json
{
  "statusCode": 401,
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/expenses",
  "message": "Access token required"
}
```

**401 Unauthorized - Invalid/Expired Token:**
```json
{
  "statusCode": 401,
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/expenses",
  "message": "Invalid or expired token"
}
```

### Validation Errors

**400 Bad Request - Invalid Email:**
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/auth/register",
  "message": "email must be an email"
}
```

**400 Bad Request - Password Too Short:**
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/auth/register",
  "message": "password must be longer than or equal to 6 characters"
}
```

**400 Bad Request - Invalid Amount:**
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/expenses",
  "message": "amount must not be less than 0"
}
```

---

### 💳 Budgets

All budget endpoints require authentication.

#### Create Budget
```http
POST /budgets
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Monthly Budget",
  "amount": 2000,
  "month": "2025-01",
  "year": 2025,
  "essentialItems": ["Rent", "Groceries", "Utilities"]
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Resource created successfully",
  "data": {
    "_id": "639a7b8c9d1f2e3a4b5c6d7f",
    "name": "Monthly Budget",
    "amount": 2000,
    "month": "2025-01",
    "year": 2025,
    "userId": "639a7b8c9d1f2e3a4b5c6d7e",
    "essentialItems": ["Rent", "Groceries", "Utilities"],
    "spentAmount": 0,
    "isActive": true,
    "createdAt": "2025-12-30T13:26:00.000Z",
    "updatedAt": "2025-12-30T13:26:00.000Z",
    "__v": 0
  },
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/budgets"
}
```

#### Get All Budgets
```http
GET /budgets
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resources retrieved successfully",
  "data": [
    {
      "_id": "639a7b8c9d1f2e3a4b5c6d7f",
      "name": "Monthly Budget",
      "amount": 2000,
      "month": "2025-01",
      "year": 2025,
      "userId": "639a7b8c9d1f2e3a4b5c6d7e",
      "essentialItems": ["Rent", "Groceries", "Utilities"],
      "spentAmount": 150.50,
      "isActive": true,
      "createdAt": "2025-12-30T13:26:00.000Z",
      "updatedAt": "2025-12-30T13:26:00.000Z"
    }
  ],
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/budgets"
}
```

#### Get Current Budget
```http
GET /budgets/current
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "data": {
    "_id": "639a7b8c9d1f2e3a4b5c6d7f",
    "name": "Monthly Budget",
    "amount": 2000,
    "month": "2025-01",
    "year": 2025,
    "userId": "639a7b8c9d1f2e3a4b5c6d7e",
    "essentialItems": ["Rent", "Groceries", "Utilities"],
    "spentAmount": 150.50,
    "isActive": true,
    "createdAt": "2025-12-30T13:26:00.000Z",
    "updatedAt": "2025-12-30T13:26:00.000Z"
  },
  "timestamp": "2025-12-30T13:26:00.000Z",
  "path": "/budgets/current"
}
```

#### Get Budget by ID
```http
GET /budgets/:id
Authorization: Bearer <access_token>
```

#### Update Budget
```http
PATCH /budgets/:id
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "amount": 2500,
  "essentialItems": ["Rent", "Groceries", "Utilities", "Transport"]
}
```

#### Delete Budget
```http
DELETE /budgets/:id
Authorization: Bearer <access_token>
```

**Response (204):** No content

#### Add Essential Item
```http
POST /budgets/:id/essential-items
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "item": "Transport"
}
```

#### Remove Essential Item
```http
DELETE /budgets/:id/essential-items
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "item": "Transport"
}
```

#### Update Spent Amount
```http
PATCH /budgets/:id/spent
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "amount": 25.50
}
```

---

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLoginAt?: string;
}
```

### Expense Model
```typescript
interface Expense {
  _id: string;
  title: string;
  amount: number;
  description?: string;
  category?: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Budget Model
```typescript
interface Budget {
  _id: string;
  name: string;
  amount: number;
  month: string; // Format: "YYYY-MM"
  year: number;
  userId: string;
  essentialItems: string[];
  spentAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Auth Response
```typescript
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
```

---

## Frontend Implementation Guide

### Token Management

```javascript
// Store tokens after login/register
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);

// Get current token
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

// Clear tokens on logout
const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};
```

### API Client Setup

```javascript
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle 401 - token expired
      if (response.status === 401 && data.message.includes('expired')) {
        await this.refreshToken();
        // Retry the original request
        return this.request(endpoint, options);
      }

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      // Clear tokens if refresh fails
      if (error.message.includes('refresh')) {
        clearTokens();
        window.location.href = '/login';
      }
      throw error;
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    localStorage.setItem('access_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
  }

  // API Methods
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getExpenses() {
    return this.request('/expenses');
  }

  async createExpense(expense) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  async updateExpense(id, expense) {
    return this.request(`/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(expense),
    });
  }

  async deleteExpense(id) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }
}

// Usage
const api = new ApiClient('https://your-backend.onrender.com');
```

### Error Handling

```javascript
try {
  const expenses = await api.getExpenses();
  // Handle success
} catch (error) {
  if (error.message.includes('401')) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.message.includes('validation')) {
    // Show validation errors to user
    setErrors(error.message);
  } else {
    // Show generic error
    showToast('Something went wrong', 'error');
  }
}
```

---

## Environment Variables

For local development, create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-here
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-here
FRONTEND_URL=http://localhost:3000
PORT=8000
```

---

## Rate Limiting & Security

- **JWT tokens** are signed with HS256 algorithm
- **Password hashing** with bcrypt (10 salt rounds)
- **CORS** configured for frontend domain
- **Input validation** on all endpoints
- **User-scoped queries** prevent data access between users

---

## Testing

### Example cURL Commands

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Expenses (replace TOKEN with actual token)
curl -X GET http://localhost:8000/expenses \
  -H "Authorization: Bearer TOKEN"

# Create Expense
curl -X POST http://localhost:8000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Coffee","amount":5.50,"category":"Food"}'
```

---

## Support

For API issues or questions:
- Check the error messages carefully
- Verify token format and validity
- Ensure proper request headers
- Validate request body format

**Last Updated**: December 30, 2025
