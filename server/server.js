// ============================================================================
// AEGIS MEME CITADEL - Enhanced Express Server
// Full REST API for knowledge graph, debates, and verification
// ============================================================================

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const db = require('./db.js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// ============================================================================
// CATEGORY ENDPOINTS
// ============================================================================

// GET /api/categories - Get all topic categories
app.get('/api/categories', (req, res) => {
    res.json(db.categories);
});

// ============================================================================
// MEME/CLAIM ENDPOINTS
// ============================================================================

// GET /api/feed - Get the main meme feed with optional filtering
app.get('/api/feed', (req, res) => {
    const { category, sort, limit, search } = req.query;
    
    let results = category && category !== 'all' 
        ? db.getMemesByCategory(category) 
        : db.memes;
    
    // Search filter
    if (search) {
        const q = search.toLowerCase();
        results = results.filter(m =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.tags.some(t => t.toLowerCase().includes(q))
        );
    }
    
    // Sorting
    if (sort === 'score') {
        results = [...results].sort((a, b) => b.citadelScore - a.citadelScore);
    } else if (sort === 'controversy') {
        results = [...results].sort((a, b) => {
            const contLevel = { high: 3, medium: 2, low: 1 };
            return contLevel[b.controversyLevel] - contLevel[a.controversyLevel];
        });
    } else if (sort === 'recent') {
        results = [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Limit
    if (limit) {
        results = results.slice(0, parseInt(limit));
    }
    
    res.json(results);
});

// GET /api/memes/:id - Get a single meme with full details
app.get('/api/memes/:id', (req, res) => {
    const meme = db.getMemeById(req.params.id);
    if (!meme) {
        return res.status(404).json({ error: 'Meme not found' });
    }
    
    // Get associated node data
    const rootNode = db.getNodeById(meme.rootNodeId);
    const submitter = db.getUserById(meme.submitterId);
    
    res.json({
        ...meme,
        rootNode,
        submitter: submitter ? { 
            id: submitter.id, 
            username: submitter.username, 
            reputation: submitter.reputation 
        } : null
    });
});

// POST /api/memes - Create a new meme/claim
app.post('/api/memes', (req, res) => {
    const { title, description, imageUrl, category, tags, submitterId } = req.body;
    
    if (!title || !description || !category) {
        return res.status(400).json({ error: 'Title, description, and category are required' });
    }
    
    const id = `meme_${uuidv4().substring(0, 8)}`;
    const nodeId = `node_${uuidv4().substring(0, 8)}`;
    
    // Create the root node
    db.nodes[nodeId] = {
        id: nodeId,
        label: title,
        type: 'MEME',
        content: description,
        stats: { verified: 0, disputed: 0 },
        category
    };
    
    // Create the meme
    const newMeme = {
        id,
        title,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
        submitterId: submitterId || 'user_1',
        citadelScore: 0,
        rootNodeId: nodeId,
        category,
        controversyLevel: 'low',
        createdAt: new Date().toISOString(),
        tags: tags || []
    };
    
    db.memes.unshift(newMeme);
    res.status(201).json(newMeme);
});

// ============================================================================
// GRAPH ENDPOINTS
// ============================================================================

// GET /api/graph/:rootNodeId - Get the graph data for a meme
app.get('/api/graph/:rootNodeId', (req, res) => {
    const { rootNodeId } = req.params;
    const { depth = 2 } = req.query;
    
    const rootNode = db.nodes[rootNodeId];
    if (!rootNode) {
        return res.status(404).json({ error: 'Root node not found' });
    }

    // Get connected nodes (BFS traversal)
    const visitedNodes = new Set([rootNodeId]);
    const nodesToVisit = [rootNodeId];
    const relevantEdges = [];
    
    for (let d = 0; d < parseInt(depth); d++) {
        const currentLevel = [...nodesToVisit];
        nodesToVisit.length = 0;
        
        for (const nodeId of currentLevel) {
            // Find edges connected to this node
            const connectedEdges = db.edges.filter(e => 
                e.from === nodeId || e.to === nodeId
            );
            
            for (const edge of connectedEdges) {
                if (!relevantEdges.find(e => e.id === edge.id)) {
                    relevantEdges.push(edge);
                }
                
                const otherNodeId = edge.from === nodeId ? edge.to : edge.from;
                if (!visitedNodes.has(otherNodeId)) {
                    visitedNodes.add(otherNodeId);
                    nodesToVisit.push(otherNodeId);
                }
            }
        }
    }
    
    // Collect all visited nodes
    const graphNodes = Array.from(visitedNodes)
        .map(id => db.nodes[id])
        .filter(Boolean);
    
    res.json({
        nodes: graphNodes,
        edges: relevantEdges
    });
});

// GET /api/nodes/:nodeId - Get a single node with details
app.get('/api/nodes/:nodeId', (req, res) => {
    const node = db.getNodeById(req.params.nodeId);
    if (!node) {
        return res.status(404).json({ error: 'Node not found' });
    }
    
    // Get connected edges
    const connections = db.edges
        .filter(e => e.from === node.id || e.to === node.id)
        .map(e => ({
            ...e,
            connectedNode: db.nodes[e.from === node.id ? e.to : e.from]
        }));
    
    res.json({ node, connections });
});

// POST /api/nodes - Create a new evidence node
app.post('/api/nodes', (req, res) => {
    const { label, type, content, author, year, url, sourceType } = req.body;
    
    if (!label || !type || !content) {
        return res.status(400).json({ error: 'Label, type, and content are required' });
    }
    
    const id = `node_${uuidv4().substring(0, 8)}`;
    
    const newNode = {
        id,
        label,
        type,
        content,
        author,
        year,
        url,
        sourceType,
        verified: false,
        createdAt: new Date().toISOString()
    };
    
    db.nodes[id] = newNode;
    res.status(201).json(newNode);
});

// POST /api/edges - Create a relationship between nodes
app.post('/api/edges', (req, res) => {
    const { from, to, type, label, weight = 0.5 } = req.body;
    
    if (!from || !to || !type) {
        return res.status(400).json({ error: 'From, to, and type are required' });
    }
    
    // Verify both nodes exist
    if (!db.nodes[from] || !db.nodes[to]) {
        return res.status(404).json({ error: 'One or both nodes not found' });
    }
    
    const id = `edge_${uuidv4().substring(0, 8)}`;
    
    const newEdge = {
        id,
        from,
        to,
        type,
        label: label || type,
        weight,
        verified: false,
        createdAt: new Date().toISOString()
    };
    
    db.edges.push(newEdge);
    res.status(201).json(newEdge);
});

// ============================================================================
// DEBATE ENDPOINTS
// ============================================================================

// GET /api/debates - Get all debates
app.get('/api/debates', (req, res) => {
    const { category, status } = req.query;
    
    let results = category && category !== 'all'
        ? db.getDebatesByCategory(category)
        : db.debates;
    
    if (status) {
        results = results.filter(d => d.status === status);
    }
    
    // Enrich with submitter info
    const enriched = results.map(debate => ({
        ...debate,
        positions: debate.positions.map(pos => ({
            ...pos,
            submitter: db.getUserById(pos.submitterId)
        }))
    }));
    
    res.json(enriched);
});

// GET /api/debates/:id - Get a single debate with full details
app.get('/api/debates/:id', (req, res) => {
    const debate = db.getDebateById(req.params.id);
    if (!debate) {
        return res.status(404).json({ error: 'Debate not found' });
    }
    
    // Enrich with evidence nodes and user info
    const enriched = {
        ...debate,
        relatedMeme: db.getMemeById(debate.relatedMemeId),
        positions: debate.positions.map(pos => ({
            ...pos,
            submitter: db.getUserById(pos.submitterId),
            evidence: pos.evidenceNodeIds.map(id => db.getNodeById(id)).filter(Boolean)
        })),
        comments: debate.comments.map(c => ({
            ...c,
            user: db.getUserById(c.userId)
        }))
    };
    
    res.json(enriched);
});

// POST /api/debates - Create a new debate
app.post('/api/debates', (req, res) => {
    const { title, description, category, relatedMemeId } = req.body;
    
    if (!title || !description || !category) {
        return res.status(400).json({ error: 'Title, description, and category are required' });
    }
    
    const newDebate = {
        id: `debate_${uuidv4().substring(0, 8)}`,
        title,
        description,
        category,
        status: 'active',
        createdAt: new Date().toISOString(),
        relatedMemeId,
        positions: [],
        comments: []
    };
    
    db.debates.unshift(newDebate);
    res.status(201).json(newDebate);
});

// POST /api/debates/:id/positions - Add a position to a debate
app.post('/api/debates/:id/positions', (req, res) => {
    const debate = db.getDebateById(req.params.id);
    if (!debate) {
        return res.status(404).json({ error: 'Debate not found' });
    }
    
    const { stance, title, summary, submitterId, evidenceNodeIds = [] } = req.body;
    
    if (!stance || !title || !summary) {
        return res.status(400).json({ error: 'Stance, title, and summary are required' });
    }
    
    const newPosition = {
        id: `pos_${uuidv4().substring(0, 8)}`,
        stance,
        title,
        summary,
        submitterId: submitterId || 'user_1',
        evidenceNodeIds,
        votes: { agree: 0, disagree: 0 }
    };
    
    debate.positions.push(newPosition);
    res.status(201).json(newPosition);
});

// POST /api/debates/:id/positions/:positionId/vote - Vote on a position
app.post('/api/debates/:debateId/positions/:positionId/vote', (req, res) => {
    const debate = db.getDebateById(req.params.debateId);
    if (!debate) {
        return res.status(404).json({ error: 'Debate not found' });
    }
    
    const position = debate.positions.find(p => p.id === req.params.positionId);
    if (!position) {
        return res.status(404).json({ error: 'Position not found' });
    }
    
    const { voteType } = req.body; // 'agree' or 'disagree'
    
    if (voteType === 'agree') {
        position.votes.agree += 1;
    } else if (voteType === 'disagree') {
        position.votes.disagree += 1;
    } else {
        return res.status(400).json({ error: 'Invalid vote type' });
    }
    
    res.json(position);
});

// POST /api/debates/:id/comments - Add a comment to a debate
app.post('/api/debates/:id/comments', (req, res) => {
    const debate = db.getDebateById(req.params.id);
    if (!debate) {
        return res.status(404).json({ error: 'Debate not found' });
    }
    
    const { positionId, userId, text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Comment text is required' });
    }
    
    const newComment = {
        id: `comment_${uuidv4().substring(0, 8)}`,
        positionId,
        userId: userId || 'user_1',
        text,
        createdAt: new Date().toISOString(),
        votes: { up: 0, down: 0 }
    };
    
    debate.comments.push(newComment);
    res.status(201).json(newComment);
});

// ============================================================================
// VERIFICATION ENDPOINTS
// ============================================================================

// GET /api/verification - Get the evidence verification queue
app.get('/api/verification', (req, res) => {
    const { category, status } = req.query;
    
    let results = category && category !== 'all'
        ? db.getEvidenceByCategory(category)
        : db.evidenceQueue;
    
    if (status) {
        results = results.filter(e => e.status === status);
    }
    
    // Enrich with submitter info
    const enriched = results.map(e => ({
        ...e,
        submitter: db.getUserById(e.submitterId)
    }));
    
    res.json(enriched);
});

// POST /api/evidence - Submit a new piece of evidence
app.post('/api/evidence', (req, res) => {
    const { title, type, url, reasoning, stake, submitterId, category, relatedNodeId } = req.body;
    
    if (!title || !type || !url || !stake) {
        return res.status(400).json({ error: 'Missing required fields for evidence submission' });
    }

    const newEvidence = {
        id: `evidence_${uuidv4().substring(0, 6)}`,
        title,
        type,
        url,
        reasoning,
        stake: parseInt(stake),
        submitterId: submitterId || 'user_1',
        status: 'pending',
        votes: { verify: 0, dispute: 0 },
        voters: {},
        timeRemaining: '48h 0m',
        category: category || 'news',
        relatedNodeId,
        createdAt: new Date().toISOString()
    };

    db.evidenceQueue.unshift(newEvidence);
    res.status(201).json(newEvidence);
});

// POST /api/vote/:evidenceId - Vote on a piece of evidence
app.post('/api/vote/:evidenceId', (req, res) => {
    const { evidenceId } = req.params;
    const { voteType, userId, stake } = req.body;

    const evidence = db.evidenceQueue.find(e => e.id === evidenceId);
    if (!evidence) {
        return res.status(404).json({ error: 'Evidence not found' });
    }
    if (evidence.status !== 'pending') {
        return res.status(400).json({ error: 'Voting period has ended' });
    }

    const voterId = userId || 'user_4';
    if (evidence.voters[voterId]) {
        return res.status(400).json({ error: 'User has already voted' });
    }
    
    evidence.voters[voterId] = voteType;
    evidence.votes[voteType] += 1;
    
    // Check for consensus
    const totalVotes = evidence.votes.verify + evidence.votes.dispute;
    if (totalVotes >= 10) {
        const verifyRatio = evidence.votes.verify / totalVotes;
        if (verifyRatio >= 0.7) {
            evidence.status = 'verified';
        } else if (verifyRatio <= 0.3) {
            evidence.status = 'disputed';
        }
    }
    
    console.log(`Vote cast on ${evidenceId} by ${voterId}: ${voteType}`);
    res.json(evidence);
});

// ============================================================================
// SEARCH ENDPOINTS
// ============================================================================

// GET /api/search - Global search across all content
app.get('/api/search', (req, res) => {
    const { q, type } = req.query;
    
    if (!q) {
        return res.status(400).json({ error: 'Search query required' });
    }
    
    const results = db.search(q);
    
    // Filter by type if specified
    if (type) {
        res.json({ [type]: results[type] || [] });
    } else {
        res.json(results);
    }
});

// ============================================================================
// USER ENDPOINTS
// ============================================================================

// GET /api/user/identity - Get current user identity (based on fingerprint)
app.get('/api/user/identity', (req, res) => {
    // In production, this would use real fingerprinting
    const mockUser = db.users['fp_hash_4'];
    
    res.json({
        publicId: 'hash-' + uuidv4().substring(0, 8),
        geo: 'New York, USA',
        trustScore: mockUser.trustScore,
        reputation: mockUser.reputation,
        username: mockUser.username,
        flags: ['GEO_CONFIRMED', 'BROWSER_PRINT_MATCH']
    });
});

// GET /api/users/:id - Get user profile
app.get('/api/users/:id', (req, res) => {
    const user = db.getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's contributions
    const userMemes = db.memes.filter(m => m.submitterId === user.id);
    const userEvidence = db.evidenceQueue.filter(e => e.submitterId === user.id);
    
    res.json({
        ...user,
        memes: userMemes,
        evidence: userEvidence
    });
});

// GET /api/leaderboard - Get top contributors
app.get('/api/leaderboard', (req, res) => {
    const users = Object.values(db.users)
        .sort((a, b) => b.reputation - a.reputation)
        .slice(0, 10);
    
    res.json(users);
});

// ============================================================================
// STATS ENDPOINTS
// ============================================================================

// GET /api/stats - Get platform statistics
app.get('/api/stats', (req, res) => {
    const stats = {
        totalMemes: db.memes.length,
        totalNodes: Object.keys(db.nodes).length,
        totalEdges: db.edges.length,
        totalDebates: db.debates.length,
        pendingEvidence: db.evidenceQueue.filter(e => e.status === 'pending').length,
        totalUsers: Object.keys(db.users).length,
        categoryBreakdown: db.categories.map(cat => ({
            ...cat,
            memeCount: db.memes.filter(m => m.category === cat.id).length,
            debateCount: db.debates.filter(d => d.category === cat.id).length
        }))
    };
    
    res.json(stats);
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================================================
// FINGERPRINTING ENDPOINTS
// ============================================================================

// POST /api/fingerprint - Submit browser fingerprint and get identity
app.post('/api/fingerprint', (req, res) => {
    const { browserFingerprint } = req.body;

    if (!browserFingerprint) {
        return res.status(400).json({ error: 'Browser fingerprint is required' });
    }

    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress ||
                     (req.socket && req.socket.remoteAddress) ||
                     (req.connection.socket && req.connection.socket.remoteAddress) || 'unknown';

    // Simulate RTT measurement (in real implementation, this would be measured)
    const rtt = Math.floor(Math.random() * 200) + 20; // 20-220ms

    // Generate identity fingerprint
    const identityFingerprint = {
        publicId: `aegis_${Math.random().toString(36).substring(2, 6)}_${Math.random().toString(36).substring(2, 6)}_${Math.random().toString(36).substring(2, 6)}_${Math.random().toString(36).substring(2, 6)}`,
        trustScore: Math.floor(Math.random() * 40) + 60, // 60-100
        metadata: {
            geohash: '9q8yy', // San Francisco area
            rttBucket: rtt < 50 ? 'nearby' : rtt < 200 ? 'regional' : 'distant',
            created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
            lastSeen: new Date()
        },
        flags: {
            vpn: Math.random() < 0.1, // 10% chance
            tor: Math.random() < 0.01, // 1% chance
            proxy: Math.random() < 0.05, // 5% chance
            multipleAccounts: false
        },
        stats: {
            contributions: Math.floor(Math.random() * 50) + 1,
            verifiedContributions: Math.floor(Math.random() * 30) + 1,
            disputedContributions: Math.floor(Math.random() * 5),
            reputation: Math.floor(Math.random() * 2000) + 500
        }
    };

    // Check if user already exists, otherwise create new user
    let user = db.getUserByFingerprint(identityFingerprint.publicId);
    if (!user) {
        user = {
            id: identityFingerprint.publicId,
            username: `User_${identityFingerprint.publicId.split('_')[1]}`,
            reputation: identityFingerprint.stats.reputation,
            trustScore: identityFingerprint.trustScore,
            bio: 'New AEGIS member',
            joinedAt: identityFingerprint.metadata.created.toISOString(),
            contributions: identityFingerprint.stats
        };
        db.users[identityFingerprint.publicId] = user;
    }

    res.json({
        identity: identityFingerprint,
        user: user
    });
});

// ============================================================================
// USER INTERACTION ENDPOINTS
// ============================================================================

// POST /api/nodes/:nodeId/comments - Add comment to a node
app.post('/api/nodes/:nodeId/comments', (req, res) => {
    const { nodeId } = req.params;
    const { text, userId, fingerprintId } = req.body;

    if (!text || (!userId && !fingerprintId)) {
        return res.status(400).json({ error: 'Text and user/fingerprint ID are required' });
    }

    const node = db.getNodeById(nodeId);
    if (!node) {
        return res.status(404).json({ error: 'Node not found' });
    }

    const comment = {
        id: `comment_${uuidv4().substring(0, 8)}`,
        nodeId,
        text,
        userId: userId || fingerprintId,
        createdAt: new Date().toISOString(),
        votes: { up: 0, down: 0 }
    };

    // Initialize comments array if it doesn't exist
    if (!node.comments) {
        node.comments = [];
    }
    node.comments.push(comment);

    res.status(201).json(comment);
});

// POST /api/nodes/:nodeId/links - Add citation/link to a node
app.post('/api/nodes/:nodeId/links', (req, res) => {
    const { nodeId } = req.params;
    const { url, title, description, type, userId, fingerprintId } = req.body;

    if (!url || (!userId && !fingerprintId)) {
        return res.status(400).json({ error: 'URL and user/fingerprint ID are required' });
    }

    const node = db.getNodeById(nodeId);
    if (!node) {
        return res.status(404).json({ error: 'Node not found' });
    }

    const link = {
        id: `link_${uuidv4().substring(0, 8)}`,
        nodeId,
        url,
        title: title || url,
        description,
        type: type || 'citation',
        submittedBy: userId || fingerprintId,
        submittedAt: new Date().toISOString(),
        verified: false,
        votes: { up: 0, down: 0 }
    };

    // Initialize links array if it doesn't exist
    if (!node.links) {
        node.links = [];
    }
    node.links.push(link);

    res.status(201).json(link);
});

// POST /api/nodes/:nodeId/vote - Vote on a node
app.post('/api/nodes/:nodeId/vote', (req, res) => {
    const { nodeId } = req.params;
    const { vote, userId, fingerprintId } = req.body; // vote: 'up', 'down', or 'verify'

    if (!vote || (!userId && !fingerprintId)) {
        return res.status(400).json({ error: 'Vote type and user/fingerprint ID are required' });
    }

    const node = db.getNodeById(nodeId);
    if (!node) {
        return res.status(404).json({ error: 'Node not found' });
    }

    const voterId = userId || fingerprintId;

    // Initialize votes tracking if it doesn't exist
    if (!node.votes) {
        node.votes = { up: 0, down: 0, verify: 0, voters: {} };
    }

    // Check if user already voted
    if (node.votes.voters[voterId]) {
        return res.status(400).json({ error: 'User has already voted on this node' });
    }

    // Record vote
    if (vote === 'up') node.votes.up++;
    else if (vote === 'down') node.votes.down++;
    else if (vote === 'verify') node.votes.verify++;

    node.votes.voters[voterId] = vote;

    res.json({ success: true, votes: node.votes });
});

// ============================================================================
// FINGERPRINTING ENDPOINTS
// ============================================================================

// POST /api/fingerprint - Submit browser fingerprint and get identity
app.post('/api/fingerprint', (req, res) => {
    const { browserFingerprint } = req.body;

    if (!browserFingerprint) {
        return res.status(400).json({ error: 'Browser fingerprint is required' });
    }

    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress ||
                     (req.socket && req.socket.remoteAddress) ||
                     (req.connection.socket && req.connection.socket.remoteAddress) || 'unknown';

    // Simulate RTT measurement (in real implementation, this would be measured)
    const rtt = Math.floor(Math.random() * 200) + 20; // 20-220ms

    // Generate identity fingerprint
    const identityFingerprint = {
        publicId: `aegis_${Math.random().toString(36).substring(2, 6)}_${Math.random().toString(36).substring(2, 6)}_${Math.random().toString(36).substring(2, 6)}_${Math.random().toString(36).substring(2, 6)}`,
        trustScore: Math.floor(Math.random() * 40) + 60, // 60-100
        metadata: {
            geohash: '9q8yy', // San Francisco area
            rttBucket: rtt < 50 ? 'nearby' : rtt < 200 ? 'regional' : 'distant',
            created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
            lastSeen: new Date()
        },
        flags: {
            vpn: Math.random() < 0.1, // 10% chance
            tor: Math.random() < 0.01, // 1% chance
            proxy: Math.random() < 0.05, // 5% chance
            multipleAccounts: false
        },
        stats: {
            contributions: Math.floor(Math.random() * 50) + 1,
            verifiedContributions: Math.floor(Math.random() * 30) + 1,
            disputedContributions: Math.floor(Math.random() * 5),
            reputation: Math.floor(Math.random() * 2000) + 500
        }
    };

    // Check if user already exists, otherwise create new user
    let user = db.getUserByFingerprint(identityFingerprint.publicId);
    if (!user) {
        user = {
            id: identityFingerprint.publicId,
            username: `User_${identityFingerprint.publicId.split('_')[1]}`,
            reputation: identityFingerprint.stats.reputation,
            trustScore: identityFingerprint.trustScore,
            bio: 'New AEGIS member',
            joinedAt: identityFingerprint.metadata.created.toISOString(),
            contributions: identityFingerprint.stats
        };
        db.users[identityFingerprint.publicId] = user;
    }

    res.json({
        identity: identityFingerprint,
        user: user
    });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🛡️  AEGIS MEME CITADEL SERVER                          ║
║                                                           ║
║   Server running at: http://localhost:${PORT}              ║
║                                                           ║
║   API Endpoints:                                          ║
║   - GET  /api/categories      Categories list             ║
║   - GET  /api/feed            Meme feed                   ║
║   - GET  /api/graph/:id       Knowledge graph             ║
║   - GET  /api/debates         Debate threads              ║
║   - GET  /api/verification    Evidence queue              ║
║   - GET  /api/search?q=       Global search               ║
║   - GET  /api/stats           Platform stats              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
