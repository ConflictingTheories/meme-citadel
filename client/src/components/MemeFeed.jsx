import React, { useState, useEffect } from 'react';
import { getFeed } from '../api';
import RabbitHoleInterface from './RabbitHoleInterface';
import {
    Shield, GitBranch, MessageCircle, Flame, Clock,
    ExternalLink, User, Tag, Eye
} from 'lucide-react';

export default function MemeFeed({ onSelectMeme, category, sortBy }) {
    const [memes, setMemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rabbitHoleMeme, setRabbitHoleMeme] = useState(null);

    useEffect(() => {
        const fetchFeed = async () => {
            setLoading(true);
            try {
                const params = {};
                if (category && category !== 'all') {
                    params.category = category;
                }
                if (sortBy) {
                    params.sort = sortBy;
                }
                const data = await getFeed(params);
                setMemes(data);
            } catch (e) {
                setError(e.message);
                console.error('Failed to fetch meme feed:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, [category, sortBy]);

    const handleEnterCitadel = (memeId, e) => {
        e.stopPropagation();
        setRabbitHoleMeme(memeId);
    };

    if (loading) {
        return (
            <div className="p-10 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-4"></div>
                <p className="text-slate-400">Loading claims...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-400 text-center p-10">Error loading feed: {error}</div>;
    }

    if (memes.length === 0) {
        return (
            <div className="text-center p-10">
                <Shield className="mx-auto mb-4 text-slate-600" size={48} />
                <p className="text-slate-400">No claims found in this category.</p>
            </div>
        );
    }

    return (
        <>
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {memes.map(meme => (
                        <MemeCard
                            key={meme.id}
                            meme={meme}
                            onSelectMeme={onSelectMeme}
                            onEnterCitadel={handleEnterCitadel}
                        />
                    ))}
                </div>
            </div>

            {/* Rabbit Hole Interface */}
            {rabbitHoleMeme && (
                <RabbitHoleInterface
                    memeId={rabbitHoleMeme}
                    onClose={() => setRabbitHoleMeme(null)}
                />
            )}
        </>
    );
}

function MemeCard({ meme, onSelectMeme, onEnterCitadel }) {
    const scoreColor = meme.citadelScore > 300
        ? 'bg-purple-500'
        : meme.citadelScore > 100
            ? 'bg-cyan-500'
            : meme.citadelScore > 50
                ? 'bg-green-500'
                : 'bg-yellow-500';

    const controversyColor = {
        high: 'text-red-400',
        medium: 'text-yellow-400',
        low: 'text-green-400'
    };

    return (
        <div
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden cursor-pointer transform hover:scale-[1.02] hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group"
            onClick={() => onSelectMeme(meme.rootNodeId)}
        >
            {/* Image */}
            <div className="relative w-full h-48 bg-slate-900">
                <img
                    src={meme.imageUrl}
                    alt={meme.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop';
                    }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                {/* Category badge */}
                <span className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full bg-slate-900/80 text-slate-300 uppercase tracking-wider font-medium backdrop-blur-sm">
                    {meme.category}
                </span>

                {/* Controversy indicator */}
                {meme.controversyLevel === 'high' && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-500/20 text-red-400 backdrop-blur-sm">
                        <Flame size={10} />
                        Disputed
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {meme.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                    {meme.description}
                </p>

                {/* Tags */}
                {meme.tags && meme.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {meme.tags.slice(0, 3).map(tag => (
                            <span
                                key={tag}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-400"
                            >
                                #{tag}
                            </span>
                        ))}
                        {meme.tags.length > 3 && (
                            <span className="text-[10px] px-2 py-0.5 text-slate-500">
                                +{meme.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Stats bar */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                    {/* Citadel Score */}
                    <div className={`flex items-center gap-1.5 text-white font-bold py-1 px-3 rounded-full text-sm ${scoreColor}`}>
                        <Shield size={14} />
                        <span>{meme.citadelScore}</span>
                    </div>

                    {/* Connection count */}
                    <div title="Connections" className="flex items-center gap-1 text-slate-400 text-sm">
                        <GitBranch size={14} />
                        <span>{Math.floor(meme.citadelScore / 10)}</span>
                    </div>

                    {/* Enter the Citadel button - AEGIS Core Feature */}
                    <button
                        className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium py-1 px-3 rounded-full transition-colors"
                        onClick={(e) => onEnterCitadel(meme.rootNodeId, e)}
                        title="Enter the Citadel - Deep knowledge exploration"
                    >
                        <Eye size={12} />
                        Citadel
                    </button>
                </div>
            </div>
        </div>
    );
}