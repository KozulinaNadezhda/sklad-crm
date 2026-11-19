import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Компонент пагинации для таблиц.
 * 
 * @param {number} currentPage - текущая страница (начиная с 1)
 * @param {number} totalPages - всего страниц
 * @param {function} onPageChange - функция смены страницы
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Генерация номеров страниц (с многоточием, если страниц много)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white sm:px-6 rounded-b-xl">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`
              min-w-[32px] h-8 flex items-center justify-center text-sm font-medium rounded-lg transition
              ${page === currentPage 
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                : page === '...' 
                  ? 'text-slate-400 cursor-default'
                  : 'text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      <div className="text-sm text-slate-500">
        Страница <span className="font-medium text-slate-900">{currentPage}</span> из <span className="font-medium text-slate-900">{totalPages}</span>
      </div>
    </div>
  );
}