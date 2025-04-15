import { format } from 'date-fns';
import { ActionLog } from '@shared/schema';
import { useEffect } from 'react';

interface PrintableSingleActionLogProps {
  log: ActionLog | null;
  onClose: () => void;
}

export const PrintableSingleActionLog = ({ log, onClose }: PrintableSingleActionLogProps) => {
  if (!log) return null;
  
  const getStatusText = (status: string): string => {
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
  };

  // Open new window and trigger print on component mount
  useEffect(() => {
    // Directly embedded logo as SVG
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
            margin-bottom: 30px;
            display: flex;
            align-items: center;
          }
          .logo-container {
            width: 220px;
            margin-right: 20px;
          }
          .header-content {
            flex-grow: 1;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .date {
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
          .govcio-svg {
            width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <svg class="govcio-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 80">
              <g>
                <path d="M65,40c0-13.81-11.19-25-25-25S15,26.19,15,40s11.19,25,25,25c6.4,0,12.25-2.41,16.67-6.38" fill="#1c355e"/>
                <path d="M64.17,58.62C67.59,54.2,70,48.35,70,42c0-16.57-13.43-30-30-30S10,25.43,10,42s13.43,30,30,30" fill="#1c355e"/>
                <path d="M40,59c-9.37,0-17-7.63-17-17s7.63-17,17-17,17,7.63,17,17c0,4.3-1.61,8.23-4.24,11.24" fill="#1c355e"/>
                <path d="M52.76,53.24C55.39,50.23,57,46.3,57,42c0-9.37-7.63-17-17-17s-17,7.63-17,17,7.63,17,17,17" fill="#1c355e"/>
                <path d="M90,30H77v4h4v26h5V34h4V30z" fill="#1c355e"/>
                <path d="M110,40c0-5.5-4.5-10-10-10s-10,4.5-10,10,4.5,10,10,10,10-4.5,10-10" fill="#1c355e"/>
                <path d="M134,30v18c0,5.5-4.5,10-10,10s-10-4.5-10-10V30h5v18c0,2.75,2.25,5,5,5s5-2.25,5-5V30H134z" fill="#1c355e"/>
                <path d="M161,43.5c0,7-5.82,12.5-13,12.5s-13-5.5-13-12.5v-20h5v20c0,4.14,3.58,7.5,8,7.5s8-3.36,8-7.5v-20h5V43.5z" fill="#1c355e"/>
                <path d="M185,55c-2.93,2.46-6.7,4-10.87,4C165.53,59,158,51.94,158,43.5S165.53,28,174.13,28c4.17,0,7.94,1.54,10.87,4" fill="#00aeef"/>
                <path d="M184,45h-18v-5h18V45z" fill="#00aeef"/>
                <path d="M210,30v30h-5V48h-10v12h-5V30h5v13h10V30H210z" fill="#00aeef"/>
                <path d="M235,40c0-5.5-4.5-10-10-10s-10,4.5-10,10,4.5,10,10,10,10-4.5,10-10" fill="#00aeef"/>
                <path fill="#00aeef" d="M40 30A10 10 0 1 0 40 50A10 10 0 1 0 40 30Z"/>
              </g>
              <text x="20" y="75" font-size="10" fill="#1c355e">SALIENT ARABIA FOR MILITARY SUPPORT</text>
            </svg>
          </div>
          <div class="header-content">
            <h1 class="title">Action Item Details</h1>
            <p class="date">Printed: ${format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
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
    
    // Open new window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Close our component after a short delay
      setTimeout(() => {
        onClose();
      }, 500);
    }
  }, [log, onClose]);
  
  // Return null as we're using a separate window for printing
  return null;
};