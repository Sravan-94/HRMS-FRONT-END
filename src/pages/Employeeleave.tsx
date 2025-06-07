import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';

interface LeaveRecord {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
  approvedBy: string;
}

const Employeeleave = () => {
  const empId = localStorage.getItem('empId'); // Use empId from localStorage
  const location = useLocation(); // Get the current location

  const [employeeLeaves, setEmployeeLeaves] = useState<LeaveRecord[]>([]);
  const [isRequestLeaveDialogOpen, setIsRequestLeaveDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [leaveReason, setLeaveReason] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });

  // Mock data for leave balances - typically fetched from backend as well
  const leaveBalances = {
    Casual: { total: 20, used: 8, remaining: 12 },
    sick: { total: 10, used: 2, remaining: 8 },
    unpaid: { total: 30, used: 0, remaining: 30 }
  };

  // Function to fetch leave history
  const fetchLeaveHistory = async () => {
    if (!empId) {
      console.log('Employee ID not available, skipping leave history fetch.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8080/leaves/employee/${empId}`);
      console.log('Leave history fetched at', new Date().toLocaleString(), ':', response.data);
      console.log('Fetched leave statuses:', response.data.map((leave: any) => ({
        id: leave.lid,
        status: leave.status,
      })));
      const fetchedLeaves: LeaveRecord[] = response.data.map((leave: any) => ({
        id: leave.lid,
        type: leave.leaveType,
        startDate: format(new Date(leave.leaveDate), 'yyyy-MM-dd'),
        endDate: format(new Date(leave.endDate), 'yyyy-MM-dd'),
        status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1).toLowerCase(), // Capitalize status
        reason: leave.reason || 'N/A', // API response might not have reason, so fallback to 'N/A'
        approvedBy: leave.status.toLowerCase() === 'pending' ? (leave.approvedBy || 'Pending') : (leave.approvedBy || '-'), // Set approvedBy based on status
      }));

      // Sort leaves by startDate in descending order (latest first)
      fetchedLeaves.sort((a, b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });

      // Only update state if the data has changed to prevent unnecessary re-renders
      if (JSON.stringify(fetchedLeaves) !== JSON.stringify(employeeLeaves)) {
        console.log('Updating employeeLeaves state with new data:', fetchedLeaves);
        setEmployeeLeaves(fetchedLeaves);
      } else {
        console.log('No changes in leave data, skipping state update.');
      }
    } catch (error) {
      console.error('Error fetching leave history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave history. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch leave history on component mount or when location changes
  useEffect(() => {
    fetchLeaveHistory();
  }, [empId, location.pathname]); // Re-run if empId or location.pathname changes

  // Set up polling to refresh leave history every 30 seconds
  useEffect(() => {
    const pollingInterval = 30 * 1000; // 30 seconds
    const intervalId = setInterval(() => {
      console.log('Polling leave history for updates at', new Date().toLocaleString(), '...');
      fetchLeaveHistory();
    }, pollingInterval);

    // Cleanup interval on component unmount
    return () => {
      console.log('Clearing polling interval on unmount.');
      clearInterval(intervalId);
    };
  }, [empId, location.pathname]); // Re-run polling if empId or location.pathname changes

  const handleRequestLeave = async () => {
    // Simple validation
    if (!leaveType || !fromDate || !toDate || !leaveReason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const empId = localStorage.getItem('empId'); // Use empId from localStorage
    if (!empId) {
      toast({
        title: "Error",
        description: "Employee ID not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    // Format dates to ISO string like '2025-06-10T09:00:00'
    const formattedFromDate = fromDate ? format(fromDate, 'yyyy-MM-dd') + 'T09:00:00' : '';
    const formattedToDate = toDate ? format(toDate, 'yyyy-MM-dd') + 'T18:00:00' : '';

    const leaveRequestData = {
      leaveType: leaveType,
      leaveDate: formattedFromDate,
      endDate: formattedToDate,
      status: 'Pending',
      empId: parseInt(empId),
      reason: leaveReason, // Include reason in the request
    };

    try {
      const response = await axios.post('http://localhost:8080/leaves/postemployeleaves', leaveRequestData);
      console.log('Leave request successful:', response.data);

      const newLeaveRecord = {
        id: response.data.lid,
        type: response.data.leaveType,
        startDate: format(new Date(response.data.leaveDate), 'yyyy-MM-dd'),
        endDate: format(new Date(response.data.endDate), 'yyyy-MM-dd'),
        status: response.data.status.charAt(0).toUpperCase() + response.data.status.slice(1).toLowerCase(),
        reason: leaveReason, // Use local state since API doesn't return reason
        approvedBy: 'Pending',
      };

      setEmployeeLeaves([...employeeLeaves, newLeaveRecord]);

      toast({
        title: "Leave Request Submitted",
        description: "Your leave request has been sent for approval.",
      });

      // Reset form fields
      setLeaveType('');
      setFromDate(undefined);
      setToDate(undefined);
      setLeaveReason('');
      setAttachment(null);

      // Close the dialog
      setIsRequestLeaveDialogOpen(false);

      // Fetch updated leave history immediately after submitting a new request
      await fetchLeaveHistory();

    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit leave request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter function for leave records
  const getFilteredLeaves = () => {
    if (!dateRange.from || !dateRange.to) {
      return employeeLeaves; // Return all leaves if no date range is set
    }
    return employeeLeaves.filter(leave => {
      const leaveStartDate = new Date(leave.startDate);
      const leaveEndDate = new Date(leave.endDate);
      return leaveStartDate >= dateRange.from! && leaveEndDate <= dateRange.to!;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Leave Management</h2>
            <p className="text-gray-600">View and request your leaves</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsRequestLeaveDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Leave
          </Button>
        </div>

        {/* Leave Balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Casual Leave</p>
                  <p className="text-2xl font-bold">{leaveBalances.Casual.remaining} days</p>
                  <p className="text-sm text-gray-500">Used: {leaveBalances.Casual.used}/{leaveBalances.Casual.total}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sick Leave</p>
                  <p className="text-2xl font-bold">{leaveBalances.sick.remaining} days</p>
                  <p className="text-sm text-gray-500">Used: {leaveBalances.sick.used}/{leaveBalances.sick.total}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unpaid Leave</p>
                  <p className="text-2xl font-bold">{leaveBalances.unpaid.remaining} days</p>
                  <p className="text-sm text-gray-500">Used: {leaveBalances.unpaid.used}/{leaveBalances.unpaid.total}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
          
        {/* Leave History */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Leave History</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "MMM dd") : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from || undefined}
                        onSelect={(date: Date | undefined) => {
                          setDateRange(prev => ({ ...prev, from: date || null }));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="text-gray-500">to</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "MMM dd") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to || undefined}
                        onSelect={(date: Date | undefined) => {
                          setDateRange(prev => ({ ...prev, to: date || null }));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setDateRange({ from: new Date(), to: new Date() })}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDateRange({ from: null, to: null });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getFilteredLeaves().length === 0 ? (
                <p className="text-gray-500">No leave records found for the selected date range.</p>
              ) : (
                getFilteredLeaves().map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">{leave.type}</h3>
                          <p className="text-sm text-gray-600">
                            {leave.startDate} to {leave.endDate}
                          </p>
                          <p className="text-sm text-gray-500">Reason: {leave.reason || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={
                          leave.status === 'Approved' ? 'default' : 
                          leave.status === 'Pending' ? 'secondary' : 
                          leave.status === 'Rejected' ? 'destructive' : 'outline'
                        }
                      >
                        {leave.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Leave Dialog */}
      <Dialog open={isRequestLeaveDialogOpen} onOpenChange={setIsRequestLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Apply Leave</DialogTitle>
            <DialogDescription>
              Fill in the details to request leave.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger id="leaveType">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "dd-MM-yyyy") : <span>dd-mm-yyyy</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "dd-MM-yyyy") : <span>dd-mm-yyyy</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Leave Reason</Label>
              <Textarea 
                id="reason" 
                placeholder="State your reason for leave" 
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                maxLength={500}
              />
              <p className="text-sm text-gray-500">Max 500 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachment">Attachment</Label>
              <Input 
                id="attachment" 
                type="file" 
                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
              />
              <p className="text-sm text-gray-500">Supported formats: jpeg, png, heic, pdf. Max file size: 5MB.</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleRequestLeave}>Apply Leave</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Employeeleave;
