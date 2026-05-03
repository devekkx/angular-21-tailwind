import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoInput } from './todo-input';

describe('TodoInput', () => {
  let fixture: ComponentFixture<TodoInput>;
  let component: TodoInput;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TodoInput] }).compileComponents();
    fixture = TestBed.createComponent(TodoInput);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  // ── rendering ─────────────────────────────────────────────────────────────────

  it('renders the text input', () => {
    expect(el.querySelector('input[type="text"]')).toBeTruthy();
  });

  it('renders the toggle-all button', () => {
    expect(el.querySelector('button[aria-label="Toggle all todos"]')).toBeTruthy();
  });

  it('does not show the Add button when input is empty', () => {
    expect(el.querySelector('button[aria-label="Add todo"]')).toBeNull();
  });

  it('shows the Add button when the input has text', async () => {
    const input = el.querySelector<HTMLInputElement>('input[type="text"]')!;
    input.value = 'Buy milk';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.querySelector('button[aria-label="Add todo"]')).toBeTruthy();
  });

  // ── submit ────────────────────────────────────────────────────────────────────

  it('emits add with the trimmed text on form submit', async () => {
    const emitted: string[] = [];
    component.add.subscribe((v) => emitted.push(v));

    const input = el.querySelector<HTMLInputElement>('input[type="text"]')!;
    input.value = '  Buy milk  ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual(['Buy milk']);
  });

  it('clears the input after a successful submission', async () => {
    const input = el.querySelector<HTMLInputElement>('input[type="text"]')!;
    input.value = 'Task';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(input.value).toBe('');
  });

  it('does not emit add when input is empty', () => {
    const emitted: string[] = [];
    component.add.subscribe((v) => emitted.push(v));
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(emitted).toHaveLength(0);
  });

  it('does not emit add when input is whitespace-only', async () => {
    const emitted: string[] = [];
    component.add.subscribe((v) => emitted.push(v));

    const input = el.querySelector<HTMLInputElement>('input[type="text"]')!;
    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(emitted).toHaveLength(0);
  });

  // ── toggleAll ─────────────────────────────────────────────────────────────────

  it('emits toggleAll when the toggle-all button is clicked', () => {
    let toggled = false;
    component.toggleAll.subscribe(() => (toggled = true));
    el.querySelector<HTMLButtonElement>('button[aria-label="Toggle all todos"]')!.click();
    expect(toggled).toBe(true);
  });
});
