import React, { useRef } from 'react';
import BookSelector from './BookSelector';

export default function Sidebar({ 
  data, 
  showBooksMenu, 
  setShowBooksMenu, 
  selectedBook, 
  onSelectBook, 
  onSelectChapter 
}) {
  const scrollContainerRef = useRef(null);

  const handleTestamentChange = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };
  return (
    <aside 
      style={{
        width: showBooksMenu ? '320px' : '0px',
        minWidth: showBooksMenu ? '320px' : '0px',
        transition: 'all 300ms ease-in-out'
      }}
      className="overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex-shrink-0"
    >
      <div className="p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          {showBooksMenu && <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">📚 Libros</h3>}
          {showBooksMenu && (
            <button
              onClick={() => setShowBooksMenu(false)}
              aria-label="Ocultar menú de libros"
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="h-[calc(100vh-200px)] overflow-auto custom-scrollbar" ref={scrollContainerRef}>
          <BookSelector
            data={data}
            selectedBook={selectedBook}
            onSelectBook={onSelectBook}
            onSelectChapter={onSelectChapter}
            onTestamentChange={handleTestamentChange}
          />
        </div>
      </div>
    </aside>
  );
}
