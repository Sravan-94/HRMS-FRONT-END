import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  TrendingUp,
  FileText,
  Settings,
  UserPlus,
  Activity,
  DollarSign,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin-dashboard', active: true },
    { icon: Users, label: 'Employee Management', path: '/admin/employees' },
    { icon: Calendar, label: 'Leave Management', path: '/leave-management' },
    { icon: Clock, label: 'Attendance', path: '/attendance' },
    { icon: TrendingUp, label: 'Performance', path: '/performance' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: DollarSign, label: 'Payroll', path: '/admin/payroll' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to the Admin Dashboard!</h2>
              <p className="text-blue-100">Manage your HRMS effectively</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">218</div>
              <p className="text-xs text-muted-foreground">93% attendance rate</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">John Doe submitted leave request</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New employee Sarah Wilson onboarded</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Performance review cycle started</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Engineering</span>
                  <span className="text-sm text-muted-foreground">89 employees</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Marketing</span>
                  <span className="text-sm text-muted-foreground">45 employees</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sales</span>
                  <span className="text-sm text-muted-foreground">67 employees</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">HR</span>
                  <span className="text-sm text-muted-foreground">12 employees</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Finance</span>
                  <span className="text-sm text-muted-foreground">21 employees</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
