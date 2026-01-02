import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { getGraph, getNode } from '../api';
import { 
    Share2, FileText, Video, Link, AlertTriangle, BookOpen, X, 
    Maximize2, Shield, GitBranch, User, Calendar, ExternalLink,
    ZoomIn, ZoomOut, Crosshair
} from 'lucide-react';

// Color schemes for different node types
const NODE_COLORS = {
    'MEME': '#a855f7',      // purple
    'TEXT': '#3b82f6',      // blue
    'STATISTIC': '#22c55e', // green
    'EVENT': '#f97316',     // orange
    'CONCEPT': '#06b6d4',   // cyan
    'PERSON': '#ec4899',    // pink
    'AXIOM': '#eab308',     // yellow
};

// Edge colors based on relationship type
const EDGE_COLORS = {
    'SUPPORTS': 'rgba(34, 197, 94, 0.7)',   // green
    'DISPUTES': 'rgba(239, 68, 68, 0.7)',   // red
    'CONTEXT': 'rgba(59, 130, 246, 0.5)',   // blue
    'DERIVES_FROM': 'rgba(139, 92, 246, 0.5)', // purple
    'RELATED': 'rgba(100, 116, 139, 0.4)',  // slate
    'CITES': 'rgba(6, 182, 212, 0.5)',      // cyan
    'EXPANDS': 'rgba(249, 115, 22, 0.5)',   // orange
    'INFLUENCED': 'rgba(236, 72, 153, 0.5)', // pink
    'PARALLELS': 'rgba(234, 179, 8, 0.5)',  // yellow
    'CHALLENGES': 'rgba(239, 68, 68, 0.6)', // red
    'ADDRESSES': 'rgba(59, 130, 246, 0.5)', // blue
};

const InspectorPanel = ({ selectedNode, onClose, onExploreConnections }) => {
    if (!selectedNode) {
        return (
            <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <GitBranch size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Select a node in the graph to inspect evidence, history, and disputes.</p>
                <p className="text-xs mt-2 text-slate-600">Click nodes to explore connections</p>
            </div>
        );
    }

    const nodeColor = NODE_COLORS[selectedNode.type] || '#64748b';
    
    return (
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-20 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span 
                                className="text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold"
                                style={{ 
                                    borderColor: nodeColor, 
                                    color: nodeColor,
                                    backgroundColor: `${nodeColor}10`
                                }}
                            >
                                {selectedNode.type || 'NODE'}
                            </span>
                            {selectedNode.verified && (
                                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                    <Shield size={10} />
                                    Verified
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-bold text-white leading-tight">{selectedNode.label}</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded"
                    >
                        <X size={18}/>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-grow overflow-y-auto space-y-6">
                {/* Summary */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Summary</label>
                    <p className="text-sm text-slate-300 leading-relaxed">{selectedNode.content}</p>
                </div>
                
                {/* Metadata */}
                {(selectedNode.author || selectedNode.year || selectedNode.sourceType) && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Source Information</label>
                        <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                            {selectedNode.author && (
                                <div className="flex items-center gap-2 text-sm">
                                    <User size={14} className="text-slate-500" />
                                    <span className="text-slate-300">{selectedNode.author}</span>
                                </div>
                            )}
                            {selectedNode.year && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar size={14} className="text-slate-500" />
                                    <span className="text-slate-300">{selectedNode.year}</span>
                                </div>
                            )}
                            {selectedNode.sourceType && (
                                <div className="flex items-center gap-2 text-sm">
                                    <FileText size={14} className="text-slate-500" />
                                    <span className="text-slate-300">{selectedNode.sourceType}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats (for MEME nodes) */}
                {selectedNode.stats && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Verification Status</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-green-400">{selectedNode.stats.verified}</div>
                                <div className="text-xs text-green-400/70">Supporting</div>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-red-400">{selectedNode.stats.disputed}</div>
                                <div className="text-xs text-red-400/70">Disputing</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* URL if available */}
                {selectedNode.url && (
                    <a 
                        href={selectedNode.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-700 p-2 rounded text-slate-400 group-hover:text-cyan-400">
                                <Link size={14}/>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-200">View Original Source</span>
                                <span className="text-[10px] text-slate-500 truncate max-w-[180px]">{selectedNode.url}</span>
                            </div>
                        </div>
                        <ExternalLink size={14} className="text-slate-500 group-hover:text-cyan-400"/>
                    </a>
                )}
                
                {/* Explore connections button */}
                <button 
                    onClick={() => onExploreConnections && onExploreConnections(selectedNode.id)}
                    className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <GitBranch size={16} />
                    Explore Deeper Connections
                </button>
            </div>
        </div>
    );
};


export default function GraphView({ rootNodeId, onExploreNode }) {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [selectedNode, setSelectedNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [depth, setDepth] = useState(2);
    const graphRef = useRef();

    useEffect(() => {
        if (!rootNodeId) {
            setLoading(false);
            return;
        };

        const fetchGraph = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getGraph(rootNodeId, depth);
                
                // Transform edges to links format for force-graph
                const links = data.edges.map(edge => ({
                    source: edge.from,
                    target: edge.to,
                    type: edge.type,
                    label: edge.label,
                    weight: edge.weight || 0.5
                }));

                // Add value property for node sizing
                const nodes = data.nodes.map(node => ({
                    ...node,
                    val: node.type === 'MEME' ? 20 : 12 // Root nodes are larger
                }));

                setGraphData({ nodes, links });
            } catch (e) {
                setError(e.message);
                console.error("Failed to fetch graph data:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchGraph();
    }, [rootNodeId, depth]);

    useEffect(() => {
        // Zoom to fit all nodes on new data
        if (graphData.nodes.length > 0 && graphRef.current) {
            setTimeout(() => {
                graphRef.current.zoomToFit(400, 50);
            }, 100);
        }
    }, [graphData]);

    const handleNodeClick = useCallback((node) => {
        setSelectedNode(node);
        if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(2, 1000);
        }
    }, []);

    const handleZoomIn = () => {
        if (graphRef.current) {
            const currentZoom = graphRef.current.zoom();
            graphRef.current.zoom(currentZoom * 1.5, 500);
        }
    };

    const handleZoomOut = () => {
        if (graphRef.current) {
            const currentZoom = graphRef.current.zoom();
            graphRef.current.zoom(currentZoom / 1.5, 500);
        }
    };

    const handleCenter = () => {
        if (graphRef.current) {
            graphRef.current.zoomToFit(500, 50);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mb-4"></div>
                    <p className="text-slate-400">Loading knowledge graph...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-950">
                <div className="text-center text-red-400">
                    <AlertTriangle size={48} className="mx-auto mb-4" />
                    <p>Error loading graph: {error}</p>
                </div>
            </div>
        );
    }
    
    if (!rootNodeId) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-950">
                <div className="text-center text-slate-500">
                    <GitBranch size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Select a claim from the feed to explore its connections.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex bg-slate-950 text-slate-200 font-sans">
            {/* Graph Area */}
            <div className="flex-grow relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
                <ForceGraph2D
                    ref={graphRef}
                    graphData={graphData}
                    nodeLabel="label"
                    nodeVal="val"
                    onNodeClick={handleNodeClick}
                    linkColor={link => EDGE_COLORS[link.type] || 'rgba(100, 116, 139, 0.3)'}
                    linkWidth={link => 1 + (link.weight || 0.5) * 2}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleWidth={2}
                    linkDirectionalParticleSpeed={0.005}
                    linkLabel={link => link.label}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.label;
                        const fontSize = Math.max(10 / globalScale, 3);
                        ctx.font = `${fontSize}px Inter, sans-serif`;
                        const textWidth = ctx.measureText(label).width;
                        const r = Math.sqrt(node.val || 10) * 1.5;

                        // Draw glow for selected node
                        if (node === selectedNode) {
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI, false);
                            ctx.fillStyle = 'rgba(34, 211, 238, 0.3)';
                            ctx.fill();
                        }

                        // Draw node circle
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node === selectedNode 
                            ? '#22d3ee' 
                            : NODE_COLORS[node.type] || '#64748b';
                        ctx.fill();
                        
                        // Draw border
                        ctx.strokeStyle = node === selectedNode ? '#fff' : 'rgba(255,255,255,0.2)';
                        ctx.lineWidth = node === selectedNode ? 2 : 1;
                        ctx.stroke();

                        // Draw label background
                        if (globalScale > 0.5) {
                            const bgPadding = 3;
                            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                            ctx.fillRect(
                                node.x - textWidth / 2 - bgPadding, 
                                node.y + r + 4, 
                                textWidth + bgPadding * 2, 
                                fontSize + bgPadding
                            );
                            
                            // Draw label text
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'top';
                            ctx.fillStyle = '#e2e8f0';
                            ctx.fillText(label, node.x, node.y + r + 5);
                        }
                    }}
                    cooldownTicks={100}
                    d3AlphaDecay={0.02}
                    d3VelocityDecay={0.3}
                    warmupTicks={50}
                />
                
                {/* Legend */}
                <div className="absolute top-16 left-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800 backdrop-blur-sm z-20">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Node Types</h4>
                    <div className="space-y-2 text-xs">
                        {Object.entries(NODE_COLORS).slice(0, 5).map(([type, color]) => (
                            <div key={type} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                                <span className="text-slate-300">{type}</span>
                            </div>
                        ))}
                    </div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mt-4 mb-3">Relationships</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-green-500"></div>
                            <span className="text-slate-300">Supports</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-red-500"></div>
                            <span className="text-slate-300">Disputes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-blue-500"></div>
                            <span className="text-slate-300">Context</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute top-16 right-4 flex flex-col gap-2 z-20">
                    <button 
                        onClick={handleZoomIn}
                        className="bg-slate-800/90 hover:bg-slate-700 p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn size={18} />
                    </button>
                    <button 
                        onClick={handleZoomOut}
                        className="bg-slate-800/90 hover:bg-slate-700 p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <button 
                        onClick={handleCenter}
                        className="bg-slate-800/90 hover:bg-slate-700 p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Fit to View"
                    >
                        <Crosshair size={18} />
                    </button>
                </div>

                {/* Depth control */}
                <div className="absolute bottom-4 left-4 bg-slate-900/90 px-4 py-3 rounded-lg border border-slate-800 z-20">
                    <label className="text-xs font-bold text-slate-400 uppercase">Graph Depth</label>
                    <div className="flex items-center gap-3 mt-2">
                        <input 
                            type="range" 
                            min="1" 
                            max="4" 
                            value={depth}
                            onChange={(e) => setDepth(parseInt(e.target.value))}
                            className="w-24"
                        />
                        <span className="text-cyan-400 font-bold">{depth}</span>
                    </div>
                </div>
            </div>

            {/* Inspector Panel */}
            <InspectorPanel 
                selectedNode={selectedNode} 
                onClose={() => setSelectedNode(null)}
                onExploreConnections={(nodeId) => {
                    // Set the clicked node as the new root and refetch the graph
                    if (nodeId && nodeId !== rootNodeId && onExploreNode) {
                        onExploreNode(nodeId);
                    }
                }}
            />
        </div>
    );
}
