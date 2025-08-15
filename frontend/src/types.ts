export interface Habit {
  _id: string;
  description: string;
  frequency: string;
  goal_id: string;
}

export interface Goal {
  _id: string;
  description: string;
  user_id: string;
  category: string;
}

export interface GoalWithHabits extends Goal {
  habits: Habit[];
  completion_date?: string;
  progress?: number;
  status?: string;
}
export interface Todo {
  _id: string;
  description: string;
  completed: boolean;
  due_date: string;
}