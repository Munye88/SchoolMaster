import { format } from 'date-fns';
import { ActionLog } from '@shared/schema';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PrintableSingleActionLogProps {
  log: ActionLog | null;
  onClose: () => void;
}

export const PrintableSingleActionLog = ({ log, onClose }: PrintableSingleActionLogProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
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
    const fetchLogoData = async () => {
      try {
        const response = await fetch('/logo_base64.txt');
        if (!response.ok) {
          throw new Error('Failed to load logo');
        }
        const base64Data = await response.text();
        
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
                margin-bottom: 30px;
                display: flex;
                align-items: center;
              }
              .logo {
                max-width: 250px;
                height: auto;
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
            </style>
          </head>
          <body>
            <div class="header">
              <img src="data:image/png;base64,${base64Data}" alt="GovCIO Logo" class="logo">
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
      } catch (error) {
        console.error('Error loading logo:', error);
        toast({
          title: "Error loading logo",
          description: "Could not load the logo for printing. Using text fallback.",
          variant: "destructive"
        });
        
        // Fallback to text version if image loading fails
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(getFallbackPrintContent());
          printWindow.document.close();
          
          setTimeout(() => {
            onClose();
          }, 500);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fallback print content with text logo
    const getFallbackPrintContent = () => {
      return `
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
            .logo {
              width: 180px;
              margin-right: 20px;
              background: #003366;
              color: white;
              font-weight: bold;
              text-align: center;
              padding: 15px 0;
              font-size: 20px;
            }
            .header-content {
              flex-grow: 1;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
            }
            /* Rest of styles remain the same */
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
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">GOVCIO</div>
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
    };
    
    fetchLogoData();
  }, [log, onClose, toast]);
  
  // Return a loading indicator while processing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Preparing document for printing...</span>
      </div>
    );
  }
  
  // Return null once printing has started
  return null;
};