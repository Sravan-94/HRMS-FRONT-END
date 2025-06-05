import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  User,
  Download
} from 'lucide-react';
import { useState } from 'react';

interface Document {
  id: number;
  name: string;
  sharedWith: string[]; // Emails of employees the document is shared with
  filePath: string; // Placeholder for file path
}

const EmployeeDocuments = () => {
  const userRole = localStorage.getItem('userRole') || 'employee';
  const userEmail = localStorage.getItem('userEmail'); // Assuming user email is stored

  // Mock documents data - will need to be filtered for the logged-in employee
  const allDocuments: Document[] = [
    {
      id: 1,
      name: 'Performance Review - Q1 2024',
      sharedWith: ['john@company.com', 'sarah@company.com'],
      filePath: '/docs/performance_q1_2024.pdf'
    },
    {
      id: 2,
      name: 'Employee Handbook',
      sharedWith: ['john@company.com', 'sarah@company.com', 'mike@company.com', 'emily@company.com', 'robert@company.com'], // Shared with all employees
      filePath: '/docs/employee_handbook.pdf'
    },
    {
      id: 3,
      name: 'Payslip - June 2024',
      sharedWith: ['john@company.com'], // Shared only with John Doe
      filePath: '/docs/payslip_june_2024_john.pdf'
    },
    {
      id: 4,
      name: 'Marketing Team Guidelines',
      sharedWith: ['sarah@company.com'], // Shared only with Sarah Wilson
      filePath: '/docs/marketing_guidelines.pdf'
    },
  ];

  // Filter documents shared with the logged-in employee
  const employeeDocuments = allDocuments.filter(doc =>
    doc.sharedWith.includes(userEmail || '')
  );

  const handleDownload = (filePath: string) => {
    // Placeholder for download logic
    console.log('Downloading file:', filePath);
    // In a real application, you would handle the file download here
    // This might involve making an API call or opening the file path in a new tab
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Documents</h2>
            <p className="text-gray-600">Access documents shared with you</p>
          </div>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents Shared With You ({employeeDocuments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeeDocuments.length > 0 ? (
                employeeDocuments.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <FileText className="h-6 w-6 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{document.name}</h3>
                        {/* <p className="text-sm text-gray-600">Shared by Admin/HR</p> */}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleDownload(document.filePath)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">No documents shared with you yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDocuments; 