import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { AiChatMessage } from '../types/gemstone';
import { GEMSTONE_PRODUCTS_LIST } from '../data/gemstoneData';
import { AddToCartControl } from './AddToCartControl';

const QUICK_PROMPTS = [
  'Which gemstone is recommended for me?',
  'What is Emerald?',
  'Show me blue sapphire under ₹60,000',
  'Which gemstone is associated with Mercury?',
  'Show certified Ruby stones'
];

export const AiGemstoneAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Namaste! I am your AI Gemstone & Vedic Assistant powered by Gemini. Ask me anything about certified gemstones, zodiac stones, or astrology recommendations!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: AiChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Simulate AI response logic matching database products
    setTimeout(() => {
      let botResponse = '';
      let matchedProducts: any[] = [];
      const query = text.toLowerCase();

      if (query.includes('recommended') || query.includes('which gemstone') || query.includes('my stone')) {
        botResponse = 'For personalized birth chart gemstone selection, try our 5-step Vedic Recommendation Engine below! Generally, Ruby suits Sun/Leo, Yellow Sapphire suits Jupiter/Sagittarius, and Emerald suits Mercury/Gemini.';
        matchedProducts = GEMSTONE_PRODUCTS_LIST.slice(0, 2);
      } else if (query.includes('emerald') || query.includes('mercury') || query.includes('panna')) {
        botResponse = 'Emerald (Panna) is the sacred gemstone of Mercury (Budh). It enhances sharp intellect, memory, public speaking, and trade wealth. Best worn in 14K Gold or Panchdhatu on the little finger on Wednesday morning.';
        matchedProducts = GEMSTONE_PRODUCTS_LIST.filter((p) => p.title.toLowerCase().includes('emerald'));
      } else if (query.includes('blue sapphire') || query.includes('neelam') || query.includes('saturn')) {
        botResponse = 'Blue Sapphire (Neelam) is ruled by Saturn (Shani). It is the fastest-acting Navratna stone, bringing immediate career luck, focus, and protection from negative energy.';
        matchedProducts = GEMSTONE_PRODUCTS_LIST.filter((p) => p.title.toLowerCase().includes('blue sapphire'));
      } else if (query.includes('ruby') || query.includes('manik')) {
        botResponse = 'Ruby (Manikya) is ruled by the Sun. It bestows royal dignity, executive leadership, vitality, and solar power. Recommended for Leo (Simha) rashi.';
        matchedProducts = GEMSTONE_PRODUCTS_LIST.filter((p) => p.title.toLowerCase().includes('ruby'));
      } else {
        botResponse = `Here are certified natural gemstones matching your inquiry: "${text}". All our gems come with official lab certificate reports and 100% natural unheated guarantee!`;
        matchedProducts = GEMSTONE_PRODUCTS_LIST.slice(0, 2);
      }

      const assistantMsg: AiChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: matchedProducts
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Gemstone Assistant"
        className="fixed bottom-20 right-6 z-50 bg-gradient-to-r from-vedic-goldDark via-amber-500 to-vedic-maroon text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center gap-2 border-2 border-vedic-goldLight/60 group"
      >
        <Bot className="w-6 h-6 animate-pulse text-vedic-goldLight" />
        <span className="hidden sm:inline font-serif font-bold text-xs pr-1">Ask AI Astrologer</span>
        <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping absolute -top-1 -right-1" />
      </button>

      {/* Floating Modal Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[550px] bg-stone-950/95 backdrop-blur-2xl border-2 border-vedic-gold/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-vedic-maroon p-4 text-vedic-goldLight flex items-center justify-between border-b border-vedic-gold/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-vedic-gold/20 border border-vedic-gold flex items-center justify-center text-vedic-gold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-vedic-goldLight">AI Gemstone Assistant</h3>
                <p className="text-[10px] text-vedic-gold/80">Powered by Gemini AI • Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-vedic-gold text-vedic-dark font-medium rounded-tr-none'
                      : 'bg-white/10 text-gray-200 border border-white/10 rounded-tl-none font-serif'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <span className="text-[9px] text-gray-500 mt-1 px-1">{m.timestamp}</span>

                {/* Embedded Matched Products */}
                {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                  <div className="mt-3 space-y-2 w-full">
                    {m.recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-black/60 border border-vedic-gold/30 rounded-xl p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-10 h-10 rounded-lg object-cover border border-vedic-gold/20 shrink-0"
                          />
                          <div className="truncate">
                            <h5 className="font-serif font-bold text-white text-[11px] truncate">{prod.title}</h5>
                            <span className="text-[10px] font-bold text-vedic-gold">₹{prod.price.toLocaleString()}</span>
                          </div>
                        </div>
                        <AddToCartControl
                          product={prod}
                          size="full"
                          appearance="gold"
                          label="Buy"
                          className="shrink-0"
                          buttonClassName="text-[10px] px-2.5 py-1 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-vedic-gold text-xs italic font-serif">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Gemini AI is searching product database...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-black/40 border-t border-white/10 overflow-x-auto flex gap-2 no-scrollbar">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="whitespace-nowrap text-[10px] bg-white/5 hover:bg-white/15 border border-vedic-gold/20 text-vedic-goldLight px-2.5 py-1 rounded-full transition-colors shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-stone-900 border-t border-vedic-gold/20 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask AI about gemstones..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-vedic-gold text-xs"
            />
            <button
              onClick={() => handleSend()}
              className="bg-gold-gradient text-vedic-dark p-2 rounded-xl hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};