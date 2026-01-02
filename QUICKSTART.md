# 🚀 Quick Start Guide

## The Project is Now Clean & Ready!

All old/split code has been removed. Here's what you have:

```
meme-citadel/
├── client/       → React frontend (Vite + TailwindCSS)
├── server/       → Express API (30+ endpoints)
├── README.md     → Full documentation
└── package.json  → Root configuration
```

---

## ⚡ Get Running in 3 Steps

### 1️⃣ Install Dependencies
```bash
npm install:all
```

This installs:
- Root dependencies (`concurrently`)
- Server dependencies (Express, CORS, UUID)
- Client dependencies (React, Vite, TailwindCSS, react-force-graph-2d)

### 2️⃣ Start Both Servers
```bash
npm run dev
```

This runs:
- **Backend**: http://localhost:3001 (Express API)
- **Frontend**: http://localhost:3000 (React Vite dev server)

### 3️⃣ Open in Browser
```
http://localhost:3000
```

---

## 🎯 What You Can Do

### 📰 Browse Memes
- View memes across 8 categories
- Sort by citadel score, controversy, date
- Click any meme to see knowledge graph

### 🌐 Explore Knowledge Graphs
- Force-directed visualization
- 7 node types (MEME, STATISTIC, TEXT, EVENT, PERSON, CONCEPT, AXIOM)
- 7 edge types (SUPPORTS, CONTRADICTS, CONTEXT, CITES, REFUTES, EXAMPLE)
- Interactive inspector panel
- Color-coded by node/edge type

### 💬 Participate in Debates
- Browse active debates across platform
- Vote on competing positions
- Add comments
- View debate statistics

### 🔬 Verify Evidence
- Review evidence in verification queue
- Vote: verify / dispute / uncertain
- Check verification confidence scores
- Submit new evidence

### 🔍 Search Everything
- Search memes, debates, nodes, people
- Filter by category
- Multi-type results

---

## 📂 What's Where

### Backend (`server/`)
- **server.js** - 30+ REST API endpoints
- **db.js** - In-memory database with sample data

### Frontend (`client/`)
- **App.jsx** - Main application shell
- **api.js** - API client functions
- **components/** - 7 React components:
  - LandingPage
  - MemeFeed
  - GraphView
  - DebateList / DebateView
  - VerificationQueue
  - SearchResults

---

## 🔌 API Endpoints (Examples)

```bash
# Categories
curl http://localhost:3001/api/categories

# Meme Feed
curl http://localhost:3001/api/feed

# Debates
curl http://localhost:3001/api/debates

# Search
curl "http://localhost:3001/api/search?q=test"

# Evidence Verification
curl http://localhost:3001/api/verification

# User Identity
curl http://localhost:3001/api/user/identity
```

---

## 🛑 Stop Servers

Press `Ctrl+C` in the terminal

---

## 📖 More Info

See `README.md` for:
- Complete API reference
- Tech stack details
- Architecture overview
- Future enhancements

---

## ✅ Everything Works Because

✅ All old design files deleted (no clutter)  
✅ All code consolidated (no split structure)  
✅ Paths corrected in package.json  
✅ Frontend & backend integrated  
✅ Mock data pre-loaded  
✅ All features implemented  

**Just run it and explore!** 🎉
