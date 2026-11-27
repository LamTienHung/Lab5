import { useMemo } from 'react';
import { useAppState, useAppDispatch } from '../context/hooks.js';
import { ActionTypes, FILTER_TAGS } from '../context/appReducer.js';
import EvidenceCard from './EvidenceCard.jsx';
import Pagination from './Pagination.jsx';
import '../styles/EvidenceGrid.css';

const FILTER_LABELS = { all: 'Tất cả', Himass: 'Himass', TanVuu: 'TanVuu' };

// Ex 0.2 — Zero-Effect Pagination
// KHÔNG có useState lưu mảng đã cắt, KHÔNG có useEffect đồng bộ.
// Mọi thứ suy ra trực tiếp từ state trong lần render.
export default function EvidenceGrid() {
  const { evidenceList, filterTag, currentPage, pageSize } = useAppState();
  const dispatch = useAppDispatch();

  // 1. Lọc (derived) — useMemo chỉ để tránh lọc lại khi state khác đổi (vd. theme)
  const filtered = useMemo(
    () => (filterTag === 'all'
      ? evidenceList
      : evidenceList.filter((clip) => clip.player === filterTag)),
    [evidenceList, filterTag]
  );

  // 2. Phân trang (derived) — tính thẳng trong render
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages); // chặn trang vượt giới hạn
  const startIdx = (safePage - 1) * pageSize;
  const visibleItems = filtered.slice(startIdx, startIdx + pageSize);

  return (
    <section className="evidence-container" aria-labelledby="evidence-heading">
      <div className="evidence-toolbar">
        <h2 id="evidence-heading">Evidence Archive</h2>

        <div className="filter-group" role="group" aria-label="Lọc theo tuyển thủ">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={tag === filterTag ? 'chip chip--active' : 'chip'}
              aria-pressed={tag === filterTag}
              onClick={() => dispatch({ type: ActionTypes.SET_FILTER, payload: tag })}
            >
              {FILTER_LABELS[tag]}
            </button>
          ))}
        </div>

        <p className="evidence-count">
          {filtered.length} clip · hiển thị {filtered.length === 0 ? 0 : startIdx + 1}–{startIdx + visibleItems.length}
        </p>
      </div>

      {visibleItems.length === 0 ? (
        <p className="empty-state">Không có clip nào phù hợp.</p>
      ) : (
        <div className="grid-layout">
          {visibleItems.map((clip) => (
            <EvidenceCard key={clip._id} clip={clip} />
          ))}
        </div>
      )}

      <Pagination currentPage={safePage} totalPages={totalPages} />
    </section>
  );
}