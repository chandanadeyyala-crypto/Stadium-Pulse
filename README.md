# StadiumPulse AI

> A GenAI-enabled smart stadium operations and fan-assistance platform designed for FIFA World Cup 2026 venues.

StadiumPulse AI connects verified venue information, staff reports and operational alerts with Generative AI to provide multilingual assistance, crowd-aware navigation, accessibility guidance, transport support and real-time decision intelligence.

## Live Project

- **Frontend:** https://stadium-pulse-sigma.vercel.app
- **Backend API:** https://stadium-pulse-sszc.onrender.com
- **Repository:** https://github.com/chandanadeyyala-crypto/Stadium-Pulse

---

## Problem Statement

Large international tournaments create challenges involving:

- stadium navigation
- crowd congestion
- language barriers
- accessibility
- transport coordination
- emergency communication
- incident reporting
- operational decision-making

Fans need reliable guidance, while staff and organizers need faster ways to report incidents, publish verified alerts and redirect crowd movement.

StadiumPulse AI addresses these problems through one connected platform for fans, staff, volunteers and organizers.

---

## Core Principle

```text
Verified Data → AI Intelligence → User
```

The AI does not generate stadium facts independently.

It only:

- explains verified information
- translates operational content
- summarizes staff reports
- recommends actions
- prioritizes alerts
- assists with route decisions

When verified context is unavailable, the assistant should respond:

> I do not have verified information for that right now.

This reduces hallucinations and makes the platform suitable for safety-sensitive stadium operations.

---

## Main User Roles

### Fan Experience

Fans can:

- view matchday information
- access live venue alerts
- find seats and facilities
- request crowd-aware routes
- find accessible routes
- locate medical support
- plan stadium exits and transport
- ask the grounded AI assistant for help
- adjust language and accessibility preferences

### Venue Staff

Staff can:

- submit operational reports
- report crowd, medical, security and facility issues
- submit reports in different languages
- generate AI-assisted alert drafts
- review active incidents
- coordinate operational actions

### Organizer Command Center

Organizers can:

- monitor stadium conditions
- review incident reports
- approve fan-facing alerts
- view crowd and route information
- manage venue data
- monitor operational activity
- access AI-supported recommendations

---

## Key Features

### Grounded AI Assistant

The assistant answers questions using:

- verified venue information
- active operational alerts
- approved staff reports
- configured facility data
- route information

Each response can include:

- answer
- source
- reason
- recommended action
- last updated time

### Multilingual Assistance

The system is designed to support:

- multilingual fan questions
- translation of staff reports
- translated operational alerts
- route explanations
- accessible communication

Static interface labels can be handled through local translation dictionaries, while dynamic operational content can be translated using AI.

### Smart Navigation

The route system supports:

- fastest route
- least-crowded route
- wheelchair-accessible route
- family-friendly route
- emergency exit route

Navigation recommendations use a stored graph of venue nodes and connections.

Verified alerts can:

- increase crowd weights
- block affected paths
- redirect users
- update route recommendations

### Operational Alerts

Alert categories include:

- crowd congestion
- gate updates
- transport
- medical incidents
- accessibility issues
- emergency information
- facility issues

Staff-generated alerts remain pending until approved by an authorized role.

### Accessibility

Accessibility features include:

- font-size controls
- high-contrast mode
- accessible route preferences
- wheelchair-friendly navigation
- voice-assistance support
- text-to-speech support
- reduced-motion compatibility
- screen-reader-friendly controls

### Matchday Quick Actions

Fans can quickly access:

- seat navigation
- accessible restrooms
- food facilities
- water and beverage points
- medical help
- transport exits

### Transport and Exit Planning

The platform can assist users with:

- nearest exits
- metro connections
- shuttle routes
- crowd-aware exit recommendations
- walking directions
- public transport guidance

---

## System Architecture

```text
┌───────────────────────────────────────────────────┐
│                    USERS                          │
│ Fan | Volunteer | Staff | Organizer              │
└──────────────────────┬────────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────────┐
│               REACT FRONTEND                      │
│ Dashboards | Navigation | Alerts | AI Assistant  │
└──────────────────────┬────────────────────────────┘
                       │ REST API
                       ▼
┌───────────────────────────────────────────────────┐
│            NODE.JS + EXPRESS BACKEND              │
│ Auth | Reports | Alerts | Routes | AI Services   │
└───────────┬────────────────┬──────────────────────┘
            │                │
            ▼                ▼
┌───────────────────┐   ┌───────────────────────────┐
│ Firebase          │   │ GenAI Layer               │
│ Auth + Firestore  │   │ Gemini → Groq Fallback   │
└───────────────────┘   └───────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────┐
│ VERIFIED VENUE DATA + APPROVED OPERATIONAL DATA   │
└───────────────────────────────────────────────────┘
```

---

## AI Request Flow

```text
User question
      ↓
Normalize the question
      ↓
Check cached responses
      ↓
Retrieve verified venue information
      ↓
Retrieve active approved operational alerts
      ↓
Is verified context available?
      ↓
Yes → Gemini
      ↓
Gemini unavailable?
      ↓
Groq fallback using the same verified context
      ↓
Return answer + source + action

No verified context
      ↓
Return safe no-information response
```

The Groq fallback must use the same context and grounding instructions as Gemini.

---

## Incident-to-Alert Workflow

```text
Staff submits report
        ↓
Original report is stored
        ↓
Language is detected
        ↓
AI translates and summarizes the report
        ↓
AI creates a fan-facing alert draft
        ↓
Status: pending approval
        ↓
Authorized staff or organizer reviews it
        ↓
Approved alert becomes active
        ↓
Affected fans receive the update
        ↓
Route engine recalculates affected routes
```

AI drafts alerts, but it does not independently publish them.

---

## Route Engine

The route engine uses graph-based routing.

### Example nodes

```text
Gate A
Gate B
Gate D
Concourse East
Section 214
Restroom R2
Medical Desk
Food Court
Water Station
Metro Exit 3
```

### Edge information

Each path may include:

```js
{
  from: "Gate D",
  to: "Concourse East",
  distance: 120,
  accessible: true,
  crowdWeight: 1,
  blocked: false
}
```

The system can use a shortest-path algorithm such as Dijkstra's algorithm to determine an appropriate route.

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Firebase Client SDK
- Leaflet
- React Leaflet
- OpenStreetMap
- Lucide React

### Backend

- Node.js
- Express
- Firebase Admin SDK
- Axios
- CORS
- dotenv

### AI

- Google Gemini as the primary provider
- Groq as a fallback provider
- grounded context prompts
- translation service
- response caching

### Database and Authentication

- Firebase Authentication
- Cloud Firestore
- Firebase Admin SDK

### Deployment

- Vercel for the frontend
- Render for the backend
- Firebase for authentication and database services

### Development

- Google Antigravity
- VS Code
- Git
- GitHub

---

## Project Structure

```text
Stadium-Pulse/
│
├── frontend/
│   ├── public/
│   │   ├── leaflet/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AIMessage.jsx
│   │   │   ├── AccessibilityToggle.jsx
│   │   │   ├── AlertCard.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── FeatureCard.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── RouteCard.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SourceBadge.jsx
│   │   │   └── StatusBadge.jsx
│   │   │
│   │   ├── config/
│   │   │   └── firebase.js
│   │   │
│   │   ├── context/
│   │   │   ├── AccessibilityContext.jsx
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AIAssistantPage.jsx
│   │   │   ├── AccessibilityPage.jsx
│   │   │   ├── AdminVenuePage.jsx
│   │   │   ├── AlertApprovalPage.jsx
│   │   │   ├── CommandCenterPage.jsx
│   │   │   ├── FanHomePage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LiveAlertsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── SmartNavigationPage.jsx
│   │   │   ├── StaffDashboardPage.jsx
│   │   │   ├── StaffReportPage.jsx
│   │   │   ├── TellProblemPage.jsx
│   │   │   └── TransportPlannerPage.jsx
│   │   │
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── useTranslation.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebaseAdmin.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── aiRoutes.js
│   │   │   ├── alertRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── routeRoutes.js
│   │   │   └── venueRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── cacheService.js
│   │   │   ├── routeEngine.js
│   │   │   ├── translationService.js
│   │   │   └── venueDataService.js
│   │   │
│   │   └── utils/
│   │       ├── normalizeQuestion.js
│   │       └── sourceFormatter.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── .gitignore
├── Project_rules.md
├── First plan
└── README.md
```

---

## Getting Started

### Prerequisites

Install:

- Node.js 20 or later
- npm
- Git
- Firebase project
- Gemini API key
- Groq API key

---

## Clone the Repository

```bash
git clone https://github.com/chandanadeyyala-crypto/Stadium-Pulse.git
cd Stadium-Pulse
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

Use:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

Build the frontend:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Backend Setup

Open another terminal:

```bash
cd backend
npm install
```

Create:

```text
backend/.env
```

Use:

```env
NODE_ENV=development
PORT=5000
DEMO_MODE=false

ALLOWED_ORIGIN=http://localhost:5173

GEMINI_API_KEY=
GROQ_API_KEY=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Start the backend:

```bash
npm start
```

For development with Nodemon:

```bash
npm run dev
```

The backend normally runs at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

---

## Firebase Setup

### Frontend Authentication

In Firebase Console:

```text
Build
→ Authentication
→ Sign-in method
```

Enable the authentication providers required by the application:

- Google
- Email/Password
- Anonymous, if temporary guest access is retained

Add authorized domains:

```text
localhost
127.0.0.1
your-vercel-domain.vercel.app
```

### Firebase Admin

Generate a service-account key from:

```text
Firebase Console
→ Project settings
→ Service accounts
→ Generate new private key
```

Do not commit the downloaded JSON key.

Copy these three values into the backend environment variables:

```text
project_id      → FIREBASE_PROJECT_ID
client_email    → FIREBASE_CLIENT_EMAIL
private_key     → FIREBASE_PRIVATE_KEY
```

The backend converts escaped newlines using:

```js
privateKey.replace(/\\n/g, '\n');
```

### Security

Never commit:

```text
.env
service-account JSON files
Firebase private keys
Gemini API keys
Groq API keys
```

---

## API Endpoints

### Health

```http
GET /
GET /health
```

### Venue

```http
GET /api/venue
GET /api/venue/gates
GET /api/venue/facilities
GET /api/venue/routes
```

### AI

```http
POST /api/ai/ask
POST /api/ai/translate
```

### Staff Reports

```http
POST /api/reports
GET /api/reports
```

### Alerts

```http
GET /api/alerts
POST /api/alerts/approve
```

### Route Recommendation

```http
POST /api/routes/recommend
```

---

## Example AI Request

```json
{
  "question": "Which entrance should I use?",
  "language": "English",
  "role": "fan",
  "stadiumId": "sample-venue",
  "location": "Gate B"
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "answer": "Gate B currently has higher crowd density. Use Gate D.",
    "reason": "A verified operational alert affects Gate B.",
    "recommendation": "Open navigation to Gate D."
  },
  "meta": {
    "generatedByAI": true,
    "sources": [
      {
        "type": "verified_alert",
        "label": "Venue operations update"
      }
    ]
  }
}
```

---

## Example Safety Prompt

```text
You are StadiumPulse AI.

Only answer using the verified context supplied to you.

Do not invent stadium facts, gate locations, route conditions, queue times,
facility availability, transport schedules or operational alerts.

If the supplied context does not contain the answer, respond:

"I do not have verified information for that right now."

Separate verified facts from recommendations.

Every operational answer should contain:
- answer
- source
- reason
- recommended action
```

---

## Original Antigravity Master Prompt

The following specification was used to guide the initial project generation and architecture:

```text
Build a full-stack project called StadiumPulse AI.

It is a GenAI-powered stadium operations and fan assistance platform for
FIFA World Cup 2026.

CORE PRINCIPLE:

Verified venue data + approved operational reports
→ AI explanation, translation or recommendation
→ user

AI must never invent stadium facts.

Create a clean monorepo with separate frontend and backend folders.

FRONTEND:

Use React, Vite, Tailwind CSS, React Router, Firebase, Leaflet and
OpenStreetMap.

Create experiences for:

- Landing
- Authentication and role selection
- Fan dashboard
- AI assistant
- Smart navigation
- Live alerts
- Accessibility center
- Transport and exit planning
- Staff dashboard
- Incident reporting
- Alert approval
- Organizer command center
- Venue management
- Settings

BACKEND:

Use Node.js, Express, Firebase Admin, dotenv, CORS and Axios.

Create services for:

- grounded AI assistance
- Gemini primary provider
- Groq fallback
- translation
- caching
- venue data
- graph-based routing
- staff reports
- approved operational alerts
- role-based authorization

AI FLOW:

Normalize question
→ retrieve verified context
→ check cache
→ Gemini
→ Groq fallback using the same verified context
→ approved cache
→ no-information response

INCIDENT FLOW:

Staff report
→ store original language
→ translate and summarize
→ generate alert draft
→ pending approval
→ authorized approval
→ publish alert
→ update affected routes

SECURITY:

- Never expose API keys in frontend code.
- Never commit .env files.
- Never commit Firebase service-account files.
- Verify Firebase ID tokens on the backend.
- Enforce role permissions.
- Validate API inputs.
- Add safe error handling.
- Use environment variables for every credential.

Do not create a single-file application.
Do not mix frontend and backend code.
Do not make fake live claims.
Do not replace real implementation with mock success responses.
Add clear comments where manual configuration is needed.
```

---

## Development Journey

The project was built in several stages.

### Planning

The initial phase focused on:

- understanding stadium users
- identifying fan and staff problems
- defining GenAI use cases
- selecting compatible free-tier technologies
- designing a grounded AI architecture
- planning role-based user experiences

### Frontend Generation

The application was initially scaffolded with:

- React
- Vite
- Tailwind CSS
- React Router
- reusable components
- fan and operations pages
- responsive navigation

### Backend Development

The backend was structured with:

- Express routes
- Firebase Admin
- AI provider services
- route-engine logic
- translation services
- alert and report workflows
- environment configuration

### Tailwind and Vite 

The working setup uses:

- `tailwindcss`
- `@tailwindcss/postcss`
- Vite
- a valid PostCSS configuration

### Firebase Integration

Firebase was configured for:

- frontend authentication
- backend Admin SDK access
- Firestore
- role-aware sessions


### Deployment

The application was deployed using:

```text
Frontend → Vercel
Backend → Render
Authentication and database → Firebase
AI → Gemini and Groq
Source code → GitHub
```

### Production Fixes

Deployment required fixes for:

- Vercel root directory
- ignored `package.json` files
- Vite build configuration
- Render environment variables
- backend health routes
- CORS configuration
- SPA route rewrites
- Leaflet production image paths
- Firebase authorized domains

---

## Deployment

### Vercel Frontend

Recommended settings:

```text
Root Directory: frontend
Framework: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Production environment variable:

```env
VITE_BACKEND_URL=https://your-render-service.onrender.com
```

The repository includes `frontend/vercel.json` to support React Router deep links.

Example:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Render Backend

Recommended settings:

```text
Service Type: Web Service
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Required environment variables:

```env
NODE_ENV=production
DEMO_MODE=false

ALLOWED_ORIGIN=https://your-vercel-domain.vercel.app

GEMINI_API_KEY=
GROQ_API_KEY=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

The server listens using:

```js
const PORT = process.env.PORT || 5000;
```

---

## Known Limitations

The current version may still have prototype limitations:

- operational information depends on configured venue data and authorized reports
- indoor route visualization uses a simplified venue graph
- free hosting may introduce backend cold-start delays
- food and beverage data requires configured venue facilities
- browser speech features depend on browser support
- production notification delivery requires additional push-notification setup
- real sensor, CCTV and official transport feeds are not connected in the prototype

The interface should never present unsupported data as real-time official FIFA information.

---

## Future Improvements

- official venue-data integration
- live transport-feed support
- crowd-sensor integration
- computer-vision crowd estimation
- push notifications
- expanded food and facility directory
- offline emergency information
- multilingual voice assistant
- indoor floor-plan overlays
- predictive crowd analytics
- volunteer task assignment
- venue-specific configurations
- audit-history visualization
- advanced operational analytics

---

## Testing

Backend tests:

```bash
cd backend
npm test
```

Frontend production build:

```bash
cd frontend
npm run build
```

Recommended manual testing:

- landing page
- role selection
- fan dashboard
- staff dashboard
- command center
- AI assistant
- alerts
- navigation
- accessibility
- mobile responsiveness
- direct page links
- backend health
- authentication
- CORS
- production environment variables

---

## Hackathon

Built for:

```text
PromptWars Virtual
Challenge 4: Smart Stadiums & Tournament Operations
```

The project explores how Generative AI can improve:

- stadium navigation
- accessibility
- multilingual assistance
- crowd management
- transportation
- operational intelligence
- real-time decision support

---

## Author

**Chandana Sravya Sri D**

GitHub: [chandanadeyyala-crypto](https://github.com/chandanadeyyala-crypto)

---

## Disclaimer

StadiumPulse AI is a hackathon prototype.

It is not an official FIFA product and is not affiliated with FIFA.

Any sample venue, match, facility or operational information used in the
prototype is for demonstration and testing purposes unless explicitly
identified as an official configured source.
