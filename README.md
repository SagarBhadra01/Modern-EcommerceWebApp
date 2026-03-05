# Modern E-Commerce Web Application

> A full-stack, production-ready e-commerce platform with advanced features including multi-seller support, admin dashboard, and comprehensive product management.

![Status](https://img.shields.io/badge/Status-Production-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Overview

**Modern-EcommerceWebApp** is a comprehensive, scalable e-commerce solution built with modern web technologies. Designed for high-performance and user engagement, it supports multi-seller operations, real-time inventory management, and powerful admin capabilities.

Developed by **Sagar Bhadra** | Currently in **Production**

---

## ✨ Key Features

### For Customers
- 🛍️ **Product Browsing** - Explore products across multiple categories
- 🔍 **Advanced Search & Filtering** - Find products with ease using categories and tags
- ⭐ **Reviews & Ratings** - Leave and view product reviews with star ratings
- 🛒 **Shopping Cart** - Persistent cart management with quantity adjustments
- ❤️ **Wishlist** - Save favorite products for later
- 📦 **Order Management** - Track orders from processing to delivery
- 🏠 **Address Management** - Store multiple delivery addresses
- 🔐 **Secure Authentication** - Clerk-powered secure user authentication
- 📱 **Responsive Design** - Seamless experience across all devices

### For Sellers
- 📊 **Seller Dashboard** - Comprehensive sales analytics and product management
- 📦 **Product Management** - Create, update, and manage product listings
- 💰 **Sales Tracking** - Monitor revenue and sales history
- 🏪 **Point-of-Sale (POS)** - Register direct sales with multiple payment methods
- 📈 **Business Analytics** - Real-time sales data and performance metrics

### For Administrators
- 👥 **User Management** - Manage user accounts, roles, and statuses
- 📦 **Product Administration** - Oversee all marketplace products
- 📋 **Order Management** - Process and track all orders
- 💼 **Seller Management** - Monitor and manage seller accounts
- 📊 **Analytics Dashboard** - Platform-wide performance metrics
- 🔧 **Content Management** - Manage FAQs, testimonials, and landing page content

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool & dev server |
| **TailwindCSS** | Styling & utility-first CSS |
| **React Router v7** | Client-side routing |
| **React Query (TanStack)** | Server state management |
| **Zustand** | Client state management |
| **React Hook Form** | Form handling & validation |
| **Zod** | Schema validation |
| **Framer Motion & GSAP** | Animations |
| **Recharts** | Data visualization |
| **Clerk** | Authentication |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Express.js** | Web server framework |
| **TypeScript** | Type-safe backend |
| **Prisma** | ORM & database abstraction |
| **PostgreSQL** | Primary database |
| **Clerk** | Authentication service |
| **Zod** | Request validation |
| **Helmet** | Security headers |
| **CORS** | Cross-origin requests |
| **Morgan** | HTTP logging |
| **Nodemon** | Development auto-reload |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x or **yarn**
- **PostgreSQL** ≥ 14.x
- **Git**

Additionally, you'll need:

- **Clerk Account** (for authentication) - [Sign up free](https://clerk.com)
- **Database Connection** - PostgreSQL instance (local or cloud)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Modern-EcommerceWebApp
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Clerk and PostgreSQL credentials
# Required variables:
# - DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
# - CLERK_SECRET_KEY=your_clerk_secret_key
# - FRONTEND_URL=http://localhost:5173

# Initialize database
npm run db:push

# Seed sample data (optional)
npm run db:seed

# Start development server
npm run dev
```

Backend runs on: `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Clerk publishable key
# Required variables:
# - VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 📁 Project Structure

```
Modern-EcommerceWebApp/
├── backend/                          # Express.js API server
│   ├── src/
│   │   ├── app.ts                   # Express app configuration
│   │   ├── index.ts                 # Server entry point
│   │   ├── lib/                     # Utilities (Prisma client)
│   │   ├── middleware/              # Auth, error handling, validation
│   │   └── routes/                  # API endpoints
│   │       ├── products.ts
│   │       ├── cart.ts
│   │       ├── orders.ts
│   │       ├── users.ts
│   │       ├── seller.ts
│   │       ├── admin.ts
│   │       ├── reviews.ts
│   │       ├── wishlist.ts
│   │       ├── categories.ts
│   │       └── content.ts
│   └── prisma/
│       ├── schema.prisma            # Database schema
│       └── seed.ts                  # Database seeding scripts
│
├── frontend/                        # React + Vite SPA
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── auth/               # Authentication components
│   │   │   ├── layout/             # Layout components
│   │   │   ├── shared/             # Shared components
│   │   │   └── ui/                 # UI primitives
│   │   ├── features/               # Feature modules
│   │   │   ├── admin/              # Admin dashboard
│   │   │   ├── auth/               # Authentication pages
│   │   │   ├── cart/               # Shopping cart
│   │   │   ├── checkout/           # Checkout flow
│   │   │   ├── products/           # Product pages
│   │   │   ├── orders/             # Order management
│   │   │   └── seller/             # Seller dashboard
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # Utilities & services
│   │   │   ├── api.ts              # API client configuration
│   │   │   ├── utils.ts            # Helper functions
│   │   │   └── services/           # API service modules
│   │   ├── store/                  # Zustand state management
│   │   ├── router/                 # Route configuration
│   │   ├── types/                  # TypeScript type definitions
│   │   └── styles/                 # Global styles
│   └── public/                     # Static assets
│
└── README.md                       # This file
```

---

## 🔌 API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Add address

### Seller
- `GET /api/seller/dashboard` - Seller analytics
- `GET /api/seller/products` - List seller's products
- `POST /api/seller/products` - Create seller product
- `GET /api/seller/sales` - Sales history

### Admin
- `GET /api/admin/dashboard` - Admin analytics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/products` - Manage products

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (admin only)

### Reviews
- `GET /api/reviews/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/:id` - Delete review (own only)

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

---

## 🔐 Authentication

This application uses **Clerk** for secure user authentication.

### Features:
- Email/password authentication
- OAuth integration (Google, GitHub, etc.)
- Multi-tenancy support
- Role-based access control (User, Admin, Seller)
- Secure JWT tokens
- Session management

### Setting Up Clerk:

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Add Clerk keys to your `.env.local`:
   - Backend: `CLERK_SECRET_KEY`
   - Frontend: `VITE_CLERK_PUBLISHABLE_KEY`
4. Configure authentication methods in Clerk dashboard

---

## 💾 Database Schema

The application uses a comprehensive PostgreSQL schema with the following main models:

- **Users** - User accounts with Clerk integration
- **Products** - Marketplace and seller products
- **Categories** - Product categorization
- **Orders & OrderItems** - Order management with history
- **CartItems** - Shopping cart persistence
- **Reviews** - Product ratings and reviews
- **SellerProducts & SellerSales** - Seller-specific operations
- **Wishlist** - Saved products
- **Addresses** - User shipping addresses
- **Testimonials & FAQs** - Landing page content

---

## 🚀 Running the Application

### Development Mode

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Production Build

```bash
# Backend
npm run build
npm start

# Frontend
npm run build
npm run preview
```

---

## 📊 Environment Variables

### Backend (.env.local)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"

# Clerk Authentication
CLERK_SECRET_KEY="your_secret_key"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Server Configuration
NODE_ENV="development"
PORT=3000
```

### Frontend (.env.local)

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY="your_publishable_key"

# API Configuration
VITE_API_URL="http://localhost:3000/api"
```

---

## 🧪 Development Tools

### Database Management

```bash
# Reset database
npm run db:push

# Generate Prisma client
npm run db:generate

# Open Prisma Studio (GUI)
npm run db:studio
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
tsc --noEmit
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

### Development Workflow

- Follow TypeScript best practices
- Maintain code style consistency
- Add tests for new features
- Update documentation as needed
- Ensure all types are properly defined

---

## 🐛 Known Issues & Limitations

- Currently single-warehouse fulfillment
- Payment gateway integration in progress
- Email notifications require SMTP configuration
- Real-time features coming soon

---

## 🔄 Roadmap

- [ ] Payment gateway integration (Stripe, Razorpay)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics & reporting
- [ ] Multi-warehouse support
- [ ] Inventory sync integration
- [ ] Email marketing automation
- [ ] AI-powered recommendations

---

## 📞 Support

For issues, feature requests, or suggestions:

- **GitHub**: [Open an issue](https://github.com/SagarBhadra01/Modern-EcommerceWebApp)
- **Email**: [Contact Developer](mailto:sagarbhadra404@gmail.com)


---

## 👨‍💻 Author

**Sagar Bhadra**

- GitHub: [@SagarBhadra01](https://github.com/SagarBhadra01)
- LinkedIn: [Sagar Bhadra](https://linkedin.com/in/sagarbhadra01)

---

## 🙏 Acknowledgments

- Clerk for authentication services
- Prisma for database abstraction
- React community for amazing tools
- TailwindCSS for styling framework
- All contributors and users

---

**Last Updated**: March 2026  
**Status**: Production • Actively Maintained

