# Aurelia Atelier | Premium Accessories E-Commerce Store

> **Sprint 01 Delivery** — A full-stack, quiet-luxury accessories store built with **Angular (Standalone Architecture)**, **Node.js + Express.js (MVC Pattern)**, and **MongoDB with Mongoose**.

---

## 1. Brand Identity & Design Direction

**Brand Concept:** *AURELIA ATELIER — Fine Accessories & Leathercraft*  
**Aesthetic:** *Premium Minimalism & Quiet Luxury*

- **Color Palette:** Warm Ivory (`#FAF8F5`), Cream (`#F5EFEB`), Soft Beige (`#EBE3D7`), Champagne Gold (`#C2A26F`), and Espresso Dark Brown (`#201915`).
- **Typography:** *Cormorant Garamond* (Editorial Serif for titles) and *Plus Jakarta Sans* (Clean, modern geometric sans-serif for UI/body).
- **Photography Standards:** 100% accessories product photography and flat-lays on clean, neutral, marble, and linen textures. **Strictly zero human faces or model portraits**, in full compliance with brand guidelines.
- **Language:** English only.

---

## 2. Architecture & Technologies

### Backend (MVC Architecture)
- **Runtime:** Node.js (v24.x)
- **Framework:** Express.js (v4.x)
- **Database:** MongoDB (v8.x) with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcrypt password hashing
- **Security & Business Logic:**
  - Strict quantity abstraction: **Stock quantity is NEVER exposed to public users or public endpoints**.
  - Cart stock validation endpoint (`POST /api/items/validate-cart`) validates available quantity without leaking numerical quantities.
  - Concurrency-safe atomic stock deduction on order placement (`$inc: -qty` with `{ quantity: { $gte: qty } }`).
  - Server-calculated order totals with price and name snapshots to preserve historical transaction integrity.
  - Category deletion safeguard preventing removal of categories containing active products.

### Frontend (Modern Angular Standalone)
- **Framework:** Angular (v21.x) with Standalone Components & Signals
- **Styling:** Custom SCSS Quiet Luxury design system without bloated external UI frameworks
- **State Management:** Angular reactive signals (`signal`, `computed`), `LocalStorage` synchronization for Favorites and Shopping Bag
- **Routing & Guards:** Angular Router with `authGuard` protecting manager portal routes
- **HTTP Interceptors:** `authInterceptor` automatically appending Bearer tokens to manager requests and handling 401 session expirations

---

## 3. Project Directory Structure

```text
nti-final-proj/
├── backend/
│   ├── config/
│   │   └── database.js               # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js         # Manager login & profile
│   │   ├── categoryController.js     # Categories CRUD with product counts & guards
│   │   ├── dashboardController.js    # Executive KPI aggregations & statistics
│   │   ├── itemController.js         # Items CRUD & public quantity omission
│   │   └── orderController.js        # Checkout, stock deduction & order status
│   ├── middleware/
│   │   ├── auth.js                   # JWT protect & optionalAuth
│   │   └── errorHandler.js           # Centralized HTTP error handler
│   ├── models/
│   │   ├── Category.js               # Category schema with virtual itemCount
│   │   ├── Item.js                   # Accessories schema with specs
│   │   ├── Manager.js                # Manager schema with bcrypt hashing
│   │   └── Order.js                  # Order schema with items snapshot
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── itemRoutes.js
│   │   └── orderRoutes.js
│   ├── seeders/
│   │   └── seed.js                   # Database seed script for manager & catalog
│   ├── app.js                        # Express application configuration
│   ├── server.js                     # HTTP server startup with auto-seed check
│   ├── .env                          # Backend environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/           # authGuard
│   │   │   │   ├── interceptors/     # authInterceptor
│   │   │   │   ├── models/           # TypeScript interfaces (Item, Order, Category, etc.)
│   │   │   │   └── services/         # AuthService, CartService, ItemService, OrderService, etc.
│   │   │   ├── features/
│   │   │   │   ├── public/           # Public Storefront
│   │   │   │   │   ├── home/         # Hero, featured categories & products, heritage
│   │   │   │   │   ├── shop/         # Catalog grid, category pills, search & sort
│   │   │   │   │   ├── item-details/ # Product detail, gallery, specs, qty selector
│   │   │   │   │   ├── favorites/    # Wishlist stored in LocalStorage
│   │   │   │   │   ├── cart/         # Shopping bag with stock check & subtotal
│   │   │   │   │   └── checkout/     # Phone-order customer form & success dossier
│   │   │   │   └── manager/          # Private Management Dashboard
│   │   │   │       ├── login/        # Manager credentials authentication
│   │   │   │       ├── dashboard/    # KPI metrics & recent orders
│   │   │   │       ├── categories/   # Categories CRUD with product count
│   │   │   │       ├── items/        # Items CRUD with stock quantities
│   │   │   │       └── orders/       # Order management, status toggle, internal notes
│   │   │   └── shared/               # Navbar, Footer, ProductCard, EmptyState, Toast
│   │   ├── environments/             # Environment configs (API URLs)
│   │   ├── styles.scss               # Quiet Luxury SCSS design system
│   │   └── index.html                # Typography links (Cormorant Garamond & Plus Jakarta Sans)
│   ├── angular.json
│   └── package.json
│
├── README.md
└── package.json
```

---

## 4. Environment Variables Configuration

The backend reads configuration from `backend/.env`. A pre-configured `.env` is already provided:

```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nti-final-project
JWT_SECRET=aurelia_luxury_secret_jwt_key_2026_super_secure
JWT_EXPIRES_IN=7d
MANAGER_NAME="Aurelia Executive Manager"
MANAGER_EMAIL=manager@aurelia.com
MANAGER_PASSWORD=Manager@123456
NODE_ENV=development
```

---

## 5. Initial Seeding & Manager Account Setup

### Default Manager Credentials:
- **Email:** `manager@aurelia.com`
- **Password:** `Manager@123456`

### Running the Database Seeder:
To populate MongoDB with curated luxury categories (Handbags, Timepieces, Haute Joaillerie, Eyewear, Belts, Silk Accents), 15 premium accessories items with verified product-only images, and initial sample orders:

```bash
cd backend
npm run seed
```

*Note: The backend `server.js` also performs an automatic check on boot; if no manager exists in MongoDB, it automatically provisions the manager specified in your `.env`.*

---

## 6. How to Run Backend & Frontend

### Prerequisites:
- **Node.js** (v18 or higher; v24 recommended)
- **MongoDB** running locally on port 27017 (`mongodb://localhost:27017`)

### 1. Start the Backend Server:
```bash
cd backend
npm install
npm run dev
```
- API will be accessible at: `http://localhost:5000`
- Health check endpoint: `http://localhost:5000/api/health`

### 2. Start the Angular Frontend:
```bash
cd frontend
npm install
npm start
```
- Storefront will be accessible at: `http://localhost:4200`

---

## 7. Key Application Features

### A. Public Storefront
1. **Home Page (`/`)**:
   - Hero banner with headline *"The Art of Everyday Elegance"* and shop CTA.
   - Value propositions: Artisan Heritage, Pure Quiet Luxury, Telephone Concierge, Signature Packaging.
   - Featured categories cards with live product counts.
   - Curated masterpiece product grid with quick-bag and wishlist actions.
   - Brand heritage story and philosophy section.
2. **Shop / Catalog (`/shop`)**:
   - Filter pills for each category.
   - Live search by piece title or description.
   - Price sorting (Low to High, High to Low) and Newest additions.
3. **Item Details (`/item/:id`)**:
   - High-resolution gallery and thumbnail switcher.
   - Price, craftsmanship specs (Material, Dimensions, Packaging).
   - Quantity selector (+/-) and Add to Bag.
   - Wishlist toggle.
   - **Privacy rule:** Stock quantity is strictly hidden from visitors.
4. **Favorites Wishlist (`/favorites`)**:
   - Persisted in browser `LocalStorage`.
   - Grid with quick-add to bag and removal controls.
   - Elegant empty state with catalog CTA.
5. **Shopping Bag (`/cart`)**:
   - Persisted in browser `LocalStorage`.
   - Real-time stock validation against the backend before checkout.
   - Subtotal and complimentary courier calculation.
6. **Concierge Checkout (`/checkout`)**:
   - Direct phone-ordering workflow: no online payment or gateway integration required.
   - Full Name, Phone Number, Delivery Address, and Optional Notes.
   - Order submission to `POST /api/orders` with initial status `opened`.
   - Generates human-friendly order reference (e.g. `AUR-2026-10492`).
   - Detailed confirmation notice explaining that the atelier manager will call the customer by phone to finalize delivery details.
   - Automatic cart clearing on submission.

### B. Manager Console (`/manager/*`)
1. **Manager Authentication (`/manager/login`)**:
   - Private login portal protected by JWT and bcrypt.
   - Redirects to `/manager/dashboard` on success.
2. **Overview Dashboard (`/manager/dashboard`)**:
   - Metric summary cards: Total Categories, Total Items, Total Orders, Opened Orders (requiring phone call), and Closed Orders.
   - Recent telephone orders table with direct phone call links.
3. **Categories Management (`/manager/categories`)**:
   - View, add, edit, and delete categories.
   - Live product count per category.
   - Deletion prevention safeguard if products belong to the category.
4. **Items & Inventory Management (`/manager/items`)**:
   - Full catalog table with **Stock Quantity** column visible exclusively to manager.
   - Filter items by category or keyword.
   - Add new items and edit descriptions, prices, materials, and stock numbers.
   - Product-only image URL validation.
5. **Orders Management (`/manager/orders`)**:
   - View all customer orders with customer name, phone number, date, total, and status.
   - Filter by status (`all`, `opened`, `closed`).
   - Complete order dossier modal showing ordered items snapshot, delivery destination, and client notes.
   - Toggle order status between `opened` and `closed`.
   - Private internal atelier notes editor with instant save.

---

## 8. Verification & Test Endpoints

The backend has been verified against all business rules:
- Run automated backend test suite:
  ```bash
  node backend/test-api.js
  ```
- Run Angular production build:
  ```bash
  cd frontend
  npm run build
  ```
