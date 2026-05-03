import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TodoService } from './todo.service';
import { TodoInput } from './components/todo-input/todo-input';
import { TodoList } from './components/todo-list/todo-list';
import { TodoFilter } from './components/todo-filter/todo-filter';
import { FilterType } from './models/todo.model';

@Component({
  selector: 'app-todo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TodoInput, TodoList, TodoFilter],
  template: `
    <div
      class="min-h-screen bg-linear-to-br from-violet-50 via-slate-50 to-indigo-50 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      <div class="mx-auto w-full max-w-xl">
        <!-- Header -->
        <header class="mb-8 text-center">
          <h1 class="text-4xl font-bold tracking-tight text-violet-700 dark:text-violet-300">
            My Todos
          </h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Stay organised. Drag to reorder. Double-click to edit.
          </p>
        </header>

        <!-- Input -->
        <app-todo-input (add)="svc.add($event)" (toggleAll)="svc.toggleAll()" class="block" />

        <!-- List -->
        <section class="mt-4" aria-label="Todo items">
          <app-todo-list
            [todos]="svc.filteredTodos()"
            (toggle)="svc.toggle($event)"
            (remove)="svc.remove($event)"
            (updateText)="svc.updateText($event.id, $event.text)"
            (reorder)="svc.reorder($event)"
          />
        </section>

        <!-- Footer filter bar -->
        @if (svc.totalCount() > 0) {
          <div class="mt-4">
            <app-todo-filter
              [current]="svc.filter()"
              [activeCount]="svc.activeCount()"
              [completedCount]="svc.completedCount()"
              (filterChange)="svc.setFilter($event)"
              (clearCompleted)="svc.clearCompleted()"
            />
          </div>
        }

        <!-- Hint -->
        @if (svc.totalCount() === 0) {
          <p class="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
            Press
            <kbd
              class="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >Enter</kbd
            >
            or click <strong>Add</strong> to create your first todo.
          </p>
        }
      </div>
    </div>
  `,
})
export class TodoComponent {
  protected readonly svc = inject(TodoService);
}
