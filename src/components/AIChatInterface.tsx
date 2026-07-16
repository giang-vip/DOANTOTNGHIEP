import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquare, X, Send, User } from 'lucide-react';

export const AIChatInterface = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [aiChatLogs, setAiChatLogs] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Chào bạn! Mình là Trợ lý AI học tập. Bạn có câu hỏi gì cần mình giải thích không?' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiChatLogs, isChatOpen]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setAiChatLogs(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatInput('');
    // Mock AI reply
    setTimeout(() => {
      setAiChatLogs(prev => [...prev, { role: 'ai', text: 'Đây là câu trả lời mẫu cho câu hỏi: ' + chatInput }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer relative group"
        >
          {isChatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </button>
      </div>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[450px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden flex flex-col animate-scale-up">
          {/* Header */}
          <div className="bg-slate-900 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-400" />
              <h4 className="text-sm font-bold">Hưng Nhân AI</h4>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {aiChatLogs.map((log, idx) => (
              <div key={idx} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2.5 rounded-2xl text-xs max-w-[80%] ${log.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 rounded-bl-none'}`}>
                  {log.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Đặt câu hỏi..."
              className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="p-1.5 bg-blue-600 text-white rounded-lg">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
