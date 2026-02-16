import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isMobileMenuOpen: false,
  isDesktopCollapsed: false,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.isMobileMenuOpen = action.payload;
    },
    toggleDesktopCollapsed: (state) => {
      state.isDesktopCollapsed = !state.isDesktopCollapsed;
    },
    setDesktopCollapsed: (state, action) => {
      state.isDesktopCollapsed = action.payload;
    },
  },
});

export const {
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleDesktopCollapsed,
  setDesktopCollapsed,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
