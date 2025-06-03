
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DashboardLayout from '@/components/DashboardLayout';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Settings,
  DollarSign,
  CheckCircle,
  XCircle,
  ClipboardList
} from 'lucide-react';

const Attendance = () => {
  const userRole = localStorage.getItem('userRole') || 'employee';
  
  const getSidebarItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: `/${userRole}-dashboard`, active: false },
      { icon: Users, label: 'Employee Management', path: '/employee-management' },
      { icon: Calendar, label: 'Leave Management', path: '/leave-management' },
      { icon: Clock, label: 'Attendance', path: '/attendance', active: true },
      { icon: TrendingUp, label: 'Performance', path: '/performance' },
      { icon: FileText, label: 'Documents', path: '/documents' },
    ];

    if (userRole === 'admin') {
      baseItems.push(
        { icon: DollarSign, label: 'Payroll', path: '/payroll' },
        { icon: Settings, label: 'Settings', path: '/settings' }
      );
    } else if (userRole === 'hr') {
      baseItems.push({ icon: ClipboardList, label: 'Recruitment', path: '/recruitment' });
    } else {
      baseItems.push({ icon: Users, label: 'Profile', path: '/profile' });
    }

    return baseItems;
  };

  const attendanceData = [
    { 
      id: 1, 
      employee: 'John Doe', 
      date: '2024-06-03', 
      checkIn: '09:00 AM', 
      checkOut: '06:00 PM', 
      hours: '9h 0m', 
      status: 'Present' 
    },
    { 
      id: 2, 
      employee: 'Sarah Wilson', 
      date: '2024-06-03', 
      checkIn: '08:45 AM', 
      checkOut: '05:30 PM', 
      hours: '8h 45m', 
      status: 'Present' 
    },
    { 
      id: 3, 
      employee: 'Mike Johnson', 
      date: '2024-06-03', 
      checkIn: '09:15 AM', 
      checkOut: '06:15 PM', 
      hours: '9h 0m', 
      status: 'Late' 
    },
    { 
      id: 4, 
      employee: 'Emily Davis', 
      date: '2024-06-03', 
      checkIn: '-', 
      checkOut: '-', 
      hours: '-', 
      status: 'Absent' 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Late': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Absent': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout
      sidebarItems={getSidebarItems()}
      title="Attendance"
      userRole={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Attendance Management</h2>
            <p className="text-gray-600">Track and manage employee attendance</p>
          </div>
          {userRole === 'employee' && (
            <div className="flex gap-2">
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Clock In
              </Button>
              <Button variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present Today</p>
                  <p className="text-2xl font-bold">{attendanceData.filter(a => a.status === 'Present').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
                  <p className="text-2xl font-bold">{attendanceData.filter(a => a.status === 'Late').length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold">{attendanceData.filter(a => a.status === 'Absent').length}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold">75%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance - {new Date().toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceData.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-blue-600 text-white">
                        {record.employee.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{record.employee}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Check In: {record.checkIn}</span>
                        <span>Check Out: {record.checkOut}</span>
                        <span>Hours: {record.hours}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(record.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(record.status)}
                        {record.status}
                      </span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personal Attendance Summary (for employees) */}
        {userRole === 'employee' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Attendance This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Working Days</span>
                    <span className="text-sm text-gray-600">22 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Present</span>
                    <span className="text-sm text-green-600">20 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Absent</span>
                    <span className="text-sm text-red-600">1 day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Late Arrivals</span>
                    <span className="text-sm text-yellow-600">1 day</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Attendance Rate</span>
                      <span className="text-sm font-bold text-blue-600">91%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Clocked in at 9:00 AM</p>
                      <p className="text-xs text-gray-500">Today</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <XCircle className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Clocked out at 6:00 PM</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Late arrival - 9:15 AM</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
