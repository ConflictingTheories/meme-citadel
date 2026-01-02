import React, { useState, useEffect, useRef } from 'react';
import { ForceGraph2D } from 'react-force-graph-2d';
import { Share2, FileText, Video, Link, AlertTriangle, BookOpen, X, Maximize2, Shield, GitBranch } from 'lucide-react';

const InspectorPanel = ({ selectedNode, onClose }) => {
    if (!selectedNode) {
        return (
            <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <GitBranch size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Select a node in the graph to inspect evidence, history, and disputes.</p>
            </div>
        );
    }
    
    return (
      <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-20">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-800/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${
                    selectedNode.type === 'dispute' ? 'border-red-500 text-red-400' : 'border-cyan-500 text-cyan-400'
                  } uppercase tracking-wider`}>
                    {selectedNode.type.toUpperCase()}
                  </span>
                  {selectedNode.verified && <Shield size={14} className="text-green-400" />}
                </div>
                <h2 className="text-lg font-bold text-white leading-tight">{selectedNode.label}</h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-grow overflow-y-auto space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Abstract / Summary</label>
                    <p className="text-sm text-slate-300 leading-relaxed">{selectedNode.content}</p>
                </div>
                
                {selectedNode.author && <p className="text-xs text-slate-400">By: {selectedNode.author}</p>}

                <div className="space-y-3 pt-4 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-500 uppercase">Source Metadata</label>
                    <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800 hover:border-slate-600 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-800 p-1.5 rounded text-slate-400"><Link size={14}/></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-200">View Original Source</span>
                                <span className="text-[10px] text-slate-500">IPFS • Immutable</span>
                            </div>
                        </div>
                        <Maximize2 size={14} className="text-slate-500"/>
                    </div>
                </div>
                
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded flex items-center justify-center gap-2 transition-colors">
                    <GitBranch size={16} />
                    View Evidence Thread
                </button>
            </div>
      </div>
    );
};


export default function GraphView({ rootNodeId }) {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [selectedNode, setSelectedNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                const res = await fetch(`http://localhost:3001/api/graph/${rootNodeId}`);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                
                // The API gives us 'edges', but react-force-graph needs 'links' with 'source' and 'target'
                const links = data.edges.map(edge => ({
                    source: edge.from,
                    target: edge.to,
                    type: edge.type
                }));

                setGraphData({ nodes: data.nodes, links });
            } catch (e) {
                setError(e.message);
                console.error("Failed to fetch graph data:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchGraph();
    }, [rootNodeId]);

    useEffect(() => {
        // Zoom to fit all nodes on new data
        if (graphData.nodes.length > 0) {
            graphRef.current.zoomToFit(400);
        }
    }, [graphData]);

    const nodeIcon = (type) => {
        switch (type) {
            case 'MEME': return <Share2 size={20} />;
            case 'source': return <FileText size={16} />;
            case 'video': return <Video size={16} />;
            case 'history': return <BookOpen size={16} />;
            case 'dispute': return <AlertTriangle size={16} />;
            default: return <Link size={16} />;
        }
    }

    const nodeColor = (type) => {
        switch (type) {
            case 'MEME': return '#a855f7'; // purple-500
            case 'source': return '#22c55e'; // green-500
            case 'dispute': return '#ef4444'; // red-500
            case 'history': return '#3b82f6'; // blue-500
            case 'video': return '#eab308'; // yellow-500
            default: return '#64748b'; // slate-500
        }
    }

    const handleNodeClick = (node) => {
        setSelectedNode(node);
        // Center camera on node
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(2, 1000);
    };

    if (loading) return <div className="text-slate-400 text-center p-10">Loading graph...</div>;
    if (error) return <div className="text-red-400 text-center p-10">Error loading graph: {error}</div>;
    if (!rootNodeId) return <div className="text-slate-500 text-center p-10">Select a meme from the feed to explore its connections.</div>;

    return (
        <div className="w-full h-full flex bg-slate-950 text-slate-200 font-sans">
            <div className="flex-grow relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
                <ForceGraph2D
                    ref={graphRef}
                    graphData={graphData}
                    nodeLabel="label"
                    nodeVal={10}
                    onNodeClick={handleNodeClick}
                    linkColor={link => {
                        switch(link.type) {
                            case 'verified': return 'rgba(34, 197, 94, 0.5)';
                            case 'disputed': return 'rgba(239, 68, 68, 0.5)';
                            case 'root': return 'rgba(59, 130, 246, 0.5)';
                            default: return 'rgba(100, 116, 139, 0.3)';
                        }
                    }}
                    linkWidth={2}
                    linkDirectionalParticles={1}
                    linkDirectionalParticleWidth={2}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.label;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        const textWidth = ctx.measureText(label).width;
                        const r = Math.sqrt(node.val) * 2.5;

                        // Draw background circle
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node === selectedNode ? 'cyan' : nodeColor(node.type);
                        ctx.fill();

                        // Draw label background
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                        ctx.fillRect(node.x - textWidth / 2 - 2, node.y + r + 2, textWidth + 4, fontSize + 2);
                        
                        // Draw label text
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'white';
                        ctx.fillText(label, node.x, node.y + r + fontSize / 2 + 3);
                    }}
                />
                 <div className="absolute top-4 left-4 bg-slate-900/80 p-3 rounded-lg border border-slate-800 backdrop-blur-sm z-20 text-xs space-y-2">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div>Verified Source</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>Disputed/Counter</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Historical Root</div>
                 </div>
            </div>
            <InspectorPanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>
    );
}