import React, { useEffect, useRef, useState, useCallback } from 'react';
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

const formatTime = (seconds: number | undefined) => {
  if (seconds === undefined) return '00:00:00';
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
  const [lastRecord, setLastRecord] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<Date>(new Date());

  const todayKey = dayjs().format('YYYY-MM-DD');
  const userEmail = localStorage.getItem('userEmail');
  const retrievedEmpId = localStorage.getItem('empId');

  // Sync states with localStorage
  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    localStorage.setItem('loginImage', loginImage || '');
    localStorage.setItem('logoutImage', logoutImage || '');
    localStorage.setItem('timeLeft', timeLeft.toString());
    localStorage.setItem('loginTime', loginTime || '');
    localStorage.setItem('logoutTime', logoutTime || '');
    localStorage.setItem('currentDayRecord', JSON.stringify(currentDayRecord));
    console.log('localStorage synced:', { isLoggedIn, loginImage, logoutImage, timeLeft, loginTime, logoutTime, currentDayRecord });
  }, [isLoggedIn, loginImage, logoutImage, timeLeft, loginTime, logoutTime, currentDayRecord]);

  const saveHistoryToStorage = useCallback((history: AttendanceRecord[]) => {
    const allHistory = JSON.parse(localStorage.getItem('allAttendanceHistory') || '[]') as AttendanceRecord[];
    const otherUsersHistory = allHistory.filter(record => record.employee.email !== userEmail);
    const updatedAllHistory = [...otherUsersHistory, ...history];
    localStorage.setItem('allAttendanceHistory', JSON.stringify(updatedAllHistory));
    console.log('Attendance history saved to localStorage:', updatedAllHistory);
  }, [userEmail]);

  // Validate currentDayRecord date and sync isLoggedIn
  useEffect(() => {
    if (currentDayRecord) {
      const recordDate = dayjs(currentDayRecord.date).format('YYYY-MM-DD');
      if (recordDate !== todayKey || currentDayRecord.clockOut) {
        console.log('currentDayRecord invalid or checked out, resetting.');
        setCurrentDayRecord(null);
        setIsLoggedIn(false);
        setLoginTime(null);
        setLoginImage(null);
        setLogoutTime(null);
        setLogoutImage(null);
        setTimeLeft(9 * 60 * 60);
        localStorage.removeItem('currentDayRecord');
      } else {
        console.log('currentDayRecord valid and active.');
        setIsLoggedIn(true);
        if (!loginImage && currentDayRecord.setCheckInImageUrl) {
          setLoginImage(currentDayRecord.setCheckInImageUrl);
        }
        if (!loginTime && currentDayRecord.clockIn) {
          setLoginTime(currentDayRecord.clockIn);
        }
      }
    } else if (!isCameraOpen && !loginImage) {
      console.log('No currentDayRecord and not checking in, setting isLoggedIn to false.');
      setIsLoggedIn(false);
    }
  }, [currentDayRecord, todayKey, isCameraOpen, loginImage, loginTime]);

  // Fetch current attendance status from API
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!retrievedEmpId) {
        console.log('empId not available, skipping API call for current status');
        setIsLoading(false);
        return;
      }

      try {
        console.log(`Fetching current status for empId: ${retrievedEmpId}`);
        const response = await axios.get(`${base_url}/api/attendance/current-status/${retrievedEmpId}`);
        console.log('Current status API response:', response.data);

        const { isLoggedIn: apiLoggedIn, loginTime, loginImage, logoutTime, logoutImage, timeLeft, record } = response.data;

        if (record && record.date === todayKey && !record.clockOut && !isCameraOpen) {
          console.log('API returned an active record for today.', record);
          setCurrentDayRecord(record);
          setIsLoggedIn(true);
          setLoginTime(loginTime || record.clockIn);
          setLoginImage(loginImage || record.setCheckInImageUrl);
          setLogoutTime(logoutTime);
          setLogoutImage(logoutImage);
          setTimeLeft(timeLeft || 9 * 60 * 60);
        } else if (!isCameraOpen && !currentDayRecord) {
          console.log(`API returned no active record for today or it's already checked out.`);
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
        if (currentDayRecord && isLoggedIn && dayjs(currentDayRecord.date).format('YYYY-MM-DD') === todayKey && !currentDayRecord.clockOut && !isCameraOpen) {
          console.log('API failed but localStorage state is consistent, maintaining login.');
        } else if (loginImage && isLoggedIn && !isCameraOpen) {
          console.log('API failed but loginImage exists, attempting to recover record.');
          // Attempt to recover by checking history
          const todayRecord = attendanceHistory.find(record => 
            record.date === todayKey && record.clockIn && !record.clockOut
          );
          if (todayRecord) {
            setCurrentDayRecord(todayRecord);
            setLoginTime(todayRecord.clockIn);
            setLoginImage(todayRecord.setCheckInImageUrl);
          } else {
            setIsLoggedIn(false);
            setLoginTime(null);
            setLoginImage(null);
            setLogoutTime(null);
            setLogoutImage(null);
            setTimeLeft(9 * 60 * 60);
            setCurrentDayRecord(null);
          }
        } else {
          console.log('API failed, resetting login state.');
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
  }, [retrievedEmpId, todayKey, isCameraOpen, attendanceHistory, currentDayRecord, isLoggedIn, loginImage]);

  // Fetch attendance history from API
  const fetchAttendanceHistory = useCallback(async () => {
    if (!retrievedEmpId) {
      console.log('empId not available, skipping API call for history');
      return;
    }

    try {
      console.log(`Fetching attendance history for empId: ${retrievedEmpId}`);
      const response = await axios.get(`${base_url}/api/attendance/employee/${retrievedEmpId}?t=${Date.now()}`);
      console.log('Raw attendance history API response:', response.data);

      if (!Array.isArray(response.data)) {
        console.error('API response is not an array:', response.data);
        throw new Error('API response for history is not an array');
      }

      const history: AttendanceRecord[] = response.data.map((record: any, index: number) => {
        console.log(`Processing record #${index + 1}:`, record);
        
        const processedRecord = {
          id: record.id,
          date: record.date ? dayjs(record.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          clockIn: record.clockIn ? record.clockIn : null,
          clockOut: record.clockOut ? record.clockOut : null,
          status: record.status || 'Unknown',
          location: record.location || 'Unknown',
          setCheckInImageUrl: record.checkInImageUrl || record.setCheckInImageUrl || record.checkInImage || null,
          setCheckOutImageUrl: record.checkOutImageUrl || record.setCheckOutImageUrl || record.checkOutImage || null,
          employee: {
            empId: record.employee?.empId || parseInt(retrievedEmpId || '1'),
            ename: record.employee?.ename || '',
            email: record.employee?.email || userEmail || ''
          },
          duration: record.clockIn && record.clockOut 
            ? dayjs(record.clockOut).diff(dayjs(record.clockIn), 'second')
            : null
        };
        
        console.log(`Processed record #${index + 1}:`, processedRecord);
        return processedRecord;
      });

      console.log('Final processed history:', history);
      
      history.sort((a, b) => {
        const dateComparison = dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
        if (dateComparison !== 0) return dateComparison;
        
        const aTime = a.clockIn ? dayjs(a.clockIn) : dayjs(a.date);
        const bTime = b.clockIn ? dayjs(b.clockIn) : dayjs(b.date);
        return bTime.valueOf() - aTime.valueOf();
      });
      
      setAttendanceHistory(history);
      saveHistoryToStorage(history);

      // Check if there's an active record for today in history
      const todayRecord = history.find(record => 
        record.date === todayKey && record.clockIn && !record.clockOut
      );
      if (todayRecord && !currentDayRecord && isLoggedIn && loginImage) {
        console.log('Recovered today record from history:', todayRecord);
        setCurrentDayRecord(todayRecord);
        setLoginTime(todayRecord.clockIn);
        setLoginImage(todayRecord.setCheckInImageUrl);
      }
    } catch (error: any) {
      console.error('Error fetching attendance history:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch attendance history",
        variant: "destructive",
      });
    }
  }, [retrievedEmpId, userEmail, saveHistoryToStorage, todayKey, currentDayRecord, isLoggedIn, loginImage]);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [fetchAttendanceHistory]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoggedIn && timeLeft > 0) {
      console.log('Starting timer with timeLeft:', timeLeft);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            console.log('Timer reached zero, clearing interval.');
            clearInterval(timer);
            return 0;
          }
          console.log('Timer tick, timeLeft:', prev - 1);
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isLoggedIn) {
      console.log('Timer reached zero while logged in, clearing interval.');
      clearInterval(timer);
    }
    return () => {
      console.log('Cleaning up timer.');
      clearInterval(timer);
    };
  }, [isLoggedIn, timeLeft]);

  const handleLogin = () => {
    if (!isLoggedIn) {
      setActionType('login');
      setIsCameraOpen(true);
      console.log('Initiating check-in process.');
    } else {
      toast({
        title: "Info",
        description: "You are already checked in.",
        variant: "default",
      });
    }
  };

  const handleLogout = async () => {
    if (isLoggedIn || loginImage) { // Allow logout attempt if loginImage exists
      if (!currentDayRecord?.id) {
        console.log('No currentDayRecord ID, attempting to recover or fetch.');
        try {
          const response = await axios.get(`${base_url}/api/attendance/current-status/${retrievedEmpId}`);
          const { record } = response.data;
          if (record && record.date === todayKey && !record.clockOut) {
            setCurrentDayRecord(record);
            console.log('Re-fetched active record for logout:', record);
            setLoginTime(record.clockIn);
            setLoginImage(record.setCheckInImageUrl);
          } else {
            // Check history as a fallback
            const todayRecord = attendanceHistory.find(record => 
              record.date === todayKey && record.clockIn && !record.clockOut
            );
            if (todayRecord) {
              setCurrentDayRecord(todayRecord);
              console.log('Recovered record from history for logout:', todayRecord);
              setLoginTime(todayRecord.clockIn);
              setLoginImage(todayRecord.setCheckInImageUrl);
            } else {
              throw new Error('No active check-in record found for today.');
            }
          }
        } catch (error) {
          console.error('Error re-fetching current status for logout:', error);
          toast({
            title: "Error",
            description: "No check-in record found for today. Please check-in first.",
            variant: "destructive",
          });
          setIsLoggedIn(false);
          localStorage.setItem('isLoggedIn', 'false');
          setCurrentDayRecord(null);
          setLoginTime(null);
          setLoginImage(null);
          return;
        }
      }
      setActionType('logout');
      setIsCameraOpen(true);
      console.log('Initiating check-out process.');
    } else {
      toast({
        title: "Info",
        description: "You are not currently checked in.",
        variant: "default",
      });
    }
  };

  const capture = useCallback(async () => {
    if (!webcamRef.current) {
      console.error('Webcam ref is null');
      toast({
        title: "Error",
        description: "Webcam is not available. Please try again.",
        variant: "destructive",
      });
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      console.error('No image captured');
      toast({
        title: "Error",
        description: "Failed to capture image. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const now = dayjs();
    setIsLoading(true);

    const base64Image = imageSrc.split(',')[1];

    if (actionType === 'login') {
      const formData = new FormData();
      formData.append('userId', retrievedEmpId || '1');
      formData.append('location', 'hyd');
      const file = dataURLtoFile(imageSrc, 'express.png');
      console.log('File being sent for check-in:', file);
      formData.append('file', file);

      try {
        const response = await axios.post(`${base_url}/api/attendance/checkin`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
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
          duration: null
        };

        setAttendanceHistory(prev => {
          const updatedHistory = [...prev, newRecord];
          updatedHistory.sort((a, b) => {
            const aTime = a.clockIn ? dayjs(a.clockIn) : dayjs(a.date);
            const bTime = b.clockIn ? dayjs(b.clockIn) : dayjs(b.date);
            return bTime.valueOf() - aTime.valueOf();
          });
          saveHistoryToStorage(updatedHistory);
          console.log('Attendance history after check-in:', updatedHistory);
          return updatedHistory;
        });
        setCurrentDayRecord(newRecord);
        setIsLoggedIn(true);
        setLoginImage(displayImage);
        setLoginTime(newRecord.clockIn);
        setTimeLeft(9 * 60 * 60);

        toast({
          title: "Success",
          description: "Check-in recorded successfully!",
        });

        console.log('State after successful check-in:', {
          isLoggedIn: true,
          loginImage: displayImage,
          loginTime: newRecord.clockIn,
          timeLeft: 9 * 60 * 60,
          currentDayRecord: newRecord,
        });
      } catch (error: any) {
        console.error('Check-in API Error:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to record check-in. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setIsCameraOpen(false);
        setActionType(null);
        await fetchAttendanceHistory();
      }
    } else if (actionType === 'logout') {
      if (!currentDayRecord?.id) {
        console.error('No currentDayRecord ID for check-out, attempting recovery.');
        const todayRecord = attendanceHistory.find(record => 
          record.date === todayKey && record.clockIn && !record.clockOut
        );
        if (todayRecord) {
          setCurrentDayRecord(todayRecord);
          console.log('Recovered record for check-out:', todayRecord);
        } else {
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
      }

      const formData = new FormData();
      const file = dataURLtoFile(imageSrc, 'express.png');
      console.log('File being sent for check-out:', file);
      formData.append('file', file);

      try {
        const response = await axios.post(`${base_url}/api/attendance/checkout/${currentDayRecord.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Check-out API Response:', response.data);

        const loginTimeObj = dayjs(currentDayRecord.clockIn);
        const logoutTimeObj = now;
        const calculatedDuration = loginTimeObj.isValid() && logoutTimeObj.isValid()
          ? logoutTimeObj.diff(loginTimeObj, 'second')
          : 0;

        const displayImage = `data:image/jpeg;base64,${base64Image}`;
        console.log('Check-out display image:', displayImage);

        const finalUpdatedRecord: AttendanceRecord = {
          ...currentDayRecord,
          clockOut: logoutTimeObj.format(),
          setCheckOutImageUrl: displayImage,
          duration: calculatedDuration,
        };
        console.log('Final Updated Record on Logout:', finalUpdatedRecord);

        setAttendanceHistory(prev => {
          const updatedHistory = prev.map(record =>
            record.id === currentDayRecord.id ? finalUpdatedRecord : record
          );
          updatedHistory.sort((a, b) => {
            const dateComparison = dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
            if (dateComparison !== 0) return dateComparison;
            const aTime = a.clockIn ? dayjs(a.clockIn) : dayjs(a.date);
            const bTime = b.clockIn ? dayjs(b.clockIn) : dayjs(b.date);
            return bTime.valueOf() - aTime.valueOf();
          });
          saveHistoryToStorage(updatedHistory);
          console.log('Attendance history after check-out:', updatedHistory);
          return updatedHistory;
        });

        setLastRecord(finalUpdatedRecord);
        setCurrentDayRecord(null);
        setHoursWorked(calculatedDuration);
        setLogoutTime(finalUpdatedRecord.clockOut);
        setLogoutImage(displayImage);
        setIsLoggedIn(false);
        setLoginImage(null);
        setLoginTime(null);
        setTimeLeft(9 * 60 * 60);
        localStorage.removeItem('currentDayRecord');
        setShowLogoutSummary(true);

        toast({
          title: "Success",
          description: "Check-out recorded successfully!",
        });
      } catch (error: any) {
        console.error('Check-out API Error:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to record check-out. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setIsCameraOpen(false);
        setActionType(null);
        await fetchAttendanceHistory();
      }
    }
  }, [actionType, currentDayRecord, retrievedEmpId, userEmail, saveHistoryToStorage, todayKey, fetchAttendanceHistory, attendanceHistory]);

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

  const getFilteredAttendance = () => {
    console.log('Filtering attendance history for date:', dateFilter, 'Current history:', attendanceHistory);
    return attendanceHistory
      .filter(record => {
        const recordDate = dayjs(record.date).format('YYYY-MM-DD');
        const filterDate = dayjs(dateFilter).format('YYYY-MM-DD');
        const isMatch = recordDate === filterDate;
        console.log(`Record date: ${recordDate}, Filter date: ${filterDate}, Match: ${isMatch}, Record ID: ${record.id}`);
        return isMatch;
      })
      .sort((a, b) => {
        const aTime = a.clockIn ? dayjs(a.clockIn) : dayjs(a.date);
        const bTime = b.clockIn ? dayjs(b.clockIn) : dayjs(b.date);
        return bTime.valueOf() - aTime.valueOf();
      });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateDuration = (clockIn: string | null, clockOut: string | null) => {
    if (!clockIn || !clockOut) return null;
    const start = dayjs(clockIn);
    const end = dayjs(clockOut);
    if (!start.isValid() || !end.isValid()) return null;
    return end.diff(start, 'second');
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) {
      console.log('No image URL provided');
      return null;
    }

    try {
      if (imageUrl.startsWith('data:image')) {
        console.log('Image URL is base64');
        return imageUrl;
      }

      if (imageUrl.startsWith('/')) {
        const fullUrl = `${base_url}${imageUrl}`;
        console.log('Relative image URL converted to:', fullUrl);
        return fullUrl;
      }

      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('Image URL is already a full URL:', imageUrl);
        return imageUrl;
      }

      if (imageUrl.match(/^[A-Za-z0-9+/=]+$/)) {
        const fullBase64 = `data:image/jpeg;base64,${imageUrl}`;
        console.log('Converted raw base64 to data URL');
        return fullBase64;
      }

      const fullUrl = `${base_url}/${imageUrl}`;
      console.log('Assuming relative path, converted to:', fullUrl);
      return fullUrl;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return null;
    }
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
                      !isLoggedIn && !loginImage
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    onClick={handleLogout}
                    disabled={!isLoggedIn && !loginImage}
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
                      src={getImageUrl(loginImage) || ''}
                      alt="login-selfie-image"
                      className="w-40 h-40 mx-auto rounded-full object-cover shadow-lg"
                      onError={(e) => {
                        console.error('Error loading login image:', e);
                        e.currentTarget.src = '';
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
                      src={getImageUrl(logoutImage) || ''}
                      alt="Logout Selfie"
                      className="w-40 h-40 mx-auto rounded-full object-cover shadow-lg"
                      onError={(e) => {
                        console.error('Error loading logout image:', e);
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
                  {getFilteredAttendance().map((record) => {
                    const duration = calculateDuration(record.clockIn, record.clockOut);
                    const checkInImageUrl = getImageUrl(record.setCheckInImageUrl);
                    const checkOutImageUrl = getImageUrl(record.setCheckOutImageUrl);
                    console.log(`Rendering record ${record.id}:`, {
                      checkInImageUrl,
                      checkOutImageUrl,
                      record
                    });
                    
                    return (
                      <div key={record.id} className="flex flex-col p-4 border rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold text-gray-800">
                            {dayjs(record.date).format('MMM DD, YYYY')}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-blue-600">
                              {duration ? formatDuration(duration) : '--'}
                            </Badge>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Check In</p>
                            <p className="font-medium">{record.clockIn ? formatDateTime(record.clockIn) : '--'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Check Out</p>
                            <p className="font-medium">{record.clockOut ? formatDateTime(record.clockOut) : '--'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="font-medium">{record.location || '--'}</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Check-in Image</p>
                            {checkInImageUrl ? (
                              <img
                                src={checkInImageUrl}
                                alt="Check-in"
                                className="w-32 h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  console.error('Error loading check-in image:', e);
                                  e.currentTarget.src = '';
                                }}
                              />
                            ) : (
                              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Check-out Image</p>
                            {checkOutImageUrl ? (
                              <img
                                src={checkOutImageUrl}
                                alt="Check-out"
                                className="w-32 h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  console.error('Error loading check-out image:', e);
                                  e.currentTarget.src = '';
                                }}
                              />
                            ) : (
                              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No attendance records found for {format(dateFilter, 'PPP')}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {isCameraOpen && (
        <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{actionType === 'login' ? 'Check-in' : 'Check-out'} Selfie</DialogTitle>
              <DialogDescription>
                Please take a selfie to {actionType === 'login' ? 'check-in' : 'check-out'}.
              </DialogDescription>
            </DialogHeader>
            <div className="relative w-full aspect-video">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCameraOpen(false);
                  setActionType(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={capture} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Capture Photo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                  {hoursWorked ? formatDuration(hoursWorked) : '--'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Check-in Time</p>
                <p className="text-sm font-medium">
                  {lastRecord?.clockIn ? formatDateTime(lastRecord.clockIn) : '--'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Check-out Time</p>
                <p className="text-sm font-medium">
                  {lastRecord?.clockOut ? formatDateTime(lastRecord.clockOut) : '--'}
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