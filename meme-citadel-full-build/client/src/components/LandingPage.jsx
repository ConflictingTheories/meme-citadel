import React from 'react';
import { 
    Shield, GitBranch, CheckCircle, MessageSquare, 
    ArrowRight, BookOpen, Scale, TrendingUp, Users,
    Zap, Lock, Network
} from 'lucide-react';

export default function LandingPage({ onEnter, stats }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pt-20 pb-32 relative">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <Shield className="text-cyan-400" size={64} />
                        <div>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                                MEME <span className="text-cyan-400">CITADEL</span>
                            </h1>
                            <p className="text-lg text-slate-400 font-mono">PROJECT AEGIS</p>
                        </div>
                    </div>

                    {/* Tagline */}
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-200 mb-4">
                            The Truth is in the Graph
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            A knowledge platform where claims meet evidence. Explore ideas through 
                            rigorous citation networks, engage in structured debates, and verify 
                            information through community consensus.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="flex justify-center gap-4 mb-16">
                        <button
                            onClick={onEnter}
                            className="group bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 px-8 rounded-xl flex items-center gap-3 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40"
                        >
                            Enter the Citadel
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </button>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            <StatCard icon={BookOpen} value={stats.totalMemes} label="Claims" />
                            <StatCard icon={Network} value={stats.totalNodes} label="Evidence Nodes" />
                            <StatCard icon={MessageSquare} value={stats.totalDebates} label="Active Debates" />
                            <StatCard icon={Users} value={stats.totalUsers} label="Contributors" />
                        </div>
                    )}
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-slate-900/50 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h3 className="text-3xl font-bold text-center mb-12">
                        How It <span className="text-cyan-400">Works</span>
                    </h3>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={GitBranch}
                            title="Deep Citation Networks"
                            description="Every claim is connected to primary sources through a knowledge graph. Trace any idea back to its origins."
                        />
                        <FeatureCard
                            icon={Scale}
                            title="Structured Debate"
                            description="Competing ideas are presented side-by-side with supporting evidence. See both positions before deciding."
                        />
                        <FeatureCard
                            icon={CheckCircle}
                            title="Community Verification"
                            description="Evidence is validated through reputation-staked voting. Put your credibility behind your claims."
                        />
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h3 className="text-3xl font-bold text-center mb-12">
                        The <span className="text-cyan-400">Journey</span>
                    </h3>

                    <div className="grid md:grid-cols-4 gap-6">
                        <StepCard 
                            number="1" 
                            title="Discover Claims" 
                            description="Browse memes and claims across topics like politics, history, philosophy, and more."
                        />
                        <StepCard 
                            number="2" 
                            title="Explore Evidence" 
                            description="Click any claim to explore its citation graph. See what sources support or dispute it."
                        />
                        <StepCard 
                            number="3" 
                            title="Join Debates" 
                            description="Engage with structured debates. Present your position with evidence."
                        />
                        <StepCard 
                            number="4" 
                            title="Verify Truth" 
                            description="Stake your reputation to verify or dispute evidence. Consensus builds trust."
                        />
                    </div>
                </div>
            </div>

            {/* Topics */}
            <div className="bg-slate-900/50 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h3 className="text-3xl font-bold text-center mb-12">
                        Explore <span className="text-cyan-400">Topics</span>
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <TopicCard name="Politics" color="#ef4444" icon="⚖️" />
                        <TopicCard name="History" color="#f97316" icon="📜" />
                        <TopicCard name="Philosophy" color="#8b5cf6" icon="🏛️" />
                        <TopicCard name="Economics" color="#22c55e" icon="📈" />
                        <TopicCard name="Culture" color="#ec4899" icon="🎨" />
                        <TopicCard name="Science" color="#06b6d4" icon="🔬" />
                        <TopicCard name="Current Events" color="#64748b" icon="📰" />
                        <TopicCard name="Religion" color="#a855f7" icon="✝️" />
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h3 className="text-3xl font-bold text-center mb-12">
                        Our <span className="text-cyan-400">Principles</span>
                    </h3>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ValueCard
                            icon={Zap}
                            title="Contrarian Resilience"
                            description="Controversial ideas aren't deleted—they're analyzed. Every claim gets a fair hearing with evidence."
                        />
                        <ValueCard
                            icon={Lock}
                            title="Immutable Archives"
                            description="Evidence is stored permanently. No memory-holing, no revisionism, no disappearing sources."
                        />
                        <ValueCard
                            icon={TrendingUp}
                            title="Skin in the Game"
                            description="Stake your reputation on your claims. Bad faith actors lose credibility over time."
                        />
                    </div>
                </div>
            </div>

            {/* CTA Footer */}
            <div className="py-20 text-center">
                <h3 className="text-3xl font-bold mb-6">
                    Ready to Explore?
                </h3>
                <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                    Join the knowledge graph. Submit claims, provide evidence, engage in debates, 
                    and help build a more rigorous public discourse.
                </p>
                <button
                    onClick={onEnter}
                    className="group bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 px-8 rounded-xl flex items-center gap-3 mx-auto transition-all shadow-lg shadow-cyan-500/25"
                >
                    Enter the Citadel
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm font-mono">
                    PROJECT AEGIS v1.0 — The Memetic Citadel — For Educational & Research Purposes
                </div>
            </footer>
        </div>
    );
}

function StatCard({ icon: Icon, value, label }) {
    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-center">
            <Icon className="text-cyan-400 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }) {
    return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
            <div className="bg-cyan-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Icon className="text-cyan-400" size={24} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
            <p className="text-slate-400">{description}</p>
        </div>
    );
}

function StepCard({ number, title, description }) {
    return (
        <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-900 font-bold text-xl flex items-center justify-center mx-auto mb-4">
                {number}
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
    );
}

function TopicCard({ name, color, icon }) {
    return (
        <div 
            className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center hover:border-opacity-100 transition-all cursor-pointer"
            style={{ borderColor: `${color}30` }}
        >
            <div className="text-3xl mb-2">{icon}</div>
            <div className="font-medium text-white">{name}</div>
        </div>
    );
}

function ValueCard({ icon: Icon, title, description }) {
    return (
        <div className="text-center">
            <div className="bg-slate-800/50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="text-cyan-400" size={32} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
            <p className="text-slate-400">{description}</p>
        </div>
    );
}
