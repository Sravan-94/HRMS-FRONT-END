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
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from "date-fns";
import { toast } from '@/components/ui/use-toast';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { base_url } from '@/utils/config';

dayjs.extend(quarterOfYear);

interface LeaveRecord {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
  approvedBy?: string;
  days?: number;
}

interface AttendanceRecord {
  id: number;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  duration?: number | null; // Duration in seconds
  status: string;
  employee: {
    empId: number;
    ename: string;
    email: string;
  };
  location?: string;
  setCheckInImageUrl?: string | null;
  setCheckOutImageUrl?: string | null;
}

const EmployeeDashboard = () => {
  const [recentLeaves, setRecentLeaves] = useState<LeaveRecord[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<number | 'Loading...' | 'Error'>('Loading...');
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);

  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [hoursWorkedThisMonth, setHoursWorkedThisMonth] = useState<string | 'Loading...'>('Loading...');
  const [attendanceRateThisQuarter, setAttendanceRateThisQuarter] = useState<string | 'Loading...'>('Loading...');
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);

  const employeeName = localStorage.getItem('ename') || 'Employee'; // Get employee name from localStorage
  const empId = localStorage.getItem('empId'); // Get empId from localStorage

  // Fetch employee's leave history
  useEffect(() => {
    const fetchLeaveHistory = async () => {
      if (!empId) {
        console.log('Employee ID not available, skipping leave history fetch.');
        setLeaveBalance(0);
        setIsLoadingLeaves(false);
        return;
      }
      try {
        const response = await axios.get(`${base_url}/leaves/employee/${empId}`);
        console.log('Leave history fetched for dashboard:', response.data);

        const fetchedLeaves: LeaveRecord[] = response.data.map((leave: any) => ({
          id: leave.lid,
          type: leave.leaveType,
          startDate: format(new Date(leave.leaveDate), 'yyyy-MM-dd'),
          endDate: format(new Date(leave.endDate), 'yyyy-MM-dd'),
          status: leave.status,
          reason: leave.reason || 'N/A',
          approvedBy: leave.approvedBy || 'Pending',
          days: leave.days,
        }));

        // Sort leaves by date descending to get recent ones
        fetchedLeaves.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

        // Display only the most recent leaves (e.g., top 5)
        setRecentLeaves(fetchedLeaves.slice(0, 5));

        // Calculate remaining leave balance (assuming total - used leaves with status Approved)
        // NOTE: This calculation assumes 'total' leave days are fixed or fetched elsewhere.
        // A more robust solution would involve a backend endpoint for leave balances.
        const totalLeaveDaysAvailable = 20; // Example total available days, replace with actual data if available
        const usedLeaveDaysAccurate = fetchedLeaves
          .filter(leave => leave.status.toLowerCase() === 'approved')
          .reduce((sum, leave) => sum + (leave.days || calculateDays(leave.startDate, leave.endDate)), 0);

        setLeaveBalance(totalLeaveDaysAvailable - usedLeaveDaysAccurate);

      } catch (error) {
        console.error('Error fetching leave history for dashboard:', error);
        toast({
          title: "Error",
          description: "Failed to fetch recent leaves or leave balance.",
          variant: "destructive",
        });
        setLeaveBalance('Error');
      } finally {
        setIsLoadingLeaves(false);
      }
    };

    fetchLeaveHistory();
  }, [empId]);

  // Fetch employee's attendance history and calculate metrics
  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!empId) {
        console.log('Employee ID not available, skipping attendance history fetch.');
        setHoursWorkedThisMonth('N/A');
        setAttendanceRateThisQuarter('N/A');
        setIsLoadingAttendance(false);
        return;
      }
      try {
        const response = await axios.get(`${base_url}/api/attendance/employee/${empId}`);
        console.log('Attendance history fetched for dashboard:', response.data);

        const fetchedAttendance: AttendanceRecord[] = response.data.map((record: any) => ({
           id: record.id,
           date: record.date || record.attDate,
           clockIn: record.clockIn || record.checkIn || null,
           clockOut: record.clockOut || record.checkOut || null,
           duration: record.duration || record.attDuration || null,
           status: record.status || record.attStatus || 'Unknown',
           employee: record.employee,
           location: record.location,
           setCheckInImageUrl: record.setCheckInImageUrl,
           setCheckOutImageUrl: record.setCheckOutImageUrl,
        }));

        setAttendanceHistory(fetchedAttendance);

        // Calculate hours worked this month
        const currentMonth = dayjs().month();
        const currentYear = dayjs().year();

        const totalSecondsThisMonth = fetchedAttendance
          .filter(record => {
            const recordDate = dayjs(record.date);
            return recordDate.month() === currentMonth && recordDate.year() === currentYear && record.duration !== null;
          })
          .reduce((sum, record) => sum + (record.duration || 0), 0);

        const hours = Math.floor(totalSecondsThisMonth / 3600);
        const minutes = Math.floor((totalSecondsThisMonth % 3600) / 60);
        setHoursWorkedThisMonth(`${hours}h ${minutes}m`);

        // Calculate attendance rate this quarter
        const currentQuarter = dayjs().quarter();
        const recordsThisQuarter = fetchedAttendance.filter(record => {
          const recordDate = dayjs(record.date);
          return recordDate.quarter() === currentQuarter && recordDate.year() === currentYear;
        });

        const presentDaysThisQuarter = recordsThisQuarter.filter(record => (record.status || '').toLowerCase() === 'present').length;
        const totalDaysThisQuarter = recordsThisQuarter.length;

        const attendanceRate = totalDaysThisQuarter > 0 ? Math.round((presentDaysThisQuarter / totalDaysThisQuarter) * 100) : 0;
        setAttendanceRateThisQuarter(`${attendanceRate}%`);

      } catch (error) {
        console.error('Error fetching attendance history for dashboard:', error);
        toast({
          title: "Error",
          description: "Failed to fetch attendance data.",
          variant: "destructive",
        });
        setHoursWorkedThisMonth('Error');
        setAttendanceRateThisQuarter('Error');
      } finally {
        setIsLoadingAttendance(false);
      }
    };

    fetchAttendanceHistory();
  }, [empId]);

  // Reusing calculateDays function from LeaveManagement.tsx (ensure this is consistent or fetch from a shared utility)
  const calculateDays = (startDateStr: string, endDateStr: string): number => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0; // Handle invalid dates
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {employeeName}!</h2>
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
              <div className="text-2xl font-bold">{isLoadingLeaves ? '...' : leaveBalance} days</div>
              <p className="text-xs text-muted-foreground">Available to use</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingAttendance ? '...' : hoursWorkedThisMonth}</div>
              <p className="text-xs text-muted-foreground">Hours worked</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-- %</div>
              <p className="text-xs text-muted-foreground">Goal completion</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingAttendance ? '...' : attendanceRateThisQuarter}</div>
              <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Leaves & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leaves */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingLeaves ? (
                  <p className="text-center text-gray-500">Loading recent leaves...</p>
                ) : recentLeaves.length > 0 ? (
                  recentLeaves.map(leave => (
                    <div key={leave.id} className="flex items-center justify-between p-3 border rounded-md shadow-sm">
                      <div>
                        <h3 className="text-sm font-medium">{leave.type}</h3>
                        <p className="text-xs text-gray-500">{leave.startDate} to {leave.endDate}</p>
                      </div>
                      <Badge 
                        variant={
                          leave.status.toLowerCase() === 'approved' ? 'default' :
                          leave.status.toLowerCase() === 'pending' ? 'secondary' : 'destructive'
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
