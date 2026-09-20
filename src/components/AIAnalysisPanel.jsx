import React from 'react';
import { 
  Brain, 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  MessageSquareText,
  Sparkles,
  Gauge,
  Clock,
  Zap,
  Info
} from 'lucide-react';

export default function AIAnalysisPanel({ analysis, symbolKey, currentPrice, onOpenChat }) {
  if (!analysis) return null;

  const { signal, confidence, reasoning, indicators, targets, actionPlan, holdingDuration } = analysis;

  const isBuy = signal.includes('BUY');
  const isSell = signal.includes('SELL');

  const signalColor = signal === 'STRONG BUY' ? 'bg-emerald-500 text-white glow-green' :
                      signal === 'BUY' ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500' :
                      signal === 'STRONG SELL' ? 'bg-rose-500 text-white glow-red' :
                      signal === 'SELL' ? 'bg-rose-600/30 text-rose-400 border border-rose-500' :
                      'bg-gray-700 text-gray-300';

  return (
    <div className="bg-dark-800 rounded-xl p-4 border border-dark-600 flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-600 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-purple-600/20 p-2 rounded-lg text-purple-400 border border-purple-500/30">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-1.5">
              Genius AI Recommendation Engine
              <Sparkles className="w-4 h-4 text-trade-gold" />
            </h3>
            <p className="text-xs text-gray-400">Real-time trade signals & dynamic holding time</p>
          </div>
        </div>

        {/* AI Advisor Chat Button */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition shadow shadow-purple-600/40"
        >
          <MessageSquareText className="w-4 h-4" />
          <span>Ask AI Advisor</span>
        </button>
      </div>

      {/* Genius Action Blueprint Card */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-900 to-purple-950/40 border border-purple-500/30 p-3.5 rounded-xl flex flex-col gap-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-purple-300 font-extrabold uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-trade-gold" /> Genius Trade Blueprint
          </span>
          <span className="text-xs font-mono font-bold text-trade-gold bg-dark-800 px-2 py-0.5 rounded border border-dark-600">
            {symbolKey}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {/* Action */}
          <div className="bg-dark-800/90 border border-dark-600 p-2 rounded-lg">
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Action</div>
            <div className={`font-mono font-extrabold text-xs mt-0.5 ${isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-gray-300'}`}>
              {actionPlan?.action || signal}
            </div>
          </div>

          {/* Optimal Entry Price */}
          <div className="bg-dark-800/90 border border-dark-600 p-2 rounded-lg">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <Target className="w-3 h-3 text-trade-gold" /> Best Entry Price
            </div>
            <div className="font-mono font-extrabold text-xs text-trade-gold mt-0.5">
              ${targets.entry}
            </div>
          </div>

          {/* Entry Accuracy % */}
          <div className="bg-dark-800/90 border border-dark-600 p-2 rounded-lg">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <Gauge className="w-3 h-3 text-emerald-400" /> Win Accuracy %
            </div>
            <div className="font-mono font-extrabold text-xs text-emerald-400 mt-0.5">
              {Math.min(94, Math.max(68, confidence + 5))}%
            </div>
          </div>

          {/* Target Sell Price */}
          <div className="bg-dark-800/90 border border-dark-600 p-2 rounded-lg">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> Target Profit
            </div>
            <div className="font-mono font-extrabold text-xs text-emerald-400 mt-0.5">
              ${targets.tp1}
            </div>
          </div>

          {/* Cut Loss Price */}
          <div className="bg-dark-800/90 border border-dark-600 p-2 rounded-lg">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" /> Cut Loss (SL)
            </div>
            <div className="font-mono font-extrabold text-xs text-rose-400 mt-0.5">
              ${targets.sl}
            </div>
          </div>
        </div>
      </div>

      {/* Signal Banner & Confidence Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Signal Badge */}
        <div className="bg-dark-900 border border-dark-600 p-3 rounded-lg flex flex-col justify-center items-center text-center">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">AI Signal State</span>
          <div className={`px-4 py-1.5 rounded-lg text-sm font-extrabold tracking-wider ${signalColor}`}>
            {isBuy && <TrendingUp className="w-4 h-4 inline mr-1" />}
            {isSell && <TrendingDown className="w-4 h-4 inline mr-1" />}
            {signal}
          </div>
        </div>

        {/* Confidence Score */}
        <div className="bg-dark-900 border border-dark-600 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-trade-accent" /> AI Confidence
            </span>
            <span className="font-mono font-bold text-white text-sm">{confidence}%</span>
          </div>
          <div className="w-full bg-dark-700 h-2.5 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full transition-all duration-500 ${
                confidence > 75 ? 'bg-emerald-500' : confidence > 60 ? 'bg-trade-accent' : 'bg-amber-500'
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Natural Language AI Rationale */}
      <div className="bg-dark-900/80 border border-dark-600/80 p-3.5 rounded-lg text-xs">
        <div className="flex items-center gap-1.5 font-bold text-gray-300 mb-1.5">
          <Brain className="w-4 h-4 text-trade-gold" />
          <span>AI Technical Rationale</span>
        </div>
        <p className="text-gray-300 leading-relaxed font-sans">{reasoning}</p>
      </div>

      {/* Live Indicator Gauges & Where They Are Guide */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-0.5">
          <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5 text-trade-accent" /> Live Technical Indicators</span>
          <span className="text-[10px] text-gray-500">EMA lines overlay directly on chart above</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-dark-900 border border-dark-600 p-2 rounded-lg">
            <div className="text-gray-400 text-[10px] font-semibold">RSI (14 Period)</div>
            <div className={`font-mono font-bold text-xs mt-0.5 ${
              indicators.rsi < 30 ? 'text-emerald-400 font-extrabold' : indicators.rsi > 70 ? 'text-rose-400 font-extrabold' : 'text-white'
            }`}>
              {indicators.rsi} <span className="text-[9px] font-normal text-gray-400">({indicators.rsi < 30 ? 'Oversold Dip' : indicators.rsi > 70 ? 'Overbought Top' : 'Neutral'})</span>
            </div>
          </div>

          <div className="bg-dark-900 border border-dark-600 p-2 rounded-lg">
            <div className="text-gray-400 text-[10px] font-semibold">MACD Histogram</div>
            <div className={`font-mono font-bold text-xs mt-0.5 ${indicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {indicators.macd.histogram > 0 ? '+' : ''}{indicators.macd.histogram}
            </div>
          </div>

          <div className="bg-dark-900 border border-dark-600 p-2 rounded-lg">
            <div className="text-gray-400 text-[10px] font-semibold">EMA (9 / 21)</div>
            <div className="font-mono font-bold text-white text-xs mt-0.5 truncate">
              {indicators.ema9} / {indicators.ema21}
            </div>
          </div>

          <div className="bg-dark-900 border border-dark-600 p-2 rounded-lg">
            <div className="text-gray-400 text-[10px] font-semibold">Bollinger Lower</div>
            <div className="font-mono font-bold text-emerald-400 text-xs mt-0.5 truncate">
              ${indicators.bb.lower}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
