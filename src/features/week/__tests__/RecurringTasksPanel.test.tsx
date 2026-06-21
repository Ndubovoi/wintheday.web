import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecurringTasksPanel from '../RecurringTasksPanel';
import type { RecurringTaskItem } from '../../../domain/types';

const rec = (over: Partial<RecurringTaskItem>): RecurringTaskItem => ({
  id: 'r1',
  name: 'Meditate',
  recurrenceRule: 'daily',
  recurrenceDetails: null,
  createdOn: '2026-06-21',
  isDeleted: false,
  winBreaker: false,
  ...over,
});

describe('RecurringTasksPanel', () => {
  it('renders nothing when there are no recurring tasks', () => {
    const { container } = render(<RecurringTasksPanel items={[]} onRemove={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lists recurring tasks with their schedule', () => {
    render(
      <RecurringTasksPanel
        items={[rec({ id: 'a', name: 'Meditate', recurrenceRule: 'daily' }), rec({ id: 'b', name: 'Standup', recurrenceRule: 'workDays' })]}
        onRemove={() => {}}
      />,
    );
    expect(screen.getByText('Meditate')).toBeInTheDocument();
    expect(screen.getByText('Standup')).toBeInTheDocument();
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Work days')).toBeInTheDocument();
  });

  it('calls onRemove with the task id when "stop" is clicked', () => {
    const onRemove = vi.fn();
    render(
      <RecurringTasksPanel items={[rec({ id: 'abc', name: 'Meditate' })]} onRemove={onRemove} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Stop repeating Meditate' }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('abc');
  });
});
