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
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Performance = () => {
  const storedUserRole = localStorage.getItem('userRole') || 'employee';
  const userRole = storedUserRole.toLowerCase(); // Convert to lowercase
  
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

  const [performanceData, setPerformanceData] = useState([
    {
      id: 1,
      employee: 'John Doe',
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
      department: 'Sales',
      productivity: 3.9,
      teamwork: 3.8,
      communication: 3.7,
      overallScore: Number(((3.9 + 3.8 + 3.7) / 3).toFixed(1)),
      goals: 'Good',
      lastReview: '2024-03-20'
    },
  ]);

  const [isCreateReviewModalOpen, setIsCreateReviewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [productivityRating, setProductivityRating] = useState<number | string>('');
  const [teamworkRating, setTeamworkRating] = useState<number | string>('');
  const [communicationRating, setCommunicationRating] = useState<number | string>('');

  // Add more state variables for other form inputs as needed

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

  const canManagePerformance = userRole === 'admin' || userRole === 'hr';

  const handleCreateReview = () => {
    // Convert ratings to numbers, default to 0 if invalid
    const prod = Number(productivityRating) || 0;
    const team = Number(teamworkRating) || 0;
    const comm = Number(communicationRating) || 0;

    // Basic validation (optional but recommended)
    if (prod < 0 || prod > 5 || team < 0 || team > 5 || comm < 0 || comm > 5) {
      console.error('Ratings must be between 0 and 5');
      // Optionally show a user-friendly error message
      return;
    }

    const averageScore = (prod + team + comm) / 3;

    // Handle form submission logic here
    console.log('Creating review for Employee ID:', selectedEmployee);
    console.log('Productivity:', prod);
    console.log('Teamwork:', team);
    console.log('Communication:', comm);
    console.log('Average Score:', averageScore.toFixed(2)); // Log average with 2 decimal places

    // Close modal after submission
    setIsCreateReviewModalOpen(false);
    setSelectedEmployee('');
    setProductivityRating('');
    setTeamworkRating('');
    setCommunicationRating('');
  };

  return (
    <DashboardLayout
      // sidebarItems and userRole are handled within DashboardLayout
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Performance Management</h2>
            <p className="text-gray-600">Track and manage employee performance metrics</p>
          </div>
          {canManagePerformance && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateReviewModalOpen(true)}>
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
                  <p className="text-2xl font-bold">4.2/5</p>
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
                  <p className="text-2xl font-bold">{performanceData.filter(p => p.overallScore >= 4.5).length}</p>
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
                          {employee.overallScore.toFixed(1)}/5
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
                          <span className="text-sm text-gray-600">{employee.productivity.toFixed(1)}/5</span>
                        </div>
                        <Progress value={(employee.productivity / 5) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Teamwork</span>
                          <span className="text-sm text-gray-600">{employee.teamwork.toFixed(1)}/5</span>
                        </div>
                        <Progress value={(employee.teamwork / 5) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Communication</span>
                          <span className="text-sm text-gray-600">{employee.communication.toFixed(1)}/5</span>
                        </div>
                        <Progress value={(employee.communication / 5) * 100} className="h-2" />
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
                    <p className="text-3xl font-bold text-blue-600">4.3/5</p>
                    <p className="text-gray-600">Overall Performance Score</p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">Excellent</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Goal Completion</span>
                        <span className="text-sm text-gray-600">4.3/5</span>
                      </div>
                      <Progress value={(4.3 / 5) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Project Delivery</span>
                        <span className="text-sm text-gray-600">4.6/5</span>
                      </div>
                      <Progress value={(4.6 / 5) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Skill Development</span>
                        <span className="text-sm text-gray-600">3.4/5</span>
                      </div>
                      <Progress value={(3.4 / 5) * 100} className="h-2" />
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
                      <Progress value={(4.3 / 5) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">86% Complete (4.3/5)</p>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">Complete React Training</h4>
                    <p className="text-sm text-gray-600">Finish advanced React course</p>
                    <div className="mt-2">
                      <Progress value={100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Completed ✓ (5/5)</p>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium">Team Leadership</h4>
                    <p className="text-sm text-gray-600">Lead cross-functional project team</p>
                    <div className="mt-2">
                      <Progress value={(3.0 / 5) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">60% Complete (3.0/5)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Review Dialog */}
      <Dialog open={isCreateReviewModalOpen} onOpenChange={setIsCreateReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Performance Review</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new performance review for an employee.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee</Label>
              <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {performanceData.map((employee) => (
                    <SelectItem key={employee.id} value={String(employee.id)}>{employee.employee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Productivity Input */}
            <div className="space-y-2">
              <Label htmlFor="productivity">Productivity (0-5)</Label>
              <Input
                id="productivity"
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="Enter rating (e.g., 4.5)"
                value={productivityRating}
                onChange={(e) => setProductivityRating(e.target.value)}
              />
            </div>

            {/* Teamwork Input */}
            <div className="space-y-2">
              <Label htmlFor="teamwork">Teamwork (0-5)</Label>
              <Input
                id="teamwork"
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="Enter rating (e.g., 4.0)"
                value={teamworkRating}
                onChange={(e) => setTeamworkRating(e.target.value)}
              />
            </div>

            {/* Communication Input */}
            <div className="space-y-2">
              <Label htmlFor="communication">Communication (0-5)</Label>
              <Input
                id="communication"
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="Enter rating (e.g., 5.0)"
                value={communicationRating}
                onChange={(e) => setCommunicationRating(e.target.value)}
              />
            </div>

            {/* Add more form fields here for review details */}
            {/* Example: Overall Score, Goals, Comments, etc. */}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReview}>
              Create Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Performance;
