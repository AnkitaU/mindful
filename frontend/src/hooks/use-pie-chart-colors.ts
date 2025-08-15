import { useTheme } from "next-themes";

export const usePieChartColors = () => {
  const { theme } = useTheme();

  const colors =
    theme === "dark"
      ? ["#9a94caff", "#2f05c8ff", "#a7a7a7ff"]
      : ["#1616a3ff", "#010059ff", "#000000ff"];

  return colors;
};