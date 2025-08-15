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
import HabitBarChart from "@/components/modules/HabitBarChart";
import TopBar from "@/components/modules/TopBar";
import AIAssist from "@/components/modules/AIAssist";
import NewGoal from "@/components/modules/NewGoal";

export default function DashboardPage() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithHabits[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [daily, setDaily] = useState(false);
  const [weekly, setWeekly] = useState(false);
  const [monthly, setMonthly] = useState(false);
  const [oneTime, setOneTime] = useState(false);
  const filteredGoals = goals
    .map((goal) => {
      const filteredHabits = goal.habits.filter((habit) => {
        if (daily && habit.frequency === "daily") return true;
        if (weekly && habit.frequency === "weekly") return true;
        if (monthly && habit.frequency === "monthly") return true;
        if (oneTime && habit.frequency === "one-time") return true;
        if (!daily && !weekly && !monthly && !oneTime) return true;
        return false;
      });

      return {
        ...goal,
        habits: filteredHabits,
      };
    })
    .filter((goal) => goal.habits.length > 0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGoals();
      fetchTodos();
    }
  }, [isAuthenticated, router]);

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
      <div className="w-full p-8 flex flex-col">
        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-grow">
          <div className="flex space-x-4 h-full">
            <div className="w-1/5">
              <Filters
                daily={daily}
                setDaily={setDaily}
                weekly={weekly}
                setWeekly={setWeekly}
                monthly={monthly}
                setMonthly={setMonthly}
                oneTime={oneTime}
                setOneTime={setOneTime}
              />
              <GoalPieChart />
              <HabitBarChart goals={goals} />
            </div>
            <div className="w-3/5">
              {activeTab === "dashboard" && (
                <>
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
                        onClick={() => setActiveTab("new-goal")}
                        className="mt-4"
                      >
                        Set a New Goal
                      </Button>
                    </div>
                  )}
                </>
              )}
              {activeTab === "todos" && (
                <div className="flex h-full items-start justify-center">
                  <div className="w-full max-w-4xl">
                    <TodoList todos={todos} setTodos={setTodos} />
                  </div>
                </div>
              )}
              {activeTab === "new-goal" && (
                <NewGoal
                  setActiveTab={setActiveTab}
                  onGoalCreated={fetchGoals}
                />
              )}
            </div>
            <div className="w-1/4 h-full">
              <AIAssist setActiveTab={setActiveTab} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}