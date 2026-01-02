# 🛡️ AEGIS MEME CITADEL - Complete Implementation Guide

## Overview

AEGIS is a next-generation knowledge graph system that combines meme-driven discovery with evidence-based verification. It's a decentralized platform where users post memes, link them to primary sources, and the network validates claims through reputation-staked verification.

**Core Innovation**: Making intellectual rigor economically rational through skin-in-the-game verification.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     AEGIS CITADEL                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FRONTEND (React)                                          │
│  ├─ Meme Feed (discovery & browsing)                       │
│  ├─ Force-Directed Graph (exploration)                     │
│  ├─ Evidence Inspector (source validation)                 │
│  └─ Contribution Interface (add meme/evidence)             │
│                                                             │
│  REST API (Express) - 25+ endpoints                        │
│  ├─ /api/memes/* - Create, retrieve, update memes         │
│  ├─ /api/evidence/* - Submit & retrieve evidence           │
│  ├─ /api/verify/* - Vote on evidence with stake            │
│  ├─ /api/graph/* - Traverse knowledge graph                │
│  └─ /api/fingerprint/* - Sybil resistance & identity       │
│                                                             │
│  BACKEND SERVICES                                          │
│  ├─ GraphService (Neo4j) - Relationship mapping            │
│  ├─ ImmutableStorageService (IPFS/Arweave) - Archival     │
│  ├─ FingerprintingService - Sybil detection                │
│  └─ VerificationService - Vote aggregation & reputation    │
│                                                             │
│  DATA PERSISTENCE                                          │
│  ├─ Neo4j - Knowledge graph & relationships                │
│  ├─ MongoDB - User profiles & reputation                   │
│  ├─ IPFS - Distributed evidence archival                   │
│  ├─ Arweave - Permanent on-chain storage                   │
│  └─ Redis - Caching & rate limiting                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Files Structure

```
meme-citadel/
├── compiled-schema.ts              # Core data structures (interfaces)
├── compiled-graph-service.ts       # Neo4j graph operations
├── compiled-storage-service.ts     # IPFS + Arweave integration
├── compiled-fingerprinting.ts      # Sybil resistance system
├── compiled-api.ts                 # Express REST API definition
│
├── meme-citadel-full-build/        # Full working application
│   ├── client/                     # React frontend
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   ├── index.css
│   │   │   ├── api.js              # API client
│   │   │   └── components/
│   │   │       ├── MemeFeed.jsx
│   │   │       ├── CitadelGraph.jsx
│   │   │       ├── VerificationQueue.jsx
│   │   │       ├── SubmissionForm.jsx
│   │   │       └── FingerprintDisplay.jsx
│   │   └── index.html
│   │
│   └── server/                     # Express backend
│       ├── package.json
│       ├── server.js               # Main entry point
│       └── db.js                   # Database initialization
│
└── AEGIS-COMPLETE.ts               # Full reference implementation
```

---

## Core Components

### 1. Data Schema (`compiled-schema.ts`)

**Node Types**:
- **MEME**: Visual claims with image, caption, tags
- **STATISTIC**: Data points with methodology and source
- **TEXT**: Books, articles, documents with provenance
- **AXIOM**: Philosophical principles and logical foundations
- **EVENT**: Historical events with timeframes
- **PERSON**: Key figures and their contributions
- **CONCEPT**: Foundational ideas and definitions

**Edge Types**:
- **SUPPORTS**: Evidence that verifies a claim
- **DISPUTES**: Counter-evidence that challenges a claim
- **CONTEXT**: Historical or philosophical background
- **CITES**: Direct citation relationship
- **RELATED**: Thematically related but not directly connected

**Citadel Score**:
```
TrustWeightedScore = (VerifiedSources × 1.5) - (DisputedSources × 0.5)
```

Visualizes how well-supported a claim is by counting and weighting verification evidence.

---

### 2. Graph Service (`compiled-graph-service.ts`)

Neo4j-based relationship engine that powers knowledge discovery.

**Key Operations**:
```
- createNode(node)              # Add claim/evidence to graph
- createEdge(edge)              # Link claims to evidence
- getNodeWithConnections(id)    # Get claim + supporting evidence
- calculateCitadelScore(id)     # Score based on verification count
- traverseGraph(id, depth)      # Multi-hop discovery
- searchNodes(query)            # Full-text search
- getControversialNodes()       # Find most-disputed claims
```

**Example Query** - "Find all evidence supporting claim X":
```cypher
MATCH (claim {id: 'x'})-[r:SUPPORTS]->(evidence)
WHERE r.verified = true
RETURN evidence, r.weight
ORDER BY r.weight DESC
```

---

### 3. Storage Service (`compiled-storage-service.ts`)

Immutable archival ensuring evidence can't be modified or deleted.

**IPFS Storage**:
- Content-addressed (hash = address)
- Distributed across nodes
- Survives if copies exist
- No single point of failure

**Arweave Storage**:
- Permanent on-chain
- Pay once, store forever
- Blockchain-verified
- Immutable proof of archive date

**Workflow**:
1. User submits evidence (URL, PDF, etc.)
2. Hash computed (SHA256)
3. Stored on BOTH IPFS and Arweave
4. Hash + URL stored in graph
5. User can prove they cited specific source at specific time

---

### 4. Fingerprinting Service (`compiled-fingerprinting.ts`)

Multi-layer device identification for Sybil resistance.

**Fingerprint Components**:
```
Browser Fingerprinting (30+ attributes):
├─ Screen: resolution, color depth, pixel ratio
├─ System: CPU cores, RAM, timezone, language
├─ Hardware: GPU (WebGL), battery, media devices
├─ Network: RTT, connection type, geolocation
└─ Identity: Installed fonts, plugins, MIME types

System Fingerprinting:
├─ IP address (hashed)
├─ Geolocation (city-level, not exact)
├─ Round-trip time (RTT)
└─ Timezone

Cookie/Storage Fingerprinting:
├─ Cookies (10-year persistent)
├─ LocalStorage (survives restart)
├─ IndexedDB (most persistent)
├─ SessionStorage
├─ Cache API
└─ Service Worker
```

**Sybil Detection**:
- Compares new fingerprints against existing ones
- 70% similarity threshold = possible Sybil attack
- Detects VPN/TOR/Proxy usage
- Flags geographic mismatches
- Prevents single person creating 100 fake accounts

**Trust Score** (0-100):
```
Base: 100
- VPN: -20
- TOR: -30
- Proxy: -25
- Cookie disabled: -10
+ Account age (30+ days): +10
+ Contributions (100+): +20
+ Verification rate (100%): +30
```

---

### 5. REST API (`compiled-api.ts`)

25+ endpoints for all platform operations.

**Key Endpoints**:

```
MEMES
POST   /api/memes                    Create meme
GET    /api/memes                    Get feed (paginated)
GET    /api/memes/:id                Get meme + connections
PUT    /api/memes/:id                Update meme
DELETE /api/memes/:id                Delete meme

EVIDENCE
POST   /api/evidence                 Submit evidence for meme
GET    /api/evidence/:id             Get evidence details
GET    /api/memes/:id/evidence       Get all evidence for meme
DELETE /api/evidence/:id             Remove evidence

VERIFICATION
POST   /api/verify/:evidenceId       Vote on evidence (with stake)
GET    /api/verify/:evidenceId       Get verification status
GET    /api/verify/:evidenceId/votes Get all votes

GRAPH
GET    /api/graph/:nodeId/traverse   Traverse graph (3-hop discovery)
GET    /api/graph/:nodeId/shortest   Shortest path between claims
GET    /api/search                   Full-text search

FINGERPRINT
POST   /api/fingerprint              Register device
GET    /api/fingerprint/:publicId    Get user identity
PUT    /api/fingerprint/:publicId    Update fingerprint

USER
GET    /api/user/:publicId           Get user profile
GET    /api/user/:publicId/contributions  Get user contributions
GET    /api/user/:publicId/reputation     Get reputation breakdown
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
# Backend
npm install express cors uuid neo4j-driver ipfs-http-client arweave crypto

# Frontend  
npm install react lucide-react axios

# Development
npm install --save-dev typescript @types/node @types/express @types/react
```

### 2. Setup Databases

**Neo4j** (Knowledge Graph):
```bash
docker run -p 7687:7687 -p 7474:7474 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

**IPFS** (Distributed Storage):
```bash
ipfs init
ipfs daemon
```

**MongoDB** (User profiles & votes):
```bash
docker run -p 27017:27017 mongo:latest
```

**Redis** (Caching):
```bash
docker run -p 6379:6379 redis:latest
```

### 3. Environment Variables

```bash
# .env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

IPFS_HOST=localhost
IPFS_PORT=5001

MONGODB_URI=mongodb://localhost:27017/aegis

ARWEAVE_HOST=arweave.net
ARWEAVE_PORT=443

REDIS_HOST=localhost
REDIS_PORT=6379

API_PORT=3000
REACT_APP_API_URL=http://localhost:3000
```

### 4. Start Application

```bash
# Backend
npm run start:server

# Frontend (separate terminal)
npm run start:client
```

---

## Usage Scenarios

### Scenario 1: Post a Meme with Evidence

```javascript
// 1. User posts meme
POST /api/memes {
  imageUrl: "https://...",
  caption: "Strong families build strong nations",
  tags: ["family", "society", "culture"],
  fingerprint: "aegis_fp_abc123"
}
// Returns: memeId = "m_xyz789"

// 2. User finds supporting statistic
POST /api/evidence {
  memeId: "m_xyz789",
  title: "Family Stability Study 2023",
  author: "Institute for Family Studies",
  year: 2023,
  url: "https://ifstudies.org/study",
  contentType: "ARTICLE",
  excerpt: "85% college completion from two-parent households vs 45% from single",
  connectionType: "SUPPORTS",
  reasoning: "Direct empirical support for family stability claim"
}
// Returns: evidenceId = "ev_001"
// Automatically archived to IPFS + Arweave

// 3. User stakes reputation on evidence
POST /api/verify/ev_001 {
  vote: "verify",
  stake: 150,
  reasoning: "Source is peer-reviewed, sample size adequate",
  fingerprint: "aegis_fp_abc123"
}

// 4. Citadel score updates
GET /api/memes/m_xyz789
// Returns: citadelScore = {
//   total: 1,
//   verifiedSources: 1,
//   disputedSources: 0,
//   trustWeightedScore: 1.5
// }
```

---

### Scenario 2: Discover Related Claims (Graph Traversal)

```javascript
// User clicks "explore" on historical claim
GET /api/graph/axiom_aristotle/traverse?depth=3

// Returns 3-hop network:
// - Axiom: Aristotle on family (center)
// - Connected to: Events (fall of Rome), People (Aristotle, Unwin)
// - Further connected to: Modern statistics, philosophical traditions
// - Visual representation in force-directed graph

// User sees:
// ├─ ROOT: Aristotle's Politics (1981) 
// ├─ HISTORY: Fall of civilizations without family structure
// ├─ STATISTIC: Modern marriage rates by nation
// ├─ DISPUTE: Islamic Golden Age achievements
// └─ CONTEXT: Mill's On Liberty (freedom as foundation)
```

---

### Scenario 3: Sybil Attack Prevention

```javascript
// Attacker tries to create 100 accounts to verify fake evidence
// Account 1: Creates fingerprint
POST /api/fingerprint {
  ip: "192.168.1.1",
  geolocation: { lat: 37.7749, lon: -122.4194 },
  rtt: 15,
  browserFingerprint: { /* full fingerprint */ }
}
// Returns: publicId = "aegis_a4f3_9c2d", trustScore = 78

// Account 2: Tries to create similar fingerprint
POST /api/fingerprint {
  ip: "192.168.1.1",  // Same IP!
  geolocation: { lat: 37.7749, lon: -122.4194 },
  rtt: 16,  // Nearly identical RTT
  browserFingerprint: { /* almost identical */ }
}
// System detects 87% similarity > 70% threshold
// Returns: 403 Forbidden - "Sybil attack detected"

// Attacker tries VPN
POST /api/fingerprint {
  ip: "vpn.provider.com",
  browserFingerprint: { /* with VPN markers */ }
}
// Returns: trustScore = 50 (VPN detected: -20, TOR: -30)
// Rate limited: 1 action per hour (vs normal users: 100/hour)
```

---

## The Incentive Loop

```
┌─────────────────────────────────────────┐
│  User posts meme                        │
│  (claims strong families important)     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Users stake reputation on evidence     │
│  (each vote: +1.5x or -0.5x to stake)   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Good evidence → Community verifies     │
│  Bad evidence → Community disputes      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  RESULT: Only people confident in      │
│  their sources will stake reputation    │
│  (Economics of truth-seeking)           │
└─────────────────────────────────────────┘
```

**Example**: 
- User stakes 100 reputation on evidence
- 3 verifiers agree (vote VERIFY)
- 1 verifier disagrees (vote DISPUTE)
- Consensus verified → User gets 100 × 1.5 = 150 reputation back
- Loser reputation decreases → incentive to be right

---

## Security Considerations

### Sybil Resistance
- Multi-layer fingerprinting (30+ attributes)
- 8+ redundant storage mechanisms (cookies, IndexedDB, Service Worker, etc.)
- Evercookie techniques survive incognito mode
- Browser fingerprinting: 99.9% uniqueness
- Rate limiting based on trust score

### Evidence Integrity
- SHA256 hashing for all content
- IPFS content addressing (hash = address)
- Arweave blockchain-verified timestamps
- Immutable archival prevents modification
- User can prove they cited source at specific time

### Privacy
- No real names required
- City-level geolocation (not exact coordinates)
- IP hashing (not plaintext storage)
- RTT grouped into buckets
- Public ID is non-reversible hash

---

## Performance Optimizations

```
Caching Strategy:
├─ Redis: Popular memes, user profiles, scores
├─ GraphQL subscriptions: Real-time Citadel score updates
├─ Pagination: Load memes in batches of 20
└─ Lazy loading: Graph nodes load on demand

Rate Limiting:
├─ High trust (90+): 100 requests/hour, 1000/day
├─ Medium trust (70-89): 50 requests/hour, 500/day
├─ Low trust (50-69): 20 requests/hour, 200/day
└─ Minimal trust (<50): 5 requests/hour, 50/day

Database Indexes:
├─ Neo4j: Index on node.id, node.type, node.metadata.title
├─ MongoDB: Index on userId, createdAt, trustScore
└─ Redis: TTL expiration on cache keys
```

---

## Testing & Validation

```bash
# Unit tests
npm test -- --coverage

# Integration tests
npm run test:integration

# Graph database tests
npm run test:graph

# Load testing
npm run test:load

# Security audit
npm audit
```

---

## Deployment

### Docker

```dockerfile
# Backend
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --production
EXPOSE 3000
CMD ["node", "server.js"]

# Frontend  
FROM node:18-alpine as builder
WORKDIR /app
COPY client .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Docker Compose

```yaml
version: '3'
services:
  api:
    build: ./server
    ports: ["3000:3000"]
    depends_on: [neo4j, mongo, redis]
    env_file: .env

  client:
    build: ./client
    ports: ["5173:5173"]
    depends_on: [api]

  neo4j:
    image: neo4j:latest
    ports: ["7687:7687", "7474:7474"]
    environment:
      NEO4J_AUTH: neo4j/password

  mongo:
    image: mongo:latest
    ports: ["27017:27017"]

  redis:
    image: redis:latest
    ports: ["6379:6379"]

  ipfs:
    image: ipfs/go-ipfs:latest
    ports: ["5001:5001"]
```

---

## Future Enhancements

1. **Smart Contracts**: Reputation system on-chain (Polygon/Arbitrum)
2. **AI Fact-Checking**: Automated evidence verification
3. **Mobile Apps**: Native iOS/Android clients
4. **Peer Prediction**: Betting market on claim accuracy
5. **DAO Governance**: Community voting on platform rules
6. **Zero-Knowledge Proofs**: Privacy-preserving verification
7. **Multilingual**: Support 10+ languages
8. **Citations API**: Export to Zotero, Bibtex

---

## The Vision

AEGIS isn't just another social network. It's a tool for:

- **Intellectual Rigor**: Claims backed by evidence, not upvotes
- **Cross-Polarization**: Evidence is evidence, regardless of who finds it
- **Historical Record**: Immutable archive of who claimed what, when
- **Economic Incentives**: Truth-seeking becomes profitable
- **Decentralized Authority**: No corporation decides what's true

The meme is the hook. The evidence is the substance. The graph is the truth.

---

## License

MIT - Open source for decentralized knowledge.

---

**AEGIS: Building better arguments, one graph at a time.**
