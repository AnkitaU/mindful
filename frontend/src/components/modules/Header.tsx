"use client";

import { GoalWithHabits, Todo } from "@/types";

interface HeaderProps {
  goals: GoalWithHabits[];
  todos: Todo[];
}

export default function Header({ goals, todos }: HeaderProps) {
  const totalHabits = goals.reduce((acc, goal) => acc + goal.habits.length, 0);
  const completedHabits = todos.filter(
    (todo) => todo.completed && todo.habit_id
  ).length;
  const remainingHabits = totalHabits - completedHabits;

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold">Habit Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Keep track of your habits and reach your goals.
        </p>
      </div>
      <div className="flex space-x-4">
        <div className="text-center">
          <p className="text-3xl font-bold">{totalHabits}</p>
          <p className="text-gray-500 dark:text-gray-400">Total Habits</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-500">{completedHabits}</p>
          <p className="text-gray-500 dark:text-gray-300">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-red-500">{remainingHabits}</p>
          <p className="text-gray-500 dark:text-gray-400">Remaining</p>
        </div>
      </div>
    </div>
  );
}