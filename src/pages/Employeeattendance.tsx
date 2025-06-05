import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import dayjs from 'dayjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

interface AttendanceRecord {
  id: number;
  date: string;
  clockIn: string;
  clockOut: string | null;
  status: string;
  location: string;
  setCheckInImageUrl: string | null;
  setCheckOutImageUrl: string | null;
  employee: {
    empId: number;
    ename: string;
    email: string;
  };
  duration?: number;
}

// Helper function to format time in HH:MM:SS
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to format duration in Hh M m S s
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
};

// Helper function to format date and time
const formatDateTime = (dateTime: string) => {
  return dayjs(dateTime).format('MMM DD, YYYY hh:mm A');
};

// Helper function to format hours and minutes worked
const formatHoursWorked = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const AttendancePage: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginImage, setLoginImage] = useState<string | null>(null);
  const [logoutImage, setLogoutImage] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'login' | 'logout' | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(9 * 60 * 60);
  const [loginTime, setLoginTime] = useState<string | null>(null);
  const [showLogoutSummary, setShowLogoutSummary] = useState(false);
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [logoutTime, setLogoutTime] = useState<string | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [currentDayRecord, setCurrentDayRecord] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const todayKey = dayjs().format('YYYY-MM-DD');
  const userEmail = localStorage.getItem('userEmail');
  const retrievedEmpId = localStorage.getItem('empId'); // Retrieve empId using the correct key

  console.log('Retrieved empId from localStorage:', retrievedEmpId);

  // Fetch attendance history from API
  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!retrievedEmpId) { // Use retrievedEmpId for the check
        console.log('empId not available, skipping API call');
        return;
      }
      
      try {
        console.log(`Fetching attendance history for empId: ${retrievedEmpId}`);
        const response = await axios.get(`http://localhost:8080/api/attendance/employee/${retrievedEmpId}`);
        console.log('Attendance history API response:', response.data);
        const history: AttendanceRecord[] = response.data;
        setAttendanceHistory(history);

        console.log('Raw attendance history state after API call:', history);

        // Find today's record
        const todayRecord = history.find(record => record.date === todayKey);
        if (todayRecord) {
          setCurrentDayRecord(todayRecord);
          if (todayRecord.clockIn && !todayRecord.clockOut) {
            setIsLoggedIn(true);
            setLoginImage(todayRecord.setCheckInImageUrl);
            setLoginTime(todayRecord.clockIn);

            const loginTime = dayjs(todayRecord.clockIn);
            const now = dayjs();
            const elapsedSeconds = now.diff(loginTime, 'second');
            setTimeLeft(Math.max(0, 9 * 60 * 60 - elapsedSeconds));
          } else {
            setIsLoggedIn(false);
            setLoginImage(null);
            setLoginTime(null);
            setTimeLeft(9 * 60 * 60);
          }
          setLogoutImage(todayRecord.setCheckOutImageUrl || null);
          setLogoutTime(todayRecord.clockOut || null);
        }
      } catch (error) {
        console.error('Error fetching attendance history:', error);
        toast({
          title: "Error",
          description: "Failed to fetch attendance history",
          variant: "destructive"
        });
      }
    };

    fetchAttendanceHistory();
  }, [retrievedEmpId, todayKey]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoggedIn && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isLoggedIn) {
      // Timer reached 0 while logged in (e.g., completed 9 hours)
      // You might want to automatically log out or trigger an action here
      // For now, just clear the timer
      // Note: Automatic logout would require triggering the logout process here
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isLoggedIn, timeLeft]);

  const saveHistoryToStorage = (history: AttendanceRecord[]) => {
    // When saving, ensure we only save the current user's history by merging
    // with other users' history if it exists in localStorage.
    const allHistory = JSON.parse(localStorage.getItem('attendanceHistory') || '[]') as AttendanceRecord[];
    const otherUsersHistory = allHistory.filter(record => record.employee.email !== userEmail);
    const updatedAllHistory = [...otherUsersHistory, ...history];
    localStorage.setItem('attendanceHistory', JSON.stringify(updatedAllHistory));
  };

  const handleLogin = () => {
    if (!isLoggedIn) {
      setActionType('login');
      setIsCameraOpen(true);
    }
  };

  const handleLogout = () => {
    if (isLoggedIn) {
      setActionType('logout');
      setIsCameraOpen(true);
    }
  };

  const capture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const now = dayjs();
    setIsLoading(true);

    // Get the base64 string without the data URL prefix
    const base64Image = imageSrc.split(',')[1];

    if (actionType === 'login') {
      // Send check-in request to API with the format from Postman test
      const formData = new FormData();
      formData.append('userId', retrievedEmpId || '1'); // Use retrievedEmpId
      formData.append('location', 'hyd'); // Hardcoded location as per test data
      formData.append('file', dataURLtoFile(imageSrc, 'express.png')); // Convert base64 to file

      axios.post('http://localhost:8080/api/attendance/checkin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        console.log('Check-in API Response:', response.data);
        
        // Create data URL for display
        const displayImage = `data:image/jpeg;base64,${base64Image}`;
        
        const newRecord: AttendanceRecord = {
          id: response.data.id,
          date: response.data.date || todayKey,
          clockIn: response.data.clockIn || now.format(),
          clockOut: null,
          status: response.data.status || 'Present',
          location: response.data.location || 'hyd',
          setCheckInImageUrl: displayImage,
          setCheckOutImageUrl: null,
          employee: {
            empId: parseInt(retrievedEmpId || '1'), // Use retrievedEmpId
            ename: '',
            email: userEmail || ''
          },
          duration: undefined
        };

        // Update attendance history
        setAttendanceHistory(prev => [...prev, newRecord]);
        setCurrentDayRecord(newRecord);

        setIsLoggedIn(true);
        setLoginImage(displayImage);
        setLoginTime(newRecord.clockIn);
        setTimeLeft(9 * 60 * 60);

        toast({
          title: "Success",
          description: "Check-in recorded successfully!",
        });
      })
      .catch(error => {
        console.error('Check-in API Error:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to record check-in. Please try again.",
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else if (actionType === 'logout') {
      if (!currentDayRecord?.id) {
        toast({
          title: "Error",
          description: "No check-in record found for today. Please check-in first.",
          variant: "destructive"
        });
        setIsLoading(false);
        setIsCameraOpen(false);
        setActionType(null);
        return;
      }

      // Send check-out request to API with the format from Postman test
      const formData = new FormData();
      formData.append('file', dataURLtoFile(imageSrc, 'express.png')); // Convert base64 to file

      axios.post(`http://localhost:8080/api/attendance/checkout/${currentDayRecord.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })  
      .then(response => {
        console.log('Check-out API Response:', response.data);

        const loginTimeObj = dayjs(loginTime);
        const logoutTimeObj = now;
        const calculatedDuration = loginTimeObj.isValid() && logoutTimeObj.isValid() 
          ? logoutTimeObj.diff(loginTimeObj, 'second')
          : 0;

        // Create data URL for display
        const displayImage = `data:image/jpeg;base64,${base64Image}`;

        // Update today's record
        const updatedRecord: AttendanceRecord = {
          ...currentDayRecord,
          clockOut: logoutTimeObj.format(),
          setCheckOutImageUrl: displayImage,
          duration: calculatedDuration
        };

        // Update attendance history
        setAttendanceHistory(prev => 
          prev.map(record => 
            record.id === currentDayRecord.id ? updatedRecord : record
          )
        );

        setCurrentDayRecord(updatedRecord);
        setHoursWorked(calculatedDuration);
        setLogoutTime(updatedRecord.clockOut);
        setShowLogoutSummary(true);

        // Reset state for next login AFTER showing the summary
        setIsLoggedIn(false);
        setLoginImage(null);
        setLoginTime(null);
        setTimeLeft(9 * 60 * 60);
        setLogoutImage(displayImage);

        toast({
          title: "Success",
          description: "Check-out recorded successfully!",
        });
      })
      .catch(error => {
        console.error('Check-out API Error:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to record check-out. Please try again.",
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
    }

    setIsCameraOpen(false);
    setActionType(null);
  };

  // Helper function to convert data URL to File
  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Calculate duration for a record
  const calculateDuration = (record: AttendanceRecord) => {
    if (!record.clockIn || !record.clockOut) return 0;
    const loginTime = dayjs(record.clockIn);
    const logoutTime = dayjs(record.clockOut);
    return logoutTime.diff(loginTime, 'second');
  };

  // Prepare records for history display (including today's record if exists)
  const historicalRecords = attendanceHistory
    .filter(record => 
      record.clockIn // Ensure there's a clock in time
    )
    .map(record => ({
      ...record,
      duration: calculateDuration(record)
    }))
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()); // Sort by date descending

  console.log('Filtered historical records:', historicalRecords);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Attendance</h2>
            <p className="text-gray-600">Record your daily attendance</p>
          </div>
        </div>

        {/* Status and Timer Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-700 font-medium">
                  Status: {isLoggedIn ? 'Currently Working' : 'Offline'}
                </span>
              </div>
              {isLoggedIn && loginTime && (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Time Remaining</p>
                    <p className="text-2xl font-bold text-blue-600">{formatTime(timeLeft)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Login Time</p>
                    <p className="text-sm font-medium">{formatDateTime(loginTime)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Log In</h3>
                  <p className="text-gray-600 mt-1">Start your work day</p>
                </div>
                <Button
                  className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isLoggedIn
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  onClick={handleLogin}
                  disabled={isLoggedIn}
                >
                  Log In
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Log Out</h3>
                  <p className="text-gray-600 mt-1">End your work day</p>
                </div>
                <Button
                  className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    !isLoggedIn
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  onClick={handleLogout}
                  disabled={!isLoggedIn}
                >
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Captured Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Login Selfie</CardTitle>
            </CardHeader>
            <CardContent>
              {loginImage ? (
                <div className="space-y-4">
                  <img
                    src={loginImage}
                    alt="Login Selfie"
                    className="w-40 h-40 mx-auto rounded-full object-cover shadow-lg"
                    onError={(e) => {
                      console.error('Error loading login image');
                      e.currentTarget.src = ''; // Clear the src on error
                    }}
                  />
                  {loginTime && (
                    <p className="text-center text-sm text-gray-600">
                      {formatDateTime(loginTime)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-40 h-40 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logout Selfie</CardTitle>
            </CardHeader>
            <CardContent>
              {logoutImage ? (
                <div className="space-y-4">
                  <img
                    src={logoutImage}
                    alt="Logout Selfie"
                    className="w-40 h-40 mx-auto rounded-full object-cover shadow-lg"
                    onError={(e) => {
                      console.error('Error loading logout image');
                      e.currentTarget.src = ''; // Clear the src on error
                    }}
                  />
                  {logoutTime && (
                    <p className="text-center text-sm text-gray-600">
                      {formatDateTime(logoutTime)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-40 h-40 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle>Previous Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {historicalRecords.length > 0 ? (
              <div className="space-y-6">
                {historicalRecords.map((record) => (
                  <div key={record.id} className="flex flex-col p-4 border rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-800">{dayjs(record.date).format('MMM DD, YYYY')}</span>
                      <Badge variant="outline" className="text-blue-600">
                        {formatDuration(record.duration || 0)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Login</p>
                        {record.setCheckInImageUrl ? (
                          <img
                            src={record.setCheckInImageUrl}
                            alt={`Login Selfie ${record.date}`}
                            className="w-32 h-32 mx-auto rounded-lg object-cover shadow-md"
                          />
                        ) : (
                          <div className="w-32 h-32 mx-auto rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        {record.clockIn && (
                          <p className="text-center text-sm text-gray-600 mt-2">
                            {formatDateTime(record.clockIn)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Logout</p>
                        {record.setCheckOutImageUrl ? (
                          <img
                            src={record.setCheckOutImageUrl}
                            alt={`Logout Selfie ${record.date}`}
                            className="w-32 h-32 mx-auto rounded-lg object-cover shadow-md"
                          />
                        ) : (
                          <div className="w-32 h-32 mx-auto rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        {record.clockOut && (
                          <p className="text-center text-sm text-gray-600 mt-2">
                            {formatDateTime(record.clockOut)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No previous attendance records found.</p>
                <p className="text-sm text-gray-400 mt-2">Your attendance history will appear here after you log in and out.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-800">
              Take Your {actionType === 'login' ? 'Login' : 'Logout'} Selfie
            </h2>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-lg w-full"
              videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
            />
            <div className="flex justify-between pt-4">
              <Button
                onClick={capture}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Capture'}
              </Button>
              <Button
                onClick={() => {
                  setIsCameraOpen(false);
                  setActionType(null);
                }}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Summary Dialog */}
      <Dialog open={showLogoutSummary} onOpenChange={setShowLogoutSummary}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Work Summary</DialogTitle>
            <DialogDescription>
              Thank you for your work today!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Hours Worked</p>
                {/* Display hours worked only if login time and logout time are valid */}
                <p className="text-3xl font-bold text-blue-600">
                  {currentDayRecord?.duration !== undefined && currentDayRecord.duration >= 0 ? formatDuration(currentDayRecord.duration) : '--'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Login Time</p>
                {/* Display login time only if valid */}
                <p className="text-sm font-medium">{currentDayRecord?.clockIn ? formatDateTime(currentDayRecord.clockIn) : '--'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Logout Time</p>
                {/* Display logout time only if valid */}
                <p className="text-sm font-medium">{currentDayRecord?.clockOut ? formatDateTime(currentDayRecord.clockOut) : '--'}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setShowLogoutSummary(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AttendancePage;