import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  CheckCircle,
  XCircle,
  ClipboardList
} from 'lucide-react';
import axios from 'axios';
import { toast } from "@/components/ui/use-toast";
import dayjs from 'dayjs';

interface AttendanceRecord {
  id: number;
  date: string;
  clockIn: string;
  clockOut: string | null;
  duration: number;
  status: string;
  employee: {
    id: number;
    name: string;
    email: string;
  };
  loginImage: string | null;
  logoutImage: string | null;
}

const Attendance = () => {
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'employee';
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'hr') {
      setIsLoading(true);
      axios.get('http://localhost:8080/api/attendance/all')
        .then(response => {
          console.log('Raw API response:', JSON.stringify(response.data, null, 2));
          
          // Flatten the deeply nested structure and handle different field names
          const transformedData: AttendanceRecord[] = [];

          response.data.forEach((record: any) => {
            console.log('Processing raw record:', record);

            const employeeData = record.employee;
            console.log('Extracted employeeData:', employeeData);

            const employeeId = employeeData?.id || employeeData?.empId || null;
            const employeeName = employeeData?.ename || employeeData?.name || employeeData?.empName || 'Unknown Employee';
            const employeeEmail = employeeData?.email || employeeData?.empEmail || null;

            // Check if employeeData and attendances array exist and is not empty
            if (employeeData && Array.isArray(employeeData.attendances) && employeeData.attendances.length > 0) {
              employeeData.attendances.forEach((attendanceDetail: any) => {
                 console.log('Processing nested attendance detail:', attendanceDetail);

                // Explicitly access attendance detail fields, providing fallbacks
                const attendanceDate = attendanceDetail.date || attendanceDetail.attDate || null; // Added attDate as potential fallback
                const attendanceClockIn = attendanceDetail.clockIn || attendanceDetail.checkIn || null;
                const attendanceClockOut = attendanceDetail.clockOut || attendanceDetail.checkOut || null;
                const attendanceDuration = attendanceDetail.duration || attendanceDetail.attDuration || 0; // Added attDuration
                const attendanceStatus = attendanceDetail.status || attendanceDetail.attStatus || 'Unknown'; // Added attStatus
                const attendanceLoginImage = attendanceDetail.loginImage || attendanceDetail.checkInImage || null;
                const attendanceLogoutImage = attendanceDetail.logoutImage || attendanceDetail.checkOutImage || null;

                const transformedRecord: AttendanceRecord = {
                  id: attendanceDetail.id, // Use the attendance detail's id
                  date: attendanceDate, 
                  clockIn: attendanceClockIn,
                  clockOut: attendanceClockOut,
                  duration: attendanceDuration,
                  status: attendanceStatus,
                  employee: {
                    id: employeeId, // Use the extracted employee id
                    name: employeeName, // Use the extracted employee name
                    email: employeeEmail // Use the extracted employee email
                  },
                  loginImage: attendanceLoginImage,
                  logoutImage: attendanceLogoutImage
                };
                console.log('Transformed attendance record:', transformedRecord);
                transformedData.push(transformedRecord);
              });
            } else {
                console.warn('Skipping record due to missing employee or attendance details:', record);
            }
          });

          console.log('Final transformed attendance records:', JSON.stringify(transformedData, null, 2));
          setAttendanceData(transformedData);
        })
        .catch(error => {
          console.error('Error fetching attendance records:', error);
          console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config,
          });
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to fetch attendance records. Please try again.",
            variant: "destructive"
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userRole]);

  const getSidebarItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: `/${userRole}-dashboard`, active: false },
      { icon: Users, label: 'Employee Management', path: '/employee-management' },
      { icon: Calendar, label: 'Leave Management', path: '/leave-management' },
      { icon: Clock, label: 'Attendance', path: '/attendance', active: true },
      { icon: TrendingUp, label: 'Performance', path: '/performance' },
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

  const getStatusColor = (status: string | undefined) => {
    switch ((status || '').toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch ((status || '').toLowerCase()) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'late': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return dayjs(dateTime).format('hh:mm A');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Calculate attendance statistics with null checks
  const presentCount = attendanceData.filter(a => (a.status || '').toLowerCase() === 'present').length;
  const lateCount = attendanceData.filter(a => (a.status || '').toLowerCase() === 'late').length;
  const absentCount = attendanceData.filter(a => (a.status || '').toLowerCase() === 'absent').length;
  const totalEmployees = attendanceData.length;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Attendance Management</h2>
            <p className="text-gray-600">Track and manage employee attendance</p>
          </div>
          {userRole === 'employee' && (
            <div className="flex gap-2">
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Clock In
              </Button>
              <Button variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present Today</p>
                  <p className="text-2xl font-bold">{presentCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
                  <p className="text-2xl font-bold">{lateCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold">{absentCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold">{attendanceRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance - {dayjs().format('MMMM DD, YYYY')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading attendance records...</div>
            ) : attendanceData.length > 0 ? (
              <div className="space-y-4">
                {attendanceData.map((record) => {
                   console.log('Rendering record:', record);
                   return (
                  <div key={`${record.id}-${record.employee?.id}`} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-blue-600 text-white">
                          {(record.employee?.name || 'NA').split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{record.employee?.name || 'Unknown Employee'}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Check In: {record.clockIn ? formatDateTime(record.clockIn) : '-'}</span>
                          <span>Check Out: {record.clockOut ? formatDateTime(record.clockOut) : '-'}</span>
                          <span>Hours: {record.duration ? formatDuration(record.duration) : '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(record.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </Badge>
                    </div>
                    {/* Login and Logout Selfies */}
                    {(record.loginImage || record.logoutImage) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Login Selfie</p>
                          {record.loginImage ? (
                            <img
                              src={record.loginImage}
                              alt={`Login Selfie ${record.employee?.name || 'Employee'}`}
                              className="w-16 h-16 mx-auto rounded-full object-cover shadow-md"
                            />
                          ) : (
                            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Logout Selfie</p>
                          {record.logoutImage ? (
                            <img
                              src={record.logoutImage}
                              alt={`Logout Selfie ${record.employee?.name || 'Employee'}`}
                              className="w-16 h-16 mx-auto rounded-full object-cover shadow-md"
                            />
                          ) : (
                            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                 );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No attendance records found for today.</div>
            )}
          </CardContent>
        </Card>

        {/* Personal Attendance Summary (for employees) */}
        {userRole === 'employee' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Attendance This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Working Days</span>
                    <span className="text-sm text-gray-600">22 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Present</span>
                    <span className="text-sm text-green-600">20 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Absent</span>
                    <span className="text-sm text-red-600">1 day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Late Arrivals</span>
                    <span className="text-sm text-yellow-600">1 day</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Attendance Rate</span>
                      <span className="text-sm font-bold text-blue-600">91%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Clocked in at 9:00 AM</p>
                      <p className="text-xs text-gray-500">Today</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <XCircle className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Clocked out at 6:00 PM</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Late arrival - 9:15 AM</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
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

export default Attendance;
