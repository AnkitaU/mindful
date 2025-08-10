"use client";

import { GoalWithHabits } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HabitTrackerProps {
  goal: GoalWithHabits;
}

export default function HabitTracker({ goal }: HabitTrackerProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{goal.description}</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold">Habits:</h3>
        <ul className="list-disc pl-5 mt-2">
          {goal.habits.map((habit) => (
            <li key={habit._id}>
              {habit.description} ({habit.frequency})
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}