import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SearchPage from './SearchPage';

vi.mock('../hooks/useBibleSearch', () => ({
  useBibleSearch: vi.fn(),
}));

import { useBibleSearch } from '../hooks/useBibleSearch';

describe('SearchPage integration', () => {
  it('muestra resultados para la query y navega al capitulo al hacer click', async () => {
    useBibleSearch.mockReturnValue({
      isReady: true,
      searchAllBooks: vi.fn().mockResolvedValue({
        results: [
          {
            bookTitle: 'Evangelio segun san Juan',
            chapterNumber: 3,
            verseNumber: 16,
            text: 'Tanto amó Dios al mundo...',
            chapter: { bookId: 'evangelio-segun-san-juan', number: 3 },
            testament: 'Nuevo Testamento',
          },
        ],
        terms: ['amor', 'amo'],
        elapsedMs: 42,
        resultCount: 1,
      }),
    });

    render(
      <MemoryRouter initialEntries={['/search?q=amor']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
          <Route path="/read/:bookId/:chapter" element={<div>Read page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Resultados para "amor"')).toBeInTheDocument();
    expect(await screen.findByText('Jn 3:16')).toBeInTheDocument();
    expect(await screen.findByText('42 ms')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Jn 3:16'));

    await waitFor(() => {
      expect(screen.getByText('Read page')).toBeInTheDocument();
    });
  });
});
