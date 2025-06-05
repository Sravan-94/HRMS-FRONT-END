import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

const EmployeePerformance = () => {
  const userRole = localStorage.getItem('userRole') || 'employee';
  const userEmail = localStorage.getItem('userEmail'); // Assuming user email is used for filtering

  // Mock performance data - will need to be filtered for the logged-in employee
  const performanceData = [
    {
      id: 1,
      employee: 'John Doe',
      email: 'john@company.com',
      department: 'Engineering',
      productivity: 4.5,
      teamwork: 4.0,
      communication: 4.3,
      overallScore: Number(((4.5 + 4.0 + 4.3) / 3).toFixed(1)),
      goals: 'Excellent',
      lastReview: '2024-03-15'
    },
    {
      id: 2,
      employee: 'Sarah Wilson',
      email: 'sarah@company.com',
      department: 'Marketing',
      productivity: 4.8,
      teamwork: 4.6,
      communication: 4.7,
      overallScore: Number(((4.8 + 4.6 + 4.7) / 3).toFixed(1)),
      goals: 'Outstanding',
      lastReview: '2024-03-10'
    },
    {
      id: 3,
      employee: 'Mike Johnson',
      email: 'mike@company.com',
      department: 'Sales',
      productivity: 3.9,
      teamwork: 3.8,
      communication: 3.7,
      overallScore: Number(((3.9 + 3.8 + 3.7) / 3).toFixed(1)),
      goals: 'Good',
      lastReview: '2024-03-20'
    },
  ];

  // Filter data for the logged-in employee
  const employeePerformance = performanceData.find(emp => emp.email === userEmail);

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-yellow-600';
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Performance</h2>
            <p className="text-gray-600">View your performance metrics and reviews</p>
          </div>
        </div>

        {/* Personal Performance (for employees) */}
        {employeePerformance ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${getScoreColor(employeePerformance.overallScore)}`}>
                      {employeePerformance.overallScore.toFixed(1)}/5
                    </p>
                    <p className="text-gray-600">Overall Performance Score</p>
                    <Badge className={`mt-2 ${getGoalsBadge(employeePerformance.goals)}`}>
                      {employeePerformance.goals}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Productivity</span>
                        <span className="text-sm text-gray-600">{employeePerformance.productivity.toFixed(1)}/5</span>
                      </div>
                      <Progress value={(employeePerformance.productivity / 5) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Teamwork</span>
                        <span className="text-sm text-gray-600">{employeePerformance.teamwork.toFixed(1)}/5</span>
                      </div>
                      <Progress value={(employeePerformance.teamwork / 5) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Communication</span>
                        <span className="text-sm text-gray-600">{employeePerformance.communication.toFixed(1)}/5</span>
                      </div>
                      <Progress value={(employeePerformance.communication / 5) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Review</CardTitle>
              </CardHeader>
              <CardContent>
                {/* This section would typically show details of the latest review */}
                {/* For now, we can display the last review date from mock data */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Last review conducted on: {employeePerformance.lastReview}</p>
                  {/* Add more review details here as needed */}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-gray-600">
              No performance data available for this employee.
            </CardContent>
          </Card>
        )}

        {/* Current Goals (Adapt from general Performance page if needed) */}
        {/* Employee specific goals would go here */}
      </div>
    </DashboardLayout>
  );
};

export default EmployeePerformance; 