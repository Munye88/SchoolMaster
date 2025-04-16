import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ActionLog } from '@shared/schema';

/**
 * Generates a PDF for an action log item
 * @param log The action log item to convert to PDF
 * @returns A blob URL to the generated PDF
 */
export const generateActionLogPdf = (log: ActionLog): Promise<string> => {
  return new Promise((resolve) => {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set fonts and colors
    const titleFont = 'helvetica';
    const bodyFont = 'helvetica';
    const primaryColor = '#1c355e';
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Current y position (starts after margin)
    let y = margin;
    
    // Add header
    doc.setFont(titleFont, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text('Action Item Details', margin, y);
    y += 10;
    
    doc.setFontSize(11);
    doc.setTextColor('#666666');
    doc.text(`Printed: ${format(new Date(), 'MMMM d, yyyy')}`, margin, y);
    
    // Add horizontal line
    y += 5;
    doc.setDrawColor('#dddddd');
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // Add title
    doc.setFont(titleFont, 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#000000');
    doc.text(log.title, margin, y);
    y += 10;
    
    // Add status
    const getStatusText = (status: string): string => {
      switch (status) {
        case 'completed': return 'Completed';
        case 'pending': return 'Pending';
        case 'under_review': return 'Under Review';
        default: return status;
      }
    };
    
    const statusText = getStatusText(log.status);
    doc.setFont(bodyFont, 'normal');
    doc.setFontSize(10);
    
    // Set status color
    switch (log.status) {
      case 'completed':
        doc.setTextColor('#00994d');
        break;
      case 'pending':
        doc.setTextColor('#0066cc');
        break;
      case 'under_review':
        doc.setTextColor('#cc3300');
        break;
      default:
        doc.setTextColor('#666666');
    }
    
    doc.text(`Status: ${statusText}`, margin, y);
    y += 7;
    
    // Reset text color
    doc.setTextColor('#000000');
    
    // Add category if exists
    if (log.category) {
      doc.setFont(bodyFont, 'normal');
      doc.setFontSize(10);
      doc.text(`Category: ${log.category}`, margin, y);
      y += 7;
    }
    
    // Add description box
    doc.setDrawColor('#dddddd');
    doc.setFillColor(249, 249, 249);
    doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'FD');
    
    doc.setFont(bodyFont, 'bold');
    doc.setFontSize(10);
    doc.text('Description', margin + 5, y + 7);
    
    doc.setFont(bodyFont, 'normal');
    doc.setTextColor('#333333');
    
    // Handle multiline description text with word wrap
    const descLines = doc.splitTextToSize(log.description, contentWidth - 10);
    doc.text(descLines, margin + 5, y + 15);
    
    y += 40;  // Adjust based on description height
    
    // Add details in two columns
    const leftColX = margin;
    const rightColX = margin + (contentWidth / 2);
    
    doc.setFont(bodyFont, 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#333333');
    
    // Left column
    doc.setFont(bodyFont, 'bold');
    doc.text('Requester:', leftColX, y);
    doc.setFont(bodyFont, 'normal');
    doc.text(log.requesterName, leftColX + 25, y);
    y += 7;
    
    doc.setFont(bodyFont, 'bold');
    doc.text('Created:', leftColX, y);
    doc.setFont(bodyFont, 'normal');
    doc.text(format(new Date(log.createdDate), 'MMMM d, yyyy'), leftColX + 25, y);
    y += 7;
    
    if (log.dueDate) {
      doc.setFont(bodyFont, 'bold');
      doc.text('Due Date:', leftColX, y);
      doc.setFont(bodyFont, 'normal');
      doc.text(format(new Date(log.dueDate), 'MMMM d, yyyy'), leftColX + 25, y);
    }
    
    // Reset y for right column
    y -= (log.dueDate ? 14 : 7);
    
    // Right column
    if (log.status === 'completed' && log.completedDate) {
      doc.setFont(bodyFont, 'bold');
      doc.text('Completed:', rightColX, y);
      doc.setFont(bodyFont, 'normal');
      doc.text(format(new Date(log.completedDate), 'MMMM d, yyyy'), rightColX + 25, y);
      y += 7;
    }
    
    if (log.assignedTo) {
      doc.setFont(bodyFont, 'bold');
      doc.text('Assigned To:', rightColX, y);
      doc.setFont(bodyFont, 'normal');
      doc.text(String(log.assignedTo), rightColX + 25, y);
      y += 7;
    }
    
    doc.setFont(bodyFont, 'bold');
    doc.text('Reference ID:', rightColX, y);
    doc.setFont(bodyFont, 'normal');
    doc.text(String(log.id), rightColX + 25, y);
    
    // Add footer
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFont(bodyFont, 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#999999');
    doc.text('GOVCIO/SAMS ELT PROGRAM MANAGEMENT - This is a system-generated document', pageWidth / 2, footerY, { align: 'center' });
    
    // Generate PDF blob URL
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    resolve(blobUrl);
  });
};

/**
 * Shares an action log item as a PDF file
 * @param log The action log item to share
 * @param shareMethod The method to use for sharing ('download' | 'whatsapp' | 'email' | 'twitter')
 */
export const shareActionLogAsPdf = async (
  log: ActionLog, 
  shareMethod: 'download' | 'whatsapp' | 'email' | 'twitter' | 'copy'
): Promise<void> => {
  // Generate the PDF
  const pdfUrl = await generateActionLogPdf(log);
  
  // Share based on selected method
  switch (shareMethod) {
    case 'download':
      // Create a download link
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `ActionItem_${log.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      break;
      
    case 'whatsapp':
      // For WhatsApp, we need to first download the file locally since WhatsApp can't directly access blob URLs
      // We'll open WhatsApp web with text information and suggest downloading the PDF
      const whatsappText = `Action Item: ${log.title}\nStatus: ${log.status}\nRequested by: ${log.requesterName}\n\nPlease see the attached PDF for details.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
      // Also trigger download
      const whatsappLink = document.createElement('a');
      whatsappLink.href = pdfUrl;
      whatsappLink.download = `ActionItem_${log.id}.pdf`;
      document.body.appendChild(whatsappLink);
      whatsappLink.click();
      document.body.removeChild(whatsappLink);
      break;
      
    case 'email':
      // For email, we can't directly attach the PDF, so we'll compose an email with text info
      // and suggest downloading the PDF
      const subject = `Action Item: ${log.title}`;
      const body = `Status: ${log.status}\nRequested by: ${log.requesterName}\nDescription: ${log.description}\n\nPlease see the attached PDF for details.`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // Also trigger download
      const emailLink = document.createElement('a');
      emailLink.href = pdfUrl;
      emailLink.download = `ActionItem_${log.id}.pdf`;
      document.body.appendChild(emailLink);
      emailLink.click();
      document.body.removeChild(emailLink);
      break;
      
    case 'twitter':
      // For Twitter, we can't directly attach the PDF, so we'll compose a tweet with minimal info
      const tweetText = `Action Item: ${log.title} - Status: ${log.status}`;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
      // Also trigger download
      const twitterLink = document.createElement('a');
      twitterLink.href = pdfUrl;
      twitterLink.download = `ActionItem_${log.id}.pdf`;
      document.body.appendChild(twitterLink);
      twitterLink.click();
      document.body.removeChild(twitterLink);
      break;
      
    case 'copy':
      // For clipboard copy, we'll just download the PDF
      const copyLink = document.createElement('a');
      copyLink.href = pdfUrl;
      copyLink.download = `ActionItem_${log.id}.pdf`;
      document.body.appendChild(copyLink);
      copyLink.click();
      document.body.removeChild(copyLink);
      break;
  }
  
  // Clean up the blob URL
  setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
  }, 1000);
};