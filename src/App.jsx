import React, { useState } from 'react';
import { useBible } from './context/BibleContext';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import SearchBar from './components/SearchBar';
import './App.css';

function App() {
  const { data, loading } = useBible();
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [resultsVisible, setResultsVisible] = useState(20);
  const [darkMode, setDarkMode] = useState(false);
  const [showBooksMenu, setShowBooksMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Cargando Biblia Digital...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
          <p className="text-red-600 dark:text-red-400 font-semibold">Error al cargar</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Recarga la página</p>
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
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  aria-label="Toggle menu"
                  onClick={() => setShowBooksMenu(s => !s)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div onClick={handleClearAll} className="cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0">
                  <h1 className="text-3xl font-bold">📖 Biblia Digital</h1>
                </div>

                {/* Search Bar - Inline */}
                {showSearchBar && (
                  <div className="flex-1 min-w-0">
                    <SearchBar 
                      data={data} 
                      onSearch={setSearchResults} 
                      clearOnChapterSelect={!!selectedChapter}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowSearchBar(!showSearchBar)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Toggle search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            <Sidebar
              data={data}
              showBooksMenu={showBooksMenu}
              setShowBooksMenu={setShowBooksMenu}
              selectedBook={selectedBook}
              onSelectBook={(book) => {
                setSelectedBook(book);
                setSelectedChapter(null);
                setSearchResults(null);
              }}
              onSelectChapter={(chapter) => {
                handleSelectChapter(chapter.bookTitle, chapter);
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
