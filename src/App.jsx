import React, { useState, useEffect, useRef } from 'react';
import { PriceFeedManager } from './services/priceFeed';
import { analyzeMarket } from './services/aiAnalyzer';
import { TradingEngine } from './services/tradingEngine';
import { DXYTrackerService } from './services/newsService';

import Navbar from './components/Navbar';
import TradingChart from './components/TradingChart';
import AIAnalysisPanel from './components/AIAnalysisPanel';
import OrderForm from './components/OrderForm';
import PositionsTable from './components/PositionsTable';
import AIBotConfigModal from './components/AIBotConfigModal';
import AIChatModal from './components/AIChatModal';
import WelcomeCapitalModal from './components/WelcomeCapitalModal';
import DXYCorrelationCard from './components/DXYCorrelationCard';
import MacroNewsPanel from './components/MacroNewsPanel';

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('1m');
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState('PHP'); // Default to PHP ₱

  const [feedData, setFeedData] = useState({ currentPrice: 0, candles: [] });
  const [previousPrice, setPreviousPrice] = useState(0);

  const [dxyData, setDxyData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Trading engine state
  const [tradingState, setTradingState] = useState({
    balance: 10000,
    balancePHP: 585000,
    equity: 10000,
    equityPHP: 585000,
    marginUsed: 0,
    freeMargin: 10000,
    usdToPhpRate: 58.50,
    openPositions: [],
    closedTrades: [],
    botConfig: { enabled: false, riskPercent: 2.0, maxPositions: 2, minConfidence: 75, leverage: 10, strategy: 'TREND_AI' },
    botLogs: [],
    stats: { winRate: 0, totalProfit: 0, netPnl: 0, returnPercent: 0 }
  });

  // Modals state
  const [showWelcomeModal, setShowWelcomeModal] = useState(true); // Prompts PHP money on open
  const [showBotModal, setShowBotModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Services singleton references
  const priceFeedRef = useRef(null);
  const tradingEngineRef = useRef(null);
  const dxyTrackerRef = useRef(null);

  // Initialize Services
  useEffect(() => {
    priceFeedRef.current = new PriceFeedManager(selectedSymbol, timeframe);
    tradingEngineRef.current = new TradingEngine(10000);
    dxyTrackerRef.current = new DXYTrackerService();

    const unsubscribeDXY = dxyTrackerRef.current.subscribe((dxyInfo) => {
      setDxyData(dxyInfo);
    });

    const unsubscribeFeed = priceFeedRef.current.subscribe((data) => {
      setPreviousPrice(prev => feedData.currentPrice || data.currentPrice);
      setFeedData(data);

      // Analyze market & update trading engine tick
      if (data.candles && data.candles.length > 0) {
        const dxyInfo = dxyTrackerRef.current ? dxyTrackerRef.current.getData() : null;
        const analysis = analyzeMarket(data.candles, data.currentPrice, selectedSymbol, dxyInfo);
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
    dxyTrackerRef.current.startSimulation();

    return () => {
      unsubscribeFeed();
      unsubscribeEngine();
      unsubscribeDXY();
      if (priceFeedRef.current) priceFeedRef.current.stop();
      if (dxyTrackerRef.current) dxyTrackerRef.current.stop();
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

  // Toggle Display Currency (PHP ₱ vs USD $)
  const handleToggleCurrency = () => {
    setDisplayCurrency(prev => prev === 'PHP' ? 'USD' : 'PHP');
  };

  // Welcome PHP Capital Prompt Submit
  const handleWelcomeCapitalSubmit = (phpCapital) => {
    const usdVal = phpCapital / tradingState.usdToPhpRate;
    if (tradingEngineRef.current) {
      tradingEngineRef.current.resetAccount(usdVal);
    }
    setShowWelcomeModal(false);
  };

  // Reset Balance
  const handleResetBalance = () => {
    setShowWelcomeModal(true);
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
        displayCurrency={displayCurrency}
        onToggleCurrency={handleToggleCurrency}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-[1920px] mx-auto w-full">
        {/* Left Column (8 cols): Chart + Positions Table + Macro News */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Real-time Candlestick Chart */}
          <div className="h-[460px] w-full">
            <TradingChart
              symbolKey={selectedSymbol}
              candles={feedData.candles}
              timeframe={timeframe}
            />
          </div>

          {/* DXY Correlation & High Impact Macro News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DXYCorrelationCard
              dxyData={dxyData}
              symbolKey={selectedSymbol}
            />
            <MacroNewsPanel />
          </div>

          {/* Positions & Trade History Table */}
          <div className="flex-1">
            <PositionsTable
              openPositions={tradingState.openPositions}
              closedTrades={tradingState.closedTrades}
              botLogs={tradingState.botLogs}
              onClosePosition={handleClosePosition}
              displayCurrency={displayCurrency}
              usdToPhpRate={tradingState.usdToPhpRate}
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
            displayCurrency={displayCurrency}
            usdToPhpRate={tradingState.usdToPhpRate}
          />
        </div>
      </main>

      {/* Initial Welcome PHP Capital Prompt Modal */}
      {showWelcomeModal && (
        <WelcomeCapitalModal
          onSubmitCapital={handleWelcomeCapitalSubmit}
          usdToPhpRate={tradingState.usdToPhpRate}
        />
      )}

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
