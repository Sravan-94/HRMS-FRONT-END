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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { base_url } from '@/utils/config';

interface AttendanceRecord {
  id: number;
  date: string;
  clockIn: string | null;
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
  duration?: number | null;
  reason?: string;
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const formatDateTime = (dateTime: string | null) => {
  if (!dateTime) return '--';
  return dayjs(dateTime).format('MMM DD, YYYY hh:mm:ss A');
};

const AttendancePage: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [loginImage, setLoginImage] = useState<string | null>(() => {
    return localStorage.getItem('loginImage') || null;
  });
  const [logoutImage, setLogoutImage] = useState<string | null>(() => {
    return localStorage.getItem('logoutImage') || null;
  });
  const [actionType, setActionType] = useState<'login' | 'logout' | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const savedTimeLeft = localStorage.getItem('timeLeft');
    return savedTimeLeft ? parseInt(savedTimeLeft, 10) : 9 * 60 * 60;
  });
  const [loginTime, setLoginTime] = useState<string | null>(() => {
    return localStorage.getItem('loginTime') || null;
  });
  const [showLogoutSummary, setShowLogoutSummary] = useState(false);
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [logoutTime, setLogoutTime] = useState<string | null>(() => {
    return localStorage.getItem('logoutTime') || null;
  });
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [currentDayRecord, setCurrentDayRecord] = useState<AttendanceRecord | null>(() => {
    const savedRecord = localStorage.getItem('currentDayRecord');
    return savedRecord ? JSON.parse(savedRecord) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<Date>(new Date());

  const todayKey = dayjs().format('YYYY-MM-DD');
  const userEmail = localStorage.getItem('userEmail');
  const retrievedEmpId = localStorage.getItem('empId');

  console.log('Retrieved empId from localStorage:', retrievedEmpId);

  // Sync states with localStorage
  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    localStorage.setItem('loginImage', loginImage || '');
    localStorage.setItem('logoutImage', logoutImage || '');
    localStorage.setItem('timeLeft', timeLeft.toString());
    localStorage.setItem('loginTime', loginTime || '');
    localStorage.setItem('logoutTime', logoutTime || '');
    localStorage.setItem('currentDayRecord', JSON.stringify(currentDayRecord));
  }, [isLoggedIn, loginImage, logoutImage, timeLeft, loginTime, logoutTime, currentDayRecord]);

  // Validate currentDayRecord date and sync isLoggedIn
  useEffect(() => {
    if (currentDayRecord) {
      const recordDate = dayjs(currentDayRecord.date).format('YYYY-MM-DD');
      if (recordDate !== todayKey || currentDayRecord.clockOut) {
        setCurrentDayRecord(null);
        setIsLoggedIn(false);
        setLoginTime(null);
        setLoginImage(null);
        setLogoutTime(null);
        setLogoutImage(null);
        setTimeLeft(9 * 60 * 60);
        localStorage.removeItem('currentDayRecord');
      } else {
        setIsLoggedIn(true);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [currentDayRecord, todayKey]);

  // Fetch current attendance status from API
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!retrievedEmpId) {
        console.log('empId not available, skipping API call');
        setIsLoading(false);
        return;
      }

      try {
        console.log(`Fetching current status for empId: ${retrievedEmpId}`);
        const response = await axios.get(`${base_url}/api/attendance/current-status/${retrievedEmpId}`);
        console.log('Current status API response:', response.data);

        const { isLoggedIn: apiLoggedIn, loginTime, loginImage, logoutTime, logoutImage, timeLeft, record } = response.data;

        if (record && record.date === todayKey && !record.clockOut) {
          setCurrentDayRecord(record);
          setIsLoggedIn(true);
          setLoginTime(loginTime);
          setLoginImage(loginImage);
          setLogoutTime(logoutTime);
          setLogoutImage(logoutImage);
          setTimeLeft(timeLeft);
        } else {
          setCurrentDayRecord(null);
          setIsLoggedIn(false);
          setLoginTime(null);
          setLoginImage(null);
          setLogoutTime(null);
          setLogoutImage(null);
          setTimeLeft(9 * 60 * 60);
        }
      } catch (error) {
        console.error('Error fetching current status:', error);
        if (currentDayRecord && isLoggedIn && dayjs(currentDayRecord.date).format('YYYY-MM-DD') === todayKey && !currentDayRecord.clockOut) {
          console.log('API failed, using localStorage state to maintain login');
        } else {
          setIsLoggedIn(false);
          setLoginTime(null);
          setLoginImage(null);
          setLogoutTime(null);
          setLogoutImage(null);
          setTimeLeft(9 * 60 * 60);
          setCurrentDayRecord(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentStatus();
  }, [retrievedEmpId, todayKey]);

  // Fetch attendance history from API
  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!retrievedEmpId) {
        console.log('empId not available, skipping API call');
        return;
      }

      try {
        console.log(`Fetching attendance history for empId: ${retrievedEmpId}`);
        const response = await axios.get(`${base_url}/api/attendance/employee/${retrievedEmpId}?t=${Date.now()}`);
        console.log('Attendance history API response:', response.data);

        if (!Array.isArray(response.data)) {
          throw new Error('API response is not an array');
        }

        const history: AttendanceRecord[] = response.data.map((record: any, index: number) => {
          console.log(`Mapping record #${index + 1}:`, record);
          return {
            id: record.id,
            date: record.date ? dayjs(record.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
            clockIn: record.clockIn ? record.clockIn : null,
            clockOut: record.clockOut ? record.clockOut : null,
            status: record.status || 'Unknown',
            location: record.location || 'Unknown',
            setCheckInImageUrl: record.setCheckInImageUrl || null,
            setCheckOutImageUrl: record.setCheckOutImageUrl || null,
            employee: {
              empId: record.employee?.empId || parseInt(retrievedEmpId || '1'),
              ename: record.employee?.ename || '',
              email: record.employee?.email || userEmail || ''
            },
            duration: record.clockIn && record.clockOut 
              ? dayjs(record.clockOut).diff(dayjs(record.clockIn), 'second')
              : null
          };
        });

        console.log('Mapped history:', history);
        
        // Sort attendance history by date/clockIn descending (latest first)
        history.sort((a, b) => {
          const aTime = a.clockIn ? dayjs(a.clockIn) : dayjs(a.date);
          const bTime = b.clockIn ? dayjs(b.clockIn) : dayjs(b.date);
          return bTime.valueOf() - aTime.valueOf(); // Latest first
        });
        
        setAttendanceHistory(history);
      } catch (error: any) {
        console.error('Error fetching attendance history:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch attendance history",
          variant: "destructive",
        });
      }
    };

    fetchAttendanceHistory();
  }, [retrievedEmpId]);

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
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isLoggedIn, timeLeft]);

  const saveHistoryToStorage = (history: AttendanceRecord[]) => {
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

  const handleLogout = async () => {
    if (isLoggedIn) {
      if (!currentDayRecord?.id) {
        try {
          const response = await axios.get(`${base_url}/api/attendance/current-status/${retrievedEmpId}`);
          const { record } = response.data;
          if (record && record.date === todayKey && !record.clockOut) {
            setCurrentDayRecord(record);
          } else {
            throw new Error('No check-in record found');
          }
        } catch (error) {
          console.error('Error re-fetching current status for logout:', error);
          if (currentDayRecord && dayjs(currentDayRecord.date).format('YYYY-MM-DD') === todayKey && !currentDayRecord.clockOut) {
            console.log('Using localStorage state for logout');
          } else {
            toast({
              title: "Error",
              description: "No check-in record found for today. Please check-in first.",
              variant: "destructive",
            });
            setIsLoggedIn(false);
            localStorage.setItem('isLoggedIn', 'false');
            setCurrentDayRecord(null);
            return;
          }
        }
      }
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

    const base64Image = imageSrc.split(',')[1];

    const refreshHistory = async () => {
      try {
        const response = await axios.get(`${base_url}/api/attendance/employee/${retrievedEmpId}?t=${Date.now()}`);
        const updatedHistory: AttendanceRecord[] = response.data.map((record: any) => ({
          id: record.id,
          date: record.date ? dayjs(record.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          clockIn: record.clockIn ? record.clockIn : null,
          clockOut: record.clockOut ? record.clockOut : null,
          status: record.status || 'Unknown',
          location: record.location || 'Unknown',
          setCheckInImageUrl: record.setCheckInImageUrl || null,
          setCheckOutImageUrl: record.setCheckOutImageUrl || null,
          employee: {
            empId: record.employee?.empId || parseInt(retrievedEmpId || '1'),
            ename: record.employee?.ename || '',
            email: record.employee?.email || userEmail || ''
          },
          duration: record.clockIn && record.clockOut
            ? dayjs(record.clockOut).diff(dayjs(record.clockIn), 'second')
            : null
        }));
        setAttendanceHistory(updatedHistory);
      } catch (error) {
        console.error('Error refreshing attendance history:', error);
      }
    };

    if (actionType === 'login') {
      const formData = new FormData();
      formData.append('userId', retrievedEmpId || '1');
      formData.append('location', 'hyd');
      const file = dataURLtoFile(imageSrc, 'express.png');
      console.log('File being sent for check-in:', file);
      formData.append('file', file);

      axios.post(`${base_url}/api/attendance/checkin`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(async response => {
        console.log('Check-in API Response:', response.data);
        
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
            empId: parseInt(retrievedEmpId || '1'),
            ename: '',
            email: userEmail || ''
          },
          duration: undefined
        };

        setAttendanceHistory(prev => [...prev, newRecord]);
        setCurrentDayRecord(newRecord);

        setIsLoggedIn(true);
        setLoginImage(displayImage);
        setLoginTime(newRecord.clockIn);
        setTimeLeft(9 * 60 * 60);

        await refreshHistory();

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

      const formData = new FormData();
      const file = dataURLtoFile(imageSrc, 'express.png');
      console.log('File being sent for check-out:', file);
      formData.append('file', file);

      axios.post(`${base_url}/api/attendance/checkout/${currentDayRecord.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(async response => {
        console.log('Check-out API Response:', response.data);

        const loginTimeObj = dayjs(loginTime);
        const logoutTimeObj = now;
        const calculatedDuration = loginTimeObj.isValid() && logoutTimeObj.isValid()
          ? logoutTimeObj.diff(loginTimeObj, 'second')
          : 0;

        const displayImage = `data:image/jpeg;base64,${base64Image}`;

        const finalUpdatedRecord: AttendanceRecord = {
          ...currentDayRecord,
          clockOut: logoutTimeObj.format(),
          setCheckOutImageUrl: displayImage,
          duration: calculatedDuration,
          clockIn: currentDayRecord.clockIn,
          setCheckInImageUrl: currentDayRecord.setCheckInImageUrl,
          date: currentDayRecord.date,
          id: currentDayRecord.id,
          employee: currentDayRecord.employee,
          location: currentDayRecord.location,
          status: currentDayRecord.status,
          reason: currentDayRecord.reason
        };

        setAttendanceHistory(prev =>
          prev.map(record =>
            record.id === currentDayRecord.id ? finalUpdatedRecord : record
          )
        );

        setCurrentDayRecord(finalUpdatedRecord);
        setHoursWorked(calculatedDuration);
        setLogoutTime(finalUpdatedRecord.clockOut);

        setIsLoggedIn(false);
        setLoginImage(null);
        setLoginTime(null);
        setTimeLeft(9 * 60 * 60);
        setLogoutImage(displayImage);
        localStorage.removeItem('currentDayRecord');

        await refreshHistory();

        setShowLogoutSummary(true);

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

  const historicalRecords = attendanceHistory
    .map(record => ({
      ...record,
      duration: record.clockIn && record.clockOut 
        ? dayjs(record.clockOut).diff(dayjs(record.clockIn), 'second')
        : 0
    }))
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

  console.log('Filtered historical records:', historicalRecords);

  // Filter function for attendance records
  const getFilteredAttendance = () => {
    return attendanceHistory.filter(record => {
      const recordDate = dayjs(record.date).format('YYYY-MM-DD');
      const filterDate = dayjs(dateFilter).format('YYYY-MM-DD');
      return recordDate === filterDate;
    });
  };

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Attendance</h2>
              <p className="text-gray-600">Record your daily attendance</p>
            </div>
          </div>

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
                    <h3 className="text-xl font-semibold text-gray-800">Check Out</h3>
                    <p className="text-gray-600 mt-1">End your work session</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Check-in Selfie</CardTitle>
              </CardHeader>
              <CardContent>
                {loginImage ? (
                  <div className="space-y-4">
                    <img
                      src={loginImage}
                      alt="login-selfie-image"
                      className="w-40 h-40 mx-auto rounded-full object-cover shadow-lg"
                      onError={(e) => {
                        console.error('Error loading login image');
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
                    No Image Available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checkout Selfie</CardTitle>
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
                        e.currentTarget.src = '';
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
                    No Image Available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Previous Attendance Records</CardTitle>
                <div className="flex items-center gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateFilter, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
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
                  <Button
                    variant="outline"
                    onClick={() => setDateFilter(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateFilter(new Date());
                      // Reset any other filters if they exist
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {getFilteredAttendance().length > 0 ? (
                <div className="space-y-6">
                  {getFilteredAttendance().map((record) => (
                    <div key={record.id} className="flex flex-col p-4 border rounded-lg shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-800">
                          {dayjs(record.date).format('MMM DD, YYYY')}
                        </span>
                        <Badge variant="outline" className="text-blue-600">
                          {formatDuration(record.duration || 0)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Check In</p>
                          {record.setCheckInImageUrl ? (
                            <img
                              src={record.setCheckInImageUrl}
                              alt={`Check-in Selfie ${record.date}`}
                              className="w-32 h-32 mx-auto rounded-lg object-cover shadow-md"
                              onError={(e) => {
                                console.error('Error loading check-in image');
                                e.currentTarget.src = '';
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 mx-auto rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                              No Image Available
                            </div>
                          )}
                          {record.clockIn && (
                            <p className="text-center text-sm text-gray-600 mt-2">
                              {formatDateTime(record.clockIn)}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Check Out</p>
                          {record.setCheckOutImageUrl ? (
                            <img
                              src={record.setCheckOutImageUrl}
                              alt={`Check-out Selfie ${record.date}`}
                              className="w-32 h-32 mx-auto rounded-lg object-cover shadow-md"
                              onError={(e) => {
                                console.error('Error loading check-out image');
                                e.currentTarget.src = '';
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 mx-auto rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                              No Image Available
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
                  <p className="text-gray-500">No attendance records found for {format(dateFilter, "MMMM dd, yyyy")}.</p>
                  <p className="text-sm text-gray-400 mt-2">Your attendance history will appear here after you log in and out.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-800">
              Take Your {actionType === 'login' ? 'Check-in' : 'Check-out'} Selfie
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
                <p className="text-3xl font-bold text-blue-600">
                  {currentDayRecord?.duration !== undefined && currentDayRecord.duration >= 0 
                    ? formatDuration(currentDayRecord.duration)
                    : '--'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Check-in Time</p>
                <p className="text-sm font-medium">
                  {currentDayRecord?.clockIn ? formatDateTime(currentDayRecord.clockIn) : '--'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Check-out Time</p>
                <p className="text-sm font-medium">
                  {currentDayRecord?.clockOut ? formatDateTime(currentDayRecord.clockOut) : '--'}
                </p>
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