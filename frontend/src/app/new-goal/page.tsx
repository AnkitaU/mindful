"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function NewGoalPage() {
  const [goal, setGoal] = useState("");
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      // This should not happen if isAuthenticated is true, but as a safeguard
      router.push("/login");
      return;
    }
    try {
      const response = await fetch("/api/v1/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: goal }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        // Handle error
        console.error("Failed to create goal");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Set a New Goal</h2>
        <Input
          type="text"
          placeholder="What's your goal?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Create Habits
        </Button>
      </form>
    </div>
  );
}