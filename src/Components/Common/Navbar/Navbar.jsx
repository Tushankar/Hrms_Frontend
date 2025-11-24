import React, { useState, useEffect, useRef } from "react";
import { Search, Menu } from "lucide-react";
import ProfilePicImg from "../../../assets/ProfilePicImg.png";
import VecIcon from "../../../assets/VecIcon.png";
import { useMobileMenu } from "../layout/Layout";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { toggleMobileMenu } = useMobileMenu();
  const [greeting, setGreeting] = useState("Good Morning");
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const baseURL = import.meta.env.VITE__BASEURL;

  // Get user data from JWT token
  const getUserFromToken = () => {
    try {
      const session = Cookies.get("session");
      if (!session) return null;

      const decodedToken = jwtDecode(session);
      return decodedToken.user;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const user = getUserFromToken();

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [filteredForms, setFilteredForms] = useState([]);

  // Forms data for search
  const forms = [
    { name: "Applicant Information", route: "/employee/personal-information" },
    { name: "Education", route: "/employee/education" },
    { name: "References", route: "/employee/references" },
    { name: "Previous Employment", route: "/employee/work-experience" },
    { name: "Military Service", route: "/employee/professional-experience" },
    { name: "Disclaimer and Signature", route: "/employee/legal-disclosures" },
    { name: "Job Description", route: "/employee/task-management" },
    { name: "Code of Ethics Form", route: "/employee/code-of-ethics" },
    {
      name: "Service Delivery Form",
      route: "/employee/service-delivery-policies",
    },
    { name: "Non-Compete Agreement", route: "/employee/non-compete-agreement" },
    { name: "Emergency Contact Form", route: "/employee/emergency-contact" },
    {
      name: "Background Check Form",
      route: "/employee/edit-background-form-check-results",
    },
    { name: "Staff Misconduct Form", route: "/employee/misconduct-form" },
    {
      name: "TB or X-Ray Form",
      route: "/employee/edit-tb-symptom-screen-form",
    },
    { name: "I-9 Employment Eligibility", route: "/employee/i9-form" },
    { name: "W-4 Tax Form", route: "/employee/w4-form" },
    { name: "W-9 Tax Form", route: "/employee/w9-form" },
    { name: "Direct Deposit Form", route: "/employee/direct-deposit" },
    {
      name: "Orientation PowerPoint Presentation",
      route: "/employee/orientation-presentation",
    },
    { name: "Orientation Checklist", route: "/employee/orientation-checklist" },
  ];

  // Function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  // Function to get user name from cookies/localStorage
  const getUserName = () => {
    try {
      // Try to get user from session token first (like in EmployeeDashboard)
      const userToken = Cookies.get("session");
      if (userToken) {
        const decodedToken = jwtDecode(userToken);
        const user = decodedToken?.user;
        if (user?.userName) {
          return user.userName;
        }
      }

      // Fallback to user cookie
      const userCookie = Cookies.get("user");
      if (userCookie) {
        const user = JSON.parse(userCookie);
        return (
          user.userName ||
          user.name ||
          user.firstName ||
          user.fullName ||
          "User"
        );
      }

      // Fallback to userInfo cookie
      const userInfoCookie = Cookies.get("userInfo");
      if (userInfoCookie) {
        const user = JSON.parse(userInfoCookie);
        return (
          user.userName ||
          user.name ||
          user.firstName ||
          user.fullName ||
          "User"
        );
      }

      // Fallback to localStorage
      const localStorageUser = localStorage.getItem("userInfo");
      if (localStorageUser) {
        const user = JSON.parse(localStorageUser);
        return (
          user.userName ||
          user.name ||
          user.firstName ||
          user.fullName ||
          "User"
        );
      }

      return "User";
    } catch (error) {
      console.error("Error getting user name:", error);
      return "User";
    }
  };

  // Search handlers
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredForms([]);
      setShowSearchDropdown(false);
    } else {
      const filtered = forms.filter((form) =>
        form.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredForms(filtered);
      setShowSearchDropdown(true); // Always show dropdown when there's a query
    }
  };

  const handleFormSelect = (form) => {
    navigate(form.route);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim() !== "" && filteredForms.length > 0) {
      setShowSearchDropdown(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Set initial greeting and user name
    setGreeting(getTimeBasedGreeting());
    setUserName(getUserName());

    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-2 md:py-3 lg:py-[15.4px] sticky top-0 z-20 px-3 md:px-4 lg:px-6 flex justify-between items-center border-b border-[#BDC3C7] bg-white">
      <div className="flex-1 md:flex-none min-w-0">
        <h3 className="text-sm md:text-xl lg:text-[1.5vw] font-[600] font-[Poppins] text-[#000000] truncate">
          {greeting}, {userName}
        </h3>
        <p className="text-[10px] md:text-sm lg:text-[1vw] font-[400] font-[Poppins] text-[#4D4D4D] hidden sm:block">
          Here is your daily preview
        </p>
      </div>
      <div className="flex justify-center items-center gap-2 md:gap-3 lg:gap-5">
        {/* Search Input */}
        <div className="relative hidden sm:block" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="bg-[#F7F9FC] h-8 w-40 sm:w-48 md:h-8 md:w-80 lg:h-10 lg:w-96 rounded-full pl-8 md:pl-10 pr-3 md:pr-4 text-xs md:text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:bg-white transition-all"
            />
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-500" />
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredForms.length > 0 ? (
                filteredForms.map((form, index) => (
                  <button
                    key={index}
                    onClick={() => handleFormSelect(form)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm md:text-base font-medium text-gray-900">
                      {form.name}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No forms match your search
                </div>
              )}
            </div>
          )}
        </div>
        <button className="hidden sm:flex justify-center items-center h-8 w-8 md:h-10 md:w-10 lg:h-14 lg:w-14 border border-black rounded-full overflow-hidden flex-shrink-0">
          <img
            src={
              user?.profileImage ? `${baseURL}/${user.profileImage}` : VecIcon
            }
            alt="Profile"
            className="rounded-full w-full h-full object-cover"
            onError={(e) => {
              console.log(
                "Profile image failed to load:",
                `${baseURL}/${user.profileImage}`
              );
              e.target.src = VecIcon;
            }}
          />
        </button>
        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden bg-[#1F3A93] h-8 w-8 rounded-lg flex justify-center items-center hover:bg-[#153073] transition-colors flex-shrink-0"
          onClick={toggleMobileMenu}
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
