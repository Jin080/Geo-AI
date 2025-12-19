import { useMemo, useEffect, useRef } from 'react';
import { useDifyChat } from '@/hooks/useDifyChat';
import { Bot, Send, Sparkles, Loader2, X } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

// 气泡组件
const ChatBubble = ({ role, content }: { role: string; content: string }) => {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-slate-700/50 text-slate-100 border border-slate-600 rounded-bl-none backdrop-blur-sm'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-1 opacity-80 border-b border-white/10 pb-1">
            <Bot size={12} className="text-blue-400" />
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">AI Assistant</span>
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

const AIPanel = () => {
  const { activePanel, setActivePanel } = useUIStore();
  const chat = useDifyChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isVisible = activePanel === 'ai';

  const history = useMemo(
    () => chat.messages.map((m) => ({ role: m.role, content: m.content })),
    [chat.messages]
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, chat.loading]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    chat.sendMessage(text);
  };

  if (!isVisible) return null;

  return (
    // 布局优化：
    // 1. 使用 left-2 top-2 bottom-9：贴紧左侧和顶部，底部留出状态栏高度(h-7) + 间隙
    // 2. 这种全高的侧边栏设计能带来更强的"融合感"，消除上下割裂
    <div className="pointer-events-auto absolute left-2 top-2 bottom-9 w-[360px] flex flex-col bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[4px_0_24px_rgba(0,0,0,0.4)] overflow-hidden animate-in slide-in-from-left-5 duration-300 z-[60]">
      
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-900/20 to-transparent border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/20 rounded-lg">
            <Bot size={18} className="text-blue-400" />
          </div>
          <h2 className="text-white font-bold text-sm tracking-wide">地质 AI 助手</h2>
        </div>
        <button 
          onClick={() => setActivePanel('none')}
          className="text-slate-400 hover:text-white transition p-1.5 hover:bg-white/10 rounded-lg"
        >
          <X size={18} />
        </button>
      </div>

      {/* 内容区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900/30">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 px-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-2 border border-white/5 shadow-inner">
              <Sparkles className="w-8 h-8 text-blue-400 opacity-80" />
            </div>
            <p className="text-xs leading-relaxed opacity-70">
              已连接至地质大模型数据库。<br/>请下达指令。
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4 w-full">
              <button onClick={() => handleSend("飞到大红山")} className="text-xs bg-slate-800/80 border border-slate-700 px-2 py-2 rounded-lg hover:bg-slate-700 hover:border-blue-500/50 transition text-slate-300">📍 飞到大红山</button>
              <button onClick={() => handleSend("分析玉龙靶区")} className="text-xs bg-slate-800/80 border border-slate-700 px-2 py-2 rounded-lg hover:bg-slate-700 hover:border-blue-500/50 transition text-slate-300">⛏️ 分析靶区</button>
            </div>
          </div>
        )}
        
        {history.map((m, idx) => (
          <ChatBubble key={idx} role={m.role} content={m.content} />
        ))}
        
        {chat.loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs px-4 mt-2 italic">
            <Loader2 size={12} className="animate-spin text-blue-500" />
            <span className="text-blue-400/80">正在思考...</span>
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="p-3 border-t border-white/5 bg-slate-900/50 shrink-0">
        <form
          className="flex items-center gap-2 relative bg-slate-800/50 border border-white/10 rounded-xl p-1 pr-1.5 focus-within:border-blue-500/50 focus-within:bg-slate-800 transition-all"
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.currentTarget.elements.namedItem('msg') as HTMLInputElement);
            handleSend(input.value);
            input.value = '';
          }}
        >
          <input
            name="msg"
            autoComplete="off"
            className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-0"
            placeholder="输入指令..."
            disabled={chat.loading}
          />
          <button
            type="submit"
            disabled={chat.loading}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:grayscale"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIPanel;