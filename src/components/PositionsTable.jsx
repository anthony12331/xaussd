import React, { useState } from 'react';
import { SYMBOLS } from '../services/priceFeed';
import { 
  History, 
  ListOrdered, 
  Bot
} from 'lucide-react';

export default function PositionsTable({ openPositions, closedTrades, botLogs, onClosePosition, displayCurrency = 'USD', usdToPhpRate = 58.50 }) {
  const [activeTab, setActiveTab] = useState('POSITIONS'); // 'POSITIONS' | 'HISTORY' | 'BOT_LOGS'

  const isPHP = displayCurrency === 'PHP';

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden flex flex-col h-full shadow-xl">
      {/* Header Tabs */}
      <div className="bg-dark-900 border-b border-dark-600 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('POSITIONS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'POSITIONS' ? 'bg-dark-700 text-white border border-dark-600' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-trade-accent" />
            <span>Open Positions ({openPositions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'HISTORY' ? 'bg-dark-700 text-white border border-dark-600' : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-trade-gold" />
            <span>Closed History ({closedTrades.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('BOT_LOGS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'BOT_LOGS' ? 'bg-dark-700 text-white border border-dark-600' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>AI Bot Logs ({botLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto max-h-[300px] min-h-[180px] p-2">
        {/* Open Positions Tab */}
        {activeTab === 'POSITIONS' && (
          <div>
            {openPositions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                No active open positions. Select Buy or Sell in the Order Panel to open a trade.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-dark-700 font-semibold text-[11px]">
                    <th className="py-2 px-3">Symbol</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Lots</th>
                    <th className="py-2 px-3">Entry Price</th>
                    <th className="py-2 px-3">Mark Price</th>
                    <th className="py-2 px-3">SL / TP</th>
                    <th className="py-2 px-3">Unrealized PnL</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {openPositions.map((pos) => {
                    const isBuy = pos.type === 'BUY';
                    const isProfit = pos.pnl >= 0;
                    const decimals = SYMBOLS[pos.symbol]?.decimals || 2;

                    const pnlPHP = pos.pnl * usdToPhpRate;

                    return (
                      <tr key={pos.id} className="hover:bg-dark-700/50 font-mono transition">
                        <td className="py-2.5 px-3 font-bold text-white font-sans flex items-center gap-1">
                          {pos.symbol}
                          {pos.openedByBot && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded">BOT</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                            isBuy ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white">{pos.lotSize}</td>
                        <td className="py-2.5 px-3 text-gray-300">${pos.entryPrice.toFixed(decimals)}</td>
                        <td className="py-2.5 px-3 text-white font-bold">${pos.currentPrice.toFixed(decimals)}</td>
                        <td className="py-2.5 px-3 text-[11px] text-gray-400">
                          <div>SL: {pos.stopLoss ? `$${pos.stopLoss}` : '-'}</div>
                          <div>TP: {pos.takeProfit ? `$${pos.takeProfit}` : '-'}</div>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <div className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                            {isProfit ? '+' : ''}₱{pnlPHP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PHP
                            <span className="text-[10px] block opacity-80">
                              ({isProfit ? '+' : ''}${pos.pnl.toFixed(2)} | {pos.pnlPercent}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onClosePosition(pos.id, pos.currentPrice)}
                            className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500 px-2.5 py-1 rounded text-xs font-semibold transition"
                          >
                            Close Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Closed Trades History Tab */}
        {activeTab === 'HISTORY' && (
          <div>
            {closedTrades.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                No closed trades in history yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-dark-700 font-semibold text-[11px]">
                    <th className="py-2 px-3">Close Time</th>
                    <th className="py-2 px-3">Symbol</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Lots</th>
                    <th className="py-2 px-3">Entry / Exit</th>
                    <th className="py-2 px-3">Realized PnL</th>
                    <th className="py-2 px-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {closedTrades.map((trade) => {
                    const isProfit = trade.realizedPnl >= 0;
                    const decimals = SYMBOLS[trade.symbol]?.decimals || 2;
                    const pnlPHP = trade.realizedPnl * usdToPhpRate;

                    return (
                      <tr key={trade.id} className="hover:bg-dark-700/50 font-mono transition">
                        <td className="py-2 px-3 text-gray-400">{trade.closeTime}</td>
                        <td className="py-2 px-3 font-bold text-white font-sans">{trade.symbol}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            trade.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-300">{trade.lotSize}</td>
                        <td className="py-2 px-3 text-gray-300">
                          ${trade.entryPrice.toFixed(decimals)} / ${trade.exitPrice.toFixed(decimals)}
                        </td>
                        <td className="py-2 px-3 font-bold">
                          <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                            {isProfit ? '+' : ''}₱{pnlPHP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PHP
                            <span className="text-[10px] block opacity-80">
                              ({isProfit ? '+' : ''}${trade.realizedPnl} | {trade.pnlPercent}%)
                            </span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-400 font-sans text-[11px]">{trade.closeReason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* AI Bot Logs Tab */}
        {activeTab === 'BOT_LOGS' && (
          <div className="space-y-1.5 font-mono text-xs p-1">
            {botLogs.map((log) => (
              <div key={log.id} className="bg-dark-900 border border-dark-700 p-2 rounded flex items-center gap-2">
                <span className="text-gray-500 text-[11px] font-semibold">{log.time}</span>
                <span className="text-gray-200">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
