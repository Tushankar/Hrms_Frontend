import React, { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Eye, X } from "lucide-react";

export const Overviewcards = ({
  cardTitleOne,
  cardTitleTwo,
  cardTitleThree,
}) => {
  const [activeModal, setActiveModal] = useState(null);

  const handleViewClick = (cardKey) => {
    setActiveModal(cardKey);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Sample updates data - exactly 3 updates per card as requested
  const updatesData = {
    card1: [
      { type: 'positive', text: 'New user registration completed', time: '2 hours ago' },
      { type: 'positive', text: 'Profile verification successful', time: '4 hours ago' },
      { type: 'positive', text: 'Welcome email sent', time: '6 hours ago' }
    ],
    card2: [
      { type: 'negative', text: 'Task deadline missed', time: '1 hour ago' },
      { type: 'positive', text: 'Task assigned to team member', time: '3 hours ago' },
      { type: 'negative', text: 'Priority task marked incomplete', time: '5 hours ago' }
    ],
    card3: [
      { type: 'positive', text: 'Document uploaded successfully', time: '30 minutes ago' },
      { type: 'negative', text: 'Document approval pending', time: '2 hours ago' },
      { type: 'positive', text: 'File permission updated', time: '4 hours ago' }
    ]
  };

  // Fixed SVG icons with proper viewBox and dimensions
  const OnboardingIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );

  const TaskManagementIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  );

  const DocumentManagementIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  );

  const cards = [
    {
      title: cardTitleOne || "Onboarding Process",
      subtitle: "Recent updates",
      value: "No Issues",
      change: "+3 updates",
      isPositive: true,
      icon: OnboardingIcon,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      valueColor: "text-gray-900",
      cardKey: "card1"
    },
    {
      title: cardTitleTwo || "Task Management", 
      subtitle: "Updates pending",
      value: "3 Issues",
      change: "-3 updates",
      isPositive: false,
      icon: TaskManagementIcon,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      valueColor: "text-gray-900",
      cardKey: "card2"
    },
    {
      title: cardTitleThree || "Document Management",
      subtitle: "Recent updates",
      value: "Critical Issue",
      change: "+3 updates",
      isPositive: true,
      icon: DocumentManagementIcon,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      valueColor: "text-red-600",
      cardKey: "card3"
    }
  ];

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
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
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
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${card.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={card.iconColor} />
                  </div>
                </div>
                
                <div className="mb-3 sm:mb-4">
                  <p className={`text-lg sm:text-xl md:text-2xl font-bold ${card.valueColor} truncate`}>
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
                    <span className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full truncate ${
                      card.isPositive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
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
                {cards.find(c => c.cardKey === activeModal)?.title} Updates
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Recent activity and changes
              </p>
            </div>
            
            {/* Updates List */}
            <div className="space-y-4">
              {updatesData[activeModal]?.slice(0, 3).map((update, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    update.type === 'positive' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm font-medium">{update.text}</p>
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