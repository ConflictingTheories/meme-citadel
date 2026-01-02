const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// --- DATABASE (Mocked) ---
const db = require('./db.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// --- API ENDPOINTS ---

// GET /api/feed - Get the main meme feed
app.get('/api/feed', (req, res) => {
    res.json(db.memes);
});

// GET /api/graph/:rootNodeId - Get the graph data for a meme
app.get('/api/graph/:rootNodeId', (req, res) => {
    const { rootNodeId } = req.params;
    const rootNode = db.nodes[rootNodeId];
    if (!rootNode) {
        return res.status(404).json({ message: "Root node not found" });
    }

    // A real implementation would traverse the graph. Here we'll just return all nodes/edges for simplicity.
    res.json({
        nodes: Object.values(db.nodes),
        edges: db.edges
    });
});

// GET /api/verification - Get the list of evidence pending verification
app.get('/api/verification', (req, res) => {
    res.json(db.evidenceQueue);
});

// GET /api/user/identity - Simulate getting a user's identity and trust score
app.get('/api/user/identity', (req, res) => {
    // In a real system, this would involve the complex fingerprinting we designed.
    // Here we'll just return a mock user.
    const mockUser = db.users["fp_hash_4"]; // Sun Tzu, our high-trust user
    res.json({
        publicId: "hash-" + uuidv4().substring(0, 8),
        geo: "New York, USA",
        trustScore: mockUser.trustScore,
        reputation: mockUser.reputation,
        flags: ["GEO_CONFIRMED", "BROWSER_PRINT_MATCH"]
    });
});

// POST /api/evidence - Submit a new piece of evidence
app.post('/api/evidence', (req, res) => {
    const { title, type, url, reasoning, stake, submitterId } = req.body;
    if (!title || !type || !url || !stake) {
        return res.status(400).json({ message: "Missing required fields for evidence submission." });
    }

    const newEvidence = {
        id: `evidence_${uuidv4().substring(0, 6)}`,
        title,
        type,
        url,
        reasoning,
        stake,
        submitterId: submitterId || "user_2", // default to a mock user
        status: "pending",
        votes: { verify: 0, dispute: 0 },
        voters: {},
        timeRemaining: "48h 0m"
    };

    db.evidenceQueue.unshift(newEvidence);
    res.status(201).json(newEvidence);
});

// POST /api/vote/:evidenceId - Vote on a piece of evidence
app.post('/api/vote/:evidenceId', (req, res) => {
    const { evidenceId } = req.params;
    const { voteType, userId, stake } = req.body; // voteType should be 'verify' or 'dispute'

    const evidence = db.evidenceQueue.find(e => e.id === evidenceId);
    if (!evidence) {
        return res.status(404).json({ message: "Evidence not found." });
    }
    if (evidence.status !== 'pending') {
        return res.status(400).json({ message: "Voting period has ended." });
    }

    // Simulate reputation staking and voting logic
    const voterId = userId || "user_4"; // default to our high-trust user
    if (evidence.voters[voterId]) {
         return res.status(400).json({ message: "User has already voted." });
    }
    
    evidence.voters[voterId] = voteType;
    evidence.votes[voteType] += 1;
    
    // In a real system, the reputation engine would run, but for the UI we just update counts.
    console.log(`Vote cast on ${evidenceId} by ${voterId}: ${voteType}`);

    res.json(evidence);
});


app.listen(PORT, () => {
    console.log(`Meme Citadel server listening on http://localhost:${PORT}`);
});
