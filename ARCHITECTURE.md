# Technical Architecture - Project AEGIS

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│             Browser (Client Application)                │
│  React 18 + Vite + Tailwind CSS + React Force Graph    │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │   Components (8 main React components)         │    │
│  │   - MemeFeed, GraphView, DebateView, etc.     │    │
│  └────────────────────────────────────────────────┘    │
│                          ↓                              │
│  ┌────────────────────────────────────────────────┐    │
│  │   Services (API client, Fingerprinting)       │    │
│  │   - api.js (15+ functions)                    │    │
│  │   - fingerprinting.js (12+ data points)       │    │
│  └────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
                     ↓
┌─────────────────────────────────────────────────────────┐
│            Server (Node.js + Express.js)               │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │   Express Middleware                          │    │
│  │   - CORS, JSON parsing, Logging               │    │
│  └────────────────────────────────────────────────┘    │
│                          ↓                              │
│  ┌────────────────────────────────────────────────┐    │
│  │   Route Handlers (40+ endpoints)              │    │
│  │   - /api/memes, /api/graph, /api/debates, etc│    │
│  └────────────────────────────────────────────────┘    │
│                          ↓                              │
│  ┌────────────────────────────────────────────────┐    │
│  │   Business Logic (Calculation layer)          │    │
│  │   - Reputation scoring                        │    │
│  │   - Graph traversal                           │    │
│  │   - Vote aggregation                          │    │
│  └────────────────────────────────────────────────┘    │
│                          ↓                              │
│  ┌────────────────────────────────────────────────┐    │
│  │   Database Access (db.js)                     │    │
│  │   - In-memory JS objects                      │    │
│  │   - 7 pre-built graphs                        │    │
│  │   - 300+ nodes, 200+ edges                    │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components (React)

#### 1. App.jsx (Main Router)
**Responsibility**: Application state and view routing

```javascript
State:
- activeView (which page is showing)
- selectedRootNodeId (for graph)
- selectedDebateId (for debate detail)
- selectedCategory (filter)
- searchQuery (search input)

Views:
- LANDING: LandingPage
- FEED: MemeFeed (with CategoryNav)
- GRAPH: GraphView
- DEBATES: DebateList
- DEBATE_DETAIL: DebateView
- VERIFY: VerificationQueue
- SEARCH: SearchResults
- IDENTITY: IdentityFingerprint
```

#### 2. MemeFeed.jsx (Feed Display)
**Responsibility**: Display sortable/filterable meme list

```javascript
Props:
- category: string
- sortBy: "score" | "controversy" | "recent"
- searchQuery: string

Fetches:
- GET /api/feed (with filters)

Displays:
- Meme card grid
- CitadelScore badge
- ControversyLevel indicator
- Tags
- Submission author
```

#### 3. GraphView.jsx (Graph Visualization)
**Responsibility**: Interactive force-directed graph

```javascript
Props:
- rootNodeId: string (the meme to visualize)

Fetches:
- GET /api/graph/{nodeId}?depth=2

Libraries:
- react-force-graph-2d (canvas rendering)
- Lucide React (icons)

Features:
- Drag nodes to pan
- Mouse wheel to zoom
- Click node → Inspector panel
- Edge colors by type
- Node colors by type
- Physics simulation
```

#### 4. GraphView.jsx - InspectorPanel (Sub-component)
**Responsibility**: Display node details

```javascript
Props:
- selectedNode: Node object

Displays:
- Node type badge (color-coded)
- Verified status
- Full label and content
- Author, year, sourceType
- Provenance/citation info
- Related properties
- Citation link
- Recent comments
- Action buttons
```

#### 5. DebateView.jsx (Debate Discussion)
**Responsibility**: View and interact with debates

```javascript
Props:
- debateId: string

Fetches:
- GET /api/debates/{id}

Features:
- Display debate title and description
- Show all positions (competing arguments)
- Vote buttons on positions
- Comment section
- Position creation form
- Evidence attachment UI
```

#### 6. VerificationQueue.jsx (Evidence Voting)
**Responsibility**: Community evidence verification

```javascript
Fetches:
- GET /api/verification

Features:
- Queue of pending evidence
- Vote "Verified" or "Disputed"
- Sort by recent/controversial/needs-votes
- Filter by category
- Display evidence stats
- Add comments on evidence
```

#### 7. SearchResults.jsx (Search Interface)
**Responsibility**: Display search results

```javascript
Fetches:
- GET /api/search?q={query}&type={type}

Features:
- Multi-type results (memes, nodes, debates)
- Relevance ranking
- Category filter
- Result detail preview
```

#### 8. CategoryNav.jsx (Category Navigation)
**Responsibility**: Topic category switcher

```javascript
Displays:
- 8 category buttons
- Currently selected highlighted
- Category icon and color
- Click → filter feed

Categories:
1. Politics (Scale icon, red)
2. History (Clock icon, orange)
3. Philosophy (BookOpen icon, purple)
4. Economics (TrendingUp icon, green)
5. Culture (Palette icon, pink)
6. Science (Atom icon, cyan)
7. News (Newspaper icon, gray)
8. Religion (Church icon, purple)
```

#### Supporting Components
- **LandingPage.jsx** - Hero section with featured content
- **IdentityFingerprint.jsx** - Display user fingerprint info
- **RabbitHoleInterface.jsx** - Transition animation
- **FingerprintDisplay.jsx** - Debug fingerprint data

---

## API Specification

### REST Endpoints (40+)

#### Categories (1 endpoint)
```
GET /api/categories
Returns: Array<Category>
```

#### Memes (3 endpoints)
```
GET  /api/feed?category=&sort=&limit=&search=
POST /api/memes
GET  /api/memes/{id}
```

#### Graph (2 endpoints)
```
GET /api/graph/{nodeId}?depth=2
GET /api/nodes/{nodeId}
```

#### Node Interactions (3 endpoints)
```
POST /api/nodes/{nodeId}/comments
POST /api/nodes/{nodeId}/links
POST /api/nodes/{nodeId}/vote
```

#### Debates (5 endpoints)
```
GET  /api/debates?category=&sort=&status=
POST /api/debates
GET  /api/debates/{id}
POST /api/debates/{debateId}/positions
POST /api/debates/{debateId}/positions/{posId}/vote
```

#### Debate Comments (1 endpoint)
```
POST /api/debates/{debateId}/comments
```

#### Evidence (3 endpoints)
```
GET  /api/verification?sort=&category=&status=
POST /api/evidence
POST /api/vote/{evidenceId}
```

#### Search (1 endpoint)
```
GET /api/search?q=&type=&category=
```

#### User (3 endpoints)
```
GET /api/user/identity
GET /api/users/{id}
GET /api/leaderboard
```

#### Fingerprinting (1 endpoint)
```
POST /api/fingerprint
```

#### Statistics (1 endpoint)
```
GET /api/stats
```

---

## Data Models

### Database Schema (In-Memory)

#### Categories
```javascript
{
  id: string,           // "politics"
  name: string,         // "Politics"
  icon: string,         // "Scale"
  color: string,        // "#ef4444"
  description: string
}
```

#### Users
```javascript
{
  id: string,           // "user_1"
  username: string,     // "Socrates"
  publicId: string,     // "aegis_a4f3_9c2d_7b81"
  reputation: number,   // 1500
  trustScore: number,   // 98
  bio: string,
  joinedAt: ISO8601,
  contributions: {
    memes: number,
    evidence: number,
    verifications: number
  }
}
```

#### Nodes (Graph Vertices)
```javascript
{
  id: string,           // "node_xyz"
  type: enum,           // "MEME"|"TEXT"|"STATISTIC"|"EVENT"|"CONCEPT"|"PERSON"|"AXIOM"
  label: string,        // Display title
  content: string,      // Description
  verified: boolean,
  author: string,
  year: number,
  sourceType: string,   // "Book", "PDF Report", "Historical Event"
  citadelScore: number, // 0-100+
  stats: {
    verified: number,   // Vote count
    disputed: number    // Vote count
  },
  category: string,
  provenance: {         // Citation info
    source: string,
    author: string,
    year: string,
    verifiedScanLink: string,  // IPFS hash or URL
    citation: string    // APA/MLA format
  },
  intrinsicProperties: string[]  // Tags
}
```

#### Edges (Relationships)
```javascript
{
  id: string,           // "edge_123"
  from: string,         // Source node ID
  to: string,           // Target node ID
  type: enum,           // "SUPPORTS"|"DISPUTES"|"DERIVES_FROM"|"CONTEXT"|...
  weight: number,       // 0.0-1.0 (strength)
  verified: boolean,
  label: string         // Display text for edge
}
```

#### Memes (Feed Entries)
```javascript
{
  id: string,           // "meme_1"
  title: string,
  description: string,
  imageUrl: string,
  submitterId: string,
  rootNodeId: string,   // Links to graph node
  citadelScore: number, // Accumulated votes
  category: string,
  controversyLevel: enum,  // "low"|"medium"|"high"
  createdAt: ISO8601,
  tags: string[]
}
```

#### Debates
```javascript
{
  id: string,
  title: string,
  description: string,
  memeId: string,       // Links to meme
  category: string,
  creatorId: string,
  status: enum,         // "active"|"resolved"
  createdAt: ISO8601,
  positions: Position[]  // Competing arguments
}
```

#### Positions
```javascript
{
  id: string,
  debateId: string,
  text: string,
  authorId: string,
  votes: number,
  evidence: string[],   // Node IDs
  createdAt: ISO8601
}
```

#### Evidence
```javascript
{
  id: string,
  nodeId: string,       // Claim it supports
  type: enum,           // "statistic"|"quote"|"link"|"image"|"video"
  description: string,
  sourceUrl: string,
  ipfsHash: string,     // For immutable storage
  submitterId: string,
  verifiedCount: number,
  disputedCount: number,
  status: enum,         // "pending"|"verified"|"disputed"
  createdAt: ISO8601
}
```

---

## Request/Response Flow

### Example: Loading a Meme's Knowledge Graph

```
1. User clicks meme in feed
   → App.jsx sets activeView = "GRAPH"
   → selectedRootNodeId = "node_borders"

2. GraphView.jsx mounts
   → useEffect runs
   → Calls getGraph("node_borders") from api.js

3. api.js fetchGraph function
   → Makes HTTP GET request
   → POST /api/graph/node_borders?depth=2

4. server.js handles request
   → Finds root node in db.nodes
   → BFS traversal to depth 2
   → Collects nodes and edges
   → Returns JSON { nodes: [...], edges: [...] }

5. GraphView receives data
   → Sets state with nodes and edges
   → ForceGraph2D renders visualization
   → User can now interact (click, drag, zoom)

6. User clicks node
   → GraphView.jsx detects click
   → Sets selectedNode state
   → InspectorPanel renders with node details

7. User clicks "View Source"
   → Window opens external source URL
   → Or displays IPFS-stored document
```

---

## Authentication & Authorization

### Current (Development)
- **No authentication required**
- **Anonymous users** identified by browser fingerprint
- **Reputation tracked** per public ID
- **No password needed**

### Planned (Phase 3+)
- **JWT tokens** for session management
- **User accounts** with optional email
- **OAuth 2.0** integration (GitHub, Twitter)
- **Rate limiting** per user

---

## Performance Considerations

### Current Bottlenecks
1. **In-memory database** - OK for 300 nodes, won't scale beyond 10,000
2. **Force graph rendering** - Browser canvas, ~50-100 nodes smooth
3. **Graph traversal** - JavaScript BFS, O(n+e) complexity

### Optimization Strategies (Phase 3)

#### Neo4j Integration
```cypher
// Efficient pattern matching
MATCH (root:Node {id: $rootId})
MATCH (root)-[r*1..2]-(connected)
RETURN root, collect(connected), collect(r)
```

#### Query Caching
- Redis cache for popular graphs
- Invalidate on new evidence
- TTL: 1 hour

#### Client-Side Optimization
- Virtual scrolling for long lists
- Lazy-load graph nodes at depth 3+
- Compress graph JSON before sending

---

## Security Architecture

### Browser Fingerprinting
```javascript
Collected Data:
├─ Basic (4 points)
│  ├─ User-Agent
│  ├─ Screen resolution
│  ├─ Timezone
│  └─ Language
├─ Display (5 points)
│  ├─ Available screen size
│  ├─ Color depth
│  ├─ Pixel depth
│  ├─ Device pixel ratio
│  └─ Screen orientation
├─ Hardware (3 points)
│  ├─ Hardware concurrency
│  ├─ Device memory
│  └─ Device battery
├─ Advanced (10+ points)
│  ├─ Installed fonts
│  ├─ WebGL vendor/renderer
│  ├─ Audio context fingerprint
│  ├─ Canvas fingerprint
│  ├─ Browser plugins
│  ├─ MIME types
│  ├─ Connection info
│  └─ Do Not Track setting

Hashing:
- Concatenate JSON strings
- SHA-256 hash
- Store internalHash (server-side only)
- Generate publicId from hash subset
- Format: aegis_a4f3_9c2d_7b81_4e6a

Trust Score Calculation:
- Base: 50 points
- Fingerprint completeness: +20
- Hardware info: +10
- Advanced fingerprinting: +10
- Geolocation available: +5
- Connection info: +5
- Penalties for suspicious flags: -5 to -30
- Final: Math.max(0, Math.min(100, score))

VPN/Tor/Proxy Detection:
- Very fast RTT (<20ms)
- Missing geolocation
- No browser plugins
- Disabled cookies
- Mismatched timezone/IP location
```

---

## Deployment Architecture

### Development
```
Developer Machine
├─ Frontend: Vite dev server (http://localhost:3001)
├─ Backend: Node.js with nodemon
├─ Database: In-memory JS objects
└─ Hot reload on file save
```

### Staging (Planned)
```
Docker Compose
├─ Node.js container (Express app)
├─ Neo4j container
├─ PostgreSQL container
├─ Redis container
└─ docker-compose up
```

### Production (Planned)
```
Kubernetes Cluster
├─ Node.js pods (auto-scale)
├─ Neo4j cluster (3 nodes)
├─ PostgreSQL with replication
├─ Redis cluster
├─ IPFS nodes (3+)
├─ CDN for static assets
├─ Load balancer
└─ Monitoring (Prometheus + Grafana)
```

---

## Integration Roadmap

### to_migrate/ Files Integration

1. **knowledge-graph.ts** → server/services/graph.ts
   - Replace db.js BFS with Neo4j Cypher
   - Implement path finding algorithms

2. **data-structure.ts** → shared/types.ts
   - TypeScript interfaces for Node, Edge, Meme
   - Validation schemas

3. **evidence.ts** → server/models/evidence.ts
   - Evidence submission validation
   - Verification voting logic

4. **meme.ts** → server/models/meme.ts
   - Meme creation and updates
   - CitadelScore calculation

5. **verify.ts** → server/services/verify.ts
   - Evidence verification logic
   - Truth scoring algorithms

6. **profile.ts** → server/models/profile.ts
   - User profile management
   - Reputation updates

7. **cookie-fingerprint.ts** → client/services/cookie-fp.ts
   - Enhanced fingerprinting
   - Cookie analysis

8. **system-fingerprint.ts** → server/services/system-fp.ts
   - Server-side system analysis
   - Sybil detection

9. **api.ts** → shared/api-types.ts
   - Type-safe API client
   - Request/response validation

10. **storage.ts** → server/services/storage.ts
    - Abstract storage layer
    - Support multiple backends

---

## Testing Strategy

### Unit Tests
- Component rendering (React Testing Library)
- API functions (Jest mock fetch)
- Utility functions (Logic testing)

### Integration Tests
- API endpoint responses
- Database query results
- Complete user flows

### E2E Tests
- Full app usage scenarios
- Selenium or Cypress
- Mobile responsiveness

---

## Monitoring & Logging

### Current (Development)
- Console.log in server.js
- Browser console for client errors
- Manual testing

### Planned (Production)
- Prometheus metrics
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Error tracking (Sentry)
- Performance monitoring (New Relic)

---

**Last Updated:** January 1, 2026  
**Architecture Version:** 1.0  
**Status:** Alpha (Ready for development)
