import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoList } from './todo-list';
import { Todo } from '../../models/todo.model';

// Mock SortableJS to avoid real DOM drag operations in jsdom
const mockSortableInstance = { destroy: vi.fn() };
vi.mock('sortablejs', () => ({
  default: { create: vi.fn(() => mockSortableInstance) },
}));

function makeTodo(id: string, text: string, order: number): Todo {
  return { id, text, completed: false, order, createdAt: Date.now() };
}

describe('TodoList', () => {
  let fixture: ComponentFixture<TodoList>;
  let component: TodoList;
  let el: HTMLElement;

  function setTodos(todos: Todo[]): void {
    fixture.componentRef.setInput('todos', todos);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    mockSortableInstance.destroy.mockClear();
    await TestBed.configureTestingModule({ imports: [TodoList] }).compileComponents();
    fixture = TestBed.createComponent(TodoList);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    setTodos([]);
  });

  // ── empty state ───────────────────────────────────────────────────────────────

  it('shows the empty-state message when there are no todos', () => {
    expect(el.textContent).toContain('No todos here yet');
  });

  it('does not render the list element when there are no todos', () => {
    expect(el.querySelector('ul[role="list"]')).toBeNull();
  });

  // ── list rendering ────────────────────────────────────────────────────────────

  it('renders one list item per todo', () => {
    setTodos([makeTodo('1', 'A', 0), makeTodo('2', 'B', 1)]);
    expect(el.querySelectorAll('li[data-id]').length).toBe(2);
  });

  it('sets data-id attribute on each list item', () => {
    setTodos([makeTodo('abc', 'A', 0)]);
    expect(el.querySelector('li[data-id="abc"]')).toBeTruthy();
  });

  it('hides the empty-state when todos exist', () => {
    setTodos([makeTodo('1', 'A', 0)]);
    expect(el.textContent).not.toContain('No todos here yet');
  });

  // ── toggle output ─────────────────────────────────────────────────────────────

  it('emits toggle when a child item requests it', () => {
    setTodos([makeTodo('1', 'A', 0)]);
    const emitted: string[] = [];
    component.toggle.subscribe((id) => emitted.push(id));

    const btn = el.querySelector<HTMLButtonElement>('button[aria-label="Mark as completed"]')!;
    btn.click();
    expect(emitted).toEqual(['1']);
  });

  // ── remove output ─────────────────────────────────────────────────────────────

  it('emits remove when a child item requests it', () => {
    setTodos([makeTodo('1', 'A', 0)]);
    const emitted: string[] = [];
    component.remove.subscribe((id) => emitted.push(id));

    el.querySelector<HTMLButtonElement>('button[aria-label="Delete todo"]')!.click();
    expect(emitted).toEqual(['1']);
  });

  // ── updateText output ─────────────────────────────────────────────────────────

  it('emits updateText when a child item double-clicks and commits', () => {
    setTodos([makeTodo('1', 'Task', 0)]);
    const emitted: Array<{ id: string; text: string }> = [];
    component.updateText.subscribe((v) => emitted.push(v));

    const span = el.querySelector<HTMLSpanElement>('span[title="Double-click to edit"]')!;
    span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();

    const input = el.querySelector<HTMLInputElement>('input[aria-label="Edit todo"]')!;
    input.value = 'Updated';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(emitted).toEqual([{ id: '1', text: 'Updated' }]);
  });

  // ── ngOnChanges / SortableJS initialisation ───────────────────────────────────

  it('initialises SortableJS when todos are provided', async () => {
    const { default: Sortable } = await import('sortablejs');
    setTodos([makeTodo('1', 'A', 0)]);
    // queueMicrotask defers the init — flush it
    await new Promise((r) => queueMicrotask(r as () => void));
    expect((Sortable as unknown as { create: ReturnType<typeof vi.fn> }).create).toHaveBeenCalled();
  });

  // ── ngOnDestroy ───────────────────────────────────────────────────────────────

  it('destroys the Sortable instance on component destroy', async () => {
    setTodos([makeTodo('1', 'A', 0)]);
    await new Promise((r) => queueMicrotask(r as () => void));
    fixture.destroy();
    expect(mockSortableInstance.destroy).toHaveBeenCalled();
  });

  it('nullifies the sortable reference on destroy', () => {
    fixture.destroy();
    const list = component as unknown as { sortable: unknown };
    expect(list.sortable).toBeNull();
  });
});
