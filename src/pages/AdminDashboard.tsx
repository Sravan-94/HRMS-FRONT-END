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
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { base_url } from '@/utils/config';

interface Employee {
  id?: number; // Or empId, based on backend
  empId?: number;
  ename: string;
  status?: string; // Assuming employee status is available
  department?: string; // Assuming department is available
  // Add other employee properties if needed
}

interface LeaveRequest {
  id: number;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason: string;
}

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

  const [totalEmployees, setTotalEmployees] = useState<number | 'Loading...' | 'Error'>('Loading...');
  const [activeEmployees, setActiveEmployees] = useState<number | 'Loading...' | 'Error'>('Loading...');
  const [pendingLeaves, setPendingLeaves] = useState<number | 'Loading...' | 'Error'>('Loading...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [employeesResponse, leavesResponse] = await Promise.all([
          axios.get(`${base_url}/emps/getEmps`),
          axios.get(`${base_url}/leaves/getAllLeaves`),
        ]);

        console.log('Fetched employees for admin dashboard:', employeesResponse.data);
        console.log('Fetched leaves for admin dashboard:', leavesResponse.data);

        const allEmployees: Employee[] = employeesResponse.data; // Assuming API returns Employee[]
        const allLeaves: LeaveRequest[] = leavesResponse.data; // Assuming API returns LeaveRequest[]

        // Calculate Total Employees
        setTotalEmployees(allEmployees.length);

        // Calculate Active Employees (assuming 'status' field exists in Employee and 'Active' indicates active)
        const activeCount = allEmployees.filter(emp => emp.status?.toLowerCase() === 'active').length;
        setActiveEmployees(activeCount);

        // Calculate Pending Leaves
        const pendingCount = allLeaves.filter(leave => leave.status.toLowerCase() === 'pending').length;
        setPendingLeaves(pendingCount);

      } catch (error) {
        console.error('Error fetching data for admin dashboard:', error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data.",
          variant: "destructive",
        });
        setTotalEmployees('Error');
        setActiveEmployees('Error');
        setPendingLeaves('Error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployees}</div>
              <p className="text-xs text-muted-foreground">93% attendance rate</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingLeaves}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
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
                <p className="text-center text-gray-500">No recent activities data available.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center text-gray-500">No department overview data available.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
