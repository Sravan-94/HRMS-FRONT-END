
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Upload,
  Download,
  Eye,
  Search,
  ClipboardList
} from 'lucide-react';

const Documents = () => {
  const userRole = localStorage.getItem('userRole') || 'employee';
  
  const getSidebarItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: `/${userRole}-dashboard`, active: false },
      { icon: Users, label: 'Employee Management', path: '/employee-management' },
      { icon: Calendar, label: 'Leave Management', path: '/leave-management' },
      { icon: Clock, label: 'Attendance', path: '/attendance' },
      { icon: TrendingUp, label: 'Performance', path: '/performance' },
      { icon: FileText, label: 'Documents', path: '/documents', active: true },
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

  const documents = [
    {
      id: 1,
      name: 'Employee Handbook 2024',
      type: 'Policy',
      category: 'Company Policies',
      uploadedBy: 'HR Team',
      uploadDate: '2024-01-15',
      size: '2.5 MB',
      access: 'All Employees'
    },
    {
      id: 2,
      name: 'Performance Review Template',
      type: 'Template',
      category: 'HR Forms',
      uploadedBy: 'Sarah Wilson',
      uploadDate: '2024-03-01',
      size: '1.2 MB',
      access: 'HR & Admin'
    },
    {
      id: 3,
      name: 'Leave Request Form',
      type: 'Form',
      category: 'HR Forms',
      uploadedBy: 'Admin',
      uploadDate: '2024-02-10',
      size: '0.8 MB',
      access: 'All Employees'
    },
    {
      id: 4,
      name: 'Salary Certificate - John Doe',
      type: 'Certificate',
      category: 'Personal Documents',
      uploadedBy: 'HR Team',
      uploadDate: '2024-05-20',
      size: '0.5 MB',
      access: 'Employee Only'
    },
    {
      id: 5,
      name: 'Company Org Chart 2024',
      type: 'Reference',
      category: 'Company Info',
      uploadedBy: 'Admin',
      uploadDate: '2024-01-01',
      size: '1.8 MB',
      access: 'All Employees'
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Policy': return 'bg-blue-100 text-blue-800';
      case 'Template': return 'bg-green-100 text-green-800';
      case 'Form': return 'bg-purple-100 text-purple-800';
      case 'Certificate': return 'bg-yellow-100 text-yellow-800';
      case 'Reference': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canUploadDocuments = userRole === 'admin' || userRole === 'hr';

  return (
    <DashboardLayout
      sidebarItems={getSidebarItems()}
      title="Document Management"
      userRole={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Document Management</h2>
            <p className="text-gray-600">Access and manage company documents</p>
          </div>
          {canUploadDocuments && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
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
                    placeholder="Search documents..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">Filter by Category</Button>
              <Button variant="outline">Filter by Type</Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Policy Documents</p>
                  <p className="text-2xl font-bold">{documents.filter(d => d.type === 'Policy').length}</p>
                </div>
                <Settings className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Forms & Templates</p>
                  <p className="text-2xl font-bold">{documents.filter(d => d.type === 'Form' || d.type === 'Template').length}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Upload className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{document.name}</h3>
                      <p className="text-sm text-gray-600">{document.category} • {document.size}</p>
                      <p className="text-sm text-gray-500">Uploaded by {document.uploadedBy} on {document.uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getTypeColor(document.type)}>
                      {document.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {document.access}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Access (for employees) */}
        {userRole === 'employee' && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-16 flex flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  Employee Handbook
                </Button>
                <Button variant="outline" className="h-16 flex flex-col gap-2">
                  <Calendar className="h-5 w-5" />
                  Leave Request Form
                </Button>
                <Button variant="outline" className="h-16 flex flex-col gap-2">
                  <Settings className="h-5 w-5" />
                  Company Policies
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Company Policies</span>
                  <span className="text-sm text-gray-600">2 documents</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">HR Forms</span>
                  <span className="text-sm text-gray-600">2 documents</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Personal Documents</span>
                  <span className="text-sm text-gray-600">1 document</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Company Info</span>
                  <span className="text-sm text-gray-600">1 document</span>
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
                  <Upload className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Salary Certificate uploaded</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Download className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Employee Handbook downloaded</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Performance Review Template updated</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
