import React from 'react';
import { HIGH_IMPACT_EVENTS } from '../services/newsService';
import { Newspaper, AlertCircle, Calendar, Zap, ArrowUpRight } from 'lucide-react';

export default function MacroNewsPanel() {
  return (
    <div className="bg-dark-800 rounded-xl p-3.5 border border-dark-600 flex flex-col gap-3 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-600 pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-amber-600/20 text-amber-400 p-1.5 rounded-lg border border-amber-500/30">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs flex items-center gap-1">
              High Impact Macro Economic News
            </h4>
            <p className="text-[10px] text-gray-400">Fed Interest Rates, CPI Inflation & NFP Events</p>
          </div>
        </div>

        <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-extrabold flex items-center gap-1">
          <Zap className="w-3 h-3 animate-pulse" /> HIGH VOLATILITY
        </span>
      </div>

      {/* News Items List */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {HIGH_IMPACT_EVENTS.map((item) => (
          <div 
            key={item.id}
            className="bg-dark-900 border border-dark-700 p-2.5 rounded-lg flex flex-col gap-1.5 hover:border-dark-600 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white">
                  🔴 {item.impact}
                </span>
                <span className="truncate max-w-[220px]">{item.title}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                <Calendar className="w-3 h-3 text-trade-accent" /> {item.time}
              </span>
            </div>

            <div className="text-[11px] text-gray-300 leading-tight">
              {item.description}
            </div>

            <div className="bg-dark-800 p-1.5 rounded border border-dark-700 text-[10px] font-mono flex items-center justify-between">
              <span className="text-gray-400">Gold Impact Matrix:</span>
              <span className="text-trade-gold font-bold">{item.goldImpact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
