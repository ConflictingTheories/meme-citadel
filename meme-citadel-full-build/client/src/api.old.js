const API_BASE_URL = 'http://localhost:3001/api';

export const getFeed = () => fetch(`${API_BASE_URL}/feed`).then(res => res.json());

export const getGraph = (rootNodeId) => fetch(`${API_BASE_URL}/graph/${rootNodeId}`).then(res => res.json());

export const getVerificationQueue = () => fetch(`${API_BASE_URL}/verification`).then(res => res.json());

export const getUserIdentity = () => fetch(`${API_BASE_URL}/user/identity`).then(res => res.json());

export const submitEvidence = (evidenceData) => {
    return fetch(`${API_BASE_URL}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidenceData),
    }).then(res => res.json());
};

export const castVote = (evidenceId, voteData) => {
    return fetch(`${API_BASE_URL}/vote/${evidenceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voteData),
    }).then(res => res.json());
};
