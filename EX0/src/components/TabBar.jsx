import { memo, useRef } from 'react';
import { useAppDispatch } from '../context/hooks.js';
import { ActionTypes, TABS } from '../context/appReducer.js';

const TAB_LABELS = {
  reels: 'Reels',
  evidence: 'Evidence',
  chat: 'Chat',
};

// Cùng pattern với ThemeToggle: dispatch-only + prop `activeTab` + memo
// → đổi trang/filter không làm TabBar render lại.
function TabBar({ activeTab }) {
  const dispatch = useAppDispatch();
  const tabRefs = useRef({});

  const selectTab = (tab) => {
    dispatch({ type: ActionTypes.SET_TAB, payload: tab });
    tabRefs.current[tab]?.focus();
  };

  // Điều hướng bàn phím theo WAI-ARIA Tabs pattern: ← → Home End
  const handleKeyDown = (event) => {
    const index = TABS.indexOf(activeTab);
    let next = null;

    if (event.key === 'ArrowRight') next = TABS[(index + 1) % TABS.length];
    else if (event.key === 'ArrowLeft') next = TABS[(index - 1 + TABS.length) % TABS.length];
    else if (event.key === 'Home') next = TABS[0];
    else if (event.key === 'End') next = TABS[TABS.length - 1];

    if (next) {
      event.preventDefault();
      selectTab(next);
    }
  };

  return (
    <div role="tablist" aria-label="Khu vực ứng dụng" className="tab-bar" onKeyDown={handleKeyDown}>
      {TABS.map((tab) => {
        const selected = tab === activeTab;
        return (
          <button
            key={tab}
            ref={(el) => { tabRefs.current[tab] = el; }}
            type="button"
            role="tab"
            id={`tab-${tab}`}
            aria-selected={selected}
            aria-controls={`panel-${tab}`}
            tabIndex={selected ? 0 : -1}
            className={selected ? 'tab tab--active' : 'tab'}
            onClick={() => selectTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}

export default memo(TabBar);