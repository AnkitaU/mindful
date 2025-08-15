"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { GoalWithHabits } from "@/types";
import { usePieChartColors } from "@/hooks/use-pie-chart-colors";

interface HabitBarChartProps {
  goals: GoalWithHabits[];
}

const HabitBarChart = ({ goals }: HabitBarChartProps) => {
  const COLORS = usePieChartColors();

  const data = useMemo(() => {
    const habitCounts = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      "one-time": 0,
    };

    goals.forEach((goal) => {
      goal.habits.forEach((habit) => {
        if (habit.frequency in habitCounts) {
          habitCounts[habit.frequency as keyof typeof habitCounts]++;
        }
      });
    });

    return [
      { name: "Daily", value: habitCounts.daily },
      { name: "Weekly", value: habitCounts.weekly },
      { name: "Monthly", value: habitCounts.monthly },
      { name: "One-Time", value: habitCounts["one-time"] },
    ];
  }, [goals]);

  if (data.every((d) => d.value === 0)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-xs pr-4 pt-0 space-y-4"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default HabitBarChart;