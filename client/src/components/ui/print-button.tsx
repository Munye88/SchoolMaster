import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface PrintButtonProps {
  contentId?: string;
  customPrintFunction?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  children?: ReactNode;
  buttonText?: string;
}

/**
 * A reusable print button component
 * Can either print a specific element by ID or use a custom print function
 * 
 * @param contentId - The ID of the element to print (optional)
 * @param customPrintFunction - A custom function to handle printing (optional)
 * @param className - Additional CSS classes
 * @param variant - Button variant
 * @param children - Button children (defaults to "Print" with an icon)
 */
export function PrintButton({
  contentId,
  customPrintFunction,
  className = '',
  variant = 'outline',
  children,
  buttonText
}: PrintButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    
    try {
      if (customPrintFunction) {
        customPrintFunction();
      } else if (contentId) {
        // If we have a content ID, print just that element
        const contentElement = document.getElementById(contentId);
        if (!contentElement) {
          console.error(`Element with ID "${contentId}" not found`);
          return;
        }
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          alert('Please allow pop-ups to print');
          return;
        }
        
        // Get any stylesheets from the parent document
        const stylesheets = Array.from(document.styleSheets)
          .map(styleSheet => {
            try {
              return styleSheet.href ? `<link rel="stylesheet" href="${styleSheet.href}" />` : '';
            } catch (e) {
              return '';
            }
          })
          .filter(Boolean)
          .join('');
        
        // Write the content to the new window
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print</title>
              ${stylesheets}
              <style>
                @media print {
                  body {
                    font-family: Arial, sans-serif;
                  }
                  @page {
                    size: A4;
                    margin: 1.5cm;
                  }
                  button, .no-print {
                    display: none !important;
                  }
                  /* Specific styling for leave request details dialog */
                  .leave-details h4 {
                    font-size: 14px;
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 4px;
                  }
                  .leave-details p {
                    font-size: 16px;
                    margin-bottom: 16px;
                  }
                  .leave-details .instructor-card {
                    background-color: #f9f9f9 !important;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                  }
                  .leave-details .instructor-name {
                    font-size: 18px;
                    font-weight: bold;
                  }
                  /* Dialog header/footer shouldn't appear in print */
                  .leave-details-dialog-header,
                  .leave-details-dialog-footer {
                    display: none !important;
                  }
                  /* Grid layout for date fields */
                  .leave-details .dates-grid,
                  .leave-details .leave-type-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-bottom: 24px;
                  }
                }
              </style>
            </head>
            <body>
              ${contentElement.outerHTML}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.close();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        
        printWindow.document.close();
      } else {
        // If no content ID or custom function, just print the whole page
        window.print();
      }
    } catch (error) {
      console.error("Print error:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      className={`gap-2 ${className}`} 
      onClick={handlePrint}
      disabled={isPrinting}
    >
      {children || (
        <>
          <Printer className="h-4 w-4" />
          <span>{buttonText || 'Print'}</span>
        </>
      )}
    </Button>
  );
}