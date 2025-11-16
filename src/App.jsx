import React, { useState } from "react";
import { useBible } from "./context/BibleContext";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import SearchBar from "./components/SearchBar";
import "./App.css";

function App() {
  const { data, loading } = useBible();
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [resultsVisible, setResultsVisible] = useState(20);
  const [darkMode, setDarkMode] = useState(false);
  const [showBooksMenu, setShowBooksMenu] = useState(
    typeof window !== "undefined" && window.innerWidth >= 1024
  );
  const [showSearchBar, setShowSearchBar] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-700 mx-auto mb-6"></div>
          <p className="text-amber-800 font-medium">
            Cargando Biblia Digital...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-amber-100">
          <p className="text-amber-900 font-semibold">Error al cargar</p>
          <p className="text-amber-700 text-sm mt-2">Recarga la página</p>
        </div>
      </div>
    );
  }

  const handleSelectChapter = (book, chapter) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setSearchResults(null);
    setShowBooksMenu(true);
  };

  const handleClearAll = () => {
    setSelectedBook(null);
    setSelectedChapter(null);
    setSearchResults(null);
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900">
        <header className="bg-gradient-to-r from-amber-700 to-orange-700 text-amber-50 shadow-lg border-b-4 border-amber-900">
          <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6 lg:py-8">
            <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
              <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-1 min-w-0">
                <button
                  aria-label="Toggle menu"
                  onClick={() => setShowBooksMenu((s) => !s)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 lg:hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <div
                  onClick={handleClearAll}
                  className="cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  <h1
                    className="text-lg sm:text-2xl lg:text-4xl font-bold"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    📖 <span className="hidden sm:inline">Biblia Digital</span>
                  </h1>
                </div>

                {/* Search Bar - Inline on desktop, full width on mobile */}
                {showSearchBar && (
                  <div className="hidden sm:flex flex-1 min-w-0 max-w-2xl">
                    <SearchBar
                      data={data}
                      onSearch={setSearchResults}
                      clearOnChapterSelect={!!selectedChapter}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowSearchBar(!showSearchBar)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Toggle search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Search Bar - Full width below header */}
            {showSearchBar && (
              <div className="sm:hidden mt-3">
                <SearchBar
                  data={data}
                  onSearch={setSearchResults}
                  clearOnChapterSelect={!!selectedChapter}
                />
              </div>
            )}
          </div>
        </header>

        <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-8">
          <div className="flex gap-2 sm:gap-6 lg:gap-8">
            <Sidebar
              data={data}
              showBooksMenu={showBooksMenu}
              setShowBooksMenu={setShowBooksMenu}
              selectedBook={selectedBook}
              onSelectBook={(book) => {
                setSelectedBook(book);
                setSelectedChapter(null);
                setSearchResults(null);
                setShowBooksMenu(false); // Close menu on mobile after selection
              }}
              onSelectChapter={(chapter) => {
                handleSelectChapter(chapter.bookTitle, chapter);
                setShowBooksMenu(false); // Close menu on mobile after selection
              }}
            />

            <MainContent
              data={data}
              selectedBook={selectedBook}
              selectedChapter={selectedChapter}
              searchResults={searchResults}
              resultsVisible={resultsVisible}
              setResultsVisible={setResultsVisible}
              onSearch={setSearchResults}
              onSelectChapter={handleSelectChapter}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
