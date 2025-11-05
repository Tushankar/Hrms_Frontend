import React from "react";
import {
  Chart as ChartJs,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js/auto";
import { Bar } from "react-chartjs-2";

ChartJs.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const PeakUsage = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      tooltip: {
        titleFont: {
          size: window.innerWidth < 640 ? 11 : 12
        },
        bodyFont: {
          size: window.innerWidth < 640 ? 10 : 11
        },
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '$' + context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#708090',
          font: {
            size: window.innerWidth < 640 ? 9 : window.innerWidth < 1024 ? 10 : 11,
          },
          maxRotation: window.innerWidth < 640 ? 45 : 0,
          minRotation: window.innerWidth < 640 ? 45 : 0,
        }
      },
      y: {
        stacked: true,
        grid: {
          color: '#F0F0F0',
          borderDash: [2, 2],
        },
        border: {
          display: false,
        },
        ticks: {
          display: false, // Hide y-axis labels for cleaner look
        }
      }
    },
    layout: {
      padding: {
        top: window.innerWidth < 640 ? 5 : 10,
        bottom: window.innerWidth < 640 ? 5 : 10,
      }
    }
  };

  const data = {
    labels: window.innerWidth < 640 
      ? ["9A", "10A", "11A", "12P", "1P", "2P", "3P", "4P"]
      : ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"],
    datasets: [
      {
        label: "Base Usage",
        data: [240, 480, 340, 190, 280, 620, 320, 460],
        backgroundColor: '#000000', // Black (bottom)
        borderRadius: window.innerWidth < 640 ? 4 : 8,
        barPercentage: window.innerWidth < 640 ? 0.7 : 0.6,
      },
      {
        label: "Peak Usage",
        data: [100, 200, 200, 100, 150, 300, 130, 200],
        backgroundColor: '#A0A0A0', // Faded black/gray (top)
        borderRadius: window.innerWidth < 640 ? 4 : 8,
        barPercentage: window.innerWidth < 640 ? 0.7 : 0.6,
      }
    ]
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 md:mb-4">
        <div>
          <h3 className="font-[600] font-[Poppins] text-base md:text-lg lg:text-xl text-[#34495E]">
            Productive Hours
          </h3>
        </div>
        <div>
          <p className="text-xs md:text-sm lg:text-base font-[400] font-[Poppins] text-[#505050]">
            <span className="hidden sm:inline">Mondays, 9:00 AM to 11:00 AM.</span>
            <span className="sm:hidden">Mon, 9-11 AM</span>
          </p>
        </div>
      </div>

      <div className="mb-2 md:mb-3">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-xs md:text-sm font-[400] font-[Poppins] text-[#708090] flex items-center">
            <span className="inline-block w-2 h-2 md:w-3 md:h-3 bg-[#000000] rounded-sm mr-1 md:mr-2"></span>
            Base Usage
          </div>
          <div className="text-xs md:text-sm font-[400] font-[Poppins] text-[#708090] flex items-center">
            <span className="inline-block w-2 h-2 md:w-3 md:h-3 bg-[#A0A0A0] rounded-sm mr-1 md:mr-2"></span>
            Peak Usage
          </div>
        </div>
      </div>

      {/* Chart container with responsive height */}
      <div className="flex-1 min-h-[150px] md:min-h-[200px] lg:min-h-[250px] relative">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

export default PeakUsage;