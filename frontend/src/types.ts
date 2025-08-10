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
}

export interface GoalWithHabits extends Goal {
  habits: Habit[];
}
export interface Todo {
  _id: string;
  description: string;
  completed: boolean;
  due_date: string;
}