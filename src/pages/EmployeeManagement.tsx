import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Search,
  Plus,
  Edit,
  Eye,
  UserPlus,
  ClipboardList,
  Mail,
  Phone,
  CheckCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  empId: number;
  ename: string;
  email: string;
  password: string | null;
  phone: number | null;
  role: string | null;
}

const EmployeeManagement = () => {
  const storedUserRole = localStorage.getItem('userRole') || 'employee';
  const userRole = storedUserRole.toLowerCase(); // Convert to lowercase
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getSidebarItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: `/${userRole}-dashboard`, active: false },
      { icon: Users, label: 'Employee Management', path: '/employee-management', active: true },
      { icon: Calendar, label: 'Leave Management', path: '/leave-management' },
      { icon: Clock, label: 'Attendance', path: '/attendance' },
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

  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8080/emps/getEmps');
      console.log('API Response:', response.data);
      
      // Transform the API response to match our employee structure
      const transformedEmployees = response.data.map(emp => ({
        empId: emp.empId,
        ename: emp.ename,
        email: emp.email,
        password: emp.password,
        phone: emp.phone,
        role: emp.role
      }));

      setEmployees(transformedEmployees);
      setError(null);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeePhone, setNewEmployeePhone] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const [newEmployeeConfirmPassword, setNewEmployeeConfirmPassword] = useState('');

  const canManageEmployees = userRole === 'admin' || userRole === 'hr';

  const handleAddEmployee = async () => {
    if (!newEmployeeName || !newEmployeeEmail || !newEmployeePhone || !newEmployeeId || !newEmployeePassword || !newEmployeeConfirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (newEmployeePassword !== newEmployeeConfirmPassword) {
      toast({
        title: "Error",
        description: "Password and Confirm Password do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/emps/saveEmp', {
        ename: newEmployeeName,
        email: newEmployeeEmail,
        phone: Number(newEmployeePhone),
        employeeid: newEmployeeId,
        password: newEmployeePassword,
        role: 'employee'
      });

      console.log('API Response:', response.data);

      const addedEmployee = response.data;

      setEmployees(prevEmployees => [
        ...prevEmployees,
        {
          empId: addedEmployee.empId,
          ename: addedEmployee.ename,
          email: addedEmployee.email,
          password: addedEmployee.password,
          phone: addedEmployee.phone,
          role: addedEmployee.role
        }
      ]);

      toast({
        title: "Success",
        description: `Employee ${newEmployeeName} added successfully!`,
      });

      setIsAddEmployeeModalOpen(false);
      setNewEmployeeName('');
      setNewEmployeeEmail('');
      setNewEmployeePhone('');
      setNewEmployeeId('');
      setNewEmployeePassword('');
      setNewEmployeeConfirmPassword('');

    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add employee",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Employee Management</h2>
            <p className="text-gray-600">Manage and view employee information</p>
          </div>
          {canManageEmployees && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddEmployeeModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>All Employees ({employees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 p-4">{error}</div>
            ) : (
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.empId} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {employee.ename.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{employee.ename}</h3>
                        <p className="text-sm text-gray-600">{employee.email}</p>
                        <p className="text-sm text-gray-500">ID: {employee.empId}</p>
                        <p className="text-sm text-gray-500">
                          {employee.phone ? `Phone: ${employee.phone}` : 'No phone number'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={employee.role ? 'default' : 'secondary'}>
                        {employee.role || 'No Role'}
                      </Badge>
                      {/* <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManageEmployees && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeModalOpen} onOpenChange={setIsAddEmployeeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Add New Employee</DialogTitle>
            <DialogDescription>
              Fill in the employee's details below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  className="pl-10"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="emailAddress">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="emailAddress"
                  type="email"
                  placeholder="Enter email address"
                  className="pl-10"
                  value={newEmployeeEmail}
                  onChange={(e) => setNewEmployeeEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter phone number"
                  className="pl-10"
                  value={newEmployeePhone}
                  onChange={(e) => setNewEmployeePhone(e.target.value)}
                />
              </div>
            </div>

            {/* Employee ID */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="employeeId"
                  placeholder="Enter employee ID"
                  className="pl-10"
                  value={newEmployeeId}
                  onChange={(e) => setNewEmployeeId(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={newEmployeePassword}
                onChange={(e) => setNewEmployeePassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={newEmployeeConfirmPassword}
                onChange={(e) => setNewEmployeeConfirmPassword(e.target.value)}
              />
            </div>

          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddEmployee}>
              Save Employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EmployeeManagement;
