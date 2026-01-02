import React, { useState } from ‘react’;
import { Shield, ChevronDown, ExternalLink, BookOpen, TrendingUp, Calendar, Award, Link2, FileText, MessageSquare, Plus, Search } from ‘lucide-react’;

// Real demo data with actual memes and sources
const demoMemes = [
{
id: “m1”,
image: “https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=800&h=600&fit=crop”,
caption: “Strong families build strong nations”,
author: “TradWest”,
timestamp: “2h ago”,
citadelScore: 342,
sources: [
{
type: “PHILOSOPHY”,
title: “Politics”,
author: “Aristotle”,
year: -350,
quote: “The family is the natural and fundamental unit of society”,
link: “ipfs://Qm…abc123”,
verified: true
},
{
type: “STATISTIC”,
title: “Marriage Stability Study 2023”,
author: “Institute for Family Studies”,
year: 2023,
data: “Children from two-parent households: 85% college completion vs 45% single-parent”,
link: “https://ifstudies.org/…”,
verified: true
},
{
type: “HISTORY”,
title: “The Rise and Fall of Civilizations”,
author: “J.D. Unwin”,
year: 1934,
quote: “No civilization has survived the loss of the nuclear family structure for more than three generations”,
link: “arweave.net/tx…xyz”,
verified: true
}
],
threads: [
{ user: “PhilosophyKing”, text: “Also see Roger Scruton’s writings on this”, score: 45 },
{ user: “DataDriven”, text: “Added the Pew Research longitudinal study”, score: 23 }
]
},
{
id: “m2”,
image: “https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop”,
caption: “The West invented the modern world”,
author: “HistoryPill”,
timestamp: “5h ago”,
citadelScore: 567,
sources: [
{
type: “HISTORY”,
title: “The Scientific Revolution”,
author: “Multiple Sources”,
year: 1700,
quote: “95% of major scientific discoveries 1500-1900 originated in Western Europe”,
link: “ipfs://Qm…def456”,
verified: true
},
{
type: “TEXT”,
title: “The WEIRDest People in the World”,
author: “Joseph Henrich”,
year: 2020,
quote: “Western institutions created unique psychological patterns enabling innovation”,
link: “https://archive.org/…”,
verified: true
},
{
type: “STATISTIC”,
title: “Patent Database Analysis”,
author: “World IP Organization”,
year: 2022,
data: “Patents filed by nation: Western nations represent 78% of all registered innovations”,
link: “https://wipo.int/…”,
verified: true
}
],
threads: [
{ user: “Renaissance”, text: “Don’t forget Islamic Golden Age contributions”, score: 67 },
{ user: “SourceHunter”, text: “Added Charles Murray’s Human Accomplishment data”, score: 34 }
]
},
{
id: “m3”,
image: “https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&h=600&fit=crop”,
caption: “Freedom requires eternal vigilance”,
author: “LibertasDefensor”,
timestamp: “12h ago”,
citadelScore: 189,
sources: [
{
type: “TEXT”,
title: “On Liberty”,
author: “John Stuart Mill”,
year: 1859,
quote: “The only purpose for which power can be rightfully exercised over any member of a civilized community, against his will, is to prevent harm to others”,
link: “ipfs://Qm…ghi789”,
verified: true
},
{
type: “HISTORY”,
title: “Decline of Roman Republic”,
author: “Plutarch”,
year: 100,
quote: “The loss of civic virtue preceded the loss of freedom by mere decades”,
link: “arweave.net/tx…rst”,
verified: true
}
],
threads: [
{ user: “Constitutionalist”, text: “Linked to Federalist Papers #10”, score: 28 }
]
}
];

export default function MemeCitadel() {
const [expandedMeme, setExpandedMeme] = useState(null);
const [selectedSource, setSelectedSource] = useState(null);
const [view, setView] = useState(‘feed’); // ‘feed’ or ‘add’

const toggleMeme = (id) => {
setExpandedMeme(expandedMeme === id ? null : id);
setSelectedSource(null);
};

const sourceColors = {
PHILOSOPHY: ‘blue’,
HISTORY: ‘purple’,
STATISTIC: ‘green’,
TEXT: ‘amber’
};

return (
<div className="min-h-screen bg-slate-950">
{/* Fixed Header */}
<div className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
<div className="max-w-5xl mx-auto px-4 py-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<Shield className="w-8 h-8 text-amber-500" />
<div>
<h1 className="text-2xl font-bold text-slate-100">AEGIS</h1>
<p className="text-xs text-slate-500">Memetic Citadel</p>
</div>
</div>

```
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              placeholder="Search claims..."
              className="pl-9 pr-4 py-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 focus:border-amber-500 focus:outline-none text-sm w-64"
            />
          </div>
          
          <button 
            onClick={() => setView(view === 'feed' ? 'add' : 'feed')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post Meme
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Main Feed */}
  <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
    {demoMemes.map((meme) => (
      <div key={meme.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
        
        {/* Meme Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-sm">
              {meme.author[0]}
            </div>
            <div>
              <div className="font-semibold text-slate-200">{meme.author}</div>
              <div className="text-xs text-slate-500">{meme.timestamp}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-amber-500/30">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-amber-500">{meme.citadelScore}</span>
            <span className="text-xs text-slate-400">sources</span>
          </div>
        </div>

        {/* Meme Image */}
        <div className="relative bg-slate-950">
          <img 
            src={meme.image} 
            alt={meme.caption}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{meme.caption}</h2>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-blue-400">
            <BookOpen className="w-4 h-4" />
            <span>{meme.sources.filter(s => s.type === 'PHILOSOPHY' || s.type === 'TEXT').length} texts</span>
          </div>
          <div className="flex items-center gap-2 text-purple-400">
            <Calendar className="w-4 h-4" />
            <span>{meme.sources.filter(s => s.type === 'HISTORY').length} historical</span>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span>{meme.sources.filter(s => s.type === 'STATISTIC').length} data</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <MessageSquare className="w-4 h-4" />
            <span>{meme.threads.length} discussions</span>
          </div>
        </div>

        {/* Expand Button */}
        <div className="p-4">
          <button
            onClick={() => toggleMeme(meme.id)}
            className="w-full py-3 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-600/30 rounded-lg font-semibold text-amber-500 flex items-center justify-center gap-2 transition-all"
          >
            {expandedMeme === meme.id ? 'Hide Sources' : 'Enter the Citadel'}
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedMeme === meme.id ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Sources */}
        {expandedMeme === meme.id && (
          <div className="border-t border-slate-800 bg-slate-950/50">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-amber-500" />
                Supporting Evidence ({meme.sources.length} primary sources)
              </h3>

              {meme.sources.map((source, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900 rounded-lg p-5 border border-slate-800 hover:border-amber-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-semibold bg-${sourceColors[source.type]}-500/10 text-${sourceColors[source.type]}-400 border border-${sourceColors[source.type]}-500/30`}>
                        {source.type}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{source.title}</div>
                        <div className="text-sm text-slate-500">{source.author} • {Math.abs(source.year)} {source.year < 0 ? 'BC' : 'AD'}</div>
                      </div>
                    </div>
                    {source.verified && (
                      <div className="flex items-center gap-1 text-green-400 text-xs">
                        <Award className="w-4 h-4" />
                        Verified
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800 rounded p-4 mb-3">
                    <p className="text-slate-300 text-sm italic leading-relaxed">
                      "{source.quote || source.data}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <a 
                      href={source.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm flex items-center gap-2 text-slate-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Source
                    </a>
                    <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm flex items-center gap-2 text-slate-300 transition-colors">
                      <Link2 className="w-4 h-4" />
                      Explore Connections
                    </button>
                    <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-400 transition-colors">
                      Add Counter-Evidence
                    </button>
                  </div>
                </div>
              ))}

              {/* Discussion Threads */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Community Contributions
                </h4>
                {meme.threads.map((thread, idx) => (
                  <div key={idx} className="bg-slate-900/50 rounded-lg p-4 mb-2 border border-slate-800/50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                        {thread.user[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-300 text-sm">{thread.user}</span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-500">added source</span>
                        </div>
                        <p className="text-sm text-slate-400">{thread.text}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-sm">
                        <Award className="w-4 h-4" />
                        +{thread.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Source Button */}
              <button className="w-full mt-4 py-3 border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-lg text-slate-400 hover:text-amber-500 font-medium transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Add Supporting Evidence
              </button>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>

  {/* Bottom Stats Bar */}
  <div className="sticky bottom-0 border-t border-slate-800 bg-slate-900/95 backdrop-blur py-3">
    <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-sm">
      <div className="text-slate-400">
        Total Network: <span className="text-amber-500 font-bold">1,247 memes</span> • <span className="text-blue-400 font-bold">15,432 sources</span>
      </div>
      <div className="text-slate-500">
        Citadel Protocol v1.0
      </div>
    </div>
  </div>
</div>
```

);
}