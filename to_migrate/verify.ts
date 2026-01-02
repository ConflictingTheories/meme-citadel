import React, { useState } from ‘react’;
import { Shield, CheckCircle, XCircle, AlertTriangle, Eye, ThumbsUp, ThumbsDown, Coins, TrendingUp, Award, Clock, ExternalLink, FileText, MessageSquare, Zap } from ‘lucide-react’;

// Mock pending verifications
const pendingEvidence = [
{
id: ‘ev_001’,
memeCaption: ‘Strong families build strong nations’,
submittedBy: ‘aegis_a4f3_9c2d_7b81_4e6a’,
submitterTrust: 78,
submittedAt: ‘2h ago’,
stake: 150,
connectionType: ‘supports’,
evidence: {
type: ‘STATISTIC’,
title: ‘Marriage Stability and Child Outcomes 2023’,
author: ‘National Family Institute’,
year: 2023,
excerpt: ‘Children from stable two-parent households show 85% college completion rates versus 45% from single-parent households, and 60% lower rates of behavioral issues.’,
url: ‘https://nfi.org/studies/2023-stability-report.pdf’,
reasoning: ‘This data directly supports the claim by showing measurable outcomes of family structure on societal metrics like education and behavior.’
},
currentVotes: {
verify: 3,
dispute: 1,
needsReview: 0
},
verifiers: [
{ id: ‘user_1’, trust: 92, vote: ‘verify’, stake: 75, comment: ‘Source is legitimate, NFI is peer-reviewed’ },
{ id: ‘user_2’, trust: 65, vote: ‘verify’, stake: 50, comment: ‘Cross-referenced with census data, checks out’ },
{ id: ‘user_3’, trust: 88, vote: ‘verify’, stake: 100, comment: ‘Methodology is sound, sample size adequate’ },
{ id: ‘user_4’, trust: 71, vote: ‘dispute’, stake: 40, comment: ‘Correlation vs causation issue - other factors not controlled’ }
],
timeRemaining: ‘22h’
},
{
id: ‘ev_002’,
memeCaption: ‘The West invented the modern world’,
submittedBy: ‘aegis_7f2e_1a8b_9d4c_3e5f’,
submitterTrust: 82,
submittedAt: ‘5h ago’,
stake: 200,
connectionType: ‘supports’,
evidence: {
type: ‘TEXT’,
title: ‘Human Accomplishment: The Pursuit of Excellence’,
author: ‘Charles Murray’,
year: 2003,
excerpt: ‘Analysis of 4,002 significant figures in human history shows 97% of scientific achievements between 1400-1950 originated from Western Europe and its cultural descendants.’,
url: ‘https://archive.org/details/humanaccomplish’,
reasoning: ‘Comprehensive meta-analysis of historical achievement provides quantitative support for Western innovation dominance in the modern period.’
},
currentVotes: {
verify: 2,
dispute: 2,
needsReview: 1
},
verifiers: [
{ id: ‘user_5’, trust: 95, vote: ‘verify’, stake: 120, comment: ‘Murray's methodology is documented and reproducible’ },
{ id: ‘user_6’, trust: 73, vote: ‘dispute’, stake: 60, comment: ‘Selection bias - Western historians record Western achievements’ },
{ id: ‘user_7’, trust: 81, vote: ‘verify’, stake: 80, comment: ‘Data is verifiable through multiple sources’ },
{ id: ‘user_8’, trust: 68, vote: ‘dispute’, stake: 55, comment: ‘Ignores Islamic Golden Age and Chinese inventions’ },
{ id: ‘user_9’, trust: 77, vote: ‘needsReview’, stake: 45, comment: ‘Need expert historian to weigh in on methodology’ }
],
timeRemaining: ‘19h’
}
];

export default function VerificationSystem() {
const [selectedEvidence, setSelectedEvidence] = useState(null);
const [myVote, setMyVote] = useState(null);
const [myStake, setMyStake] = useState(100);
const [comment, setComment] = useState(’’);
const [showStakeModal, setShowStakeModal] = useState(false);

const userReputation = 1247;

const handleVote = (vote) => {
setMyVote(vote);
setShowStakeModal(true);
};

const submitVote = () => {
// Submit vote with stake
setShowStakeModal(false);
setSelectedEvidence(null);
setMyVote(null);
setComment(’’);
};

const getVoteColor = (vote) => {
switch(vote) {
case ‘verify’: return ‘green’;
case ‘dispute’: return ‘red’;
case ‘needsReview’: return ‘yellow’;
default: return ‘slate’;
}
};

const calculateConsensus = (votes) => {
const total = votes.verify + votes.dispute + votes.needsReview;
if (total === 0) return { status: ‘pending’, percent: 0 };

```
const verifyPercent = (votes.verify / total) * 100;
const disputePercent = (votes.dispute / total) * 100;

if (verifyPercent >= 70) return { status: 'verified', percent: verifyPercent };
if (disputePercent >= 70) return { status: 'disputed', percent: disputePercent };
return { status: 'contested', percent: Math.max(verifyPercent, disputePercent) };
```

};

return (
<div className="min-h-screen bg-slate-950 text-slate-200 p-6">
<div className="max-w-6xl mx-auto">

```
    {/* Header */}
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <Shield className="w-8 h-8 text-amber-500" />
        <h1 className="text-3xl font-bold">Evidence Verification</h1>
      </div>
      <p className="text-slate-400 mb-4">Review submitted evidence and stake your reputation on its validity</p>
      
      {/* User Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xs text-slate-500 mb-1">Your Reputation</div>
            <div className="flex items-center gap-2 text-amber-500">
              <Coins className="w-5 h-5" />
              <span className="text-2xl font-bold">{userReputation}</span>
            </div>
          </div>
          <div className="h-12 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-500 mb-1">Pending Votes</div>
            <div className="text-2xl font-bold text-slate-200">{pendingEvidence.length}</div>
          </div>
          <div className="h-12 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-500 mb-1">Daily Limit</div>
            <div className="text-2xl font-bold text-green-400">50</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-slate-400">Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-slate-400">Disputed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-slate-400">Needs Review</span>
          </div>
        </div>
      </div>
    </div>

    {/* Pending Evidence Queue */}
    <div className="space-y-4">
      {pendingEvidence.map((item) => {
        const consensus = calculateConsensus(item.currentVotes);
        const totalStaked = item.stake + item.verifiers.reduce((sum, v) => sum + v.stake, 0);
        
        return (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-800/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">Evidence for:</div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">{item.memeCaption}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Submitted by</span>
                      <span className="font-mono text-slate-300">{item.submittedBy.substring(0, 20)}...</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Shield className="w-3 h-3" />
                        <span className="text-xs font-bold">{item.submitterTrust}</span>
                      </div>
                    </div>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{item.submittedAt}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block ${
                    item.connectionType === 'supports' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    item.connectionType === 'disputes' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {item.connectionType.toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Coins className="w-3 h-3" />
                    <span>{totalStaked} staked</span>
                  </div>
                </div>
              </div>

              {/* Consensus Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Current Consensus</span>
                  <span className={`font-semibold text-${getVoteColor(consensus.status)}-400`}>
                    {consensus.status.toUpperCase()} {consensus.percent > 0 && `(${consensus.percent.toFixed(0)}%)`}
                  </span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-500 transition-all duration-300" 
                    style={{ width: `${(item.currentVotes.verify / (item.currentVotes.verify + item.currentVotes.dispute + item.currentVotes.needsReview)) * 100}%` }}
                  />
                  <div 
                    className="bg-red-500 transition-all duration-300" 
                    style={{ width: `${(item.currentVotes.dispute / (item.currentVotes.verify + item.currentVotes.dispute + item.currentVotes.needsReview)) * 100}%` }}
                  />
                  <div 
                    className="bg-yellow-500 transition-all duration-300" 
                    style={{ width: `${(item.currentVotes.needsReview / (item.currentVotes.verify + item.currentVotes.dispute + item.currentVotes.needsReview)) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{item.currentVotes.verify} verify • {item.currentVotes.dispute} dispute • {item.currentVotes.needsReview} review</span>
                  <span className="text-amber-500">⏱️ {item.timeRemaining} remaining</span>
                </div>
              </div>
            </div>

            {/* Evidence Content */}
            <div className="p-5">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        item.evidence.type === 'STATISTIC' ? 'border-green-500 text-green-400' :
                        item.evidence.type === 'TEXT' ? 'border-amber-500 text-amber-400' :
                        'border-blue-500 text-blue-400'
                      } uppercase tracking-wider`}>
                        {item.evidence.type}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-200 mb-1">{item.evidence.title}</h4>
                    <div className="text-sm text-slate-400 mb-3">{item.evidence.author} • {item.evidence.year}</div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded p-4 mb-3">
                  <p className="text-sm text-slate-300 italic leading-relaxed">"{item.evidence.excerpt}"</p>
                </div>

                <div className="text-sm text-slate-400 mb-3">
                  <strong className="text-slate-300">Reasoning:</strong> {item.evidence.reasoning}
                </div>

                <a 
                  href={item.evidence.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Original Source
                </a>
              </div>

              {/* Existing Votes */}
              {item.verifiers.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Community Votes ({item.verifiers.length})
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {item.verifiers.map((verifier, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full bg-${getVoteColor(verifier.vote)}-500/10 border border-${getVoteColor(verifier.vote)}-500/30 flex items-center justify-center flex-shrink-0`}>
                          {verifier.vote === 'verify' && <CheckCircle className={`w-4 h-4 text-${getVoteColor(verifier.vote)}-400`} />}
                          {verifier.vote === 'dispute' && <XCircle className={`w-4 h-4 text-${getVoteColor(verifier.vote)}-400`} />}
                          {verifier.vote === 'needsReview' && <AlertTriangle className={`w-4 h-4 text-${getVoteColor(verifier.vote)}-400`} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-slate-400">{verifier.id}</span>
                            <div className="flex items-center gap-1 text-xs text-amber-500">
                              <Shield className="w-3 h-3" />
                              <span>{verifier.trust}</span>
                            </div>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-slate-500">staked {verifier.stake}</span>
                          </div>
                          <p className="text-sm text-slate-300">{verifier.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedEvidence(item);
                    handleVote('verify');
                  }}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Verify
                </button>
                <button
                  onClick={() => {
                    setSelectedEvidence(item);
                    handleVote('dispute');
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Dispute
                </button>
                <button
                  onClick={() => {
                    setSelectedEvidence(item);
                    handleVote('needsReview');
                  }}
                  className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Needs Review
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Stake Modal */}
    {showStakeModal && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-500" />
            Stake Your Reputation
          </h3>

          <div className={`bg-${getVoteColor(myVote)}-500/10 border border-${getVoteColor(myVote)}-500/30 rounded-lg p-4 mb-6`}>
            <div className="flex items-center gap-3 mb-2">
              {myVote === 'verify' && <CheckCircle className="w-6 h-6 text-green-400" />}
              {myVote === 'dispute' && <XCircle className="w-6 h-6 text-red-400" />}
              {myVote === 'needsReview' && <AlertTriangle className="w-6 h-6 text-yellow-400" />}
              <span className={`font-semibold text-${getVoteColor(myVote)}-400 uppercase`}>
                {myVote === 'verify' && 'Verifying Evidence'}
                {myVote === 'dispute' && 'Disputing Evidence'}
                {myVote === 'needsReview' && 'Flagging for Expert Review'}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              {myVote === 'verify' && 'You believe this evidence is legitimate and strengthens the claim.'}
              {myVote === 'dispute' && 'You believe this evidence is flawed, misleading, or incorrectly applied.'}
              {myVote === 'needsReview' && 'You believe this requires expert verification before consensus.'}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Stake Amount</label>
              <input
                type="range"
                min="10"
                max="500"
                value={myStake}
                onChange={(e) => setMyStake(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Min: 10</span>
                <div className="flex items-center gap-2 text-amber-500">
                  <Coins className="w-5 h-5" />
                  <span className="text-2xl font-bold">{myStake}</span>
                </div>
                <span className="text-xs text-slate-500">Max: 500</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Your Reasoning (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explain your vote..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none resize-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">If Consensus Agrees</div>
              <div className="text-xl font-bold text-green-400">+{Math.floor(myStake * 1.5)}</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">If Consensus Disagrees</div>
              <div className="text-xl font-bold text-red-400">-{Math.floor(myStake * 0.3)}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowStakeModal(false);
                setMyVote(null);
                setComment('');
              }}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitVote}
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Submit Vote
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
</div>
```

);
}