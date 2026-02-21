import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsProvider, useSettings } from './SettingsContext';

function SettingsTestConsumer() {
  const { fontSize, setFontSize, themeMode, setThemeMode } = useSettings();

  return (
    <div>
      <span data-testid="font-size">{fontSize}</span>
      <span data-testid="theme-mode">{themeMode}</span>
      <button onClick={() => setFontSize(22)}>font</button>
      <button onClick={() => setThemeMode('dark')}>theme</button>
    </div>
  );
}

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('lee valores por defecto cuando no hay storage', () => {
    render(
      <SettingsProvider>
        <SettingsTestConsumer />
      </SettingsProvider>
    );

    expect(screen.getByTestId('font-size')).toHaveTextContent('18');
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('persiste cambios en localStorage', () => {
    render(
      <SettingsProvider>
        <SettingsTestConsumer />
      </SettingsProvider>
    );

    fireEvent.click(screen.getByText('font'));
    fireEvent.click(screen.getByText('theme'));

    expect(localStorage.getItem('bible_font_size')).toBe('22');
    expect(localStorage.getItem('bible_theme')).toBe('dark');
  });
});
