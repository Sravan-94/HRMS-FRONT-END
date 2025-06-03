
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
  Plus,
  Check,
  X,
  ClipboardList
} from 'lucide-react';

const LeaveManagement = () => {
  const userRole = localStorage.getItem('userRole') || 'employee';
  
  const getSidebarItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: `/${userRole}-dashboard`, active: false },
      { icon: Users, label: 'Employee Management', path: '/employee-management' },
      { icon: Calendar, label: 'Leave Management', path: '/leave-management', active: true },
      { icon: Clock, label: 'Attendance', path: '/attendance' },
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

  const leaveRequests = [
    { 
      id: 1, 
      employee: 'John Doe', 
      type: 'Vacation', 
      startDate: '2024-06-10', 
      endDate: '2024-06-15', 
      days: 5, 
      status: 'Pending',
      reason: 'Family vacation'
    },
    { 
      id: 2, 
      employee: 'Sarah Wilson', 
      type: 'Sick Leave', 
      startDate: '2024-06-08', 
      endDate: '2024-06-09', 
      days: 2, 
      status: 'Approved',
      reason: 'Medical appointment'
    },
    { 
      id: 3, 
      employee: 'Mike Johnson', 
      type: 'Personal', 
      startDate: '2024-06-12', 
      endDate: '2024-06-12', 
      days: 1, 
      status: 'Rejected',
      reason: 'Personal matters'
    },
  ];

  const canApproveLeaves = userRole === 'admin' || userRole === 'hr';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      sidebarItems={getSidebarItems()}
      title="Leave Management"
      userRole={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Leave Management</h2>
            <p className="text-gray-600">Manage employee leave requests and balances</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Request Leave
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status === 'Pending').length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Today</p>
                  <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status === 'Approved').length}</p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold">{leaveRequests.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Days</p>
                  <p className="text-2xl font-bold">{Math.round(leaveRequests.reduce((acc, req) => acc + req.days, 0) / leaveRequests.length)}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-blue-600 text-white">
                        {request.employee.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{request.employee}</h3>
                      <p className="text-sm text-gray-600">{request.type} • {request.days} day(s)</p>
                      <p className="text-sm text-gray-500">{request.startDate} to {request.endDate}</p>
                      <p className="text-sm text-gray-500 italic">"{request.reason}"</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    {canApproveLeaves && request.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leave Balance (for employees) */}
        {userRole === 'employee' && (
          <Card>
            <CardHeader>
              <CardTitle>My Leave Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Annual Leave</h3>
                  <p className="text-2xl font-bold text-blue-600">18 days</p>
                  <p className="text-sm text-blue-700">Available</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">Sick Leave</h3>
                  <p className="text-2xl font-bold text-green-600">7 days</p>
                  <p className="text-sm text-green-700">Available</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Personal Leave</h3>
                  <p className="text-2xl font-bold text-purple-600">3 days</p>
                  <p className="text-sm text-purple-700">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeaveManagement;
