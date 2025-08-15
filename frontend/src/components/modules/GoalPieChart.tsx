"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { usePieChartColors } from "@/hooks/use-pie-chart-colors";

const GoalPieChart = () => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const { isAuthenticated } = useAuth();
  const COLORS = usePieChartColors();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8001/api/v1/goals/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const stats = await response.json();
          const chartData = Object.entries(stats).map(([name, value]) => ({
            name,
            value: value as number,
          }));
          setData(chartData);
        }
      } catch (error) {
        console.error("Failed to fetch goal stats:", error);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (data.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xs p-4 pb-0 space-y-4"
    >
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          cx={125}
          cy={125}
          labelLine={false}
          outerRadius={100}
          fill="#a4a2ccff"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        {/* <Legend /> */}
      </PieChart>
    </motion.div>
  );
};

export default GoalPieChart;