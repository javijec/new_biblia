import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SelectionProvider, useSelection } from './SelectionContext';

function SelectionTestConsumer() {
  const { selectionCount, toggleSelection, clearSelection, isSelected } = useSelection();
  const verse = {
    bookId: 'genesis',
    chapterNumber: 1,
    verseNumber: 1,
    text: 'En el principio',
  };

  return (
    <div>
      <span data-testid="count">{selectionCount}</span>
      <span data-testid="selected">{String(isSelected('genesis', 1, 1))}</span>
      <button onClick={() => toggleSelection(verse)}>toggle</button>
      <button onClick={clearSelection}>clear</button>
    </div>
  );
}

describe('SelectionContext', () => {
  it('agrega y quita versiculos seleccionados', () => {
    render(
      <SelectionProvider>
        <SelectionTestConsumer />
      </SelectionProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('selected')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('selected')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('selected')).toHaveTextContent('false');
  });

  it('limpia todas las selecciones', () => {
    render(
      <SelectionProvider>
        <SelectionTestConsumer />
      </SelectionProvider>
    );

    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('clear'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
