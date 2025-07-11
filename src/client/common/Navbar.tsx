"use client";

import "../styles/theme.css";
import { motion } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { Home, CreditCard, TrendingUp, Shield, Bell, User, Mail, Calendar, Settings } from "lucide-react";
import axios from "axios";
import FXTickerPro from "./FXTickerPro";
import ThemeToggle from "./ThemeToggle";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

  const API_URL =
    "https://api.currencyfreaks.com/v2.0/rates/latest?apikey=0a782d5b5d8f47dc95c51da1e83ac3f2";
  const CURRENCIES_TO_SHOW = ["INR", "EUR", "GBP", "JPY", "AUD"];

const Navbar: React.FC = () => {
  

// Inside component
const navigate = useNavigate();
  const navItems = [
    { icon: Home, label: "Dashboard" },
    { icon: CreditCard, label: "Cash Management" },
    { icon: TrendingUp, label: "FX Hedging" },
    { icon: Shield, label: "Bank Guarantee" },
  ];

  const [activeNav, setActiveNav] = useState("Dashboard");

  const handleLogout = async () => {
  const userId = localStorage.getItem('userId');

  try {
    await axios.post('http://localhost:3143/api/auth/logout', { userId });

    // Clear localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isLoggedIn');

    // ✅ Navigate to login
    navigate('/', { replace: true });
  } catch (error) {
    console.error('Logout failed:', error);
  }
};


  // Optional fallback static data
  const [rates, setRates] = useState<Record<string, number>>({});
  const prevRates = useRef<Record<string, number>>({});
  // const [userData, setUserData] = useState<null | { name: string; email: string }>(null);
  
  const [userData, setUserData] = useState<null | { name: string; email: string }>(null);
  const [isUserDetailsVisible, setIsUserDetailsVisible] = useState(false);
n');
  const fetchUserDetails = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.warn("User ID not found in localStorage");
    return;
  }

  try {
    const response = await axios.get(`http://localhost:3143/api/getuserdetails/${userId}`);
    if (response.data.success) {
      setUserData(response.data.sessions[0]); // ✅ Corrected
      setIsUserDetailsVisible(prev => !prev);
    }
  } catch (error) {
    console.error("Failed to fetch user details:", error);
  }
};


  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data } = await axios.get(API_URL);
        const newRates: Record<string, number> = {};
        CURRENCIES_TO_SHOW.forEach((currency) => {
          newRates[currency] = parseFloat(data.rates[currency]);
        });
        prevRates.current = rates;
        setRates(newRates);
      } catch (error) {
        console.error("Failed to fetch rates", error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed top-0 right-0 h-[4rem] bg-white border-b border-gray-200 flex items-center pl-[6rem] shadow-sm z-10 transition-all duration-500 w-full">
      <div className="flex items-center space-x-3">
        <span className="text-primary font-bold font-base text-lg">
          CASH INVOICE
        </span>
      </div>

      <div className="flex items-center space-x-4 ml-8">
        {navItems.map((item, index) => {
          const isActive = activeNav === item.label;
          return (
            <div
              key={index}
              onClick={() => setActiveNav(item.label)}
              className={`group flex items-center space-x-2 px-2 py-2 cursor-pointer transition-colors ${
                isActive
                  ? "text-primary font-medium border-b-2 border-primary-lt"
                  : "text-gray-600 hover:text-primary-lt"
              }`}
            >
              <item.icon
                size={18}
                className={`transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-gray-600 group-hover:text-primary-lt"
                }`}
              />
              <span className="text-sm">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="ml-auto mr-6">
        <FXTickerPro />
      </div>

      <div className="flex items-center space-x-4 mr-4">
        <div className="relative cursor-pointer hover:text-primary-lt text-text transition-colors">
            <ThemeToggle />
        </div>

        <div className="relative cursor-pointer transition-colors">
          <Bell size={20} className="text-text hover:text-primary-lt" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </div>

    <div className="relative">
<div
  onClick={fetchUserDetails}
  className="flex items-center space-x-2 cursor-pointer hover:bg-primary-xl px-3 py-2 rounded-full transition-colors"
>
  <div className="w-8 h-8 bg-primary-md rounded-full flex items-center justify-center">
    <User size={16} className="text-primary-lt" />
  </div>
</div>

{isUserDetailsVisible && userData && (
<motion.div 
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
  className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50"
  style={{
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    backdropFilter: 'blur(8px)',
    backgroundColor: 'rgba(255, 255, 255, 0.96)'
  }}
>
  {/* Header with subtle gradient */}
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-5 py-4 border-b border-gray-100">
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
          {userData.name.charAt(0)}
        </div>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
      </div>
      <div>
        <p className="font-semibold text-gray-800">{userData.name}</p>
        <p className="text-xs text-gray-500">{userData.role || 'User'}</p>
      </div>
    </div>
  </div>

  {/* Content */}
  <div className="p-4 space-y-3">
    <div className="flex items-start space-x-3">
      <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-gray-600 break-all">{userData.email}</p>
    </div>

    <div className="flex items-start space-x-3">
      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">Last active</p>
        <p className="text-xs font-medium text-gray-700">
          {new Date(userData.lastLoginTime).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>

    {/* <div className="pt-2 mt-2 border-t border-gray-100">
      <button className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
        <Settings className="w-4 h-4" />
        <span>Account Settings</span>
      </button>
    </div> */}
  </div>

  {/* Footer */}
  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
    <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors" onClick={handleLogout}>
      Sign Out
    </button>
  </div>
</motion.div>
)}
</div>

    </div>
    </nav>
  );
};

export default Navbar;
