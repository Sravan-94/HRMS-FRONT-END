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
  ClipboardList,
  Search,
  CalendarIcon
} from 'lucide-react';
import axios from 'axios';
import { toast } from "@/components/ui/use-toast";
import dayjs from 'dayjs';
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as UiCalendar } from "@/components/ui/calendar";
import { base_url } from '@/utils/config';

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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    if (userRole === 'admin' || userRole === 'hr') {
      setIsLoading(true);
      axios.get(`${base_url}/api/attendance/all`)
        .then(response => {
          console.log('Raw API response:', JSON.stringify(response.data, null, 2));
          
          // Flatten the deeply nested structure and handle different field names
          const transformedData: AttendanceRecord[] = [];

          // Iterate directly over the attendance records received from the API
          response.data.forEach((record: any) => {
            console.log('Processing raw record:', record);

            const employeeData = record.employee;
            console.log('Extracted employeeData:', employeeData);

            // Explicitly access attendance detail fields, providing fallbacks
            const attendanceDate = record.date || record.attDate || null;
            const attendanceClockIn = record.clockIn || record.checkIn || null;
            const attendanceClockOut = record.clockOut || record.checkOut || null;
            const attendanceDuration = record.duration || record.attDuration || 0;
            const attendanceStatus = record.status || record.attStatus || 'Unknown';
            const attendanceLoginImage = record.setCheckInImageUrl || record.loginImage || record.checkInImage || null;
            const attendanceLogoutImage = record.setCheckOutImageUrl || record.logoutImage || record.checkOutImage || null;

            const employeeId = employeeData?.empId || employeeData?.id || null;
            const employeeName = employeeData?.ename || employeeData?.name || employeeData?.empName || 'Unknown Employee';
            const employeeEmail = employeeData?.email || employeeData?.empEmail || null;

            const transformedRecord: AttendanceRecord = {
              id: record.id, // Use the attendance record's id
              date: attendanceDate, 
              clockIn: attendanceClockIn,
              clockOut: attendanceClockOut,
              duration: attendanceDuration,
              status: attendanceStatus,
              employee: {
                id: employeeId,
                name: employeeName,
                email: employeeEmail
              },
              loginImage: attendanceLoginImage,
              logoutImage: attendanceLogoutImage
            };
            console.log('Transformed attendance record:', transformedRecord);
            transformedData.push(transformedRecord);
          });

          console.log('Final transformed attendance records:', JSON.stringify(transformedData, null, 2));

          // Sort attendance data: logged in users first, then by date/clockIn descending
          transformedData.sort((a, b) => {
            const aHasClockIn = !!a.clockIn;
            const bHasClockIn = !!b.clockIn;

            // Prioritize records with clockIn
            if (aHasClockIn && !bHasClockIn) return -1; // a comes first
            if (!aHasClockIn && bHasClockIn) return 1;  // b comes first

            // If both have clockIn or neither has clockIn, sort by timestamp descending
            const aTime = aHasClockIn ? dayjs(a.clockIn) : dayjs(a.date);
            const bTime = bHasClockIn ? dayjs(b.clockIn) : dayjs(b.date);

            return bTime.valueOf() - aTime.valueOf(); // Latest first
          });

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
    if (!seconds || seconds <= 0) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateDuration = (clockIn: string | null, clockOut: string | null) => {
    if (!clockIn || !clockOut) return 0;
    const start = dayjs(clockIn);
    const end = dayjs(clockOut);
    return end.diff(start, 'second');
  };

  // Calculate attendance statistics with null checks
  const presentCount = attendanceData.filter(a => (a.status || '').toLowerCase() === 'present').length;
  const lateCount = attendanceData.filter(a => (a.status || '').toLowerCase() === 'late').length;
  const absentCount = attendanceData.filter(a => (a.status || '').toLowerCase() === 'absent').length;
  const totalEmployees = attendanceData.length;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

  // Filter function
  const getFilteredAttendance = () => {
    return attendanceData.filter(record => {
      // Status filter
      if (statusFilter !== 'all' && record.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Date filter
      if (dateFilter) {
        const recordDate = dayjs(record.date).format('YYYY-MM-DD');
        const filterDate = dayjs(dateFilter).format('YYYY-MM-DD');
        if (recordDate !== filterDate) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          record.employee.name.toLowerCase().includes(query) ||
          record.employee.email.toLowerCase().includes(query)
        );
      }

      return true;
    });
  };

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

        {/* Filters Section */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <UiCalendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={(date: Date | undefined) => {
                        if (date instanceof Date) {
                          setDateFilter(date);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-0">Clear</label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStatusFilter('all');
                    setDateFilter(undefined);
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Attendance List */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredAttendance().map((record) => {
                  const duration = calculateDuration(record.clockIn, record.clockOut);
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
                            <span>Hours: {formatDuration(duration)}</span>
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
