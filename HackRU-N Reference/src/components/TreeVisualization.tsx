import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, Apple, Gift, Target, Trophy } from 'lucide-react';

export function TreeVisualization() {
  const { treeState } = useStore();
  const [animatedHealth, setAnimatedHealth] = useState(treeState.health);

  useEffect(() => {
    // Animate health change
    const timer = setTimeout(() => {
      setAnimatedHealth(treeState.health);
    }, 100);
    return () => clearTimeout(timer);
  }, [treeState.health]);

  const getFruitIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return <Apple className="w-4 h-4 text-green-600" />;
      case 'coupon':
        return <Gift className="w-4 h-4 text-yellow-500" />;
      case 'streak':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'goal':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'milestone':
        return <Trophy className="w-4 h-4 text-orange-500" />;
      default:
        return <Apple className="w-4 h-4" />;
    }
  };

  const healthColor = 
    animatedHealth >= 80 ? 'text-green-600' :
    animatedHealth >= 60 ? 'text-yellow-600' :
    animatedHealth >= 40 ? 'text-orange-600' :
    'text-red-600';

  return (
    <div className="bg-gradient-to-b from-green-50 to-white rounded-lg p-6 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your BudgetBloom Tree</h2>
        <div className="flex items-center justify-center gap-2">
          <span className={`text-3xl font-bold ${healthColor}`}>
            {Math.round(animatedHealth)}%
          </span>
          <span className="text-gray-600">Health</span>
        </div>
      </div>

      {/* Tree SVG */}
      <div className="flex justify-center mb-6">
        <svg width="200" height="300" viewBox="0 0 200 300" className="drop-shadow-lg">
          {/* Trunk */}
          <rect x="90" y="200" width="20" height="100" fill="#8B4513" />
          
          {/* Leaves/Crown - size based on health */}
          <circle 
            cx="100" 
            cy="150" 
            r={30 + (animatedHealth / 100) * 20} 
            fill="#10b981" 
            opacity={0.6 + (animatedHealth / 100) * 0.4}
          />
          <circle 
            cx="80" 
            cy="130" 
            r={25 + (animatedHealth / 100) * 15} 
            fill="#10b981" 
            opacity={0.6 + (animatedHealth / 100) * 0.4}
          />
          <circle 
            cx="120" 
            cy="130" 
            r={25 + (animatedHealth / 100) * 15} 
            fill="#10b981" 
            opacity={0.6 + (animatedHealth / 100) * 0.4}
          />
          <circle 
            cx="100" 
            cy="110" 
            r={20 + (animatedHealth / 100) * 10} 
            fill="#10b981" 
            opacity={0.6 + (animatedHealth / 100) * 0.4}
          />

          {/* Fruits */}
          {treeState.fruits.slice(-6).map((fruit, idx) => {
            const angle = (idx * 60) * (Math.PI / 180);
            const radius = 40 + (animatedHealth / 100) * 20;
            const x = 100 + Math.cos(angle) * radius;
            const y = 150 + Math.sin(angle) * radius;
            
            return (
              <g key={fruit.id}>
                <circle 
                  cx={x} 
                  cy={y} 
                  r="8" 
                  fill={fruit.type === 'savings' ? '#10b981' : 
                        fruit.type === 'coupon' ? '#fbbf24' : 
                        '#a855f7'} 
                  className="animate-pulse"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{treeState.level}</div>
          <div className="text-sm text-gray-600">Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{treeState.fruits.length}</div>
          <div className="text-sm text-gray-600">Fruits</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{treeState.leaves}</div>
          <div className="text-sm text-gray-600">Leaves</div>
        </div>
      </div>

      {/* Recent Fruits */}
      {treeState.fruits.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Achievements</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {treeState.fruits.slice(-3).reverse().map((fruit) => (
              <div 
                key={fruit.id} 
                className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200"
              >
                {getFruitIcon(fruit.type)}
                <span className="text-xs text-gray-700 flex-1">{fruit.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

