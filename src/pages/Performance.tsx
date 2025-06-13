import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { base_url } from '@/utils/config';

interface Employee {
  empId: number;
  ename: string;
  email: string;
  department: string;
}

interface Review {
  id: number;
  empId: number;
  reviewText: string;
  rating: number;
  givenBy: string;
  createdAt?: string;
}

interface PerformanceData {
  id: number;
  employee: string;
  department: string;
  productivity: number;
  teamwork: number;
  communication: number;
  overallScore: number;
  goals: string;
  lastReview: string;
}

const Performance = () => {
  const storedUserRole = localStorage.getItem('userRole') || 'employee';
  const userRole = storedUserRole.toLowerCase();
  const userEmail = localStorage.getItem('userEmail');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isCreateReviewModalOpen, setIsCreateReviewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${base_url}/emps/getEmps`);
        if (!response.ok) throw new Error('Failed to fetch employees');
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${base_url}/reviews/all`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews');
      }
    };
    fetchReviews();
  }, []);

  // Calculate performance data
  useEffect(() => {
    const calculatePerformance = () => {
      const newPerformanceData = employees.map(emp => {
        const empReviews = reviews.filter(review => review.empId === emp.empId);
        const avgRating = empReviews.length
          ? Number((empReviews.reduce((sum, review) => sum + review.rating, 0) / empReviews.length).toFixed(1))
          : 0;
        
        return {
          id: emp.empId,
          employee: emp.ename,
          department: emp.department,
          productivity: avgRating,
          teamwork: avgRating,
          communication: avgRating,
          overallScore: avgRating,
          goals: avgRating >= 4.5 ? 'Outstanding' : avgRating >= 4.0 ? 'Excellent' : avgRating >= 3.5 ? 'Good' : 'Needs Improvement',
          lastReview: empReviews.length 
            ? new Date(Math.max(...empReviews.map(r => new Date(r.createdAt || Date.now()).getTime()))).toISOString().split('T')[0]
            : 'N/A'
        };
      });
      setPerformanceData(newPerformanceData);
    };
    if (employees.length > 0) {
      calculatePerformance();
    }
  }, [employees, reviews]);

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

  const handleCreateReview = async () => {
    if (!selectedEmployee || !reviewText || !rating) {
      setError('Please fill all fields');
      return;
    }

    const reviewerEmployee = employees.find(emp => emp.email === userEmail);
    const givenByName = reviewerEmployee ? reviewerEmployee.ename : 'Unknown Reviewer';

    const payload = {
      empId: Number(selectedEmployee),
      reviewText,
      rating: parseFloat(rating),
      givenBy: givenByName,
    };

    try {
      const response = await axios.post(`${base_url}/reviews/give`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const newReview = response.data;
      setReviews(prevReviews => [...prevReviews, newReview]);

      setIsCreateReviewModalOpen(false);
      setSelectedEmployee('');
      setReviewText('');
      setRating('');
      setError(null);
      toast({
        title: "Success",
        description: "Performance review submitted successfully!",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setError(error.response?.data?.message || "Failed to submit review");
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6 text-center text-gray-600">
            Loading...
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const employeePerformance = performanceData.find(emp => emp.employee === employees.find(e => e.email === userEmail)?.ename);

  return (
    <DashboardLayout>
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">
                    {performanceData.length ? (performanceData.reduce((sum, p) => sum + p.overallScore, 0) / performanceData.length).toFixed(1) : '0.0'}/5
                  </p>
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
                  <p className="text-2xl font-bold">{employees.length - performanceData.filter(p => p.lastReview !== 'N/A').length}</p>
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
                  <p className="text-2xl font-bold">
                    {performanceData.length ? Math.round((performanceData.filter(p => p.overallScore >= 4.0).length / performanceData.length) * 100) : 0}%
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

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
                            {(employee.employee || 'NA').split(' ').map(n => n[0]).join('')}
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
                {performanceData.length === 0 && (
                  <p className="text-center text-gray-600">No performance data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {userRole === 'employee' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {employeePerformance ? (
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
                ) : (
                  <p className="text-center text-gray-600">No performance data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employeePerformance && reviews
                    .filter(review => review.empId === employeePerformance.id)
                    .map(review => (
                      <div key={review.id} className="border-b pb-4">
                        <p className="text-sm text-gray-600">Rating: {review.rating}/5</p>
                        <p className="text-sm text-gray-600">Review: {review.reviewText}</p>
                        <p className="text-sm text-gray-600">Given by: {review.givenBy}</p>
                        {review.createdAt && (
                          <p className="text-sm text-gray-600">
                            Date: {new Date(review.createdAt).toISOString().split('T')[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  {(!employeePerformance || reviews.filter(review => review.empId === employeePerformance?.id).length === 0) && (
                    <p className="text-sm text-gray-600">No reviews available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

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
              <Select onValueChange={(value) => { setSelectedEmployee(value); }} value={selectedEmployee}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Select an employee">
                    {selectedEmployee
                      ? (employees.find(emp => String(emp.empId) === selectedEmployee)?.ename ?? employees.find(emp => String(emp.empId) === selectedEmployee)?.email) + ' (' + (employees.find(emp => String(emp.empId) === selectedEmployee)?.email ?? '') + ')'
                      : "Select an employee"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {employees.length > 0 && employees.map((employee) => (
                    <SelectItem key={employee.empId} value={String(employee.empId)}>
                      {employee.ename} ({employee.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewText">Review Comments</Label>
              <Textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Enter review comments"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="Enter rating (e.g., 4.5)"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
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