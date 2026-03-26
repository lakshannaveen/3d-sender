# 3D Sender (Full‑stack)

Monorepo with:
- `frontend/` React (Vite) + Tailwind UI
- `backend/` Node.js (Express) + MongoDB Atlas (Mongoose) + Socket.IO real‑time chat

## Folder structure

- `frontend/`: web app (search shops, create order, chat, upload PDF, tracking)
- `backend/`: API + sockets + local PDF storage under `backend/uploads/`

## Setup

### 1) Backend env

Copy and fill:
- `backend/.env.example` → `backend/.env`

Minimum:
- `MONGODB_URI`: your MongoDB Atlas connection string
- `JWT_SECRET`: any long random string
- `CLIENT_ORIGIN`: `http://localhost:5173`

### 2) Frontend env

Copy:
- `frontend/.env.example` → `frontend/.env`

## Run (dev)

From repo root:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Health check: `http://localhost:8080/api/health`

## Roles

- **user**: search shops, create orders, chat, upload PDF, cancel order
- **shopOwner**: create shop, see their orders, update order status, chat
- **admin**: see all orders (basic view)

## Notes

- **PDF storage**: saved locally on backend in `backend/uploads/pdfs/` and served at `/uploads/...`
- **Delivery tracking**: `Order.statusHistory` timeline + status update endpoint

