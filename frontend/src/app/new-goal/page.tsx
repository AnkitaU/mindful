"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function NewGoalPage() {
  const [goal, setGoal] = useState("");
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [goalId, setGoalId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("goal_id");
    const description = searchParams.get("description");
    if (id) {
      setGoalId(id);
    }
    if (description) {
      setGoal(description);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const method = goalId ? "PUT" : "POST";
    const url = goalId ? `/api/v1/goals/${goalId}` : "/api/v1/goals";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: goal }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        console.error(`Failed to ${goalId ? 'update' : 'create'} goal`);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">
          {goalId ? "Edit Your Goal" : "Set a New Goal"}
        </h2>
        <Input
          type="text"
          placeholder="What's your goal?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <Button type="submit" className="w-full">
          {goalId ? "Update Goal" : "Create Habits"}
        </Button>
      </form>
    </div>
  );
}