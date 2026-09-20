import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DXYCorrelationCard({ dxyData, symbolKey }) {
  if (!dxyData) return null;

  const { dxyPrice, dxyChange, correlation, bias } = dxyData;
  const isUp = dxyChange >= 0;

  const isGold = symbolKey === 'XAUUSD' || symbolKey === 'XUDUSD';

  return (
    <div className="bg-dark-800 rounded-xl p-3.5 border border-dark-600 flex flex-col gap-2.5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-600 pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600/20 text-blue-400 p-1.5 rounded-lg border border-blue-500/30">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs flex items-center gap-1">
              DXY US Dollar Index Tracker
            </h4>
            <p className="text-[10px] text-gray-400">Live Inverse Correlation Detector</p>
          </div>
        </div>

        {/* Dynamic Correlation Badge */}
        <div className="bg-dark-900 border border-dark-600 px-2.5 py-1 rounded-lg text-right font-mono text-[11px]">
          <div className="text-[9px] text-gray-400 font-sans uppercase">Gold Correlation</div>
          <div className="font-bold text-amber-400">{correlation} (Strong Inverse)</div>
        </div>
      </div>

      {/* DXY Live Price & Change Bar */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-dark-900 p-2 rounded-lg border border-dark-600 flex items-center justify-between">
          <span className="text-gray-400 text-[11px]">DXY Price:</span>
          <span className="font-mono font-bold text-white text-sm">{dxyPrice}</span>
        </div>

        <div className="bg-dark-900 p-2 rounded-lg border border-dark-600 flex items-center justify-between">
          <span className="text-gray-400 text-[11px]">DXY Change:</span>
          <span className={`font-mono font-bold text-sm flex items-center gap-0.5 ${isUp ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isUp ? '+' : ''}{dxyChange}%
          </span>
        </div>
      </div>

      {/* Impact Guidance for Gold */}
      {isGold && (
        <div className={`p-2.5 rounded-lg border text-xs font-sans flex items-start gap-2 ${
          isUp 
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' 
            : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
        }`}>
          {isUp ? <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> : <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
          <div>
            <span className="font-bold block mb-0.5">{bias}</span>
            <span className="text-[11px] opacity-90 leading-tight block">
              {isUp 
                ? 'When DXY surges, Gold usually faces selling pressure due to higher Dollar borrowing costs.' 
                : 'When DXY drops, investors flock to Gold as a store of value, boosting XAU/USD rallies!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
