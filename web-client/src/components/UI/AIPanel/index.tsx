import { useMemo, useState } from 'react';
import { useDifyChat } from '@/hooks/useDifyChat';
import { Bot, Minimize2, Send, Sparkles, Maximize2 } from 'lucide-react';

type ChatBubbleProps = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// 聊天气泡
const ChatBubble = ({ role, content }: ChatBubbleProps) => {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-slate-800/90 text-slate-100 border border-white/10 backdrop-blur-md rounded-bl-none'
        }`}
      >
        {content}
      </div>
    </div>
  );
};

// 聊天记录列表
const ChatHistory = ({ messages }: { messages: ChatBubbleProps[] }) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 space-y-2 custom-scrollbar">
      {messages.length === 0 && (
        <div className="text-slate-400 text-sm text-center mt-10">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50 text-blue-400" />
          <p>我是地质 AI 助手，<br/>您可以让我定位矿区或查询数据。</p>
        </div>
      )}
      {messages.map((m, idx) => (
        <ChatBubble key={idx} role={m.role} content={m.content} />
      ))}
    </div>
  );
};

// 输入框
const ChatInput = ({
  onSend,
  loading
}: {
  onSend: (text: string) => void;
  loading: boolean;
}) => {
  const [text, setText] = useState('');
  return (
    <form
      className="flex items-center gap-2 mt-auto pt-3 border-t border-white/10"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText('');
      }}
    >
      <input
        className="flex-1 bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
        placeholder="输入指令，如：飞到普朗铜矿"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        <Send size={18} />
      </button>
    </form>
  );
};

// 主面板组件
const AIPanel = () => {
  const chat = useDifyChat();
  const [collapsed, setCollapsed] = useState(false); // 控制最小化

  const history = useMemo(
    () => chat.messages.map((m) => ({ role: m.role, content: m.content })),
    [chat.messages]
  );

  // --- 状态 1: 最小化 (悬浮球) ---
  if (collapsed) {
    return (
      <button
        className="w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] border-2 border-white/20 transition-all hover:scale-110 group pointer-events-auto"
        onClick={() => setCollapsed(false)}
        title="唤醒 AI"
      >
        <Bot className="w-8 h-8 text-white group-hover:animate-pulse" />
      </button>
    );
  }

  // --- 状态 2: 完整面板 ---
  return (
    <div className="pointer-events-auto w-[380px] h-[600px] flex flex-col bg-slate-950/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
      
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-900/50 border-b border-white/5">
        <div className="flex items-center gap-2 text-blue-400 font-bold tracking-wide">
          <Bot size={20} />
          <span>地质 AI 助手</span>
        </div>
        <button
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          onClick={() => setCollapsed(true)}
          title="最小化"
        >
          <Minimize2 size={18} />
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
        <ChatHistory messages={history} />
        <ChatInput onSend={chat.sendMessage} loading={chat.loading} />
      </div>
    </div>
  );
};

export default AIPanel;