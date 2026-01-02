import React, { useState, useEffect } from 'react';
import { Check, X, HelpCircle, User, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

const EvidenceCard = ({ item, onVote }) => {
    const [voted, setVoted] = useState(null); // 'verify' or 'dispute'

    const handleVote = (voteType) => {
        if (voted) return; // Already voted
        setVoted(voteType);
        onVote(item.id, voteType);
    };

    const totalVotes = item.votes.verify + item.votes.dispute;
    const verifyPercent = totalVotes > 0 ? (item.votes.verify / totalVotes) * 100 : 50;
    
    return (
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-5 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-[10px] px-2 py-0.5 rounded border border-cyan-500 text-cyan-400 uppercase tracking-wider">{item.type}</span>
                    <h3 className="text-lg font-bold text-white mt-1">{item.title}</h3>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400">Stake</p>
                    <p className="font-bold text-indigo-400 text-lg">{item.stake}</p>
                </div>
            </div>

            <p className="text-sm text-slate-300">"{item.reasoning}"</p>
            
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline break-all">{item.url}</a>
            
            <div className="flex justify-between items-center text-xs text-slate-400 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-1.5"><User size={14}/> Submitted by @{item.submitterId}</div>
                <div className="flex items-center gap-1.5"><Clock size={14}/> {item.timeRemaining} left</div>
            </div>

            {/* Consensus Bar */}
            <div className="relative w-full h-2 bg-red-500/30 rounded-full overflow-hidden border border-slate-700">
                <div className="absolute top-0 left-0 h-full bg-green-500/50" style={{ width: `${verifyPercent}%` }}></div>
            </div>

            {/* Voting Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={() => handleVote('verify')}
                    disabled={!!voted}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all border
                        ${voted === 'verify' ? 'bg-green-500 text-white border-green-400' : ''}
                        ${!voted ? 'bg-slate-700/50 border-slate-600 hover:bg-green-500/20 hover:border-green-600 text-slate-200' : ''}
                        ${voted && voted !== 'verify' ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700' : ''}`}
                >
                    <ShieldCheck size={16} /> Verify
                </button>
                <button
                    onClick={() => handleVote('dispute')}
                    disabled={!!voted}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all border
                        ${voted === 'dispute' ? 'bg-red-500 text-white border-red-400' : ''}
                        ${!voted ? 'bg-slate-700/50 border-slate-600 hover:bg-red-500/20 hover:border-red-600 text-slate-200' : ''}
                        ${voted && voted !== 'dispute' ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700' : ''}`}
                >
                    <ShieldAlert size={16} /> Dispute
                </button>
            </div>
        </div>
    );
};

export default function VerificationQueue() {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/verification');
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                setQueue(data);
            } catch (e) {
                setError(e.message);
                console.error("Failed to fetch verification queue:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchQueue();
    }, []);

    const handleVote = async (evidenceId, voteType) => {
        // Optimistically update the UI
        const originalQueue = [...queue];
        setQueue(prevQueue =>
            prevQueue.map(item =>
                item.id === evidenceId
                    ? { ...item, votes: { ...item.votes, [voteType]: item.votes[voteType] + 1 } }
                    : item
            )
        );

        // Call the API
        try {
            await fetch(`http://localhost:3001/api/vote/${evidenceId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voteType, userId: 'user_4', stake: 10 }), // Mocked user and stake
            });
        } catch (error) {
            console.error('Failed to submit vote:', error);
            // Revert on error
            setQueue(originalQueue);
        }
    };

    if (loading) return <div className="text-slate-400 text-center p-10">Loading verification queue...</div>;
    if (error) return <div className="text-red-400 text-center p-10">Error loading queue: {error}</div>;

    return (
        <div className="space-y-6 font-mono">
            <h2 className="text-2xl font-bold text-white">Verification Queue</h2>
             {queue.map(item => (
                <EvidenceCard key={item.id} item={item} onVote={handleVote} />
            ))}
        </div>
    );
}