import { format } from 'date-fns';
import { ActionLog } from '@shared/schema';
import governmentLogo from '@assets/Govcio_logo-removebg-preview.png';
import { useState, useEffect } from 'react';

interface PrintableSingleActionLogProps {
  log: ActionLog | null;
  onClose: () => void;
}

export const PrintableSingleActionLog = ({ log, onClose }: PrintableSingleActionLogProps) => {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Set a small delay to ensure the component is fully rendered
    if (log) {
      const timer = setTimeout(() => {
        setIsReady(true);
        print();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [log]);
  
  function getStatusText(status: string) {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'under_review':
        return 'Under Review';
      default:
        return status;
    }
  }

  function getStatusClass(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  }

  // Close the print preview after printing completes or is cancelled
  const handleAfterPrint = () => {
    window.removeEventListener('afterprint', handleAfterPrint);
    onClose();
  };

  const print = () => {
    window.addEventListener('afterprint', handleAfterPrint, { once: true });
    window.print();
  };

  if (!log) return null;

  // The main printable content
  return (
    <div 
      className="fixed inset-0 bg-white z-50 p-8"
      style={{ 
        display: isReady ? 'block' : 'none',
      }}
    >
      {/* Close button - only visible on screen, not in print */}
      <button 
        onClick={onClose}
        className="print:hidden absolute top-4 right-4 bg-gray-200 rounded-full p-2 hover:bg-gray-300"
      >
        ✕
      </button>
      
      {/* Header with logo - centered at the top */}
      <div className="flex justify-center mb-8">
        <img 
          src={governmentLogo} 
          alt="GovCIO Logo" 
          className="h-20"
        />
      </div>

      <div className="text-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">Action Item Details</h1>
        <p className="text-sm text-gray-600">Printed: {format(new Date(), 'MMMM d, yyyy')}</p>
      </div>

      {/* Main content */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{log.title}</h2>
        
        <div className="flex items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(log.status)}`}>
            {getStatusText(log.status)}
          </span>
          {log.category && (
            <span className="ml-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
              {log.category}
            </span>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="whitespace-pre-wrap">{log.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Requester:</span> {log.requesterName}</p>
            <p><span className="font-medium">Created:</span> {format(new Date(log.createdDate), 'MMMM d, yyyy')}</p>
            {log.dueDate && (
              <p><span className="font-medium">Due Date:</span> {format(new Date(log.dueDate), 'MMMM d, yyyy')}</p>
            )}
          </div>
          <div>
            {log.status === 'completed' && log.completedDate && (
              <p><span className="font-medium">Completed Date:</span> {format(new Date(log.completedDate), 'MMMM d, yyyy')}</p>
            )}
            {log.assignedTo && (
              <p><span className="font-medium">Assigned To:</span> {log.assignedTo}</p>
            )}
            <p><span className="font-medium">Reference ID:</span> {log.id}</p>
          </div>
        </div>
      </div>
            
      {/* Footer */}
      <div className="mt-8 pt-3 border-t text-center text-xs text-gray-500">
        <p>GOVCIO/SAMS ELT PROGRAM MANAGEMENT - This is a system-generated document</p>
      </div>
    </div>
  );
};