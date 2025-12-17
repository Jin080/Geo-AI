import { useMemo, useState } from 'react';
import { useDifyChat } from '@/hooks/useDifyChat';

type ChatBubbleProps = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const ChatBubble = ({ role, content }: ChatBubbleProps) => {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-white'
            : 'bg-white/10 text-gray-100 border border-white/10 backdrop-blur'
        }`}
      >
        {content}
      </div>
    </div>
  );
};

const ChatHistory = ({ messages }: { messages: ChatBubbleProps[] }) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 pr-1">
      {messages.map((m, idx) => (
        <ChatBubble key={idx} role={m.role} content={m.content} />
      ))}
    </div>
  );
};

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
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText('');
      }}
    >
      <input
        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
        placeholder="用自然语言控制视角，如：飞到普朗铜矿"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        发送
      </button>
    </form>
  );
};

const AIPanel = () => {
  const chat = useDifyChat();
  const [collapsed, setCollapsed] = useState(false);

  const history = useMemo(
    () => chat.messages.map((m) => ({ role: m.role, content: m.content })),
    [chat.messages]
  );

  if (collapsed) {
    return (
      <button
        className="pointer-events-auto fixed left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-white/10 shadow-lg shadow-cyan-500/30 text-white"
        onClick={() => setCollapsed(false)}
      >
        AI
      </button>
    );
  }

  return (
    <div className="pointer-events-auto w-96 h-[70vh] p-4 rounded-3xl bg-slate-900/70 border border-white/10 shadow-xl shadow-cyan-500/20 backdrop-blur">
      <div className="flex items-center justify-between mb-3 text-gray-100">
        <div className="font-semibold">AI 指挥官</div>
        <button
          className="text-sm text-gray-400 hover:text-white"
          onClick={() => setCollapsed(true)}
        >
          最小化
        </button>
      </div>
      <div className="flex flex-col h-[calc(70vh-3.5rem)] gap-3">
        <ChatHistory messages={history} />
        <ChatInput onSend={chat.sendMessage} loading={chat.loading} />
      </div>
    </div>
  );
};

export default AIPanel;
