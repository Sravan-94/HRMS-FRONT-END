import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
  roles?: string[];
}

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'employee';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account.',
    });
    toggleSidebar();
  };

  const allSidebarItems: SidebarItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: `/${userRole}-dashboard`,
    },
    {
      icon: Users,
      label: 'Employee Management',
      path: '/employee-management',
      roles: ['admin', 'hr'],
    },
    {
      icon: Calendar,
      label: 'Leave Management',
      path: '/leave-management',
      roles: ['admin', 'hr'],
    },
    {
      icon: Clock,
      label: 'Attendance',
      path: '/attendance',
      roles: ['admin', 'hr'],
    },
    {
      icon: Calendar,
      label: 'My Leaves',
      path: '/employee-leaves',
      roles: ['employee'],
    },
    {
      icon: Clock,
      label: 'My Attendance',
      path: '/employee-attendance',
      roles: ['employee'],
    },
    {
      icon: TrendingUp,
      label: 'Performance',
      path: userRole === 'employee' ? '/employee-performance' : '/performance',
    },
    {
      icon: FileText,
      label: 'Documents',
      path: userRole === 'employee' ? '/employee-documents' : '/documents',
    },
  ];

  // Filter items based on user role
  const sidebarItems = allSidebarItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
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
    <div
      className={`w-64 h-screen bg-white border-r border-gray-200 flex flex-col 
        fixed top-0 left-0 z-40 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:flex`}
    >
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">{getPortalTitle()}</h2>
        <p className="text-sm text-gray-500 mt-1 capitalize">{userRole}</p>
      </div>
      <nav className="mt-6 flex-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={toggleSidebar}
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
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;