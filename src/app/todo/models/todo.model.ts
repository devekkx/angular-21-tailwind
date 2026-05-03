export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  createdAt: number;
}

export type FilterType = 'all' | 'active' | 'completed';
