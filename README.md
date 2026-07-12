# StadiumPulse AI 

**StadiumPulse AI** is a GenAI-powered stadium operations and fan assistance platform designed for the FIFA World Cup 2026. It is built to ensure a safe, efficient, and accessible environment for fans, volunteers, staff, and organizers.

---

## Core Principle: Grounded Trust (Anti-Hallucination)
To ensure safety and reliability in crowded stadiums, **AI must never invent facts**. StadiumPulse AI enforces this strict workflow across all AI interfaces:

If verified information is missing for a specific section, gate, or incident, the AI will strictly respond with:
> **"I don’t have verified information for that right now."**

---

## Problem Statement
Large-scale stadium events like the FIFA World Cup 2026 present complex crowd logistics, language barriers, and accessibility challenges. Standard GPS navigation doesn't work well indoors, static signs can't adapt to gate closures, and generic AI assistants can hallucinate routes or security protocols, leading to crowd management risks or safety issues.

## Solution Overview
StadiumPulse AI bridges this gap by marrying a verified graph-based venue database and live staff reports with Gemini and Groq AI translation and reasoning. It provides dynamic navigation updates (e.g., wheelchair-accessible or least-crowded routing), instant multilingual alert broadcasts, and an AI-driven command center for incident response.

---

## Key Features
### 1. For Fans
*   **Dynamic Fan Dashboard**: Displays ticket information, seat assignments, gate queue density, and recommended routes.
*   **RAG AI Assistant**: Multi-language assistance with clickable reference sources. Supports Web Speech API for voice assistance and Text-to-Speech (TTS).
*   **Smart Routing Map**: Visualizes the stadium using Leaflet + OpenStreetMap. Computes shortest path, least-crowded path, wheelchair-accessible path, family-friendly path, and emergency exit routes.
*   **Accessibility Center**: Realtime font scaling, high-contrast theme, voice input settings, and locator for elevators, quiet zones, and medical booths.
*   **Egress / Transport Planner**: Post-match egress guidance showing nearest public transport congestion and sustainability alternatives.

### 2. For Staff & Volunteers
*   **Command Center Dashboard**: Live incident tracking, crowd heatmap metrics, and task assignments.
*   **Multilingual Incident Reporting**: Staff can type/record reports in any language. The AI translates it, summarizes the incident in English, and drafts a public fan alert.
*   **Alert Approval Panel**: Organizers review, edit, and translate AI-drafted alerts before sending them live to fans.

---

## Technical Stack
*   **Frontend**: React (Vite), Tailwind CSS, React Router, Leaflet, Lucide Icons, Web Speech API.
*   **Backend**: Node.js, Express, dotenv, CORS.
*   **GenAI / LLMs**: Gemini Flash (primary) + Groq (Llama fallback).
*   **Database & Auth**: Firebase client SDK placeholder (front-end) and Firebase Admin SDK setup (back-end).

---

## Project Structure
```
/stadium-pulse-ai
  /frontend     - React client (Vite, Tailwind, Leaflet)
  /backend      - Node.js API server (Express, AI fallbacks, Routing engine)
  README.md
  .gitignore
```

---

## Setup & Running Guide

### Prerequisites
*   Node.js (v18 or higher recommended)
*   NPM (v9 or higher)

### Installation
1. Clone this repository and navigate to the project directory:
   ```bash
   cd stadium-pulse-ai
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Add your GEMINI_API_KEY and GROQ_API_KEY to backend/.env
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

### Demo Mode
For rapid testing and evaluation without setting up full Firebase production accounts:
- Set `DEMO_MODE=true` in `backend/.env`. This enables mock role verification and credential-free operations.
- The UI contains buttons like **"Demo Fan"**, **"Demo Staff"**, and **"Demo Organizer"** 
