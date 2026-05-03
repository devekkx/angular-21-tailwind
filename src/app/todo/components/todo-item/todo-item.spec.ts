import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoItem } from './todo-item';
import { Todo } from '../../models/todo.model';

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'test-id',
    text: 'Sample todo',
    completed: false,
    order: 0,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('TodoItem', () => {
  let fixture: ComponentFixture<TodoItem>;
  let component: TodoItem;
  let el: HTMLElement;

  function setTodo(todo: Todo): void {
    fixture.componentRef.setInput('todo', todo);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TodoItem] }).compileComponents();
    fixture = TestBed.createComponent(TodoItem);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    setTodo(makeTodo());
  });

  // ── rendering ─────────────────────────────────────────────────────────────────

  it('renders the todo text', () => {
    expect(el.textContent).toContain('Sample todo');
  });

  it('renders the toggle (checkbox) button', () => {
    expect(el.querySelector('button[aria-label="Mark as completed"]')).toBeTruthy();
  });

  it('renders the delete button', () => {
    expect(el.querySelector('button[aria-label="Delete todo"]')).toBeTruthy();
  });

  it('renders the drag handle', () => {
    expect(el.querySelector('.drag-handle')).toBeTruthy();
  });

  // ── toggle output ─────────────────────────────────────────────────────────────

  it('emits toggle with the todo id when the checkbox button is clicked', () => {
    const emitted: string[] = [];
    component.toggle.subscribe((id) => emitted.push(id));
    el.querySelector<HTMLButtonElement>('button[aria-label="Mark as completed"]')!.click();
    expect(emitted).toEqual(['test-id']);
  });

  // ── remove output ─────────────────────────────────────────────────────────────

  it('emits remove with the todo id when the delete button is clicked', () => {
    const emitted: string[] = [];
    component.remove.subscribe((id) => emitted.push(id));
    el.querySelector<HTMLButtonElement>('button[aria-label="Delete todo"]')!.click();
    expect(emitted).toEqual(['test-id']);
  });

  // ── startEdit / editing state ─────────────────────────────────────────────────

  it('enters edit mode on double-click of the text span', () => {
    const span = el.querySelector<HTMLSpanElement>('span[title="Double-click to edit"]')!;
    span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();
    expect(el.querySelector('input[aria-label="Edit todo"]')).toBeTruthy();
  });

  it('pre-fills the edit input with the current text', async () => {
    const span = el.querySelector<HTMLSpanElement>('span[title="Double-click to edit"]')!;
    span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const input = el.querySelector<HTMLInputElement>('input[aria-label="Edit todo"]')!;
    expect(input.value).toBe('Sample todo');
  });

  // ── commitEdit ────────────────────────────────────────────────────────────────

  it('emits updateText with new text when Enter is pressed', async () => {
    const emitted: Array<{ id: string; text: string }> = [];
    component.updateText.subscribe((v) => emitted.push(v));

    const span = el.querySelector<HTMLSpanElement>('span[title="Double-click to edit"]')!;
    span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();

    const input = el.querySelector<HTMLInputElement>('input[aria-label="Edit todo"]')!;
    input.value = 'Updated text';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(emitted).toEqual([{ id: 'test-id', text: 'Updated text' }]);
  });

  it('exits edit mode after commit', () => {
    const span = el.querySelector<HTMLSpanElement>('span[title="Double-click to edit"]')!;
    span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();

    const input = el.querySelector<HTMLInputElement>('input[aria-label="Edit todo"]')!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(el.querySelector('input[aria-label="Edit todo"]')).toBeNull();
  });

  it('emits updateText on blur', async () => {
    const emitted: Array<{ id: string; text: string }> = [];
    component.updateText.subscribe((v) => emitted.push(v));

    const span = el.querySelector<HTMLSpanElement>('span[title="Double-click to edit"]')!;
    span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();

    const input = el.querySelector<HTMLInputElement>('input[aria-label="Edit todo"]')!;
    input.value = 'Blur commit';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(emitted[0].text).toBe('Blur commit');
  });

  // ── cancelEdit ────────────────────────────────────────────────────────────────

  it('exits edit mode without emitting when Escape is pressed', () => {
    const emitted: unknown[] = [];
    component.updateText.subscribe((v) => emitted.push(v));

    const span = el.querySelector<HTMLSpanElement>('span[title="Double-click to edit"]')!;
    span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();

    const input = el.querySelector<HTMLInputElement>('input[aria-label="Edit todo"]')!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(el.querySelector('input[aria-label="Edit todo"]')).toBeNull();
    expect(emitted).toHaveLength(0);
  });

  // ── checkboxClass ─────────────────────────────────────────────────────────────

  it('checkboxClass returns violet style for completed todo', () => {
    setTodo(makeTodo({ completed: true }));
    const cls = (component as unknown as { checkboxClass(): string }).checkboxClass();
    expect(cls).toContain('bg-violet-400');
  });

  it('checkboxClass returns border-only style for active todo', () => {
    setTodo(makeTodo({ completed: false }));
    const cls = (component as unknown as { checkboxClass(): string }).checkboxClass();
    expect(cls).toContain('border-slate-300');
    expect(cls).not.toContain('bg-violet-');
  });

  // ── textClass ─────────────────────────────────────────────────────────────────

  it('textClass returns line-through for completed todo', () => {
    setTodo(makeTodo({ completed: true }));
    const cls = (component as unknown as { textClass(): string }).textClass();
    expect(cls).toContain('line-through');
  });

  it('textClass returns normal text style for active todo', () => {
    setTodo(makeTodo({ completed: false }));
    const cls = (component as unknown as { textClass(): string }).textClass();
    expect(cls).not.toContain('line-through');
    expect(cls).toContain('text-slate-700');
  });

  // ── completed todo visual state ───────────────────────────────────────────────

  it('shows a checkmark icon when todo is completed', () => {
    setTodo(makeTodo({ completed: true }));
    expect(el.querySelector('button[aria-label="Mark as active"]')).toBeTruthy();
  });

  it('applies opacity-60 class to the wrapper when completed', () => {
    setTodo(makeTodo({ completed: true }));
    const wrapper = el.querySelector<HTMLElement>('.group')!;
    expect(wrapper.classList.contains('opacity-60')).toBe(true);
  });

  it('does not apply opacity-60 when active', () => {
    setTodo(makeTodo({ completed: false }));
    const wrapper = el.querySelector<HTMLElement>('.group')!;
    expect(wrapper.classList.contains('opacity-60')).toBe(false);
  });
});
