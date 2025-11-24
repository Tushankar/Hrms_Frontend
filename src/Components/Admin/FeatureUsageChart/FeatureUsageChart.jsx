import React, { useState } from "react";
import {
  Chart as ChartJs,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js/auto";
import { Line } from "react-chartjs-2";

ChartJs.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const FeatureUsageChart = () => {
  const [timeFilter, setTimeFilter] = useState("Week");

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: window.innerWidth < 640 ? 10 : window.innerWidth < 1024 ? 12 : 14
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        titleFont: {
          size: window.innerWidth < 640 ? 11 : 12
        },
        bodyFont: {
          size: window.innerWidth < 640 ? 10 : 11
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 10 : window.innerWidth < 1024 ? 11 : 12
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 10 : window.innerWidth < 1024 ? 11 : 12
          },
          // Format large numbers on mobile
          callback: function(value) {
            if (window.innerWidth < 640 && value >= 1000) {
              return (value / 1000) + 'k';
            }
            return value;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    elements: {
      line: {
        borderWidth: window.innerWidth < 640 ? 1.5 : 2
      },
      point: {
        radius: window.innerWidth < 640 ? 2 : 3,
        hoverRadius: window.innerWidth < 640 ? 4 : 5
      }
    }
  };

  // Different data configurations for each time period
  const getChartData = () => {
    switch (timeFilter) {
      case "Day":
        return {
          labels: window.innerWidth < 640 
            ? ["12A", "4A", "8A", "12P", "4P", "8P", "12A"]
            : ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "12 AM"],
          datasets: [
            {
              label: "Document uploads",
              data: [5, 2, 25, 45, 38, 22, 8],
              borderColor: "#E74C3C",
              backgroundColor: "#E74C3C",
              tension: 0,
            },
            {
              label: "Task Assignments",
              data: [3, 1, 18, 52, 41, 28, 12],
              borderColor: "#F39C12",
              backgroundColor: "#F39C12",
              tension: 0,
            },
            {
              label: "Task Creation",
              data: [8, 4, 22, 38, 35, 19, 6],
              borderColor: "#2ECC71",
              backgroundColor: "#2ECC71",
              tension: 0,
            },
          ],
        };
      
      case "Week":
        return {
          labels: window.innerWidth < 640 
            ? ["M", "T", "W", "T", "F", "S", "S"]
            : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Document uploads",
              data: [230, 260, 150, 170, 250, 280, 300],
              borderColor: "#E74C3C",
              backgroundColor: "#E74C3C",
              tension: 0,
            },
            {
              label: "Task Assignments",
              data: [200, 270, 180, 290, 300, 150, 162],
              borderColor: "#F39C12",
              backgroundColor: "#F39C12",
              tension: 0,
            },
            {
              label: "Task Creation",
              data: [150, 200, 250, 170, 280, 120, 160],
              borderColor: "#2ECC71",
              backgroundColor: "#2ECC71",
              tension: 0,
            },
          ],
        };
      
      case "Month":
        return {
          labels: window.innerWidth < 640 
            ? ["W1", "W2", "W3", "W4"]
            : ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Document uploads",
              data: [1540, 1820, 1680, 1920],
              borderColor: "#E74C3C",
              backgroundColor: "#E74C3C",
              tension: 0,
            },
            {
              label: "Task Assignments",
              data: [1480, 1950, 1620, 1780],
              borderColor: "#F39C12",
              backgroundColor: "#F39C12",
              tension: 0,
            },
            {
              label: "Task Creation",
              data: [1330, 1680, 1520, 1850],
              borderColor: "#2ECC71",
              backgroundColor: "#2ECC71",
              tension: 0,
            },
          ],
        };
      
      case "Quarter":
        return {
          labels: ["Jan", "Feb", "Mar"],
          datasets: [
            {
              label: "Document uploads",
              data: [6200, 7100, 6800],
              borderColor: "#E74C3C",
              backgroundColor: "#E74C3C",
              tension: 0,
            },
            {
              label: "Task Assignments",
              data: [5800, 6900, 7200],
              borderColor: "#F39C12",
              backgroundColor: "#F39C12",
              tension: 0,
            },
            {
              label: "Task Creation",
              data: [5500, 6200, 6600],
              borderColor: "#2ECC71",
              backgroundColor: "#2ECC71",
              tension: 0,
            },
          ],
        };
      
      case "Year":
        return {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [
            {
              label: "Document uploads",
              data: [20100, 22500, 21800, 24200],
              borderColor: "#E74C3C",
              backgroundColor: "#E74C3C",
              tension: 0,
            },
            {
              label: "Task Assignments",
              data: [19900, 21700, 23100, 22800],
              borderColor: "#F39C12",
              backgroundColor: "#F39C12",
              tension: 0,
            },
            {
              label: "Task Creation",
              data: [18300, 20500, 21200, 22900],
              borderColor: "#2ECC71",
              backgroundColor: "#2ECC71",
              tension: 0,
            },
          ],
        };
      
      default:
        return getChartData();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 md:mb-4">
        <h3 className="font-[Poppins] font-[600] text-[#34495E] text-base md:text-lg lg:text-xl">
          Feature Usage
        </h3>
        <div>
          <select 
            className="border border-[#34495E] rounded-full px-3 md:px-4 lg:px-5 py-1 md:py-1.5 outline-none text-[#34495E] text-xs md:text-sm lg:text-base cursor-pointer hover:border-[#1F3A93] transition-colors"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="Day" className="font-[Poppins] font-[400] text-[#34495E]">
              Day
            </option>
            <option value="Week" className="font-[Poppins] font-[400] text-[#34495E]">
              Week
            </option>
            <option value="Month" className="font-[Poppins] font-[400] text-[#34495E]">
              Month
            </option>
            <option value="Quarter" className="font-[Poppins] font-[400] text-[#34495E]">
              Quarter
            </option>
            <option value="Year" className="font-[Poppins] font-[400] text-[#34495E]">
              Year
            </option>
          </select>
        </div>
      </div>
      
      {/* Chart container with responsive height */}
      <div className="flex-1 min-h-[200px] md:min-h-[250px] lg:min-h-[300px] relative">
        <Line options={options} data={getChartData()} />
      </div>
    </div>
  );
};

export default FeatureUsageChart;