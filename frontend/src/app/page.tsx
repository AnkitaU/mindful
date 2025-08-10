"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoalWithHabits } from "@/types";
import HabitTracker from "@/components/modules/HabitTracker";

export default function DashboardPage() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithHabits[]>([]);

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
        const response = await fetch("http://localhost:8000/api/v1/goals", {
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
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div>
          <span className="mr-4">
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

      <Button onClick={() => router.push("/new-goal")}>Set a New Goal</Button>

      <div className="mt-8 w-full max-w-4xl">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <HabitTracker
              key={goal._id}
              goal={goal}
              onGoalDeleted={handleGoalDeleted}
            />
          ))
        ) : (
          <p>You haven't set any goals yet. Get started!</p>
        )}
      </div>
    </div>
  );
}