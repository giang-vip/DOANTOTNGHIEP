import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquare, X, Send, User, Trash2, Edit3, Plus, Paperclip, Mic, MicOff, Image, FileText, CheckCircle2, ChevronRight, File } from 'lucide-react';

import { User as UserType } from '../models';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  attachments?: Array<{ name: string; type: string; url?: string }>;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

interface AIChatInterfaceProps {
  user?: UserType;
}

export const AIChatInterface = ({ user }: AIChatInterfaceProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [editingSessionId, setEditingSessionId] = useState<string>('');
  const [editTitleInput, setEditTitleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Voice recording mock state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // File attachment states
  const [attachments, setAttachments] = useState<Array<{ name: string; type: string; url?: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat sessions from LocalStorage
  useEffect(() => {
    const storageKey = user?.username ? `hn_ai_chats_${user.username}` : 'hn_ai_chats';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error('Error loading chats:', e);
      }
    }

    // Default init session
    const defaultSession: ChatSession = {
      id: 'session_default',
      title: 'Trò chuyện học tập 1',
      messages: [
        {
          id: 'welcome',
          role: 'ai',
          text: 'Chào bạn! Mình là Trợ lý AI học tập Hưng Nhân. Bạn có câu hỏi nào cần mình giải đáp hoặc phân tích tài liệu môn học không?',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: new Date().toISOString()
    };
    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
  }, [user]);

  // Save sessions on change
  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    const storageKey = user?.username ? `hn_ai_chats_${user.username}` : 'hn_ai_chats';
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessions, activeSessionId, isChatOpen]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Voice recording mock
  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimer.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingTimer.current) clearInterval(recordingTimer.current);
    
    // Add mock voice message attachment
    const voiceAttachment = {
      name: `Ghi âm voice_message_${recordingSeconds}s.mp3`,
      type: 'audio/mp3'
    };
    setAttachments(prev => [...prev, voiceAttachment]);
  };

  // File attachments
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newAttachments = Array.from(files).map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        name: file.name,
        type: file.type,
        url: isImage ? URL.createObjectURL(file) : undefined
      };
    });

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  // Send message
  const handleSend = async () => {
    if (!chatInput.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setAttachments([]);

    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp,
      attachments: attachments.length > 0 ? attachments : undefined
    };

    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        // Auto rename first chat if it was default name
        let title = s.title;
        if (s.messages.length === 1 && s.title.startsWith('Trò chuyện học tập')) {
          title = userText.length > 25 ? userText.substring(0, 25) + '...' : userText;
        }
        return {
          ...s,
          title,
          messages: [...s.messages, userMsg]
        };
      }
      return s;
    });

    saveSessions(updatedSessions);
    setIsLoading(true);

    try {
      // API request to the backend server.ts proxy
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText + (attachments.length > 0 ? ` [Đính kèm tài liệu học tập: ${attachments.map(a => a.name).join(', ')}]` : ''),
          subjectName: 'Môn học chuyên ngành'
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi phản hồi máy chủ AI');
      }

      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'ai',
        text: data.text || 'Không có phản hồi từ máy chủ AI.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev => {
        const newSessions = prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, aiMsg]
            };
          }
          return s;
        });
        const storageKey = user?.username ? `hn_ai_chats_${user.username}` : 'hn_ai_chats';
        localStorage.setItem(storageKey, JSON.stringify(newSessions));
        return newSessions;
      });
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: 'ai',
        text: '❌ **Lỗi kết nối:** Không thể truy cập máy chủ Llama/Gemini local. Vui lòng kiểm tra kết nối hoặc chạy Ollama.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      
      const finalSessions = updatedSessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, errMsg]
          };
        }
        return s;
      });
      saveSessions(finalSessions);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new session
  const createNewSession = () => {
    const id = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id,
      title: `Trò chuyện mới ${sessions.length + 1}`,
      messages: [
        {
          id: 'welcome',
          role: 'ai',
          text: 'Chào bạn! Mình sẵn sàng hỗ trợ giải đáp các tài liệu và bài tập học tập rồi. Hãy gửi câu hỏi nhé!',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: new Date().toISOString()
    };
    saveSessions([newSession, ...sessions]);
    setActiveSessionId(id);
  };

  // Rename session
  const startRenameSession = (id: string, currentTitle: string) => {
    setEditingSessionId(id);
    setEditTitleInput(currentTitle);
  };

  const saveRenameSession = (id: string) => {
    if (!editTitleInput.trim()) return;
    const updated = sessions.map(s => s.id === id ? { ...s, title: editTitleInput.trim() } : s);
    saveSessions(updated);
    setEditingSessionId('');
  };

  // Delete session
  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert("Bạn phải giữ lại ít nhất một đoạn hội thoại!");
      return;
    }
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated[0].id);
    }
  };

  // Simple Markdown Parser (Basicbold, lists, headers)
  const parseMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      let content = line;
      // Bold **text**
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet list
      if (content.startsWith('* ') || content.startsWith('- ')) {
        return <li key={index} className="ml-4 list-disc mb-1 pl-1" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />;
      }
      // Check list
      if (content.startsWith('[x] ')) {
        return <div key={index} className="flex items-center gap-1.5 text-emerald-600 mb-1 font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> <span dangerouslySetInnerHTML={{ __html: content.substring(4) }} /></div>;
      }
      return <p key={index} className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`h-14 w-14 rounded-full text-white shadow-2xl hover:scale-108 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border ${
            isChatOpen 
              ? 'bg-slate-900 border-slate-750 hover:bg-slate-800' 
              : 'bg-blue-600 border-blue-500 hover:bg-blue-700'
          }`}
        >
          {isChatOpen ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" />}
        </button>
      </div>

      {/* Chat Window with Sidebar */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[42rem] h-[550px] bg-white backdrop-blur-2xl border border-slate-200 rounded-3xl shadow-xl z-[100] overflow-hidden flex animate-scale-up text-slate-800">
          
          {/* Sidebar - Chat History */}
          <div className="w-52 border-r border-slate-200 bg-slate-50 flex flex-col">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hội thoại AI</span>
              <button
                onClick={createNewSession}
                className="p-1 rounded-md hover:bg-slate-200 text-blue-600 transition-colors"
                title="Tạo hội thoại mới"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {sessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSessionId(s.id);
                    setEditingSessionId('');
                  }}
                  className={`group p-2.5 rounded-xl cursor-pointer flex items-center justify-between text-left transition-all ${
                    activeSessionId === s.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-slate-100 text-slate-600 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    {editingSessionId === s.id ? (
                      <input
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        onBlur={() => saveRenameSession(s.id)}
                        onKeyPress={(e) => e.key === 'Enter' && saveRenameSession(s.id)}
                        autoFocus
                        className="bg-white text-slate-800 text-xs px-1 py-0.5 rounded border border-slate-300 w-full outline-none"
                      />
                    ) : (
                      <span className="text-[11px] font-medium truncate">{s.title}</span>
                    )}
                  </div>
                  
                  {editingSessionId !== s.id && (
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRenameSession(s.id, s.title);
                        }}
                        className="p-0.5 text-slate-500 hover:text-slate-300"
                        title="Đổi tên"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => deleteSession(s.id, e)}
                        className="p-0.5 text-slate-500 hover:text-rose-400"
                        title="Xóa"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Hưng Nhân AI Study Buddy
                  </h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Trợ lý hỗ trợ giải pháp học tập</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {activeSession?.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 text-blue-600 flex items-center justify-center shrink-0">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <div className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[22rem] ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-sm'
                    }`}>
                      {msg.role === 'ai' ? parseMarkdown(msg.text) : <p>{msg.text}</p>}
                      
                      {/* Attached items */}
                      {msg.attachments && (
                        <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                          {msg.attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[9px] text-slate-100/90 font-medium">
                              {file.type.startsWith('image/') ? <Image className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                              <span className="underline truncate max-w-[15rem]">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className={`text-[8px] text-slate-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </p>
                  </div>

                  {msg.role === 'user' && (
                    <div className="h-7 w-7 rounded-lg bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                      <User className="h-4.5 w-4.5" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 text-blue-600 flex items-center justify-center shrink-0">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-3 rounded-2xl rounded-tl-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-200 bg-white space-y-3">
              {/* Attachments preview list */}
              {attachments.length > 0 && (
                <div className="flex gap-2 flex-wrap items-center">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-[9px] text-slate-600">
                      {file.type.startsWith('image/') ? <Image className="h-3.5 w-3.5 text-blue-600" /> : <FileText className="h-3.5 w-3.5 text-slate-500" />}
                      <span className="max-w-[8rem] truncate">{file.name}</span>
                      <button
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2.5 items-center">
                {/* File input attachment trigger */}
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
                  title="Đính kèm tài liệu học tập"
                >
                  <Paperclip className="h-4.5 w-4.5" />
                </button>

                {/* Voice message simulator trigger */}
                {isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    title="Dừng ghi âm"
                  >
                    <MicOff className="h-4.5 w-4.5 animate-pulse" />
                    <span className="text-[9px] font-mono font-bold">{recordingSeconds}s</span>
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
                    title="Ghi âm câu hỏi"
                  >
                    <Mic className="h-4.5 w-4.5" />
                  </button>
                )}

                {/* Text input */}
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Hỏi AI Study Buddy về bài giảng, bài tập..."
                  className="flex-1 bg-slate-50 border border-slate-200 text-[11px] rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                />

                <button
                  onClick={handleSend}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
