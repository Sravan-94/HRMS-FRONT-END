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
  UserPlus,
  Building2,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
  roles?: string[];
}

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const storedUserRole = localStorage.getItem('userRole') || 'employee';
  const userRole = storedUserRole.toLowerCase(); // Convert to lowercase for consistent comparison

  console.log('DashboardSidebar userRole:', userRole);

  useEffect(() => {
    console.log('DashboardSidebar useEffect - userRole changed:', userRole);
    // Any logic that should run when userRole changes can go here
  }, [userRole]); // Depend on userRole

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    
    // Show success message
    toast({
      title: "Success",
      description: "Logged out successfully!",
    });

    // Redirect to login page
    navigate('/');
  };

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
      icon: Clock, 
      label: 'Attendance', 
      path: '/attendance',
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
      label: 'My Attendance', 
      path: '/employee-attendance',
      roles: ['employee']
    },
    { 
      icon: TrendingUp, 
      label: 'Performance', 
      path: userRole === 'employee' ? '/employee-performance' : '/performance' 
    },
    { 
      icon: FileText, 
      label: 'Documents', 
      path: userRole === 'employee' ? '/employee-documents' : '/documents' 
    },
    // Admin specific items
    { 
      icon: Users, 
      label: 'Employee Management', 
      path: '/employee-management',
      roles: ['admin', 'hr']
    },
    // Employee specific items
    { 
      icon: Users, 
      label: 'Profile', 
      path: '/profile',
      roles: ['employee']
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
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">{getPortalTitle()}</h2>
        <p className="text-sm text-gray-500 mt-1 capitalize">{userRole}</p>
      </div>
      <nav className="mt-6 flex-1">
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