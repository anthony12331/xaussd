import React, { useState, useEffect, useRef } from 'react';
import { PriceFeedManager } from './services/priceFeed';
import { analyzeMarket } from './services/aiAnalyzer';
import { TradingEngine } from './services/tradingEngine';

import Navbar from './components/Navbar';
import TradingChart from './components/TradingChart';
import AIAnalysisPanel from './components/AIAnalysisPanel';
import OrderForm from './components/OrderForm';
import PositionsTable from './components/PositionsTable';
import AIBotConfigModal from './components/AIBotConfigModal';
import AIChatModal from './components/AIChatModal';

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('1m');
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const [feedData, setFeedData] = useState({ currentPrice: 0, candles: [] });
  const [previousPrice, setPreviousPrice] = useState(0);

  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Trading engine state
  const [tradingState, setTradingState] = useState({
    balance: 10000,
    equity: 10000,
    marginUsed: 0,
    freeMargin: 10000,
    openPositions: [],
    closedTrades: [],
    botConfig: { enabled: false, riskPercent: 2.0, maxPositions: 2, minConfidence: 75, leverage: 10, strategy: 'TREND_AI' },
    botLogs: [],
    stats: { winRate: 0, totalProfit: 0, netPnl: 0, returnPercent: 0 }
  });

  // Modals state
  const [showBotModal, setShowBotModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Services singleton references
  const priceFeedRef = useRef(null);
  const tradingEngineRef = useRef(null);

  // Initialize Services
  useEffect(() => {
    priceFeedRef.current = new PriceFeedManager(selectedSymbol, timeframe);
    tradingEngineRef.current = new TradingEngine(10000);

    const unsubscribeFeed = priceFeedRef.current.subscribe((data) => {
      setPreviousPrice(prev => feedData.currentPrice || data.currentPrice);
      setFeedData(data);

      // Analyze market & update trading engine tick
      if (data.candles && data.candles.length > 0) {
        const analysis = analyzeMarket(data.candles, data.currentPrice, selectedSymbol);
        analysis.symbolKey = selectedSymbol;
        setAiAnalysis(analysis);

        if (tradingEngineRef.current) {
          tradingEngineRef.current.updateTick(selectedSymbol, data.currentPrice);
          tradingEngineRef.current.evaluateAIBot(analysis, data.currentPrice);
        }
      }
    });

    const unsubscribeEngine = tradingEngineRef.current.subscribe((state) => {
      setTradingState(state);
    });

    priceFeedRef.current.start();

    return () => {
      unsubscribeFeed();
      unsubscribeEngine();
      if (priceFeedRef.current) priceFeedRef.current.stop();
    };
  }, []);

  // Symbol Change Handler
  const handleSelectSymbol = (newSymbol) => {
    setSelectedSymbol(newSymbol);
    if (priceFeedRef.current) {
      priceFeedRef.current.setSymbol(newSymbol);
    }
  };

  // Timeframe Change Handler
  const handleSelectTimeframe = (tf) => {
    setTimeframe(tf);
    if (priceFeedRef.current) {
      priceFeedRef.current.setTimeframe(tf);
    }
  };

  // Speed Change Handler
  const handleSelectSpeed = (s) => {
    setSpeed(s);
    if (priceFeedRef.current) {
      priceFeedRef.current.setSpeed(s);
    }
  };

  // Toggle Pause Handler
  const handleTogglePause = () => {
    if (priceFeedRef.current) {
      const paused = priceFeedRef.current.togglePause();
      setIsPaused(paused);
    }
  };

  // Execute Manual Order
  const handleExecuteOrder = (orderData) => {
    if (tradingEngineRef.current) {
      tradingEngineRef.current.openPosition(orderData);
    }
  };

  // Close Position
  const handleClosePosition = (posId, currentPrice) => {
    if (tradingEngineRef.current) {
      tradingEngineRef.current.closePosition(posId, currentPrice, 'MANUAL CLOSE');
    }
  };

  // Save Bot Config
  const handleSaveBotConfig = (newConfig) => {
    if (tradingEngineRef.current) {
      tradingEngineRef.current.setBotConfig(newConfig);
    }
  };

  // Reset Balance
  const handleResetBalance = () => {
    if (window.confirm('Reset paper trading balance back to $10,000 USD?')) {
      if (tradingEngineRef.current) {
        tradingEngineRef.current.resetAccount(10000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 flex flex-col font-sans selection:bg-trade-accent">
      {/* Top Navbar */}
      <Navbar
        selectedSymbol={selectedSymbol}
        onSelectSymbol={handleSelectSymbol}
        timeframe={timeframe}
        onSelectTimeframe={handleSelectTimeframe}
        speed={speed}
        onSelectSpeed={handleSelectSpeed}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        currentPrice={feedData.currentPrice}
        previousPrice={previousPrice}
        tradingState={tradingState}
        onResetBalance={handleResetBalance}
        onOpenBotConfig={() => setShowBotModal(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-[1920px] mx-auto w-full">
        {/* Left Column (8 cols): Chart + Positions Table */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Real-time Candlestick Chart */}
          <div className="h-[480px] w-full">
            <TradingChart
              symbolKey={selectedSymbol}
              candles={feedData.candles}
              timeframe={timeframe}
            />
          </div>

          {/* Positions & Trade History Table */}
          <div className="flex-1">
            <PositionsTable
              openPositions={tradingState.openPositions}
              closedTrades={tradingState.closedTrades}
              botLogs={tradingState.botLogs}
              onClosePosition={handleClosePosition}
            />
          </div>
        </div>

        {/* Right Column (4 cols): AI Buy/Sell Panel + Order Execution */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* AI Decision Analysis Panel */}
          <AIAnalysisPanel
            analysis={aiAnalysis}
            symbolKey={selectedSymbol}
            currentPrice={feedData.currentPrice}
            onOpenChat={() => setShowChatModal(true)}
          />

          {/* Order Execution Panel */}
          <OrderForm
            selectedSymbol={selectedSymbol}
            currentPrice={feedData.currentPrice}
            aiAnalysis={aiAnalysis}
            onExecuteOrder={handleExecuteOrder}
            freeMargin={tradingState.freeMargin}
          />
        </div>
      </main>

      {/* AI Bot Config Modal */}
      {showBotModal && (
        <AIBotConfigModal
          botConfig={tradingState.botConfig}
          onSaveConfig={handleSaveBotConfig}
          onClose={() => setShowBotModal(false)}
        />
      )}

      {/* AI Advisor Chat Modal */}
      {showChatModal && (
        <AIChatModal
          analysis={aiAnalysis}
          symbolKey={selectedSymbol}
          currentPrice={feedData.currentPrice}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
}
