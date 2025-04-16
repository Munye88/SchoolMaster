import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { format, parseISO, isValid, addMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { CalendarIcon, Check, X, Filter, Loader2, FileText, Download, Clock, Search, AlertTriangle, User, ChevronDown, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StaffLeave {
  id: number;
  instructorId: number;
  instructorName: string;
  empId: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  reason: string;
  approvedBy: string | null;
  attachmentUrl: string | null;
  comments: string | null;
  schoolId: number;
  schoolName: string;
}

interface School {
  id: number;
  name: string;
  code: string;
  location: string | null;
}

export default function StaffLeaveApproval() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterSchool, setFilterSchool] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedLeave, setSelectedLeave] = useState<StaffLeave | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');
  
  // Fetch leave requests
  const { data: leaveRequests = [], isLoading: isLoadingLeaves } = useQuery<StaffLeave[]>({
    queryKey: ['/api/staff-leave'],
  });
  
  // Fetch schools
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery<School[]>({
    queryKey: ['/api/schools'],
  });
  
  // Filter leave requests
  const filteredLeaves = leaveRequests.filter(leave => {
    const matchesSearch = !searchTerm || 
      (leave.instructorName && leave.instructorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leave.empId && leave.empId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || (leave.type && leave.type === filterType);
    const matchesStatus = filterStatus === 'all' || (leave.status && leave.status === filterStatus);
    const matchesSchool = filterSchool === 'all' || leave.schoolId === filterSchool;
    
    // Filter by selected month
    const startDate = leave.startDate ? parseISO(leave.startDate) : null;
    const endDate = leave.endDate ? parseISO(leave.endDate) : null;
    const isInSelectedMonth = 
      (startDate && isValid(startDate) && isSameMonth(startDate, selectedMonth)) || 
      (endDate && isValid(endDate) && isSameMonth(endDate, selectedMonth));
    
    return matchesSearch && matchesType && matchesStatus && matchesSchool && isInSelectedMonth;
  });
  
  // Mutation for approving leave
  const approveLeaveRequest = useMutation({
    mutationFn: async ({ id, comment }: { id: number, comment: string }) => {
      const response = await fetch(`/api/staff-leave/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments: comment }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve leave request');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-leave'] });
      setIsDetailsOpen(false);
      setApprovalComment('');
      setRejectionComment('');
      toast({
        title: 'Leave request approved',
        description: 'The leave request has been approved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for rejecting leave
  const rejectLeaveRequest = useMutation({
    mutationFn: async ({ id, comment }: { id: number, comment: string }) => {
      const response = await fetch(`/api/staff-leave/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments: comment }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject leave request');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-leave'] });
      setIsDetailsOpen(false);
      setApprovalComment('');
      setRejectionComment('');
      toast({
        title: 'Leave request rejected',
        description: 'The leave request has been rejected successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle leave details view
  const handleViewLeaveDetails = (leave: StaffLeave) => {
    setSelectedLeave(leave);
    setIsDetailsOpen(true);
  };
  
  // Handle approve leave
  const handleApproveLeave = () => {
    if (!selectedLeave) return;
    approveLeaveRequest.mutate({ id: selectedLeave.id, comment: approvalComment });
  };
  
  // Handle reject leave
  const handleRejectLeave = () => {
    if (!selectedLeave) return;
    rejectLeaveRequest.mutate({ id: selectedLeave.id, comment: rejectionComment });
  };
  
  // Handle download attachment
  const handleDownloadAttachment = async () => {
    if (!selectedLeave?.attachmentUrl) return;
    
    try {
      const response = await fetch(selectedLeave.attachmentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Extract filename from URL
      const filename = selectedLeave.attachmentUrl.split('/').pop() || 'attachment';
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download attachment',
        variant: 'destructive',
      });
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('pending');
    setFilterSchool('all');
    setSelectedMonth(new Date());
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setSelectedMonth(prev => addMonths(prev, -1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get leave type badge
  const getTypeBadge = (type: string) => {
    if (!type) return <Badge variant="outline">Unknown</Badge>;
    
    switch (type.toLowerCase()) {
      case 'annual leave':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Annual Leave</Badge>;
      case 'sick leave':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Sick Leave</Badge>;
      case 'emergency leave':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Emergency</Badge>;
      case 'pto':
        return <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">PTO</Badge>;
      case 'r&r':
        return <Badge className="bg-green-100 text-green-800 border-green-200">R&R</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  // Get school badge
  const getSchoolBadge = (schoolId: number) => {
    const school = schools.find(s => s.id === schoolId);
    
    if (!school) return null;
    
    const schoolColors: Record<string, string> = {
      'NFS_EAST': 'bg-blue-50 text-blue-700 border-blue-200',
      'NFS_WEST': 'bg-green-50 text-green-700 border-green-200',
      'KFNA': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    
    const colorClass = schoolColors[school.code] || 'bg-gray-50 text-gray-700 border-gray-200';
    
    return <Badge variant="outline" className={colorClass}>{school.name}</Badge>;
  };
  
  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">Staff Leave Approval</h1>
          <p className="text-gray-500">Review and approve staff leave requests</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Button variant="outline" onClick={goToPreviousMonth} size="sm">
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[180px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedMonth, 'MMMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => date && setSelectedMonth(date)}
                initialFocus
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={goToNextMonth} size="sm">
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or ID"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Leave Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                  <SelectItem value="PTO">PTO</SelectItem>
                  <SelectItem value="R&R">R&R</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">School</label>
              <Select
                value={filterSchool.toString()}
                onValueChange={(value) => setFilterSchool(value === 'all' ? 'all' : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map(school => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              {(searchTerm || filterType !== 'all' || filterStatus !== 'pending' || filterSchool !== 'all') && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <Filter className="mr-2 h-3 w-3" />
                  Clear Filters
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                {filteredLeaves.length} {filteredLeaves.length === 1 ? 'request' : 'requests'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-0">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3 mb-4">
              <TabsTrigger
                value="pending"
                onClick={() => setFilterStatus('pending')}
                className="text-xs md:text-sm"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                onClick={() => setFilterStatus('approved')}
                className="text-xs md:text-sm"
              >
                Approved
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                onClick={() => setFilterStatus('rejected')}
                className="text-xs md:text-sm"
              >
                Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingLeaves ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#0A2463]" />
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="bg-gray-50 rounded-md p-8 text-center">
              <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No leave requests found</h3>
              <p className="text-gray-400 mb-6">There are no leave requests matching your search criteria.</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>INSTRUCTOR</TableHead>
                  <TableHead>LEAVE TYPE</TableHead>
                  <TableHead>PERIOD</TableHead>
                  <TableHead>SCHOOL</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.map((leave) => {
                  const startDate = leave.startDate ? parseISO(leave.startDate) : null;
                  const endDate = leave.endDate ? parseISO(leave.endDate) : null;
                  const isValidStart = startDate && isValid(startDate);
                  const isValidEnd = endDate && isValid(endDate);
                  const formattedDateRange = isValidStart && isValidEnd
                    ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
                    : 'Invalid date range';
                  
                  return (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{leave.instructorName}</span>
                          <span className="text-xs text-gray-500">ID: {leave.empId}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(leave.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{formattedDateRange}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSchoolBadge(leave.schoolId)}</TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLeaveDetails(leave)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="hidden md:inline">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Leave Details Dialog */}
      {selectedLeave && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
              <DialogDescription>
                Review and take action on this leave request
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Name:</div>
                <div className="col-span-3">{selectedLeave.instructorName}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Employee ID:</div>
                <div className="col-span-3">{selectedLeave.empId}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">School:</div>
                <div className="col-span-3">{selectedLeave.schoolName}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Leave Type:</div>
                <div className="col-span-3">{getTypeBadge(selectedLeave.type)}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Date Range:</div>
                <div className="col-span-3">
                  {selectedLeave.startDate && selectedLeave.endDate ? (
                    <>
                      {format(parseISO(selectedLeave.startDate), 'MMM d, yyyy')} - {format(parseISO(selectedLeave.endDate), 'MMM d, yyyy')}
                    </>
                  ) : (
                    'Invalid date range'
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="font-medium">Reason:</div>
                <div className="col-span-3">
                  {selectedLeave.reason || 'No reason provided'}
                </div>
              </div>
              
              {selectedLeave.attachmentUrl && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Attachment:</div>
                  <div className="col-span-3">
                    <Button variant="outline" size="sm" onClick={handleDownloadAttachment}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Attachment
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Status:</div>
                <div className="col-span-3">{getStatusBadge(selectedLeave.status)}</div>
              </div>
              
              {selectedLeave.approvedBy && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Handled By:</div>
                  <div className="col-span-3">{selectedLeave.approvedBy}</div>
                </div>
              )}
              
              {selectedLeave.comments && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <div className="font-medium">Comments:</div>
                  <div className="col-span-3">
                    {selectedLeave.comments}
                  </div>
                </div>
              )}
              
              {selectedLeave.status === 'pending' && (
                <>
                  <div className="border-t pt-4 mt-2">
                    <Tabs defaultValue="approve" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="approve">Approve</TabsTrigger>
                        <TabsTrigger value="reject">Reject</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="approve" className="mt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Comments (Optional)
                          </label>
                          <Textarea
                            placeholder="Add comments for approval"
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                          />
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700" 
                            onClick={handleApproveLeave}
                            disabled={approveLeaveRequest.isPending}
                          >
                            {approveLeaveRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Approve Leave
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="reject" className="mt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Reason for Rejection*
                          </label>
                          <Textarea
                            placeholder="Provide reason for rejection"
                            value={rejectionComment}
                            onChange={(e) => setRejectionComment(e.target.value)}
                            required
                          />
                          <Button 
                            className="w-full bg-red-600 hover:bg-red-700" 
                            onClick={handleRejectLeave}
                            disabled={rejectLeaveRequest.isPending || !rejectionComment.trim()}
                          >
                            {rejectLeaveRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reject Leave
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}