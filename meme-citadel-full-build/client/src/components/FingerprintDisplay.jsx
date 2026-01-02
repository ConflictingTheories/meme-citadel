import React, { useState, useEffect } from 'react';
import { Shield, ShieldOff, Wifi, WifiOff, Globe, Fingerprint, HelpCircle } from 'lucide-react';

// This is the client-side component that collects and displays the user's identity fingerprint.
// In a real app, the collection logic would be more extensive.

async function getFingerprintData() {
    // This is a simplified version of the complex fingerprinting described.
    // It simulates collecting various data points.
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const renderer = gl ? gl.getParameter(gl.RENDERER) : 'WebGL not supported';

    return {
        publicId: "hash-a4b1c8f2",
        geo: "New York, USA",
        trustScore: 95,
        reputation: 2500,
        flags: ["GEO_CONFIRMED", "BROWSER_PRINT_MATCH", "NO_VPN_DETECTED"],
        details: {
            ipHash: "a1b2c3d4...",
            geo: "New York, USA",
            rtt: "50-100ms",
            browser: "Chrome/125.0",
            renderer: renderer,
            // ... and many other data points
        }
    };
}


export default function FingerprintDisplay({ compact = false }) {
    const [identity, setIdentity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIdentity = async () => {
            // In a real app, this might fetch from /api/user/identity AND run local checks
            try {
                const res = await fetch('http://localhost:3001/api/user/identity');
                const data = await res.json();
                setIdentity(data);
            } catch (error) {
                console.error("Failed to fetch identity:", error);
                // Fallback to a mock identity on error
                setIdentity({
                    publicId: "hash-error-fallback",
                    geo: "Unknown",
                    trustScore: 0,
                    reputation: 0,
                    username: "Anonymous",
                    flags: ["API_ERROR"]
                });
            }
            setLoading(false);
        };

        fetchIdentity();
    }, []);

    if (loading) {
        return compact ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Fingerprint size={16} className="animate-pulse" />
                <span>Connecting...</span>
            </div>
        ) : (
            <div className="w-full bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                <p className="text-sm text-slate-400">Securing connection...</p>
            </div>
        );
    }

    const trustColor = identity.trustScore > 80 ? 'text-green-400' : identity.trustScore > 50 ? 'text-yellow-400' : 'text-red-400';

    // Compact mode for header
    if (compact) {
        return (
            <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2">
                <Fingerprint className="text-cyan-400" size={18} />
                <div className="text-sm">
                    <span className="text-slate-300 font-medium">@{identity.username || 'Anonymous'}</span>
                    <span className={`ml-2 font-bold ${trustColor}`}>{identity.trustScore}</span>
                    <span className="text-indigo-400 ml-2">{identity.reputation} rep</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm text-sm text-slate-300 font-mono">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-3">
                    <Fingerprint className="text-cyan-400" size={20} />
                    <h3 className="font-bold text-base text-white">Identity Fingerprint</h3>
                </div>
                <div className="relative group">
                    <HelpCircle size={16} className="text-slate-500 cursor-pointer" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-950 p-3 rounded-lg border border-slate-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        This is a unique, semi-anonymous hash of your browser, network, and device properties to prevent Sybil attacks. It is not your real name.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="col-span-2">
                    <p className="text-xs text-slate-500">Public ID</p>
                    <p className="font-semibold text-cyan-400 break-all">{identity.publicId}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Trust Score</p>
                    <p className={`font-bold text-lg ${trustColor}`}>{identity.trustScore} / 100</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Reputation</p>
                    <p className="font-bold text-lg text-indigo-400">{identity.reputation}</p>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                 <div className="flex items-center gap-2 text-xs">
                    {identity.flags.includes("NO_VPN_DETECTED") ? 
                        <><Wifi size={14} className="text-green-500"/><span>Secure Connection</span></> : 
                        <><WifiOff size={14} className="text-red-500"/><span>VPN/Proxy Detected</span></>
                    }
                </div>
                 <div className="flex items-center gap-2 text-xs">
                    {identity.flags.includes("GEO_CONFIRMED") ? 
                        <><Globe size={14} className="text-green-500"/><span>{identity.geo}</span></> :
                        <><Globe size={14} className="text-yellow-500"/><span>Location Unconfirmed</span></>
                    }
                </div>
                <div className="flex items-center gap-2 text-xs">
                    {identity.flags.includes("BROWSER_PRINT_MATCH") ?
                        <><Shield size={14} className="text-green-500"/><span>Device Verified</span></> :
                        <><ShieldOff size={14} className="text-red-500"/><span>Device Unrecognized</span></>
                    }
                </div>
            </div>
        </div>
    );
}