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
import { useState, useEffect } from 'react';
import { base_url } from '@/utils/config';


interface Document {
  docId: number;
  empId: number;
  paySlips: string | null;
  pf: string | null;
  form16: string | null;
  uploadDateTime: string;
}

const EmployeeDocuments = () => {
  const userRole = localStorage.getItem('userRole') || 'employee';
  const userEmail = localStorage.getItem('userEmail') || '';
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employee ID and documents
  useEffect(() => {
    const fetchEmployeeIdAndDocuments = async () => {
      try {
        setLoading(true);
        // Note: Assuming an API to get empId by email; replace with actual API
        // Placeholder: Mock fetching empId (e.g., from userEmail)
        const empId = 2; // Replace with actual API call to get empId from userEmail
        setEmployeeId(empId);

        if (empId) {
          const response = await fetch(`${base_url}/documents/employee/${empId}`);
          if (!response.ok) throw new Error('Failed to fetch documents');
          const data = await response.json();
          // Ensure data is an array; API might return a single object
          setDocuments(Array.isArray(data) ? data : [data]);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    if (userEmail) {
      fetchEmployeeIdAndDocuments();
    } else {
      setError('User email not found');
      setLoading(false);
    }
  }, [userEmail]);

  const handleDownload = (filePath: string) => {
    // Trigger file download by creating a temporary link
    const link = document.createElement('a');
    link.href = filePath; // Assumes filePath is a valid URL
    link.download = filePath.split('/').pop() || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocumentEntries = (doc: Document) => {
    const entries: { name: string; filePath: string }[] = [];
    if (doc.paySlips) {
      entries.push({
        name: `Pay Slip - ${new Date(doc.uploadDateTime).toLocaleDateString()}`,
        filePath: doc.paySlips,
      });
    }
    if (doc.pf) {
      entries.push({
        name: `PF Statement - ${new Date(doc.uploadDateTime).toLocaleDateString()}`,
        filePath: doc.pf,
      });
    }
    if (doc.form16) {
      entries.push({
        name: `Form 16 - ${new Date(doc.uploadDateTime).toLocaleDateString()}`,
        filePath: doc.form16,
      });
    }
    return entries;
  };

  // Flatten documents into individual entries for display
  const employeeDocuments = documents.flatMap(doc => getDocumentEntries(doc));

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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Documents</h2>
            <p className="text-gray-600">Access documents shared with you</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Documents Shared With You ({employeeDocuments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeeDocuments.length > 0 ? (
                employeeDocuments.map((document, index) => (
                  <div key={`${document.filePath}-${index}`} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <FileText className="h-6 w-6 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{document.name}</h3>
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