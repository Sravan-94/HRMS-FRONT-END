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

interface AttendanceRecord {
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  loginImage: string | null;
  logoutImage: string | null;
  duration: number; // Duration in seconds
  email?: string; // Add email field to identify the user
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
  const [currentDayRecord, setCurrentDayRecord] = useState<AttendanceRecord | null>(null); // State to hold today's record for summary

  const todayKey = dayjs().format('YYYY-MM-DD');
  const localStorageKey = 'attendanceHistory';
  const userEmail = localStorage.getItem('userEmail'); // Get logged-in user's email

  useEffect(() => {
    const storedHistory = localStorage.getItem(localStorageKey);
    if (storedHistory) {
      const history: AttendanceRecord[] = JSON.parse(storedHistory);
      // Filter history by logged-in user's email
      const userHistory = history.filter(record => record.email === userEmail);
      setAttendanceHistory(userHistory);

      // Find today's record for the current user to restore current login state if any
      const todayRecord = userHistory.find(record => record.date === todayKey);

      if (todayRecord) {
        setCurrentDayRecord(todayRecord);
        if (todayRecord.loginTime && !todayRecord.logoutTime) {
           // If logged in today and not yet logged out
          setIsLoggedIn(true);
          setLoginImage(todayRecord.loginImage);
          setLoginTime(todayRecord.loginTime);

          const loginTime = dayjs(todayRecord.loginTime);
          const now = dayjs();
          const elapsedSeconds = now.diff(loginTime, 'second');
          setTimeLeft(Math.max(0, 9 * 60 * 60 - elapsedSeconds));
        } else {
           // If not logged in or already logged out today
           setIsLoggedIn(false);
           setLoginImage(null);
           setLoginTime(null);
           setTimeLeft(9 * 60 * 60);
        }
         setLogoutImage(todayRecord.logoutImage || null);
         setLogoutTime(todayRecord.logoutTime || null);
      } else {
        // No record for today found
        setIsLoggedIn(false);
        setLoginImage(null);
        setLogoutImage(null);
        setLoginTime(null);
        setTimeLeft(9 * 60 * 60);
        setLogoutTime(null);
        setCurrentDayRecord(null);
      }
    } else {
      // No history found, reset state
      setIsLoggedIn(false);
      setLoginImage(null);
      setLogoutImage(null);
      setLoginTime(null);
      setTimeLeft(9 * 60 * 60);
      setLogoutTime(null);
      setCurrentDayRecord(null);
    }
  }, [userEmail]); // Add userEmail to dependency array

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
    const allHistory = JSON.parse(localStorage.getItem(localStorageKey) || '[]') as AttendanceRecord[];
    const otherUsersHistory = allHistory.filter(record => record.email !== userEmail);
    const updatedAllHistory = [...otherUsersHistory, ...history];
    localStorage.setItem(localStorageKey, JSON.stringify(updatedAllHistory));
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

    if (actionType === 'login') {
      const newRecord: AttendanceRecord = {
        date: todayKey,
        loginTime: now.format(),
        logoutTime: null,
        loginImage: imageSrc,
        logoutImage: null,
        duration: 0,
        email: userEmail // Store user email with the record
      };

      // Add new record or replace if already exists for today for this user
      const updatedHistory = attendanceHistory.filter(record => record.date !== todayKey);
      updatedHistory.push(newRecord);
      saveHistoryToStorage(updatedHistory);
      setAttendanceHistory(updatedHistory);
      setCurrentDayRecord(newRecord);

      setIsLoggedIn(true);
      setLoginImage(imageSrc);
      setLoginTime(now.format());
      setTimeLeft(9 * 60 * 60);

    } else if (actionType === 'logout') {
      const loginTimeObj = dayjs(loginTime);
      const logoutTimeObj = now;
      let calculatedDuration = 0;

      if (loginTimeObj.isValid() && logoutTimeObj.isValid()) {
        calculatedDuration = logoutTimeObj.diff(loginTimeObj, 'second');
      }

      // Update today's record for the current user in history
      let updatedRecord: AttendanceRecord | null = null;
      const updatedHistory = attendanceHistory.map(record => {
        if (record.date === todayKey) {
          updatedRecord = {
            ...record,
            logoutTime: logoutTimeObj.format(),
            logoutImage: imageSrc,
            duration: calculatedDuration
          };
          return updatedRecord;
        }
        return record;
      });
      saveHistoryToStorage(updatedHistory);
      setAttendanceHistory(updatedHistory);

      if (updatedRecord) {
        setCurrentDayRecord(updatedRecord);
        setHoursWorked(updatedRecord.duration);
        setLogoutTime(updatedRecord.logoutTime);
        // Show summary dialog using the updated record data
        setShowLogoutSummary(true);
      }

      // Reset state for next login AFTER showing the summary
      setIsLoggedIn(false);
      setLoginImage(null);
      setLoginTime(null);
      setTimeLeft(9 * 60 * 60);
      setLogoutImage(imageSrc);

    }

    setIsCameraOpen(false);
    setActionType(null);

    // After capture (login or logout), re-load and filter history for the current user
    const storedHistoryAfterCapture = localStorage.getItem(localStorageKey);
    if (storedHistoryAfterCapture) {
      const historyAfterCapture: AttendanceRecord[] = JSON.parse(storedHistoryAfterCapture);
      const userHistoryAfterCapture = historyAfterCapture.filter(record => record.email === userEmail);
      setAttendanceHistory(userHistoryAfterCapture);
    }
  };

  // Filter out today's potentially incomplete record for history display
  // Also ensure only records for the current user are shown
  const historicalRecords = attendanceHistory.filter(record => 
    record.date !== todayKey && 
    record.logoutTime !== null &&
    record.email === userEmail // Filter by user email
  )
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()); // Sort by date descending

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
                {historicalRecords.map(record => (
                  <div key={record.date} className="flex flex-col p-4 border rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-800">{dayjs(record.date).format('MMM DD, YYYY')}</span>
                      <span className="text-blue-600 font-medium">{formatDuration(record.duration)}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Login</p>
                        {record.loginImage ? (
                          <img
                            src={record.loginImage}
                            alt={`Login Selfie ${record.date}`}
                            className="w-32 h-32 mx-auto rounded-lg object-cover shadow-md"
                          />
                        ) : (
                          <div className="w-32 h-32 mx-auto rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        {record.loginTime && (
                          <p className="text-center text-sm text-gray-600 mt-2">
                            {formatDateTime(record.loginTime)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Logout</p>
                        {record.logoutImage ? (
                          <img
                            src={record.logoutImage}
                            alt={`Logout Selfie ${record.date}`}
                            className="w-32 h-32 mx-auto rounded-lg object-cover shadow-md"
                          />
                        ) : (
                          <div className="w-32 h-32 mx-auto rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        {record.logoutTime && (
                          <p className="text-center text-sm text-gray-600 mt-2">
                            {formatDateTime(record.logoutTime)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No previous attendance records found.</p>
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
              >
                Capture
              </Button>
              <Button
                onClick={() => {
                  setIsCameraOpen(false);
                  setActionType(null);
                }}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
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
                <p className="text-sm font-medium">{currentDayRecord?.loginTime ? formatDateTime(currentDayRecord.loginTime) : '--'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Logout Time</p>
                {/* Display logout time only if valid */}
                <p className="text-sm font-medium">{currentDayRecord?.logoutTime ? formatDateTime(currentDayRecord.logoutTime) : '--'}</p>
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