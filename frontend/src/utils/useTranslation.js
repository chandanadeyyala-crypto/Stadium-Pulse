import { useState, useEffect, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import axios from 'axios';

// ─── Global shared state ────────────────────────────────────────────────────
// Module-level translation cache — shared across every hook instance
const translationCache = {};
// Set of text strings currently being fetched — avoids duplicate requests
const pendingRequests = new Set();

const localTranslations = {
  Spanish: {
    // ── Core UI ───────────────────────────────────────────────────
    "Stadium": "Estadio", "Intelligence": "Inteligencia",
    "Sign In": "Iniciar sesión", "Explore Demo": "Explorar Demo",
    "or": "o", "Back": "Atrás",
    "Fan": "Aficionado", "Staff": "Personal", "Organizer": "Organizador",
    // ── Landing Page ─────────────────────────────────────────────
    "Verified navigation": "Navegación verificada",
    "Multilingual alerts": "Alertas multilingües",
    "Crowd-aware routing": "Ruta inteligente",
    "AI-powered navigation, multilingual chat, and crowd-aware routing — for fans, staff and command centers.": "Navegación con IA, chat multilingüe y rutas: para aficionados, personal y centros de comando.",
    "Try the platform — choose a role": "Prueba la plataforma: elige un rol",
    "Navigate, query AI, access your seat route.": "Navega, consulta la IA y accede a tu ruta de asiento.",
    "Report incidents, approve alert drafts.": "Informa de incidentes y aprueba borradores de alertas.",
    "Crowd maps, broadcast control, analytics.": "Mapas de multitudes, control de transmisiones y análisis.",
    "Verified Assistance Active": "Antialucinación activa",
    "Gemini Flash & Groq pipeline": "Pipeline Gemini Flash & Groq",
    "OpenStreetMap navigation": "Navegación OpenStreetMap",
    "© FIFA World Cup 2026 Operations Prototype. Sandbox mode.": "© Prototipo FIFA 2026. Modo sandbox.",
    "Smart Routing": "Ruta inteligente", "AI Translation": "Traducción IA",
    "Accessibility": "Accesibilidad", "Verified Assistance": "Anti-alucinación",
    // ── Login Page ───────────────────────────────────────────────
    "Email Address": "Correo electrónico", "Password": "Contraseña",
    "Sign In with Email": "Iniciar sesión con correo",
    "Sign In with Google": "Iniciar sesión con Google",
    "Demo Fan": "Demo Fan", "Demo Staff": "Demo Personal", "Demo Organizer": "Demo Organizador",
    "FIFA WC 2026 Authentication Gateway": "Pasarela de autenticación FIFA 2026",
    "Rapid Sandbox Entrance (Bypass Login)": "Acceso rápido sandbox",
    "Toggle High Contrast": "Alternar alto contraste",
    "Adjust Text Scale": "Ajustar escala de texto",
    "Change Language": "Cambiar idioma",
    // ── Fan Home Page ─────────────────────────────────────────────
    "Welcome back,": "Bienvenido,",
    "Let's guide you to your seat safely. All details are grounded in verified venue registers.": "Te guiaremos a tu asiento de forma segura.",
    "Matchday Status:": "Estado del día de partido:",
    "Gates Active": "Puertas activas",
    "Your Digital Match Ticket": "Tu entrada digital",
    "MATCH 48": "PARTIDO 48",
    "Brazil vs Germany": "Brasil vs Alemania",
    "July 8, 2026 · 7:30 PM Kickoff": "8 de julio de 2026 · 19:30 inicio",
    "StadiumPulse Arena · Sec 214": "Arena StadiumPulse · Sec 214",
    "Gate": "Puerta", "Section": "Sección", "Seat": "Asiento", "Row 6, #14": "Fila 6, #14",
    "Live Stadium Status": "Estado del estadio en vivo",
    "Gate B (Your Entrance)": "Puerta B (Tu entrada)", "Heavy Queue": "Cola pesada",
    "Gate D (Alternative)": "Puerta D (Alternativa)", "Very Low Queue": "Cola muy baja",
    "Restroom R2 (Accessible)": "Baño R2 (Accesible)", "5 min queue": "Cola de 5 min",
    "Metro Exit 3 Transit Hub": "Hub de Tránsito Salida 3 del Metro", "Flow Normal": "Flujo normal",
    "* Status checks are refreshed every 15s from verified staff reports.": "* Estado actualizado cada 15s.",
    "Quick Actions": "Acciones rápidas",
    "Find Seat 214": "Encontrar asiento 214",
    "Accessible Toilet": "Baño accesible",
    "Medical Desk": "Puesto médico",
    "Less Busy Exit": "Salida menos concurrida",
    "Recommended Route Suggestion": "Ruta recomendada",
    "Gate B is currently crowded. Based on the stadium graph, the system suggests entering via": "La puerta B está concurrida. El sistema sugiere entrar por",
    "Gate D": "Puerta D",
    "and walking via": "y caminar por",
    "Concourse East": "Pasillo Este",
    "to bypass the queues at the South gates.": "para evitar las colas en las puertas sur.",
    "Open Interactive Map": "Abrir mapa interactivo",
    "Transit Exit Planner": "Planificador de salida de tránsito",
    "Live Broadcast Warnings": "Avisos de transmisión en vivo",
    "View All Alerts": "Ver todas las alertas",
    "Retrieving live safety feeds...": "Obteniendo datos de seguridad en vivo...",
    "No active emergency alerts currently posted for this zone.": "No hay alertas de emergencia activas en esta zona.",
    "Accessibility & Guidance Controls": "Controles de accesibilidad",
    "Scale fonts, swap contrast themes, and configure wheelchair-accessible route paths.": "Escala fuentes, cambia temas de contraste y configura rutas accesibles.",
    "Open Center": "Abrir centro",
    // ── AI Assistant Page ────────────────────────────────────────
    "StadiumPulse Assistant": "Asistente StadiumPulse",
    "Grounded RAG Bot": "Bot RAG verificado",
    "Consulting verified stadium logs...": "Consultando registros verificados...",
    "Suggested Verified Queries": "Consultas verificadas sugeridas",
    "Listening... Speak clearly": "Escuchando... Habla claramente",
    "Ask StadiumPulse AI in English...": "Pregunta a StadiumPulse AI en Español...",
    "Ask StadiumPulse AI in Spanish...": "Pregunta a StadiumPulse AI en Español...",
    "Ask StadiumPulse AI in French...": "Pregunta a StadiumPulse AI en Español...",
    // ── Staff Dashboard ───────────────────────────────────────────
    "Operations Dashboard": "Panel de operaciones",
    "Venue staff command center": "Centro de mando del personal",
    "File Incident Report": "Registrar informe de incidente",
    "Review Pending Alerts": "Revisar alertas pendientes",
    "Active Incidents": "Incidentes activos",
    "Congested Gates": "Puertas congestionadas",
    "Live Broadcasts": "Transmisiones en vivo",
    "Active Personnel": "Personal activo",
    "AI Operations Command Panel": "Panel de mando de operaciones IA",
    "Gemini Grounded Decision Assistant": "Asistente de decisiones Gemini",
    "Active Logs & Reports": "Registros e informes activos",
    "No active incidents filed.": "No hay incidentes activos.",
    "Volunteer Assignments": "Asignaciones de voluntarios",
    "Gate Congestion Heat": "Calor de congestión de puertas",
    // ── Query Page ───────────────────────────────────────────────
    "Tell Your Problem": "Cuéntanos tu problema", "Query": "Consulta",
    "Describe Your Issue": "Describe tu problema",
    "Speaking/Writing In": "Hablando/Escribiendo en",
    "Translate To": "Traducir a",
    "Type your problem or click the microphone to speak...": "Escribe tu problema o habla...",
    "Stop Recording": "Detener grabación",
    "Speak in selected language": "Hablar en idioma seleccionado",
    "Clear Text": "Limpiar texto", "Translate Issue": "Traducir problema",
    "Translating...": "Traduciendo...", "Translation Results": "Resultados de traducción",
    "Translation to English": "Traducción al inglés", "Translation to": "Traducción al",
    "Speak Translation": "Hablar traducción",
    "Translations to English will appear here...": "Las traducciones al inglés aparecerán aquí...",
    "Translations to target language will appear here...": "Las traducciones al idioma destino aparecerán aquí...",
    "Grounded translation pipelines active": "Canalizaciones de traducción activas"
  },

  French: {
    // ── Core UI ───────────────────────────────────────────────────
    "Stadium": "Stade", "Intelligence": "Intelligence",
    "Sign In": "Se connecter", "Explore Demo": "Explorer la démo",
    "or": "ou", "Back": "Retour",
    "Fan": "Fan", "Staff": "Personnel", "Organizer": "Organisateur",
    // ── Landing Page ─────────────────────────────────────────────
    "Verified navigation": "Navigation vérifiée",
    "Multilingual alerts": "Alertes multilingues",
    "Crowd-aware routing": "Itinéraire intelligent",
    "AI-powered navigation, multilingual chat, and crowd-aware routing — for fans, staff and command centers.": "Navigation IA, chat multilingue et itinéraire intelligent.",
    "Try the platform — choose a role": "Essayez la plateforme - choisissez un rôle",
    "Navigate, query AI, access your seat route.": "Naviguer, interroger l'IA, accéder à l'itinéraire.",
    "Report incidents, approve alert drafts.": "Signaler les incidents, approuver les alertes.",
    "Crowd maps, broadcast control, analytics.": "Cartes de foule, contrôle de diffusion, analyses.",
    "Verified Assistance Active": "Verified Assistance actif",
    "Gemini Flash & Groq pipeline": "Pipeline Gemini Flash & Groq",
    "OpenStreetMap navigation": "Navigation OpenStreetMap",
    "© FIFA World Cup 2026 Operations Prototype. Sandbox mode.": "© Prototype FIFA 2026. Mode sandbox.",
    "Smart Routing": "Routage intelligent", "AI Translation": "Traduction IA",
    "Accessibility": "Accessibilité", "Verified Assistance": "Verified Assistance",
    // ── Login Page ───────────────────────────────────────────────
    "Email Address": "Adresse e-mail", "Password": "Mot de passe",
    "Sign In with Email": "Se connecter avec l'e-mail",
    "Sign In with Google": "Se connecter avec Google",
    "Demo Fan": "Démo Fan", "Demo Staff": "Démo Personnel", "Demo Organizer": "Démo Organisateur",
    "FIFA WC 2026 Authentication Gateway": "Passerelle d'authentification FIFA 2026",
    "Rapid Sandbox Entrance (Bypass Login)": "Accès rapide sandbox",
    "Toggle High Contrast": "Basculer contraste élevé",
    "Adjust Text Scale": "Ajuster la taille du texte",
    "Change Language": "Changer de langue",
    // ── Fan Home Page ─────────────────────────────────────────────
    "Welcome back,": "Bon retour,",
    "Let's guide you to your seat safely. All details are grounded in verified venue registers.": "Nous vous guiderons vers votre siège en toute sécurité.",
    "Matchday Status:": "Statut du jour de match :",
    "Gates Active": "Portes actives",
    "Your Digital Match Ticket": "Votre billet numérique",
    "MATCH 48": "MATCH 48",
    "Brazil vs Germany": "Brésil vs Allemagne",
    "July 8, 2026 · 7:30 PM Kickoff": "8 juillet 2026 · 19h30 coup d'envoi",
    "StadiumPulse Arena · Sec 214": "Arena StadiumPulse · Sec 214",
    "Gate": "Porte", "Section": "Section", "Seat": "Siège", "Row 6, #14": "Rangée 6, #14",
    "Live Stadium Status": "Statut du stade en direct",
    "Gate B (Your Entrance)": "Porte B (Votre entrée)", "Heavy Queue": "File d'attente dense",
    "Gate D (Alternative)": "Porte D (Alternative)", "Very Low Queue": "File très courte",
    "Restroom R2 (Accessible)": "Toilettes R2 (Accessible)", "5 min queue": "File de 5 min",
    "Metro Exit 3 Transit Hub": "Hub transit Sortie Métro 3", "Flow Normal": "Flux normal",
    "* Status checks are refreshed every 15s from verified staff reports.": "* Statut mis à jour toutes les 15s.",
    "Quick Actions": "Actions rapides",
    "Find Seat 214": "Trouver siège 214",
    "Accessible Toilet": "Toilettes accessibles",
    "Medical Desk": "Bureau médical",
    "Less Busy Exit": "Sortie moins chargée",
    "Recommended Route Suggestion": "Suggestion d'itinéraire recommandé",
    "Gate B is currently crowded. Based on the stadium graph, the system suggests entering via": "La porte B est bondée. Le système suggère d'entrer par",
    "Gate D": "Porte D",
    "and walking via": "et de marcher par",
    "Concourse East": "Couloir Est",
    "to bypass the queues at the South gates.": "pour éviter les files aux portes sud.",
    "Open Interactive Map": "Ouvrir la carte interactive",
    "Transit Exit Planner": "Planificateur de sortie",
    "Live Broadcast Warnings": "Avertissements diffusés en direct",
    "View All Alerts": "Voir toutes les alertes",
    "Retrieving live safety feeds...": "Récupération des données de sécurité...",
    "No active emergency alerts currently posted for this zone.": "Aucune alerte d'urgence active dans cette zone.",
    "Accessibility & Guidance Controls": "Contrôles d'accessibilité",
    "Scale fonts, swap contrast themes, and configure wheelchair-accessible route paths.": "Adaptez la police, les thèmes et les itinéraires accessibles.",
    "Open Center": "Ouvrir le centre",
    // ── AI Assistant Page ────────────────────────────────────────
    "StadiumPulse Assistant": "Assistant StadiumPulse",
    "Grounded RAG Bot": "Bot RAG vérifiée",
    "Consulting verified stadium logs...": "Consultation des journaux vérifiés...",
    "Suggested Verified Queries": "Requêtes vérifiées suggérées",
    "Listening... Speak clearly": "Écoute... Parlez clairement",
    "Ask StadiumPulse AI in English...": "Interrogez StadiumPulse en Français...",
    // ── Staff Dashboard ───────────────────────────────────────────
    "Operations Dashboard": "Tableau de bord opérations",
    "Venue staff command center": "Centre de commandement du personnel",
    "File Incident Report": "Déposer un rapport d'incident",
    "Review Pending Alerts": "Examiner les alertes en attente",
    "Active Incidents": "Incidents actifs",
    "Congested Gates": "Portes congestionnées",
    "Live Broadcasts": "Diffusions en direct",
    "Active Personnel": "Personnel actif",
    "AI Operations Command Panel": "Panneau de commandement IA",
    "Gemini Grounded Decision Assistant": "Assistant décisionnel Gemini",
    "Active Logs & Reports": "Journaux et rapports actifs",
    "No active incidents filed.": "Aucun incident actif.",
    "Volunteer Assignments": "Affectations des bénévoles",
    "Gate Congestion Heat": "Chaleur de congestion des portes",
    // ── Query Page ───────────────────────────────────────────────
    "Tell Your Problem": "Signaler un problème", "Query": "Requête",
    "Describe Your Issue": "Décrivez votre problème",
    "Speaking/Writing In": "S'exprime en", "Translate To": "Traduire vers",
    "Type your problem or click the microphone to speak...": "Tapez ou parlez votre problème...",
    "Stop Recording": "Arrêter l'enregistrement",
    "Speak in selected language": "Parler dans la langue sélectionnée",
    "Clear Text": "Effacer le texte", "Translate Issue": "Traduire le problème",
    "Translating...": "Traduction...", "Translation Results": "Résultats de traduction",
    "Translation to English": "Traduction en anglais", "Translation to": "Traduction en",
    "Speak Translation": "Lire la traduction",
    "Translations to English will appear here...": "Les traductions en anglais apparaîtront ici...",
    "Translations to target language will appear here...": "Les traductions dans la langue cible apparaîtront ici...",
    "Grounded translation pipelines active": "Pipelines de traduction actifs"
  },

  German: {
    // ── Core UI ───────────────────────────────────────────────────
    "Stadium": "Stadion", "Intelligence": "Intelligenz",
    "Sign In": "Anmelden", "Explore Demo": "Demo erkunden",
    "or": "oder", "Back": "Zurück",
    "Fan": "Fan", "Staff": "Personal", "Organizer": "Organisator",
    // ── Landing Page ─────────────────────────────────────────────
    "Verified navigation": "Verifizierte Navigation",
    "Multilingual alerts": "Mehrsprachige Warnungen",
    "Crowd-aware routing": "Crowd-aware Routing",
    "Try the platform — choose a role": "Plattform ausprobieren – Rolle wählen",
    "Navigate, query AI, access your seat route.": "Navigieren, KI befragen, Sitzroute aufrufen.",
    "Report incidents, approve alert drafts.": "Vorfälle melden, Warnungen genehmigen.",
    "Crowd maps, broadcast control, analytics.": "Menschenmengenkarten, Sendekontrolle, Analysen.",
    "Verified Assistance Active": "Anti-Halluzination aktiv",
    "Smart Routing": "Intelligentes Routing", "AI Translation": "KI-Übersetzung",
    "Accessibility": "Barrierefreiheit", "Verified Assistance": "Anti-Halluzination",
    // ── Login Page ───────────────────────────────────────────────
    "Email Address": "E-Mail-Adresse", "Password": "Passwort",
    "Sign In with Email": "Mit E-Mail anmelden",
    "Sign In with Google": "Mit Google anmelden",
    "Demo Fan": "Demo Fan", "Demo Staff": "Demo Personal", "Demo Organizer": "Demo Organisator",
    "FIFA WC 2026 Authentication Gateway": "FIFA WM 2026 Authentifizierungsportal",
    "Rapid Sandbox Entrance (Bypass Login)": "Schneller Sandbox-Zugang",
    "Toggle High Contrast": "Hohen Kontrast umschalten",
    "Adjust Text Scale": "Textgröße anpassen",
    "Change Language": "Sprache ändern",
    // ── Fan Home Page ─────────────────────────────────────────────
    "Welcome back,": "Willkommen zurück,",
    "Let's guide you to your seat safely. All details are grounded in verified venue registers.": "Wir führen Sie sicher zu Ihrem Sitz.",
    "Matchday Status:": "Spieltagsstatus:",
    "Gates Active": "Tore aktiv",
    "Your Digital Match Ticket": "Ihr digitales Ticket",
    "MATCH 48": "SPIEL 48",
    "Brazil vs Germany": "Brasilien vs. Deutschland",
    "July 8, 2026 · 7:30 PM Kickoff": "8. Juli 2026 · 19:30 Anstoß",
    "Gate": "Tor", "Section": "Abschnitt", "Seat": "Sitz", "Row 6, #14": "Reihe 6, #14",
    "Live Stadium Status": "Live-Stadionzustand",
    "Gate B (Your Entrance)": "Tor B (Ihr Eingang)", "Heavy Queue": "Lange Warteschlange",
    "Gate D (Alternative)": "Tor D (Alternative)", "Very Low Queue": "Sehr kurze Warteschlange",
    "Restroom R2 (Accessible)": "Toilette R2 (Barrierefrei)", "5 min queue": "5 Min. Warteschlange",
    "Metro Exit 3 Transit Hub": "Metro-Ausgang 3 Transitknoten", "Flow Normal": "Normaler Fluss",
    "Quick Actions": "Schnellaktionen",
    "Find Seat 214": "Sitz 214 finden",
    "Accessible Toilet": "Barrierefreie Toilette",
    "Medical Desk": "Sanitätsposten",
    "Less Busy Exit": "Weniger belegter Ausgang",
    "Recommended Route Suggestion": "Empfohlene Routenvorschlag",
    "Open Interactive Map": "Interaktive Karte öffnen",
    "Transit Exit Planner": "Transit-Ausgangsplaner",
    "Live Broadcast Warnings": "Live-Sendewarnungen",
    "View All Alerts": "Alle Warnungen anzeigen",
    "Retrieving live safety feeds...": "Live-Sicherheitsdaten werden abgerufen...",
    "No active emergency alerts currently posted for this zone.": "Keine aktiven Notfallwarnungen in dieser Zone.",
    "Open Center": "Zentrum öffnen",
    // ── AI Assistant ─────────────────────────────────────────────
    "StadiumPulse Assistant": "StadiumPulse-Assistent",
    "Grounded RAG Bot": "Verifizierter RAG-Bot",
    "Consulting verified stadium logs...": "Verifizierte Stadionprotokolle werden abgerufen...",
    "Suggested Verified Queries": "Vorgeschlagene verifizierte Anfragen",
    "Listening... Speak clearly": "Höre zu... Bitte deutlich sprechen",
    // ── Staff Dashboard ───────────────────────────────────────────
    "Operations Dashboard": "Betriebsdashboard",
    "Venue staff command center": "Personalkommandozentrale",
    "File Incident Report": "Vorfall melden",
    "Review Pending Alerts": "Ausstehende Warnungen prüfen",
    "Active Incidents": "Aktive Vorfälle",
    "Congested Gates": "Überfüllte Tore",
    "Live Broadcasts": "Live-Sendungen",
    "Active Personnel": "Aktives Personal",
    "AI Operations Command Panel": "KI-Operationsbefehlspanel",
    "Gemini Grounded Decision Assistant": "Gemini-Entscheidungsassistent",
    "Active Logs & Reports": "Aktive Protokolle & Berichte",
    "No active incidents filed.": "Keine aktiven Vorfälle.",
    "Volunteer Assignments": "Freiwilligenzuweisungen",
    "Gate Congestion Heat": "Tor-Überfüllungshitze",
    // ── Query Page ───────────────────────────────────────────────
    "Tell Your Problem": "Problem melden", "Query": "Anfrage",
    "Describe Your Issue": "Beschreibe dein Problem",
    "Speaking/Writing In": "Sprechen/Schreiben in", "Translate To": "Übersetzen nach",
    "Type your problem or click the microphone to speak...": "Tippe oder sprich dein Problem...",
    "Stop Recording": "Aufnahme stoppen",
    "Speak in selected language": "In der gewählten Sprache sprechen",
    "Clear Text": "Text löschen", "Translate Issue": "Problem übersetzen",
    "Translating...": "Übersetze...", "Translation Results": "Übersetzungsergebnisse",
    "Translation to English": "Übersetzung auf Englisch", "Translation to": "Übersetzung nach",
    "Speak Translation": "Übersetzung vorlesen",
    "Translations to English will appear here...": "Englische Übersetzungen erscheinen hier...",
    "Translations to target language will appear here...": "Zielsprachliche Übersetzungen erscheinen hier...",
    "Grounded translation pipelines active": "Übersetzungspipelines aktiv"
  },

  Hindi: {
    // ── Core UI ───────────────────────────────────────────────────
    "Stadium": "स्टेडियम", "Intelligence": "इंटेलिजेंस",
    "Sign In": "साइन इन करें", "Explore Demo": "डेमो देखें",
    "or": "या", "Back": "वापस",
    "Fan": "प्रशंसक", "Staff": "कर्मचारी", "Organizer": "आयोजक",
    // ── Landing Page ─────────────────────────────────────────────
    "Verified navigation": "सत्यापित नेविगेशन",
    "Multilingual alerts": "बहुभाषी अलर्ट",
    "Crowd-aware routing": "भीड़-जागरूक रूटिंग",
    "Try the platform — choose a role": "प्लेटफ़ॉर्म आज़माएं — भूमिका चुनें",
    "Navigate, query AI, access your seat route.": "नेविगेट करें, AI से पूछें, सीट रूट देखें।",
    "Report incidents, approve alert drafts.": "घटनाओं की रिपोर्ट करें, अलर्ट ड्राफ्ट अनुमोदित करें।",
    "Crowd maps, broadcast control, analytics.": "भीड़ के नक्शे, प्रसारण नियंत्रण, विश्लेषण।",
    "Verified Assistance Active": "एंटी-हैल्युसिनेशन सक्रिय",
    "Smart Routing": "स्मार्ट रूटिंग", "AI Translation": "AI अनुवाद",
    "Accessibility": "पहुंच", "Verified Assistance": "एंटी-हैल्युसिनेशन",
    // ── Login Page ───────────────────────────────────────────────
    "Email Address": "ईमेल पता", "Password": "पासवर्ड",
    "Sign In with Email": "ईमेल से साइन इन करें",
    "Sign In with Google": "गूगल से साइन इन करें",
    "Demo Fan": "डेमो फैन", "Demo Staff": "डेमो स्टाफ", "Demo Organizer": "डेमो आयोजक",
    "FIFA WC 2026 Authentication Gateway": "FIFA WC 2026 प्रमाणीकरण गेटवे",
    "Rapid Sandbox Entrance (Bypass Login)": "त्वरित सैंडबॉक्स प्रवेश",
    "Toggle High Contrast": "उच्च कंट्रास्ट टॉगल करें",
    "Adjust Text Scale": "टेक्स्ट आकार समायोजित करें",
    "Change Language": "भाषा बदलें",
    // ── Fan Home Page ─────────────────────────────────────────────
    "Welcome back,": "स्वागत है,",
    "Let's guide you to your seat safely. All details are grounded in verified venue registers.": "हम आपको सुरक्षित रूप से आपकी सीट तक ले जाएंगे।",
    "Matchday Status:": "मैचडे स्थिति:",
    "Gates Active": "गेट सक्रिय हैं",
    "Your Digital Match Ticket": "आपका डिजिटल मैच टिकट",
    "MATCH 48": "मैच 48",
    "Brazil vs Germany": "ब्राज़ील बनाम जर्मनी",
    "July 8, 2026 · 7:30 PM Kickoff": "8 जुलाई 2026 · शाम 7:30 किकऑफ",
    "Gate": "गेट", "Section": "सेक्शन", "Seat": "सीट", "Row 6, #14": "पंक्ति 6, #14",
    "Live Stadium Status": "लाइव स्टेडियम स्थिति",
    "Gate B (Your Entrance)": "गेट बी (आपका प्रवेश)", "Heavy Queue": "भारी कतार",
    "Gate D (Alternative)": "गेट डी (वैकल्पिक)", "Very Low Queue": "बहुत कम कतार",
    "Restroom R2 (Accessible)": "शौचालय R2 (सुलभ)", "5 min queue": "5 मिनट की कतार",
    "Metro Exit 3 Transit Hub": "मेट्रो एग्जिट 3 ट्रांजिट हब", "Flow Normal": "प्रवाह सामान्य",
    "Quick Actions": "त्वरित कार्य",
    "Find Seat 214": "सीट 214 खोजें",
    "Accessible Toilet": "सुलभ शौचालय",
    "Medical Desk": "चिकित्सा डेस्क",
    "Less Busy Exit": "कम व्यस्त निकास",
    "Recommended Route Suggestion": "अनुशंसित मार्ग सुझाव",
    "Open Interactive Map": "इंटरैक्टिव मानचित्र खोलें",
    "Transit Exit Planner": "ट्रांजिट निकास योजनाकार",
    "Live Broadcast Warnings": "लाइव प्रसारण चेतावनियाँ",
    "View All Alerts": "सभी अलर्ट देखें",
    "Retrieving live safety feeds...": "लाइव सुरक्षा फ़ीड प्राप्त हो रही है...",
    "No active emergency alerts currently posted for this zone.": "इस क्षेत्र में कोई सक्रिय आपातकालीन अलर्ट नहीं है।",
    "Accessibility & Guidance Controls": "पहुंच और मार्गदर्शन नियंत्रण",
    "Open Center": "केंद्र खोलें",
    // ── AI Assistant ─────────────────────────────────────────────
    "StadiumPulse Assistant": "StadiumPulse सहायक",
    "Grounded RAG Bot": "सत्यापित RAG बॉट",
    "Consulting verified stadium logs...": "सत्यापित स्टेडियम लॉग की जाँच हो रही है...",
    "Suggested Verified Queries": "सुझाई गई सत्यापित क्वेरी",
    "Listening... Speak clearly": "सुन रहा है... स्पष्ट बोलें",
    // ── Staff Dashboard ───────────────────────────────────────────
    "Operations Dashboard": "संचालन डैशबोर्ड",
    "Venue staff command center": "स्थल कर्मचारी कमांड सेंटर",
    "File Incident Report": "घटना रिपोर्ट दर्ज करें",
    "Review Pending Alerts": "लंबित अलर्ट की समीक्षा करें",
    "Active Incidents": "सक्रिय घटनाएं",
    "Congested Gates": "भीड़ वाले गेट",
    "Live Broadcasts": "लाइव प्रसारण",
    "Active Personnel": "सक्रिय कर्मचारी",
    "AI Operations Command Panel": "AI संचालन कमांड पैनल",
    "Gemini Grounded Decision Assistant": "Gemini निर्णय सहायक",
    "Active Logs & Reports": "सक्रिय लॉग और रिपोर्ट",
    "No active incidents filed.": "कोई सक्रिय घटना दर्ज नहीं है।",
    "Volunteer Assignments": "स्वयंसेवक कार्य",
    "Gate Congestion Heat": "गेट भीड़ स्थिति",
    // ── Query Page ───────────────────────────────────────────────
    "Tell Your Problem": "अपनी समस्या बताएं", "Query": "प्रश्न",
    "Describe Your Issue": "अपनी समस्या बताएं",
    "Speaking/Writing In": "बोलने/लिखने में", "Translate To": "इसमें अनुवाद करें",
    "Type your problem or click the microphone to speak...": "अपनी समस्या टाइप करें या माइक पर बोलें...",
    "Stop Recording": "रिकॉर्डिंग बंद करें",
    "Speak in selected language": "चुनी हुई भाषा में बोलें",
    "Clear Text": "टेक्स्ट साफ़ करें", "Translate Issue": "समस्या का अनुवाद करें",
    "Translating...": "अनुवाद हो रहा है...", "Translation Results": "अनुवाद परिणाम",
    "Translation to English": "अंग्रेजी में अनुवाद", "Translation to": "में अनुवाद",
    "Speak Translation": "अनुवाद बोलें",
    "Translations to English will appear here...": "अंग्रेजी अनुवाद यहाँ दिखाई देंगे...",
    "Translations to target language will appear here...": "लक्ष्य भाषा में अनुवाद यहाँ दिखाई देंगे...",
    "Grounded translation pipelines active": "अनुवाद पाइपलाइन सक्रिय"
  },

  Telugu: {
    // ── Core UI ───────────────────────────────────────────────────
    "Stadium": "స్టేడియం", "Intelligence": "ఇంటెలిజెన్స్",
    "Sign In": "సైన్ ఇన్ చేయండి", "Explore Demo": "డెమోను అన్వేషించండి",
    "or": "లేదా", "Back": "వెనుకకు",
    "Fan": "అభిమాని", "Staff": "సిబ్బంది", "Organizer": "నిర్వాహకుడు",
    // ── Landing Page ─────────────────────────────────────────────
    "Verified navigation": "ధృవీకరించబడిన నావిగేషన్",
    "Multilingual alerts": "బహుభాషా హెచ్చరికలు",
    "Crowd-aware routing": "క్రౌడ్-అవేర్ రూటింగ్",
    "Try the platform — choose a role": "ప్లాట్‌ఫాం ప్రయత్నించండి — పాత్రను ఎంచుకోండి",
    "Navigate, query AI, access your seat route.": "నావిగేట్ చేయండి, AI ను అడగండి, సీటు మార్గం చూడండి.",
    "Report incidents, approve alert drafts.": "సంఘటనలు నివేదించండి, హెచ్చరికలు ఆమోదించండి.",
    "Crowd maps, broadcast control, analytics.": "జనసమూహ మ్యాప్‌లు, ప్రసార నియంత్రణ, విశ్లేషణ.",
    "Verified Assistance Active": "యాంటీ-హాల్యూసినేషన్ సక్రియం",
    "Smart Routing": "స్మార్ట్ రూటింగ్", "AI Translation": "AI అనువాదం",
    "Accessibility": "అందుబాటు", "Verified Assistance": "యాంటీ-హాల్యూసినేషన్",
    // ── Login Page ───────────────────────────────────────────────
    "Email Address": "ఈమెయిల్ చిరునామా", "Password": "పాస్‌వర్డ్",
    "Sign In with Email": "ఈమెయిల్ ద్వారా సైన్ ఇన్ చేయండి",
    "Sign In with Google": "గూగుల్ ద్వారా సైన్ ఇన్ చేయండి",
    "Demo Fan": "డెమో ఫ్యాన్", "Demo Staff": "డెమో స్టాఫ్", "Demo Organizer": "డెమో ఆర్గనైజర్",
    "FIFA WC 2026 Authentication Gateway": "FIFA WC 2026 ప్రమాణీకరణ గేట్‌వే",
    "Rapid Sandbox Entrance (Bypass Login)": "త్వరిత సాండ్‌బాక్స్ ప్రవేశం",
    "Toggle High Contrast": "హై కాంట్రాస్ట్ టాగుల్ చేయండి",
    "Adjust Text Scale": "టెక్స్ట్ స్కేల్ సర్దుబాటు చేయండి",
    "Change Language": "భాష మార్చండి",
    // ── Fan Home Page ─────────────────────────────────────────────
    "Welcome back,": "తిరిగి స్వాగతం,",
    "Let's guide you to your seat safely. All details are grounded in verified venue registers.": "మేము మిమ్మల్ని సురక్షితంగా మీ సీటుకు తీసుకెళ్తాం.",
    "Matchday Status:": "మ్యాచ్‌డే స్థితి:",
    "Gates Active": "గేట్లు సక్రియంగా ఉన్నాయి",
    "Your Digital Match Ticket": "మీ డిజిటల్ మ్యాచ్ టికెట్",
    "MATCH 48": "మ్యాచ్ 48",
    "Brazil vs Germany": "బ్రెజిల్ vs జర్మనీ",
    "July 8, 2026 · 7:30 PM Kickoff": "8 జులై 2026 · సాయంత్రం 7:30 కిక్‌ఆఫ్",
    "Gate": "గేట్", "Section": "సెక్షన్", "Seat": "సీటు", "Row 6, #14": "వరుస 6, #14",
    "Live Stadium Status": "లైవ్ స్టేడియం స్థితి",
    "Gate B (Your Entrance)": "గేట్ బి (మీ ప్రవేశం)", "Heavy Queue": "భారీ వరుస",
    "Gate D (Alternative)": "గేట్ డి (ప్రత్యామ్నాయం)", "Very Low Queue": "చాలా తక్కువ వరుస",
    "Restroom R2 (Accessible)": "టాయిలెట్ R2 (అందుబాటులో)", "5 min queue": "5 నిమి. వరుస",
    "Metro Exit 3 Transit Hub": "మెట్రో ఎగ్జిట్ 3 ట్రాన్సిట్ హబ్", "Flow Normal": "ప్రవాహం సాధారణం",
    "Quick Actions": "త్వరిత చర్యలు",
    "Find Seat 214": "సీటు 214 కనుగొనండి",
    "Accessible Toilet": "అందుబాటు టాయిలెట్",
    "Medical Desk": "వైద్య డెస్క్",
    "Less Busy Exit": "తక్కువ రద్దీ నిష్క్రమణ",
    "Recommended Route Suggestion": "సిఫారసు చేయబడిన మార్గం",
    "Open Interactive Map": "ఇంటరాక్టివ్ మ్యాప్ తెరవండి",
    "Transit Exit Planner": "ట్రాన్సిట్ ఎగ్జిట్ ప్లానర్",
    "Live Broadcast Warnings": "లైవ్ ప్రసార హెచ్చరికలు",
    "View All Alerts": "అన్ని హెచ్చరికలు చూడండి",
    "Retrieving live safety feeds...": "లైవ్ భద్రతా డేటా తీసుకుంటోంది...",
    "No active emergency alerts currently posted for this zone.": "ఈ జోన్‌లో యాక్టివ్ అత్యవసర హెచ్చరికలు లేవు.",
    "Accessibility & Guidance Controls": "యాక్సెస్ మరియు మార్గదర్శక నియంత్రణలు",
    "Open Center": "సెంటర్ తెరవండి",
    // ── AI Assistant ─────────────────────────────────────────────
    "StadiumPulse Assistant": "StadiumPulse సహాయకుడు",
    "Grounded RAG Bot": "ధృవీకరించబడిన RAG బాట్",
    "Consulting verified stadium logs...": "ధృవీకరించబడిన స్టేడియం లాగ్‌లను తనిఖీ చేస్తోంది...",
    "Suggested Verified Queries": "సూచించిన ధృవీకరించబడిన క్వెరీలు",
    "Listening... Speak clearly": "వింటున్నాను... స్పష్టంగా మాట్లాడండి",
    // ── Staff Dashboard ───────────────────────────────────────────
    "Operations Dashboard": "ఆపరేషన్స్ డాష్‌బోర్డ్",
    "Venue staff command center": "వేదిక సిబ్బంది కమాండ్ సెంటర్",
    "File Incident Report": "సంఘటన నివేదిక దాఖలు చేయండి",
    "Review Pending Alerts": "పెండింగ్ హెచ్చరికలు సమీక్షించండి",
    "Active Incidents": "క్రియాశీల సంఘటనలు",
    "Congested Gates": "రద్దీ గేట్లు",
    "Live Broadcasts": "లైవ్ ప్రసారాలు",
    "Active Personnel": "క్రియాశీల సిబ్బంది",
    "AI Operations Command Panel": "AI ఆపరేషన్స్ కమాండ్ పానెల్",
    "Gemini Grounded Decision Assistant": "Gemini నిర్ణయ సహాయకుడు",
    "Active Logs & Reports": "క్రియాశీల లాగ్‌లు & నివేదికలు",
    "No active incidents filed.": "క్రియాశీల సంఘటనలు లేవు.",
    "Volunteer Assignments": "వాలంటీర్ అసైన్‌మెంట్లు",
    "Gate Congestion Heat": "గేట్ రద్దీ వేడి",
    // ── Query Page ───────────────────────────────────────────────
    "Tell Your Problem": "మీ సమస్యను చెప్పండి", "Query": "విచారణ",
    "Describe Your Issue": "మీ సమస్యను వివరించండి",
    "Speaking/Writing In": "మాట్లాడటం/రాయడం", "Translate To": "అనువదించడానికి",
    "Type your problem or click the microphone to speak...": "మీ సమస్యను టైప్ చేయండి లేదా మైక్‌లో మాట్లాడండి...",
    "Stop Recording": "రికార్డింగ్ ఆపండి",
    "Speak in selected language": "ఎంచుకున్న భాషలో మాట్లాడండి",
    "Clear Text": "టెక్స్ట్ క్లియర్ చేయండి", "Translate Issue": "సమస్యను అనువదించండి",
    "Translating...": "అనువదిస్తోంది...", "Translation Results": "అనువాద ఫలితాలు",
    "Translation to English": "ఆంగ్లంలోకి అనువాదం", "Translation to": "కి అనువాదం",
    "Speak Translation": "అనువాదం చదవండి",
    "Translations to English will appear here...": "ఆంగ్ల అనువాదాలు ఇక్కడ కనిపిస్తాయి...",
    "Translations to target language will appear here...": "లక్ష్య భాషా అనువాదాలు ఇక్కడ కనిపిస్తాయి...",
    "Grounded translation pipelines active": "అనువాద పైప్‌లైన్‌లు సక్రియం"
  }
};


// Broadcast to all mounted useTranslation instances that cache updated
function notifyAll() {
  window.dispatchEvent(new CustomEvent('translation-updated'));
}

// Pre-load saved translations from localStorage for a given language
function warmCache(language) {
  if (!language || language === 'English') return;
  if (!translationCache[language]) {
    try {
      const stored = localStorage.getItem(`ui_translations_${language}`);
      translationCache[language] = stored ? JSON.parse(stored) : {};
    } catch {
      translationCache[language] = {};
    }
  }
}

// ─── Batch translation queue ─────────────────────────────────────────────────
// Collect strings for 80ms then send one batch request to the backend
let batchQueue = [];
let batchTimer = null;

function enqueueBatch(text, language) {
  if (!batchQueue.includes(text)) batchQueue.push(text);
  clearTimeout(batchTimer);
  batchTimer = setTimeout(() => flushBatch(language), 80);
}

async function flushBatch(language) {
  if (batchQueue.length === 0) return;
  const texts = [...batchQueue];
  batchQueue = [];

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Send all texts in one request if backend supports batch, else fire parallel individual requests
  const promises = texts.map(text =>
    axios.post(`${backendUrl}/api/ai/translate`, { text, targetLang: language }, { timeout: 6000 })
      .then(res => {
        if (res.data?.translatedText) {
          if (!translationCache[language]) translationCache[language] = {};
          translationCache[language][text] = res.data.translatedText;
          // Persist to localStorage
          try {
            localStorage.setItem(`ui_translations_${language}`, JSON.stringify(translationCache[language]));
          } catch { /* storage full — ignore */ }
        }
      })
      .catch(() => { /* translation failed — keep original */ })
      .finally(() => pendingRequests.delete(`${language}:${text}`))
  );

  await Promise.allSettled(promises);
  // Notify all components once after the whole batch is done
  notifyAll();
}

// Set of main headings to keep in English
const mainHeadings = new Set([
  "Operations Dashboard",
  "Venue staff command center",
  "AI Operations Command Panel",
  "Gemini Grounded Decision Assistant",
  "StadiumPulse Assistant",
  "Grounded RAG Bot",
  "Stadium",
  "Intelligence",
  "FIFA WC 2026 Authentication Gateway",
  "Smart Navigation",
  "AI Translation",
  "Accessibility",
  "Verified Assistance",
  "Live Stadium Status",
  "Your Digital Match Ticket",
  "Quick Actions",
  "Live Broadcast Warnings",
  "Accessibility & Guidance Controls",
  "Active Incidents",
  "Congested Gates",
  "Live Broadcasts",
  "Active Personnel",
  "Volunteer Assignments",
  "Gate Congestion Heat",
  "Transit Exit Planner",
  "Smart Navigation Page",
  "Accessibility Page",
  "Live Operations Alerts",
  "Transit Exit Planner Page",
  "Tell Your Problem",
  "Query",
  "Describe Your Issue",
  "Translation Results",
  "Translate To",
  "Speaking/Writing In",
  "Settings",
  "Settings Page",
  "Profile",
  "Language",
  "Role & Access",
  "Active Alerts",
  "Pending Alerts",
  "Alert Approval Page",
  "Broadcast Control Center",
  "Command Center Page",
  "Venue Data",
  "Admin Venue Page"
]);

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTranslation() {
  const { language } = useAccessibility();

  // Local version counter — incremented whenever the global event fires
  const [, forceUpdate] = useState(0);

  // Subscribe / unsubscribe from global translation-updated events
  useEffect(() => {
    const handler = () => forceUpdate(v => v + 1);
    window.addEventListener('translation-updated', handler);
    return () => window.removeEventListener('translation-updated', handler);
  }, []);

  // Warm the cache when language changes
  useEffect(() => {
    warmCache(language);
    // When language changes, force re-render so existing t() calls get re-evaluated
    forceUpdate(v => v + 1);
  }, [language]);

  const t = useCallback((text) => {
    if (!text || !language || language === 'English') return text;

    // Check if the text is a main heading that should remain in English
    if (mainHeadings.has(text)) {
      return text;
    }

    // 1. Check local translation dictionary
    if (localTranslations[language] && localTranslations[language][text]) {
      return localTranslations[language][text];
    }

    warmCache(language);
    const cache = translationCache[language] || {};

    // 2. Check dynamic fetch cache
    if (cache[text]) return cache[text];

    // Not yet fetched — enqueue for batch fetch
    const key = `${language}:${text}`;
    if (!pendingRequests.has(key)) {
      pendingRequests.add(key);
      enqueueBatch(text, language);
    }

    // Return original while pending
    return text;
  }, [language]);

  return { t, language };
}
