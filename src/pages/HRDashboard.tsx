
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
  UserPlus,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';

const HRDashboard = () => {
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/hr-dashboard', active: true },
    { icon: Users, label: 'Employee Management', path: '/employee-management' },
    { icon: Calendar, label: 'Leave Management', path: '/leave-management' },
    { icon: Clock, label: 'Attendance', path: '/attendance' },
    { icon: TrendingUp, label: 'Performance', path: '/performance' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: ClipboardList, label: 'Recruitment', path: '/recruitment' },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="HR Dashboard"
      userRole="HR Manager"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">218</div>
              <p className="text-xs text-muted-foreground">93% attendance rate</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Pending approval</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Actively recruiting</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              HR Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-16 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                <Calendar className="h-5 w-5" />
                Approve Leaves
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <UserPlus className="h-5 w-5" />
                Add Employee
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <FileText className="h-5 w-5" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Review John Doe's leave request</p>
                    <p className="text-xs text-muted-foreground">Due today</p>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Interview scheduled with candidate</p>
                    <p className="text-xs text-muted-foreground">Tomorrow 2:00 PM</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Complete Q4 performance reviews</p>
                    <p className="text-xs text-muted-foreground">Due in 3 days</p>
                  </div>
                  <Button size="sm" variant="outline">Start</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sarah Wilson completed onboarding</p>
                    <p className="text-xs text-muted-foreground">Engineering Department</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mike Johnson achieved sales target</p>
                    <p className="text-xs text-muted-foreground">Sales Department</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Team completed project milestone</p>
                    <p className="text-xs text-muted-foreground">Marketing Department</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HRDashboard;
