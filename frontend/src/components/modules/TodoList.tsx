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
        const response = await fetch("http://localhost:8000/api/v1/todos/", {
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
      const response = await fetch(`http://localhost:8000/api/v1/todos/${id}`, {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>To-do List</CardTitle>
      </CardHeader>
      <CardContent>
        {todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo._id} className="flex items-center space-x-2">
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