# RMS (Restaurant Management System) — Project Documentation

Pure **HTML/CSS/JavaScript** restaurant ordering demo that runs entirely in the browser using **LocalStorage** as a database.

It supports multiple roles (Admin, Server, Kitchen, Customer) and a **phone-number-first ordering system** so order history is never lost—guest orders can be placed by phone and later automatically linked when the customer registers.

---

## Tech stack

- **Frontend**: HTML + CSS + vanilla JavaScript
- **Persistence**: Browser `localStorage` / `sessionStorage`
- **No backend required**

---

## How to run

1. Open `index.html` in a browser (double-click it).
2. Login with a demo account (see below).

Optional: If you want a clean start, clear site data (LocalStorage) in your browser DevTools and refresh.

---

## Demo accounts (seeded on first run)

These accounts are created automatically by `js/storage.js` when there are no users yet.

- **Admin**
  - Phone: `1234567890`
  - Password: `password` (default for seeded users)
- **Server**
  - Phone: `9876543210`
  - Password: `password`
- **Kitchen**
  - Phone: `5555555555`
  - Password: `password`

> Customers are created via the Register screen.

---

## Roles & pages

- **Customer**
  - `dashboard.html` (home + points + recent orders)
  - `menu.html` (add items)
  - `order.html` (cart + place order)
  - `history.html` (full order history)
- **Server**
  - `server.html` (tables + live feed + drafts)
  - `menu.html` (take orders by table/customer)
  - `order.html` (review/send to kitchen)
  - `history.html` (system history view)
- **Kitchen**
  - `kitchen.html` (kitchen board: pending → preparing → ready)
- **Admin**
  - `admin.html`, `report.html`, `menu.html` (menu management)

---

## Core feature: Phone-number-first ordering (guest + registered)

### Goal

Ensure **no order history is lost** even if the customer is not registered at the time of ordering.

### How it works

Each order stores:

- `customerPhone` (**always**, when available)
- `customerUserId` (**nullable**, set when linked to an account)

The **phone number** is the unique identifier used to match “guest orders” with a customer account later.

### Scenarios supported

- **Guest ordering by phone**
  - Server can place an order using only the customer phone number.
  - If no account exists, the order is still created and stored with that phone.
- **Registered user ordering**
  - Customer places orders while logged in; order links to their `userId`.
- **Register later → auto-link old orders**
  - When a customer registers using a phone number that exists on past guest orders, the system automatically links those past orders to the new account.
- **Login also reconciles**
  - When a customer logs in, any remaining guest orders matching their phone are linked automatically.

### Where linking happens

- `Storage.linkGuestOrdersToUserByPhone(phone, userId)` in `js/storage.js`
- Triggered from:
  - `AuthService.register(...)`
  - `AuthService.login(...)` (customers)
  - `CustomerServices.updateDashboard()` (safety net)

---

## Server workflow: Draft orders (taken but not placed yet)

### Why drafts exist

In real restaurants, the **server** may take orders even if the customer never uses the website. The server needs to see the order they’re taking **before** it’s sent to the kitchen.

### Draft behavior

- When a server is taking an order for a table/customer, items go into a **draft cart**.
- A draft is **not** an order in the kitchen system yet.
- Drafts are stored per **server + table + customer**, so each table can have its own pending draft.

### Where drafts appear

- `server.html`
  - Occupied tables show a badge like **Draft 3 items**
  - Table details modal displays draft items and a **“Review & Send to Kitchen”** button
- `order.html`
  - Server reviews the draft cart and clicks **Place Order** to send it to Kitchen
  - When placed, the draft cart is cleared automatically

---

## Data model (LocalStorage)

### Primary keys

- `users`: array of user objects (`admin`, `server`, `kitchen`, `customer`)
- `menu`: menu items
- `tables`: tables list
- `orders`: order list
- `currentUser`: active logged-in user

### Cart keys

- **Customer cart**
  - `cart_<userId>`
- **Server draft cart**
  - `cart_server_<serverId>_table_<tableNumber>_cust_<customerKey>`
  - `customerKey` is either:
    - customer user id (if registered), OR
    - normalized phone, OR
    - a fallback token

### Order fields (important)

- `id`: order id (e.g. `ORD<timestamp>`)
- `customerUserId`: string | null
- `customerPhone`: string | null (normalized)
- `customerId`: legacy compatibility field (kept aligned as `customerUserId || customerPhone`)
- `tableNumber`: number | null
- `items`: cart items
- `status`: `Pending | Preparing | Ready | Completed`
- `timestamp`: ms epoch
- `totalAmount`: number

---

## Order status flow

- Server/customer places order → **Pending**
- Kitchen accepts → **Preparing**
- Kitchen marks ready → **Ready**
- Server serves → **Completed**

---

## Phone normalization rules

Phones are normalized via `Storage.normalizePhone(phone)`:

- trims whitespace
- removes non-digits
- preserves a leading `+` if present

This prevents mismatches like `"(555) 123-4567"` vs `"5551234567"`.

---

## Notes / limitations (demo scope)

- This is a **frontend-only** prototype; LocalStorage acts as the DB.
- Clearing browser storage will reset data.
- Password handling is simplified for demo use.

