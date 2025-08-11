"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Todo } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function TodoList() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
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

    if (isAuthenticated) {
      fetchTodos();
    }
  }, [isAuthenticated, router]);

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
      <CardHeader>
        <CardTitle>To-do List</CardTitle>
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