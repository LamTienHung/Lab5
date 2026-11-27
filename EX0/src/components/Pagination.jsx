import { memo } from 'react';
import { useAppDispatch } from '../context/hooks.js';
import { ActionTypes } from '../context/appReducer.js';

// Nhận currentPage/totalPages đã được tính sẵn (derived) từ EvidenceGrid.
// Chỉ dùng dispatch → không phụ thuộc toàn bộ state.
function Pagination({ currentPage, totalPages }) {
  const dispatch = useAppDispatch();

  if (totalPages <= 1) return null;

  const goTo = (page) => dispatch({ type: ActionTypes.SET_PAGE, payload: page });
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label="Phân trang bằng chứng">
      <button
        type="button"
        className="page-btn"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Trang trước"
      >
        ‹
      </button>

      <ol className="pagination__list">
        {pages.map((page) => (
          <li key={page}>
            <button
              type="button"
              className={page === currentPage ? 'page-btn page-btn--active' : 'page-btn'}
              onClick={() => goTo(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Trang ${page}`}
            >
              {page}
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="page-btn"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
      >
        ›
      </button>

      <p className="pagination__status" aria-live="polite">
        Trang {currentPage} / {totalPages}
      </p>
    </nav>
  );
}

export default memo(Pagination);