"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Todo } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface TodoListProps {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

export default function TodoList({ todos, setTodos }: TodoListProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSendSms = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const message = todos
      .map((todo) => `${todo.description} - ${todo.completed ? "Completed" : "Pending"}`)
      .join("\n");

    try {
      const response = await fetch("http://localhost:8001/api/v1/sms/send-sms/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone_number: phoneNumber, message }),
      });

      if (response.ok) {
        alert("SMS sent successfully!");
      } else {
        alert("Failed to send SMS.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An error occurred while sending the SMS.");
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleToggle = async (id: string, completed: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/api/v1/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        setTodos(
          todos.map((todo) =>
            todo._id === id ? { ...todo, completed: !completed } : todo
          )
        );
      } else {
        console.error("Failed to update todo");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(
          `http://localhost:8001/api/v1/todos/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setTodos(todos.filter((todo) => todo._id !== id));
        } else {
          console.error("Failed to delete todo");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>To-do List</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Send SMS
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send To-Do List via SMS</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <button
                onClick={handleSendSms}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo._id}
                className="flex items-center justify-between space-x-2"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo._id, todo.completed)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span
                    className={`${
                      todo.completed ? "text-gray-500 line-through" : ""
                    }`}
                  >
                    {todo.description}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(todo._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no tasks for today. Great job!</p>
        )}
      </CardContent>
    </Card>
  );
}