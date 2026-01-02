import React, { useState, useEffect, useRef } from 'react';
import { Shield, MapPin, Wifi, AlertTriangle, CheckCircle, Eye, EyeOff, Info } from 'lucide-react';
import fingerprintingService from '../services/fingerprinting';

export default function IdentityFingerprint({ onIdentified }) {
    const [fingerprint, setFingerprint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    // Guard so we only auto-attempt once (avoid double-invoke in StrictMode)
    const attemptedRef = useRef(false);

    useEffect(() => {
        if (!attemptedRef.current) {
            attemptedRef.current = true;
            collectFingerprint();
        }
    }, []);

    const collectFingerprint = async () => {
        setLoading(true);
        setError(null);

        try {
            // Collect fingerprint and send to server
            const identityData = await fingerprintingService.collectAndSendFingerprint();

            if (identityData) {
                setFingerprint(identityData.identity);
                setUser(identityData.user);
            } else {
                // Fallback for demo purposes
                setError('Unable to reach the identity service — using demo identity.');
                setFingerprint({
                    publicId: 'aegis_a4f3_9c2d_7b81_4e6a',
                    trustScore: 78,
                    metadata: {
                        geohash: '9q8yy', // San Francisco area
                        rttBucket: 'nearby',
                        created: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
                        lastSeen: new Date()
                    },
                    flags: {
                        vpn: false,
                        tor: false,
                        proxy: false,
                        multipleAccounts: false
                    },
                    stats: {
                        contributions: 23,
                        verifiedContributions: 19,
                        disputedContributions: 2,
                        reputation: 1247
                    }
                });
                setUser({
                    id: 'aegis_a4f3_9c2d_7b81_4e6a',
                    username: 'AnonymousSage',
                    reputation: 1247,
                    trustScore: 78,
                    bio: 'Truth seeker in the digital realm',
                    joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                    contributions: {
                        memes: 12,
                        evidence: 8,
                        verifications: 3
                    }
                });
            }
        } catch (error) {
            console.warn('Fingerprint collection failed (caught):', error);
            setError('An unexpected error occurred while collecting identity.');
            // Use demo data as fallback
            setFingerprint({
                publicId: 'aegis_demo_1234',
                trustScore: 65,
                metadata: {
                    geohash: '9q8yy',
                    rttBucket: 'regional',
                    created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    lastSeen: new Date()
                },
                flags: {
                    vpn: false,
                    tor: false,
                    proxy: false,
                    multipleAccounts: false
                },
                stats: {
                    contributions: 5,
                    verifiedContributions: 3,
                    disputedContributions: 1,
                    reputation: 450
                }
            });
        }

        setLoading(false);
    };

    const handleRetry = () => {
        // allow manual retry even if auto attempt already ran
        collectFingerprint();
    };

    if (loading) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-center">
                        <div className="font-semibold mb-1">Establishing Identity</div>
                        <div className="text-sm text-slate-500">Collecting device fingerprint…</div>
                    </div>
                </div>
            </div>
        );
    }

    // Show a small dismissible error message and a Retry button when we used fallback
    const fallbackBanner = error ? (
        <div className="max-w-2xl mx-auto text-center text-xs text-amber-300 mb-2">
            <div>{error}</div>
            <button
                onClick={handleRetry}
                className="mt-2 bg-amber-500 hover:bg-amber-600 text-white text-[11px] py-1 px-3 rounded-lg"
            >
                Retry Identity
            </button>
        </div>
    ) : null;

    const getTrustColor = (score) => {
        if (score >= 80) return 'green';
        if (score >= 60) return 'yellow';
        if (score >= 40) return 'orange';
        return 'red';
    };

    const trustColor = getTrustColor(fingerprint.trustScore);
    const verificationRate = fingerprint.stats.verifiedContributions > 0
        ? (fingerprint.stats.verifiedContributions / fingerprint.stats.contributions * 100).toFixed(0)
        : 0;
    const accountAge = Math.floor((new Date() - fingerprint.metadata.created) / (1000 * 60 * 60 * 24));

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">

            {fallbackBanner}

            {/* Main Identity Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-800">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full bg-${trustColor}-500/10 border-2 border-${trustColor}-500 flex items-center justify-center`}>
                                <Shield className={`w-8 h-8 text-${trustColor}-400`} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Identity Fingerprint</div>
                                <div className="font-mono text-lg font-bold text-slate-200">{fingerprint.publicId}</div>
                                <div className="text-xs text-slate-400 mt-1">Member for {accountAge} days</div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">Trust Score</div>
                            <div className={`text-3xl font-bold text-${trustColor}-400`}>{fingerprint.trustScore}</div>
                            <div className="text-xs text-slate-500">/ 100</div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-200">{fingerprint.stats.contributions}</div>
                            <div className="text-xs text-slate-500">Contributions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{fingerprint.stats.verifiedContributions}</div>
                            <div className="text-xs text-slate-500">Verified</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-200">{verificationRate}%</div>
                            <div className="text-xs text-slate-500">Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-400">{fingerprint.stats.reputation}</div>
                            <div className="text-xs text-slate-500">Reputation</div>
                        </div>
                    </div>

                    {/* Flags and Warnings */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-300">Location</span>
                            </div>
                            <span className="text-sm text-slate-400">{fingerprint.metadata.geohash} ({fingerprint.metadata.rttBucket})</span>
                        </div>

                        {fingerprint.flags.vpn && (
                            <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Wifi className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm text-yellow-300">VPN Detected</span>
                                </div>
                                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            </div>
                        )}

                        {fingerprint.flags.tor && (
                            <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-red-400" />
                                    <span className="text-sm text-red-300">Tor Network</span>
                                </div>
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                            </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-slate-300">Account Status</span>
                            </div>
                            <span className="text-sm text-green-400">Verified</span>
                        </div>
                    </div>

                    {/* Toggle Details Button */}
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span className="text-sm">{showDetails ? 'Hide' : 'Show'} Technical Details</span>
                    </button>
                </div>
            </div>

            {/* Technical Details (Collapsible) */}
            {showDetails && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-slate-400" />
                        <h3 className="text-lg font-semibold text-slate-200">Technical Fingerprint</h3>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-slate-500">User Agent:</span>
                                <div className="font-mono text-xs text-slate-300 mt-1 break-all">
                                    {navigator.userAgent}
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500">Screen:</span>
                                <div className="font-mono text-xs text-slate-300 mt-1">
                                    {screen.width}x{screen.height} ({screen.colorDepth}bit)
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500">Timezone:</span>
                                <div className="font-mono text-xs text-slate-300 mt-1">
                                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500">Platform:</span>
                                <div className="font-mono text-xs text-slate-300 mt-1">
                                    {navigator.platform}
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500">Hardware Concurrency:</span>
                                <div className="font-mono text-xs text-slate-300 mt-1">
                                    {navigator.hardwareConcurrency || 'Unknown'}
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500">Device Memory:</span>
                                <div className="font-mono text-xs text-slate-300 mt-1">
                                    {navigator.deviceMemory || 'Unknown'} GB
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <div className="text-xs text-slate-500 mb-2">This fingerprint is used to establish your identity without requiring login credentials. It helps maintain platform integrity while preserving your anonymity.</div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Profile Section */}
            {user && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Profile</h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-slate-500">Username:</span>
                            <span className="text-slate-200 ml-2">{user.username}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Bio:</span>
                            <p className="text-slate-200 ml-2 mt-1">{user.bio}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800">
                            <div className="text-center">
                                <div className="text-lg font-bold text-slate-200">{user.contributions.memes}</div>
                                <div className="text-xs text-slate-500">Memes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-slate-200">{user.contributions.evidence}</div>
                                <div className="text-xs text-slate-500">Evidence</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-slate-200">{user.contributions.verifications}</div>
                                <div className="text-xs text-slate-500">Verifications</div>
                            </div>
                        </div>
                        
                        {/* Confirmation Button */}
                        <div className="pt-4 border-t border-slate-800">
                            <button
                                onClick={() => onIdentified && onIdentified(user)}
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                            >
                                Confirm Identity & Enter Citadel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}