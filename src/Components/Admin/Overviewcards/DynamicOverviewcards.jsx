import React, { useState, useEffect } from "react";
import { ArrowDownRight, ArrowUpRight, Eye, X } from "lucide-react";
import axios from "axios";

export const DynamicOverviewcards = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [statistics, setStatistics] = useState({
    activeCount: 0,
    inactiveCount: 0,
    onboardingCount: 0,
    onboardingIssues: 0,
    inactiveIssues: 0,
    recentUpdates: 3,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/hr/employee-statistics`);
      if (response.data.status === "Success") {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error("Error fetching employee statistics:", error);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (cardKey) => {
    setActiveModal(cardKey);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Sample updates data - exactly 3 updates per card as requested
  const updatesData = {
    card1: [
      {
        type: "positive",
        text: "New employee onboarded successfully",
        time: "2 hours ago",
      },
      {
        type: "positive",
        text: "Employee profile updated",
        time: "4 hours ago",
      },
      {
        type: "positive",
        text: "Performance review completed",
        time: "6 hours ago",
      },
    ],
    card2: [
      {
        type: "negative",
        text: "Onboarding document pending review",
        time: "1 hour ago",
      },
      {
        type: "positive",
        text: "New application submitted",
        time: "3 hours ago",
      },
      {
        type: "negative",
        text: "Background check incomplete",
        time: "5 hours ago",
      },
    ],
    card3: [
      {
        type: "positive",
        text: "Employee status updated",
        time: "30 minutes ago",
      },
      {
        type: "negative",
        text: "Account deactivation pending",
        time: "2 hours ago",
      },
      {
        type: "positive",
        text: "Profile maintenance completed",
        time: "4 hours ago",
      },
    ],
  };

  // Fixed SVG icons with proper viewBox and dimensions
  const ActiveEmployeesIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
      fill="currentColor"
    >
      <path d="M16 4c0-1.11-.89-2-2-2H10c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-4V4zm-2 0v2H10V4h4zM4 8h16v10H4V8zm8 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );

  const OnboardingIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );

  const InactiveEmployeesIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );

  const cards = [
    {
      title: "Active Employees",
      subtitle: "Recent updates",
      value: loading ? "..." : statistics.activeCount.toString(),
      change: `+${statistics.recentUpdates} updates`,
      isPositive: true,
      icon: ActiveEmployeesIcon,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      valueColor: "text-gray-900",
      cardKey: "card1",
    },
    {
      title: "Onboarding",
      subtitle: "Updates pending",
      value: loading ? "..." : statistics.onboardingCount.toString(),
      change: `-${statistics.onboardingIssues} updates`,
      isPositive: false,
      icon: OnboardingIcon,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      valueColor: "text-gray-900",
      cardKey: "card2",
    },
    {
      title: "Inactive",
      subtitle: "Recent updates",
      value: loading ? "..." : statistics.inactiveCount.toString(),
      change: `+${statistics.recentUpdates} updates`,
      isPositive: true,
      icon: InactiveEmployeesIcon,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      valueColor: "text-gray-900",
      cardKey: "card3",
    },
  ];

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={fetchStatistics}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Container with responsive grid */}
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {cards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all duration-200 h-full min-w-0"
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-2 min-w-0">
                    <h3 className="text-gray-700 font-semibold text-xs sm:text-sm md:text-base truncate">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-xs md:text-sm mt-1 truncate">
                      {card.subtitle}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${card.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <IconComponent className={card.iconColor} />
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <p
                    className={`text-lg sm:text-xl md:text-2xl font-bold ${card.valueColor} truncate`}
                  >
                    {card.value}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {card.isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <span
                      className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full truncate ${
                        card.isPositive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {card.change}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewClick(card.cardKey)}
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-[#1F3A93] transition-colors font-medium flex-shrink-0 ml-2"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">View</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 lg:p-8 z-10">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {cards.find((c) => c.cardKey === activeModal)?.title} Updates
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Recent activity and changes
              </p>
            </div>

            {/* Updates List */}
            <div className="space-y-4">
              {updatesData[activeModal]?.slice(0, 3).map((update, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                      update.type === "positive" ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm font-medium">
                      {update.text}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{update.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="w-full py-3 px-4 bg-[#1F3A93] text-white rounded-lg hover:bg-[#153073] transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
