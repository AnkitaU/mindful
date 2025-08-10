"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { GoalWithHabits } from "@/types";
import HabitTracker from "@/components/modules/HabitTracker";
import TodoList from "@/components/modules/TodoList";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithHabits[]>([]);
  const [activeTab, setActiveTab] = useState("goals");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const hasOverflow = container.scrollWidth > container.clientWidth;
      setIsScrollable(hasOverflow);
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        hasOverflow &&
          container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [goals]);

  const handleGoalDeleted = (goalId: string) => {
    setGoals((prevGoals) => prevGoals.filter((goal) => goal._id !== goalId));
  };

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
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
        <div className="flex items-center space-x-4">
          <h1
            className={`text-4xl font-bold cursor-pointer ${
              activeTab === "goals" ? "text-black" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("goals")}
          >
            Goals
          </h1>
          <h1
            className={`text-4xl font-bold cursor-pointer ${
              activeTab === "todos" ? "text-black" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("todos")}
          >
            To-do List
          </h1>
        </div>
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

      {activeTab === "goals" && (
        <>
          <Button onClick={() => router.push("/new-goal")}>
            Set a New Goal
          </Button>
          <div className="mt-8 w-full max-w-6xl relative">
            {isScrollable && showLeftArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto space-x-4 p-4 hide-scrollbar"
              onScroll={handleScroll}
            >
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <div key={goal._id} className="flex-shrink-0 w-80">
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
            {isScrollable && showRightArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
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