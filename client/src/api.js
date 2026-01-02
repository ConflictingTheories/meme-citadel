// ============================================================================
// AEGIS MEME CITADEL - API Client
// Centralized API calls to the backend
// ============================================================================

const API_BASE_URL = 'http://localhost:3001/api';

// Helper for making requests
export async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return response.json();
}

// ============================================================================
// GRAPH
// ============================================================================
export const getGraph = (nodeId) => apiRequest(`/graph/${nodeId}`);

export const getNode = (id) => apiRequest(`/nodes/${id}`);

// ============================================================================
// CATEGORIES
// ============================================================================
export const getCategories = () => apiRequest('/categories');

// ============================================================================
// MEMES / CLAIMS
// ============================================================================
export const getFeed = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/feed${query ? `?${query}` : ''}`);
};

export const getMeme = (id) => apiRequest(`/memes/${id}`);

export const createMeme = (memeData) => apiRequest('/memes', {
    method: 'POST',
    body: JSON.stringify(memeData),
});

// ============================================================================
// USER INTERACTIONS
// ============================================================================
export const submitFingerprint = (browserFingerprint) => apiRequest('/fingerprint', {
    method: 'POST',
    body: JSON.stringify({ browserFingerprint }),
});

export const addComment = (nodeId, text, userId) => apiRequest(`/nodes/${nodeId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text, userId }),
});

export const addLink = (nodeId, url, title, description, type, userId) => apiRequest(`/nodes/${nodeId}/links`, {
    method: 'POST',
    body: JSON.stringify({ url, title, description, type, userId }),
});

export const voteOnNode = (nodeId, vote, userId) => apiRequest(`/nodes/${nodeId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ vote, userId }),
});

export const createNode = (nodeData) => apiRequest('/nodes', {
    method: 'POST',
    body: JSON.stringify(nodeData),
});

export const createEdge = (edgeData) => apiRequest('/edges', {
    method: 'POST',
    body: JSON.stringify(edgeData),
});

// ============================================================================
// DEBATES
// ============================================================================
export const getDebates = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/debates${query ? `?${query}` : ''}`);
};

export const getDebate = (id) => apiRequest(`/debates/${id}`);

export const createDebate = (debateData) => apiRequest('/debates', {
    method: 'POST',
    body: JSON.stringify(debateData),
});

export const addPosition = (debateId, positionData) => 
    apiRequest(`/debates/${debateId}/positions`, {
        method: 'POST',
        body: JSON.stringify(positionData),
    });

export const voteOnPosition = (debateId, positionId, voteType) =>
    apiRequest(`/debates/${debateId}/positions/${positionId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ voteType }),
    });

export const addDebateComment = (debateId, commentData) =>
    apiRequest(`/debates/${debateId}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData),
    });

// ============================================================================
// VERIFICATION
// ============================================================================
export const getVerificationQueue = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/verification${query ? `?${query}` : ''}`);
};

export const submitEvidence = (evidenceData) => apiRequest('/evidence', {
    method: 'POST',
    body: JSON.stringify(evidenceData),
});

export const castVote = (evidenceId, voteData) => 
    apiRequest(`/vote/${evidenceId}`, {
        method: 'POST',
        body: JSON.stringify(voteData),
    });

// ============================================================================
// SEARCH
// ============================================================================
export const search = (query, type = null) => {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    return apiRequest(`/search?${params}`);
};

// ============================================================================
// USERS
// ============================================================================
export const getUserIdentity = () => apiRequest('/user/identity');

export const getUser = (id) => apiRequest(`/users/${id}`);

export const getLeaderboard = () => apiRequest('/leaderboard');

// ============================================================================
// STATS
// ============================================================================
export const getStats = () => apiRequest('/stats');
