import { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Users,
} from 'lucide-react';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const EmployeeSidebar = () => {
  const location = useLocation();
  const userRole = localStorage.getItem('userRole') || 'employee';

  const sidebarItems: SidebarItem[] = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: `/${userRole}-dashboard` 
    },
    { 
      icon: Calendar, 
      label: 'Leaves Management', 
      path: '/employee-leaves' 
    },
    { 
      icon: Clock, 
      label: 'Your Attendance', 
      path: '/employee-attendance' 
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
    { 
      icon: Users, 
      label: 'Profile', 
      path: '/profile' 
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Employee Portal</h2>
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

export default EmployeeSidebar; 