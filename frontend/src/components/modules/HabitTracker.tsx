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
    router.push(`/new-goal?goal_id=${goal._id}&description=${encodeURIComponent(goal.description)}`);
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
      const response = await fetch(`http://localhost:8000/api/v1/goals/${goalToDelete}`, {
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
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{goal.description}</CardTitle>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(goal._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
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