# API Documentation - Project AEGIS

## Base URL
```
http://localhost:3001/api
```

All requests should include header:
```
Content-Type: application/json
```

---

## Response Format

### Success Response (2xx)
```json
{
  "data": {...},
  "message": "Success"
}
```

### Error Response (4xx, 5xx)
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Categories

### GET /categories
Get all topic categories

**Response:**
```json
[
  {
    "id": "politics",
    "name": "Politics",
    "icon": "Scale",
    "color": "#ef4444",
    "description": "Government, policy, elections, political philosophy"
  },
  ...
]
```

**Example:**
```bash
curl http://localhost:3001/api/categories
```

---

## Memes / Claims

### GET /feed
Get the main feed of memes with optional filtering

**Query Parameters:**
- `category` (string, optional): Filter by category ID (e.g., "politics", "history")
- `sort` (string, optional): Sort order - "score", "controversy", "recent"
- `limit` (number, optional): Maximum results (default: 50)
- `search` (string, optional): Filter by title, description, or tags

**Response:**
```json
[
  {
    "id": "meme_1",
    "title": "The 'Dead Internet' Theory",
    "description": "The claim that the internet is now predominantly populated by bot activity...",
    "imageUrl": "https://...",
    "submitterId": "user_1",
    "citadelScore": 78,
    "rootNodeId": "node_dead_internet",
    "category": "culture",
    "controversyLevel": "high",
    "createdAt": "2025-11-15T10:30:00Z",
    "tags": ["internet", "bots", "AI", "technology"]
  },
  ...
]
```

**Examples:**
```bash
# Get all memes sorted by score
curl "http://localhost:3001/api/feed?sort=score"

# Get political memes
curl "http://localhost:3001/api/feed?category=politics"

# Search for border-related content
curl "http://localhost:3001/api/feed?search=border"

# Get top 10 controversial memes
curl "http://localhost:3001/api/feed?sort=controversy&limit=10"
```

---

### GET /memes/:id
Get a single meme with full details

**Path Parameters:**
- `id` (string, required): Meme ID (e.g., "meme_1")

**Response:**
```json
{
  "id": "meme_1",
  "title": "The 'Dead Internet' Theory",
  "description": "...",
  "imageUrl": "...",
  "submitterId": "user_1",
  "citadelScore": 78,
  "rootNodeId": "node_dead_internet",
  "category": "culture",
  "controversyLevel": "high",
  "createdAt": "2025-11-15T10:30:00Z",
  "tags": [...],
  "rootNode": { /* Full node details */ },
  "submitter": {
    "id": "user_1",
    "username": "Socrates",
    "reputation": 1500
  }
}
```

**Example:**
```bash
curl http://localhost:3001/api/memes/meme_1
```

---

### POST /memes
Submit a new meme/claim

**Request Body:**
```json
{
  "title": "New meme title",
  "description": "Detailed explanation of the claim",
  "imageUrl": "https://example.com/image.png",
  "category": "politics",
  "tags": ["tag1", "tag2"],
  "submitterId": "user_1"
}
```

**Required Fields:**
- `title`
- `description`
- `category`

**Response:** (201 Created)
```json
{
  "id": "meme_new123",
  "title": "New meme title",
  "description": "...",
  "imageUrl": "...",
  "submitterId": "user_1",
  "citadelScore": 0,
  "rootNodeId": "node_abc123",
  "category": "politics",
  "controversyLevel": "low",
  "createdAt": "2025-01-01T12:00:00Z",
  "tags": [...]
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/memes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Climate policy impact",
    "description": "Evidence about economic effects of climate policy",
    "imageUrl": "https://...",
    "category": "politics",
    "submitterId": "user_1"
  }'
```

---

## Graph Exploration

### GET /graph/:rootNodeId
Get the knowledge graph for a meme/claim

**Path Parameters:**
- `rootNodeId` (string, required): Root node ID (e.g., "node_dead_internet")

**Query Parameters:**
- `depth` (number, optional): How many levels to traverse (default: 2)

**Response:**
```json
{
  "nodes": [
    {
      "id": "node_dead_internet",
      "label": "The 'Dead Internet' Theory",
      "type": "MEME",
      "content": "The claim that the internet is now predominantly populated by bot activity...",
      "verified": false,
      "citadelScore": 78,
      "stats": { "verified": 45, "disputed": 12 },
      "category": "culture"
    },
    {
      "id": "node_bot_report",
      "label": "2024 Bot Traffic Report",
      "type": "STATISTIC",
      "content": "Analysis showing 47% of internet traffic may be automated",
      "verified": true,
      "author": "Imperva",
      "year": 2024,
      "sourceType": "PDF Report",
      "citadelScore": 95
    },
    ...
  ],
  "edges": [
    {
      "id": "edge_1",
      "from": "node_dead_internet",
      "to": "node_bot_report",
      "type": "SUPPORTS",
      "weight": 0.9,
      "verified": true
    },
    ...
  ]
}
```

**Node Types:**
- `MEME`: Surface-level viral claim
- `TEXT`: Book, essay, or philosophical text
- `STATISTIC`: Data, chart, or numerical evidence
- `EVENT`: Historical event or occurrence
- `CONCEPT`: Philosophical or analytical concept
- `PERSON`: Historical or contemporary figure
- `AXIOM`: Fundamental principle

**Edge Types:**
- `SUPPORTS`: Evidence supports the claim
- `DISPUTES`: Evidence contradicts the claim
- `DERIVES_FROM`: Concept derives from philosophical source
- `CONTEXT`: Provides context or background
- `INFLUENCED`: Historical influence
- `PARALLELS`: Similar pattern or parallel
- `CHALLENGES`: Direct challenge to claim
- `ADDRESSES`: Directly addresses the issue
- `CITES`: Direct citation
- `EXPANDS`: Expands on the idea

**Example:**
```bash
# Get graph with depth 2
curl "http://localhost:3001/api/graph/node_dead_internet?depth=2"

# Get graph with depth 3
curl "http://localhost:3001/api/graph/node_borders?depth=3"
```

---

### GET /nodes/:nodeId
Get a single node with full details

**Path Parameters:**
- `nodeId` (string, required): Node ID (e.g., "node_bot_report")

**Response:**
```json
{
  "id": "node_bot_report",
  "label": "2024 Bot Traffic Report",
  "type": "STATISTIC",
  "content": "Analysis showing 47% of internet traffic may be automated",
  "verified": true,
  "author": "Imperva",
  "year": 2024,
  "sourceType": "PDF Report",
  "citadelScore": 95,
  "provenance": {
    "source": "Bot Traffic Report 2024",
    "author": "Imperva Cybersecurity",
    "year": "2024",
    "verifiedScanLink": "IPFS_Hash_Imperva_BotReport_2024",
    "citation": "Imperva. (2024). Bot Traffic Report."
  },
  "intrinsicProperties": [
    "Empirical_Data",
    "Technological_Assessment"
  ],
  "controversyLevel": "medium"
}
```

**Example:**
```bash
curl http://localhost:3001/api/nodes/node_bot_report
```

---

### POST /nodes/:nodeId/comments
Add a comment or evidence note to a node

**Path Parameters:**
- `nodeId` (string, required): Node ID

**Request Body:**
```json
{
  "text": "This statistic is outdated, newer data shows...",
  "userId": "user_2"
}
```

**Response:** (201 Created)
```json
{
  "id": "comment_123",
  "nodeId": "node_bot_report",
  "userId": "user_2",
  "text": "This statistic is outdated...",
  "createdAt": "2025-01-01T12:00:00Z"
}
```

---

### POST /nodes/:nodeId/links
Link a node to external sources

**Path Parameters:**
- `nodeId` (string, required): Node ID

**Request Body:**
```json
{
  "url": "https://www.imperva.com/resources/reports/2024-bad-bot-report.pdf",
  "title": "Imperva Bad Bot Report 2024",
  "description": "Official bot traffic analysis",
  "type": "pdf",
  "userId": "user_1"
}
```

**Response:** (201 Created)
```json
{
  "id": "link_123",
  "nodeId": "node_bot_report",
  "url": "https://...",
  "title": "Imperva Bad Bot Report 2024",
  "userId": "user_1",
  "createdAt": "2025-01-01T12:00:00Z"
}
```

---

### POST /nodes/:nodeId/vote
Vote on a node's accuracy

**Path Parameters:**
- `nodeId` (string, required): Node ID

**Request Body:**
```json
{
  "vote": 1,  // 1 for verified, -1 for disputed, 0 for neutral
  "userId": "user_1",
  "reason": "Optional explanation"
}
```

**Response:**
```json
{
  "nodeId": "node_bot_report",
  "userId": "user_1",
  "vote": 1,
  "newVerifiedCount": 46,
  "newDisputedCount": 12
}
```

---

## Debates

### GET /debates
Get all debates

**Query Parameters:**
- `category` (string, optional): Filter by category
- `sort` (string, optional): "recent", "controversial", "active"
- `limit` (number, optional): Max results
- `status` (string, optional): "active", "resolved"

**Response:**
```json
[
  {
    "id": "debate_1",
    "title": "Should borders be open?",
    "memeId": "meme_borders",
    "category": "politics",
    "createdAt": "2025-01-01T10:00:00Z",
    "positions": 2,
    "status": "active",
    "topPosition": {
      "id": "pos_1",
      "text": "Yes, borders should be open for humanitarian reasons",
      "votes": 234,
      "author": "user_2"
    }
  },
  ...
]
```

**Example:**
```bash
curl "http://localhost:3001/api/debates?category=politics&sort=recent"
```

---

### GET /debates/:id
Get a single debate with all positions

**Path Parameters:**
- `id` (string, required): Debate ID

**Response:**
```json
{
  "id": "debate_1",
  "title": "Should borders be open?",
  "description": "Detailed debate description",
  "memeId": "meme_borders",
  "category": "politics",
  "createdAt": "2025-01-01T10:00:00Z",
  "creatorId": "user_1",
  "status": "active",
  "positions": [
    {
      "id": "pos_1",
      "text": "Yes - borders should be open",
      "votes": 234,
      "authorId": "user_2",
      "evidence": ["node_123", "node_456"],
      "createdAt": "2025-01-01T10:05:00Z"
    },
    {
      "id": "pos_2",
      "text": "No - borders are essential",
      "votes": 456,
      "authorId": "user_3",
      "evidence": ["node_789"],
      "createdAt": "2025-01-01T10:10:00Z"
    }
  ],
  "comments": [...]
}
```

---

### POST /debates
Create a new debate

**Request Body:**
```json
{
  "title": "Should borders be open?",
  "description": "Detailed description of the debate topic",
  "memeId": "meme_borders",
  "category": "politics",
  "creatorId": "user_1",
  "initialPosition": "Yes, borders should be open..."
}
```

**Response:** (201 Created)
```json
{
  "id": "debate_new123",
  "title": "Should borders be open?",
  "memeId": "meme_borders",
  "category": "politics",
  "createdAt": "2025-01-01T12:00:00Z",
  "creatorId": "user_1",
  "status": "active"
}
```

---

### POST /debates/:debateId/positions
Add a position (argument) to a debate

**Path Parameters:**
- `debateId` (string, required): Debate ID

**Request Body:**
```json
{
  "text": "No, borders are essential for sovereignty and cultural preservation",
  "authorId": "user_2",
  "evidence": ["node_scruton", "node_rome_fall"],
  "category": "philosophy"
}
```

**Response:** (201 Created)
```json
{
  "id": "pos_new123",
  "debateId": "debate_1",
  "text": "No, borders are essential...",
  "authorId": "user_2",
  "votes": 0,
  "evidence": ["node_scruton", "node_rome_fall"],
  "createdAt": "2025-01-01T12:00:00Z"
}
```

---

### POST /debates/:debateId/positions/:positionId/vote
Vote on a debate position

**Path Parameters:**
- `debateId` (string, required): Debate ID
- `positionId` (string, required): Position ID

**Request Body:**
```json
{
  "voteType": "support",  // or "oppose"
  "userId": "user_1"
}
```

**Response:**
```json
{
  "positionId": "pos_1",
  "newVoteCount": 235,
  "userVote": "support"
}
```

---

### POST /debates/:debateId/comments
Add a comment to debate discussion

**Path Parameters:**
- `debateId` (string, required): Debate ID

**Request Body:**
```json
{
  "text": "This misses the economic data on fiscal impact",
  "userId": "user_3",
  "parentCommentId": "comment_1"  // optional, for nested replies
}
```

**Response:** (201 Created)
```json
{
  "id": "comment_123",
  "debateId": "debate_1",
  "text": "This misses the economic data...",
  "userId": "user_3",
  "votes": 0,
  "createdAt": "2025-01-01T12:00:00Z"
}
```

---

## Verification & Evidence

### GET /verification
Get the verification queue

**Query Parameters:**
- `sort` (string, optional): "recent", "controversial", "needsVotes"
- `category` (string, optional): Filter by category
- `limit` (number, optional): Max results
- `status` (string, optional): "pending", "verified", "disputed"

**Response:**
```json
[
  {
    "id": "evidence_1",
    "type": "statistic",
    "description": "FBI crime statistics 2023",
    "nodeId": "node_crime",
    "submitterId": "user_2",
    "sourceUrl": "https://fbi.gov/ucr/2023",
    "ipfsHash": "QmXxxx...",
    "verifiedCount": 12,
    "disputedCount": 3,
    "status": "pending",
    "createdAt": "2025-01-01T10:00:00Z"
  },
  ...
]
```

---

### POST /evidence
Submit evidence for a claim

**Request Body:**
```json
{
  "nodeId": "node_crime",
  "evidenceType": "statistic",  // or "quote", "link", "image", "video"
  "description": "FBI crime statistics showing decline in violent crime",
  "sourceUrl": "https://fbi.gov/ucr/2023",
  "ipfsHash": "QmXxxx...",
  "submitterId": "user_1"
}
```

**Response:** (201 Created)
```json
{
  "id": "evidence_new123",
  "nodeId": "node_crime",
  "type": "statistic",
  "description": "FBI crime statistics...",
  "submitterId": "user_1",
  "verifiedCount": 0,
  "disputedCount": 0,
  "status": "pending",
  "createdAt": "2025-01-01T12:00:00Z"
}
```

---

### POST /vote/:evidenceId
Vote on whether evidence is verified

**Path Parameters:**
- `evidenceId` (string, required): Evidence ID

**Request Body:**
```json
{
  "vote": "verified",  // or "disputed"
  "userId": "user_2",
  "reason": "Optional explanation of your vote"
}
```

**Response:**
```json
{
  "evidenceId": "evidence_1",
  "userId": "user_2",
  "vote": "verified",
  "newVerifiedCount": 13,
  "newDisputedCount": 3,
  "userReputation": 1501
}
```

---

## Search

### GET /search
Search across all nodes and memes

**Query Parameters:**
- `q` (string, required): Search query
- `type` (string, optional): Filter by type ("MEME", "TEXT", "STATISTIC", etc.)
- `category` (string, optional): Filter by category
- `limit` (number, optional): Max results

**Response:**
```json
{
  "results": [
    {
      "id": "node_borders",
      "type": "MEME",
      "label": "Civilization Requires Borders",
      "category": "politics",
      "citadelScore": 120,
      "relevance": 0.95
    },
    {
      "id": "node_scruton",
      "type": "TEXT",
      "label": "Roger Scruton on Nationhood",
      "category": "philosophy",
      "citadelScore": 95,
      "relevance": 0.87
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:3001/api/search?q=borders&type=MEME"
```

---

## Users & Identity

### GET /user/identity
Get current user's identity/fingerprint

**Response:**
```json
{
  "publicId": "aegis_a4f3_9c2d_7b81_4e6a",
  "trustScore": 75,
  "reputation": 1500,
  "contributions": {
    "memes": 12,
    "evidence": 45,
    "verifications": 156
  },
  "joinedAt": "2025-01-15T00:00:00Z"
}
```

---

### GET /users/:id
Get a user's public profile

**Path Parameters:**
- `id` (string, required): User ID

**Response:**
```json
{
  "id": "user_1",
  "publicId": "aegis_a4f3_9c2d_7b81_4e6a",
  "username": "Socrates",
  "reputation": 1500,
  "trustScore": 98,
  "bio": "The unexamined life is not worth living.",
  "joinedAt": "2025-01-15T00:00:00Z",
  "contributions": {
    "memes": 12,
    "evidence": 45,
    "verifications": 156
  },
  "topCategories": ["philosophy", "politics"]
}
```

---

### GET /leaderboard
Get the reputation leaderboard

**Query Parameters:**
- `category` (string, optional): Filter by category
- `timeframe` (string, optional): "all", "month", "week"
- `metric` (string, optional): "reputation", "contributions", "accuracy"

**Response:**
```json
[
  {
    "rank": 1,
    "userId": "user_4",
    "username": "SunTzu",
    "reputation": 2500,
    "contributions": 595,
    "accuracy": 0.98
  },
  {
    "rank": 2,
    "userId": "user_5",
    "username": "Aristotle",
    "reputation": 1800,
    "contributions": 316,
    "accuracy": 0.95
  },
  ...
]
```

---

### POST /fingerprint
Submit browser fingerprint data

**Request Body:**
```json
{
  "browserFingerprint": {
    "userAgent": "Mozilla/5.0...",
    "screenResolution": "1920x1080",
    "timezone": "America/New_York",
    "language": "en-US",
    "platform": "MacIntel",
    "webgl": {...},
    "audioContext": "hash_abc123",
    "canvasFingerprint": "data:image/png;base64...",
    "fonts": [...]
  }
}
```

**Response:**
```json
{
  "publicId": "aegis_a4f3_9c2d_7b81_4e6a",
  "trustScore": 75,
  "flags": {
    "vpn": false,
    "tor": false,
    "proxy": false,
    "multipleAccounts": false
  }
}
```

---

## Statistics

### GET /stats
Get overall system statistics

**Response:**
```json
{
  "totalMemes": 47,
  "totalNodes": 285,
  "totalEdges": 156,
  "totalUsers": 5,
  "totalDebates": 23,
  "totalEvidence": 89,
  "averageCitadelScore": 98.5,
  "mostControversialMeme": "meme_1",
  "mostVerifiedMeme": "meme_5",
  "topCategory": "politics",
  "systemHealth": {
    "uptime": "100%",
    "averageResponseTime": "145ms"
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_REQUEST` | 400 | Missing or invalid parameters |
| `UNAUTHORIZED` | 401 | User not authenticated (future) |
| `FORBIDDEN` | 403 | Action not permitted |
| `CONFLICT` | 409 | Resource already exists |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limiting

Currently disabled in development.

**Production limits (future):**
- 100 requests per minute per IP
- 1000 requests per minute per authenticated user

---

## Authentication

Currently disabled (fingerprinting-based identification).

**Future:**
- JWT tokens
- Session cookies
- OAuth 2.0 integration

---

**Last Updated**: January 1, 2026
**Version**: 1.0.0
