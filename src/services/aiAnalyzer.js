/**
 * AI Technical Analysis & Trading Signal Engine
 * Computes RSI, MACD, Moving Averages, Bollinger Bands, and Support/Resistance
 * Produces real-time AI Buy/Sell signals, confidence ratings, SL/TP levels, and natural language explanations.
 */

// Calculate Simple Moving Average (SMA)
export function calculateSMA(data, period) {
  if (data.length < period) return null;
  const slice = data.slice(data.length - period);
  const sum = slice.reduce((acc, c) => acc + c.close, 0);
  return sum / period;
}

// Calculate Exponential Moving Average (EMA)
export function calculateEMA(data, period) {
  if (data.length < period) return null;
  const k = 2 / (period + 1);
  let ema = data[0].close;
  for (let i = 1; i < data.length; i++) {
    ema = (data[i].close * k) + (ema * (1 - k));
  }
  return ema;
}

// Calculate Relative Strength Index (RSI)
export function calculateRSI(data, period = 14) {
  if (data.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = data.length - period; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - (100 / (1 + rs))).toFixed(2));
}

// Calculate MACD (12, 26, 9)
export function calculateMACD(data) {
  if (data.length < 26) return { macd: 0, signal: 0, histogram: 0 };

  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd = ema12 - ema26;

  // Approximate signal line
  const prevData = data.slice(0, data.length - 1);
  const prevMacd = (calculateEMA(prevData, 12) || 0) - (calculateEMA(prevData, 26) || 0);
  const signal = (macd * 0.2) + (prevMacd * 0.8);
  const histogram = macd - signal;

  return {
    macd: Number(macd.toFixed(4)),
    signal: Number(signal.toFixed(4)),
    histogram: Number(histogram.toFixed(4))
  };
}

// Calculate Bollinger Bands (20, 2)
export function calculateBollingerBands(data, period = 20, multiplier = 2) {
  if (data.length < period) return { middle: 0, upper: 0, lower: 0 };

  const sma = calculateSMA(data, period);
  const slice = data.slice(data.length - period);
  const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    middle: Number(sma.toFixed(2)),
    upper: Number((sma + (multiplier * stdDev)).toFixed(2)),
    lower: Number((sma - (multiplier * stdDev)).toFixed(2))
  };
}

// Main AI Analysis Evaluator
export function analyzeMarket(candles, currentPrice, symbolKey = 'XAUUSD') {
  if (!candles || candles.length < 20) {
    return {
      signal: 'NEUTRAL',
      confidence: 50,
      reasoning: 'Gathering initial candle history to compute reliable technical metrics...',
      indicators: { rsi: 50, macd: { histogram: 0 }, ema9: currentPrice, ema21: currentPrice },
      targets: { entry: currentPrice, sl: currentPrice * 0.99, tp1: currentPrice * 1.01, tp2: currentPrice * 1.02 }
    };
  }

  const rsi = calculateRSI(candles, 14);
  const macd = calculateMACD(candles);
  const ema9 = calculateEMA(candles, 9) || currentPrice;
  const ema21 = calculateEMA(candles, 21) || currentPrice;
  const sma50 = calculateSMA(candles, Math.min(50, candles.length)) || currentPrice;
  const bb = calculateBollingerBands(candles, 20, 2);

  // Scoring algorithm (-100 to +100)
  let score = 0;
  const reasons = [];

  // 1. RSI Signals
  if (rsi < 30) {
    score += 35;
    reasons.push(`RSI is oversold at ${rsi} (strong reversal buy zone).`);
  } else if (rsi > 70) {
    score -= 35;
    reasons.push(`RSI is overbought at ${rsi} (bearish pull-back danger).`);
  } else if (rsi > 50 && rsi <= 65) {
    score += 15;
    reasons.push(`RSI is in healthy bullish momentum zone (${rsi}).`);
  } else if (rsi < 50 && rsi >= 35) {
    score -= 15;
    reasons.push(`RSI indicates mild bearish momentum (${rsi}).`);
  }

  // 2. MACD Signals
  if (macd.histogram > 0 && macd.macd > macd.signal) {
    score += 25;
    reasons.push('MACD histogram is positive with bullish momentum crossover.');
  } else if (macd.histogram < 0 && macd.macd < macd.signal) {
    score -= 25;
    reasons.push('MACD histogram is negative with bearish breakdown momentum.');
  }

  // 3. Moving Average Alignment (Golden / Death Cross)
  if (ema9 > ema21) {
    score += 20;
    if (currentPrice > sma50) {
      score += 10;
      reasons.push('Short-term EMA(9) is above EMA(21) and price trades above SMA(50) trend line.');
    } else {
      reasons.push('Short-term EMA(9) crossed above EMA(21).');
    }
  } else {
    score -= 20;
    if (currentPrice < sma50) {
      score -= 10;
      reasons.push('Short-term EMA(9) is below EMA(21) and price trades below SMA(50) resistance.');
    } else {
      reasons.push('EMA(9) is below EMA(21) indicating short-term weakness.');
    }
  }

  // 4. Bollinger Band Position
  if (bb.lower > 0 && currentPrice <= bb.lower) {
    score += 20;
    reasons.push('Price is touching lower Bollinger Band (high probability mean-reversion buy).');
  } else if (bb.upper > 0 && currentPrice >= bb.upper) {
    score -= 20;
    reasons.push('Price is testing upper Bollinger Band (over-extended upper resistance).');
  }

  // Determine Signal State
  let signal = 'NEUTRAL';
  let confidence = Math.min(95, Math.max(55, Math.abs(score) + 40));

  if (score >= 45) signal = 'STRONG BUY';
  else if (score >= 20) signal = 'BUY';
  else if (score <= -45) signal = 'STRONG SELL';
  else if (score <= -20) signal = 'SELL';
  else {
    signal = 'NEUTRAL';
    confidence = 52;
    reasons.push('Indicators show conflicting signals; market is consolidating.');
  }

  // Calculate SL / TP targets based on volatility / ATR approximation
  const volatility = Math.abs(bb.upper - bb.lower) || (currentPrice * 0.015);
  const isBullish = signal.includes('BUY');

  let sl = 0;
  let tp1 = 0;
  let tp2 = 0;

  if (isBullish) {
    sl = currentPrice - (volatility * 0.8);
    tp1 = currentPrice + (volatility * 1.0);
    tp2 = currentPrice + (volatility * 1.8);
  } else if (signal.includes('SELL')) {
    sl = currentPrice + (volatility * 0.8);
    tp1 = currentPrice - (volatility * 1.0);
    tp2 = currentPrice - (volatility * 1.8);
  } else {
    sl = currentPrice * 0.992;
    tp1 = currentPrice * 1.010;
    tp2 = currentPrice * 1.020;
  }

  const decimals = symbolKey === 'XUDUSD' ? 4 : 2;

  // Compute estimated holding duration based on candle timeframe
  let holdingDuration = '5 – 15 Minutes';
  if (candles.length > 0) {
    const tfDiff = candles.length > 1 ? (candles[1].time - candles[0].time) : 60;
    if (tfDiff <= 5) holdingDuration = '1 – 3 Minutes (Ultra Scalp)';
    else if (tfDiff <= 60) holdingDuration = '5 – 15 Minutes (Fast Scalp)';
    else if (tfDiff <= 300) holdingDuration = '15 – 45 Minutes (Short Swing)';
    else if (tfDiff <= 900) holdingDuration = '1 – 3 Hours (Intraday Swing)';
    else if (tfDiff <= 3600) holdingDuration = '4 – 12 Hours (Day Trade)';
    else holdingDuration = '1 – 3 Days (Multi-day Hold)';
  }

  return {
    signal,
    confidence: Math.round(confidence),
    score,
    reasoning: reasons.join(' '),
    holdingDuration,
    actionPlan: {
      action: isBullish ? 'BUY / LONG' : signal.includes('SELL') ? 'SELL / SHORT' : 'WAIT / STANDBY',
      asset: symbolKey,
      entryPrice: Number(currentPrice.toFixed(decimals)),
      targetSellPrice: Number(tp1.toFixed(decimals)),
      cutLossPrice: Number(sl.toFixed(decimals)),
      expectedProfit: Number(Math.abs(tp1 - currentPrice).toFixed(decimals)),
      holdingDuration
    },
    indicators: {
      rsi,
      macd,
      ema9: Number(ema9.toFixed(decimals)),
      ema21: Number(ema21.toFixed(decimals)),
      sma50: Number(sma50.toFixed(decimals)),
      bb
    },
    targets: {
      entry: Number(currentPrice.toFixed(decimals)),
      sl: Number(sl.toFixed(decimals)),
      tp1: Number(tp1.toFixed(decimals)),
      tp2: Number(tp2.toFixed(decimals)),
      riskRewardRatio: '1 : 1.5'
    },
    timestamp: Date.now()
  };
}

// AI Assistant Chat Response Generator
export function getAIChatResponse(userQuestion, analysis, symbolKey, currentPrice) {
  const q = userQuestion.toLowerCase();
  const { signal, confidence, reasoning, indicators, targets } = analysis;

  if (q.includes('buy') || q.includes('entry') || q.includes('should i buy')) {
    if (signal.includes('BUY')) {
      return `🤖 **AI Recommendation**: **${signal}** (Confidence: ${confidence}%)\n\nYes, current market conditions support a **BUY** position at $${currentPrice}.\n- **Suggested Entry**: $${targets.entry}\n- **Stop Loss**: $${targets.sl}\n- **Take Profit 1**: $${targets.tp1}\n\n*Rationale*: ${reasoning}`;
    } else {
      return `🤖 **AI Recommendation**: Current signal is **${signal}**. Purchasing now carries higher risk as indicators show ${reasoning}. Consider waiting for a pullback near $${targets.sl} or a confirmed bullish RSI crossover.`;
    }
  }

  if (q.includes('sell') || q.includes('short') || q.includes('exit')) {
    if (signal.includes('SELL')) {
      return `🤖 **AI Recommendation**: **${signal}** (Confidence: ${confidence}%)\n\nThe AI detects bearish momentum at $${currentPrice}.\n- **Suggested Short Entry**: $${targets.entry}\n- **Stop Loss**: $${targets.sl}\n- **Target 1**: $${targets.tp1}\n\n*Rationale*: ${reasoning}`;
    } else {
      return `🤖 **AI Recommendation**: Market is in **${signal}** state. Panic selling or shorting is not recommended right now as RSI is at ${indicators.rsi}.`;
    }
  }

  if (q.includes('rsi') || q.includes('indicator')) {
    return `📊 **Technical Metrics Breakdown for ${symbolKey}**:\n- **RSI (14)**: ${indicators.rsi} (${indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'})\n- **EMA (9 / 21)**: ${indicators.ema9} / ${indicators.ema21}\n- **MACD Histogram**: ${indicators.macd.histogram}\n- **Bollinger Bands**: Upper: $${indicators.bb.upper}, Lower: $${indicators.bb.lower}`;
  }

  if (q.includes('risk') || q.includes('stop loss') || q.includes('target')) {
    return `🛡️ **AI Risk Management Setup**:\n- **Asset**: ${symbolKey}\n- **Recommended Stop Loss**: $${targets.sl} (Risk per trade: ~1.5%)\n- **Take Profit Target 1**: $${targets.tp1}\n- **Take Profit Target 2**: $${targets.tp2}\n- **Risk-to-Reward Ratio**: ${targets.riskRewardRatio}`;
  }

  // Default AI response
  return `🤖 **AI Market Summary for ${symbolKey}**:\nCurrently analyzing price action at **$${currentPrice}**. Signal: **${signal}** (${confidence}% confidence).\n\nKey Insight: ${reasoning}\n\nFeel free to ask me: *"Should I buy now?"*, *"What is the Stop Loss?"*, or *"Explain RSI"*.`;
}
