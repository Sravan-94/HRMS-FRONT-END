import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, UserCheck, User } from 'lucide-react';
import axios from 'axios';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password || !role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/emps/login', {
        email,
        password
      });

      const userData = response.data;

      // Verify if the selected role matches the API response role
      if (userData.role.toLowerCase() !== role.toLowerCase()) {
        toast({
          title: "Error",
          description: "Selected role does not match your account",
          variant: "destructive"
        });
        return;
      }

      // Store user data in localStorage
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('empId', userData.empId);
      localStorage.setItem('ename', userData.ename);

      toast({
        title: "Success",
        description: `Welcome, ${userData.ename}!`,
      });

      // Navigate based on role
      switch (userData.role.toLowerCase()) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'hr':
          navigate('/hr-dashboard');
          break;
        case 'employee':
          navigate('/employee-dashboard');
          break;
        default:
          toast({
            title: "Error",
            description: "Invalid role",
            variant: "destructive"
          });
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Invalid email or password",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HRMS Portal</h1>
          <p className="text-gray-600">Human Resource Management System</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="hr">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        HR Manager
                      </div>
                    </SelectItem>
                    <SelectItem value="employee">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Employee
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;