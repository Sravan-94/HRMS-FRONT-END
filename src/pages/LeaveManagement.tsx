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
  Plus,
  Check,
  X,
  ClipboardList,
  Loader2,
  Search,
  CalendarIcon
} from 'lucide-react';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as UiCalendar } from "@/components/ui/calendar";
import { base_url } from '@/utils/config';

interface LeaveRequest {
  id: number;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason: string;
}

interface Employee {
  empId: number;
  ename: string;
  // Add other employee properties if needed
}

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]); // State to store employee list
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  const getSidebarItems = () => {
    return [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: false },
      { icon: Users, label: 'Employee Management', path: '/employee-management' },
      { icon: Calendar, label: 'Leave Management', path: '/leave-management', active: true },
      { icon: Clock, label: 'Attendance', path: '/attendance' },
      { icon: TrendingUp, label: 'Performance', path: '/performance' },
      { icon: FileText, label: 'Documents', path: '/documents' },
      { icon: DollarSign, label: 'Payroll', path: '/payroll' },
      { icon: Settings, label: 'Settings', path: '/settings' }
    ];
  };

  // Fetch all employees
  const fetchAllEmployees = async () => {
    try {
      const response = await axios.get(`${base_url}/emps/getEmps`);
      console.log('Fetched employees:', response.data);
      // Assuming the API returns an array of employee objects with empId and ename
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employee list.",
        variant: "destructive"
      });
    }
  };

  // Fetch all leaves and then match with employees
  const fetchAllLeaves = async () => {
    setIsLoading(true);
    try {
      // Fetch leaves and employees concurrently
      const [leavesResponse, employeesResponse] = await Promise.all([
        axios.get(`${base_url}/leaves/getAllLeaves`),
        axios.get(`${base_url}/emps/getEmps`) // Fetch employees here as well
      ]);

      console.log('Raw leaves data:', leavesResponse.data);
      console.log('Raw employees data:', employeesResponse.data);

      const employeesMap = new Map<number, string>();
      employeesResponse.data.forEach((emp: any) => {
        if (emp.empId != null) {
          employeesMap.set(emp.empId, emp.ename);
        }
      });

      console.log('Employees map:', Object.fromEntries(employeesMap));

      // Transform the API response to match our LeaveRequest interface
      const transformedLeaves: LeaveRequest[] = leavesResponse.data
        .filter((leave: any) => {
          console.log('Processing leave:', leave);
          return leave && leave.emId != null;
        })
        .map((leave: any) => {
          const transformed = {
            id: leave.emId,
            employee: employeesMap.get(leave.empId) || 'Unknown Employee',
            type: leave.leaveType || 'Unknown Type',
            startDate: new Date(leave.leaveDate).toISOString().split('T')[0],
            endDate: new Date(leave.endDate).toISOString().split('T')[0],
            days: calculateDays(new Date(leave.leaveDate), new Date(leave.endDate)),
            status: leave.status || 'Pending',
            reason: leave.reason || 'No reason provided'
          };
          console.log('Transformed leave:', transformed);
          return transformed;
        });

      console.log('Final transformed leaves:', transformedLeaves);
      
      // Sort leaves: Pending first, then Approved, then Rejected
      const sortedLeaves = transformedLeaves.sort((a, b) => {
        const statusOrder: { [key: string]: number } = {
          'pending': 1,
          'approved': 2,
          'rejected': 3,
        };
        
        const statusA = a.status.toLowerCase();
        const statusB = b.status.toLowerCase();

        // Sort primarily by status order
        if (statusOrder[statusA] < statusOrder[statusB]) return -1;
        if (statusOrder[statusA] > statusOrder[statusB]) return 1;

        // If statuses are the same, maintain existing sort (e.g., by date if previously sorted)
        // Currently sorted by startDate descending, let's keep that as secondary sort
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });

      setLeaveRequests(sortedLeaves);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave requests or employee data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchAllLeaves(); // This now fetches both leaves and employees
  }, []);

  const calculateDays = (startDate: Date, endDate: Date): number => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAccept = async (id: number) => {
    try {
      setIsActionLoading(id);
      // Assuming the backend expects a PUT request with the status in the body
      const response = await axios.put(`${base_url}/leaves/${id}/accept`, { status: 'Approved' });
      console.log('Leave accepted:', response.data);
      
      // Update the local state with the new status
      setLeaveRequests(leaveRequests.map(request =>
        request.id === id ? { ...request, status: 'Approved' } : request
      ));
      
      toast({
        title: "Success",
        description: "Leave request has been approved.",
      });
    } catch (error) {
      console.error('Error accepting leave:', error);
      toast({
        title: "Error",
        description: "Failed to approve leave request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsActionLoading(null); // Reset loading state
    }
  };

  const handleReject = async (id: number) => {
    try {
      setIsActionLoading(id);
      // Assuming the backend expects a PUT request with the status in the body
      const response = await axios.put(`${base_url}/leaves/${id}/reject`, { status: 'Rejected' });
      console.log('Leave rejected:', response.data);
      
      // Update the local state with the new status
      setLeaveRequests(leaveRequests.map(request =>
        request.id === id ? { ...request, status: 'Rejected' } : request
      ));
      
      toast({
        title: "Success",
        description: "Leave request has been rejected.",
      });
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast({
        title: "Error",
        description: "Failed to reject leave request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsActionLoading(null); // Reset loading state
    }
  };

  // Filter function
  const getFilteredLeaves = () => {
    return leaveRequests.filter(leave => {
      // Status filter
      if (statusFilter !== 'all' && leave.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Date range filter
      if (dateRange.from && dateRange.to) {
        const leaveStartDate = new Date(leave.startDate);
        const leaveEndDate = new Date(leave.endDate);
        if (leaveStartDate < dateRange.from || leaveEndDate > dateRange.to) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          leave.employee.toLowerCase().includes(query) ||
          leave.type.toLowerCase().includes(query) ||
          leave.reason.toLowerCase().includes(query)
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
            <h2 className="text-3xl font-bold text-gray-900">Leave Management</h2>
            <p className="text-gray-600">Manage employee leave requests and balances</p>
          </div>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "PPP") : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <UiCalendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date: Date | undefined) => setDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <UiCalendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date: Date | undefined) => setDateRange(prev => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Search Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, type, or reason"
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
                    setDateRange({ from: undefined, to: undefined });
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
          <Card key="pending-requests">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status.toLowerCase() === 'pending').length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card key="approved-today">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Today</p>
                  <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status.toLowerCase() === 'approved').length}</p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card key="total-requests">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold">{leaveRequests.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card key="average-days">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Days</p>
                  <p className="text-2xl font-bold">
                    {leaveRequests.length > 0 
                      ? Math.round(leaveRequests.reduce((acc, req) => acc + req.days, 0) / leaveRequests.length)
                      : 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading leave requests...</span>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No leave requests found.
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredLeaves().map((request) => (
                  <div 
                    key={`leave-${request.id}-${request.employee}`} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-blue-600 text-white">
                          {/* Display the first two initials of the employee name */}
                          {request.employee.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{request.employee}</h3>
                        <p className="text-sm text-gray-600">{request.type} • {request.days} day(s)</p>
                        <p className="text-sm text-gray-500">{request.startDate} to {request.endDate}</p>
                        <p className="text-sm text-gray-500 italic">"{request.reason}"</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      {request.status.toLowerCase() === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAccept(request.id)}
                            disabled={isActionLoading === request.id}
                          >
                            {isActionLoading === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Accept'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request.id)}
                            disabled={isActionLoading === request.id}
                          >
                            {isActionLoading === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Reject'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Balance (for employees) */}
        {/* {userRole === 'employee' && (
          <Card>
            <CardHeader>
              <CardTitle>My Leave Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Annual Leave</h3>
                  <p className="text-2xl font-bold text-blue-600">18 days</p>
                  <p className="text-sm text-blue-700">Available</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">Sick Leave</h3>
                  <p className="text-2xl font-bold text-green-600">7 days</p>
                  <p className="text-sm text-green-700">Available</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Personal Leave</h3>
                  <p className="text-2xl font-bold text-purple-600">3 days</p>
                  <p className="text-sm text-purple-700">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}
      </div>
    </DashboardLayout>
  );
};

export default LeaveManagement;
