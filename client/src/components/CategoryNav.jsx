import React from 'react';
import { 
    Scale, Clock, BookOpen, TrendingUp, Palette, 
    Atom, Newspaper, Church, Grid
} from 'lucide-react';

const iconMap = {
    'Scale': Scale,
    'Clock': Clock,
    'BookOpen': BookOpen,
    'TrendingUp': TrendingUp,
    'Palette': Palette,
    'Atom': Atom,
    'Newspaper': Newspaper,
    'Church': Church
};

export default function CategoryNav({ categories, selectedCategory, onSelectCategory }) {
    return (
        <div className="flex flex-wrap gap-2">
            {/* All Categories */}
            <CategoryButton
                id="all"
                name="All Topics"
                icon={Grid}
                color="#64748b"
                isSelected={selectedCategory === 'all'}
                onClick={() => onSelectCategory('all')}
            />
            
            {/* Individual Categories */}
            {categories.map(cat => (
                <CategoryButton
                    key={cat.id}
                    id={cat.id}
                    name={cat.name}
                    icon={iconMap[cat.icon] || Newspaper}
                    color={cat.color}
                    isSelected={selectedCategory === cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                />
            ))}
        </div>
    );
}

function CategoryButton({ id, name, icon: Icon, color, isSelected, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${isSelected 
                    ? 'text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50'}
            `}
            style={isSelected ? { 
                backgroundColor: `${color}20`, 
                borderColor: color,
                border: `1px solid ${color}`,
                boxShadow: `0 0 15px ${color}30`
            } : {}}
        >
            <Icon size={14} style={{ color: isSelected ? color : undefined }} />
            {name}
        </button>
    );
}
