import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { SYMBOLS } from '../services/priceFeed';
import { calculateEMA, calculateSMA, calculateBollingerBands, detectCandlestickPattern } from '../services/aiAnalyzer';
import { Eye, EyeOff, MapPin, Trash2, Sliders, Crosshair, PlusCircle } from 'lucide-react';

export default function TradingChart({ symbolKey, candles, timeframe }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  // Series references
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const ema9SeriesRef = useRef(null);
  const ema21SeriesRef = useRef(null);
  const sma50SeriesRef = useRef(null);
  const bbUpperSeriesRef = useRef(null);
  const bbLowerSeriesRef = useRef(null);

  // Indicator visibility toggles
  const [showEMA9, setShowEMA9] = useState(true);
  const [showEMA21, setShowEMA21] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

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
        scaleMargins: {
          top: 0.1,
          bottom: 0.25,
        },
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: timeframe === '1s' || timeframe === '5s',
      },
      handleScroll: { mouseWheel: true, pressedMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true }
    });

    chartRef.current = chart;

    // Candlestick Series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Volume Series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    // EMA 9 Series (Blue)
    const ema9Series = chart.addLineSeries({
      color: '#2962ff',
      lineWidth: 1.5,
      title: 'EMA 9',
    });
    ema9SeriesRef.current = ema9Series;

    // EMA 21 Series (Orange)
    const ema21Series = chart.addLineSeries({
      color: '#ff6d00',
      lineWidth: 1.5,
      title: 'EMA 21',
    });
    ema21SeriesRef.current = ema21Series;

    // SMA 50 Series (Purple)
    const sma50Series = chart.addLineSeries({
      color: '#a855f7',
      lineWidth: 1.5,
      title: 'SMA 50',
    });
    sma50SeriesRef.current = sma50Series;

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

    const candleData = candles.map(c => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));

    candlestickSeriesRef.current.setData(candleData);

    // Update Volume
    if (volumeSeriesRef.current) {
      if (showVolume) {
        const volumeData = candles.map(c => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(38, 166, 154, 0.4)' : 'rgba(239, 83, 80, 0.4)'
        }));
        volumeSeriesRef.current.setData(volumeData);
      } else {
        volumeSeriesRef.current.setData([]);
      }
    }

    // Compute Indicators
    const ema9Data = [];
    const ema21Data = [];
    const sma50Data = [];
    const bbUpperData = [];
    const bbLowerData = [];

    for (let i = 10; i < candles.length; i++) {
      const subSlice = candles.slice(0, i + 1);

      if (showEMA9) {
        const ema9 = calculateEMA(subSlice, 9);
        if (ema9) ema9Data.push({ time: candles[i].time, value: ema9 });
      }

      if (showEMA21 && i >= 22) {
        const ema21 = calculateEMA(subSlice, 21);
        if (ema21) ema21Data.push({ time: candles[i].time, value: ema21 });
      }

      if (showSMA50 && i >= 50) {
        const sma50 = calculateSMA(subSlice, 50);
        if (sma50) sma50Data.push({ time: candles[i].time, value: sma50 });
      }

      if (showBollinger && i >= 20) {
        const bb = calculateBollingerBands(subSlice, 20, 2);
        if (bb.upper) bbUpperData.push({ time: candles[i].time, value: bb.upper });
        if (bb.lower) bbLowerData.push({ time: candles[i].time, value: bb.lower });
      }
    }

    if (ema9SeriesRef.current) ema9SeriesRef.current.setData(showEMA9 ? ema9Data : []);
    if (ema21SeriesRef.current) ema21SeriesRef.current.setData(showEMA21 ? ema21Data : []);
    if (sma50SeriesRef.current) sma50SeriesRef.current.setData(showSMA50 ? sma50Data : []);
    if (bbUpperSeriesRef.current) bbUpperSeriesRef.current.setData(showBollinger ? bbUpperData : []);
    if (bbLowerSeriesRef.current) bbLowerSeriesRef.current.setData(showBollinger ? bbLowerData : []);

  }, [candles, showEMA9, showEMA21, showSMA50, showBollinger, showVolume]);

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
            onClick={() => setShowEMA9(!showEMA9)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
              showEMA9 ? 'bg-blue-600/20 text-blue-400 border-blue-500' : 'bg-dark-800 text-gray-500 border-dark-600 opacity-60'
            }`}
          >
            EMA 9
          </button>

          <button
            onClick={() => setShowEMA21(!showEMA21)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
              showEMA21 ? 'bg-orange-600/20 text-orange-400 border-orange-500' : 'bg-dark-800 text-gray-500 border-dark-600 opacity-60'
            }`}
          >
            EMA 21
          </button>

          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
              showSMA50 ? 'bg-purple-600/20 text-purple-400 border-purple-500' : 'bg-dark-800 text-gray-500 border-dark-600 opacity-60'
            }`}
          >
            SMA 50
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
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
              showVolume ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500' : 'bg-dark-800 text-gray-500 border-dark-600 opacity-60'
            }`}
          >
            Vol
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
