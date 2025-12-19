import { useUIStore, PanelType } from '@/store/useUIStore';
import { Bot, Database, Layers, Settings, Activity } from 'lucide-react';

const DockItem = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
}) => {
  return (
    <div className="relative group flex flex-col items-center gap-2">
      {/* 提示标签 (Tooltip) */}
      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded border border-white/10 pointer-events-none whitespace-nowrap">
        {label}
      </div>

      <button
        onClick={onClick}
        className={`
          relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
          ${isActive 
            ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] scale-110 -translate-y-2' 
            : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white hover:scale-105 border border-white/5'
          }
        `}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        
        {/* 激活指示点 */}
        {isActive && (
          <span className="absolute -bottom-2 w-1 h-1 bg-white rounded-full opacity-80"></span>
        )}
      </button>
    </div>
  );
};

const Dock = () => {
  const { activePanel, togglePanel } = useUIStore();

  const items: { id: PanelType; icon: any; label: string }[] = [
    { id: 'ai', icon: Bot, label: 'AI 助手' },
    { id: 'data', icon: Database, label: '数据管理' },
    { id: 'layers', icon: Layers, label: '图层控制' },
    // { id: 'settings', icon: Settings, label: '系统设置' },
  ];

  return (
    <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <div className="flex items-end gap-4 px-6 py-3 bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        
        {/* 装饰性 Logo 或 状态 */}
        <div className="mr-4 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
           <Activity size={20} className="text-white" />
        </div>

        {/* 分隔线 */}
        <div className="w-px h-8 bg-white/10 mx-1 self-center"></div>

        {items.map((item) => (
          <DockItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activePanel === item.id}
            onClick={() => togglePanel(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dock;