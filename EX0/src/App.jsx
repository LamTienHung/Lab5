import { useAppState } from './context/hooks.js';
import ThemeToggle from './components/ThemeToggle.jsx';
import TabBar from './components/TabBar.jsx';
import EvidenceGrid from './components/EvidenceGrid.jsx';

// App đọc state để lấy theme/activeTab rồi truyền xuống bằng prop primitive.
// Khi đổi trang: App render lại, nhưng ThemeToggle & TabBar (memo, prop không đổi)
// được React bỏ qua → kiểm chứng bằng React DevTools Profiler (Sprint 1).
export default function App() {
  const { theme, activeTab } = useAppState();

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">
          <span>#</span>JusticeForHimassTanVuu
        </h1>

        <TabBar activeTab={activeTab} />

        <div className="app-header__actions">
          <ThemeToggle theme={theme} />
        </div>
      </header>

      <main className="app-main">
        <section
          id="panel-reels"
          role="tabpanel"
          aria-labelledby="tab-reels"
          hidden={activeTab !== 'reels'}
        >
          <p className="panel-placeholder">Reels feed — sẽ triển khai ở EX1.</p>
        </section>

        <section
          id="panel-evidence"
          role="tabpanel"
          aria-labelledby="tab-evidence"
          hidden={activeTab !== 'evidence'}
        >
          {activeTab === 'evidence' && <EvidenceGrid />}
        </section>

        <section
          id="panel-chat"
          role="tabpanel"
          aria-labelledby="tab-chat"
          hidden={activeTab !== 'chat'}
        >
          <p className="panel-placeholder">Real-time chat — sẽ triển khai ở EX2.</p>
        </section>
      </main>
    </div>
  );
}