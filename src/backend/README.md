# Product Lab - Backend API

Complete backend API for the Product Lab e-commerce platform built with Node.js, Express, MongoDB, and Passport.js authentication.

## 🚀 Features

- **Authentication & Authorization**
  - Local authentication (email/password)
  - Google OAuth 2.0 integration
  - Session-based authentication with express-session
  - Password hashing with bcrypt

- **RESTful API**
  - Products management
  - Bundles/Collections
  - User cart operations
  - Wishlist functionality
  - Order processing

- **Security**
  - Helmet.js for security headers
  - CORS protection
  - Input validation with express-validator
  - Secure session management
  - MongoDB injection protection

- **Database**
  - MongoDB with Mongoose ODM
  - Proper indexing for performance
  - Session storage with connect-mongo

## 📦 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: Passport.js
  - passport-local (email/password)
  - passport-google-oauth20 (Google OAuth)
- **Session Store**: connect-mongo
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Password Hashing**: bcryptjs

## 🛠️ Installation

### Prerequisites

- Node.js v18 or higher
- MongoDB v6 or higher (local or MongoDB Atlas)
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file with your configuration**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/product-lab
   SESSION_SECRET=your-super-secret-key
   FRONTEND_URL=http://localhost:5173
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

4. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Google OAuth
```http
GET /auth/google
```

#### Logout
```http
POST /auth/logout
```

#### Get Current User
```http
GET /auth/me
```

#### Check Auth Status
```http
GET /auth/status
```

### Products Endpoints

#### Get All Products
```http
GET /products?category=audio&page=1&limit=12
```

Query Parameters:
- `category` - Filter by category
- `search` - Search products
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `inStock` - Filter in-stock items
- `sort` - Sort order (default: -createdAt)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

#### Get Single Product
```http
GET /products/:slug
```

#### Get Products by Category
```http
GET /products/category/:category
```

### Bundles Endpoints

#### Get All Bundles
```http
GET /bundles?category=audio&page=1
```

#### Get Single Bundle
```http
GET /bundles/:slug
```

### User Endpoints (Authenticated)

#### Get Profile
```http
GET /user/profile
```

#### Update Profile
```http
PUT /user/profile
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

#### Get Cart
```http
GET /user/cart
```

#### Add to Cart
```http
POST /user/cart
Content-Type: application/json

{
  "productId": "product-id",
  "quantity": 1
}
```

#### Update Cart Item
```http
PUT /user/cart/:itemId
Content-Type: application/json

{
  "quantity": 2
}
```

#### Remove from Cart
```http
DELETE /user/cart/:itemId
```

#### Clear Cart
```http
DELETE /user/cart
```

#### Get Wishlist
```http
GET /user/wishlist
```

#### Toggle Wishlist
```http
POST /user/wishlist/:productId
```

#### Get Orders
```http
GET /user/orders
```

#### Create Order
```http
POST /user/orders
Content-Type: application/json

{
  "items": [...],
  "shippingAddress": {...},
  "paymentMethod": "credit_card"
}
```

#### Get Single Order
```http
GET /user/orders/:orderId
```

## 🗂️ Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── passport.js          # Passport strategies
├── models/
│   ├── User.js              # User model
│   ├── Product.js           # Product model
│   ├── Bundle.js            # Bundle model
│   └── Order.js             # Order model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── products.js          # Product routes
│   ├── bundles.js           # Bundle routes
│   └── user.js              # User routes
├── middleware/
│   └── auth.js              # Authentication middleware
├── scripts/
│   └── seedData.js          # Database seeding
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js                # Main server file
```

## 🔐 Security Features

- **Password Security**: Passwords are hashed using bcrypt with salt rounds
- **Session Security**: HTTP-only cookies, secure flag in production
- **CORS Protection**: Configured for specific frontend origin
- **Input Validation**: All inputs validated with express-validator
- **Helmet.js**: Security headers for common vulnerabilities
- **MongoDB Injection**: Protected through Mongoose sanitization

## 🧪 Testing

Test credentials (from seed data):
```
Email: test@example.com
Password: password123
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/product-lab` |
| `SESSION_SECRET` | Secret for session encryption | Random string |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | From Google Console |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `http://localhost:5000/api/auth/google/callback` |

## 🚢 Deployment

See the main `tut.txt` file in the root directory for complete deployment instructions.

### Quick Deploy to Render

1. Create account on [Render](https://render.com)
2. Create new Web Service
3. Connect repository
4. Set root directory to `backend`
5. Add environment variables
6. Deploy!

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas cluster is accessible
- Check connection string format
- Verify IP whitelist in MongoDB Atlas

### Google OAuth Not Working
- Verify redirect URIs in Google Console
- Check client ID and secret
- Ensure OAuth consent screen is configured

### Session Not Persisting
- Check SESSION_SECRET is set
- Verify cookie settings in production
- Ensure CORS credentials are enabled

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.
