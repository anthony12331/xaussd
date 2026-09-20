import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { SYMBOLS } from '../services/priceFeed';
import { calculateEMA, calculateBollingerBands, calculateRSI, detectCandlestickPattern } from '../services/aiAnalyzer';
import { Trash2, Sliders, Crosshair, PlusCircle } from 'lucide-react';

export default function TradingChart({ symbolKey, candles, timeframe }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  // Series references
  const candlestickSeriesRef = useRef(null);
  const ema5SeriesRef = useRef(null);
  const ema13SeriesRef = useRef(null);
  const ema89SeriesRef = useRef(null);
  const bbUpperSeriesRef = useRef(null);
  const bbLowerSeriesRef = useRef(null);
  const rsiSeriesRef = useRef(null);
  const rsiEma20SeriesRef = useRef(null);
  const rsiOverboughtSeriesRef = useRef(null);
  const rsiOversoldSeriesRef = useRef(null);

  // Indicator visibility toggles
  const [showEMA5, setShowEMA5] = useState(true);
  const [showEMA13, setShowEMA13] = useState(true);
  const [showEMA89, setShowEMA89] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [showRSI, setShowRSI] = useState(true);

  // User Markers / Custom Click Annotations State
  const [userMarkers, setUserMarkers] = useState([]);
  const [selectedMarkerType, setSelectedMarkerType] = useState('NOTE'); // 'NOTE' | 'BUY_TARGET' | 'STOP_LOSS' | 'RESISTANCE'
  const [clickedCandleInfo, setClickedCandleInfo] = useState(null);

  const symbolInfo = SYMBOLS[symbolKey] || SYMBOLS['XAUUSD'];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: '#1F2937' },
        horzLines: { color: '#1F2937' },
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: { color: '#6B7280', style: 1 },
        horzLine: { color: '#6B7280', style: 1 },
      },
      rightPriceScale: {
        borderColor: '#374151',
        autoScale: true,
        scaleMargins: {
          top: 0.08,
          bottom: 0.32,
        },
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: timeframe === '1s' || timeframe === '5s',
        barSpacing: 12,
        minBarSpacing: 3,
        rightOffset: 6,
      },
      handleScroll: { mouseWheel: true, pressedMove: true, horzTouchDrag: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true }
    });

    chartRef.current = chart;

    // Candlestick Series (Main Price Scale)
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: true,
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // RSI Sub-chart Series (Isolated Overlay Scale at bottom)
    const rsiSeries = chart.addLineSeries({
      color: '#e040fb', // Vivid Purple / Pink line for RSI 14
      lineWidth: 1.5,
      priceScaleId: 'rsi_scale',
      title: 'RSI (14)',
      priceFormat: {
        type: 'custom',
        formatter: (v) => v ? v.toFixed(1) : '',
      },
    });
    rsiSeriesRef.current = rsiSeries;

    // RSI EMA 20 Signal Line (Yellow/Amber Overlay on RSI scale)
    const rsiEma20 = chart.addLineSeries({
      color: '#ffb300', // Bright Amber/Yellow for RSI EMA 20
      lineWidth: 1.5,
      priceScaleId: 'rsi_scale',
      title: 'RSI EMA (20)',
      priceFormat: {
        type: 'custom',
        formatter: (v) => v ? v.toFixed(1) : '',
      },
    });
    rsiEma20SeriesRef.current = rsiEma20;

    // RSI Overbought Level (70)
    const rsiOverbought = chart.addLineSeries({
      color: 'rgba(239, 83, 80, 0.6)', // Red dashed line
      lineWidth: 1,
      lineStyle: 2,
      priceScaleId: 'rsi_scale',
      priceFormat: {
        type: 'custom',
        formatter: () => '70',
      },
    });
    rsiOverboughtSeriesRef.current = rsiOverbought;

    // RSI Oversold Level (30)
    const rsiOversold = chart.addLineSeries({
      color: 'rgba(38, 166, 154, 0.6)', // Green dashed line
      lineWidth: 1,
      lineStyle: 2,
      priceScaleId: 'rsi_scale',
      priceFormat: {
        type: 'custom',
        formatter: () => '30',
      },
    });
    rsiOversoldSeriesRef.current = rsiOversold;

    chart.priceScale('rsi_scale').applyOptions({
      scaleMargins: {
        top: 0.76,
        bottom: 0.02,
      },
      autoScale: true,
    });

    // EMA 5 Series (Blue)
    const ema5Series = chart.addLineSeries({
      color: '#2962ff',
      lineWidth: 1.5,
      title: 'EMA 5',
    });
    ema5SeriesRef.current = ema5Series;

    // EMA 13 Series (Orange)
    const ema13Series = chart.addLineSeries({
      color: '#ff6d00',
      lineWidth: 1.5,
      title: 'EMA 13',
    });
    ema13SeriesRef.current = ema13Series;

    // EMA 89 Series (Purple)
    const ema89Series = chart.addLineSeries({
      color: '#a855f7',
      lineWidth: 1.5,
      title: 'EMA 89',
    });
    ema89SeriesRef.current = ema89Series;

    // Bollinger Bands Series (Upper & Lower Teal Lines)
    const bbUpperSeries = chart.addLineSeries({
      color: 'rgba(56, 189, 248, 0.7)',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      title: 'BB Upper',
    });
    bbUpperSeriesRef.current = bbUpperSeries;

    const bbLowerSeries = chart.addLineSeries({
      color: 'rgba(56, 189, 248, 0.7)',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      title: 'BB Lower',
    });
    bbLowerSeriesRef.current = bbLowerSeries;

    // Subscribe to Chart Clicks for Custom User Annotations
    chart.subscribeClick((param) => {
      if (!param || !param.time || !param.seriesPrices) return;

      const candlePrice = param.seriesPrices.get(candlestickSeries);
      const closePrice = candlePrice ? (candlePrice.close || candlePrice) : null;

      if (closePrice) {
        setClickedCandleInfo({
          time: param.time,
          price: closePrice,
          formattedTime: new Date(param.time * 1000).toLocaleTimeString()
        });
      }
    });

    // Resize Observer
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbolKey, timeframe]);

  // Update Data & Indicators when candles change
  useEffect(() => {
    if (!candles || candles.length === 0) return;
    if (!candlestickSeriesRef.current) return;

    // Deduplicate and strictly sort candles by timestamp ascending
    const timeMap = new Map();
    for (const c of candles) {
      if (c && typeof c.time === 'number' && !isNaN(c.time)) {
        timeMap.set(c.time, c);
      }
    }
    const cleanCandles = Array.from(timeMap.values()).sort((a, b) => a.time - b.time);
    if (cleanCandles.length === 0) return;

    const candleData = cleanCandles.map(c => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));

    candlestickSeriesRef.current.setData(candleData);

    // Compute Indicators
    const ema5Data = [];
    const ema13Data = [];
    const ema89Data = [];
    const bbUpperData = [];
    const bbLowerData = [];
    const rsiData = [];
    const rsiObData = [];
    const rsiOsData = [];

    for (let i = 0; i < cleanCandles.length; i++) {
      const subSlice = cleanCandles.slice(0, i + 1);

      // EMA 5
      if (showEMA5 && i >= 4) {
        const ema5 = calculateEMA(subSlice, 5);
        if (ema5 !== null && !isNaN(ema5)) ema5Data.push({ time: cleanCandles[i].time, value: ema5 });
      }

      // EMA 13
      if (showEMA13 && i >= 12) {
        const ema13 = calculateEMA(subSlice, 13);
        if (ema13 !== null && !isNaN(ema13)) ema13Data.push({ time: cleanCandles[i].time, value: ema13 });
      }

      // EMA 89
      if (showEMA89) {
        const ema89Period = Math.min(89, subSlice.length);
        if (subSlice.length >= 20) {
          const ema89 = calculateEMA(subSlice, ema89Period);
          if (ema89 !== null && !isNaN(ema89)) ema89Data.push({ time: cleanCandles[i].time, value: ema89 });
        }
      }

      // Bollinger Bands
      if (showBollinger && i >= 19) {
        const bb = calculateBollingerBands(subSlice, 20, 2);
        if (bb && bb.upper !== null && !isNaN(bb.upper)) bbUpperData.push({ time: cleanCandles[i].time, value: bb.upper });
        if (bb && bb.lower !== null && !isNaN(bb.lower)) bbLowerData.push({ time: cleanCandles[i].time, value: bb.lower });
      }

      // RSI (14 Period) Sub-chart
      if (showRSI && i >= 14) {
        const rsiVal = calculateRSI(subSlice, 14);
        if (rsiVal !== null && !isNaN(rsiVal)) {
          rsiData.push({ time: cleanCandles[i].time, value: rsiVal, close: rsiVal });
          rsiObData.push({ time: cleanCandles[i].time, value: 70 });
          rsiOsData.push({ time: cleanCandles[i].time, value: 30 });
        }
      }
    }

    // Compute EMA 20 directly on RSI 14 values
    const rsiEma20Data = [];
    if (showRSI && rsiData.length >= 20) {
      for (let i = 19; i < rsiData.length; i++) {
        const rsiSlice = rsiData.slice(0, i + 1);
        const rsiEma = calculateEMA(rsiSlice, 20);
        if (rsiEma !== null && !isNaN(rsiEma)) {
          rsiEma20Data.push({ time: rsiData[i].time, value: Number(rsiEma.toFixed(2)) });
        }
      }
    }

    if (ema5SeriesRef.current) ema5SeriesRef.current.setData(showEMA5 ? ema5Data : []);
    if (ema13SeriesRef.current) ema13SeriesRef.current.setData(showEMA13 ? ema13Data : []);
    if (ema89SeriesRef.current) ema89SeriesRef.current.setData(showEMA89 ? ema89Data : []);
    if (bbUpperSeriesRef.current) bbUpperSeriesRef.current.setData(showBollinger ? bbUpperData : []);
    if (bbLowerSeriesRef.current) bbLowerSeriesRef.current.setData(showBollinger ? bbLowerData : []);
    if (rsiSeriesRef.current) rsiSeriesRef.current.setData(showRSI ? rsiData : []);
    if (rsiEma20SeriesRef.current) rsiEma20SeriesRef.current.setData(showRSI ? rsiEma20Data : []);
    if (rsiOverboughtSeriesRef.current) rsiOverboughtSeriesRef.current.setData(showRSI ? rsiObData : []);
    if (rsiOversoldSeriesRef.current) rsiOversoldSeriesRef.current.setData(showRSI ? rsiOsData : []);

  }, [candles, showEMA5, showEMA13, showEMA89, showBollinger, showRSI]);

  // Update Markers on Candlestick Series (User annotations + AI Pattern markers)
  useEffect(() => {
    if (!candlestickSeriesRef.current || !candles || candles.length === 0) return;

    const formattedMarkers = userMarkers.map(m => ({
      time: m.time,
      position: m.type === 'STOP_LOSS' || m.type === 'SELL' ? 'aboveBar' : 'belowBar',
      color: m.type === 'BUY_TARGET' ? '#26a69a' : m.type === 'STOP_LOSS' ? '#ef5350' : m.type === 'RESISTANCE' ? '#a855f7' : '#f0b90b',
      shape: m.type === 'BUY_TARGET' ? 'arrowUp' : m.type === 'STOP_LOSS' ? 'arrowDown' : 'circle',
      text: `${m.label} ($${m.price})`
    }));

    // Auto-detect recent Candlestick Pattern
    const detectedPattern = detectCandlestickPattern(candles);
    if (detectedPattern) {
      const lastCandle = candles[candles.length - 1];
      formattedMarkers.push({
        time: lastCandle.time,
        position: detectedPattern.type === 'BEARISH' ? 'aboveBar' : 'belowBar',
        color: detectedPattern.type === 'BULLISH' ? '#26a69a' : detectedPattern.type === 'BEARISH' ? '#ef5350' : '#f0b90b',
        shape: detectedPattern.type === 'BULLISH' ? 'arrowUp' : detectedPattern.type === 'BEARISH' ? 'arrowDown' : 'circle',
        text: `${detectedPattern.icon} ${detectedPattern.name}`
      });
    }

    // Sort markers by timestamp ascending as required by Lightweight Charts
    formattedMarkers.sort((a, b) => a.time - b.time);

    candlestickSeriesRef.current.setMarkers(formattedMarkers);
  }, [userMarkers, candles]);

  // Add Marker at clicked position
  const handleAddMarkerAtClick = () => {
    if (!clickedCandleInfo) return;

    const labelMap = {
      'NOTE': '📍 Note',
      'BUY_TARGET': '🎯 Buy Target',
      'STOP_LOSS': '🛑 Stop Loss',
      'RESISTANCE': '🟣 Resistance'
    };

    const newMarker = {
      id: Date.now(),
      time: clickedCandleInfo.time,
      price: clickedCandleInfo.price,
      type: selectedMarkerType,
      label: labelMap[selectedMarkerType] || 'Note'
    };

    setUserMarkers(prev => [...prev, newMarker]);
  };

  const handleClearMarkers = () => {
    setUserMarkers([]);
    setClickedCandleInfo(null);
  };

  return (
    <div className="relative w-full h-full bg-dark-800 rounded-xl overflow-hidden border border-dark-600 flex flex-col shadow-xl">
      {/* Chart Header Bar & Indicator Toggles */}
      <div className="px-3 py-2 border-b border-dark-600 bg-dark-900 flex flex-wrap items-center justify-between gap-2">
        {/* Symbol Info */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-extrabold text-white tracking-wide">{symbolInfo.name}</span>
          <span className="text-gray-400 font-mono">({timeframe})</span>
        </div>

        {/* Technical Indicator Toggle Chips */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-trade-accent" /> Indicators:
          </span>

          <button
            onClick={() => setShowEMA5(!showEMA5)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
              showEMA5 ? 'bg-blue-600/20 text-blue-400 border-blue-500' : 'bg-dark-800 text-gray-500 border-dark-600 opacity-60'
            }`}
          >
            EMA 5
          </button>

          <button
            onClick={() => setShowEMA13(!showEMA13)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
              showEMA13 ? 'bg-orange-600/20 text-orange-400 border-orange-500' : 'bg-dark-800 text-gray-500 border-dark-600 opacity-60'
            }`}
          >
            EMA 13
          </button>

          <button
            onClick={() => setShowEMA89(!showEMA89)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
              showEMA89 ? 'bg-purple-600/20 text-purple-400 border-purple-500' : 'bg-dark-800 text-gray-500 border-dark-600 opacity-60'
            }`}
          >
            EMA 89
          </button>

          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
              showBollinger ? 'bg-sky-600/20 text-sky-400 border-sky-500' : 'bg-dark-800 text-gray-500 border-dark-600 opacity-60'
            }`}
          >
            Bollinger
          </button>

          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
              showRSI ? 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500' : 'bg-dark-800 text-gray-500 border-dark-600 opacity-60'
            }`}
          >
            RSI (14) + EMA 20
          </button>
        </div>
      </div>

      {/* Interactive Click Annotation Bar */}
      <div className="bg-dark-900/90 border-b border-dark-700 px-3 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-trade-gold font-semibold flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5 text-trade-gold" /> Click Graph to Annotate:
          </span>

          <select
            value={selectedMarkerType}
            onChange={(e) => setSelectedMarkerType(e.target.value)}
            className="bg-dark-800 border border-dark-600 rounded px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-trade-gold font-semibold"
          >
            <option value="NOTE">📍 Add Custom Note Marker</option>
            <option value="BUY_TARGET">🎯 Add Buy Target Marker</option>
            <option value="STOP_LOSS">🛑 Add Stop Loss Marker</option>
            <option value="RESISTANCE">🟣 Add Resistance Marker</option>
          </select>

          {clickedCandleInfo && (
            <button
              onClick={handleAddMarkerAtClick}
              className="flex items-center gap-1 bg-trade-gold text-dark-900 px-2.5 py-0.5 rounded font-extrabold text-[11px] hover:bg-yellow-400 transition shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Pin Marker @ ${clickedCandleInfo.price}
            </button>
          )}
        </div>

        {userMarkers.length > 0 && (
          <button
            onClick={handleClearMarkers}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold bg-dark-800 px-2 py-0.5 rounded border border-rose-500/30"
          >
            <Trash2 className="w-3 h-3" /> Clear ({userMarkers.length})
          </button>
        )}
      </div>

      {/* Click Readout Banner if candle clicked */}
      {clickedCandleInfo && (
        <div className="bg-purple-950/40 border-b border-purple-500/30 px-3 py-1 flex items-center justify-between text-xs font-mono">
          <span className="text-purple-300">
            Selected Candle @ {clickedCandleInfo.formattedTime}: <strong className="text-white">${clickedCandleInfo.price}</strong>
          </span>
          <span className="text-[11px] text-gray-400 font-sans">
            Click "Pin Marker" above to mark this level on your chart!
          </span>
        </div>
      )}

      {/* Chart Canvas Container */}
      <div ref={chartContainerRef} className="w-full flex-1 min-h-[350px]" />
    </div>
  );
}
