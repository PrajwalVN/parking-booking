# Vehicle Parking Booking System

Stack: **React + TypeScript (Vite)** frontend, **Django** backend, **MongoDB** database.

## Features
- Seat-like grid for parking slots (white = empty, grey = booked-but-empty, red = occupied).
- Book a slot without login: name, phone number, vehicle number required.
- Booking instantly logs date/time for admin.
- Rate: **₹10 per hour**, billed per started hour (minimum 1 hour).
- Admin panel at `/admin` (entered manually in the URL).
  - Hardcoded credentials (edit in `backend/parking/settings.py`): `admin` / `password123`.
  - View booking logs.
  - Mark a booked slot as occupied (turns grey → red).
  - Generate invoice for a slot (calculates from booking time to now), frees the slot.
  - Reset slot utility.

## Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB running locally at `mongodb://localhost:27017`

You can customize DB/creds via env vars:
```
MONGO_URI, MONGO_DB, ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_TOKEN, SLOT_COUNT
```

## Setup

### 1) Start MongoDB
Ensure MongoDB is running locally.
- Default DB name: `parking_system`

### 2) Backend (Django)
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Run server
python manage.py runserver 0.0.0.0:8000
```

The backend will auto-initialize **SLOT_COUNT** slots (default 30) on first run.

### 3) Frontend (React + Vite)
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Vite dev server: http://localhost:5173

The Vite dev server proxies `/api` to the Django server at `http://localhost:8000` (see `vite.config.ts`).

## Usage
- Visit http://localhost:5173/ to see the slot grid.
- Click a **white** slot to book it → becomes **grey** (booked).
- Admin: go to http://localhost:5173/admin
  - Login with the hardcoded credentials.
  - Use **Mark Occupied** to turn a grey (booked) slot **red** when the car arrives.
  - Use **Generate Invoice** when the vehicle leaves. The amount is computed by rounding up hours from **booking time** to **now** at ₹10/hour. The slot becomes **white** again.
  - Logs page shows all entries. Active entries have no end time/amount; completed ones show invoice details.

## Notes
- This project uses **PyMongo** directly; we don't use Django ORM for data.
- For production, secure your admin token & credentials properly; this is a demo.
- Timezone is set to `Asia/Kolkata` in Django settings.
- If you want more slots, set `SLOT_COUNT` env var before starting the backend.

## API Endpoints (quick ref)
- `GET /api/slots` → `{ slots: [{ number, status, currentBookingId? }] }`
- `POST /api/book` body: `{ slotNumber, name, phone, vehicleNumber }`
- `POST /api/admin/login` body: `{ username, password }` → `{ token }`
- `GET /api/admin/logs` header: `X-Admin-Token: <token>`
- `POST /api/admin/mark-occupied` body: `{ slotNumber }` + header
- `POST /api/admin/generate-invoice` body: `{ slotNumber }` + header
- `POST /api/admin/reset-slot` body: `{ slotNumber }` + header

Enjoy!
