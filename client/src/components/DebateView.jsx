import React, { useState, useEffect } from 'react';
import { getDebate, voteOnPosition, addDebateComment } from '../api';
import { 
    MessageSquare, ThumbsUp, ThumbsDown, User, Clock, 
    GitBranch, FileText, ChevronDown, ChevronUp, Send,
    ExternalLink, Shield
} from 'lucide-react';

export default function DebateView({ debateId, onExploreGraph }) {
    const [debate, setDebate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPosition, setExpandedPosition] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [commentingOn, setCommentingOn] = useState(null);

    useEffect(() => {
        const fetchDebate = async () => {
            setLoading(true);
            try {
                const data = await getDebate(debateId);
                setDebate(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        if (debateId) {
            fetchDebate();
        }
    }, [debateId]);

    const handleVote = async (positionId, voteType) => {
        try {
            const updated = await voteOnPosition(debateId, positionId, voteType);
            setDebate(prev => ({
                ...prev,
                positions: prev.positions.map(p => 
                    p.id === positionId ? { ...p, votes: updated.votes } : p
                )
            }));
        } catch (e) {
            console.error('Vote failed:', e);
        }
    };

    const handleAddComment = async (positionId) => {
        if (!newComment.trim()) return;
        
        try {
            const comment = await addDebateComment(debateId, {
                positionId,
                text: newComment
            });
            setDebate(prev => ({
                ...prev,
                comments: [...prev.comments, comment]
            }));
            setNewComment('');
            setCommentingOn(null);
        } catch (e) {
            console.error('Comment failed:', e);
        }
    };

    if (loading) {
        return <div className="text-slate-400 text-center p-10">Loading debate...</div>;
    }

    if (error) {
        return <div className="text-red-400 text-center p-10">Error: {error}</div>;
    }

    if (!debate) {
        return <div className="text-slate-400 text-center p-10">Debate not found</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="border-b border-slate-700 pb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider font-bold
                        ${debate.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-400'}`}>
                        {debate.status}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 uppercase tracking-wider">
                        {debate.category}
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">{debate.title}</h1>
                <p className="text-slate-400">{debate.description}</p>
                
                {debate.relatedMeme && (
                    <button
                        onClick={() => onExploreGraph(debate.relatedMeme.rootNodeId)}
                        className="mt-4 flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        <GitBranch size={16} />
                        Explore related knowledge graph
                        <ExternalLink size={14} />
                    </button>
                )}
            </div>

            {/* Positions */}
            <div className="grid md:grid-cols-2 gap-6">
                {debate.positions.map(position => (
                    <PositionCard
                        key={position.id}
                        position={position}
                        isExpanded={expandedPosition === position.id}
                        onToggle={() => setExpandedPosition(
                            expandedPosition === position.id ? null : position.id
                        )}
                        onVote={handleVote}
                        onExploreGraph={onExploreGraph}
                        comments={debate.comments?.filter(c => c.positionId === position.id) || []}
                        onAddComment={() => setCommentingOn(position.id)}
                        commentingOn={commentingOn}
                        newComment={newComment}
                        setNewComment={setNewComment}
                        submitComment={() => handleAddComment(position.id)}
                    />
                ))}
            </div>

            {/* General Discussion */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare size={20} className="text-cyan-400" />
                    General Discussion
                </h3>
                
                {debate.comments?.filter(c => !c.positionId).length === 0 ? (
                    <p className="text-slate-500 text-sm">No general comments yet.</p>
                ) : (
                    <div className="space-y-3">
                        {debate.comments?.filter(c => !c.positionId).map(comment => (
                            <CommentCard key={comment.id} comment={comment} />
                        ))}
                    </div>
                )}

                {/* Add comment form */}
                <div className="mt-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="Add to the discussion..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        value={commentingOn === null ? newComment : ''}
                        onChange={(e) => { setCommentingOn(null); setNewComment(e.target.value); }}
                    />
                    <button
                        onClick={() => handleAddComment(null)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-lg font-medium"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function PositionCard({ 
    position, isExpanded, onToggle, onVote, onExploreGraph,
    comments, onAddComment, commentingOn, newComment, setNewComment, submitComment
}) {
    const isPro = position.stance === 'pro';
    const totalVotes = position.votes.agree + position.votes.disagree;
    const agreePercent = totalVotes > 0 ? (position.votes.agree / totalVotes) * 100 : 50;

    return (
        <div className={`border rounded-xl overflow-hidden ${
            isPro 
                ? 'bg-green-500/5 border-green-500/30' 
                : 'bg-red-500/5 border-red-500/30'
        }`}>
            {/* Header */}
            <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                    {isPro 
                        ? <ThumbsUp className="text-green-400" size={20} />
                        : <ThumbsDown className="text-red-400" size={20} />
                    }
                    <span className={`text-sm font-bold uppercase ${
                        isPro ? 'text-green-400' : 'text-red-400'
                    }`}>
                        {isPro ? 'For' : 'Against'}
                    </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{position.title}</h3>
                <p className="text-slate-300 text-sm mb-4">{position.summary}</p>

                {/* Submitter */}
                {position.submitter && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <User size={14} />
                        <span>@{position.submitter.username}</span>
                        <span className="flex items-center gap-1 text-indigo-400">
                            <Shield size={12} />
                            {position.submitter.reputation}
                        </span>
                    </div>
                )}

                {/* Voting */}
                <div className="space-y-3">
                    {/* Progress bar */}
                    <div className="relative h-2 bg-red-500/30 rounded-full overflow-hidden">
                        <div 
                            className="absolute top-0 left-0 h-full bg-green-500/70 transition-all duration-300"
                            style={{ width: `${agreePercent}%` }}
                        />
                    </div>
                    
                    {/* Vote buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onVote(position.id, 'agree')}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors text-sm font-medium"
                        >
                            <ThumbsUp size={14} />
                            Agree ({position.votes.agree})
                        </button>
                        <button
                            onClick={() => onVote(position.id, 'disagree')}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
                        >
                            <ThumbsDown size={14} />
                            Disagree ({position.votes.disagree})
                        </button>
                    </div>
                </div>
            </div>

            {/* Expand toggle */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800/50 text-slate-400 hover:text-white transition-colors text-sm"
            >
                {isExpanded ? (
                    <>Hide Evidence <ChevronUp size={16} /></>
                ) : (
                    <>Show Evidence ({position.evidence?.length || 0}) <ChevronDown size={16} /></>
                )}
            </button>

            {/* Expanded content */}
            {isExpanded && (
                <div className="p-5 bg-slate-900/50 border-t border-slate-700/50 space-y-4">
                    {/* Evidence */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <FileText size={14} className="text-cyan-400" />
                            Supporting Evidence
                        </h4>
                        {position.evidence?.length > 0 ? (
                            <div className="space-y-2">
                                {position.evidence.map(node => (
                                    <div 
                                        key={node.id}
                                        className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-medium text-white">{node.label}</p>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{node.content}</p>
                                                {node.author && (
                                                    <p className="text-xs text-slate-500 mt-1">— {node.author}, {node.year}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onExploreGraph(node.id)}
                                                className="text-cyan-400 hover:text-cyan-300 p-1"
                                                title="Explore in graph"
                                            >
                                                <GitBranch size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No evidence linked yet.</p>
                        )}
                    </div>

                    {/* Comments on this position */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <MessageSquare size={14} className="text-cyan-400" />
                            Comments ({comments.length})
                        </h4>
                        {comments.length > 0 ? (
                            <div className="space-y-2">
                                {comments.map(comment => (
                                    <CommentCard key={comment.id} comment={comment} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No comments yet.</p>
                        )}

                        {/* Add comment */}
                        {commentingOn === position.id ? (
                            <div className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && submitComment()}
                                />
                                <button
                                    onClick={submitComment}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 py-2 rounded-lg"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onAddComment}
                                className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                                <MessageSquare size={14} />
                                Add comment
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function CommentCard({ comment }) {
    return (
        <div className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <User size={12} />
                <span>@{comment.user?.username || 'Anonymous'}</span>
                <span className="ml-auto">
                    <Clock size={12} className="inline mr-1" />
                    {new Date(comment.createdAt).toLocaleDateString()}
                </span>
            </div>
            <p className="text-sm text-slate-300">{comment.text}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <button className="hover:text-green-400 flex items-center gap-1">
                    <ThumbsUp size={12} /> {comment.votes?.up || 0}
                </button>
                <button className="hover:text-red-400 flex items-center gap-1">
                    <ThumbsDown size={12} /> {comment.votes?.down || 0}
                </button>
            </div>
        </div>
    );
}
