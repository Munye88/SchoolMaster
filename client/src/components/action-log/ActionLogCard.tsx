import { format } from 'date-fns';
import { Clock, Calendar, Check, CheckCircle2, AlertCircle, MoreHorizontal, Printer, Share2, Download, Mail, Twitter, ClipboardCopy } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { ActionLog } from '@shared/schema';
import { toast } from '@/hooks/use-toast';
import { shareActionLogAsPdf } from './ActionLogPdfGenerator';

interface ActionLogCardProps {
  log: ActionLog;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (id: number, status: 'pending' | 'completed' | 'under_review') => void;
  onPrint: (log: ActionLog) => void;
}

export function ActionLogCard({ log, onEdit, onDelete, onStatusChange, onPrint }: ActionLogCardProps) {
  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/20 dark:text-green-400';
      case 'pending':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/20 dark:text-blue-400';
      case 'under_review':
        return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/20 dark:text-red-400';
      default:
        return '';
    }
  }

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

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />;
      case 'under_review':
        return <AlertCircle className="w-4 h-4 mr-1 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  }
  
  // Calculate if item is due soon (within next 7 days)
  function isDueSoon() {
    if (!log.dueDate) return false;
    const dueDate = new Date(log.dueDate);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return dueDate >= today && dueDate <= nextWeek;
  }

  const dueSoon = isDueSoon() && log.status !== 'completed';
  
  return (
    <div className={`p-4 border-l-4 ${
      log.status === 'completed' 
        ? 'border-l-green-500 bg-green-50/30 dark:bg-green-900/10' 
        : log.status === 'under_review'
        ? 'border-l-red-500 bg-red-50/30 dark:bg-red-900/10'
        : 'border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
    } hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors ${log.status === 'completed' ? 'opacity-80' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{log.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Requested by {log.requesterName}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(log.id, 'pending')}>
              Mark as Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(log.id, 'under_review')}>
              Mark as Under Review
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(log.id, 'completed')}>
              Mark as Completed
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onPrint(log)} className="text-primary dark:text-primary-foreground">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Share2 className="h-4 w-4 mr-2" />
                Share as PDF
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={async () => {
                  try {
                    await shareActionLogAsPdf(log, 'download');
                    toast({
                      title: "PDF downloaded",
                      description: "Action item PDF has been downloaded",
                      duration: 3000,
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to download PDF",
                      variant: "destructive",
                      duration: 3000,
                    });
                  }
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  try {
                    await shareActionLogAsPdf(log, 'whatsapp');
                    toast({
                      title: "WhatsApp Share",
                      description: "PDF has been downloaded and WhatsApp opened",
                      duration: 3000,
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to share via WhatsApp",
                      variant: "destructive",
                      duration: 3000,
                    });
                  }
                }}>
                  <span className="h-4 w-4 mr-2 text-green-500 font-bold">W</span>
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  try {
                    await shareActionLogAsPdf(log, 'email');
                    toast({
                      title: "Email Share",
                      description: "PDF has been downloaded and email client opened",
                      duration: 3000,
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to share via Email",
                      variant: "destructive",
                      duration: 3000,
                    });
                  }
                }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  try {
                    await shareActionLogAsPdf(log, 'twitter');
                    toast({
                      title: "Twitter Share",
                      description: "PDF has been downloaded and Twitter opened",
                      duration: 3000,
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to share via Twitter",
                      variant: "destructive",
                      duration: 3000,
                    });
                  }
                }}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  try {
                    await shareActionLogAsPdf(log, 'copy');
                    toast({
                      title: "PDF Downloaded",
                      description: "Action item PDF has been downloaded",
                      duration: 3000,
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to download PDF",
                      variant: "destructive",
                      duration: 3000,
                    });
                  }
                }}>
                  <ClipboardCopy className="h-4 w-4 mr-2" />
                  Download & Copy Link
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={onDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="mb-3">
        <Badge className={getStatusColor(log.status)} variant="secondary">
          <div className="flex items-center">
            {getStatusIcon(log.status)}
            {getStatusText(log.status)}
          </div>
        </Badge>
        {log.category && (
          <Badge variant="outline" className="ml-2">{log.category}</Badge>
        )}
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{log.description}</p>
      
      <div className="grid grid-cols-1 gap-1 mb-4">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Clock className="mr-1 h-3.5 w-3.5" />
          <span>Created {format(new Date(log.createdDate), 'MMM d, yyyy')}</span>
        </div>
        
        {log.status === 'completed' && log.completedDate && (
          <div className="flex items-center text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            <span>Completed {format(new Date(log.completedDate), 'MMM d, yyyy')}</span>
          </div>
        )}
        
        {log.dueDate && log.status !== 'completed' && (
          <div className="flex items-center text-xs">
            <Calendar className="mr-1 h-3.5 w-3.5 text-gray-400" />
            <span className={`${dueSoon ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
              Due {format(new Date(log.dueDate), 'MMM d, yyyy')}
              {dueSoon && " (Soon)"}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between border-t pt-3">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        {log.status === 'pending' && (
          <Button 
            variant="default" 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onStatusChange(log.id, 'completed')}
          >
            <Check className="mr-1 h-4 w-4" />
            Complete
          </Button>
        )}
        {log.status === 'under_review' && (
          <Button 
            variant="default" 
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => onStatusChange(log.id, 'completed')}
          >
            <Check className="mr-1 h-4 w-4" />
            Complete
          </Button>
        )}
        {log.status === 'completed' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onStatusChange(log.id, 'pending')}
          >
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}