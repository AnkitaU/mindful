"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoalWithHabits, Todo } from "@/types";
import HabitTracker from "@/components/modules/HabitTracker";
import TodoList from "@/components/modules/TodoList";
import { ThemeSwitcher } from "@/components/modules/ThemeSwitcher";
import Filters from "@/components/modules/Filters";
import GoalPieChart from "@/components/modules/GoalPieChart";
import TopBar from "@/components/modules/TopBar";
import AIAssist from "@/components/modules/AIAssist";

export default function DashboardPage() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithHabits[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [daily, setDaily] = useState(false);
  const [weekly, setWeekly] = useState(false);
  const [monthly, setMonthly] = useState(false);
  const filteredGoals = goals
    .map(goal => {
      const filteredHabits = goal.habits.filter(habit => {
        if (daily && habit.frequency === 'daily') return true;
        if (weekly && habit.frequency === 'weekly') return true;
        if (monthly && habit.frequency === 'monthly') return true;
        if (!daily && !weekly && !monthly) return true;
        return false;
      });

      return {
        ...goal,
        habits: filteredHabits,
      };
    })
    .filter(goal => goal.habits.length > 0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchGoals = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const response = await fetch("http://localhost:8001/api/v1/goals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setGoals(data);
        } else {
          console.error("Failed to fetch goals");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    if (isAuthenticated) {
      fetchGoals();
      fetchTodos();
    }
  }, [isAuthenticated, router]);

  const fetchTodos = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const response = await fetch("http://localhost:8001/api/v1/todos/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      } else {
        console.error("Failed to fetch todos");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleGoalDeleted = (goalId: string) => {
    setGoals((prevGoals) => prevGoals.filter((goal) => goal._id !== goalId));
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="w-full p-8">
        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main>
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="bg-card p-6 rounded-lg col-span-2 animated-border">
                  <h2 className="text-lg font-semibold mb-2">Habits</h2>
                  <div className="flex items-center justify-between">
                    <p className="text-7xl font-bold">{todos.length}</p>
                    <p className="text-7xl font-bold text-muted-foreground">{todos.filter(todo => !todo.completed).length}</p>
                  </div>
                </div>
                <div className="bg-card p-6 rounded-lg animated-border">
                  <h2 className="text-lg font-semibold mb-2">Completed today</h2>
                  <div className="flex items-center justify-between">
                    <p className="text-7xl font-bold">{todos.filter(todo => todo.completed).length}</p>
                    <div className="bg-green-500 p-2 rounded-full">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="w-1/5">
                  <Filters
                    daily={daily}
                    setDaily={setDaily}
                    weekly={weekly}
                    setWeekly={setWeekly}
                    monthly={monthly}
                    setMonthly={setMonthly}
                  />
                  <GoalPieChart />
                </div>
                <div className="w-3/5">
                  {filteredGoals.length > 0 ? (
                    <div className="grid grid-cols-2 gap-8">
                      {filteredGoals.map((goal) => (
                        <HabitTracker
                          key={goal._id}
                          goal={goal}
                          onGoalDeleted={handleGoalDeleted}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full text-center bg-card p-6 rounded-lg animated-border">
                      <p>You haven't set any goals yet. Get started!</p>
                      <Button
                        onClick={() => router.push("/new-goal")}
                        className="mt-4"
                      >
                        Set a New Goal
                      </Button>
                    </div>
                  )}
                </div>
                <div className="w-1/4">
                  <AIAssist />
                </div>
              </div>
            </>
          )}
          {activeTab === 'todos' && (
            <div className="mt-8 w-full max-w-6xl">
              <TodoList todos={todos} setTodos={setTodos} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}