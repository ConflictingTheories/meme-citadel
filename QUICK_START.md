# Quick Start Guide - Project AEGIS

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 16+ (check: `node --version`)
- npm 8+ (check: `npm --version`)
- Git (check: `git --version`)

### Clone & Setup

```bash
# 1. Navigate to project
cd /Users/kderbyma/Downloads/meme-citadel

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install
```

### Run the Project

**Terminal 1 - Start Backend:**
```bash
cd server
npm start
# ✅ Server running on http://localhost:3001
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
# ✅ Client running on http://localhost:3001
```

**Open in Browser:**
- http://localhost:3001/

---

## 📁 Project Structure Overview

```
meme-citadel/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx           # Main router component
│   │   ├── components/       # 8 React components
│   │   ├── services/         # Browser fingerprinting service
│   │   └── api.js            # REST API client wrapper
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Node.js backend (Express)
│   ├── server.js             # Express app with routes
│   ├── db.js                 # In-memory graph database
│   └── package.json
│
├── to_migrate/               # TypeScript files to integrate
│   └── (10 utility files)
│
├── PROJECT_STATUS.md         # Detailed status report
└── DEVELOPMENT_ROADMAP.md    # 4-phase development plan
```

---

## 🎯 Core Concepts

### The Three Layers

**Layer 1: Presentation** (React Components)
- User sees a meme/claim (the "Anchor")
- Clicks to explore knowledge graph
- Views evidence in "inspector panel"

**Layer 2: Application** (Express Server)
- REST API that serves graph data
- Handles user interactions (voting, commenting)
- Calculates reputation scores

**Layer 3: Data** (Graph + Metadata)
- **Nodes**: Knowledge units (quotes, stats, events, concepts)
- **Edges**: Relationships (SUPPORTS, DISPUTES, DERIVES_FROM)
- **Memes**: Surface-level viral claims

### Example Flow: "Civilization Requires Borders"

```
1. User sees meme in feed
   → "Civilization requires borders"

2. Click to "Enter the Citadel"
   → Load graph data for this meme

3. See graph with center node (the meme) and 3 branches:
   → Philosophy: Roger Scruton essay
   → History: Fall of Rome (currency collapse + migration)
   → Data: CBP border crossing statistics

4. Click edge to see relationship
   → "SUPPORTS" - History evidence shows consequences of open borders

5. Click node to see details
   → Inspector panel shows source, citation, verification count

6. Vote or add counter-evidence
   → "Open Borders" node with economic benefits
   → Your contribution tracked for reputation
```

---

## 🔌 API Quick Reference

### Memes (Feed)
```javascript
// Get all memes (sorted by citadelScore)
GET /api/feed?category=politics&sort=score&limit=10

// Get single meme
GET /api/memes/meme_123

// Submit new meme
POST /api/memes
{
  "title": "The west is collapsing",
  "description": "Detailed explanation...",
  "imageUrl": "https://...",
  "category": "politics",
  "tags": ["civilization", "decline"]
}
```

### Graph Exploration
```javascript
// Get knowledge graph for a meme
GET /api/graph/node_borders?depth=2

// Response includes:
{
  "nodes": [
    { id, type, label, content, verified, citadelScore, ... },
    ...
  ],
  "edges": [
    { id, from, to, type: "SUPPORTS|DISPUTES|...", weight, ... },
    ...
  ]
}

// Get single node details
GET /api/nodes/node_scruton
```

### Debates
```javascript
// Get all debates
GET /api/debates?category=politics&sort=recent

// Create debate (argument between positions)
POST /api/debates
{
  "title": "Should borders be open?",
  "memeId": "meme_1",
  "initialPosition": "Yes, borders should be open..."
}

// Add position to debate
POST /api/debates/debate_1/positions
{
  "text": "No, borders provide sovereignty and cultural continuity",
  "evidence": ["node_123", "node_456"]
}

// Vote on position
POST /api/debates/debate_1/positions/pos_1/vote
{ "voteType": "support" }
```

### Evidence & Verification
```javascript
// Submit evidence for a claim
POST /api/evidence
{
  "nodeId": "node_123",
  "evidenceType": "statistic",
  "sourceUrl": "https://example.com/data.pdf",
  "ipfsHash": "QmXxxx...",
  "description": "FBI crime statistics 2023"
}

// Vote on evidence
POST /api/vote/evidence_1
{ "vote": "verified" }

// Get verification queue
GET /api/verification?sort=controversial&limit=20
```

### Search & Categories
```javascript
// Get all categories
GET /api/categories
// Returns: [{ id, name, icon, color, description }, ...]

// Search across all nodes
GET /api/search?q=fiat+currency&type=STATISTIC

// Get user leaderboard
GET /api/leaderboard
```

---

## 🎨 Component Guide

### MemeFeed.jsx
**Purpose**: Main feed display
**Props**: category (string)
**Shows**: Meme cards with citadelScore, controversy level
**Actions**: Click card → GraphView

### GraphView.jsx
**Purpose**: Interactive force-directed graph
**Shows**: Nodes colored by type, edges colored by relationship
**Actions**: 
- Click node → Shows inspector panel
- Drag nodes → Pan visualization
- Scroll → Zoom in/out

### DebateView.jsx
**Purpose**: Debate discussion interface
**Shows**: Competing positions with vote counts
**Actions**:
- Post new position
- Vote on existing positions
- Comment on positions

### VerificationQueue.jsx
**Purpose**: Evidence submission & voting
**Shows**: Queue of submitted evidence
**Actions**:
- Submit new evidence
- Vote "Verified" or "Disputed"
- Comment on evidence

### RabbitHoleInterface.jsx
**Purpose**: Entry animation to graph
**Shows**: Smooth transition from meme to graph
**Metaphor**: Falling down the "rabbit hole" to deeper truth

### SearchResults.jsx
**Purpose**: Display search results
**Shows**: Nodes matching query
**Actions**: Click result → GraphView for that node

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Load http://localhost:3001
- [ ] See landing page with "Enter the Citadel" button
- [ ] Click button → Meme feed loads
- [ ] See 5+ memes with images
- [ ] Click meme → Graph visualization loads
- [ ] Click node in graph → Inspector panel opens
- [ ] Click category → Feed filters to that category
- [ ] Search bar works
- [ ] "Debates" view shows debate list
- [ ] Can post comment in debate
- [ ] Can vote on evidence

### Console Checks
- [ ] No red error messages in console
- [ ] No failed API calls (404, 500)
- [ ] Fingerprinting logs successful collection

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# If port 3001 is in use, kill process:
lsof -i :3001
kill -9 <PID>

# Or specify different port:
PORT=3002 npm start
```

### Module Not Found Error
```bash
# Reinstall node_modules:
rm -rf node_modules package-lock.json
npm install
```

### API Connection Refused
```bash
# Check if server is running:
curl http://localhost:3001/api/categories

# If failed, ensure server started first:
cd server
npm start
```

### Graph Not Rendering
```bash
# Check browser console (F12)
# Look for WebGL or canvas errors
# Some systems need: export FORCE_COLOR=1
```

---

## 📊 Sample Data

The database includes 7 pre-built knowledge graphs:

1. **Dead Internet Theory** (7 nodes)
   - Claims: 47% of traffic is bots
   - Context: Baudrillard's simulacra theory
   - Counter: Human user growth statistics

2. **Civilization Requires Borders** (8 nodes)
   - Claims: Borders necessary for sovereignty
   - Support: Scruton philosophy, Rome fall
   - Counter: Open borders economic benefits

3. **The Logos in Western Thought** (7 nodes)
   - Core: Greek concept of Logos
   - Evolution: Through Stoicism to Christianity
   - Application: Modern science & law

4. **Bureaucratic Regulatory Capture** (4 nodes)
   - Claim: Regulators captured by industry
   - Evidence: Chevron deference ruling
   - Context: Administrative state growth

5. **The Great Filter** (3 nodes)
   - Question: Why no alien civilizations?
   - Theory: Civilizations don't survive
   - Context: Fermi paradox

6. **Fall of Rome** (3 nodes)
   - Historical parallel: Currency debasement
   - Pattern: Institutional decay
   - Modern application: Same risks today

7. **Fiat Currency Endgame** (3 nodes)
   - Economics: All fiat eventually collapses
   - Evidence: Dollar purchasing power loss
   - Parallel: Roman denarius debasement

---

## 🔐 Privacy & Security Notes

**Browser Fingerprinting**
- Collects: User-Agent, screen resolution, timezone, languages, fonts
- Purpose: Detect Sybil attacks (multiple accounts)
- Privacy: No personal data collected, just device characteristics
- Anonymity: Data hashed server-side, not stored

**Data Storage**
- Currently: In-memory JavaScript (resets on restart)
- No persistent database yet
- No cookies or session tracking
- Perfect for development/demo

---

## 📚 Next Steps

1. **Now**: Get comfortable with the codebase
   - Read `PROJECT_STATUS.md`
   - Explore component structure
   - Test the API manually

2. **This Week**: Complete Phase 1
   - Fix any remaining errors
   - Verify all endpoints respond
   - Document any issues

3. **Next Week**: Phase 2 (Advanced Features)
   - Interactive graph
   - Full debate system
   - Evidence verification

---

## 🆘 Need Help?

### Check These First
1. `/Users/kderbyma/Downloads/meme-citadel/README.md` - Project overview
2. `/Users/kderbyma/Downloads/meme-citadel/PROJECT_STATUS.md` - Detailed status
3. `/Users/kderbyma/Downloads/meme-citadel/DEVELOPMENT_ROADMAP.md` - What to build next
4. Browser console (F12) - Error messages
5. Server console - Backend errors

### Common Issues
- **Build error**: Run `npm install` in that folder
- **Port in use**: Kill process or use different port
- **API 404**: Check server.js for endpoint
- **Component not rendering**: Check browser console for React errors

---

## 🎓 Learning Resources

- [React Hooks Guide](https://react.dev/reference/react)
- [Express.js Tutorial](https://expressjs.com/en/starter/basic-routing.html)
- [Force Graph Library](https://github.com/vasturiano/react-force-graph)
- [Graph Databases 101](https://neo4j.com/developer/graph-database/)
- [REST API Design](https://restfulapi.net/)

---

**Ready to build the future of knowledge? Let's go! 🚀**

Created: January 1, 2026
