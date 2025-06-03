
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Target,
  Star,
  Award,
  ClipboardList
} from 'lucide-react';

const Performance = () => {
  const userRole = localStorage.getItem('userRole') || 'employee';
  
  const getSidebarItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: `/${userRole}-dashboard`, active: false },
      { icon: Users, label: 'Employee Management', path: '/employee-management' },
      { icon: Calendar, label: 'Leave Management', path: '/leave-management' },
      { icon: Clock, label: 'Attendance', path: '/attendance' },
      { icon: TrendingUp, label: 'Performance', path: '/performance', active: true },
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

  const performanceData = [
    {
      id: 1,
      employee: 'John Doe',
      department: 'Engineering',
      overallScore: 88,
      goals: 'Excellent',
      productivity: 92,
      teamwork: 85,
      communication: 87,
      lastReview: '2024-03-15'
    },
    {
      id: 2,
      employee: 'Sarah Wilson',
      department: 'Marketing',
      overallScore: 91,
      goals: 'Outstanding',
      productivity: 95,
      teamwork: 89,
      communication: 90,
      lastReview: '2024-03-10'
    },
    {
      id: 3,
      employee: 'Mike Johnson',
      department: 'Sales',
      overallScore: 79,
      goals: 'Good',
      productivity: 82,
      teamwork: 78,
      communication: 77,
      lastReview: '2024-03-20'
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGoalsBadge = (goals: string) => {
    switch (goals) {
      case 'Outstanding': return 'bg-green-100 text-green-800';
      case 'Excellent': return 'bg-blue-100 text-blue-800';
      case 'Good': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManagePerformance = userRole === 'admin' || userRole === 'hr';

  return (
    <DashboardLayout
      sidebarItems={getSidebarItems()}
      title="Performance Management"
      userRole={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Performance Management</h2>
            <p className="text-gray-600">Track and manage employee performance metrics</p>
          </div>
          {canManagePerformance && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Target className="h-4 w-4 mr-2" />
              Create Review
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">86%</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Performers</p>
                  <p className="text-2xl font-bold">{performanceData.filter(p => p.overallScore >= 90).length}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviews Due</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Goals Met</p>
                  <p className="text-2xl font-bold">78%</p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        {(userRole === 'admin' || userRole === 'hr') && (
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceData.map((employee) => (
                  <div key={employee.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-blue-600 text-white">
                            {employee.employee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{employee.employee}</h3>
                          <p className="text-sm text-gray-600">{employee.department}</p>
                          <p className="text-xs text-gray-500">Last Review: {employee.lastReview}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(employee.overallScore)}`}>
                          {employee.overallScore}%
                        </p>
                        <Badge className={getGoalsBadge(employee.goals)}>
                          {employee.goals}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Productivity</span>
                          <span className="text-sm text-gray-600">{employee.productivity}%</span>
                        </div>
                        <Progress value={employee.productivity} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Teamwork</span>
                          <span className="text-sm text-gray-600">{employee.teamwork}%</span>
                        </div>
                        <Progress value={employee.teamwork} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Communication</span>
                          <span className="text-sm text-gray-600">{employee.communication}%</span>
                        </div>
                        <Progress value={employee.communication} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Performance (for employees) */}
        {userRole === 'employee' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">85%</p>
                    <p className="text-gray-600">Overall Performance Score</p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">Excellent</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Goal Completion</span>
                        <span className="text-sm text-gray-600">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Project Delivery</span>
                        <span className="text-sm text-gray-600">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Skill Development</span>
                        <span className="text-sm text-gray-600">67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Q2 Sales Target</h4>
                    <p className="text-sm text-gray-600">Achieve 120% of quarterly sales quota</p>
                    <div className="mt-2">
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">85% Complete</p>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">Complete React Training</h4>
                    <p className="text-sm text-gray-600">Finish advanced React course</p>
                    <div className="mt-2">
                      <Progress value={100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Completed ✓</p>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium">Team Leadership</h4>
                    <p className="text-sm text-gray-600">Lead cross-functional project team</p>
                    <div className="mt-2">
                      <Progress value={45} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">45% Complete</p>
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

export default Performance;
