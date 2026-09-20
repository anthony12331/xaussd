/**
 * Paper Trading Engine & Automated AI Bot Manager
 * Manages virtual account balance, open positions, PnL calculations, Stop Loss / Take Profit hits,
 * and automated AI Bot strategy execution.
 */

export class TradingEngine {
  constructor(initialBalance = 10000) {
    this.initialBalance = initialBalance;
    this.balance = initialBalance;
    this.equity = initialBalance;
    this.marginUsed = 0;
    this.openPositions = [];
    this.closedTrades = [];
    this.listeners = new Set();

    // AI Bot Configuration
    this.botConfig = {
      enabled: false,
      riskPercent: 2.0, // % of equity per trade
      maxPositions: 2,
      leverage: 10,
      minConfidence: 75,
      autoSLTP: true,
      strategy: 'TREND_AI' // 'TREND_AI' | 'SCALPER' | 'MEAN_REVERSION'
    };

    this.botLogs = [
      { id: 1, time: new Date().toLocaleTimeString(), message: 'AI Trading Bot initialized in Standby Mode.' }
    ];
  }

  subscribe(callback) {
    this.listeners.add(callback);
    this.notify();
    return () => this.listeners.delete(callback);
  }

  notify() {
    const stats = this.getStats();
    const rate = this.usdToPhpRate || 58.50;
    const state = {
      balance: this.balance,
      balancePHP: Number((this.balance * rate).toFixed(2)),
      equity: this.equity,
      equityPHP: Number((this.equity * rate).toFixed(2)),
      marginUsed: this.marginUsed,
      marginUsedPHP: Number((this.marginUsed * rate).toFixed(2)),
      freeMargin: this.equity - this.marginUsed,
      freeMarginPHP: Number(((this.equity - this.marginUsed) * rate).toFixed(2)),
      usdToPhpRate: rate,
      openPositions: [...this.openPositions],
      closedTrades: [...this.closedTrades],
      botConfig: { ...this.botConfig },
      botLogs: [...this.botLogs],
      stats
    };
    this.listeners.forEach(cb => cb(state));
  }

  getStats() {
    const totalTrades = this.closedTrades.length;
    const wins = this.closedTrades.filter(t => t.realizedPnl > 0);
    const losses = this.closedTrades.filter(t => t.realizedPnl < 0);
    
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    const totalProfit = wins.reduce((acc, t) => acc + t.realizedPnl, 0);
    const totalLoss = Math.abs(losses.reduce((acc, t) => acc + t.realizedPnl, 0));
    const netPnl = this.closedTrades.reduce((acc, t) => acc + t.realizedPnl, 0);
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 99.9 : 0;

    return {
      totalTrades,
      winRate: Number(winRate.toFixed(1)),
      totalProfit: Number(totalProfit.toFixed(2)),
      totalLoss: Number(totalLoss.toFixed(2)),
      netPnl: Number(netPnl.toFixed(2)),
      profitFactor: Number(profitFactor.toFixed(2)),
      returnPercent: Number(((this.equity - this.initialBalance) / this.initialBalance * 100).toFixed(2))
    };
  }

  resetAccount(newBalance = 10000) {
    this.initialBalance = newBalance;
    this.balance = newBalance;
    this.equity = newBalance;
    this.marginUsed = 0;
    this.openPositions = [];
    this.closedTrades = [];
    this.botLogs.unshift({
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      message: `Account reset to $${newBalance.toLocaleString()} USD.`
    });
    this.notify();
  }

  openPosition({ symbol, type, price, lotSize = 1, leverage = 10, stopLoss = null, takeProfit = null, isBot = false }) {
    const contractUnits = symbol === 'XAUUSD' ? 100 : symbol === 'BTCUSD' ? 1 : symbol === 'ETHUSD' ? 10 : 1000;
    const positionValue = price * lotSize * contractUnits;
    const requiredMargin = positionValue / leverage;

    if (requiredMargin > (this.equity - this.marginUsed)) {
      if (!isBot) alert('Insufficient margin to open position!');
      return false;
    }

    const newPosition = {
      id: `POS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      symbol,
      type, // 'BUY' or 'SELL'
      entryPrice: price,
      currentPrice: price,
      lotSize,
      contractUnits,
      leverage,
      requiredMargin: Number(requiredMargin.toFixed(2)),
      stopLoss: stopLoss ? Number(stopLoss) : null,
      takeProfit: takeProfit ? Number(takeProfit) : null,
      openTime: new Date().toLocaleTimeString(),
      pnl: 0,
      pnlPercent: 0,
      openedByBot: isBot
    };

    this.openPositions.push(newPosition);
    this.marginUsed += requiredMargin;

    if (isBot) {
      this.botLogs.unshift({
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        message: `🤖 Bot executed ${type} ${lotSize} lot ${symbol} @ $${price} (SL: $${stopLoss || 'None'}, TP: $${takeProfit || 'None'})`
      });
    }

    this.notify();
    return true;
  }

  closePosition(positionId, currentPrice, reason = 'MANUAL') {
    const idx = this.openPositions.findIndex(p => p.id === positionId);
    if (idx === -1) return;

    const pos = this.openPositions[idx];
    const priceDiff = pos.type === 'BUY' ? (currentPrice - pos.entryPrice) : (pos.entryPrice - currentPrice);
    const realizedPnl = priceDiff * pos.lotSize * pos.contractUnits;

    this.balance += realizedPnl;
    this.marginUsed = Math.max(0, this.marginUsed - pos.requiredMargin);

    const closedTrade = {
      ...pos,
      exitPrice: currentPrice,
      closeTime: new Date().toLocaleTimeString(),
      realizedPnl: Number(realizedPnl.toFixed(2)),
      pnlPercent: Number(((realizedPnl / pos.requiredMargin) * 100).toFixed(2)),
      closeReason: reason
    };

    this.closedTrades.unshift(closedTrade);
    this.openPositions.splice(idx, 1);

    if (reason.includes('BOT') || pos.openedByBot) {
      this.botLogs.unshift({
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        message: `🤖 Bot closed ${pos.symbol} position (${reason}) | PnL: ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toFixed(2)}`
      });
    }

    this.notify();
  }

  updateTick(symbol, currentPrice) {
    let unRealizedTotal = 0;
    let autoClosed = false;

    this.openPositions.forEach(pos => {
      if (pos.symbol === symbol) {
        pos.currentPrice = currentPrice;
        const diff = pos.type === 'BUY' ? (currentPrice - pos.entryPrice) : (pos.entryPrice - currentPrice);
        pos.pnl = Number((diff * pos.lotSize * pos.contractUnits).toFixed(2));
        pos.pnlPercent = Number(((pos.pnl / pos.requiredMargin) * 100).toFixed(2));

        // Check Stop Loss & Take Profit hits
        if (pos.stopLoss) {
          if ((pos.type === 'BUY' && currentPrice <= pos.stopLoss) || (pos.type === 'SELL' && currentPrice >= pos.stopLoss)) {
            this.closePosition(pos.id, currentPrice, 'STOP LOSS HIT');
            autoClosed = true;
            return;
          }
        }

        if (pos.takeProfit) {
          if ((pos.type === 'BUY' && currentPrice >= pos.takeProfit) || (pos.type === 'SELL' && currentPrice <= pos.takeProfit)) {
            this.closePosition(pos.id, currentPrice, 'TAKE PROFIT HIT');
            autoClosed = true;
            return;
          }
        }
      }

      unRealizedTotal += pos.pnl;
    });

    this.equity = Number((this.balance + unRealizedTotal).toFixed(2));

    if (!autoClosed) {
      this.notify();
    }
  }

  setBotConfig(newConfig) {
    this.botConfig = { ...this.botConfig, ...newConfig };
    this.botLogs.unshift({
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      message: `AI Bot configuration updated (Enabled: ${this.botConfig.enabled ? 'ON' : 'OFF'}, Risk: ${this.botConfig.riskPercent}%)`
    });
    this.notify();
  }

  // AI Trading Bot Execution Cycle
  evaluateAIBot(analysis, currentPrice) {
    if (!this.botConfig.enabled || !analysis) return;

    const { signal, confidence, targets } = analysis;
    const botPositions = this.openPositions.filter(p => p.symbol === analysis.symbolKey || p.openedByBot);

    // Check if we should open trade
    if (botPositions.length < this.botConfig.maxPositions && confidence >= this.botConfig.minConfidence) {
      if (signal === 'STRONG BUY' || signal === 'BUY') {
        // Calculate lot size based on risk %
        const riskAmount = (this.equity * (this.botConfig.riskPercent / 100));
        const lotSize = Math.max(0.1, Number((riskAmount / 500).toFixed(2)));

        // Don't duplicate buy position if one already exists
        const hasBuy = botPositions.some(p => p.type === 'BUY');
        if (!hasBuy) {
          this.openPosition({
            symbol: analysis.symbolKey || 'XAUUSD',
            type: 'BUY',
            price: currentPrice,
            lotSize,
            leverage: this.botConfig.leverage,
            stopLoss: targets.sl,
            takeProfit: targets.tp1,
            isBot: true
          });
        }
      } else if (signal === 'STRONG SELL' || signal === 'SELL') {
        const riskAmount = (this.equity * (this.botConfig.riskPercent / 100));
        const lotSize = Math.max(0.1, Number((riskAmount / 500).toFixed(2)));

        const hasSell = botPositions.some(p => p.type === 'SELL');
        if (!hasSell) {
          this.openPosition({
            symbol: analysis.symbolKey || 'XAUUSD',
            type: 'SELL',
            price: currentPrice,
            lotSize,
            leverage: this.botConfig.leverage,
            stopLoss: targets.sl,
            takeProfit: targets.tp1,
            isBot: true
          });
        }
      }
    }

    // Check if signal reversed against open bot positions
    botPositions.forEach(pos => {
      if (pos.type === 'BUY' && (signal === 'STRONG SELL' || signal === 'SELL') && confidence >= 80) {
        this.closePosition(pos.id, currentPrice, 'BOT REVERSAL EXIT');
      } else if (pos.type === 'SELL' && (signal === 'STRONG BUY' || signal === 'BUY') && confidence >= 80) {
        this.closePosition(pos.id, currentPrice, 'BOT REVERSAL EXIT');
      }
    });
  }
}
