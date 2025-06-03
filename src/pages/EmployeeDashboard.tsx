import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/DashboardLayout';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  User,
  CalendarDays,
  Target,
  Award
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const EmployeeDashboard = () => {
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/employee-dashboard', active: true },
    { icon: Calendar, label: 'Leaves Management', path: '/employee-leaves' },
    { icon: Clock, label: 'Your Attendance', path: '/employee-attendance' },
    { icon: TrendingUp, label: 'Performance', path: '/employee/performance' },
    { icon: FileText, label: 'Documents', path: '/employee/documents' },
    { icon: User, label: 'Profile', path: '/employee/profile' },
  ];

  // Mock data for recent leaves (limited for dashboard view)
  const recentLeaves = [
    { 
      id: 3, 
      type: 'Casual Leave',
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      status: 'Pending',
    },
    { 
      id: 2, 
      type: 'Sick Leave',
      startDate: '2024-02-20',
      endDate: '2024-02-21',
      status: 'Approved',
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Employee Dashboard"
      userRole="Employee"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, John!</h2>
                <p className="text-blue-100">Have a great day at work</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100">Today's Date</p>
                <p className="text-xl font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18 days</div>
              <p className="text-xs text-muted-foreground">Available to use</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">176h</div>
              <p className="text-xs text-muted-foreground">Hours worked</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Goal completion</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-16 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                <Calendar className="h-5 w-5" />
                Request Leave
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <Clock className="h-5 w-5" />
                Clock In/Out
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <FileText className="h-5 w-5" />
                View Payslip
              </Button>
            </div>
          </CardContent>
        </Card> */}

        {/* Recent Leaves & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leaves */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLeaves.length > 0 ? (
                  recentLeaves.map(leave => (
                    <div key={leave.id} className="flex items-center justify-between p-3 border rounded-md shadow-sm">
                      <div>
                        <h3 className="text-sm font-medium">{leave.type}</h3>
                        <p className="text-xs text-gray-500">{leave.startDate} to {leave.endDate}</p>
                      </div>
                      <Badge 
                        variant={
                          leave.status === 'Approved' ? 'default' :
                          leave.status === 'Pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {leave.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No recent leave requests.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Clocked in at 9:00 AM</p>
                    <p className="text-xs text-muted-foreground">Today</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed training module</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Leave request approved</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Performance review scheduled</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
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

export default EmployeeDashboard;
