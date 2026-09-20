import React, { useState, useEffect } from 'react';
import { SYMBOLS } from '../services/priceFeed';
import { TrendingUp, TrendingDown, ShieldAlert, Target, Sparkles } from 'lucide-react';

export default function OrderForm({ selectedSymbol, currentPrice, aiAnalysis, onExecuteOrder, freeMargin }) {
  const [orderType, setOrderType] = useState('MARKET'); // 'MARKET' | 'LIMIT'
  const [lotSize, setLotSize] = useState(1.0);
  const [leverage, setLeverage] = useState(10);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  const symbolInfo = SYMBOLS[selectedSymbol] || SYMBOLS['XAUUSD'];
  const contractUnits = selectedSymbol === 'XAUUSD' ? 100 : selectedSymbol === 'BTCUSD' ? 1 : selectedSymbol === 'ETHUSD' ? 10 : 1000;

  const positionValue = (currentPrice || 0) * lotSize * contractUnits;
  const estimatedMargin = positionValue / leverage;

  // Auto fill SL/TP from AI analysis on request
  const fillAITargets = () => {
    if (aiAnalysis && aiAnalysis.targets) {
      setStopLoss(aiAnalysis.targets.sl.toString());
      setTakeProfit(aiAnalysis.targets.tp1.toString());
    }
  };

  const handleOrder = (type) => {
    const execPrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : currentPrice;

    if (!execPrice || execPrice <= 0) {
      alert('Invalid execution price');
      return;
    }

    onExecuteOrder({
      symbol: selectedSymbol,
      type, // 'BUY' or 'SELL'
      price: execPrice,
      lotSize: parseFloat(lotSize),
      leverage: parseInt(leverage),
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null
    });
  };

  return (
    <div className="bg-dark-800 rounded-xl p-4 border border-dark-600 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-dark-600 pb-2.5">
        <h3 className="font-bold text-white text-sm">Order Execution Panel</h3>
        
        {/* Order Type Tabs */}
        <div className="flex bg-dark-900 p-0.5 rounded-lg border border-dark-600">
          <button
            onClick={() => setOrderType('MARKET')}
            className={`px-3 py-1 text-xs font-semibold rounded ${orderType === 'MARKET' ? 'bg-dark-600 text-white' : 'text-gray-400'}`}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType('LIMIT')}
            className={`px-3 py-1 text-xs font-semibold rounded ${orderType === 'LIMIT' ? 'bg-dark-600 text-white' : 'text-gray-400'}`}
          >
            Limit
          </button>
        </div>
      </div>

      {/* Limit Price Input if Limit Order */}
      {orderType === 'LIMIT' && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Limit Price ($)</label>
          <input
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={currentPrice ? currentPrice.toFixed(symbolInfo.decimals) : '0.00'}
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-1.5 font-mono text-sm text-white focus:outline-none focus:border-trade-accent"
          />
        </div>
      )}

      {/* Lot Size Selector */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs text-gray-400">Position Size (Lots)</label>
          <span className="text-xs text-gray-400 font-mono">1 Lot = {contractUnits} units</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          {[0.1, 0.5, 1.0, 2.0, 5.0].map((size) => (
            <button
              key={size}
              onClick={() => setLotSize(size)}
              className={`py-1 text-xs font-mono font-bold rounded border ${
                lotSize === size ? 'bg-trade-accent border-trade-accent text-white' : 'bg-dark-900 border-dark-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <input
          type="number"
          step="0.1"
          min="0.01"
          value={lotSize}
          onChange={(e) => setLotSize(Math.max(0.01, parseFloat(e.target.value) || 0.1))}
          className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-1.5 font-mono text-sm text-white focus:outline-none focus:border-trade-accent"
        />
      </div>

      {/* Leverage Selector */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Leverage Multiplier</label>
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 5, 10, 20, 50].map((lev) => (
            <button
              key={lev}
              onClick={() => setLeverage(lev)}
              className={`py-1 text-xs font-mono font-bold rounded border ${
                leverage === lev ? 'bg-purple-600 border-purple-500 text-white' : 'bg-dark-900 border-dark-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {lev}x
            </button>
          ))}
        </div>
      </div>

      {/* Stop Loss & Take Profit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Risk Controls (SL / TP)</span>
          <button
            onClick={fillAITargets}
            className="text-[11px] text-trade-gold hover:underline flex items-center gap-1 font-semibold"
          >
            <Sparkles className="w-3 h-3" /> Auto-fill AI Targets
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-rose-400 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Stop Loss ($)
            </label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Optional SL"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-2.5 py-1 font-mono text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-emerald-400 mb-1 flex items-center gap-1">
              <Target className="w-3 h-3" /> Take Profit ($)
            </label>
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Optional TP"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-2.5 py-1 font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Margin Summary */}
      <div className="bg-dark-900 p-2.5 rounded-lg border border-dark-600 text-xs flex justify-between items-center font-mono">
        <span className="text-gray-400">Est. Margin Needed:</span>
        <span className={`font-bold ${estimatedMargin > freeMargin ? 'text-rose-400' : 'text-white'}`}>
          ${estimatedMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* BUY & SELL Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => handleOrder('BUY')}
          className="bg-trade-green hover:bg-trade-green-hover text-white font-extrabold py-3 px-4 rounded-xl shadow-lg flex flex-col items-center justify-center transition active:scale-95 glow-green"
        >
          <div className="flex items-center gap-1 text-base">
            <TrendingUp className="w-5 h-5" /> BUY / LONG
          </div>
          <span className="text-[11px] font-normal opacity-90">
            ${currentPrice ? currentPrice.toFixed(symbolInfo.decimals) : '0.00'}
          </span>
        </button>

        <button
          onClick={() => handleOrder('SELL')}
          className="bg-trade-red hover:bg-trade-red-hover text-white font-extrabold py-3 px-4 rounded-xl shadow-lg flex flex-col items-center justify-center transition active:scale-95 glow-red"
        >
          <div className="flex items-center gap-1 text-base">
            <TrendingDown className="w-5 h-5" /> SELL / SHORT
          </div>
          <span className="text-[11px] font-normal opacity-90">
            ${currentPrice ? currentPrice.toFixed(symbolInfo.decimals) : '0.00'}
          </span>
        </button>
      </div>
    </div>
  );
}
