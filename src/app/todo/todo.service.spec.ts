import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';
import { Todo } from './models/todo.model';

const STORAGE_KEY = 'ng-todos';

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: crypto.randomUUID(),
    text: 'Test todo',
    completed: false,
    order: 0,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('TodoService', () => {
  let service: TodoService;
  let setItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  afterEach(() => vi.restoreAllMocks());

  // ── loadFromStorage ──────────────────────────────────────────────────────────

  describe('loadFromStorage', () => {
    it('starts with empty list when storage is null', () => {
      expect(service.totalCount()).toBe(0);
    });

    it('loads persisted todos on initialisation', () => {
      const stored: Todo[] = [makeTodo({ id: '1', text: 'Stored', order: 0 })];
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(stored));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const fresh = TestBed.inject(TodoService);
      expect(fresh.totalCount()).toBe(1);
      expect(fresh.filteredTodos()[0].text).toBe('Stored');
    });

    it('falls back to empty array on invalid JSON', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('{bad json');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const fresh = TestBed.inject(TodoService);
      expect(fresh.totalCount()).toBe(0);
    });
  });

  // ── add ──────────────────────────────────────────────────────────────────────

  describe('add', () => {
    it('adds a todo', () => {
      service.add('Buy milk');
      expect(service.totalCount()).toBe(1);
    });

    it('trims leading/trailing whitespace', () => {
      service.add('  Buy milk  ');
      expect(service.filteredTodos()[0].text).toBe('Buy milk');
    });

    it('ignores empty string', () => {
      service.add('');
      expect(service.totalCount()).toBe(0);
    });

    it('ignores whitespace-only string', () => {
      service.add('   ');
      expect(service.totalCount()).toBe(0);
    });

    it('sets completed to false by default', () => {
      service.add('Task');
      expect(service.filteredTodos()[0].completed).toBe(false);
    });

    it('assigns order 0 to the first todo', () => {
      service.add('First');
      expect(service.filteredTodos()[0].order).toBe(0);
    });

    it('assigns incrementing order for subsequent todos', () => {
      service.add('A');
      service.add('B');
      service.add('C');
      const orders = service.filteredTodos().map((t) => t.order);
      expect(orders).toEqual([0, 1, 2]);
    });

    it('generates a unique id per todo', () => {
      service.add('A');
      service.add('B');
      const ids = service.filteredTodos().map((t) => t.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('persists to localStorage', () => {
      service.add('Task');
      expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));
    });

    it('does not persist for empty input', () => {
      service.add('');
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  // ── toggle ────────────────────────────────────────────────────────────────────

  describe('toggle', () => {
    it('marks an active todo as completed', () => {
      service.add('Task');
      const { id } = service.filteredTodos()[0];
      service.toggle(id);
      expect(service.filteredTodos()[0].completed).toBe(true);
    });

    it('marks a completed todo as active', () => {
      service.add('Task');
      const { id } = service.filteredTodos()[0];
      service.toggle(id);
      service.toggle(id);
      expect(service.filteredTodos()[0].completed).toBe(false);
    });

    it('does not affect other todos', () => {
      service.add('A');
      service.add('B');
      const idA = service.filteredTodos()[0].id;
      service.toggle(idA);
      expect(service.filteredTodos()[1].completed).toBe(false);
    });

    it('persists to localStorage', () => {
      service.add('Task');
      const { id } = service.filteredTodos()[0];
      setItemSpy.mockClear();
      service.toggle(id);
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes a todo by id', () => {
      service.add('Task');
      const { id } = service.filteredTodos()[0];
      service.remove(id);
      expect(service.totalCount()).toBe(0);
    });

    it('leaves other todos intact', () => {
      service.add('A');
      service.add('B');
      const idA = service.filteredTodos()[0].id;
      service.remove(idA);
      expect(service.totalCount()).toBe(1);
      expect(service.filteredTodos()[0].text).toBe('B');
    });

    it('silently ignores an unknown id', () => {
      service.add('A');
      service.remove('does-not-exist');
      expect(service.totalCount()).toBe(1);
    });

    it('persists to localStorage', () => {
      service.add('Task');
      const { id } = service.filteredTodos()[0];
      setItemSpy.mockClear();
      service.remove(id);
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

  // ── updateText ────────────────────────────────────────────────────────────────

  describe('updateText', () => {
    it('updates the text of a todo', () => {
      service.add('Old');
      const { id } = service.filteredTodos()[0];
      service.updateText(id, 'New');
      expect(service.filteredTodos()[0].text).toBe('New');
    });

    it('trims whitespace from updated text', () => {
      service.add('Task');
      const { id } = service.filteredTodos()[0];
      service.updateText(id, '  Trimmed  ');
      expect(service.filteredTodos()[0].text).toBe('Trimmed');
    });

    it('removes the todo when new text is empty', () => {
      service.add('Task');
      const { id } = service.filteredTodos()[0];
      service.updateText(id, '');
      expect(service.totalCount()).toBe(0);
    });

    it('removes the todo when new text is whitespace-only', () => {
      service.add('Task');
      const { id } = service.filteredTodos()[0];
      service.updateText(id, '   ');
      expect(service.totalCount()).toBe(0);
    });

    it('persists to localStorage on text update', () => {
      service.add('Old');
      const { id } = service.filteredTodos()[0];
      setItemSpy.mockClear();
      service.updateText(id, 'New');
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

  // ── clearCompleted ────────────────────────────────────────────────────────────

  describe('clearCompleted', () => {
    it('removes all completed todos', () => {
      service.add('Active');
      service.add('Done');
      service.toggle(service.filteredTodos()[1].id);
      service.clearCompleted();
      expect(service.totalCount()).toBe(1);
      expect(service.filteredTodos()[0].text).toBe('Active');
    });

    it('does nothing when there are no completed todos', () => {
      service.add('Active');
      service.clearCompleted();
      expect(service.totalCount()).toBe(1);
    });

    it('removes all todos if all are completed', () => {
      service.add('A');
      service.add('B');
      service.toggleAll();
      service.clearCompleted();
      expect(service.totalCount()).toBe(0);
    });

    it('persists to localStorage', () => {
      service.add('Done');
      service.toggle(service.filteredTodos()[0].id);
      setItemSpy.mockClear();
      service.clearCompleted();
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

  // ── toggleAll ─────────────────────────────────────────────────────────────────

  describe('toggleAll', () => {
    it('marks all todos as completed when at least one is active', () => {
      service.add('A');
      service.add('B');
      service.toggleAll();
      expect(service.completedCount()).toBe(2);
      expect(service.activeCount()).toBe(0);
    });

    it('marks all todos as active when all are completed', () => {
      service.add('A');
      service.add('B');
      service.toggleAll();
      service.toggleAll();
      expect(service.activeCount()).toBe(2);
      expect(service.completedCount()).toBe(0);
    });

    it('marks all as completed when only some are completed', () => {
      service.add('A');
      service.add('B');
      service.toggle(service.filteredTodos()[0].id);
      service.toggleAll();
      expect(service.completedCount()).toBe(2);
    });

    it('persists to localStorage', () => {
      service.add('Task');
      setItemSpy.mockClear();
      service.toggleAll();
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

  // ── reorder ───────────────────────────────────────────────────────────────────

  describe('reorder', () => {
    it('assigns new order positions by id array index', () => {
      service.add('A');
      service.add('B');
      service.add('C');
      const [a, b, c] = service.filteredTodos();
      service.reorder([c.id, a.id, b.id]);
      const reordered = service.filteredTodos();
      expect(reordered[0].id).toBe(c.id);
      expect(reordered[1].id).toBe(a.id);
      expect(reordered[2].id).toBe(b.id);
    });

    it('preserves todos not present in the new id array', () => {
      service.add('A');
      service.add('B');
      const ids = service.filteredTodos().map((t) => t.id);
      service.reorder([ids[1]]);
      expect(service.totalCount()).toBe(2);
    });

    it('persists to localStorage', () => {
      service.add('A');
      service.add('B');
      const ids = service.filteredTodos().map((t) => t.id);
      setItemSpy.mockClear();
      service.reorder([ids[1], ids[0]]);
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

  // ── setFilter ─────────────────────────────────────────────────────────────────

  describe('setFilter', () => {
    it('defaults to "all"', () => {
      expect(service.filter()).toBe('all');
    });

    it('sets filter to "active"', () => {
      service.setFilter('active');
      expect(service.filter()).toBe('active');
    });

    it('sets filter to "completed"', () => {
      service.setFilter('completed');
      expect(service.filter()).toBe('completed');
    });

    it('sets filter back to "all"', () => {
      service.setFilter('completed');
      service.setFilter('all');
      expect(service.filter()).toBe('all');
    });
  });

  // ── filteredTodos (computed) ──────────────────────────────────────────────────

  describe('filteredTodos', () => {
    beforeEach(() => {
      service.add('Active A');
      service.add('Active B');
      service.add('Done C');
      service.toggle(service.filteredTodos()[2].id);
    });

    it('returns all 3 todos for filter "all"', () => {
      service.setFilter('all');
      expect(service.filteredTodos().length).toBe(3);
    });

    it('returns only active todos for filter "active"', () => {
      service.setFilter('active');
      const result = service.filteredTodos();
      expect(result.length).toBe(2);
      expect(result.every((t) => !t.completed)).toBe(true);
    });

    it('returns only completed todos for filter "completed"', () => {
      service.setFilter('completed');
      const result = service.filteredTodos();
      expect(result.length).toBe(1);
      expect(result[0].completed).toBe(true);
    });

    it('returns todos sorted ascending by order', () => {
      service.setFilter('all');
      const orders = service.filteredTodos().map((t) => t.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    });
  });

  // ── computed counts ───────────────────────────────────────────────────────────

  describe('activeCount', () => {
    it('is 0 with no todos', () => {
      expect(service.activeCount()).toBe(0);
    });

    it('counts only incomplete todos', () => {
      service.add('A');
      service.add('B');
      service.toggle(service.filteredTodos()[0].id);
      expect(service.activeCount()).toBe(1);
    });
  });

  describe('completedCount', () => {
    it('is 0 with no todos', () => {
      expect(service.completedCount()).toBe(0);
    });

    it('counts only completed todos', () => {
      service.add('A');
      service.add('B');
      service.toggle(service.filteredTodos()[0].id);
      expect(service.completedCount()).toBe(1);
    });
  });

  describe('totalCount', () => {
    it('is 0 initially', () => {
      expect(service.totalCount()).toBe(0);
    });

    it('counts all todos regardless of status', () => {
      service.add('A');
      service.add('B');
      service.toggle(service.filteredTodos()[0].id);
      expect(service.totalCount()).toBe(2);
    });
  });

  // ── persist (via side-effect) ─────────────────────────────────────────────────

  describe('persist', () => {
    it('serialises todos as JSON to localStorage', () => {
      service.add('Persist me');
      const call = setItemSpy.mock.calls.at(-1)!;
      expect(call[0]).toBe(STORAGE_KEY);
      const parsed: Todo[] = JSON.parse(call[1] as string);
      expect(parsed[0].text).toBe('Persist me');
    });
  });
});
