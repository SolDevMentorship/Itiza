# 📦 Itiza Gifting Platform – Backend Documentation

Welcome to the backend documentation for the **Itiza Gifting Platform** — a gifting app that allows users to send physical or digital gifts such as tokens, airtime, and real-world items.

---

## ⚙️ Prerequisites & Initial Setup

Before running the project concurrently (frontend + backend), follow these steps to install all necessary dependencies:

### 1. Install dependencies

```bash
npm install
```

### 2. Install global tools if not already available

Install `tsx` globally if not already present (used for running TypeScript files directly):

```bash
npm install -g tsx
```

---

## 🚀 Starting the Project (Frontend + Backend)

Run both frontend and backend concurrently with:

```bash
npm run dev:all
```

This runs:

* Frontend on **Vite dev server** (usually `http://localhost:5173`)
* Backend on **Express server** (`http://localhost:4000`)

---

## 📥 Uploading Items with Images

### File: `src/UploadItems.ts`

This standalone module is used **once** to upload item data (including images) into MongoDB.

> 🛠️ It **must be run independently**, not part of the backend server:

```bash
npx tsx src/UploadItems.ts
```

### Functionality:

* Reads local image files from the `/src/images/` directory.
* Converts each image into **BSON binary format** using `mongodb.Binary`.
* Stores the image along with other item metadata (name, description, price, stock) into the MongoDB `items` collection.
* The module is **not mounted as a router** in `index.ts` because it’s a utility script, not an API route.

> ⚠️ Note: The items with commented lines in the `items` array have **already been uploaded** and should not be duplicated unless modified.

---

## 🖼️ Displaying Images on the Frontend

* When fetching items from the backend (via `/Itiza_Delivery/items`), the server converts each BSON image back into a **Base64-encoded image URL** using:

  ```ts
  const base64 = Buffer.from(bsonBinary).toString("base64");
  const img = `data:${mimeType};base64,${base64}`;
  ```
* This allows the images to be rendered **directly** in the browser without needing separate static hosting or image URLs.
* The transformed data is then displayed on `Dashboard.tsx` in the frontend UI.

---

## 📡️ Backend Routers & Their Roles

Mounted in `index.ts`, these Express routers handle specific backend responsibilities:

### `/Itiza_Delivery/items`

* **Purpose**: Returns all gift items from MongoDB.
* Converts BSON image binary to base64 string.
* Returns metadata including: `id`, `name`, `price`, `description`, `stockQuantity`.

---

### `/Itiza_Delivery/orders`

* **Purpose**: Handles new gift orders.
* Saves order details and associated metadata.
* Updates:

  * User stats: `totalOrders`, `totalSpent`
  * Item inventory: Decreases `stockQuantity` by 1

---

### `/Itiza_Delivery/auth`

* **Purpose**: User sign-up.
* Registers a new user with `FullName`, `UserID` (email), and password.
* Saves timestamp and initializes stats.

---

### `/Itiza_Delivery/users/login`

* **Purpose**: User login handler.
* Validates `email` and `password`.
* If valid, returns basic user details (excluding password).
* Matches based on `UserID` (email field) as defined during sign-up.

---

### `/Itiza_Delivery/sendOTP`

* **Purpose**: Sends OTP for email verification.
* (Includes test route `/sendOTP/test` for basic verification)

---

## 📋 Utility Routes

### `/debug/routes`

* Lists all currently registered Express routes for easy debugging.

---

## 📚 Project Structure (Simplified)

```
src/
├── index.ts              # Main server entry
├── mongoClient.ts        # MongoDB connection manager
├── UploadItems.ts        # Standalone image + item uploader
├── items.ts              # GET all items (image conversion)
├── order.ts              # Save order + update inventory & stats
├── auth.ts               # Sign up
├── loginUser.ts          # Log in
├── sendOTP.ts            # OTP sender
```

---

## ✅ Final Notes

* Make sure `.env` contains `MONGODB_URI` for proper database connectivity.
* All routes are prefixed with `/Itiza_Delivery/*`.
* Items must be uploaded only once unless explicitly updated.
* Passwords are stored as plaintext for now — consider using `bcrypt` for hashing in production.
