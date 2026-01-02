import React, { useState } from 'react';
import { UploadCloud, Link, FileText, BarChart2, Video, Plus, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { submitEvidence } from '../api';

const evidenceTypes = [
    { id: 'URL', icon: Link, label: 'URL' },
    { id: 'PDF', icon: FileText, label: 'PDF' },
    { id: 'Video', icon: Video, label: 'Video' },
    { id: 'Data', icon: BarChart2, label: 'Chart/Data' },
];

const connectionTypes = [
    { id: 'supports', label: 'Supports', color: 'green' },
    { id: 'disputes', label: 'Disputes', color: 'red' },
    { id: 'context', label: 'Context', color: 'blue' },
];

export default function SubmissionForm({ onSubmission }) {
    const [evidenceType, setEvidenceType] = useState('URL');
    const [connection, setConnection] = useState('supports');
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [reasoning, setReasoning] = useState('');
    const [stake, setStake] = useState(50);
    const [status, setStatus] = useState({ type: 'idle' }); // idle, submitting, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'submitting' });

        try {
            const newEvidence = await submitEvidence({
                title,
                type: evidenceType,
                url,
                reasoning,
                stake
            });

            setStatus({ type: 'success', message: 'Evidence submitted successfully!' });
            if (onSubmission) onSubmission(newEvidence);
            // Reset form after a delay
            setTimeout(() => {
                setStatus({ type: 'idle' });
                setTitle('');
                setUrl('');
                setReasoning('');
                setStake(50);
            }, 3000);

        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        }
    };

    return (
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 font-mono">
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <UploadCloud size={24} className="text-cyan-400"/>
                Contribute Evidence
            </h2>
            <p className="text-sm text-slate-400 mb-6">Add a new piece of evidence to the knowledge graph. Your submission will be reviewed by the community.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Evidence Type */}
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Evidence Type</label>
                    <div className="flex space-x-2">
                        {evidenceTypes.map(type => (
                            <button key={type.id} type="button" onClick={() => setEvidenceType(type.id)}
                                className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center gap-2 text-sm transition-colors border ${
                                    evidenceType === type.id 
                                    ? 'bg-cyan-500/20 border-cyan-500 text-white' 
                                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                                }`}>
                                <type.icon size={16} />
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* URL Input */}
                <div>
                    <label htmlFor="url" className="block text-sm font-bold text-slate-300 mb-2">Source URL</label>
                    <input type="url" id="url" value={url} onChange={e => setUrl(e.target.value)} required
                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                </div>
                
                 {/* Title Input */}
                <div>
                    <label htmlFor="title" className="block text-sm font-bold text-slate-300 mb-2">Title / Headline</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required
                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                </div>

                {/* Reasoning */}
                <div>
                    <label htmlFor="reasoning" className="block text-sm font-bold text-slate-300 mb-2">Reasoning</label>
                    <textarea id="reasoning" rows="3" value={reasoning} onChange={e => setReasoning(e.target.value)} required
                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"></textarea>
                </div>
                
                {/* Reputation Stake */}
                <div>
                    <label htmlFor="stake" className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                        Reputation Stake
                        <div className="relative group">
                            <HelpCircle size={14} className="cursor-pointer" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-slate-950 p-3 rounded-lg border border-slate-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                Stake your reputation on the quality of this evidence. If approved, you gain reputation. If disputed, you lose a portion of your stake.
                            </div>
                        </div>
                    </label>
                    <div className="flex items-center gap-4">
                        <input type="range" id="stake" min="10" max="500" step="10" value={stake} onChange={e => setStake(e.target.value)}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        <span className="font-bold text-cyan-400 text-lg w-16 text-center">{stake}</span>
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button type="submit" disabled={status.type === 'submitting'}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                        {status.type === 'submitting' ? 'Submitting...' : 'Submit Evidence'}
                    </button>
                </div>

                {/* Status Message */}
                {status.type === 'success' && (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/20 text-green-400 border border-green-500/30">
                        <CheckCircle size={20}/>
                        <p>{status.message}</p>
                    </div>
                )}
                 {status.type === 'error' && (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                        <XCircle size={20}/>
                        <p>{status.message}</p>
                    </div>
                )}
            </form>
        </div>
    );
}