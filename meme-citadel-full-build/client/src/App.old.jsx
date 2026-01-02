import React, { useState } from 'react';
import FingerprintDisplay from './components/FingerprintDisplay';
import MemeFeed from './components/MemeFeed';
import GraphView from './components/GraphView';
import SubmissionForm from './components/SubmissionForm';
import VerificationQueue from './components/VerificationQueue';
import { Home, PlusSquare, CheckSquare, ArrowLeft } from 'lucide-react';

const TABS = {
    FEED: 'FEED',
    SUBMIT: 'SUBMIT',
    VERIFY: 'VERIFY',
    GRAPH: 'GRAPH'
};

function App() {
    const [activeTab, setActiveTab] = useState(TABS.FEED);
    const [selectedRootNodeId, setSelectedRootNodeId] = useState(null);

    const handleSelectMeme = (rootNodeId) => {
        setSelectedRootNodeId(rootNodeId);
        setActiveTab(TABS.GRAPH);
    };
    
    const handleBackToFeed = () => {
        setSelectedRootNodeId(null);
        setActiveTab(TABS.FEED);
    }

    const renderActiveTab = () => {
        switch (activeTab) {
            case TABS.FEED:
                return <MemeFeed onSelectMeme={handleSelectMeme} />;
            case TABS.SUBMIT:
                return <SubmissionForm onSubmission={() => setActiveTab(TABS.VERIFY)} />;
            case TABS.VERIFY:
                return <VerificationQueue />;
            case TABS.GRAPH:
                 return (
                    <div className="w-full h-full relative">
                        <button onClick={handleBackToFeed} className="absolute top-4 left-4 z-30 bg-slate-800/80 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                            <ArrowLeft size={16} />
                            Back to Feed
                        </button>
                        <GraphView rootNodeId={selectedRootNodeId} />
                    </div>
                );
            default:
                return <MemeFeed onSelectMeme={handleSelectMeme} />;
        }
    };

    const NavButton = ({ tab, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-bold transition-colors rounded-t-lg
                ${activeTab === tab ? 'bg-slate-800/80 text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
            `}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-7xl">
                <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black tracking-tighter text-white">
                           MEME <span className="text-cyan-400">CITADEL</span>
                        </h1>
                        <p className="text-sm text-slate-400 font-mono">The Truth is in the Graph.</p>
                    </div>
                    <div className="w-full md:w-80">
                         <FingerprintDisplay />
                    </div>
                </header>

                <main>
                    {activeTab !== TABS.GRAPH && (
                         <div className="flex border-b border-slate-700 mb-6">
                            <NavButton tab={TABS.FEED} label="Feed" icon={Home} />
                            <NavButton tab={TABS.SUBMIT} label="Contribute" icon={PlusSquare} />
                            <NavButton tab={TABS.VERIFY} label="Verify" icon={CheckSquare} />
                        </div>
                    )}
                    
                    <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl shadow-2xl shadow-slate-950/50 overflow-hidden" style={{ minHeight: '600px' }}>
                        {renderActiveTab()}
                    </div>
                </main>
                
                <footer className="text-center mt-8 text-xs text-slate-600 font-mono">
                    <p>PROJECT AEGIS v1.0 - For Educational & Research Purposes Only</p>
                </footer>
            </div>
        </div>
    );
}

export default App;