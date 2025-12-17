import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 【关键修复】全局引入 Cesium 样式
// 如果不加这一行，地图可能显示错乱或没有控件
import 'cesium/Build/Cesium/Widgets/widgets.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);