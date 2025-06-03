import { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Settings,
  DollarSign,
  ClipboardList,
  UserPlus,
  Building2,
  BarChart3,
} from 'lucide-react';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
  roles?: string[];
}

const DashboardSidebar = () => {
  const location = useLocation();
  const userRole = localStorage.getItem('userRole') || 'employee';

  const allSidebarItems: SidebarItem[] = [
    // Common items for all roles
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: `/${userRole}-dashboard` 
    },
    { 
      icon: Calendar, 
      label: 'Leave Management', 
      path: '/leave-management',
      roles: ['admin', 'hr']
    },
    { 
      icon: Calendar, 
      label: 'My Leaves', 
      path: '/employee-leaves',
      roles: ['employee']
    },
    { 
      icon: Clock, 
      label: 'Attendance', 
      path: '/attendance',
      roles: ['admin', 'hr']
    },
    { 
      icon: Clock, 
      label: 'My Attendance', 
      path: '/employee-attendance',
      roles: ['employee']
    },
    { 
      icon: TrendingUp, 
      label: 'Performance', 
      path: '/performance' 
    },
    { 
      icon: FileText, 
      label: 'Documents', 
      path: '/documents' 
    },
    // Admin specific items
    { 
      icon: Users, 
      label: 'Employee Management', 
      path: '/employee-management',
      roles: ['admin', 'hr']
    },
    { 
      icon: DollarSign, 
      label: 'Payroll', 
      path: '/payroll',
      roles: ['admin']
    },
    { 
      icon: Building2, 
      label: 'Department Management', 
      path: '/departments',
      roles: ['admin']
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      path: '/analytics',
      roles: ['admin']
    },
    // HR specific items
    { 
      icon: ClipboardList, 
      label: 'Recruitment', 
      path: '/recruitment',
      roles: ['admin', 'hr']
    },
    { 
      icon: UserPlus, 
      label: 'Onboarding', 
      path: '/onboarding',
      roles: ['admin', 'hr']
    },
    // Employee specific items
    { 
      icon: Users, 
      label: 'Profile', 
      path: '/profile',
      roles: ['employee']
    },
    // Settings for admin and HR
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      roles: ['admin', 'hr']
    },
  ];

  // Filter items based on user role
  const sidebarItems = allSidebarItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  const getPortalTitle = () => {
    switch (userRole) {
      case 'admin':
        return 'Admin Portal';
      case 'hr':
        return 'HR Portal';
      default:
        return 'Employee Portal';
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">{getPortalTitle()}</h2>
        <p className="text-sm text-gray-500 mt-1 capitalize">{userRole}</p>
      </div>
      <nav className="mt-6">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200 ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardSidebar; 