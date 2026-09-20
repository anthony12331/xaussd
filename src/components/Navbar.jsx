import React from 'react';
import { SYMBOLS } from '../services/priceFeed';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Coins
} from 'lucide-react';

export default function Navbar({ 
  selectedSymbol, 
  onSelectSymbol, 
  timeframe, 
  onSelectTimeframe,
  speed,
  onSelectSpeed,
  isPaused,
  onTogglePause,
  currentPrice,
  previousPrice,
  tradingState,
  onResetBalance,
  onOpenBotConfig,
  displayCurrency,
  onToggleCurrency
}) {
  const symbolInfo = SYMBOLS[selectedSymbol] || SYMBOLS['XAUUSD'];
  const priceChange = previousPrice ? currentPrice - previousPrice : 0;
  const isUp = priceChange >= 0;

  const { equity, equityPHP, stats, botConfig, usdToPhpRate } = tradingState;

  const isPHP = displayCurrency === 'PHP';

  return (
    <header className="bg-dark-800 border-b border-dark-600 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
      {/* Left section: Logo & Instrument Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-bold text-lg text-white">
          <div className="bg-trade-accent p-1.5 rounded-lg text-white shadow-lg glow-gold">
            <Activity className="w-5 h-5 text-trade-gold" />
          </div>
          <span>XUD<span className="text-trade-accent">.AI</span> Trading</span>
        </div>

        {/* Symbol Selector Dropdown */}
        <select 
          value={selectedSymbol}
          onChange={(e) => onSelectSymbol(e.target.value)}
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 font-semibold text-white focus:outline-none focus:border-trade-accent cursor-pointer"
        >
          {Object.entries(SYMBOLS).map(([key, info]) => (
            <option key={key} value={key}>{info.name}</option>
          ))}
        </select>

        {/* Real-time Ticker Badge */}
        <div className="flex items-center gap-2 bg-dark-900 border border-dark-600 px-3 py-1 rounded-lg">
          <span className="text-xs text-gray-400 font-medium">LIVE:</span>
          <span className={`font-mono text-base font-bold ${isUp ? 'text-trade-green' : 'text-trade-red'}`}>
            ${currentPrice ? currentPrice.toFixed(symbolInfo.decimals) : '0.00'}
          </span>
          <span className={`flex items-center text-xs font-semibold ${isUp ? 'text-trade-green' : 'text-trade-red'}`}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(symbolInfo.decimals)}
          </span>
        </div>
      </div>

      {/* Middle section: Chart Timeframe & Speed Controls */}
      <div className="flex items-center gap-2 bg-dark-700 p-1 rounded-lg border border-dark-600">
        <span className="text-xs text-gray-400 px-1">TF:</span>
        {['1s', '5s', '1m', '5m', '15m', '1h'].map((tf) => (
          <button
            key={tf}
            onClick={() => onSelectTimeframe(tf)}
            className={`px-2 py-0.5 text-xs font-semibold rounded transition ${
              timeframe === tf ? 'bg-trade-accent text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tf}
          </button>
        ))}

        <div className="h-4 w-px bg-dark-600 mx-1"></div>

        {/* Pause / Play */}
        <button
          onClick={onTogglePause}
          className={`p-1.5 rounded transition ${isPaused ? 'bg-amber-600 text-white' : 'bg-dark-600 text-gray-300 hover:text-white'}`}
          title={isPaused ? 'Resume Real-time Feed' : 'Pause Feed'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
        </button>

        {/* Speed multiplier */}
        <span className="text-xs text-gray-400 pl-1">Speed:</span>
        {[1, 2, 5, 10].map((s) => (
          <button
            key={s}
            onClick={() => onSelectSpeed(s)}
            className={`px-1.5 py-0.5 text-xs font-bold rounded ${
              speed === s ? 'bg-trade-gold text-dark-900 font-extrabold' : 'text-gray-400 hover:text-white'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Right section: Currency Switcher, Account Stats & AI Bot Toggle */}
      <div className="flex items-center gap-3">
        {/* PHP vs USD Currency Switcher */}
        <button
          onClick={onToggleCurrency}
          className="flex items-center gap-1 bg-dark-900 hover:bg-dark-700 border border-dark-600 px-2.5 py-1.5 rounded-lg text-xs font-bold text-trade-gold transition"
          title={`Switch Display Currency (Current: ${displayCurrency}) | Rate: $1 = ₱${usdToPhpRate}`}
        >
          <Coins className="w-4 h-4 text-trade-gold" />
          <span>{isPHP ? '₱ PHP' : '$ USD'}</span>
        </button>

        {/* Equity & Balance */}
        <div className="flex items-center gap-3 bg-dark-900 border border-dark-600 px-3 py-1 rounded-lg">
          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase">EQUITY ({displayCurrency})</div>
            <div className="font-mono font-extrabold text-white text-sm">
              {isPHP ? (
                `₱${(equityPHP || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              ) : (
                `$${(equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
          </div>

          <div className="h-6 w-px bg-dark-600"></div>

          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase">WIN RATE</div>
            <div className="font-mono font-bold text-trade-green text-sm">
              {stats.winRate}%
            </div>
          </div>
        </div>

        {/* AI Bot Config Modal Button */}
        <button
          onClick={onOpenBotConfig}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition border ${
            botConfig.enabled 
              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 glow-green' 
              : 'bg-dark-700 border-dark-600 text-gray-300 hover:bg-dark-600 hover:text-white'
          }`}
        >
          <Bot className={`w-4 h-4 ${botConfig.enabled ? 'animate-pulse text-emerald-400' : ''}`} />
          <span>AI Bot: {botConfig.enabled ? 'ACTIVE' : 'OFF'}</span>
        </button>

        {/* Reset Balance */}
        <button
          onClick={onResetBalance}
          className="p-1.5 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-gray-400 hover:text-white rounded-lg transition"
          title="Reset Practice Balance"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
