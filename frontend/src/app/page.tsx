"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoalWithHabits } from "@/types";
import HabitTracker from "@/components/modules/HabitTracker";
import TodoList from "@/components/modules/TodoList";
import { ThemeSwitcher } from "@/components/modules/ThemeSwitcher";

export default function DashboardPage() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithHabits[]>([]);
  const [activeTab, setActiveTab] = useState("goals");

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
    }
  }, [isAuthenticated, router]);

  const handleGoalDeleted = (goalId: string) => {
    setGoals((prevGoals) => prevGoals.filter((goal) => goal._id !== goalId));
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full flex justify-between items-center mb-8">
        <div className="flex items-center border border-gray-300 rounded-full p-1">
          <button
            className={`px-6 py-2 rounded-full text-lg font-semibold ${
              activeTab === "goals"
                ? "bg-gray-800 text-white"
                : "bg-transparent text-gray-800"
            }`}
            onClick={() => setActiveTab("goals")}
          >
            Goals
          </button>
          <div className="border-l border-gray-300 h-6 mx-1"></div>
          <button
            className={`px-6 py-2 rounded-full text-lg font-semibold ${
              activeTab === "todos"
                ? "bg-gray-800 text-white"
                : "bg-transparent text-gray-800"
            }`}
            onClick={() => setActiveTab("todos")}
          >
            To-do List
          </button>
        </div>
        <div className="flex items-center">
          <ThemeSwitcher />
          <span className="ml-4 mr-4">
            Welcome, <span className="font-bold">{user?.email}</span>
          </span>
          <Button
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {activeTab === "goals" && (
        <>
          <Button onClick={() => router.push("/new-goal")}>
            Set a New Goal
          </Button>
          <div className="mt-8 w-full" style={{ width: "85%" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <div key={goal._id}>
                    <HabitTracker
                      goal={goal}
                      onGoalDeleted={handleGoalDeleted}
                    />
                  </div>
                ))
              ) : (
                <div className="w-full text-center">
                  <p>You haven't set any goals yet. Get started!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "todos" && (
        <div className="mt-8 w-full max-w-6xl">
          <TodoList />
        </div>
      )}
    </div>
  );
}