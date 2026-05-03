import { Component, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <form
      (ngSubmit)="submit()"
      class="relative flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700/60"
    >
      <button
        type="button"
        (click)="toggleAll.emit()"
        aria-label="Toggle all todos"
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 text-slate-400 transition-colors hover:border-violet-400 hover:text-violet-400 focus-visible:outline-2 focus-visible:outline-violet-500 dark:border-slate-600 dark:hover:border-violet-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
      <input
        [(ngModel)]="inputText"
        name="newTodo"
        type="text"
        placeholder="What needs to be done?"
        autocomplete="off"
        class="flex-1 bg-transparent text-base text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
        aria-label="New todo text"
      />
      @if (inputText()) {
        <button
          type="submit"
          class="shrink-0 rounded-xl bg-violet-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-600 focus-visible:outline-2 focus-visible:outline-violet-500"
          aria-label="Add todo"
        >
          Add
        </button>
      }
    </form>
  `,
})
export class TodoInput {
  readonly add = output<string>();
  readonly toggleAll = output<void>();

  protected readonly inputText = signal('');

  protected submit(): void {
    const text = this.inputText().trim();
    if (!text) return;
    this.add.emit(text);
    this.inputText.set('');
  }
}
