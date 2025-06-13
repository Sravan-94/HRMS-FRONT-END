import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'employee';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Animated 404 Icon */}
        <div className="relative">
          <AlertCircle className="mx-auto h-24 w-24 text-blue-600 animate-pulse" />
          <div className="absolute inset-0 -z-10 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
          <p className="text-gray-500 leading-relaxed">
            Oops! It looks like the page you're looking for doesn't exist or has been moved.
            Let's get you back to where you belong.
          </p>
        </div>

        {/* Back to Dashboard Button */}
        <Link
          to={`/${userRole}-dashboard`}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>

        {/* Subtle Footer */}
        <div className="mt-8">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;