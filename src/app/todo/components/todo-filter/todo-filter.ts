import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FilterType } from '../../models/todo.model';

@Component({
  selector: 'app-todo-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center justify-between gap-2 rounded-2xl bg-white px-5 py-3 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700/60"
    >
      <span class="text-sm text-slate-500 dark:text-slate-400">
        <span class="font-semibold text-slate-700 dark:text-slate-200">{{ activeCount() }}</span>
        {{ activeCount() === 1 ? 'item' : 'items' }} left
      </span>

      <nav class="flex gap-1" aria-label="Filter todos">
        @for (f of filters; track f.value) {
          <button
            type="button"
            (click)="filterChange.emit(f.value)"
            [attr.aria-pressed]="current() === f.value"
            [class]="btnClass(f.value)"
          >
            {{ f.label }}
          </button>
        }
      </nav>

      @if (completedCount() > 0) {
        <button
          type="button"
          (click)="clearCompleted.emit()"
          class="text-sm text-slate-500 transition-colors hover:text-rose-500 focus-visible:outline-2 focus-visible:outline-rose-400 dark:text-slate-400 dark:hover:text-rose-400"
        >
          Clear completed
        </button>
      } @else {
        <span class="invisible text-sm">Clear completed</span>
      }
    </div>
  `,
})
export class TodoFilter {
  readonly current = input.required<FilterType>();
  readonly activeCount = input.required<number>();
  readonly completedCount = input.required<number>();
  readonly filterChange = output<FilterType>();
  readonly clearCompleted = output<void>();

  protected readonly filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  protected btnClass(value: FilterType): string {
    const base =
      'rounded-lg px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-violet-500 ';
    return this.current() === value
      ? base + 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
      : base +
          'text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300';
  }
}
