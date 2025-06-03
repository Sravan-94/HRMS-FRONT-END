import { useState } from 'react';
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

const Employeeleave = () => {
  const userId = localStorage.getItem('userId') || '1';

  // Mock data for a single employee's leaves
  const initialEmployeeLeaves = [
    { 
      id: 1, 
      type: 'Casual Leave',
      startDate: '2024-03-15',
      endDate: '2024-03-18',
      status: 'Approved',
      reason: 'Family vacation',
      approvedBy: 'Sarah Wilson (HR)'
    },
    { 
      id: 2, 
      type: 'Sick Leave',
      startDate: '2024-02-20',
      endDate: '2024-02-21',
      status: 'Approved',
      reason: 'Medical appointment',
      approvedBy: 'Sarah Wilson (HR)'
    },
    { 
      id: 3, 
      type: 'Casual Leave',
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      status: 'Pending',
      reason: 'Personal work',
      approvedBy: 'Pending'
    },
  ];

  const [employeeLeaves, setEmployeeLeaves] = useState(initialEmployeeLeaves);
  const [isRequestLeaveDialogOpen, setIsRequestLeaveDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [leaveReason, setLeaveReason] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  // Mock data for leave balances
  const leaveBalances = {
    Casual: { total: 20, used: 8, remaining: 12 },
    sick: { total: 10, used: 2, remaining: 8 },
    unpaid: { total: 30, used: 0, remaining: 30 }
  };

  const handleRequestLeave = () => {
    // Simple validation
    if (!leaveType || !fromDate || !toDate || !leaveReason) {
      alert('Please fill in all required fields.');
      return;
    }

    const newLeaveRequest = {
      id: employeeLeaves.length + 1, // Simple unique ID for mock data
      type: leaveType,
      startDate: format(fromDate, 'yyyy-MM-dd'),
      endDate: format(toDate, 'yyyy-MM-dd'),
      status: 'Pending', // Always pending initially
      reason: leaveReason,
      approvedBy: 'Pending',
      // attachment: attachment // Handle attachment upload separately in a real app
    };

    // Add the new leave request to the state
    setEmployeeLeaves([...employeeLeaves, newLeaveRequest]);

    // Reset form fields
    setLeaveType('');
    setFromDate(undefined);
    setToDate(undefined);
    setLeaveReason('');
    setAttachment(null);

    // Close the dialog
    setIsRequestLeaveDialogOpen(false);

    // In a real application, you would send this data to the backend
    console.log('New Leave Request:', newLeaveRequest);
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
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeeLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                <div>
                        <h3 className="font-semibold">{leave.type}</h3>
                        <p className="text-sm text-gray-600">
                          {leave.startDate} to {leave.endDate}
                        </p>
                        <p className="text-sm text-gray-500">Reason: {leave.reason}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={
                        leave.status === 'Approved' ? 'default' : 
                        leave.status === 'Pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {leave.status}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      {leave.approvedBy}
                    </p>
                  </div>
                </div>
              ))}
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
                  {/* Add more leave types as needed */}
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
