
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Search,
  Plus,
  Edit,
  Eye,
  UserPlus,
  ClipboardList
} from 'lucide-react';

const EmployeeManagement = () => {
  const userRole = localStorage.getItem('userRole') || 'employee';
  
  const getSidebarItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: `/${userRole}-dashboard`, active: false },
      { icon: Users, label: 'Employee Management', path: '/employee-management', active: true },
      { icon: Calendar, label: 'Leave Management', path: '/leave-management' },
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

  const employees = [
    { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering', position: 'Senior Developer', status: 'Active' },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@company.com', department: 'Marketing', position: 'Marketing Manager', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@company.com', department: 'Sales', position: 'Sales Representative', status: 'Active' },
    { id: 4, name: 'Emily Davis', email: 'emily@company.com', department: 'HR', position: 'HR Specialist', status: 'On Leave' },
    { id: 5, name: 'Robert Brown', email: 'robert@company.com', department: 'Finance', position: 'Financial Analyst', status: 'Active' },
  ];

  const canManageEmployees = userRole === 'admin' || userRole === 'hr';

  return (
    <DashboardLayout
      sidebarItems={getSidebarItems()}
      title="Employee Management"
      userRole={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Employee Management</h2>
            <p className="text-gray-600">Manage and view employee information</p>
          </div>
          {canManageEmployees && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>All Employees ({employees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.email}</p>
                      <p className="text-sm text-gray-500">{employee.department} • {employee.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canManageEmployees && (
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{employees.filter(e => e.status === 'Active').length}</p>
                </div>
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On Leave</p>
                  <p className="text-2xl font-bold">{employees.filter(e => e.status === 'On Leave').length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeManagement;
