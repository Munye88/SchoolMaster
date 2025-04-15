import { format } from 'date-fns';
import { ActionLog } from '@shared/schema';
import governmentLogo from '@assets/Govcio_logo-removebg-preview.png';
import { useRef, forwardRef, ForwardRefRenderFunction } from 'react';

interface PrintableSingleActionLogProps {
  log: ActionLog | null;
}

// Using forwardRef to access the component ref from parent
const PrintableSingleActionLogComponent: ForwardRefRenderFunction<HTMLDivElement, PrintableSingleActionLogProps> = 
  ({ log }, ref) => {
  
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

  if (!log) return null;

  return (
    <div 
      ref={ref} 
      className="hidden print:block print:p-6"
    >
      {/* Header with logo */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div className="flex items-center">
          <img src={governmentLogo} alt="GovCIO Logo" className="h-16 mr-4" />
          <div>
            <h1 className="text-xl font-bold">GOVCIO/SAMS ELT PROGRAM MANAGEMENT</h1>
            <p className="text-sm text-gray-600">Action Item - {log.title}</p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p>Printed: {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
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

export const PrintableSingleActionLog = forwardRef(PrintableSingleActionLogComponent);

// Utility hook for printing a single action log
export function usePrintSingleActionLog() {
  const printRef = useRef<HTMLDivElement>(null);
  
  const printSingleActionLog = () => {
    // Trigger browser print functionality
    window.print();
  };
  
  return { printRef, printSingleActionLog };
}