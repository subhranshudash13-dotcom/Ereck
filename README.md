# ⚡ Electroreck Club Event Showcase & Management Platform

> A production-ready, dual-theme university technical-club event showcase and registration management system designed for **Electroreck** (National Institute of Technology Kurukshetra).

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![EJS](https://img.shields.io/badge/EJS-Templates-B4CA65?logo=ejs&logoColor=white)](https://ejs.co/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%7C%20In--Memory%20Fallback-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Theme: Dark & Light](https://img.shields.io/badge/Theme-Dark%20%26%20Light%20Toggle-EAA943)](https://github.com)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [🌓 Dark & Light Theme System](#-dark--light-theme-system)
- [🦶 Rich Multi-Column Modern Footer](#-rich-multi-column-modern-footer)
- [❓ Interactive FAQ Section](#-interactive-faq-section)
- [🌟 Brand Identity & Visual Design](#-brand-identity--visual-design)
- [🏗️ Architectural Overview & File Structure](#️-architectural-overview--file-structure)
- [🚀 Core Features](#-core-features)
  - [1. Student Event Showcase & Registration Portal](#1-student-event-showcase--registration-portal)
  - [2. Dual-Persistence Engine (MongoDB + Offline Memory)](#2-dual-persistence-engine-mongodb--offline-memory)
  - [3. Club Organizer Admin Console](#3-club-organizer-admin-console)
- [📡 REST API Reference](#-rest-api-reference)
  - [Public Endpoints](#public-endpoints)
  - [Admin Protected Endpoints](#admin-protected-endpoints)
- [💻 Quick Start & Local Execution](#-quick-start--local-execution)
  - [Prerequisites](#prerequisites)
  - [Installation & Running](#installation--running)
  - [Access URLs & Default Credentials](#access-urls--default-credentials)
- [▲ Deploying to Vercel](#-deploying-to-vercel)
- [🔒 Security & Business Rules](#-security--business-rules)
- [🛠️ Troubleshooting & FAQ](#️-troubleshooting--faq)
- [👥 Contributing & License](#-contributing--license)

---

## ⚡ Overview

**Electroreck Event Platform** is an end-to-end web application built for the official technical club of NIT Kurukshetra. It delivers a modern, high-performance event management lifecycle:

1. **For Students:** Browse upcoming technical workshops, hackathons, cultural showcases, and tech-sports tournaments with instant category filtering, real-time seat availability progress bars, and an interactive registration modal that generates personalized attendee tickets.
2. **For Organizers:** Secure administrative console with JWT-based authentication, real-time KPI metrics, dynamic event CRUD, registration open/close toggles, live attendee roster search, and instant `.csv` spreadsheet export.
3. **Resilience First:** Designed to run seamlessly in any environment. If a local MongoDB daemon is unavailable, the backend gracefully switches to a high-fidelity in-memory data store with pre-seeded demo events and full CRUD capabilities.

---

## 🌓 Dark & Light Theme System

The platform features an adaptive **Dark & Light Theme Engine** engineered for visual comfort and high contrast:

- **Instant Pre-Paint Theme Initialization:** Injects a lightweight snippet inside the `<head>` of all templates to check `localStorage` before HTML rendering, completely eliminating screen flickering (FOUC).
- **Default Theme:** **Dark mode** is the primary, out-of-the-box default theme matching Electroreck's core visual identity, while allowing users to switch freely to Light mode at any time.
- **Persistent State:** User choice is automatically preserved across sessions via `localStorage` under the key `electrorec_theme`.
- **Dynamic Theme Toggle Button:** Positioned on the desktop and mobile navigation bars, as well as the organizer login and dashboard consoles, with smooth sun/moon SVG transitions and accessible ARIA state management (`aria-pressed`, `aria-label`).
- **Semantic CSS Token System:** All surface, border, text, and brand colors are bound to CSS Custom Properties that seamlessly adapt across palettes:

```css
/* Theme Custom Property Mapping */
:root {
  --black: #020202;         /* Dark canvas */
  --black-card: #111111;    /* Elevated surface */
  --white: #FFFFFF;         /* Crisp text */
  --gold: #EAA943;          /* Brand gold */
  --border: #262626;        /* Structural border */
}

[data-theme="light"] {
  --black: #F8FAFC;         /* Clean warm-white canvas */
  --black-card: #FFFFFF;    /* Pure white elevated cards */
  --white: #0F172A;         /* Slate-900 readable headings */
  --gold: #C97D16;          /* Tuned high-contrast amber */
  --border: #E2E8F0;        /* Soft divider lines */
}
```

---

## 🦶 Rich Multi-Column Modern Footer

The platform incorporates an editorial, high-density 4-column modern footer:

- **Column 1 — Brand & Identity:** Official **ELECTRORECK** emblem, club motto (*"Electrify Your Potential"*), and social channels (GitHub, LinkedIn, Instagram, Email) with tactile hover elevations and gold glow states.
- **Column 2 — Quick Navigation:** Instant jump links to *Explore Events*, *Why Join Us*, *About ELECTRORECK*, and the *Organizer Admin Portal*.
- **Column 3 — Event Tracks:** Direct category triggers for *Technical Workshops (IoT & Robotics)*, *Cultural & Creative Arts*, and *Tech-Sports Championships*.
- **Column 4 — Campus Headquarters:** Official campus location at NIT Kurukshetra, verified contact email (`contact@electroreck.club`), and club lab office hours.
- **Bottom Bar & Live Status:** System status beacon showing `"Systems Operational ⚡"`, dynamic copyright, and privacy/terms links.
- **Fully Responsive:** Automatically downsamples from 4 columns on desktop to 2 columns on tablet and a stacked layout on mobile viewports.

---

## ❓ Interactive FAQ Section

An accordion-powered, categorized FAQ component answering critical questions for prospective attendees:

- **Instant Category Filtering:** Filter questions dynamically across **All**, **Registrations & Passes**, **Eligibility & Entry**, **Certificates & Prizes**, and **Club Induction**.
- **Smooth Accordion Animation:** Pure CSS/JS transitions with auto-collapsing states and accessible `aria-expanded` attributes.
- **7 Pre-Configured Standard Questions:**
  1. *Who is eligible to participate in ELECTRORECK events?*
  2. *Is there any registration fee required to attend?*
  3. *How do I receive my registration confirmation and entry pass?*
  4. *Can I register for multiple events during the club calendar?*
  5. *Do I need prior hardware or coding experience to join?*
  6. *Will attendees receive verified certificates and prizes?*
  7. *How can I join the ELECTRORECK core team or coordinator committee?*
- **Organizer Help Box:** Direct fallback contact info with email link for queries not covered in the FAQ.

---

## 🌟 Brand Identity & Visual Design

The design system derives directly from the official **Electroreck** emblem:

| Color Token | Dark Mode Hex | Light Mode Hex | Role & Hierarchy |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#020202` | `#F8FAFC` | 70% Base workspace / viewport background |
| **Card / Surface** | `#111111` | `#FFFFFF` | 20% Elevated event cards, dialogs, forms |
| **Text Primary** | `#FFFFFF` | `#0F172A` | Primary typography, headlines, active tabs |
| **Text Muted** | `#A7A7A7` | `#475569` | Secondary metadata, dates, descriptions |
| **Electro Gold** | `#EAA943` | `#C97D16` | 10% Brand accent, active filters, CTA buttons |
| **Structural Borders** | `#262626` | `#E2E8F0` | Card borders, dividers, inputs |

### Typography Pairing
- **Headings & Badges:** `Space Grotesk` — bold, engineering-inspired geometric typography.
- **Body & Data Fields:** `Inter` — clean, highly legible font for long descriptions and data tables.

---

## 🏗️ Architectural Overview & File Structure

```
electrorec-event-platform/
│
├── backend/                             # Express Server & REST API
│   ├── config/
│   │   └── db.js                        # Resilient MongoDB connector with in-memory fallback
│   ├── controllers/
│   │   ├── adminController.js           # JWT auth, organizer KPI stats, event CRUD, CSV export
│   │   ├── eventController.js           # Public event retrieval, category filtering, single event query
│   │   ├── registrationController.js    # Registration handler, duplicate check, capacity counter
│   │   └── viewController.js            # Server-Side EJS View Controllers & SSR rendering
│   ├── middleware/
│   │   ├── auth.js                      # JWT bearer verification middleware
│   │   └── errorHandler.js              # Centralized error formatter
│   ├── models/
│   │   ├── Event.js                     # Mongoose Event Schema
│   │   └── Registration.js              # Mongoose Attendee Registration Schema
│   ├── routes/
│   │   ├── adminRoutes.js               # /api/admin/* endpoints
│   │   ├── eventRoutes.js               # /api/events/* endpoints
│   │   ├── registrationRoutes.js        # /api/registrations/* endpoints
│   │   └── viewRoutes.js                # Server-rendered EJS web pages (/, /event/:id, /register/:id)
│   ├── services/
│   │   └── dataStore.js                 # Unified Data Access Layer (MongoDB + Resilient In-Memory Store)
│   ├── views/                           # Server-Rendered EJS Templates
│   │   ├── index.ejs                    # Homepage template
│   │   ├── event.ejs                    # Event details template
│   │   ├── register.ejs                 # Event registration template
│   │   └── partials/
│   │       ├── head.ejs                 # Common HTML head with pre-paint theme initializer
│   │       ├── navbar.ejs               # Header navigation with Dark/Light theme toggle
│   │       └── footer.ejs               # Footer with script includes
│   ├── .env                             # Environment configuration
│   ├── seed.js                          # Standalone database seeder
│   └── server.js                        # Server initialization & middleware pipeline
│
├── frontend/                            # Public Client Assets
│   ├── assets/
│   │   ├── events/                      # High-resolution event imagery (Technical, Cultural, Sports)
│   │   └── logo/                        # Vector and raster Electroreck brand logos
│   ├── css/
│   │   ├── style.css                    # Design system, CSS tokens, dark/light themes, animations
│   │   └── responsive.css               # Responsive breakpoints (Desktop, Tablet, Mobile)
│   ├── js/
│   │   ├── api.js                       # Reusable REST client wrapper
│   │   ├── events.js                    # Dynamic event card rendering and category filtering
│   │   ├── registration.js              # Interactive modal, form validation, ticket generation
│   │   └── main.js                      # Theme switcher, scroll cues, mobile drawer, session checker
│   ├── index.html                       # Static fallback homepage
│   ├── event.html                       # Static fallback event details page
│   └── register.html                    # Static fallback registration page
│
├── admin/                               # Club Organizer Admin Console
│   ├── css/
│   │   └── admin.css                    # Admin-specific styling with matching Dark/Light modes
│   ├── js/
│   │   └── admin.js                     # Dashboard state, KPI counters, event management, CSV downloader
│   └── index.html                       # Admin single-page console & organizer authentication
│
├── package.json                         # Dependencies & execution scripts
└── README.md                            # Comprehensive project documentation
```

---

## 🚀 Core Features

### 1. Student Event Showcase & Registration Portal
- **Category Filter Tabs:** Filter events instantly across **All**, **Technical (⚡)**, **Cultural (🎭)**, and **Sports (🏆)** without page reloads.
- **Seat Capacity Tracker:** Visual progress bars displaying registered seats vs total capacity (`42 / 100 seats filled`).
- **Interactive Registration Workflow:**
  - Dedicated registration modal pre-populated with clicked event metadata.
  - Full client and server validation (Student Name, Email, Phone, Roll Number, Academic Year, Branch, College).
  - Confirmed Pass Generation: Generates an immutable, printable Registration Pass with a unique identifier (e.g. `ER-2026-00101`).

### 2. Dual-Persistence Engine (MongoDB + Offline Memory)
- **Zero Setup Friction:** Automatically tries connecting to MongoDB (`mongodb://127.0.0.1:27017/electrorec`).
- **Graceful Fallback:** If MongoDB is offline, the unified `DataStore` seamlessly switches to an in-memory database with pre-populated demo events so developers and evaluators can test 100% of the platform without installing or configuring external services.

### 3. Club Organizer Admin Console
- **JWT Authorization:** Secured endpoints requiring Bearer tokens.
- **Organizer Role Switcher:** Pre-configured demo role buttons (Super Admin, Lead Organizer, Core Team) for instant testing.
- **Live Event Management:**
  - Add new events with custom capacity, category, venue, dates, and descriptions.
  - Toggle registrations open or closed in real time.
  - Delete events with cascading cleanup of registrations.
- **Attendee Roster Explorer:**
  - Instant client-side search across attendee name, email, roll number, and registration ID.
  - Filter attendee rosters per event.
- **CSV Data Export:** One-click download of full attendee records as standard `.csv` spreadsheets compatible with Excel and Google Sheets.

---

## 📡 REST API Reference

### Public Endpoints

| Method | Endpoint | Description | Query / Body Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check | None |
| `GET` | `/api/events` | Retrieve active events list | Optional `?category=Technical` |
| `GET` | `/api/events/:id` | Retrieve single event details | `id` (Event ObjectId or Slug) |
| `POST` | `/api/registrations` | Register a student for an event | JSON body (see example below) |

#### Registration Request Example (`POST /api/registrations`):
```json
{
  "eventId": "670000000000000000000001",
  "name": "Aarav Mehta",
  "email": "aarav@nitkkr.ac.in",
  "phone": "9876543210",
  "rollNumber": "12213099",
  "branch": "Electronics and Communication",
  "year": "3rd Year",
  "college": "NIT Kurukshetra"
}
```

#### Successful Registration Response:
```json
{
  "success": true,
  "message": "Registration confirmed successfully!",
  "registration": {
    "registrationId": "ER-2026-00101",
    "eventTitle": "TechX Workshop: Embedded Systems & IoT",
    "date": "18 October 2026",
    "time": "4:00 PM - 7:00 PM",
    "venue": "Electronics Lab & Innovation Hub",
    "name": "Aarav Mehta",
    "email": "aarav@nitkkr.ac.in",
    "rollNumber": "12213099",
    "registeredAt": "2026-10-13T14:45:02.059Z"
  }
}
```

---

### Admin Protected Endpoints

> All admin endpoints require the header: `Authorization: Bearer <TOKEN>`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticate organizer credentials and obtain JWT token |
| `GET` | `/api/admin/verify` | Verify current JWT token validity and return admin profile |
| `GET` | `/api/admin/stats` | Retrieve platform KPIs (Total Events, Total Registrations, Open Events) |
| `GET` | `/api/admin/events` | List all club events |
| `POST` | `/api/admin/events` | Create a new event |
| `PUT` | `/api/admin/events/:id` | Update event capacity, registration status, or details |
| `DELETE`| `/api/admin/events/:id` | Delete event and cleanup attendee records |
| `GET` | `/api/admin/registrations` | View attendee records across all events |
| `GET` | `/api/admin/events/:id/registrations` | View attendee records for a specific event |
| `GET` | `/api/admin/events/:id/export-csv` | Download attendee roster as `.csv` file |

---

## 💻 Quick Start & Local Execution

### Prerequisites
- [Node.js](https://nodejs.org/) v16.0.0 or later
- npm v8.0.0 or later
- *(Optional)* Local MongoDB running on `mongodb://127.0.0.1:27017`

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/subhranshudash13-dotcom/Ereck.git
   cd Ereck
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   The `.env` file in `backend/.env` is pre-configured for out-of-the-box local execution:
   ```env
   PORT=1234
   MONGODB_URI=mongodb://127.0.0.1:27017/electrorec
   JWT_SECRET=electrorec_super_secret_jwt_key_2026
   ADMIN_EMAIL=admin@electrorec.club
   ADMIN_PASSWORD=electrorec2026
   ```

4. **Launch the platform:**
   ```bash
   npm start
   ```

---

### Access URLs & Default Credentials

| Portal | URL | Purpose |
| :--- | :--- | :--- |
| **🌐 Student Event Portal** | [http://localhost:1234/](http://localhost:1234/) | Public events catalogue, detail pages & registrations |
| **🛡️ Organizer Admin Console** | [http://localhost:1234/admin](http://localhost:1234/admin) | Event management, capacity controls & CSV export |
| **📡 REST API Healthcheck** | [http://localhost:1234/api/health](http://localhost:1234/api/health) | System health status and timestamp verification |

#### Default Administrative Logins:
- **Super Administrator:**
  - Email: `admin@electrorec.club`
  - Password: `electrorec2026`
- **Lead Organizer:**
  - Email: `organizer@electrorec.club`
  - Password: `organizer2026`
- **Core Team Coordinator:**
  - Email: `core@electrorec.club`
  - Password: `coreteam2026`

*(Quick-login role preset chips are also provided directly on the admin login screen for 1-click credential entry).*

---

## ▲ Deploying to Vercel

The platform is pre-configured with `vercel.json` and `api/index.js` for instant serverless deployment on [Vercel](https://vercel.com):

### 1-Click Import & Deploy:
1. Push your repository to GitHub: `https://github.com/subhranshudash13-dotcom/Ereck`.
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." $\rightarrow$ "Project"**.
3. Import the **`Ereck`** repository.
4. Leave **Framework Preset** as **Other** (Vercel automatically detects `vercel.json`).

### Environment Variables:
Under **Project Settings $\rightarrow$ Environment Variables**, configure the following variables:

| Variable | Description | Example / Recommended |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | *(Optional)* MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/electroreck` |
| `JWT_SECRET` | Secret key for signing organizer JWTs | Any strong random string |
| `ADMIN_EMAIL` | Default administrator account email | `admin@electrorec.club` |
| `ADMIN_PASSWORD` | Default administrator password | `electrorec2026` |

> [!NOTE]
> **Zero Database Setup:** If `MONGODB_URI` is left blank or disconnected, the backend automatically runs in resilient in-memory mode, enabling instant full-featured testing on Vercel without requiring a database cluster!

---

## 🔒 Security & Business Rules

1. **Duplicate Registration Prevention:**
   The backend enforces unique indexes per event. A student cannot register for the same event multiple times with either the same **email address** or **college roll number**.
2. **Capacity Enforcement:**
   When an event reaches its maximum participant capacity, registrations are automatically locked and flagged as `Full (Waitlist Only)`.
3. **Registration Window Toggle:**
   Organizers can close registrations for any event at any time from the admin dashboard, immediately reflecting as `Registration Closed` across the public portal.
4. **Input Sanitization:**
   Attendee inputs are strictly trimmed, validated against regex patterns for valid email domains and phone formats.
5. **JWT Authentication:**
   Organizers receive a signed JSON Web Token valid for 24 hours. Sensitive endpoints (`/api/admin/*`) require standard HTTP Bearer token authorization.

---

## 🛠️ Troubleshooting & FAQ

### Q: Does the application require MongoDB to be running?
**A:** No! The system incorporates a built-in in-memory fallback. If MongoDB is not running locally, the server logs a notice and initializes in-memory persistence with pre-seeded events. All features (filtering, registrations, admin updates, CSV exports) work seamlessly without MongoDB.

### Q: How do I change the running port?
**A:** Edit `backend/.env` and update the `PORT` variable (e.g. `PORT=5000`), then restart the server using `npm start`.

### Q: How does the Dark / Light theme toggle remember my preference?
**A:** The theme toggle stores your preference in `localStorage` under the key `electrorec_theme`. The page's `<head>` evaluates this before layout paints, preventing any flashes of dark or light content.

---

## 👥 Contributing & License

Contributions are welcome! Please submit a pull request or open an issue on the repository.

Distributed under the **MIT License**. See `LICENSE` for details.

Developed with ⚡ for **Electroreck** — Official Technical Club, National Institute of Technology Kurukshetra.
