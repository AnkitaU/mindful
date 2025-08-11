"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { GoalWithHabits, Habit } from "@/types";
import { X, Plus } from "lucide-react";

export default function EditHabitsPage() {
  const [goal, setGoal] = useState<GoalWithHabits | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("goal_id");

  useEffect(() => {
    if (!goalId) {
      router.push("/");
      return;
    }

    const fetchGoal = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8001/api/v1/goals/${goalId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGoal(data);
          setHabits(data.habits);
        } else {
          console.error("Failed to fetch goal");
          router.push("/");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        router.push("/");
      }
    };

    fetchGoal();
  }, [goalId, router]);

  const handleHabitChange = (index: number, field: keyof Habit, value: any) => {
    const newHabits = [...habits];
    newHabits[index] = { ...newHabits[index], [field]: value };
    setHabits(newHabits);
  };

  const addHabit = () => {
    if (goalId) {
      setHabits([...habits, { _id: "", description: "", frequency: "daily", goal_id: goalId }]);
    }
  };

  const removeHabit = (index: number) => {
    const newHabits = habits.filter((_, i) => i !== index);
    setHabits(newHabits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !goalId) {
      router.push("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/api/v1/goals/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ habits: habits.map(({ description, frequency }) => ({ description, frequency })) }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        console.error("Failed to update habits");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  if (!goal) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center">Edit Habits for Your Goal</h2>
        <div>
          <label className="text-lg font-semibold">Goal:</label>
          <p className="text-xl p-2 bg-gray-100 rounded-md">{goal.description}</p>
        </div>

        <div>
          <label className="text-lg font-semibold">Habits:</label>
          {habits.map((habit, index) => (
            <div key={index} className="flex items-center space-x-2 my-2">
              <Input
                type="text"
                placeholder="Habit description"
                value={habit.description}
                onChange={(e) => handleHabitChange(index, "description", e.target.value)}
                className="flex-grow"
              />
              <select
                value={habit.frequency}
                onChange={(e) => handleHabitChange(index, "frequency", e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeHabit(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" onClick={addHabit} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </div>

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </div>
  );
}