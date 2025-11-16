import React, { useRef, useEffect, useState } from "react";
import BookSelector from "./BookSelector";

export default function Sidebar({
  data,
  showBooksMenu,
  setShowBooksMenu,
  selectedBook,
  onSelectBook,
  onSelectChapter,
}) {
  const scrollContainerRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const handleTestamentChange = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };
  return (
    <>
      {/* Mobile Overlay */}
      {showBooksMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowBooksMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="overflow-hidden bg-amber-50 rounded-lg lg:rounded-2xl shadow-lg flex-shrink-0 border-r-2 lg:border-r-4 border-amber-900 fixed lg:sticky lg:top-4 left-0 top-0 h-screen lg:h-[calc(100vh-8rem)] z-50 lg:z-auto transition-all duration-300 ease-in-out lg:!w-[320px] lg:!min-w-[320px] xl:!w-[380px] xl:!min-w-[380px]"
        style={{
          width: showBooksMenu ? "280px" : "0px",
          minWidth: showBooksMenu ? "280px" : "0px",
        }}
      >
        <div className="p-3 lg:p-6 h-full">
          <div className="flex items-center justify-between mb-3 lg:mb-6">
            {(showBooksMenu || isDesktop) && (
              <h3
                className="text-base lg:text-xl font-bold text-amber-900"
                style={{ fontFamily: "Georgia, serif" }}
              >
                📚 Libros
              </h3>
            )}
            {showBooksMenu && (
              <button
                onClick={() => setShowBooksMenu(false)}
                aria-label="Ocultar menú de libros"
                className="p-1 rounded-lg hover:bg-amber-100 transition lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <div
            className="h-[calc(100vh-140px)] lg:h-[calc(100vh-12rem)] overflow-auto custom-scrollbar"
            ref={scrollContainerRef}
          >
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
    </>
  );
}
