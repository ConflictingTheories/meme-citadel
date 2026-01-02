import neo4j, { Driver, Session } from ‘neo4j-driver’;
import {
BaseNode,
BaseEdge,
NodeType,
EdgeType,
GraphQuery,
GraphPath,
CitadelScoreBreakdown
} from ‘./schema’;

class GraphService {
private driver: Driver;

constructor(uri: string, username: string, password: string) {
this.driver = neo4j.driver(
uri,
neo4j.auth.basic(username, password)
);
}

async close(): Promise<void> {
await this.driver.close();
}

private getSession(): Session {
return this.driver.session();
}

// Create a node in the graph
async createNode(node: BaseNode): Promise<string> {
const session = this.getSession();
try {
const result = await session.run(
`CREATE (n:${node.type} { id: $id, type: $type, createdAt: datetime($createdAt), updatedAt: datetime($updatedAt), metadata: $metadata, content: $content }) RETURN n.id as id`,
{
id: node.id,
type: node.type,
createdAt: node.createdAt.toISOString(),
updatedAt: node.updatedAt.toISOString(),
metadata: JSON.stringify(node.metadata),
content: JSON.stringify((node as any).content)
}
);
return result.records[0].get(‘id’);
} finally {
await session.close();
}
}

// Create relationship between nodes
async createEdge(edge: BaseEdge): Promise<string> {
const session = this.getSession();
try {
const result = await session.run(
`MATCH (source {id: $sourceId}) MATCH (target {id: $targetId}) CREATE (source)-[r:${edge.type} { id: $id, weight: $weight, createdBy: $createdBy, metadata: $metadata }]->(target) RETURN r.id as id`,
{
sourceId: edge.sourceId,
targetId: edge.targetId,
id: edge.id,
weight: edge.weight,
createdBy: edge.createdBy,
metadata: JSON.stringify(edge.metadata)
}
);
return result.records[0].get(‘id’);
} finally {
await session.close();
}
}

// Get node by ID with immediate connections
async getNodeWithConnections(nodeId: string): Promise<any> {
const session = this.getSession();
try {
const result = await session.run(
`MATCH (n {id: $nodeId}) OPTIONAL MATCH (n)-[r]-(connected) RETURN n,  collect(DISTINCT { relationship: type(r), direction: CASE  WHEN startNode(r) = n THEN 'outgoing' ELSE 'incoming' END, node: connected, weight: r.weight }) as connections`,
{ nodeId }
);

```
  if (result.records.length === 0) return null;

  const record = result.records[0];
  return {
    node: record.get('n').properties,
    connections: record.get('connections')
  };
} finally {
  await session.close();
}
```

}

// Calculate Citadel Score for a node
async calculateCitadelScore(nodeId: string): Promise<CitadelScoreBreakdown> {
const session = this.getSession();
try {
const result = await session.run(
`MATCH (n {id: $nodeId}) OPTIONAL MATCH (n)-[r:SUPPORTS|DERIVES_FROM]-(source) WHERE source.type IN ['TEXT', 'STATISTIC', 'EVENT'] RETURN  count(DISTINCT r) as totalConnections, count(DISTINCT CASE WHEN source.type = 'TEXT' THEN source END) as textSources, count(DISTINCT CASE WHEN source.type = 'STATISTIC' THEN source END) as statSources, count(DISTINCT CASE WHEN source.type = 'EVENT' THEN source END) as eventSources`,
{ nodeId }
);

```
  const record = result.records[0];
  return {
    totalConnections: record.get('totalConnections').toNumber(),
    verifiedSources: record.get('textSources').toNumber() + 
                    record.get('statSources').toNumber(),
    primarySources: record.get('textSources').toNumber(),
    secondarySources: record.get('statSources').toNumber(),
    userVerifications: 0 // Would need separate query for user verification tracking
  };
} finally {
  await session.close();
}
```

}

// Explore graph from a starting node (the “rabbit hole”)
async exploreGraph(query: GraphQuery): Promise<GraphPath[]> {
const session = this.getSession();
try {
const edgeFilter = query.edgeTypes
? query.edgeTypes.join(’|’)
: Object.values(EdgeType).join(’|’);

```
  const result = await session.run(
    `
    MATCH path = (start {id: $startNodeId})-[r:${edgeFilter}*1..${query.maxDepth}]-(end)
    WHERE ALL(rel in relationships(path) WHERE rel.weight >= $minWeight)
    WITH path, 
         reduce(s = 0, rel in relationships(path) | s + rel.weight) as pathStrength
    ORDER BY pathStrength DESC
    LIMIT 100
    RETURN 
      [node in nodes(path) | node] as nodes,
      [rel in relationships(path) | rel] as edges,
      pathStrength
    `,
    {
      startNodeId: query.startNodeId,
      minWeight: query.minWeight || 0
    }
  );

  return result.records.map(record => ({
    nodes: record.get('nodes').map((n: any) => ({
      ...n.properties,
      metadata: JSON.parse(n.properties.metadata),
      content: JSON.parse(n.properties.content)
    })),
    edges: record.get('edges').map((e: any) => ({
      ...e.properties,
      type: e.type,
      metadata: JSON.parse(e.properties.metadata)
    })),
    pathStrength: record.get('pathStrength')
  }));
} finally {
  await session.close();
}
```

}

// Find shortest path between two concepts
async findConnectionPath(
startNodeId: string,
endNodeId: string
): Promise<GraphPath | null> {
const session = this.getSession();
try {
const result = await session.run(
`MATCH path = shortestPath( (start {id: $startNodeId})-[*]-(end {id: $endNodeId}) ) RETURN  [node in nodes(path) | node] as nodes, [rel in relationships(path) | rel] as edges, reduce(s = 0, rel in relationships(path) | s + rel.weight) as pathStrength`,
{ startNodeId, endNodeId }
);

```
  if (result.records.length === 0) return null;

  const record = result.records[0];
  return {
    nodes: record.get('nodes').map((n: any) => ({
      ...n.properties,
      metadata: JSON.parse(n.properties.metadata),
      content: JSON.parse(n.properties.content)
    })),
    edges: record.get('edges').map((e: any) => ({
      ...e.properties,
      type: e.type,
      metadata: JSON.parse(e.properties.metadata)
    })),
    pathStrength: record.get('pathStrength')
  };
} finally {
  await session.close();
}
```

}

// Search nodes by metadata tags or text
async searchNodes(
searchTerm: string,
nodeTypes?: NodeType[],
limit: number = 50
): Promise<BaseNode[]> {
const session = this.getSession();
try {
const typeFilter = nodeTypes
? `WHERE n.type IN [${nodeTypes.map(t => `’${t}’`).join(',')}]`
: ‘’;

```
  const result = await session.run(
    `
    MATCH (n)
    ${typeFilter}
    WHERE n.metadata CONTAINS $searchTerm 
       OR n.content CONTAINS $searchTerm
    RETURN n
    LIMIT $limit
    `,
    { searchTerm, limit }
  );

  return result.records.map(record => {
    const node = record.get('n').properties;
    return {
      ...node,
      metadata: JSON.parse(node.metadata),
      content: JSON.parse(node.content)
    };
  });
} finally {
  await session.close();
}
```

}

// Get nodes by type with pagination
async getNodesByType(
nodeType: NodeType,
skip: number = 0,
limit: number = 50
): Promise<BaseNode[]> {
const session = this.getSession();
try {
const result = await session.run(
`MATCH (n:${nodeType}) RETURN n ORDER BY n.createdAt DESC SKIP $skip LIMIT $limit`,
{ skip, limit }
);

```
  return result.records.map(record => {
    const node = record.get('n').properties;
    return {
      ...node,
      metadata: JSON.parse(node.metadata),
      content: JSON.parse(node.content)
    };
  });
} finally {
  await session.close();
}
```

}
}

export default GraphService;