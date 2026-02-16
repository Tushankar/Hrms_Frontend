import React, { createContext, useContext } from "react";
import { Sidebar } from "../Sidebar/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import {
  setMobileMenuOpen,
  setDesktopCollapsed,
} from "../../../store/slices/sidebarSlice";

// Create context
export const MobileMenuContext = createContext();

// Custom hook
export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext);
  if (!context) {
    throw new Error("useMobileMenu must be used within Layout");
  }
  return context;
};

export const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const { isMobileMenuOpen, isDesktopCollapsed } = useSelector(
    (state) => state.sidebar
  );

  const toggleMobileMenu = () => {
    dispatch(setMobileMenuOpen(!isMobileMenuOpen));
  };

  const setIsMobileMenuOpen = (isOpen) => {
    dispatch(setMobileMenuOpen(isOpen));
  };

  const setIsDesktopCollapsed = (isCollapsed) => {
    dispatch(setDesktopCollapsed(isCollapsed));
  };

  return (
    <MobileMenuContext.Provider value={{ toggleMobileMenu, isMobileMenuOpen }}>
      <div className="h-screen w-full flex justify-center items-center overflow-hidden relative">
        {/* Desktop Sidebar - Dynamic width based on collapsed state */}
        <div
          className={`hidden md:block ${
            isDesktopCollapsed ? "w-20" : "w-64"
          } h-full flex-shrink-0 transition-all duration-300 ease-in-out relative`}
        >
          <Sidebar
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isDesktopCollapsed={isDesktopCollapsed}
            setIsDesktopCollapsed={setIsDesktopCollapsed}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className="md:hidden">
          <Sidebar
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isDesktopCollapsed={false}
            setIsDesktopCollapsed={() => {}}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 h-full overflow-y-auto overflow-x-hidden transition-all duration-300 ease-linear bg-[#F7F9FC]">
          {children}
        </div>
      </div>
    </MobileMenuContext.Provider>
  );
};