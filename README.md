# Seminar Room Timetable & Booking Management System

A modern hospital-grade Seminar Room Timetable & Booking Management System built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

## Features

- **Weekly Timetable (Dashboard)**: Interactive Mon–Sat calendar grid (8:00 AM – 5:00 PM) with 12-hour AM/PM formatting.
- **Smart Room Allocation & Overlap Detection**:
  - Automatically recommends **Seminar 1** as the primary room.
  - Automatically falls back to **Seminar 2** if Seminar 1 is occupied.
  - Rejects booking and notifies the administrator if both rooms are fully booked.
- **Quick Event Booking (`/add`)**:
  - 1-Click presets (Clinical Seminar, MDT Meeting, Grand Rounds, etc.).
  - Quick date shortcuts (Today, Tomorrow).
  - Clean 12-hour dropdown selectors for Start and End Times.
  - Quick duration chips (30m, 1h, 1.5h, 2h, 3h).
  - 1-Click "Auto-Assign & Book" flow.
- **Rooms Status View (`/rooms`)**: Daily breakdown of events scheduled in Seminar 1 vs Seminar 2.
- **Requests Management (`/requests`)**: Process and schedule manual or historical booking requests.
- **Admin Authentication**: Secure JWT-based admin login with bcrypt password verification and protected dashboard routes.
- **Dark Theme**: Premium high-contrast dark medical aesthetic.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database / ORM**: Prisma (SQLite for local dev, PostgreSQL ready for production)
- **Auth**: JWT via `jose` and `bcryptjs`
- **Icons**: `lucide-react`

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database & Seed
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`. Default admin credentials:
- **Username**: `admin`
- **Password**: `admin123`