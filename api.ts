import express, { Request, Response, NextFunction } from ‘express’;
import cors from ‘cors’;
import { v4 as uuidv4 } from ‘uuid’;
import GraphService from ‘./graph-service’;
import {
BaseNode,
MemeNode,
TextNode,
StatisticNode,
BaseEdge,
NodeType,
EdgeType,
GraphQuery
} from ‘./schema’;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: ‘50mb’ }));

// Initialize Graph Service
const graphService = new GraphService(
process.env.NEO4J_URI || ‘bolt://localhost:7687’,
process.env.NEO4J_USER || ‘neo4j’,
process.env.NEO4J_PASSWORD || ‘password’
);

// Error handling middleware
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
Promise.resolve(fn(req, res, next)).catch(next);
};

// ============================================================================
// MEME ENDPOINTS
// ============================================================================

// Create new meme
app.post(’/api/memes’, asyncHandler(async (req: Request, res: Response) => {
const { imageUrl, caption, tags } = req.body;

const meme: MemeNode = {
id: uuidv4(),
type: NodeType.MEME,
createdAt: new Date(),
updatedAt: new Date(),
metadata: {
title: caption || ‘Untitled Meme’,
description: ‘’,
tags: tags || [],
citadelScore: 0,
controversyLevel: ‘low’
},
content: {
imageUrl,
imageHash: ‘’, // Would compute hash here
caption,
altText: caption || ‘’
}
};

const nodeId = await graphService.createNode(meme);
res.status(201).json({ id: nodeId, meme });
}));

// Get meme with connections
app.get(’/api/memes/:id’, asyncHandler(async (req: Request, res: Response) => {
const { id } = req.params;
const depth = parseInt(req.query.depth as string) || 1;

const data = await graphService.getNodeWithConnections(id);

if (!data) {
return res.status(404).json({ error: ‘Meme not found’ });
}

const citadelScore = await graphService.calculateCitadelScore(id);

res.json({
…data,
citadelScore
});
}));

// Get meme feed
app.get(’/api/memes’, asyncHandler(async (req: Request, res: Response) => {
const skip = parseInt(req.query.skip as string) || 0;
const limit = parseInt(req.query.limit as string) || 20;

const memes = await graphService.getNodesByType(NodeType.MEME, skip, limit);

// Enrich with citadel scores
const enrichedMemes = await Promise.all(
memes.map(async (meme) => {
const score = await graphService.calculateCitadelScore(meme.id);
return { …meme, citadelScore: score };
})
);

res.json(enrichedMemes);
}));

// ============================================================================
// SOURCE ENDPOINTS
// ============================================================================

// Add text source
app.post(’/api/sources/text’, asyncHandler(async (req: Request, res: Response) => {
const { text, excerpt, provenance, tags } = req.body;

const textNode: TextNode = {
id: uuidv4(),
type: NodeType.TEXT,
createdAt: new Date(),
updatedAt: new Date(),
metadata: {
title: provenance.title,
description: excerpt,
tags: tags || [],
citadelScore: 0,
controversyLevel: ‘low’
},
content: {
text,
excerpt
},
provenance
};

const nodeId = await graphService.createNode(textNode);
res.status(201).json({ id: nodeId, textNode });
}));

// Add statistic
app.post(’/api/sources/statistic’, asyncHandler(async (req: Request, res: Response) => {
const { value, metric, unit, context, methodology, provenance, tags } = req.body;

const statNode: StatisticNode = {
id: uuidv4(),
type: NodeType.STATISTIC,
createdAt: new Date(),
updatedAt: new Date(),
metadata: {
title: `${metric}: ${value}`,
description: context,
tags: tags || [],
citadelScore: 0,
controversyLevel: ‘low’
},
content: {
value,
metric,
unit,
context
},
methodology,
provenance
};

const nodeId = await graphService.createNode(statNode);
res.status(201).json({ id: nodeId, statNode });
}));

// ============================================================================
// CONNECTION ENDPOINTS
// ============================================================================

// Create connection between nodes
app.post(’/api/connections’, asyncHandler(async (req: Request, res: Response) => {
const { sourceId, targetId, type, reasoning, confidence, userId } = req.body;

if (!Object.values(EdgeType).includes(type)) {
return res.status(400).json({ error: ‘Invalid edge type’ });
}

const edge: BaseEdge = {
id: uuidv4(),
sourceId,
targetId,
type,
weight: confidence || 0.8,
createdBy: userId || ‘anonymous’,
metadata: {
reasoning,
confidence: confidence || 0.8,
citations: []
}
};

const edgeId = await graphService.createEdge(edge);

// Recalculate citadel scores for both nodes
const sourceScore = await graphService.calculateCitadelScore(sourceId);
const targetScore = await graphService.calculateCitadelScore(targetId);

res.status(201).json({
id: edgeId,
edge,
updatedScores: {
source: sourceScore,
target: targetScore
}
});
}));

// Find connection path between two nodes
app.get(’/api/connections/path’, asyncHandler(async (req: Request, res: Response) => {
const { from, to } = req.query;

if (!from || !to) {
return res.status(400).json({ error: ‘Missing from or to parameters’ });
}

const path = await graphService.findConnectionPath(from as string, to as string);

if (!path) {
return res.status(404).json({ error: ‘No path found’ });
}

res.json(path);
}));

// ============================================================================
// EXPLORATION ENDPOINTS
// ============================================================================

// Explore graph from a starting point (the “rabbit hole”)
app.post(’/api/explore’, asyncHandler(async (req: Request, res: Response) => {
const query: GraphQuery = {
startNodeId: req.body.startNodeId,
maxDepth: req.body.maxDepth || 3,
edgeTypes: req.body.edgeTypes,
minWeight: req.body.minWeight || 0.5,
excludeDisputed: req.body.excludeDisputed !== false
};

const paths = await graphService.exploreGraph(query);

res.json({
startNode: query.startNodeId,
depth: query.maxDepth,
pathsFound: paths.length,
paths
});
}));

// Search across all nodes
app.get(’/api/search’, asyncHandler(async (req: Request, res: Response) => {
const { q, types, limit } = req.query;

if (!q) {
return res.status(400).json({ error: ‘Missing search query’ });
}

const nodeTypes = types
? (types as string).split(’,’).map(t => t.toUpperCase() as NodeType)
: undefined;

const results = await graphService.searchNodes(
q as string,
nodeTypes,
parseInt(limit as string) || 50
);

res.json({
query: q,
resultsCount: results.length,
results
});
}));

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

// Get citadel score breakdown
app.get(’/api/analytics/citadel-score/:id’, asyncHandler(async (req: Request, res: Response) => {
const { id } = req.params;
const breakdown = await graphService.calculateCitadelScore(id);
res.json(breakdown);
}));

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
console.error(err.stack);
res.status(500).json({
error: ‘Internal server error’,
message: process.env.NODE_ENV === ‘development’ ? err.message : undefined
});
});

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, () => {
console.log(`AEGIS API running on port ${PORT}`);
});

export default app;