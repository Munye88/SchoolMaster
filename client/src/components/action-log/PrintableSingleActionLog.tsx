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

  if (!log) return null;

  return (
    <div 
      ref={ref} 
      className="hidden print:block print:p-6"
    >
      <div className="mb-8 flex justify-between items-center">
        <div>
          <img src={governmentLogo} alt="GovCIO Logo" className="h-12 mb-2" />
          <h1 className="text-2xl font-bold">Action Item</h1>
          <p className="text-muted-foreground">Printed on {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-medium">GOVCIO/SAMS ELT PROGRAM</div>
          <div className="text-muted-foreground">School Management System</div>
        </div>
      </div>

      <div className="border rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">{log.title}</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="font-semibold text-gray-700">Status:</span> 
            <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
              log.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : log.status === 'under_review'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {getStatusText(log.status)}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Requester:</span> {log.requesterName}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Created Date:</span> {format(new Date(log.createdDate), 'MMMM d, yyyy')}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Due Date:</span> {log.dueDate ? format(new Date(log.dueDate), 'MMMM d, yyyy') : 'Not specified'}
          </div>
          {log.status === 'completed' && log.completedDate && (
            <div>
              <span className="font-semibold text-gray-700">Completed Date:</span> {format(new Date(log.completedDate), 'MMMM d, yyyy')}
            </div>
          )}
          <div>
            <span className="font-semibold text-gray-700">Category:</span> {log.category || 'Not categorized'}
          </div>
          {log.assignedTo && (
            <div>
              <span className="font-semibold text-gray-700">Assigned To:</span> {log.assignedTo}
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
          <div className="p-4 bg-gray-50 rounded-lg border">{log.description}</div>
        </div>

        {log.id && (
          <div className="text-sm text-gray-500">
            Reference ID: {log.id}
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 text-center text-sm text-gray-500 border-t">
        <p>This document was generated from the GOVCIO/SAMS ELT PROGRAM MANAGEMENT System.</p>
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