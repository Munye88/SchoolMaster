import { format } from 'date-fns';
import { ActionLog } from '@shared/schema';
import governmentLogo from '@assets/Govcio_logo-removebg-preview.png';
import { useEffect, useState } from 'react';

interface PrintableSingleActionLogProps {
  log: ActionLog | null;
  onClose: () => void;
}

export const PrintableSingleActionLog = ({ log, onClose }: PrintableSingleActionLogProps) => {
  const [logoUrl, setLogoUrl] = useState<string>("");
  
  // Create a hardcoded base64 logo URL for printing since relative URLs don't work in new windows
  useEffect(() => {
    // Fallback hardcoded base64 of the GovCIO logo (if needed)
    const fallbackLogoBase64 = "data:image/png;base64,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";
    
    // Use the fallback logo
    setLogoUrl(fallbackLogoBase64);
  }, []);
  
  if (!log) return null;
  
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

  // Direct print method using window.open to create a new window just for printing
  const printLogDirectly = () => {
    if (!logoUrl) return; // Wait for logo to be ready
    
    // Create HTML content for the print window
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Action Item - ${log.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 15px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .subtitle {
            font-size: 14px;
            color: #666;
          }
          .content {
            margin-bottom: 30px;
          }
          .item-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 15px;
          }
          .status-pending {
            background-color: #e6f2ff;
            color: #0066cc;
          }
          .status-completed {
            background-color: #e6ffee;
            color: #00994d;
          }
          .status-under_review {
            background-color: #ffebe6;
            color: #cc3300;
          }
          .category {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            background-color: #f2f2f2;
            color: #666;
            font-size: 14px;
            margin-left: 10px;
          }
          .description-box {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .description-title {
            font-weight: bold;
            margin-bottom: 8px;
          }
          .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .detail-item {
            margin-bottom: 8px;
          }
          .label {
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoUrl}" alt="GovCIO Logo" class="logo">
          <h1 class="title">Action Item Details</h1>
          <p class="subtitle">Printed: ${format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        
        <div class="content">
          <h2 class="item-title">${log.title}</h2>
          
          <div>
            <span class="status status-${log.status}">${getStatusText(log.status)}</span>
            ${log.category ? `<span class="category">${log.category}</span>` : ''}
          </div>
          
          <div class="description-box">
            <div class="description-title">Description</div>
            <p>${log.description.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div class="details">
            <div>
              <p class="detail-item"><span class="label">Requester:</span> ${log.requesterName}</p>
              <p class="detail-item"><span class="label">Created:</span> ${format(new Date(log.createdDate), 'MMMM d, yyyy')}</p>
              ${log.dueDate ? `<p class="detail-item"><span class="label">Due Date:</span> ${format(new Date(log.dueDate), 'MMMM d, yyyy')}</p>` : ''}
            </div>
            <div>
              ${log.status === 'completed' && log.completedDate ? 
                `<p class="detail-item"><span class="label">Completed Date:</span> ${format(new Date(log.completedDate), 'MMMM d, yyyy')}</p>` : ''}
              ${log.assignedTo ? `<p class="detail-item"><span class="label">Assigned To:</span> ${log.assignedTo}</p>` : ''}
              <p class="detail-item"><span class="label">Reference ID:</span> ${log.id}</p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>GOVCIO/SAMS ELT PROGRAM MANAGEMENT - This is a system-generated document</p>
        </div>
        
        <script>
          // Auto-print when loaded
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    // Open new window and write content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
    
    // Close our component
    setTimeout(() => {
      onClose();
    }, 500);
  };
  
  // Trigger print immediately when logo is ready
  useEffect(() => {
    if (logoUrl) {
      setTimeout(printLogDirectly, 100);
    }
  }, [logoUrl]);
  
  // Return an empty div as we're using a separate window for printing
  return (
    <div className="hidden">
      <button onClick={onClose}>Close</button>
    </div>
  );
};