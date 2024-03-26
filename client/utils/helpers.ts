import axiosInstance from "./axiosInstance";

export const fetchDashboardData = async (endpoint: string) => {
  try {
    const { data } = await axiosInstance.get(`dashboard/${endpoint}`);
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

export const generateRandomChartColor = (alpha = 0.6, dark = false) => {
  const minBrightness = dark ? 0 : 64;
  const maxBrightness = dark ? 127 : 255;
  const r =
    Math.floor(Math.random() * (maxBrightness - minBrightness + 1)) +
    minBrightness;
  const g =
    Math.floor(Math.random() * (maxBrightness - minBrightness + 1)) +
    minBrightness;
  const b =
    Math.floor(Math.random() * (maxBrightness - minBrightness + 1)) +
    minBrightness;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
