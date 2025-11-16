# BLAST Gear - API Contracts & Implementation Plan

## Mock Data to Remove
- `/app/frontend/src/mock.js` - All product data, cart functions, and order functions will be replaced with real API calls

## Backend APIs to Implement

### 1. Products API
**Endpoints:**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

**Product Schema:**
```python
{
    "id": "string",
    "name": "string",
    "description": "string",
    "price": "float",
    "image": "string (URL)",
    "sizes": ["array of strings"],
    "category": "string",
    "inStock": "boolean",
    "createdAt": "datetime"
}
```

### 2. Orders API
**Endpoints:**
- `POST /api/orders` - Create new order
- `GET /api/orders/:orderId` - Track order by ID
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:orderId/status` - Update order status (Admin)

**Order Schema:**
```python
{
    "orderId": "string (ORD-timestamp)",
    "customer": {
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "address": "string",
        "city": "string",
        "state": "string",
        "zipCode": "string",
        "country": "string"
    },
    "items": [
        {
            "productId": "string",
            "name": "string",
            "price": "float",
            "size": "string",
            "quantity": "int",
            "image": "string"
        }
    ],
    "subtotal": "float",
    "shipping": "float",
    "tax": "float",
    "total": "float",
    "status": "string (Processing/Shipped/Delivered)",
    "createdAt": "datetime"
}
```

### 3. Contact API
**Endpoints:**
- `POST /api/contact` - Submit contact form with reCAPTCHA verification

**Request:**
```python
{
    "name": "string",
    "email": "string",
    "message": "string",
    "recaptchaToken": "string"
}
```

### 4. Admin Panel (Future Enhancement)
**Endpoints:**
- `POST /api/admin/products` - Add new product with image upload
- `PUT /api/admin/products/:id` - Edit product
- `DELETE /api/admin/products/:id` - Remove product
- `GET /api/admin/orders` - View all orders
- `PUT /api/admin/orders/:id` - Update order status

## Frontend Integration Changes

### Remove from mock.js:
- `mockProducts` array
- `getCart()`, `saveCart()`, `addToCart()` functions (keep localStorage cart for now)
- `getOrderById()`, `saveOrder()` functions

### Update Components:
1. **Home.jsx**
   - Fetch products from `GET /api/products` on mount
   - Update contact form to call `POST /api/contact` with reCAPTCHA token

2. **ProductCard.jsx**
   - Use real product data from API

3. **Checkout.jsx**
   - Submit order to `POST /api/orders`
   - Receive orderId and show confirmation

4. **Order Tracking Section (Home.jsx)**
   - Call `GET /api/orders/:orderId` to fetch order status
   - Display order details and tracking info

## Implementation Order
1. Setup MongoDB models for Products and Orders
2. Create Products CRUD endpoints
3. Create Orders endpoints
4. Create Contact form endpoint with reCAPTCHA verification
5. Update frontend to use real APIs
6. Test full flow: Browse → Add to Cart → Checkout → Track Order
7. Admin panel (optional future feature)

## Notes
- Stripe integration structure is ready but needs API keys
- reCAPTCHA keys need to be updated for blastgear.shop domain
- Cart management stays in localStorage for now (no user authentication)
