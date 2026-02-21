import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './MainLayout';

vi.mock('../context/BibleContext', () => ({
  useBible: () => ({
    data: {
      testaments: { old: [], new: [] },
    },
  }),
}));

vi.mock('../components/Tutorial', () => ({
  default: () => null,
}));

vi.mock('../components/ReadingSettings', () => ({
  default: () => null,
}));

vi.mock('../components/Sidebar', () => ({
  default: ({ onNavigate }) => (
    <button onClick={() => onNavigate('/read/genesis/1')}>
      ir a genesis 1
    </button>
  ),
}));

describe('MainLayout integration', () => {
  it('navega desde sidebar a la vista de lectura', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<div>Home page</div>} />
            <Route path="read/:bookId/:chapter" element={<div>Read page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home page')).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('ir a genesis 1')[0]);

    await waitFor(() => {
      expect(screen.getByText('Read page')).toBeInTheDocument();
    });
  });
});
