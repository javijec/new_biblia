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
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-700 mx-auto mb-6"></div>
          <p className="text-amber-800 font-medium text-lg">
            Cargando Biblia Digital...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-amber-50 to-orange-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border-2 border-amber-100">
          <p className="text-amber-900 font-bold text-lg">Error al cargar</p>
          <p className="text-amber-700 text-base mt-3">Recarga la página</p>
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
    <div className="h-screen flex flex-col overflow-hidden bg-linear-to-br from-amber-50 to-orange-50 text-amber-900">
      {/* Header */}
      <header className="bg-linear-to-r from-amber-700 to-orange-700 text-amber-50 shadow-xl border-b-4 border-amber-900 shrink-0">
        <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-5 lg:py-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 flex-1 min-w-0">
              <button
                aria-label="Toggle menu"
                onClick={() => setShowBooksMenu((s) => !s)}
                className="p-2.5 hover:bg-white/20 rounded-lg transition-colors shrink-0 lg:hidden hover-lift"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
                className="cursor-pointer hover:opacity-90 transition-opacity shrink-0"
              >
                <h1
                  className="text-xl sm:text-3xl lg:text-4xl font-bold"
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

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="p-2.5 hover:bg-white/20 rounded-lg transition-colors hover-lift"
                aria-label="Toggle search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden max-w-[1920px] w-full mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex gap-3 sm:gap-6 lg:gap-8 h-full">
          <Sidebar
            data={data}
            showBooksMenu={showBooksMenu}
            setShowBooksMenu={setShowBooksMenu}
            selectedBook={selectedBook}
            onSelectBook={(book) => {
              setSelectedBook(book);
              setSelectedChapter(null);
              setSearchResults(null);
              setShowBooksMenu(false);
            }}
            onSelectChapter={(chapter) => {
              handleSelectChapter(chapter.bookTitle, chapter);
              setShowBooksMenu(false);
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
  );
}

export default App;
