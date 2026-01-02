// ============================================================================
// AEGIS MEME CITADEL - Database with optional SQLite persistence
// By default this module exports the seeded in-memory fixtures. If SQLite
// persistence is available, it will load persisted rows from `server/data.sqlite`
// and otherwise seed the DB with the fixtures below.
// ============================================================================

let persistence = null;
try {
    persistence = require('./sqlite_persist');
} catch (e) {
    persistence = null;
}

// ============================================================================
// CATEGORIES - Topics for organizing content
// ============================================================================
const categories = [
    { id: 'politics', name: 'Politics', icon: 'Scale', color: '#ef4444', description: 'Government, policy, elections, political philosophy' },
    { id: 'history', name: 'History', icon: 'Clock', color: '#f97316', description: 'Historical events, civilizations, movements' },
    { id: 'philosophy', name: 'Philosophy', icon: 'BookOpen', color: '#8b5cf6', description: 'Ethics, metaphysics, epistemology, logic' },
    { id: 'economics', name: 'Economics', icon: 'TrendingUp', color: '#22c55e', description: 'Markets, trade, monetary policy, wealth' },
    { id: 'culture', name: 'Culture', icon: 'Palette', color: '#ec4899', description: 'Art, literature, music, traditions' },
    { id: 'science', name: 'Science', icon: 'Atom', color: '#06b6d4', description: 'Scientific discoveries, methodology, controversies' },
    { id: 'news', name: 'Current Events', icon: 'Newspaper', color: '#64748b', description: 'Contemporary issues and ongoing debates' },
    { id: 'religion', name: 'Religion', icon: 'Church', color: '#a855f7', description: 'Theology, spirituality, religious history' }
];

// Persistence will be loaded asynchronously by server initialization.
// When available, `server/server.js` will call `applyPersistence(loaded)` to merge persisted rows.
function applyPersistence(loaded) {
    try {
        const dbRef = loaded.db;
        if (loaded.categories && Object.keys(loaded.categories).length > 0) categories = Object.values(loaded.categories);
        if (loaded.users && Object.keys(loaded.users).length > 0) users = loaded.users;
        if (loaded.memes && loaded.memes.length > 0) memes = loaded.memes;
        if (loaded.nodes && Object.keys(loaded.nodes).length > 0) nodes = loaded.nodes;
        if (loaded.edges && loaded.edges.length > 0) edges = loaded.edges;
        if (loaded.debates && loaded.debates.length > 0) debates = loaded.debates;
        if (loaded.evidenceQueue && loaded.evidenceQueue.length > 0) evidenceQueue = loaded.evidenceQueue;

        const anyPersisted = (loaded.categories && Object.keys(loaded.categories).length) || (loaded.users && Object.keys(loaded.users).length) || (loaded.memes && loaded.memes.length) || (loaded.nodes && Object.keys(loaded.nodes).length) || (loaded.edges && loaded.edges.length) || (loaded.debates && loaded.debates.length) || (loaded.evidenceQueue && loaded.evidenceQueue.length);
        if (!anyPersisted) {
            // seed DB with current fixtures
            persistence.persistArray(dbRef, 'memes', memes).catch(() => {});
            persistence.persistObjects(dbRef, 'nodes', nodes).catch(() => {});
            persistence.persistArray(dbRef, 'edges', edges).catch(() => {});
            persistence.persistArray(dbRef, 'debates', debates).catch(() => {});
            persistence.persistArray(dbRef, 'evidenceQueue', evidenceQueue).catch(() => {});
            persistence.persistObjects(dbRef, 'users', users).catch(() => {});
            const catObj = {};
            for (const c of categories) catObj[c.id] = c;
            persistence.persistObjects(dbRef, 'categories', catObj).catch(() => {});
        }
    } catch (e) {
        console.warn('applyPersistence failed:', e && e.message ? e.message : e);
    }
}

// ============================================================================
// USERS - Reputation and identity
// ============================================================================
let users = {
    "fp_hash_1": { 
        id: "user_1", 
        username: "Socrates", 
        reputation: 1500, 
        trustScore: 98, 
        bio: "The unexamined life is not worth living.",
        joinedAt: "2025-01-15T00:00:00Z",
        contributions: { memes: 12, evidence: 45, verifications: 156 }
    },
    "fp_hash_2": { 
        id: "user_2", 
        username: "Nietzsche", 
        reputation: 850, 
        trustScore: 85,
        bio: "God is dead. We have killed him.",
        joinedAt: "2025-02-20T00:00:00Z",
        contributions: { memes: 8, evidence: 23, verifications: 89 }
    },
    "fp_hash_3": { 
        id: "user_3", 
        username: "Machiavelli", 
        reputation: 320, 
        trustScore: 60,
        bio: "It is better to be feared than loved.",
        joinedAt: "2025-06-01T00:00:00Z",
        contributions: { memes: 4, evidence: 12, verifications: 34 }
    },
    "fp_hash_4": { 
        id: "user_4", 
        username: "SunTzu", 
        reputation: 2500, 
        trustScore: 99,
        bio: "Know yourself and you will win all battles.",
        joinedAt: "2025-01-01T00:00:00Z",
        contributions: { memes: 25, evidence: 120, verifications: 450 }
    },
    "fp_hash_5": { 
        id: "user_5", 
        username: "Aristotle", 
        reputation: 1800, 
        trustScore: 95,
        bio: "Educating the mind without educating the heart is no education at all.",
        joinedAt: "2025-03-10T00:00:00Z",
        contributions: { memes: 15, evidence: 67, verifications: 234 }
    }
};

// ============================================================================
// MEMES/CLAIMS - The visual entry points
// ============================================================================
let memes = [
    {
        id: "meme_1",
        title: "The 'Dead Internet' Theory",
        description: "The claim that the internet is now predominantly populated by bot activity and AI-generated content, making authentic human interaction increasingly rare.",
        imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop",
        submitterId: "user_1",
        citadelScore: 78,
        rootNodeId: "node_dead_internet",
        category: "culture",
        controversyLevel: "high",
        createdAt: "2025-11-15T10:30:00Z",
        tags: ["internet", "bots", "AI", "technology", "authenticity"]
    },
    {
        id: "meme_2",
        title: "The Great Filter",
        description: "The hypothesis that there is a barrier that prevents civilizations from reaching interstellar capability, explaining the Fermi Paradox.",
        imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop",
        submitterId: "user_2",
        citadelScore: 120,
        rootNodeId: "node_great_filter",
        category: "science",
        controversyLevel: "medium",
        createdAt: "2025-10-22T14:15:00Z",
        tags: ["fermi paradox", "aliens", "civilization", "extinction", "space"]
    },
    {
        id: "meme_3",
        title: "Civilization Requires Borders",
        description: "The argument that defined territorial boundaries are essential for the maintenance of distinct cultures, legal systems, and civilizational values.",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
        submitterId: "user_4",
        citadelScore: 512,
        rootNodeId: "node_borders",
        category: "politics",
        controversyLevel: "high",
        createdAt: "2025-09-05T08:45:00Z",
        tags: ["borders", "sovereignty", "civilization", "immigration", "culture"]
    },
    {
        id: "meme_4",
        title: "Democracy Dies in Bureaucracy",
        description: "The observation that democratic institutions can be subverted by unelected administrative bodies that accumulate regulatory power beyond voter control.",
        imageUrl: "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=400&h=300&fit=crop",
        submitterId: "user_5",
        citadelScore: 245,
        rootNodeId: "node_bureaucracy",
        category: "politics",
        controversyLevel: "medium",
        createdAt: "2025-08-18T16:20:00Z",
        tags: ["democracy", "bureaucracy", "government", "power", "regulation"]
    },
    {
        id: "meme_5",
        title: "The Fall of Rome Parallels",
        description: "Drawing parallels between the decline of the Roman Empire and contemporary Western civilization, including economic, cultural, and political factors.",
        imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop",
        submitterId: "user_1",
        citadelScore: 389,
        rootNodeId: "node_rome",
        category: "history",
        controversyLevel: "medium",
        createdAt: "2025-07-30T11:00:00Z",
        tags: ["rome", "decline", "civilization", "history", "western"]
    },
    {
        id: "meme_6",
        title: "Fiat Currency Endgame",
        description: "The argument that all fiat currencies eventually collapse due to the inherent incentives for governments to inflate the money supply.",
        imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=300&fit=crop",
        submitterId: "user_3",
        citadelScore: 156,
        rootNodeId: "node_fiat",
        category: "economics",
        controversyLevel: "high",
        createdAt: "2025-06-12T09:30:00Z",
        tags: ["fiat", "currency", "inflation", "money", "economics"]
    },
    {
        id: "meme_7",
        title: "The Logos and Western Thought",
        description: "Exploring how the Greek concept of Logos (reason, order, meaning) became foundational to Western philosophy, science, and law.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        submitterId: "user_4",
        citadelScore: 678,
        rootNodeId: "node_logos",
        category: "philosophy",
        controversyLevel: "low",
        createdAt: "2025-05-25T13:45:00Z",
        tags: ["logos", "philosophy", "reason", "western", "greek"]
    },
    {
        id: "meme_8",
        title: "Art as Civilizational Memory",
        description: "The role of art in preserving and transmitting civilizational values, contrasted with modern art's break from tradition.",
        imageUrl: "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&h=300&fit=crop",
        submitterId: "user_5",
        citadelScore: 234,
        rootNodeId: "node_art",
        category: "culture",
        controversyLevel: "medium",
        createdAt: "2025-04-08T15:20:00Z",
        tags: ["art", "culture", "tradition", "modernism", "civilization"]
    }
];

// ============================================================================
// GRAPH NODES - The knowledge graph (AEGIS Blueprint Compliant)
// ============================================================================
let nodes = {
    // Dead Internet Theory Graph
    "node_dead_internet": {
        id: "node_dead_internet",
        label: "Dead Internet Theory",
        type: "MEME",
        content: "The claim that the internet is now predominantly populated by bot activity and AI content.",
        provenance: {
            source: "Various online discussions and reports",
            author: "Anonymous internet researchers",
            year: "2010s-present",
            verifiedScanLink: "IPFS_Hash_DeadInternet_2024",
            citation: "Emerging from 4chan and Reddit discussions"
        },
        intrinsicProperties: [
            "High_Agency",
            "Truth_Seeking",
            "Technological_Literacy"
        ],
        controversyLevel: "high",
        citadelScore: 78,
        stats: { verified: 45, disputed: 12 },
        category: "culture"
    },
    "node_bot_report": {
        id: "node_bot_report",
        label: "2024 Bot Traffic Report",
        type: "STATISTIC",
        content: "Analysis showing 47% of internet traffic may be automated",
        provenance: {
            source: "Bot Traffic Report 2024",
            author: "Imperva Cybersecurity",
            year: "2024",
            verifiedScanLink: "IPFS_Hash_Imperva_BotReport_2024",
            citation: "Imperva. (2024). Bot Traffic Report."
        },
        intrinsicProperties: [
            "Empirical_Data",
            "Technological_Assessment"
        ],
        controversyLevel: "medium",
        citadelScore: 95,
        sourceType: "PDF Report",
        verified: true,
        author: "Imperva",
        year: 2024,
        content: "Imperva Bad Bot Report 2024 indicates 49.6% of internet traffic is from automated bots.",
        url: "https://www.imperva.com/resources/reports/2024-bad-bot-report.pdf"
    },
    "node_baudrillard": {
        id: "node_baudrillard",
        label: "Simulacra & Simulation",
        type: "TEXT",
        content: "Philosophical treatise on reality vs. symbols. The 'precession of simulacra' predicts digital unreality.",
        provenance: {
            source: "Simulacra and Simulation",
            author: "Jean Baudrillard",
            year: "1981",
            verifiedScanLink: "IPFS_Hash_Baudrillard_Simulacra_1981",
            citation: "Baudrillard, J. (1981). Simulacra and Simulation."
        },
        intrinsicProperties: [
            "Philosophical_Depth",
            "Cultural_Critique",
            "Postmodern_Theory"
        ],
        controversyLevel: "medium",
        citadelScore: 87,
        sourceType: "Book (1981)",
        verified: true
    },
    "node_human_users": {
        id: "node_human_users",
        label: "Human User Growth",
        type: "STATISTIC",
        content: "Global connectivity index shows 500M new human users in 2024, contradicting total bot dominance.",
        provenance: {
            source: "Measuring Digital Development: Facts and Figures 2024",
            author: "International Telecommunication Union (ITU)",
            year: "2024",
            verifiedScanLink: "IPFS_Hash_ITU_DigitalDev_2024",
            citation: "ITU. (2024). Measuring Digital Development: Facts and Figures."
        },
        intrinsicProperties: [
            "Empirical_Data",
            "Global_Perspective",
            "Connectivity_Metrics"
        ],
        controversyLevel: "low",
        citadelScore: 92,
        sourceType: "Data Set",
        verified: true
    },
    
    // Borders Graph
    "node_borders": {
        id: "node_borders",
        label: "Civilization Requires Borders",
        type: "MEME",
        content: "The argument that defined territorial boundaries are essential for maintaining distinct cultures and legal systems.",
        stats: { verified: 156, disputed: 23 },
        category: "politics"
    },
    "node_scruton": {
        id: "node_scruton",
        label: "Roger Scruton on Nationhood",
        type: "TEXT",
        sourceType: "Book (2017)",
        author: "Roger Scruton",
        year: 2017,
        content: "Scruton argues that loyalty to territory creates the framework for democratic accountability.",
        verified: true
    },
    "node_rome_fall": {
        id: "node_rome_fall",
        label: "Fall of Rome",
        type: "EVENT",
        sourceType: "Historical Event",
        year: 476,
        content: "The fall of the Western Roman Empire coincided with the breakdown of border control and mass migration.",
        verified: true
    },
    "node_border_stats": {
        id: "node_border_stats",
        label: "Border Crossing Statistics 2024",
        type: "STATISTIC",
        sourceType: "Government Data",
        author: "CBP",
        year: 2024,
        content: "US Customs and Border Protection data on unauthorized border crossings.",
        verified: true
    },
    "node_open_borders": {
        id: "node_open_borders",
        label: "Open Borders Are Beneficial",
        type: "MEME",
        content: "The claim that removing national borders would lead to greater global prosperity and human flourishing.",
        provenance: {
            source: "Various progressive policy discussions",
            author: "Multiple economists and activists",
            year: "2010s-present",
            verifiedScanLink: "IPFS_Hash_OpenBorders_Discussions",
            citation: "Open Borders: The Science and Ethics of Immigration (Caplan & Weinersmith, 2019)"
        },
        intrinsicProperties: [
            "Global_Humanitarianism",
            "Economic_Efficiency",
            "Cultural_Exchange"
        ],
        controversyLevel: "high",
        citadelScore: 145,
        stats: { verified: 89, disputed: 156 },
        category: "politics"
    },
    "node_caplan_weinersmith": {
        id: "node_caplan_weinersmith",
        label: "Open Borders Book",
        type: "TEXT",
        content: "Comprehensive economic analysis showing open borders could increase global GDP by 50-150%.",
        provenance: {
            source: "Open Borders: The Science and Ethics of Immigration",
            author: "Bryan Caplan & Zach Weinersmith",
            year: "2019",
            verifiedScanLink: "IPFS_Hash_CaplanWeinersmith_2019",
            citation: "Caplan, B., & Weinersmith, Z. (2019). Open Borders: The Science and Ethics of Immigration."
        },
        intrinsicProperties: [
            "Economic_Analysis",
            "Utilitarian_Ethics",
            "Migration_Studies"
        ],
        controversyLevel: "high",
        citadelScore: 132,
        sourceType: "Book (2019)",
        verified: true
    },
    "node_border_crime": {
        id: "node_border_crime",
        label: "Border Security Reduces Crime",
        type: "STATISTIC",
        content: "US border security improvements correlate with reduced violent crime rates in border states.",
        provenance: {
            source: "FBI Uniform Crime Reporting Program",
            author: "Federal Bureau of Investigation",
            year: "2023",
            verifiedScanLink: "IPFS_Hash_FBI_CrimeStats_2023",
            citation: "FBI. (2023). Crime in the United States."
        },
        intrinsicProperties: [
            "Public_Safety",
            "Law_Enforcement_Data",
            "Criminology"
        ],
        controversyLevel: "high",
        citadelScore: 118,
        sourceType: "Government Statistics",
        verified: true
    },
    
    // Logos Graph
    "node_logos": {
        id: "node_logos",
        label: "The Logos and Western Thought",
        type: "MEME",
        content: "The Greek concept of Logos became foundational to Western philosophy, science, and law.",
        stats: { verified: 234, disputed: 5 },
        category: "philosophy"
    },
    "node_heraclitus": {
        id: "node_heraclitus",
        label: "Heraclitus on Logos",
        type: "TEXT",
        sourceType: "Fragment",
        author: "Heraclitus",
        year: -500,
        content: "Logos as the rational principle governing the universe: 'All things come to be in accordance with this Logos.'",
        verified: true
    },
    "node_john_gospel": {
        id: "node_john_gospel",
        label: "Gospel of John 1:1",
        type: "TEXT",
        sourceType: "Religious Text",
        author: "John the Evangelist",
        year: 90,
        content: "'In the beginning was the Logos, and the Logos was with God, and the Logos was God.'",
        verified: true
    },
    "node_stoics": {
        id: "node_stoics",
        label: "Stoic Philosophy",
        type: "CONCEPT",
        content: "The Stoics developed Logos into a systematic philosophy of reason, nature, and virtue.",
        verified: true
    },

    // Bureaucracy Graph
    "node_bureaucracy": {
        id: "node_bureaucracy",
        label: "Democracy Dies in Bureaucracy",
        type: "MEME",
        content: "Democratic institutions can be subverted by unelected administrative bodies.",
        stats: { verified: 89, disputed: 18 },
        category: "politics"
    },
    "node_chevron": {
        id: "node_chevron",
        label: "Chevron Doctrine",
        type: "EVENT",
        sourceType: "Legal Precedent",
        year: 1984,
        content: "Supreme Court case establishing judicial deference to administrative agency interpretations.",
        verified: true
    },
    "node_federal_register": {
        id: "node_federal_register",
        label: "Federal Register Growth",
        type: "STATISTIC",
        sourceType: "Government Data",
        year: 2024,
        content: "The Federal Register has grown from 2,620 pages (1936) to over 80,000 pages annually.",
        verified: true
    },
    
    // Great Filter Graph
    "node_great_filter": {
        id: "node_great_filter",
        label: "The Great Filter",
        type: "MEME",
        content: "A hypothetical barrier that prevents civilizations from reaching interstellar capability.",
        stats: { verified: 67, disputed: 8 },
        category: "science"
    },
    "node_hanson": {
        id: "node_hanson",
        label: "Robin Hanson's Paper",
        type: "TEXT",
        sourceType: "Academic Paper",
        author: "Robin Hanson",
        year: 1998,
        content: "Original formulation of the Great Filter argument in 'The Great Filter - Are We Almost Past It?'",
        verified: true
    },
    "node_fermi": {
        id: "node_fermi",
        label: "Fermi Paradox",
        type: "CONCEPT",
        author: "Enrico Fermi",
        year: 1950,
        content: "The apparent contradiction between lack of evidence for extraterrestrial life and high probability estimates.",
        verified: true
    },

    // Rome Graph
    "node_rome": {
        id: "node_rome",
        label: "Fall of Rome Parallels",
        type: "MEME",
        content: "Drawing parallels between Roman decline and contemporary Western civilization.",
        stats: { verified: 145, disputed: 32 },
        category: "history"
    },
    "node_gibbon": {
        id: "node_gibbon",
        label: "Decline and Fall of the Roman Empire",
        type: "TEXT",
        sourceType: "Book (1776-1789)",
        author: "Edward Gibbon",
        year: 1776,
        content: "Gibbon's analysis of Roman decline through immorality, barbarian invasion, and Christianity.",
        verified: true
    },
    "node_currency_debasement": {
        id: "node_currency_debasement",
        label: "Roman Currency Debasement",
        type: "STATISTIC",
        sourceType: "Historical Data",
        year: 270,
        content: "Silver content in denarius fell from 95% (Nero) to 0.5% (Diocletian), causing hyperinflation.",
        verified: true
    },

    // Fiat Currency Graph
    "node_fiat": {
        id: "node_fiat",
        label: "Fiat Currency Endgame",
        type: "MEME",
        content: "All fiat currencies eventually collapse due to inflationary pressures.",
        stats: { verified: 56, disputed: 28 },
        category: "economics"
    },
    "node_nixon": {
        id: "node_nixon",
        label: "Nixon Shock (1971)",
        type: "EVENT",
        year: 1971,
        content: "Nixon ended the convertibility of the US dollar to gold, fully transitioning to fiat currency.",
        verified: true
    },
    "node_purchasing_power": {
        id: "node_purchasing_power",
        label: "Dollar Purchasing Power",
        type: "STATISTIC",
        sourceType: "BLS Data",
        year: 2024,
        content: "The dollar has lost over 96% of its purchasing power since 1913 (Federal Reserve creation).",
        verified: true
    },

    // Art Graph
    "node_art": {
        id: "node_art",
        label: "Art as Civilizational Memory",
        type: "MEME",
        content: "Art preserves and transmits civilizational values across generations.",
        stats: { verified: 89, disputed: 11 },
        category: "culture"
    },
    "node_sistine": {
        id: "node_sistine",
        label: "Sistine Chapel",
        type: "EVENT",
        year: 1512,
        content: "Michelangelo's ceiling encodes Christian theology and classical humanism in visual form.",
        verified: true
    },
    "node_duchamp": {
        id: "node_duchamp",
        label: "Duchamp's Fountain",
        type: "EVENT",
        year: 1917,
        content: "Marcel Duchamp's 'Fountain' represented the break from traditional aesthetics to conceptual art.",
        verified: true
    }
};

// ============================================================================
// GRAPH EDGES - Relationships between nodes
// ============================================================================
let edges = [
    // Dead Internet connections
    { id: "edge_1", from: "node_dead_internet", to: "node_bot_report", type: "SUPPORTS", label: "SUPPORTS", weight: 0.9, verified: true },
    { id: "edge_2", from: "node_dead_internet", to: "node_baudrillard", type: "CONTEXT", label: "DERIVES_FROM", weight: 0.7, verified: true },
    { id: "edge_3", from: "node_dead_internet", to: "node_human_users", type: "DISPUTES", label: "CONTRADICTS", weight: 0.6, verified: true },
    
    // Borders connections
    { id: "edge_4", from: "node_borders", to: "node_scruton", type: "SUPPORTS", label: "SUPPORTS", weight: 0.85, verified: true },
    { id: "edge_5", from: "node_borders", to: "node_rome_fall", type: "SUPPORTS", label: "SUPPORTS", weight: 0.75, verified: true },
    { id: "edge_6", from: "node_borders", to: "node_border_stats", type: "CONTEXT", label: "CONTEXT", weight: 0.8, verified: true },
    { id: "edge_7", from: "node_borders", to: "node_open_borders", type: "DISPUTES", label: "DISPUTES", weight: 0.7, verified: true },
    
    // Logos connections
    { id: "edge_8", from: "node_logos", to: "node_heraclitus", type: "CONTEXT", label: "DERIVES_FROM", weight: 0.95, verified: true },
    { id: "edge_9", from: "node_logos", to: "node_john_gospel", type: "SUPPORTS", label: "SUPPORTS", weight: 0.9, verified: true },
    { id: "edge_10", from: "node_logos", to: "node_stoics", type: "CONTEXT", label: "EXPANDS", weight: 0.85, verified: true },
    { id: "edge_11", from: "node_heraclitus", to: "node_stoics", type: "CONTEXT", label: "INFLUENCED", weight: 0.9, verified: true },
    
    // Bureaucracy connections
    { id: "edge_12", from: "node_bureaucracy", to: "node_chevron", type: "SUPPORTS", label: "SUPPORTS", weight: 0.85, verified: true },
    { id: "edge_13", from: "node_bureaucracy", to: "node_federal_register", type: "SUPPORTS", label: "SUPPORTS", weight: 0.8, verified: true },
    
    // Great Filter connections
    { id: "edge_14", from: "node_great_filter", to: "node_hanson", type: "CONTEXT", label: "DERIVES_FROM", weight: 0.95, verified: true },
    { id: "edge_15", from: "node_great_filter", to: "node_fermi", type: "CONTEXT", label: "ADDRESSES", weight: 0.9, verified: true },
    
    // Rome connections
    { id: "edge_16", from: "node_rome", to: "node_gibbon", type: "SUPPORTS", label: "SUPPORTS", weight: 0.9, verified: true },
    { id: "edge_17", from: "node_rome", to: "node_currency_debasement", type: "SUPPORTS", label: "SUPPORTS", weight: 0.85, verified: true },
    { id: "edge_18", from: "node_rome", to: "node_rome_fall", type: "CONTEXT", label: "CONTEXT", weight: 0.95, verified: true },
    
    // Fiat connections
    { id: "edge_19", from: "node_fiat", to: "node_nixon", type: "CONTEXT", label: "CONTEXT", weight: 0.9, verified: true },
    { id: "edge_20", from: "node_fiat", to: "node_purchasing_power", type: "SUPPORTS", label: "SUPPORTS", weight: 0.85, verified: true },
    { id: "edge_21", from: "node_fiat", to: "node_currency_debasement", type: "CONTEXT", label: "PARALLELS", weight: 0.7, verified: true },
    
    // Art connections
    { id: "edge_22", from: "node_art", to: "node_sistine", type: "SUPPORTS", label: "SUPPORTS", weight: 0.9, verified: true },
    { id: "edge_23", from: "node_art", to: "node_duchamp", type: "DISPUTES", label: "CHALLENGES", weight: 0.75, verified: true },
    
    // Cross-topic connections
    { id: "edge_24", from: "node_rome_fall", to: "node_currency_debasement", type: "CONTEXT", label: "CONTEXT", weight: 0.85, verified: true },
    { id: "edge_25", from: "node_logos", to: "node_art", type: "CONTEXT", label: "INFLUENCES", weight: 0.6, verified: true },
    
    // Immigration debate connections
    { id: "edge_26", from: "node_open_borders", to: "node_caplan_weinersmith", type: "SUPPORTS", label: "SUPPORTS", weight: 0.9, verified: true },
    { id: "edge_27", from: "node_open_borders", to: "node_border_crime", type: "DISPUTES", label: "CONTRADICTS", weight: 0.75, verified: true },
    { id: "edge_28", from: "node_borders", to: "node_border_crime", type: "SUPPORTS", label: "SUPPORTS", weight: 0.8, verified: true }
];

// ============================================================================
// DEBATES - Structured arguments with competing positions
// ============================================================================
let debates = [
    {
        id: "debate_1",
        title: "Should Nations Have Strict Border Controls?",
        description: "A structured debate on the necessity and ethics of national borders and immigration policy.",
        category: "politics",
        status: "active",
        createdAt: "2025-10-01T00:00:00Z",
        relatedMemeId: "meme_3",
        positions: [
            {
                id: "pos_1a",
                stance: "pro",
                title: "Borders are Essential for Sovereignty",
                summary: "Without defined borders, there can be no meaningful citizenship, law, or democratic accountability.",
                submitterId: "user_4",
                evidenceNodeIds: ["node_scruton", "node_rome_fall", "node_border_stats", "node_border_crime"],
                votes: { agree: 156, disagree: 45 }
            },
            {
                id: "pos_1b",
                stance: "con",
                title: "Open Borders Maximize Human Flourishing",
                summary: "Freedom of movement is a fundamental right; borders cause suffering and reduce global prosperity.",
                submitterId: "user_2",
                evidenceNodeIds: ["node_open_borders", "node_caplan_weinersmith"],
                votes: { agree: 89, disagree: 78 }
            }
        ],
        comments: [
            {
                id: "comment_1",
                positionId: "pos_1a",
                userId: "user_1",
                text: "The Roman example is compelling but we should also examine the successful multicultural empires like the Ottoman.",
                createdAt: "2025-10-02T14:30:00Z",
                votes: { up: 23, down: 5 }
            }
        ]
    },
    {
        id: "debate_2",
        title: "Is the Internet Becoming Inauthentic?",
        description: "Examining the claim that AI and bots are fundamentally changing the nature of online discourse.",
        category: "culture",
        status: "active",
        createdAt: "2025-11-10T00:00:00Z",
        relatedMemeId: "meme_1",
        positions: [
            {
                id: "pos_2a",
                stance: "pro",
                title: "The Internet is Dying",
                summary: "Bot traffic, AI content, and algorithmic manipulation have made genuine human connection increasingly rare online.",
                submitterId: "user_1",
                evidenceNodeIds: ["node_bot_report", "node_baudrillard"],
                votes: { agree: 67, disagree: 23 }
            },
            {
                id: "pos_2b",
                stance: "con",
                title: "Human Connection Persists",
                summary: "Despite challenges, authentic communities continue to thrive; technology is a tool, not a replacement.",
                submitterId: "user_5",
                evidenceNodeIds: ["node_human_users"],
                votes: { agree: 45, disagree: 34 }
            }
        ],
        comments: []
    },
    {
        id: "debate_3",
        title: "Will Fiat Currencies Survive Long-Term?",
        description: "Debating the sustainability of government-issued currencies not backed by physical commodities.",
        category: "economics",
        status: "active",
        createdAt: "2025-06-15T00:00:00Z",
        relatedMemeId: "meme_6",
        positions: [
            {
                id: "pos_3a",
                stance: "pro",
                title: "Fiat is Doomed",
                summary: "Historical precedent shows all fiat currencies eventually fail due to political incentives to inflate.",
                submitterId: "user_3",
                evidenceNodeIds: ["node_purchasing_power", "node_currency_debasement"],
                votes: { agree: 78, disagree: 34 }
            },
            {
                id: "pos_3b",
                stance: "con",
                title: "Modern Fiat is Different",
                summary: "Central bank independence and global trade create stabilizing forces that historical currencies lacked.",
                submitterId: "user_5",
                evidenceNodeIds: ["node_nixon"],
                votes: { agree: 56, disagree: 45 }
            }
        ],
        comments: []
    }
];

// ============================================================================
// EVIDENCE QUEUE - Pending verification
// ============================================================================
let evidenceQueue = [
    {
        id: "evidence_101",
        title: "Leaked click farm video",
        type: "VIDEO",
        url: "http://example.com/video.mp4",
        status: "pending",
        submitterId: "user_2",
        stake: 100,
        reasoning: "This video shows automated engagement, supporting the Dead Internet Theory.",
        votes: { verify: 12, dispute: 3 },
        voters: {},
        timeRemaining: "23h 15m",
        category: "culture",
        relatedNodeId: "node_dead_internet"
    },
    {
        id: "evidence_102",
        title: "Study on social media content novelty",
        type: "PDF",
        url: "http://example.com/study.pdf",
        status: "pending",
        submitterId: "user_1",
        stake: 50,
        reasoning: "Research showing declining original content on major platforms.",
        votes: { verify: 8, dispute: 2 },
        voters: {},
        timeRemaining: "45h 30m",
        category: "culture",
        relatedNodeId: "node_dead_internet"
    },
    {
        id: "evidence_103",
        title: "European Border Agency Report",
        type: "PDF",
        url: "http://example.com/frontex-report.pdf",
        status: "pending",
        submitterId: "user_4",
        stake: 150,
        reasoning: "Official statistics on migration patterns and border enforcement outcomes.",
        votes: { verify: 34, dispute: 8 },
        voters: {},
        timeRemaining: "12h 45m",
        category: "politics",
        relatedNodeId: "node_borders"
    },
    {
        id: "evidence_104",
        title: "Federal Reserve Inflation Projections",
        type: "DATA",
        url: "http://example.com/fed-data.csv",
        status: "pending",
        submitterId: "user_3",
        stake: 75,
        reasoning: "Official Fed projections vs historical accuracy analysis.",
        votes: { verify: 15, dispute: 12 },
        voters: {},
        timeRemaining: "36h 00m",
        category: "economics",
        relatedNodeId: "node_fiat"
    }
];

module.exports = {
    users,
    memes,
    nodes,
    edges,
    evidenceQueue,
    categories,
    debates,
    applyPersistence,
    
    // Helper functions
    getUserById: (id) => Object.values(users).find(u => u.id === id),
    getUserByFingerprint: (fp) => users[fp],
    getMemeById: (id) => memes.find(m => m.id === id),
    getMemesByCategory: (cat) => cat === 'all' ? memes : memes.filter(m => m.category === cat),
    getNodeById: (id) => nodes[id],
    getDebateById: (id) => debates.find(d => d.id === id),
    getDebatesByCategory: (cat) => cat === 'all' ? debates : debates.filter(d => d.category === cat),
    getEvidenceByCategory: (cat) => cat === 'all' ? evidenceQueue : evidenceQueue.filter(e => e.category === cat),
    
    // Search function
    searchNodes: (query) => {
        const q = query.toLowerCase();
        return Object.values(nodes).filter(n => 
            n.label.toLowerCase().includes(q) || 
            n.content.toLowerCase().includes(q) ||
            (n.author && n.author.toLowerCase().includes(q))
        );
    },
    
    searchMemes: (query) => {
        const q = query.toLowerCase();
        return memes.filter(m =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.tags.some(t => t.toLowerCase().includes(q))
        );
    },
    
    searchDebates: (query) => {
        const q = query.toLowerCase();
        return debates.filter(d =>
            d.title.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q)
        );
    },
    
    // Global search
    search: (query) => {
        return {
            memes: module.exports.searchMemes(query),
            debates: module.exports.searchDebates(query),
            nodes: module.exports.searchNodes(query)
        };
    }
};
