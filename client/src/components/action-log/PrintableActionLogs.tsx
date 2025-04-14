import { format } from 'date-fns';
import { ActionLog } from '@shared/schema';
import governmentLogo from '@assets/Govcio_logo-removebg-preview.png';

interface PrintableActionLogsProps {
  logs: ActionLog[];
  printRef: React.RefObject<HTMLDivElement>;
}

export function PrintableActionLogs({ logs, printRef }: PrintableActionLogsProps) {
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

  return (
    <div 
      ref={printRef} 
      className="hidden print:block print:p-6"
    >
      <div className="mb-8 flex justify-between items-center">
        <div>
          <img src={governmentLogo} alt="GovCIO Logo" className="h-12 mb-2" />
          <h1 className="text-2xl font-bold">Action Log Report</h1>
          <p className="text-muted-foreground">Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-medium">GOVCIO/SAMS ELT PROGRAM</div>
          <div className="text-muted-foreground">School Management System</div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Total Items</div>
          <div className="text-2xl font-bold">{logs.length}</div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold">{logs.filter(log => log.status === 'pending').length}</div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold">{logs.filter(log => log.status === 'completed').length}</div>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="border px-4 py-2 text-left">Title</th>
            <th className="border px-4 py-2 text-left">Requester</th>
            <th className="border px-4 py-2 text-left">Status</th>
            <th className="border px-4 py-2 text-left">Category</th>
            <th className="border px-4 py-2 text-left">Created Date</th>
            <th className="border px-4 py-2 text-left">Due Date</th>
            <th className="border px-4 py-2 text-left">Completed Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b">
              <td className="border px-4 py-2">{log.title}</td>
              <td className="border px-4 py-2">{log.requesterName}</td>
              <td className="border px-4 py-2">{getStatusText(log.status)}</td>
              <td className="border px-4 py-2">{log.category || '-'}</td>
              <td className="border px-4 py-2">
                {format(new Date(log.createdDate), 'MMM d, yyyy')}
              </td>
              <td className="border px-4 py-2">
                {log.dueDate ? format(new Date(log.dueDate), 'MMM d, yyyy') : '-'}
              </td>
              <td className="border px-4 py-2">
                {log.completedDate ? format(new Date(log.completedDate), 'MMM d, yyyy') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6">
        <h2 className="text-lg font-bold mb-2">Action Item Details</h2>
        {logs.map((log) => (
          <div key={log.id} className="mb-4 pb-4 border-b">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <span className="font-semibold">Title:</span> {log.title}
              </div>
              <div>
                <span className="font-semibold">Requester:</span> {log.requesterName}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {getStatusText(log.status)}
              </div>
              <div>
                <span className="font-semibold">Category:</span> {log.category || '-'}
              </div>
              <div>
                <span className="font-semibold">Created Date:</span> {format(new Date(log.createdDate), 'MMM d, yyyy')}
              </div>
              <div>
                <span className="font-semibold">Due Date:</span> {log.dueDate ? format(new Date(log.dueDate), 'MMM d, yyyy') : '-'}
              </div>
              {log.status === 'completed' && log.completedDate && (
                <div>
                  <span className="font-semibold">Completed Date:</span> {format(new Date(log.completedDate), 'MMM d, yyyy')}
                </div>
              )}
            </div>
            <div>
              <span className="font-semibold">Description:</span>
              <p className="mt-1">{log.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
        <p>This report was generated from the GOVCIO/SAMS ELT PROGRAM MANAGEMENT System.</p>
        <p>Page 1 of 1</p>
      </div>
    </div>
  );
}