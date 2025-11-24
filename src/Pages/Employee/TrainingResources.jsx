import React from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { Overviewcards } from "../../Components/Admin/Overviewcards/Overviewcards";
import { Search, BookOpen, Filter, TrendingUp, Clock, CheckCircle, ChevronRight } from "lucide-react";

export const TrainingResources = () => {
  return (
    <>
      <Layout>
        <div className="w-full h-full bg-gray-50 min-h-screen">
          <Navbar />

          {/* Mobile Header - For mobile and all tablets */}
          <div className="lg:hidden sticky top-0 bg-white shadow-sm z-40 px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Training Resources</h1>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 w-full p-4 md:p-6 lg:p-8 relative">
            {/* Main Content */}
            <div className="flex-1">
              {/* Header Section - Hidden on mobile and tablets, visible on desktop only */}
              <div className="hidden lg:block mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Training Resources
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Enhance your skills with our comprehensive training materials
                </p>
              </div>

              {/* For Desktop only - Keep original layout */}
              <div className="hidden lg:block">
                {/* Overview Cards */}
                <div className="mb-8">
                  <Overviewcards />
                </div>

                {/* Training Materials Library */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
                  <TrainingMaterialsLibraryContent />
                </div>
              </div>

              {/* For Mobile and All Tablets - Mobile view */}
              <div className="lg:hidden space-y-6">
                {/* Overview Cards */}
                <div>
                  <Overviewcards />
                </div>

                {/* Training Materials Library */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <TrainingMaterialsLibraryContent />
                </div>

                {/* Progress Tracker and Active Courses - Horizontal on tablets, vertical on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Progress Tracker */}
                  <ProgressOverviewCard />

                  {/* Active Courses */}
                  <ActiveCoursesCard />
                </div>
              </div>
            </div>

            {/* Desktop Sidebar - only for large screens */}
            <div className="hidden lg:block w-80 xl:w-96">
              <div className="sticky top-6">
                <ProgressTrackerContent />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

// Training Materials Library Content Component
const TrainingMaterialsLibraryContent = () => (
  <>
    <div className="mb-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
        Training Materials Library
      </h2>
    </div>

    {/* Search and Filters - Improved for tablets */}
    <div className="flex flex-col gap-4 mb-8">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 md:w-5 h-4 md:h-5" />
          <input
            type="text"
            className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Search materials..."
          />
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-white font-medium text-sm md:text-base transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25">
          Search
        </button>
      </div>

      {/* Filter Dropdowns - Better tablet layout */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 md:flex-initial">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select className="w-full pl-10 pr-10 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
            <option>All Categories</option>
            <option>Technical Skills</option>
            <option>Soft Skills</option>
            <option>Compliance</option>
            <option>Leadership</option>
          </select>
        </div>
        <div className="relative flex-1 md:flex-initial">
          <select className="w-full pl-4 pr-10 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
            <option>All Roles</option>
            <option>Developer</option>
            <option>Manager</option>
            <option>Sales</option>
            <option>HR</option>
          </select>
        </div>
      </div>
    </div>

    {/* Course Grid - Optimized for tablets */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {[
        { title: "Employee Handbook", progress: 50, updated: "2024-11-30", duration: "2 hours" },
        { title: "Security Training", progress: 75, updated: "2024-12-01", duration: "1.5 hours" },
        { title: "Product Knowledge", progress: 30, updated: "2024-11-28", duration: "3 hours" },
        { title: "Communication Skills", progress: 100, updated: "2024-11-25", duration: "2.5 hours" },
        { title: "Time Management", progress: 60, updated: "2024-12-02", duration: "1 hour" },
        { title: "Leadership Basics", progress: 0, updated: "2024-12-03", duration: "4 hours" }
      ].map((course, id) => (
        <div
          key={id}
          className="group bg-white border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200 hover:-translate-y-1 flex flex-col h-full"
        >
          {/* Icon */}
          <div className="h-12 w-12 md:h-14 md:w-14 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center rounded-xl mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>

          {/* Content - flex-grow to push button to bottom */}
          <div className="mb-4 md:mb-6 flex-grow">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
              A comprehensive guide to company policies and procedures.
            </p>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.duration}
              </span>
              <span>Updated: {course.updated}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600">Progress</span>
              <span className="text-sm font-bold text-blue-600">{course.progress}%</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>

          {/* Action Button - Always at bottom */}
          <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 md:py-3 text-sm md:text-base rounded-xl transition-all duration-200 transform hover:scale-105">
            {course.progress === 0 ? 'Start Module' : course.progress === 100 ? 'Review Module' : 'Continue Module'}
          </button>
        </div>
      ))}
    </div>
  </>
);

// Progress Overview Card Component - for horizontal layout
const ProgressOverviewCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base md:text-lg font-semibold text-gray-900">
        Overall Progress
      </h3>
      <TrendingUp className="w-5 h-5 text-green-500" />
    </div>
    
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs md:text-sm text-gray-600">2/5 Modules Complete</span>
        <span className="text-xl md:text-2xl font-bold text-blue-600">40%</span>
      </div>
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 w-[40%] h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
      <div className="text-center">
        <p className="text-xl md:text-2xl font-bold text-gray-900">12</p>
        <p className="text-xs text-gray-600">Hours Completed</p>
      </div>
      <div className="text-center">
        <p className="text-xl md:text-2xl font-bold text-gray-900">3</p>
        <p className="text-xs text-gray-600">Certificates Earned</p>
      </div>
    </div>
  </div>
);

// Active Courses Card Component - for horizontal layout
const ActiveCoursesCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
      Active Courses
    </h3>
    
    <div className="space-y-4">
      {[
        { title: "Onboarding Essentials", progress: 30, status: "in-progress" },
        { title: "Company Culture", progress: 100, status: "completed" },
        { title: "Technical Setup", progress: 65, status: "in-progress" }
      ].map((course, idx) => (
        <div
          key={idx}
          className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-medium text-gray-900 flex-1 text-sm md:text-base">{course.title}</h4>
            {course.status === 'completed' && (
              <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
            )}
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Continue your learning journey with interactive modules and assessments.
          </p>
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                course.status === 'completed' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {course.status === 'completed' ? 'Completed' : `${course.progress}% Complete`}
            </span>
            {course.status !== 'completed' && (
              <span className="text-xs text-blue-600 font-medium flex items-center">
                Resume <ChevronRight className="w-3 h-3 ml-1" />
              </span>
            )}
          </div>
        </div>
      ))}
    </div>

    <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 md:py-3 text-sm md:text-base rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25">
      View All Courses
    </button>
  </div>
);

// Extracted Progress Tracker Component for reusability
const ProgressTrackerContent = () => (
  <>
    {/* Progress Header - Only show on desktop */}
    <div className="mb-6 hidden lg:block">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
        Progress Tracker
      </h2>
    </div>

    {/* Progress Overview Card */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">
          Overall Progress
        </h3>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs md:text-sm text-gray-600">2/5 Modules Complete</span>
          <span className="text-xl md:text-2xl font-bold text-blue-600">40%</span>
        </div>
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 w-[40%] h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xl md:text-2xl font-bold text-gray-900">12</p>
          <p className="text-xs text-gray-600">Hours Completed</p>
        </div>
        <div className="text-center">
          <p className="text-xl md:text-2xl font-bold text-gray-900">3</p>
          <p className="text-xs text-gray-600">Certificates Earned</p>
        </div>
      </div>
    </div>

    {/* Active Courses */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
        Active Courses
      </h3>
      
      <div className="space-y-4">
        {[
          { title: "Onboarding Essentials", progress: 30, status: "in-progress" },
          { title: "Company Culture", progress: 100, status: "completed" },
          { title: "Technical Setup", progress: 65, status: "in-progress" }
        ].map((course, idx) => (
          <div
            key={idx}
            className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex-1 text-sm md:text-base">{course.title}</h4>
              {course.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
              )}
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Continue your learning journey with interactive modules and assessments.
            </p>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                  course.status === 'completed' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {course.status === 'completed' ? 'Completed' : `${course.progress}% Complete`}
              </span>
              {course.status !== 'completed' && (
                <span className="text-xs text-blue-600 font-medium flex items-center">
                  Resume <ChevronRight className="w-3 h-3 ml-1" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 md:py-3 text-sm md:text-base rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25">
        View All Courses
      </button>
    </div>
  </>
);