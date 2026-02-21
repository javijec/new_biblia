import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ReadPage from './ReadPage';

const { loadBookMock } = vi.hoisted(() => ({
  loadBookMock: vi.fn(),
}));

vi.mock('../context/BibleContext', () => ({
  useBible: () => ({
    loadBook: loadBookMock,
  }),
}));

vi.mock('../components/ChapterView', () => ({
  default: ({ chapter, onPrevChapter, onNextChapter, onWordSearch }) => (
    <div>
      <div data-testid="chapter-number">{chapter.number}</div>
      <button onClick={onPrevChapter}>prev</button>
      <button onClick={onNextChapter}>next</button>
      <button onClick={() => onWordSearch('amor')}>word-search</button>
    </div>
  ),
}));

function LocationDebug() {
  const location = useLocation();
  return (
    <>
      <div data-testid="pathname">{location.pathname}</div>
      <div data-testid="search">{location.search}</div>
    </>
  );
}

describe('ReadPage integration', () => {
  beforeEach(() => {
    loadBookMock.mockReset();
    loadBookMock.mockResolvedValue({
      id: 'genesis',
      name: 'Genesis',
      chapters: [
        { number: 1, verses: [{ number: 1, text: 'v1' }] },
        { number: 2, verses: [{ number: 1, text: 'v1' }] },
        { number: 3, verses: [{ number: 1, text: 'v1' }] },
      ],
    });
  });

  it('navega entre capitulo anterior y siguiente', async () => {
    render(
      <MemoryRouter initialEntries={['/read/genesis/2']}>
        <Routes>
          <Route path="/read/:bookId/:chapter" element={<ReadPage />} />
        </Routes>
        <LocationDebug />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('chapter-number')).toHaveTextContent('2');

    fireEvent.click(screen.getByText('next'));

    await waitFor(() => {
      expect(screen.getByTestId('pathname')).toHaveTextContent('/read/genesis/3');
      expect(screen.getByTestId('chapter-number')).toHaveTextContent('3');
    });

    fireEvent.click(screen.getByText('prev'));

    await waitFor(() => {
      expect(screen.getByTestId('pathname')).toHaveTextContent('/read/genesis/2');
      expect(screen.getByTestId('chapter-number')).toHaveTextContent('2');
    });
  });

  it('navega a busqueda al hacer click en una palabra', async () => {
    render(
      <MemoryRouter initialEntries={['/read/genesis/2']}>
        <Routes>
          <Route path="/read/:bookId/:chapter" element={<ReadPage />} />
          <Route path="/search" element={<div>Search page</div>} />
        </Routes>
        <LocationDebug />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('chapter-number')).toHaveTextContent('2');

    fireEvent.click(screen.getByText('word-search'));

    await waitFor(() => {
      expect(screen.getByTestId('pathname')).toHaveTextContent('/search');
      expect(screen.getByTestId('search')).toHaveTextContent('?q=amor');
      expect(screen.getByText('Search page')).toBeInTheDocument();
    });
  });
});
