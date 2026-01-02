import React, { useState, useEffect } from ‘react’;
import { Shield, MapPin, Wifi, AlertTriangle, CheckCircle, Eye, EyeOff, Info } from ‘lucide-react’;

export default function IdentityFingerprint() {
const [fingerprint, setFingerprint] = useState(null);
const [loading, setLoading] = useState(true);
const [showDetails, setShowDetails] = useState(false);

useEffect(() => {
collectFingerprint();
}, []);

const collectFingerprint = async () => {
setLoading(true);

```
// Simulate fingerprint collection
setTimeout(() => {
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
  setLoading(false);
}, 2000);
```

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

const getTrustColor = (score) => {
if (score >= 80) return ‘green’;
if (score >= 60) return ‘yellow’;
if (score >= 40) return ‘orange’;
return ‘red’;
};

const trustColor = getTrustColor(fingerprint.trustScore);
const verificationRate = (fingerprint.stats.verifiedContributions / fingerprint.stats.contributions * 100).toFixed(0);
const accountAge = Math.floor((new Date() - fingerprint.metadata.created) / (1000 * 60 * 60 * 24));

return (
<div className="w-full max-w-2xl mx-auto space-y-4">

```
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

    {/* Trust Score Breakdown */}
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
          <div className="text-slate-400 text-xs mb-2">Contributions</div>
          <div className="text-2xl font-bold text-slate-200">{fingerprint.stats.contributions}</div>
        </div>
        
        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
          <div className="text-slate-400 text-xs mb-2">Verified</div>
          <div className="text-2xl font-bold text-green-400">{fingerprint.stats.verifiedContributions}</div>
        </div>
        
        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
          <div className="text-slate-400 text-xs mb-2">Success Rate</div>
          <div className="text-2xl font-bold text-amber-400">{verificationRate}%</div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Security Checks</div>
        
        <div className={`flex items-center justify-between p-3 rounded-lg ${fingerprint.flags.vpn ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
          <div className="flex items-center gap-3">
            {fingerprint.flags.vpn ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            <span className="text-sm font-medium">VPN Detection</span>
          </div>
          <span className={`text-xs font-semibold ${fingerprint.flags.vpn ? 'text-red-400' : 'text-green-400'}`}>
            {fingerprint.flags.vpn ? 'Detected' : 'Clear'}
          </span>
        </div>

        <div className={`flex items-center justify-between p-3 rounded-lg ${fingerprint.flags.proxy ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
          <div className="flex items-center gap-3">
            {fingerprint.flags.proxy ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            <span className="text-sm font-medium">Proxy/Relay</span>
          </div>
          <span className={`text-xs font-semibold ${fingerprint.flags.proxy ? 'text-red-400' : 'text-green-400'}`}>
            {fingerprint.flags.proxy ? 'Detected' : 'Clear'}
          </span>
        </div>

        <div className={`flex items-center justify-between p-3 rounded-lg ${fingerprint.flags.multipleAccounts ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
          <div className="flex items-center gap-3">
            {fingerprint.flags.multipleAccounts ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            <span className="text-sm font-medium">Sybil Detection</span>
          </div>
          <span className={`text-xs font-semibold ${fingerprint.flags.multipleAccounts ? 'text-red-400' : 'text-green-400'}`}>
            {fingerprint.flags.multipleAccounts ? 'Multiple Accounts' : 'Unique'}
          </span>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-200 leading-relaxed">
          <strong>Privacy Notice:</strong> Your fingerprint is semi-anonymous. We don't store your exact location or IP—only 
          approximate region and device characteristics. This prevents Sybil attacks while preserving privacy.
        </div>
      </div>
    </div>

    {/* Technical Details Toggle */}
    <div className="border-t border-slate-800">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
      >
        <span className="text-sm font-medium text-slate-300">Technical Details</span>
        {showDetails ? (
          <EyeOff className="w-4 h-4 text-slate-500" />
        ) : (
          <Eye className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {showDetails && (
        <div className="px-6 pb-6 space-y-3 text-sm">
          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-slate-300">Geolocation</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Geohash (City-level)</span>
                <span className="font-mono text-slate-300">{fingerprint.metadata.geohash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approximate Region</span>
                <span className="text-slate-300">San Francisco Bay Area</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-300">Network</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">RTT Bucket</span>
                <span className="font-mono text-slate-300">{fingerprint.metadata.rttBucket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Latency Range</span>
                <span className="text-slate-300">10-50ms (Local Network)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
            <div className="text-xs text-slate-400 space-y-1">
              <div><strong>Browser Fingerprint:</strong> SHA256 hash of device characteristics</div>
              <div><strong>IP Hash:</strong> One-way encrypted, not stored in readable form</div>
              <div><strong>Sybil Resistance:</strong> 70% similarity threshold for duplicate detection</div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Rate Limits Display */}
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
        <Shield className="w-5 h-5 text-amber-400" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-200">Your Rate Limits</h3>
        <p className="text-xs text-slate-500">Based on trust score: {fingerprint.trustScore}</p>
      </div>
    </div>

    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
        <span className="text-sm text-slate-300">Evidence Submissions</span>
        <span className="text-sm font-bold text-green-400">20/day</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
        <span className="text-sm text-slate-300">Verifications</span>
        <span className="text-sm font-bold text-green-400">50/day</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
        <span className="text-sm text-slate-300">Dispute Claims</span>
        <span className="text-sm font-bold text-green-400">10/day</span>
      </div>
    </div>

    <div className="mt-4 text-xs text-slate-500 bg-slate-950 rounded-lg p-3 border border-slate-800">
      💡 <strong>Tip:</strong> Increase your trust score to unlock higher rate limits. Verified contributions boost your score!
    </div>
  </div>
</div>
```

);
}
