import React, { useState, useEffect } from 'react';
import { search } from '../api';
import { 
    Search, FileText, MessageSquare, Network, 
    ChevronRight, Shield, User, Clock
} from 'lucide-react';

export default function SearchResults({ query, onSelectMeme, onSelectDebate }) {
    const [results, setResults] = useState({ memes: [], debates: [], nodes: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const performSearch = async () => {
            if (!query?.trim()) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                const data = await search(query);
                setResults(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    if (loading) {
        return (
            <div className="p-10 text-center">
                <Search className="mx-auto mb-4 text-slate-600 animate-pulse" size={48} />
                <p className="text-slate-400">Searching for "{query}"...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-400 text-center p-10">Search error: {error}</div>;
    }

    const totalResults = results.memes.length + results.debates.length + results.nodes.length;

    if (totalResults === 0) {
        return (
            <div className="p-10 text-center">
                <Search className="mx-auto mb-4 text-slate-600" size={48} />
                <p className="text-slate-400">No results found for "{query}"</p>
                <p className="text-slate-500 text-sm mt-2">Try different keywords or broader terms.</p>
            </div>
        );
    }

    const tabs = [
        { id: 'all', label: 'All', count: totalResults },
        { id: 'memes', label: 'Claims', count: results.memes.length },
        { id: 'debates', label: 'Debates', count: results.debates.length },
        { id: 'nodes', label: 'Evidence', count: results.nodes.length },
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Search className="text-cyan-400" size={24} />
                    Results for "{query}"
                </h2>
                <p className="text-slate-400 text-sm mt-1">{totalResults} results found</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Results */}
            <div className="space-y-6">
                {/* Claims */}
                {(activeTab === 'all' || activeTab === 'memes') && results.memes.length > 0 && (
                    <ResultSection 
                        title="Claims" 
                        icon={FileText}
                        show={activeTab === 'all'}
                    >
                        {results.memes.map(meme => (
                            <MemeResult 
                                key={meme.id} 
                                meme={meme} 
                                onClick={() => onSelectMeme(meme.rootNodeId)} 
                            />
                        ))}
                    </ResultSection>
                )}

                {/* Debates */}
                {(activeTab === 'all' || activeTab === 'debates') && results.debates.length > 0 && (
                    <ResultSection 
                        title="Debates" 
                        icon={MessageSquare}
                        show={activeTab === 'all'}
                    >
                        {results.debates.map(debate => (
                            <DebateResult 
                                key={debate.id} 
                                debate={debate} 
                                onClick={() => onSelectDebate(debate.id)} 
                            />
                        ))}
                    </ResultSection>
                )}

                {/* Evidence Nodes */}
                {(activeTab === 'all' || activeTab === 'nodes') && results.nodes.length > 0 && (
                    <ResultSection 
                        title="Evidence & Sources" 
                        icon={Network}
                        show={activeTab === 'all'}
                    >
                        {results.nodes.map(node => (
                            <NodeResult 
                                key={node.id} 
                                node={node}
                                onClick={() => onSelectMeme(node.id)}
                            />
                        ))}
                    </ResultSection>
                )}
            </div>
        </div>
    );
}

function ResultSection({ title, icon: Icon, children, show }) {
    return (
        <div>
            {show && (
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Icon className="text-cyan-400" size={20} />
                    {title}
                </h3>
            )}
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
}

function MemeResult({ meme, onClick }) {
    return (
        <div 
            onClick={onClick}
            className="flex gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg cursor-pointer hover:border-slate-600 transition-all group"
        >
            <img 
                src={meme.imageUrl} 
                alt={meme.title}
                className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                    {meme.title}
                </h4>
                <p className="text-sm text-slate-400 line-clamp-2 mt-1">{meme.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <Shield size={12} className="text-cyan-400" />
                        {meme.citadelScore}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-700/50">{meme.category}</span>
                </div>
            </div>
            <ChevronRight className="text-slate-500 group-hover:text-cyan-400 transition-colors self-center" size={20} />
        </div>
    );
}

function DebateResult({ debate, onClick }) {
    return (
        <div 
            onClick={onClick}
            className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg cursor-pointer hover:border-slate-600 transition-all group"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold
                            ${debate.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-400'}`}>
                            {debate.status}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 uppercase">
                            {debate.category}
                        </span>
                    </div>
                    <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {debate.title}
                    </h4>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{debate.description}</p>
                </div>
                <ChevronRight className="text-slate-500 group-hover:text-cyan-400 transition-colors" size={20} />
            </div>
        </div>
    );
}

function NodeResult({ node, onClick }) {
    const typeColors = {
        'MEME': 'text-purple-400',
        'TEXT': 'text-blue-400',
        'STATISTIC': 'text-green-400',
        'EVENT': 'text-orange-400',
        'CONCEPT': 'text-cyan-400',
        'PERSON': 'text-pink-400'
    };

    return (
        <div 
            onClick={onClick}
            className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg cursor-pointer hover:border-slate-600 transition-all group"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold ${typeColors[node.type] || 'text-slate-400'}`}>
                            {node.type}
                        </span>
                        {node.verified && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                                VERIFIED
                            </span>
                        )}
                    </div>
                    <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {node.label}
                    </h4>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{node.content}</p>
                    {node.author && (
                        <p className="text-xs text-slate-500 mt-2">
                            <User size={12} className="inline mr-1" />
                            {node.author}
                            {node.year && ` (${node.year})`}
                        </p>
                    )}
                </div>
                <ChevronRight className="text-slate-500 group-hover:text-cyan-400 transition-colors" size={20} />
            </div>
        </div>
    );
}
