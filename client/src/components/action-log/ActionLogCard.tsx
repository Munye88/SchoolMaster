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
    <Card className={`overflow-hidden transition-all hover:shadow-md ${log.status === 'completed' ? 'opacity-80' : ''}`}>
      <CardHeader className={`pb-2 ${
        log.status === 'completed' 
          ? 'bg-green-50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-800' 
          : log.status === 'under_review'
          ? 'bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-800'
          : 'bg-blue-50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-800'
      }`}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold line-clamp-1">{log.title}</CardTitle>
            <CardDescription>
              Requested by {log.requesterName}
            </CardDescription>
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
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-2">
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
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{log.description}</p>
        <div className="grid grid-cols-1 gap-1">
          <div className="flex items-center text-xs text-muted-foreground">
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
              <Calendar className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              <span className={`${dueSoon ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-muted-foreground'}`}>
                Due {format(new Date(log.dueDate), 'MMM d, yyyy')}
                {dueSoon && " (Soon)"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-3 pb-3">
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
      </CardFooter>
    </Card>
  );
}