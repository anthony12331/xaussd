import React, { useState } from 'react';
import { getAIChatResponse } from '../services/aiAnalyzer';
import { MessageSquareText, X, Send, Bot, Sparkles, User } from 'lucide-react';

export default function AIChatModal({ analysis, symbolKey, currentPrice, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello Trader! I am your real-time AI Trading Advisor for **${symbolKey}**.\n\nCurrent price is **$${currentPrice}** with signal **${analysis?.signal || 'NEUTRAL'}** (${analysis?.confidence || 50}% confidence).\n\nHow can I help you analyze this chart?`
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    const updatedMessages = [...messages, { sender: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setInput('');

    // Generate AI Response
    setTimeout(() => {
      const aiReply = getAIChatResponse(userMsg, analysis, symbolKey, currentPrice);
      setMessages([...updatedMessages, { sender: 'ai', text: aiReply }]);
    }, 300);
  };

  const quickQuestions = [
    "Where is the good price to entry?",
    "What is the percentage accuracy %?",
    "What is the target profit?",
    "Should I buy now?",
    "What is the Stop Loss?"
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg h-[520px] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="bg-dark-900 border-b border-dark-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-1.5 rounded-lg text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1">
                AI Trading Advisor
                <Sparkles className="w-3.5 h-3.5 text-trade-gold" />
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">{symbolKey} @ ${currentPrice}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-dark-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                  m.sender === 'user'
                    ? 'bg-trade-accent text-white rounded-tr-none'
                    : 'bg-dark-900 border border-dark-600 text-gray-200 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-trade-accent/30 border border-trade-accent/40 flex items-center justify-center text-white shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-1.5 bg-dark-900/60 border-t border-dark-700 flex gap-1.5 overflow-x-auto">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(q);
              }}
              className="text-[11px] whitespace-nowrap bg-dark-700 hover:bg-dark-600 border border-dark-600 text-gray-300 px-2.5 py-1 rounded-full transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-dark-900 border-t border-dark-600 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about buy/sell signals, RSI, risk..."
            className="flex-1 bg-dark-800 border border-dark-600 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
