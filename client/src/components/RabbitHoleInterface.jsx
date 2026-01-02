import React, { useState, useEffect } from 'react';
import { getGraph, getNode, apiRequest } from '../api';
import {
    ChevronDown, ChevronUp, BookOpen, FileText, Video, Link,
    Shield, ArrowRight, Eye, Brain, ScrollText, Layers,
    MessageSquare, ExternalLink, ThumbsUp, ThumbsDown, Plus
} from 'lucide-react';

// Rabbit Hole Interface - The core AEGIS feature
// Transitions from Entertainment to Education
const RabbitHoleInterface = ({ memeId, onClose }) => {
    const [graphData, setGraphData] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [scrollOfTruth, setScrollOfTruth] = useState('');
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('demo_user_123'); // In real app, this would come from fingerprinting
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [newComment, setNewComment] = useState('');
    const [newLink, setNewLink] = useState({ url: '', title: '', description: '' });

    useEffect(() => {
        loadGraphData();
    }, [memeId]);

    const loadGraphData = async () => {
        try {
            const data = await getGraph(memeId);
            setGraphData(data);
            setSelectedNode(data.nodes.find(n => n.id === memeId));

            // Generate Scroll of Truth - auto-narrative
            generateScrollOfTruth(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load graph:', error);
            setLoading(false);
        }
    };

    const generateScrollOfTruth = (data) => {
        // Auto-generate narrative essay connecting the nodes
        const anchorNode = data.nodes.find(n => n.id === memeId);
        const philosophyNodes = data.nodes.filter(n => n.type === 'AXIOM' || n.type === 'TEXT');
        const historyNodes = data.nodes.filter(n => n.type === 'EVENT');
        const dataNodes = data.nodes.filter(n => n.type === 'STATISTIC');

        let narrative = `## The Scroll of Truth: ${anchorNode.label}\n\n`;

        narrative += `### The Claim\n${anchorNode.content}\n\n`;

        if (philosophyNodes.length > 0) {
            narrative += `### Philosophical Foundation\n`;
            philosophyNodes.forEach(node => {
                narrative += `- **${node.label}**: ${node.content}\n`;
                if (node.provenance) {
                    narrative += `  *Source: ${node.provenance.source} (${node.provenance.year})*\n`;
                }
            });
            narrative += '\n';
        }

        if (historyNodes.length > 0) {
            narrative += `### Historical Context\n`;
            historyNodes.forEach(node => {
                narrative += `- **${node.label}**: ${node.content}\n`;
                if (node.provenance) {
                    narrative += `  *Source: ${node.provenance.source} (${node.provenance.year})*\n`;
                }
            });
            narrative += '\n';
        }

        if (dataNodes.length > 0) {
            narrative += `### Empirical Evidence\n`;
            dataNodes.forEach(node => {
                narrative += `- **${node.label}**: ${node.content}\n`;
                if (node.provenance) {
                    narrative += `  *Source: ${node.provenance.source} (${node.provenance.year})*\n`;
                }
            });
            narrative += '\n';
        }

        narrative += `### Citadel Verification\n`;
        narrative += `**Citadel Score: ${anchorNode.citadelScore || 'Uncalculated'}**\n`;
        narrative += `**Controversy Level: ${anchorNode.controversyLevel || 'Unknown'}**\n`;
        narrative += `**Intrinsic Properties:** ${anchorNode.intrinsicProperties?.join(', ') || 'None specified'}\n\n`;

        narrative += `### Conclusion\n`;
        narrative += `This claim is supported by ${data.nodes.length} interconnected sources `;
        narrative += `across philosophy, history, and empirical data. `;
        narrative += `The citadel score indicates the depth of verification backing this idea.\n`;

        setScrollOfTruth(narrative);
    };

    const getNodeIcon = (type) => {
        switch (type) {
            case 'MEME': return <Brain className="w-4 h-4" />;
            case 'AXIOM': return <Shield className="w-4 h-4" />;
            case 'EVENT': return <ScrollText className="w-4 h-4" />;
            case 'STATISTIC': return <FileText className="w-4 h-4" />;
            case 'TEXT': return <BookOpen className="w-4 h-4" />;
            default: return <Layers className="w-4 h-4" />;
        }
    };

    const toggleNodeExpansion = (nodeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const addComment = async (nodeId, text) => {
        if (!text.trim()) return;

        try {
            const comment = await apiRequest(`/nodes/${nodeId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ text, userId }),
            });

            // Update the graph data with the new comment
            setGraphData(prevData => ({
                ...prevData,
                nodes: prevData.nodes.map(node =>
                    node.id === nodeId
                        ? { ...node, comments: [...(node.comments || []), comment] }
                        : node
                )
            }));

            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const addLink = async (nodeId, linkData) => {
        if (!linkData.url.trim()) return;

        try {
            const link = await apiRequest(`/nodes/${nodeId}/links`, {
                method: 'POST',
                body: JSON.stringify({ ...linkData, userId }),
            });

            // Update the graph data with the new link
            setGraphData(prevData => ({
                ...prevData,
                nodes: prevData.nodes.map(node =>
                    node.id === nodeId
                        ? { ...node, links: [...(node.links || []), link] }
                        : node
                )
            }));

            setNewLink({ url: '', title: '', description: '' });
        } catch (error) {
            console.error('Failed to add link:', error);
        }
    };

    const voteOnNode = async (nodeId, vote) => {
        try {
            const result = await apiRequest(`/nodes/${nodeId}/vote`, {
                method: 'POST',
                body: JSON.stringify({ vote, userId }),
            });

            // Update the graph data with the new vote counts
            setGraphData(prevData => ({
                ...prevData,
                nodes: prevData.nodes.map(node =>
                    node.id === nodeId
                        ? { ...node, votes: result.votes }
                        : node
                )
            }));
        } catch (error) {
            console.error('Failed to vote:', error);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-slate-300">Descending into the Citadel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">AEGIS Citadel</h2>
                        <span className="text-sm text-slate-400">Rabbit Hole Interface</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Phase A: The Hook (Entertainment) */}
                <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Phase A: The Hook</h3>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                                <Brain className="w-8 h-8 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">{selectedNode?.label}</h4>
                                <p className="text-slate-300 text-sm">{selectedNode?.content}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                        🛡️ Citadel Score: {selectedNode?.citadelScore || 'N/A'}
                                    </span>
                                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                                        Controversy: {selectedNode?.controversyLevel || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phase B: The Descent (Education) */}
                <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-xl p-6 border border-blue-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <ArrowRight className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Phase B: The Descent</h3>
                        <span className="text-sm text-slate-400">Knowledge Graph Exploration</span>
                    </div>

                    {/* Graph Visualization Placeholder */}
                    <div className="bg-slate-800 rounded-lg p-6 mb-6">
                        <div className="text-center text-slate-400 mb-4">
                            Interactive Force-Directed Graph Would Render Here
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {graphData?.nodes?.slice(0, 6).map(node => (
                                <div key={node.id} className="bg-slate-700 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${getNodeColor(node.type)}`}></div>
                                        {getNodeIcon(node.type)}
                                        <span className="text-white text-sm font-medium">{node.label}</span>
                                        <button
                                            onClick={() => toggleNodeExpansion(node.id)}
                                            className="ml-auto text-slate-400 hover:text-white"
                                        >
                                            {expandedNodes.has(node.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-slate-300 text-xs">{node.content?.substring(0, 80)}...</p>
                                    {node.provenance && (
                                        <div className="mt-2 text-xs text-slate-400">
                                            Source: {node.provenance.source} ({node.provenance.year})
                                        </div>
                                    )}

                                    {/* Voting */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => voteOnNode(node.id, 'up')}
                                            className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
                                        >
                                            <ThumbsUp className="w-3 h-3" />
                                            {node.votes?.up || 0}
                                        </button>
                                        <button
                                            onClick={() => voteOnNode(node.id, 'down')}
                                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                                        >
                                            <ThumbsDown className="w-3 h-3" />
                                            {node.votes?.down || 0}
                                        </button>
                                        <span className="text-xs text-slate-500 ml-auto">
                                            {node.comments?.length || 0} comments
                                        </span>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedNodes.has(node.id) && (
                                        <div className="mt-3 pt-3 border-t border-slate-600">
                                            {/* Comments Section */}
                                            <div className="mb-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MessageSquare className="w-3 h-3 text-slate-400" />
                                                    <span className="text-xs text-slate-400">Comments</span>
                                                </div>
                                                {node.comments?.map(comment => (
                                                    <div key={comment.id} className="bg-slate-800 rounded p-2 mb-2">
                                                        <p className="text-xs text-slate-300">{comment.text}</p>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a comment..."
                                                        className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && addComment(node.id, newComment)}
                                                    />
                                                    <button
                                                        onClick={() => addComment(node.id, newComment)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Links Section */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                                    <span className="text-xs text-slate-400">Citations & Links</span>
                                                </div>
                                                {node.links?.map(link => (
                                                    <div key={link.id} className="bg-slate-800 rounded p-2 mb-2">
                                                        <a
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-400 hover:text-blue-300"
                                                        >
                                                            {link.title || link.url}
                                                        </a>
                                                        {link.description && (
                                                            <p className="text-xs text-slate-500 mt-1">{link.description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="space-y-2">
                                                    <input
                                                        type="url"
                                                        placeholder="URL..."
                                                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                                        value={newLink.url}
                                                        onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Title (optional)..."
                                                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                                        value={newLink.title}
                                                        onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Description..."
                                                            className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                                            value={newLink.description}
                                                            onChange={(e) => setNewLink({...newLink, description: e.target.value})}
                                                        />
                                                        <button
                                                            onClick={() => addLink(node.id, newLink)}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Connection Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800 rounded-lg p-4">
                            <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Philosophy
                            </h4>
                            {graphData?.nodes?.filter(n => n.type === 'AXIOM' || n.type === 'TEXT').map(node => (
                                <div key={node.id} className="mb-2 text-sm">
                                    <div className="text-white">{node.label}</div>
                                    <div className="text-slate-400 text-xs">{node.provenance?.author} ({node.provenance?.year})</div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-800 rounded-lg p-4">
                            <h4 className="text-orange-400 font-medium mb-3 flex items-center gap-2">
                                <ScrollText className="w-4 h-4" />
                                History
                            </h4>
                            {graphData?.nodes?.filter(n => n.type === 'EVENT').map(node => (
                                <div key={node.id} className="mb-2 text-sm">
                                    <div className="text-white">{node.label}</div>
                                    <div className="text-slate-400 text-xs">{node.provenance?.source}</div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-800 rounded-lg p-4">
                            <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Data
                            </h4>
                            {graphData?.nodes?.filter(n => n.type === 'STATISTIC').map(node => (
                                <div key={node.id} className="mb-2 text-sm">
                                    <div className="text-white">{node.label}</div>
                                    <div className="text-slate-400 text-xs">{node.provenance?.author}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Phase C: The Scroll of Truth */}
                <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-indigo-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <ScrollText className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-semibold text-white">Phase C: The Scroll of Truth</h3>
                        <span className="text-sm text-slate-400">Auto-Generated Narrative</span>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-6">
                        <div className="prose prose-invert max-w-none">
                            {scrollOfTruth.split('\n').map((line, i) => {
                                if (line.startsWith('## ')) {
                                    return <h2 key={i} className="text-xl font-bold text-white mb-4 mt-6">{line.substring(3)}</h2>;
                                } else if (line.startsWith('### ')) {
                                    return <h3 key={i} className="text-lg font-semibold text-indigo-400 mb-3 mt-4">{line.substring(4)}</h3>;
                                } else if (line.startsWith('- **')) {
                                    return <li key={i} className="text-slate-300 mb-1 ml-4">{line.substring(2)}</li>;
                                } else if (line.trim() === '') {
                                    return <br key={i} />;
                                } else {
                                    return <p key={i} className="text-slate-300 mb-2">{line}</p>;
                                }
                            })}
                        </div>
                    </div>
                </div>

                {/* Context-First Protocol Notice */}
                {selectedNode?.controversyLevel === 'high' && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-5 h-5 text-red-400" />
                            <h4 className="text-red-400 font-medium">Context-First Protocol Active</h4>
                        </div>
                        <p className="text-slate-300 text-sm">
                            This content has been flagged as controversial. Rather than censorship, AEGIS presents
                            it within its full evidentiary context. The debate graph above shows supporting and
                            contradicting evidence for comprehensive understanding.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RabbitHoleInterface;