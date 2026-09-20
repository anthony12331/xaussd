import React, { useState } from 'react';
import { Coins, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function WelcomeCapitalModal({ onSubmitCapital, usdToPhpRate = 58.50 }) {
  const [phpInput, setPhpInput] = useState(100000); // Default ₱100,000 PHP

  const usdValue = (phpInput / usdToPhpRate).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(phpInput);
    if (!val || val <= 0) {
      alert('Please enter a valid PHP amount.');
      return;
    }
    onSubmitCapital(val);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6">
        {/* Glow effect */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-trade-gold/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="bg-trade-gold/20 text-trade-gold p-3 rounded-2xl border border-trade-gold/30 shadow-lg glow-gold">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-xl flex items-center gap-2">
              Welcome Trader! 🇵🇭
              <Sparkles className="w-4 h-4 text-trade-gold" />
            </h2>
            <p className="text-xs text-gray-400">Set your starting practice capital in Philippine Pesos (₱)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quick Preset Chips */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 block">Select Starting PHP Capital:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[10000, 50000, 100000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPhpInput(amt)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-extrabold transition ${
                    phpInput === amt 
                      ? 'bg-trade-gold text-dark-900 border-trade-gold shadow-lg glow-gold font-black' 
                      : 'bg-dark-900 border-dark-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  ₱{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Or Enter Custom PHP Amount:</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-trade-gold font-mono font-bold text-lg">₱</span>
              <input
                type="number"
                step="1000"
                min="1000"
                value={phpInput}
                onChange={(e) => setPhpInput(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-dark-900 border border-dark-600 rounded-2xl pl-10 pr-4 py-3 font-mono text-lg font-bold text-white focus:outline-none focus:border-trade-gold"
                placeholder="Enter PHP capital"
              />
            </div>
          </div>

          {/* Conversion Readout Card */}
          <div className="bg-dark-900/90 p-3.5 rounded-2xl border border-dark-600 flex justify-between items-center text-xs font-mono">
            <span className="text-gray-400 font-sans flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Virtual Trading Capital:
            </span>
            <div className="text-right">
              <div className="font-extrabold text-trade-gold text-sm">₱{Number(phpInput || 0).toLocaleString()} PHP</div>
              <div className="text-[11px] text-gray-400">≈ ${Number(usdValue || 0).toLocaleString()} USD</div>
            </div>
          </div>

          {/* Start Trading Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-trade-gold hover:bg-yellow-400 text-dark-900 font-extrabold text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 glow-gold active:scale-95"
          >
            <span>Start Practice Trading with ₱{Number(phpInput || 0).toLocaleString()} PHP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
