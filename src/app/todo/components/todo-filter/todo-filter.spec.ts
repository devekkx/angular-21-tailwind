import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoFilter } from './todo-filter';
import { FilterType } from '../../models/todo.model';

describe('TodoFilter', () => {
  let fixture: ComponentFixture<TodoFilter>;
  let component: TodoFilter;
  let el: HTMLElement;

  function setInputs(current: FilterType = 'all', activeCount = 0, completedCount = 0): void {
    fixture.componentRef.setInput('current', current);
    fixture.componentRef.setInput('activeCount', activeCount);
    fixture.componentRef.setInput('completedCount', completedCount);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TodoFilter] }).compileComponents();
    fixture = TestBed.createComponent(TodoFilter);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    setInputs();
  });

  // ── rendering ─────────────────────────────────────────────────────────────────

  it('renders All, Active and Completed filter buttons', () => {
    const buttons = el.querySelectorAll('nav button');
    const labels = Array.from(buttons).map((b) => b.textContent?.trim());
    expect(labels).toEqual(['All', 'Active', 'Completed']);
  });

  it('shows the active item count', () => {
    setInputs('all', 3, 0);
    expect(el.textContent).toContain('3');
  });

  it('uses singular "item" for count of 1', () => {
    setInputs('all', 1, 0);
    expect(el.textContent).toContain('1 item');
    expect(el.textContent).not.toContain('1 items');
  });

  it('uses plural "items" for count other than 1', () => {
    setInputs('all', 2, 0);
    expect(el.textContent).toContain('2 items');
  });

  it('hides "Clear completed" when completedCount is 0', () => {
    setInputs('all', 0, 0);
    const btn = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Clear completed',
    );
    expect(btn).toBeUndefined();
  });

  it('shows "Clear completed" when completedCount > 0', () => {
    setInputs('all', 0, 2);
    const btn = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Clear completed',
    );
    expect(btn).toBeTruthy();
  });

  // ── filterChange output ───────────────────────────────────────────────────────

  it('emits filterChange with "active" when Active button is clicked', () => {
    const emitted: FilterType[] = [];
    component.filterChange.subscribe((v) => emitted.push(v));
    const buttons = el.querySelectorAll<HTMLButtonElement>('nav button');
    buttons[1].click();
    expect(emitted).toEqual(['active']);
  });

  it('emits filterChange with "completed" when Completed button is clicked', () => {
    const emitted: FilterType[] = [];
    component.filterChange.subscribe((v) => emitted.push(v));
    const buttons = el.querySelectorAll<HTMLButtonElement>('nav button');
    buttons[2].click();
    expect(emitted).toEqual(['completed']);
  });

  it('emits filterChange with "all" when All button is clicked', () => {
    const emitted: FilterType[] = [];
    component.filterChange.subscribe((v) => emitted.push(v));
    const buttons = el.querySelectorAll<HTMLButtonElement>('nav button');
    buttons[0].click();
    expect(emitted).toEqual(['all']);
  });

  // ── clearCompleted output ─────────────────────────────────────────────────────

  it('emits clearCompleted when the Clear completed button is clicked', () => {
    setInputs('all', 0, 1);
    let emitted = false;
    component.clearCompleted.subscribe(() => (emitted = true));
    const btn = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Clear completed',
    )! as HTMLButtonElement;
    btn.click();
    expect(emitted).toBe(true);
  });

  // ── btnClass ──────────────────────────────────────────────────────────────────

  type FilterComp = { btnClass(v: FilterType): string };

  it('btnClass returns active style for the current filter', () => {
    setInputs('active');
    const cls = (component as unknown as FilterComp).btnClass('active');
    expect(cls).toContain('bg-violet-100');
    expect(cls).toContain('text-violet-700');
  });

  it('btnClass returns inactive style for non-current filters', () => {
    setInputs('all');
    const cls = (component as unknown as FilterComp).btnClass('active');
    expect(cls).not.toContain('bg-violet-100');
    expect(cls).toContain('text-slate-500');
  });

  it('btnClass returns active style for "all" when current is "all"', () => {
    setInputs('all');
    const cls = (component as unknown as FilterComp).btnClass('all');
    expect(cls).toContain('bg-violet-100');
  });

  it('btnClass returns active style for "completed" when current is "completed"', () => {
    setInputs('completed');
    const cls = (component as unknown as FilterComp).btnClass('completed');
    expect(cls).toContain('bg-violet-100');
  });

  // ── aria-pressed on filter buttons ───────────────────────────────────────────

  it('sets aria-pressed="true" on the active filter button', () => {
    setInputs('active');
    const buttons = el.querySelectorAll<HTMLButtonElement>('nav button');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('sets aria-pressed="false" on inactive filter buttons', () => {
    setInputs('active');
    const buttons = el.querySelectorAll<HTMLButtonElement>('nav button');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[2].getAttribute('aria-pressed')).toBe('false');
  });
});
