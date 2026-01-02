# 🛡️ Project AEGIS - The Memetic Citadel

A knowledge platform for analyzing memes, history, art, politics, news, and more through debate, evidence verification, and interconnected knowledge graphs.

## 📋 Project Overview

Project AEGIS enables users to:
- **Explore memes & ideas** across 8 categories (Politics, History, Philosophy, Economics, Culture, Science, News, Religion)
- **Debate competing claims** with structured positions and community voting
- **Verify evidence** through collaborative verification queues
- **Visualize connections** via interactive knowledge graphs
- **Search across all content** with multi-type results
- **Build trust** through user reputation and evidence credibility

## 🏗️ Project Structure

```
meme-citadel/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api.js          # API client
│   │   ├── App.jsx         # Main app shell
│   │   ├── index.css       # Tailwind styles
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
├── server/                 # Express backend
│   ├── db.js               # In-memory database
│   ├── server.js           # REST API
│   └── package.json
├── package.json            # Root monorepo config
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install all dependencies
npm install:all

# Or manually:
npm install           # Root dependencies
cd server && npm install
cd ../client && npm install
```

### Running the App

**Development mode (both servers with auto-reload):**
```bash
npm run dev
```

**Or run separately:**
```bash
npm run start:server  # Terminal 1 - Backend on :3001
npm run start:client  # Terminal 2 - Frontend on :3000
```

**Build for production:**
```bash
npm run build
```

### Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

## 🎯 Features

### Meme Feed
- Browse memes across categories with sorting and filtering
- View citadel scores (community reputation)
- See controversy levels at a glance
- Click to view detailed knowledge graphs

### Knowledge Graphs
- Force-directed visualization of interconnected ideas
- Node types: MEME, STATISTIC, TEXT, EVENT, PERSON, CONCEPT, AXIOM
- Edge types: SUPPORTS, CONTRADICTS, CONTEXT, CITES, REFUTES, EXAMPLE
- Color-coded by relationship type
- Interactive node inspector with metadata
- Legend and zoom controls

### Debates
- Browse active debates across the platform
- View competing positions with evidence
- Vote on positions (agree/disagree/neutral)
- Comment on debates
- Track debate metrics and community sentiment

### Evidence Verification
- Queue of evidence awaiting verification
- Community voting (verify/dispute/uncertain)
- View verification stats and confidence scores
- Submit new evidence for review

### Search
- Search memes, debates, graph nodes, and people
- Category filtering
- Multi-type results display

### User System
- Anonymous user identity with UUID
- User reputation tracking
- Vote history
- Participation metrics

## 🔌 API Endpoints

All endpoints return JSON and use `/api` prefix.

### Core Resources
- `GET /api/categories` - List all categories
- `GET /api/feed?category=&sort=&limit=` - Meme feed with filters
- `GET /api/graph/:nodeId` - Knowledge graph for a node
- `GET /api/debates` - List all debates
- `GET /api/debates/:id` - Get debate details
- `GET /api/verification` - Evidence verification queue
- `GET /api/search?q=&type=&category=` - Search content
- `GET /api/stats` - Platform statistics
- `GET /api/user/identity` - Get/create user identity

### Voting & Interaction
- `POST /api/debates/:id/positions/:posId/vote` - Vote on debate position
- `POST /api/vote/:evidenceId` - Vote on evidence verification
- `POST /api/evidence` - Submit evidence
- `POST /api/debates/:id/comments` - Add debate comment

## 🎨 UI Components

### Pages
- **LandingPage** - Hero section with featured content and stats
- **MemeFeed** - Scrollable feed of memes with filtering
- **CategoryNav** - Tab-based category navigation
- **SearchResults** - Multi-type search results display

### Views
- **GraphView** - Interactive force-directed graph visualization
- **DebateList** - List of all debates with quick stats
- **DebateView** - Detailed debate with positions, voting, comments
- **VerificationQueue** - Evidence awaiting community verification
- **SubmissionForm** - Form to add memes or evidence
- **FingerprintDisplay** - User identity and metrics

## 🗄️ Data Structure

### In-Memory Database
The application uses an in-memory database (`server/db.js`) with:
- **Users**: User accounts with reputation and voting history
- **Categories**: 8 curated topic areas
- **Nodes**: Knowledge graph nodes (memes, statistics, events, etc.)
- **Edges**: Relationships between nodes
- **Memes**: Community-submitted memes with citations
- **Debates**: Structured debates with positions and voting
- **Evidence**: Claims with supporting/contradicting evidence

Sample data is pre-populated for immediate use.

## 🔮 Future Enhancements

- Persist data to Neo4j graph database
- Implement blockchain-based evidence verification
- Add IPFS/Arweave for decentralized storage
- Multi-signature evidence chains
- Advanced analytics and trend detection
- Export debate data in academic formats
- Browser fingerprinting for user tracking
- OAuth/Web3 authentication

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite 5
- TailwindCSS 3
- react-force-graph-2d for visualizations
- lucide-react for icons

**Backend:**
- Express 4
- CORS middleware
- UUID for unique IDs
- In-memory storage (upgradeable to Neo4j)

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributing

This is an AEGIS Project initiative. Contributions welcome via pull requests.

---

**Status**: ✅ Fully functional v1.0  
**Last Updated**: January 1, 2026  
**Maintained by**: AEGIS Project Team
