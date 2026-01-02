import React, { useState, useEffect } from 'react';
import FingerprintDisplay from './components/FingerprintDisplay';
import IdentityFingerprint from './components/IdentityFingerprint';
import MemeFeed from './components/MemeFeed';
import GraphView from './components/GraphView';
import SubmissionForm from './components/SubmissionForm';
import VerificationQueue from './components/VerificationQueue';
import DebateList from './components/DebateList';
import DebateView from './components/DebateView';
import SearchResults from './components/SearchResults';
import LandingPage from './components/LandingPage';
import CategoryNav from './components/CategoryNav';
import { getCategories, getStats } from './api';
import { 
    Home, PlusSquare, CheckSquare, ArrowLeft, MessageSquare, 
    Search, Shield, TrendingUp, BarChart3, X, Menu, User
} from 'lucide-react';

const VIEWS = {
    LANDING: 'LANDING',
    FEED: 'FEED',
    SUBMIT: 'SUBMIT',
    VERIFY: 'VERIFY',
    GRAPH: 'GRAPH',
    DEBATES: 'DEBATES',
    DEBATE_DETAIL: 'DEBATE_DETAIL',
    SEARCH: 'SEARCH',
    IDENTITY: 'IDENTITY'
};

function App() {
    const [activeView, setActiveView] = useState(VIEWS.LANDING);
    const [selectedRootNodeId, setSelectedRootNodeId] = useState(null);
    const [selectedDebateId, setSelectedDebateId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [sortBy, setSortBy] = useState('score');
    const [currentUser, setCurrentUser] = useState(null); // User identity/auth
    const [showUserProfile, setShowUserProfile] = useState(false);

    useEffect(() => {
        // Load categories and stats on mount
        getCategories().then(setCategories).catch(console.error);
        getStats().then(setStats).catch(console.error);
    }, []);

    const handleSelectMeme = (rootNodeId) => {
        setSelectedRootNodeId(rootNodeId);
        setActiveView(VIEWS.GRAPH);
    };

    const handleSelectDebate = (debateId) => {
        setSelectedDebateId(debateId);
        setActiveView(VIEWS.DEBATE_DETAIL);
    };
    
    const handleBackToFeed = () => {
        setSelectedRootNodeId(null);
        setActiveView(VIEWS.FEED);
    };

    const handleBackToDebates = () => {
        setSelectedDebateId(null);
        setActiveView(VIEWS.DEBATES);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setActiveView(VIEWS.SEARCH);
        }
    };

    const handleEnterCitadel = () => {
        // Require user to identify themselves before entering
        if (!currentUser) {
            setActiveView(VIEWS.IDENTITY);
        } else {
            setActiveView(VIEWS.FEED);
        }
    };

    const handleUserIdentified = (user) => {
        setCurrentUser(user);
        setShowUserProfile(false);
        // Auto-navigate to feed after identification
        setActiveView(VIEWS.FEED);
    };

    const handleExploreNode = (nodeId) => {
        // When exploring a node connection, set it as new root
        setSelectedRootNodeId(nodeId);
        // Keep in graph view
        setActiveView(VIEWS.GRAPH);
    };

    const NavButton = ({ view, label, icon: Icon, badge = null }) => (
        <button
            onClick={() => { setActiveView(view); setShowMobileMenu(false); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg relative
                ${activeView === view 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
            `}
        >
            <Icon size={16} />
            <span className="hidden md:inline">{label}</span>
            {badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );

    const renderActiveView = () => {
        switch (activeView) {
            case VIEWS.LANDING:
                return <LandingPage onEnter={handleEnterCitadel} stats={stats} />;
            case VIEWS.IDENTITY:
                return <IdentityFingerprint onIdentified={handleUserIdentified} />;
            case VIEWS.FEED:
                return (
                    <MemeFeed 
                        onSelectMeme={handleSelectMeme} 
                        category={selectedCategory}
                        sortBy={sortBy}
                    />
                );
            case VIEWS.SUBMIT:
                if (!currentUser) {
                    return (
                        <div className="text-center p-10">
                            <Shield className="mx-auto mb-4 text-cyan-400" size={48} />
                            <p className="text-slate-300 mb-4">You must identify yourself to submit memes.</p>
                            <button
                                onClick={() => setActiveView(VIEWS.IDENTITY)}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg"
                            >
                                Identify Myself
                            </button>
                        </div>
                    );
                }
                return (
                    <SubmissionForm 
                        onSubmission={() => setActiveView(VIEWS.VERIFY)}
                        categories={categories}
                        userId={currentUser?.id}
                    />
                );
            case VIEWS.VERIFY:
                if (!currentUser) {
                    return (
                        <div className="text-center p-10">
                            <Shield className="mx-auto mb-4 text-cyan-400" size={48} />
                            <p className="text-slate-300 mb-4">You must identify yourself to verify evidence.</p>
                            <button
                                onClick={() => setActiveView(VIEWS.IDENTITY)}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg"
                            >
                                Identify Myself
                            </button>
                        </div>
                    );
                }
                return (
                    <VerificationQueue 
                        category={selectedCategory}
                        userId={currentUser?.id}
                    />
                );
            case VIEWS.GRAPH:
                return (
                    <div className="w-full h-full relative">
                        <button 
                            onClick={handleBackToFeed} 
                            className="absolute top-4 left-4 z-30 bg-slate-800/80 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 backdrop-blur-sm"
                        >
                            <ArrowLeft size={16} />
                            Back to Feed
                        </button>
                        <GraphView rootNodeId={selectedRootNodeId} onExploreNode={handleExploreNode} />
                    </div>
                );
            case VIEWS.DEBATES:
                return (
                    <DebateList 
                        onSelectDebate={handleSelectDebate}
                        category={selectedCategory}
                        currentUser={currentUser}
                    />
                );
            case VIEWS.DEBATE_DETAIL:
                return (
                    <div className="w-full relative">
                        <button 
                            onClick={handleBackToDebates} 
                            className="mb-4 bg-slate-800/80 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Debates
                        </button>
                        <DebateView debateId={selectedDebateId} onExploreGraph={handleSelectMeme} />
                    </div>
                );
            case VIEWS.SEARCH:
                return (
                    <SearchResults 
                        query={searchQuery}
                        onSelectMeme={handleSelectMeme}
                        onSelectDebate={handleSelectDebate}
                    />
                );
            default:
                return <MemeFeed onSelectMeme={handleSelectMeme} />;
        }
    };

    // Don't show navigation on landing page
    if (activeView === VIEWS.LANDING) {
        return renderActiveView();
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex justify-between items-center gap-4">
                        {/* Logo */}
                        <button 
                            onClick={() => setActiveView(VIEWS.LANDING)}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                            <Shield className="text-cyan-400" size={28} />
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-black tracking-tighter text-white leading-none">
                                    MEME <span className="text-cyan-400">CITADEL</span>
                                </h1>
                                <p className="text-[10px] text-slate-500 font-mono">PROJECT AEGIS</p>
                            </div>
                        </button>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search claims, debates, evidence..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </form>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-2">
                            <NavButton view={VIEWS.FEED} label="Feed" icon={Home} />
                            <NavButton view={VIEWS.IDENTITY} label="Identity" icon={User} />
                            <NavButton view={VIEWS.DEBATES} label="Debates" icon={MessageSquare} />
                            <NavButton view={VIEWS.SUBMIT} label="Contribute" icon={PlusSquare} />
                            <NavButton 
                                view={VIEWS.VERIFY} 
                                label="Verify" 
                                icon={CheckSquare} 
                                badge={stats?.pendingEvidence}
                            />
                        </nav>

                        {/* Mobile menu toggle */}
                        <button 
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="lg:hidden p-2 text-slate-400 hover:text-white"
                        >
                            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        {/* User identity */}
                        <div className="hidden md:block">
                            <FingerprintDisplay compact />
                        </div>
                    </div>

                    {/* Mobile Nav */}
                    {showMobileMenu && (
                        <nav className="lg:hidden flex flex-wrap gap-2 mt-4 pb-2">
                            <NavButton view={VIEWS.FEED} label="Feed" icon={Home} />
                            <NavButton view={VIEWS.IDENTITY} label="Identity" icon={User} />
                            <NavButton view={VIEWS.DEBATES} label="Debates" icon={MessageSquare} />
                            <NavButton view={VIEWS.SUBMIT} label="Contribute" icon={PlusSquare} />
                            <NavButton 
                                view={VIEWS.VERIFY} 
                                label="Verify" 
                                icon={CheckSquare} 
                                badge={stats?.pendingEvidence}
                            />
                        </nav>
                    )}
                </div>
            </header>

            {/* Category Navigation (only on Feed and Debates) */}
            {(activeView === VIEWS.FEED || activeView === VIEWS.DEBATES || activeView === VIEWS.VERIFY) && (
                <div className="bg-slate-900/50 border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <CategoryNav 
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                        
                        {/* Sort options for feed */}
                        {activeView === VIEWS.FEED && (
                            <div className="flex items-center gap-2 mt-3">
                                <span className="text-xs text-slate-500">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                >
                                    <option value="score">Citadel Score</option>
                                    <option value="controversy">Controversy</option>
                                    <option value="recent">Most Recent</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1">
                <div className={`mx-auto ${activeView === VIEWS.GRAPH ? 'max-w-full h-[calc(100vh-140px)]' : 'max-w-7xl p-4 sm:p-6'}`}>
                    <div className={`${activeView === VIEWS.GRAPH ? 'h-full' : 'bg-slate-900/50 border border-slate-800/50 rounded-xl shadow-2xl overflow-hidden'}`} 
                         style={activeView !== VIEWS.GRAPH ? { minHeight: '600px' } : {}}>
                        {renderActiveView()}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900/50 border-t border-slate-800 py-4">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-600">
                    <p className="font-mono">PROJECT AEGIS v1.0 - The Memetic Citadel</p>
                    {stats && (
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <BarChart3 size={12} />
                                {stats.totalMemes} claims
                            </span>
                            <span className="flex items-center gap-1">
                                <TrendingUp size={12} />
                                {stats.totalNodes} nodes
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare size={12} />
                                {stats.totalDebates} debates
                            </span>
                        </div>
                    )}
                </div>
            </footer>
        </div>
    );
}

export default App;
