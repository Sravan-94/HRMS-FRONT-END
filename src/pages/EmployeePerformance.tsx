import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { base_url } from '@/utils/config';

interface Review {
  id: number;
  empId: number;
  reviewText: string;
  rating: number;
  givenBy: string;
  createdAt?: string; // Optional, in case API provides timestamp
}

interface PerformanceData {
  id: number;
  employee: string;
  email: string;
  department: string;
  productivity: number;
  teamwork: number;
  communication: number;
  overallScore: number;
  goals: string;
  lastReview: string;
}

const EmployeePerformance = () => {
  const userRole = localStorage.getItem('userRole') || 'employee';
  const userEmail = localStorage.getItem('userEmail');
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock employee data (since no employee API is provided, using minimal data for the logged-in user)
  // In a real app, you might fetch this from an employee profile API
  const employeeInfo = {
    id: 2, // Assuming empId from test response; replace with actual API or auth data
    employee: 'Current Employee', // Replace with actual name from auth or API
    email: userEmail || 'unknown@company.com',
    department: 'Unknown', // Replace with actual department from API
  };

  // Fetch reviews for the employee
  useEffect(() => {
    const fetchEmployeeIdAndReviews = async () => {
      try {
        setLoading(true);
        // Note: Since no employee API is provided, assuming empId is known or fetched elsewhere
        // In a real app, you might need to fetch the employee ID based on userEmail
        const empId = employeeInfo.id; // Replace with actual logic to get empId
        setEmployeeId(empId);

        if (empId) {
          const response = await fetch(`${base_url}/reviews/employee/${empId}`);
          if (!response.ok) throw new Error('Failed to fetch reviews');
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeIdAndReviews();
  }, []);

  // Calculate performance data based on reviews
  useEffect(() => {
    if (reviews.length > 0 && employeeId) {
      const avgRating = Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1));
      const lastReviewDate = reviews.length
        ? new Date(Math.max(...reviews.map(r => new Date(r.createdAt || Date.now()).getTime()))).toISOString().split('T')[0]
        : 'N/A';

      setPerformanceData({
        id: employeeId,
        employee: employeeInfo.employee,
        email: employeeInfo.email,
        department: employeeInfo.department,
        productivity: avgRating,
        teamwork: avgRating,
        communication: avgRating,
        overallScore: avgRating,
        goals: avgRating >= 4.5 ? 'Outstanding' : avgRating >= 4.0 ? 'Excellent' : avgRating >= 3.5 ? 'Good' : 'Needs Improvement',
        lastReview: lastReviewDate,
      });
    } else {
      setPerformanceData(null);
    }
  }, [reviews, employeeId]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Performance</h2>
            <p className="text-gray-600">View your performance metrics and reviews</p>
          </div>
        </div>

        {performanceData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${getScoreColor(performanceData.overallScore)}`}>
                      {performanceData.overallScore.toFixed(1)}/5
                    </p>
                    <p className="text-gray-600">Overall Performance Score</p>
                    <Badge className={`mt-2 ${getGoalsBadge(performanceData.goals)}`}>
                      {performanceData.goals}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Productivity</span>
                        <span className="text-sm text-gray-600">{performanceData.productivity.toFixed(1)}/5</span>
                      </div>
                      <Progress value={(performanceData.productivity / 5) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Teamwork</span>
                        <span className="text-sm text-gray-600">{performanceData.teamwork.toFixed(1)}/5</span>
                      </div>
                      <Progress value={(performanceData.teamwork / 5) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Communication</span>
                        <span className="text-sm text-gray-600">{performanceData.communication.toFixed(1)}/5</span>
                      </div>
                      <Progress value={(performanceData.communication / 5) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map(review => (
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
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No reviews available</p>
                  )}
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
      </div>
    </DashboardLayout>
  );
};

export default EmployeePerformance;