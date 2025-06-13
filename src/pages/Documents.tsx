import { useState, useEffect, useMemo } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base_url } from '@/utils/config';


interface Employee {
  empId: number;
  ename: string;
  email: string;
  department: string;
}

interface Document {
  docId: number;
  empId: number;
  paySlips: string | null;
  pf: string | null;
  form16: string | null;
  uploadDateTime: string;
}



const Documents = () => {
  const userRole = localStorage.getItem('userRole') || 'employee';
  const userEmail = localStorage.getItem('userEmail');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [paySlips, setPaySlips] = useState<File | null>(null);
  const [pf, setPf] = useState<File | null>(null);
  const [form16, setForm16] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter documents for employees to show only their own
  const visibleDocuments = useMemo(() => {
    return userRole === 'employee'
      ? documents.filter(doc => {
          const emp = employees.find(e => e.email === userEmail);
          return emp && doc.empId === emp.empId;
        })
      : documents;
  }, [documents, employees, userRole, userEmail]);

  // Fetch all documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${base_url}/documents/all`);
        if (!response.ok) throw new Error('Failed to fetch documents');
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  // Fetch employees (for admin/HR upload form)
  useEffect(() => {
      const fetchEmployees = async () => {
        try {
        const response = await fetch(`${base_url}/emps/getEmps`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText} - ${errorText}`);
        }
          const data = await response.json();
          setEmployees(data);
        } catch (error) {
          console.error('Error fetching employees:', error);
          setError('Failed to load employee data');
        }
      };
      fetchEmployees();
  }, []);

  const handleUploadDocument = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    if (!paySlips && !pf && !form16) {
      setError('Please select at least one document to upload');
      return;
    }

    const formData = new FormData();
    if (paySlips) formData.append('paySlips', paySlips);
    if (pf) formData.append('pf', pf);
    if (form16) formData.append('form16', form16);

    console.log('FormData contents:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
    }

    try {
      const response = await fetch(`${base_url}/documents/upload/${selectedEmployee}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to upload document: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` - ${errorJson.message || errorText}`;
          if (errorMessage.includes('Failed to save file')) {
            errorMessage = 'Failed to upload document: Unable to save file on server. Please contact support.';
          }
        } catch (e) {
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }
      const newDocument = await response.json();
      setDocuments([...documents, newDocument]);
      setIsUploadModalOpen(false);
      setSelectedEmployee('');
      setPaySlips(null);
      setPf(null);
      setForm16(null);
      setError(null);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setError(error.message || 'Failed to upload document');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Pay Slip': return 'bg-blue-100 text-blue-800';
      case 'PF Statement': return 'bg-green-100 text-green-800';
      case 'Form 16': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentName = (doc: Document, type: string) => {
    switch (type) {
      case 'Pay Slip': return doc.paySlips ? `Pay Slip - ${new Date(doc.uploadDateTime).toLocaleDateString()}` : null;
      case 'PF Statement': return doc.pf ? `PF Statement - ${new Date(doc.uploadDateTime).toLocaleDateString()}` : null;
      case 'Form 16': return doc.form16 ? `Form 16 - ${new Date(doc.uploadDateTime).toLocaleDateString()}` : null;
      default: return null;
    }
  };

  const getDocumentUrl = (doc: Document, type: string) => {
    switch (type) {
      case 'Pay Slip': return doc.paySlips ? `$${base_url}${doc.paySlips}` : null;
      case 'PF Statement': return doc.pf ? `${base_url}${doc.pf}` : null;
      case 'Form 16': return doc.form16 ? `${base_url}${doc.form16}` : null;
      default: return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6 text-center text-gray-600">
            Loading...
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Document Management</h2>
            <p className="text-gray-600">Access and manage company documents</p>
          </div>
            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="w-full sm:w-auto">Filter by Category</Button>
              <Button variant="outline" className="w-full sm:w-auto">Filter by Type</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold">{visibleDocuments.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pay Slips</p>
                  <p className="text-2xl font-bold">{visibleDocuments.filter(d => d.paySlips).length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">PF Statements</p>
                  <p className="text-2xl font-bold">{visibleDocuments.filter(d => d.pf).length}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Form 16</p>
                  <p className="text-2xl font-bold">{visibleDocuments.filter(d => d.form16).length}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Pay Slip', 'PF Statement', 'Form 16'].map(type => (
                visibleDocuments.map(doc => {
                  const name = getDocumentName(doc, type);
                  const url = getDocumentUrl(doc, type);
                  if (name && url) {
                    return (
                      <div key={`${doc.docId}-${type}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow space-y-2 sm:space-y-0">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{name}</h3>
                            <p className="text-sm text-gray-600">Personal Documents • PDF</p>
                            <p className="text-sm text-gray-500">
                              Uploaded on {new Date(doc.uploadDateTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2 sm:mt-0">
                          <Badge className={getTypeColor(type)}>
                            {type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {userRole === 'employee' ? 'Employee Only' : 'Admin/HR'}
                          </Badge>
                          <div className="flex gap-2">
                            <Button size="sm" asChild variant="outline">
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button size="sm" asChild variant="outline">
                              <a href={url} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })
              ))}
              {visibleDocuments.length === 0 && (
                <p className="text-center text-gray-600">No documents available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {userRole === 'employee' && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Pay Slip', 'PF Statement', 'Form 16'].map(type => {
                  const latestDoc = visibleDocuments
                    .filter(doc => getDocumentUrl(doc, type))
                    .sort((a, b) => new Date(b.uploadDateTime).getTime() - new Date(a.uploadDateTime).getTime())[0];
                  return (
                    <Button
                      key={type}
                      variant="outline"
                      className="h-16 flex flex-col gap-2"
                      disabled={!latestDoc}
                      asChild
                    >
                      {latestDoc && (
                        <a href={getDocumentUrl(latestDoc, type)!} download>
                          <FileText className="h-5 w-5" />
                          Latest {type}
                        </a>
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pay Slips</span>
                  <span className="text-sm text-gray-600">{visibleDocuments.filter(d => d.paySlips).length} documents</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">PF Statements</span>
                  <span className="text-sm text-gray-600">{visibleDocuments.filter(d => d.pf).length} documents</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Form 16</span>
                  <span className="text-sm text-gray-600">{visibleDocuments.filter(d => d.form16).length} documents</span>
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
                {visibleDocuments
                  .sort((a, b) => new Date(b.uploadDateTime).getTime() - new Date(a.uploadDateTime).getTime())
                  .slice(0, 3)
                  .map(doc => (
                    <div key={doc.docId} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Upload className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Documents uploaded for Employee ID {doc.empId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.uploadDateTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                {visibleDocuments.length === 0 && (
                  <p className="text-sm text-gray-600">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
              <DialogDescription>
                Select an employee and upload their document(s).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Select Employee</Label>
                <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.empId} value={String(employee.empId)}>
                        {employee.ename} ({employee.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paySlips">Pay Slip</Label>
                <Input
                  id="paySlips"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPaySlips(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pf">PF Statement</Label>
                <Input
                  id="pf"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPf(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form16">Form 16</Label>
                <Input
                  id="form16"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setForm16(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsUploadModalOpen(false);
                setError(null);
                setSelectedEmployee('');
                setPaySlips(null);
                setPf(null);
                setForm16(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleUploadDocument}>
                Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
