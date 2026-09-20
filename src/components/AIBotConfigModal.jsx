import React, { useState } from 'react';
import { Bot, X, Shield, Zap, Sliders, CheckCircle2 } from 'lucide-react';

export default function AIBotConfigModal({ botConfig, onSaveConfig, onClose }) {
  const [enabled, setEnabled] = useState(botConfig.enabled);
  const [riskPercent, setRiskPercent] = useState(botConfig.riskPercent);
  const [maxPositions, setMaxPositions] = useState(botConfig.maxPositions);
  const [minConfidence, setMinConfidence] = useState(botConfig.minConfidence);
  const [strategy, setStrategy] = useState(botConfig.strategy);
  const [leverage, setLeverage] = useState(botConfig.leverage);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig({
      enabled,
      riskPercent: parseFloat(riskPercent),
      maxPositions: parseInt(maxPositions),
      minConfidence: parseInt(minConfidence),
      strategy,
      leverage: parseInt(leverage)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-dark-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/30">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">AI Automated Trading Bot</h2>
            <p className="text-xs text-gray-400">Configure auto-execution paper trading parameters</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Enable / Disable Toggle */}
          <div className="bg-dark-900 p-4 rounded-xl border border-dark-600 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Bot Status</div>
              <div className="text-xs text-gray-400">Allow AI to automatically place trades</div>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`px-4 py-1.5 rounded-full font-bold text-xs transition ${
                enabled ? 'bg-emerald-500 text-white glow-green' : 'bg-dark-600 text-gray-400'
              }`}
            >
              {enabled ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {/* Strategy Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1.5 block">AI Trading Preset</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'TREND_AI', name: 'Trend AI', desc: 'RSI & EMA trend' },
                { id: 'SCALPER', name: 'Scalper AI', desc: 'Quick momentum' },
                { id: 'MEAN_REVERSION', name: 'Reversion AI', desc: 'Bollinger bounds' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStrategy(s.id)}
                  className={`p-2 rounded-xl text-left border font-semibold transition ${
                    strategy === s.id ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-dark-900 border-dark-600 text-gray-400'
                  }`}
                >
                  <div className="text-xs font-bold">{s.name}</div>
                  <div className="text-[10px] opacity-75 font-normal">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Risk % per trade */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300 font-semibold">Risk Per Trade (% Equity)</span>
              <span className="font-mono font-bold text-emerald-400">{riskPercent}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              className="w-full accent-emerald-500 bg-dark-900 rounded-lg cursor-pointer"
            />
          </div>

          {/* Minimum AI Confidence Threshold */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300 font-semibold">Minimum Signal Confidence</span>
              <span className="font-mono font-bold text-trade-accent">{minConfidence}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="90"
              step="5"
              value={minConfidence}
              onChange={(e) => setMinConfidence(e.target.value)}
              className="w-full accent-trade-accent bg-dark-900 rounded-lg cursor-pointer"
            />
          </div>

          {/* Max Open Positions & Leverage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1 block">Max Open Positions</label>
              <select
                value={maxPositions}
                onChange={(e) => setMaxPositions(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-1.5 text-white font-mono"
              >
                <option value="1">1 Trade</option>
                <option value="2">2 Trades</option>
                <option value="3">3 Trades</option>
                <option value="5">5 Trades</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1 block">Bot Leverage</label>
              <select
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-1.5 text-white font-mono"
              >
                <option value="5">5x</option>
                <option value="10">10x</option>
                <option value="20">20x</option>
                <option value="50">50x</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-xl font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow-lg shadow-emerald-600/30"
            >
              Save & Apply Bot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
