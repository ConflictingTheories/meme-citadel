// In-memory database for Meme Citadel prototype
// In a real system, this would be a combination of Postgres, Neo4j, and Redis.

let users = {
    "fp_hash_1": { id: "user_1", username: "Socrates", reputation: 1500, trustScore: 98, fingerprint: { /* ... */ } },
    "fp_hash_2": { id: "user_2", username: "Nietzsche", reputation: 850, trustScore: 85, fingerprint: { /* ... */ } },
    "fp_hash_3": { id: "user_3", username: "Machiavelli", reputation: 320, trustScore: 60, fingerprint: { /* ... */ } },
    "fp_hash_4": { id: "user_4", username: "SunTzu", reputation: 2500, trustScore: 99, fingerprint: { /* ... */ } },
};

let memes = [
    {
        id: "meme_1",
        title: "The 'Dead Internet' Theory",
        imageUrl: "https://i.imgflip.com/4/32ljpg.jpg", // A placeholder image
        submitterId: "user_1",
        citadelScore: 78,
        rootNodeId: "node_dead_internet"
    },
    {
        id: "meme_2",
        title: "The Great Filter",
        imageUrl: "https://i.imgflip.com/4/1g8my4.jpg", // A placeholder image
        submitterId: "user_2",
        citadelScore: 120,
        rootNodeId: "node_great_filter"
    },
    {
        id: "meme_3",
        title: "Civilization Requires Borders",
        imageUrl: "https://i.imgflip.com/4/2zix3x.jpg",
        submitterId: "user_4",
        citadelScore: 512,
        rootNodeId: "node_borders"
    }
];

let nodes = {
    "node_dead_internet": {
        id: "node_dead_internet",
        label: "Dead Internet Theory",
        type: "MEME",
        content: "The claim that the internet is now predominantly populated by bot activity and AI content.",
        stats: { verified: 45, disputed: 12 }
    },
    "node_bot_report": {
        id: "node_bot_report",
        label: "2024 Bot Traffic Report",
        type: "source",
        sourceType: "PDF Report",
        verified: true,
        author: "Imperva",
        content: "Imperva Bad Bot Report 2024 indicates 49.6% of internet traffic is from automated bots."
    },
    "node_baudrillard": {
        id: "node_baudrillard",
        label: "Simulacra & Simulation",
        type: "history",
        sourceType: "Book (1981)",
        author: "Jean Baudrillard",
        content: "Philosophical treatise on reality vs. symbols. The 'precession of simulacra' predicts digital unreality."
    },
    "node_human_users": {
        id: "node_human_users",
        label: "Human User Growth",
        type: "dispute",
        sourceType: "Data Set",
        author: "ITU",
        content: "Global connectivity index shows 500M new human users in 2024, contradicting total bot dominance."
    }
};

let edges = [
    { from: "node_dead_internet", to: "node_bot_report", type: "verified", label: "SUPPORTS" },
    { from: "node_dead_internet", to: "node_baudrillard", type: "root", label: "DERIVES_FROM" },
    { from: "node_dead_internet", to: "node_human_users", type: "disputed", label: "CONTRADICTS" },
];

let evidenceQueue = [
    {
        id: "evidence_101",
        title: "Leaked click farm video",
        type: "URL",
        url: "http://example.com/video.mp4",
        status: "pending",
        submitterId: "user_2",
        stake: 100,
        reasoning: "This video shows automated engagement, supporting the Dead Internet Theory.",
        votes: { verify: 12, dispute: 3 },
        voters: {},
        timeRemaining: "23h 15m"
    },
    {
        id: "evidence_102",
        title: "Study on social media content novelty",
        type: "PDF",
        url: "http://example.com/study.pdf",
        status: "pending",
        submitterId: "user_1",
        stake: 50,
        reasoning: "Finds that content novelty has decreased, suggesting LLM-driven content farms.",
        votes: { verify: 8, dispute: 1 },
        voters: {},
        timeRemaining: "47h 30m"
    }
];

module.exports = {
    users,
    memes,
    nodes,
    edges,
    evidenceQueue
};
