"use client";

import { useState } from "react";
import { GoalWithHabits } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface HabitTrackerProps {
  goal: GoalWithHabits;
  onGoalDeleted: (goalId: string) => void;
}

export default function HabitTracker({ goal, onGoalDeleted }: HabitTrackerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  const handleEdit = () => {
    router.push(`/edit-habits?goal_id=${goal._id}`);
  };

  const handleDeleteClick = (goalId: string) => {
    setGoalToDelete(goalId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a goal.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/api/v1/goals/${goalToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Goal deleted successfully.",
        });
        onGoalDeleted(goalToDelete);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to delete goal.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsModalOpen(false);
      setGoalToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-card p-6 rounded-lg text-black dark:text-white animated-border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{goal.description}</h2>
            {goal.completion_date && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Due: {new Date(goal.completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Pencil className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(goal._id)}>
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${goal.progress || 0}%` }}
          ></div>
        </div>

        <h3 className="font-semibold mb-2">Habits:</h3>
        <ul className="space-y-2">
          {goal.habits.map((habit) => (
            <li key={habit._id} className="flex items-center">
              <span className="h-2 w-2 bg-primary rounded-full mr-3"></span>
              <span>
                {habit.description} ({habit.frequency})
              </span>
            </li>
          ))}
        </ul>
        {goal.status === 'completed' && (
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">#{goal._id.slice(-6)}</p>
                <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">Completed</span>
            </div>
        )}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your goal and all associated habits.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}