import React, { useState, useEffect } from 'react';
import { getDebates } from '../api';
import { 
    MessageSquare, Users, Clock, ChevronRight, 
    ThumbsUp, ThumbsDown, Flame 
} from 'lucide-react';

export default function DebateList({ onSelectDebate, category }) {
    const [debates, setDebates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDebates = async () => {
            setLoading(true);
            try {
                const params = {};
                if (category && category !== 'all') {
                    params.category = category;
                }
                const data = await getDebates(params);
                setDebates(data);
            } catch (e) {
                setError(e.message);
                console.error('Failed to fetch debates:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchDebates();
    }, [category]);

    if (loading) {
        return <div className="text-slate-400 text-center p-10">Loading debates...</div>;
    }

    if (error) {
        const hint = error.toLowerCase().includes('network')
            ? ' (Unable to reach backend. Is the API server running on http://localhost:3001/?)'
            : '';

        return <div className="text-red-400 text-center p-10">Error: {error}{hint}</div>;
    }

    if (debates.length === 0) {
        return (
            <div className="text-center p-10">
                <MessageSquare className="mx-auto mb-4 text-slate-600" size={48} />
                <p className="text-slate-400">No debates found in this category.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="text-cyan-400" />
                    Active Debates
                </h2>
            </div>

            <div className="space-y-4">
                {debates.map(debate => (
                    <DebateCard 
                        key={debate.id} 
                        debate={debate} 
                        onClick={() => onSelectDebate(debate.id)} 
                    />
                ))}
            </div>
        </div>
    );
}

function DebateCard({ debate, onClick }) {
    // Calculate total engagement
    const totalVotes = debate.positions.reduce(
        (sum, pos) => sum + pos.votes.agree + pos.votes.disagree, 
        0
    );

    // Find leading position
    const sortedPositions = [...debate.positions].sort(
        (a, b) => (b.votes.agree - b.votes.disagree) - (a.votes.agree - a.votes.disagree)
    );

    return (
        <div 
            onClick={onClick}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 cursor-pointer hover:border-slate-600 hover:bg-slate-800/70 transition-all group"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold
                            ${debate.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-400'}`}>
                            {debate.status}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 uppercase tracking-wider">
                            {debate.category}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {debate.title}
                    </h3>
                </div>
                <ChevronRight className="text-slate-500 group-hover:text-cyan-400 transition-colors" size={20} />
            </div>

            <p className="text-sm text-slate-400 mb-4">{debate.description}</p>

            {/* Positions preview */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {debate.positions.slice(0, 2).map(pos => (
                    <div 
                        key={pos.id}
                        className={`p-3 rounded-lg border ${
                            pos.stance === 'pro' 
                                ? 'bg-green-500/5 border-green-500/30' 
                                : 'bg-red-500/5 border-red-500/30'
                        }`}
                    >
                        <div className="flex items-center gap-1 mb-1">
                            {pos.stance === 'pro' 
                                ? <ThumbsUp size={12} className="text-green-400" />
                                : <ThumbsDown size={12} className="text-red-400" />
                            }
                            <span className={`text-[10px] font-bold uppercase ${
                                pos.stance === 'pro' ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {pos.stance === 'pro' ? 'For' : 'Against'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">{pos.title}</p>
                        <div className="text-[10px] text-slate-500 mt-1">
                            {pos.votes.agree} agree
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer stats */}
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-700/50">
                <span className="flex items-center gap-1">
                    <Users size={12} />
                    {debate.positions.length} positions
                </span>
                <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {debate.comments?.length || 0} comments
                </span>
                <span className="flex items-center gap-1">
                    <Flame size={12} />
                    {totalVotes} votes
                </span>
                <span className="flex items-center gap-1 ml-auto">
                    <Clock size={12} />
                    {new Date(debate.createdAt).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}
