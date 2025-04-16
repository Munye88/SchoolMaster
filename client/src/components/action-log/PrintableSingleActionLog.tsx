import { format } from 'date-fns';
import { ActionLog } from '@shared/schema';
import { useEffect } from 'react';

interface PrintableSingleActionLogProps {
  log: ActionLog | null;
  onClose: () => void;
}

// Hardcoded logo as base64 - this ensures it's always available for printing
const LOGO_BASE64 = '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9uv2+/cL9xv3K/c790v3W/dr93v3i/er98v36/fr+Av4G/gr+Dv4S/hb+Gv4e/iL+Jv4q/i7+Mv42/jr+Pv5C/kb+Sv5O/lL+Vv5a/l7+Yv5m/mr+bv5y/nb+ev5+/oL+hv6K/o7+kv6W/pr+nv6i/qb+qv6u/rL+tv66/r7+wv7G/sr+zv7S/tb+2v7e/uL+5v7q/u7+8v72/vr+/v8C/wb/Cv8O/xL/Fv8a/x7/Iv8m/yr/Lv8y/zb/Ov8+/0L/Rv9K/07/Uv9W/1r/Xv9i/2b/av9u/3L/dv96/37/gv+G/4r/jv+S/5b/mv+e/6L/pv+q/67/sv+2/7r/vv/C/8b/yv/O/9L/1v/a/97/4v/m/+r/7v/y//b/+v/+/8MABwEHAgcDBwQHBQcGBwcHCAcJBwoHCwcMBw0HDgcPBxAHEQcSBxMHFAcVBxYHFwcYBxkHGgcbBxwHHQceBx8HIAchByIHIwckByUHJgcnBygHKQcqBysHLActBy4HLwcwBzEHMgczBzQHNQc2BzcHOAc5BzoHOwc8Bz0HPgc/B0AHQQdCB0MHRAdFB0YHRwdIB0kHSgdLB0wHTQdOB08HUAdRB1IHUwdUB1UHVgdXB1gHWQdaB1sHXAR3bm9sb2d5jLZbFJrF5obnkRRlQkw1iAmJCYlJiYmJyYoJikmKiYrJiwmLSYuJi8mMCYxJjImMyY0JjUmNiY3JjgmOSZKJksmTCZNJk4mTyZQJlEmUiZTJlQmVSZWJlcmWCZZJlomWyZcJl0mXiZfJmAmYSZiJmMmZCZlJmYmZyZoJmkmaiZrJmwmbSZuJm8mcCZxJnImcyZ0JnUmdiZ3JngmeSZ6JnsmfCZ9Jn4mfyaAJoEmgiaDeVNYwZjCmMOYxJjFmMaYx5jImMmYypjLmMyYzZjOmM+Y0JjRmNKY05jUmNWY1pjXmNiY2ZjamNuY3JjdmN6Y35jgmOGY4pjjmOSY5ZjmmOeY6JjpmOqY65jsmO2Y7pjvmPCY8ZjymQEgA5kEIAWZBiAHmQggCZkKIAuZDCANmQ4gD5kQIBGZEiATmRQgFZkWIBeZGCAZmRogG5kcIB2ZHiAfmSAgIZkiICOZJCAlmSYgJ5koICmZKiArmSwgLZkuIC+ZMCAxmTIgM5k0IDWZNiA3mTggOZk6IDuZPCA9mT4gP5lAIEGZQiBDmUQgRZlGIEeZSCBJmUogS5lMIE2ZTiBPmVAgUZlSIFOZVCBVmVYgV5lYIFmZWiBbmVwgXZleIF+ZYCBhmWIgY5lkIGWZZiBnmWggaZlqIGuZbCBtmW4gb5lwIHGZciBzmXQgdZl2IHeZeCB5mXoge5l8IH2ZfiB/mYAggZmCIIOZhCCFmYYgh5mIIImZiiCLmYwgjZmOII+ZkCCRmZIgk5mUIJWZliCXmZgEkALhNgqeJECQglcgRJCElFgEiQCVlJaUl4GlKYLpguEAAIOV0rXS1iEMnp0FnpUQngObngKblRCbAZieBJiVEJgFw+bD5sQPRHsFWgRbPeXm5ufm6BZEFkXm+WRIIBAiAEIAgACAEKBwgEDwEOAAQABAAAAAiAAAAAgAAAAAAAAAAAAIAAkAAYAAAAAAAAAAAQAAAAAAAAAAAAAAAAAA';

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
    printDocument();
  }, []);
  
  // Function to generate and print the document
  const printDocument = () => {
    // HTML content for print window
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
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
            width: 200px;
            margin-right: 20px;
          }
          .logo {
            max-width: 100%;
            height: auto;
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
          .fallback-logo {
            font-weight: bold;
            font-size: 24px;
            padding: 15px 0;
          }
          .blue-text {
            color: #1c355e;
          }
          .cyan-text {
            color: #00aeef;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <img src="data:image/png;base64,${LOGO_BASE64}" alt="GOVCIO Logo" class="logo">
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
  };
  
  // Return null as we're using a separate window for printing
  return null;
};