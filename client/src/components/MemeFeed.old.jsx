import React, { useState, useEffect } from 'react';
import { Shield, GitBranch, MessageCircle } from 'lucide-react';

const MemeCard = ({ meme, onSelectMeme }) => {
    const scoreColor = meme.citadelScore > 100 ? 'bg-sky-500' : meme.citadelScore > 50 ? 'bg-green-500' : 'bg-yellow-500';

    return (
        <div 
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden cursor-pointer transform hover:scale-[1.02] hover:border-slate-500 transition-all duration-300"
            onClick={() => onSelectMeme(meme.rootNodeId)}
        >
            <div className="w-full h-48 bg-black">
                <img src={meme.imageUrl} alt={meme.title} className="w-full h-full object-contain" />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 truncate">{meme.title}</h3>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 text-white font-bold py-1 px-3 rounded-full ${scoreColor}`}>
                            <Shield size={16} />
                            <span>{meme.citadelScore}</span>
                        </div>
                        <div title="Connections" className="flex items-center gap-1 text-slate-400">
                             <GitBranch size={16} />
                             <span>{Math.floor(meme.citadelScore / 10)}</span>
                        </div>
                    </div>
                    <div title="Comments" className="flex items-center gap-1 text-slate-400">
                         <MessageCircle size={16} />
                         <span>{Math.floor(meme.citadelScore / 5)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function MemeFeed({ onSelectMeme }) {
    const [memes, setMemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/feed');
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setMemes(data);
            } catch (e) {
                setError(e.message);
                console.error("Failed to fetch meme feed:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    if (loading) {
        return <div className="text-slate-400 text-center p-10">Loading feed...</div>;
    }

    if (error) {
        return <div className="text-red-400 text-center p-10">Error loading feed: {error}</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
            {memes.map(meme => (
                <MemeCard key={meme.id} meme={meme} onSelectMeme={onSelectMeme} />
            ))}
        </div>
    );
}