import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
  ElementRef,
  viewChild,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div
      class="group flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-200/80 transition-shadow hover:shadow-md dark:bg-slate-800 dark:ring-slate-700/60"
      [class.opacity-60]="todo().completed && !editing()"
    >
      <!-- Drag handle -->
      <span
        class="drag-handle shrink-0 cursor-grab touch-none text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing dark:text-slate-600"
        aria-hidden="true"
        title="Drag to reorder"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="h-4 w-4"
        >
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </span>

      <!-- Checkbox -->
      <button
        type="button"
        (click)="toggle.emit(todo().id)"
        [attr.aria-label]="todo().completed ? 'Mark as active' : 'Mark as completed'"
        [attr.aria-pressed]="todo().completed"
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-2 focus-visible:outline-violet-500"
        [class]="checkboxClass()"
      >
        @if (todo().completed) {
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
        }
      </button>

      <!-- Text / Edit -->
      @if (editing()) {
        <input
          #editInput
          [(ngModel)]="editValue"
          name="edit"
          type="text"
          class="flex-1 rounded-lg bg-slate-50 px-2 py-0.5 text-base text-slate-800 outline-none ring-2 ring-violet-400 dark:bg-slate-700 dark:text-slate-100"
          (blur)="commitEdit()"
          (keydown.enter)="commitEdit()"
          (keydown.escape)="cancelEdit()"
          aria-label="Edit todo"
        />
      } @else {
        <span
          (dblclick)="startEdit()"
          class="flex-1 cursor-text select-none break-all text-base leading-snug"
          [class]="textClass()"
          title="Double-click to edit"
          >{{ todo().text }}</span
        >
      }

      <!-- Delete -->
      <button
        type="button"
        (click)="remove.emit(todo().id)"
        aria-label="Delete todo"
        class="shrink-0 rounded-lg p-1 text-slate-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-rose-400 dark:text-slate-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  `,
})
export class TodoItem {
  readonly todo = input.required<Todo>();
  readonly toggle = output<string>();
  readonly remove = output<string>();
  readonly updateText = output<{ id: string; text: string }>();

  protected readonly editing = signal(false);
  protected editValue = '';

  private readonly editInputRef = viewChild<ElementRef<HTMLInputElement>>('editInput');

  constructor() {
    effect(() => {
      if (this.editing() && this.editInputRef()) {
        const el = this.editInputRef()!.nativeElement;
        el.focus();
        el.select();
      }
    });
  }

  protected startEdit(): void {
    this.editValue = this.todo().text;
    this.editing.set(true);
  }

  protected commitEdit(): void {
    if (!this.editing()) return;
    this.updateText.emit({ id: this.todo().id, text: this.editValue });
    this.editing.set(false);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected checkboxClass(): string {
    return this.todo().completed
      ? 'border-violet-400 bg-violet-400 text-white dark:border-violet-500 dark:bg-violet-500'
      : 'border-slate-300 text-transparent hover:border-violet-400 dark:border-slate-600';
  }

  protected textClass(): string {
    return this.todo().completed
      ? 'line-through text-slate-400 dark:text-slate-500'
      : 'text-slate-700 dark:text-slate-200';
  }
}
