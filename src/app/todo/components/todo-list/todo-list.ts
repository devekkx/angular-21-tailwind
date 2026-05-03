import {
  Component,
  input,
  output,
  OnChanges,
  OnDestroy,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Sortable, { SortableEvent } from 'sortablejs';
import { Todo } from '../../models/todo.model';
import { TodoItem } from '../todo-item/todo-item';

@Component({
  selector: 'app-todo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TodoItem],
  template: `
    @if (todos().length === 0) {
      <div class="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          class="h-12 w-12 opacity-40"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
          />
        </svg>
        <p class="text-sm font-medium">No todos here yet</p>
      </div>
    } @else {
      <ul #listEl class="flex flex-col gap-2" role="list" aria-label="Todo list">
        @for (todo of todos(); track todo.id) {
          <li [attr.data-id]="todo.id" class="list-none">
            <app-todo-item
              [todo]="todo"
              (toggle)="toggle.emit($event)"
              (remove)="remove.emit($event)"
              (updateText)="updateText.emit($event)"
            />
          </li>
        }
      </ul>
    }
  `,
})
export class TodoList implements OnChanges, OnDestroy {
  readonly todos = input.required<Todo[]>();
  readonly toggle = output<string>();
  readonly remove = output<string>();
  readonly updateText = output<{ id: string; text: string }>();
  readonly reorder = output<string[]>();

  private readonly listRef = viewChild<ElementRef<HTMLUListElement>>('listEl');
  private sortable: Sortable | null = null;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnChanges(): void {
    if (!this.isBrowser) return;
    // Re-initialise when the list re-renders (filter changes)
    queueMicrotask(() => this.initSortable());
  }

  ngOnDestroy(): void {
    this.sortable?.destroy();
    this.sortable = null;
  }

  private initSortable(): void {
    const el = this.listRef()?.nativeElement;
    if (!el) return;

    this.sortable?.destroy();

    this.sortable = Sortable.create(el, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: (evt: SortableEvent) => {
        const items = Array.from(el.querySelectorAll('li[data-id]'));
        const ids = items.map((li) => (li as HTMLElement).dataset['id']!);
        this.reorder.emit(ids);
      },
    });
  }
}
