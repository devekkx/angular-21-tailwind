import { Injectable, signal, computed } from '@angular/core';
import { Todo, FilterType } from './models/todo.model';

const STORAGE_KEY = 'ng-todos';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly todos = signal<Todo[]>(this.loadFromStorage());
  readonly filter = signal<FilterType>('all');

  readonly filteredTodos = computed(() => {
    const all = this.todos();
    const f = this.filter();
    const list =
      f === 'active'
        ? all.filter((t) => !t.completed)
        : f === 'completed'
          ? all.filter((t) => t.completed)
          : all;
    return [...list].sort((a, b) => a.order - b.order);
  });

  readonly activeCount = computed(() => this.todos().filter((t) => !t.completed).length);
  readonly completedCount = computed(() => this.todos().filter((t) => t.completed).length);
  readonly totalCount = computed(() => this.todos().length);

  add(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    const all = this.todos();
    const maxOrder = all.length ? Math.max(...all.map((t) => t.order)) : -1;
    const todo: Todo = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      order: maxOrder + 1,
      createdAt: Date.now(),
    };
    this.todos.update((list) => [...list, todo]);
    this.persist();
  }

  toggle(id: string): void {
    this.todos.update((list) =>
      list.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
    this.persist();
  }

  remove(id: string): void {
    this.todos.update((list) => list.filter((t) => t.id !== id));
    this.persist();
  }

  updateText(id: string, text: string): void {
    const trimmed = text.trim();
    if (!trimmed) {
      this.remove(id);
      return;
    }
    this.todos.update((list) => list.map((t) => (t.id === id ? { ...t, text: trimmed } : t)));
    this.persist();
  }

  clearCompleted(): void {
    this.todos.update((list) => list.filter((t) => !t.completed));
    this.persist();
  }

  toggleAll(): void {
    const allDone = this.todos().every((t) => t.completed);
    this.todos.update((list) => list.map((t) => ({ ...t, completed: !allDone })));
    this.persist();
  }

  reorder(ids: string[]): void {
    this.todos.update((list) => {
      const map = new Map(list.map((t) => [t.id, t]));
      return list.map((t) => {
        const newOrder = ids.indexOf(t.id);
        return newOrder !== -1 ? { ...map.get(t.id)!, order: newOrder } : t;
      });
    });
    this.persist();
  }

  setFilter(f: FilterType): void {
    this.filter.set(f);
  }

  private loadFromStorage(): Todo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Todo[]) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos()));
    } catch {
      // storage full or unavailable
    }
  }
}
