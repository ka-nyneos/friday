import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  BarChart2,
  FileText,
  Building,
  Layers,
  Upload,
  CheckCircle,
  LogOut,
  Wrench,
  Settings,
  Bolt,
  UserPlus,
  HandCoins,
  ChevronDown,
  UserRoundCog,
  ChevronRight,
  LayoutDashboard,
  FileBarChart,
  ChartArea,
  SquareChartGantt,
} from "lucide-react";

import "../styles/theme.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type NavItem = {
  label: string;
  path?: string;
  icon: React.ReactNode;
  subItems?: NavItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  
  const [pagePermissions, setPagePermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const response = await axios.post("http://localhost:3143/api/auth/sidebar",{email});
        setPagePermissions(response.data.pages || {});
        
        // await new Promise((resolve) => setTimeout(resolve, 500));
        // const mockedData = {
        //   pages: {
        //     entity: true,
        //     hierarchical: true,
        //     masters: true,
        //     roles: true,
        //     permissions: true,
        //     "user-creation": true,
        //     dashboard: true,
        //     "exposure-upload": true,
        //     "exposure-bucketing": true,
        //     "hedging-proposal": true,
        //     "hedging-dashboard": true,
        //     FxStatusDash: true,
        //   },
        // };

        setPagePermissions(mockedData.pages);
      } catch (error) {
        console.error("Failed to fetch permissions", error);
      }
    };

    fetchPermissions();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState<Set<string>>(new Set());

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
    setOpenSubMenus(new Set());
  };

  const isPageAllowed = (path?: string): boolean => {
    if (!path) return true;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return pagePermissions[cleanPath] === true;
  };

  const navItems: NavItem[] = [
    { 
      label: "Entity", 
      path: "/entity", 
      icon: <Building /> },
    { 
      label: "Entity hierarchy", 
      path: "/hierarchical", 
      icon: <Layers /> },
    {
      label: "Masters",
      icon: <Bolt />,
      subItems: [
        { label: "Masters Configuration", path: "/masters", icon: <Wrench /> },
      ],
    },
    {
      label: "Settings",
      icon: <Settings />,
      subItems: [
        { label: "Roles", path: "/roles", icon: <UserRoundCog /> },
        { label: "Permissions", path: "/permissions", icon: <HandCoins /> },
        { label: "Users", path: "/user-creation", icon: <UserPlus /> },
      ],
    },
    {
      label: "Dashboard",
      icon: <FileBarChart />,
      subItems: [
        { 
          label: "CFO Dashboard", 
          path: "/cfo-dashboard", 
          icon: <ChartArea /> },
        {
          label: "FX Management\nDashboard",
          path: "/fx-management-dashboard",
          icon: <SquareChartGantt />,
        },
      ],
    },
    { 
      label: "Exposure Upload", 
      path: "/exposure-upload", 
      icon: <Upload /> },
    {
      label: "Exposure Bucketing",
      path: "/exposure-bucketing",
      icon: <BarChart2 />,
    },
    {
      label: "Hedging Proposal",
      path: "/hedging-proposal",
      icon: <FileText />,
    },
    {
      label: "Hedging Dashboard",
      path: "/hedging-dashboard",
      icon: <LayoutDashboard />,
    },
    { label: "FX Status", path: "/FxStatusDash", icon: <CheckCircle /> },
    { label: "Logout", path: "/", icon: <LogOut /> },
  ];

  useEffect(() => {
    const newOpenSubMenus = new Set<string>();
    navItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveChild = item.subItems.some(
          (subItem) => subItem.path === location.pathname
        );
        if (hasActiveChild) {
          newOpenSubMenus.add(item.label);
        }
      }
    });
    setOpenSubMenus(newOpenSubMenus);
  }, [location.pathname]);

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => {
      const newSet = new Set(prev);
      newSet.has(label) ? newSet.delete(label) : newSet.add(label);
      return newSet;
    });
  };

  const handleItemClick = (item: NavItem) => {
    if (item.subItems) {
      toggleSubMenu(item.label);
      if (!item.path) return;
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  const isItemOrSubItemActive = (item: NavItem): boolean => {
    if (item.path && location.pathname === item.path) return true;
    if (item.subItems) {
      return item.subItems.some(
        (subItem) => subItem.path && location.pathname === subItem.path
      );
    }
    return false;
  };

  return (
    <>
      {isOpen && !collapsed && (
        <div
          className="fixed inset-0 bg-blue-600 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-screen z-50 bg-[#129990]/70 backdrop-blur-md ${
          collapsed ? "w-20" : "w-80"
        } text-white p-4 shadow-lg flex flex-col transition-all duration-300 overflow-x-visible transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <button
          onClick={toggleCollapse}
          className="cursor-pointer text-blue mb-8 self-end focus:outline-none hover:bg-white/20 rounded px-2 py-2 transition-colors duration-200"
        >
          {collapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
        

        <nav className="flex flex-col space-y-3 w-full">
          {navItems
            .filter((item) => {
              if (!isPageAllowed(item.path)) return false;

              if (item.subItems) {
                item.subItems = item.subItems.filter((subItem) => isPageAllowed(subItem.path));
                return item.subItems.length > 0 || isPageAllowed(item.path);
              }

              return true;
            }).map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isSubMenuOpen = openSubMenus.has(item.label);
            const isActive = isItemOrSubItemActive(item);

            return (
              <div key={item.label} className="relative group w-full">
                <button
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center rounded-lg px-3 py-3 transition-colors w-full text-left ${
                    isActive
                      ? "bg-primary-bg-hover font-semibold"
                      : "hover:bg-white/20 "
                  }`}
                >
                  <span className="w-7 flex justify-center">{item.icon}</span>
                  <span
                    className={`ml-4 text-base whitespace-nowrap transition-all duration-200 ${
                      collapsed
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100 w-auto"
                    }`}
                  >
                    {item.label.split("\n").map((line, idx) => (
                      <span key={idx} className="block">
                        {line}
                      </span>
                    ))}
                  </span>

                  {!collapsed && hasSubItems && (
                    <span className="ml-auto w-4 transition-transform duration-200">
                      {isSubMenuOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                  )}

                  {collapsed && (
                    <div className="absolute left-[125%] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                      <div className="whitespace-nowrap rounded bg-primary px-3 py-2 text-sm tracking-widest text-white opacity-0 group-hover:opacity-90 transition-opacity duration-200 shadow-lg">
                        {item.label}
                      </div>
                    </div>
                  )}
                </button>

                {!collapsed && hasSubItems && isSubMenuOpen && (
                  <div className="ml-8 mt-1.5 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                    {item.subItems?.map((subItem) => (
                      <button
                        key={subItem.label}
                        onClick={() => {
                          if (subItem.path) {
                            navigate(subItem.path);
                            if (!collapsed) {
                              onClose();
                            }
                          }
                        }}
                        className={`flex items-center rounded-lg px-3 py-2 transition-colors w-full text-left ${
                          location.pathname === subItem.path
                            ? "bg-white/30  font-semibold"
                            : "hover:bg-white/20 "
                        }`}
                      >
                        <span className="w-7 flex justify-center">
                          {subItem.icon}
                        </span>
                        <span className="ml-4 text-sm">
                          {subItem.label.split("\n").map((line, idx) => (
                            <span key={idx} className="block">
                              {line}
                            </span>
                          ))}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;