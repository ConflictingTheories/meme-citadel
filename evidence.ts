import React, { useState } from ‘react’;
import { Link2, FileText, Video, Image, Code, TrendingUp, BookOpen, AlertTriangle, Upload, Check, X, Shield, Coins, Zap, Target } from ‘lucide-react’;

export default function ContributionEngine() {
const [step, setStep] = useState(‘select’); // select, input, stake, confirm
const [evidenceType, setEvidenceType] = useState(null);
const [connectionType, setConnectionType] = useState(‘supports’);
const [formData, setFormData] = useState({
url: ‘’,
title: ‘’,
author: ‘’,
year: ‘’,
excerpt: ‘’,
reasoning: ‘’,
pasteContent: ‘’,
stake: 50
});
const [parsing, setParsing] = useState(false);
const [targetMeme, setTargetMeme] = useState({
id: ‘m1’,
caption: ‘Strong families build strong nations’,
currentScore: 342
});

const evidenceTypes = [
{ id: ‘url’, icon: Link2, label: ‘Web URL’, desc: ‘Article, study, or webpage’, color: ‘blue’ },
{ id: ‘pdf’, icon: FileText, label: ‘PDF Document’, desc: ‘Research paper or book’, color: ‘red’ },
{ id: ‘video’, icon: Video, label: ‘Video’, desc: ‘YouTube, Rumble, archive’, color: ‘yellow’ },
{ id: ‘image’, icon: Image, label: ‘Image/Chart’, desc: ‘Infographic or data viz’, color: ‘purple’ },
{ id: ‘paste’, icon: Code, label: ‘Code/Paste’, desc: ‘Pastebin, snippet, data’, color: ‘green’ },
{ id: ‘stat’, icon: TrendingUp, label: ‘Raw Data’, desc: ‘CSV, statistics, numbers’, color: ‘cyan’ }
];

const connectionTypes = [
{ id: ‘supports’, label: ‘Supports’, color: ‘green’, icon: Check, desc: ‘Verifies or strengthens the claim’ },
{ id: ‘disputes’, label: ‘Disputes’, color: ‘red’, icon: X, desc: ‘Contradicts or weakens the claim’ },
{ id: ‘context’, label: ‘Context’, color: ‘blue’, icon: BookOpen, desc: ‘Historical or philosophical root’ },
{ id: ‘related’, label: ‘Related’, color: ‘slate’, icon: Link2, desc: ‘Tangentially connected’ }
];

const handleParse = async () => {
setParsing(true);
// Simulate auto-parsing metadata from URL
setTimeout(() => {
if (formData.url.includes(‘youtube’)) {
setFormData(prev => ({
…prev,
title: ‘Click Farm Documentary’,
author: ‘Channel Name’,
year: ‘2024’
}));
} else if (formData.url.includes(‘pdf’)) {
setFormData(prev => ({
…prev,
title: ‘Two-Parent Household Outcomes Study’,
author: ‘Institute for Family Studies’,
year: ‘2023’
}));
} else {
setFormData(prev => ({
…prev,
title: ‘Extracted Article Title’,
author: ‘Publication Name’,
year: ‘2024’
}));
}
setParsing(false);
setStep(‘input’);
}, 1500);
};

const getConnectionColor = () => {
const conn = connectionTypes.find(c => c.id === connectionType);
return conn?.color || ‘slate’;
};

const potentialReward = Math.floor(formData.stake * 1.5);
const slashRisk = Math.floor(formData.stake * 0.3);

return (
<div className="w-full min-h-screen bg-slate-950 text-slate-200 p-6">
<div className="max-w-4xl mx-auto">

```
    {/* Header */}
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-8 h-8 text-amber-500" />
        <h1 className="text-3xl font-bold">Add Evidence</h1>
      </div>
      <p className="text-slate-400">Strengthen or challenge claims with verifiable sources</p>
    </div>

    {/* Target Meme Display */}
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center">
          <Image className="w-12 h-12 text-slate-600" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-slate-500 mb-1">Adding evidence to:</div>
          <h3 className="text-lg font-semibold mb-2">{targetMeme.caption}</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-amber-500">
              <Shield className="w-4 h-4" />
              <span className="font-bold">{targetMeme.currentScore}</span>
              <span className="text-slate-500">current sources</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* STEP 1: SELECT EVIDENCE TYPE */}
    {step === 'select' && (
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">What type of evidence are you adding?</h2>
        <div className="grid grid-cols-2 gap-4">
          {evidenceTypes.map(type => (
            <button
              key={type.id}
              onClick={() => {
                setEvidenceType(type.id);
                setStep('input');
              }}
              className={`p-6 bg-slate-900 border-2 border-slate-800 hover:border-${type.color}-500 rounded-xl transition-all group`}
            >
              <type.icon className={`w-8 h-8 text-${type.color}-400 mb-3 group-hover:scale-110 transition-transform`} />
              <div className="text-left">
                <div className="font-semibold text-lg mb-1">{type.label}</div>
                <div className="text-sm text-slate-500">{type.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )}

    {/* STEP 2: INPUT EVIDENCE DETAILS */}
    {step === 'input' && (
      <div className="space-y-6">
        <button 
          onClick={() => setStep('select')}
          className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-2"
        >
          ← Back to type selection
        </button>

        {/* Connection Type Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-300">How does this relate to the claim?</label>
          <div className="grid grid-cols-4 gap-3">
            {connectionTypes.map(conn => (
              <button
                key={conn.id}
                onClick={() => setConnectionType(conn.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  connectionType === conn.id 
                    ? `border-${conn.color}-500 bg-${conn.color}-500/10` 
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <conn.icon className={`w-5 h-5 mx-auto mb-2 ${connectionType === conn.id ? `text-${conn.color}-400` : 'text-slate-500'}`} />
                <div className="text-sm font-semibold">{conn.label}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 italic">
            {connectionTypes.find(c => c.id === connectionType)?.desc}
          </p>
        </div>

        {/* URL Input with Auto-Parse */}
        {evidenceType !== 'paste' && evidenceType !== 'stat' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Source URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                placeholder="https://..."
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none"
              />
              <button
                onClick={handleParse}
                disabled={!formData.url || parsing}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {parsing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Auto-Fill
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500">We'll automatically extract metadata from the URL</p>
          </div>
        )}

        {/* Manual Metadata Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Author/Source</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Year Published</label>
          <input
            type="text"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
            placeholder="2024"
            className="w-32 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Excerpt/Quote */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Key Excerpt or Quote *</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            placeholder="Paste the relevant passage or data point..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
          />
          <p className="text-xs text-slate-500">This will be displayed in the citation card</p>
        </div>

        {/* Reasoning */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Why does this {connectionType} the claim? *</label>
          <textarea
            value={formData.reasoning}
            onChange={(e) => setFormData({...formData, reasoning: e.target.value})}
            placeholder="Explain the logical connection..."
            rows={3}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
          />
        </div>

        {/* Pastebin Content (if type is paste) */}
        {evidenceType === 'paste' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Paste Content</label>
            <textarea
              value={formData.pasteContent}
              onChange={(e) => setFormData({...formData, pasteContent: e.target.value})}
              placeholder="Paste code, data, or text snippet..."
              rows={8}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none resize-none font-mono text-sm text-green-400"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setStep('select')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setStep('stake')}
            disabled={!formData.title || !formData.excerpt || !formData.reasoning}
            className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-semibold transition-colors"
          >
            Continue to Staking →
          </button>
        </div>
      </div>
    )}

    {/* STEP 3: STAKE REPUTATION */}
    {step === 'stake' && (
      <div className="space-y-6">
        <button 
          onClick={() => setStep('input')}
          className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-2"
        >
          ← Back to evidence details
        </button>

        <div className="bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-900/50 rounded-xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Stake Your Reputation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Staking prevents spam and rewards quality contributions. If the community verifies your source, 
                you earn reputation. If it's disputed and removed, you lose some stake.
              </p>
            </div>
          </div>

          {/* Stake Amount Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Stake Amount</label>
              <div className="flex items-center gap-2 text-amber-500">
                <Coins className="w-5 h-5" />
                <span className="text-2xl font-bold">{formData.stake}</span>
              </div>
            </div>
            
            <input
              type="range"
              min="10"
              max="500"
              value={formData.stake}
              onChange={(e) => setFormData({...formData, stake: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            <div className="flex justify-between text-xs text-slate-500">
              <span>Min: 10</span>
              <span>Max: 500</span>
            </div>
          </div>

          {/* Risk/Reward Display */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold text-sm">If Verified</span>
              </div>
              <div className="text-2xl font-bold text-green-400">+{potentialReward}</div>
              <div className="text-xs text-green-400/70 mt-1">reputation earned</div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold text-sm">If Disputed</span>
              </div>
              <div className="text-2xl font-bold text-red-400">-{slashRisk}</div>
              <div className="text-xs text-red-400/70 mt-1">maximum loss</div>
            </div>
          </div>

          {/* Current Balance */}
          <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-sm">
            <span className="text-slate-400">Your Current Reputation</span>
            <div className="flex items-center gap-2 text-amber-500 font-bold">
              <Coins className="w-4 h-4" />
              <span>1,247</span>
            </div>
          </div>
        </div>

        {/* Confirmation Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h4 className="font-semibold mb-4">Evidence Summary</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Connection Type</span>
              <span className={`font-semibold text-${getConnectionColor()}-400`}>
                {connectionTypes.find(c => c.id === connectionType)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Title</span>
              <span className="font-semibold max-w-xs text-right">{formData.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Author</span>
              <span className="font-semibold">{formData.author || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stake</span>
              <span className="font-semibold text-amber-500">{formData.stake} reputation</span>
            </div>
          </div>
        </div>

        {/* Final Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setStep('input')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => setStep('confirm')}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Submit Evidence
          </button>
        </div>
      </div>
    )}

    {/* STEP 4: CONFIRMATION */}
    {step === 'confirm' && (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Evidence Submitted!</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Your contribution is now live in the Citadel. The community will verify or dispute it within 48 hours.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setStep('select');
              setFormData({url: '', title: '', author: '', year: '', excerpt: '', reasoning: '', pasteContent: '', stake: 50});
            }}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
          >
            Add Another
          </button>
          <button className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-colors">
            View in Graph
          </button>
        </div>
      </div>
    )}

  </div>
</div>
```

);
}