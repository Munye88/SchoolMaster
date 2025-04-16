import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { Check, X, AlertCircle, FileCheck, Loader2, Filter, Download } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchool } from '@/hooks/useSchool';

interface StaffLeave {
  id: number;
  instructorId: number;
  instructorName: string;
  employeeId?: string;
  startDate: string;
  endDate: string;
  returnDate: string;
  ptodays: number;
  rrdays: number;
  leaveType: string;
  destination: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  comments?: string;
  approvedBy?: number;
  attachmentUrl?: string;
  schoolId: number;
}

export default function StaffLeaveApproval() {
  const { toast } = useToast();
  const { schools } = useSchool();
  
  // State for filtering and viewing
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewingLeave, setViewingLeave] = useState<StaffLeave | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Fetch all staff leave records
  const { data: leaveRecords = [], isLoading } = useQuery<StaffLeave[]>({
    queryKey: ['/api/staff-leave'],
  });
  
  // Approve leave mutation
  const approveLeave = useMutation({
    mutationFn: async (leaveId: number) => {
      const response = await fetch(`/api/staff-leave/${leaveId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Approved' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve leave');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-leave'] });
      toast({
        title: 'Leave request approved',
        description: 'The leave request has been approved successfully.',
      });
      setIsViewDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Reject leave mutation
  const rejectLeave = useMutation({
    mutationFn: async (leaveId: number) => {
      const response = await fetch(`/api/staff-leave/${leaveId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Rejected' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject leave');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-leave'] });
      toast({
        title: 'Leave request rejected',
        description: 'The leave request has been rejected.',
      });
      setIsViewDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Filter leave records by school and status
  const filteredLeaveRecords = leaveRecords.filter(leave => {
    // Filter by school
    const schoolMatch = selectedSchool === 'all' || leave.schoolId.toString() === selectedSchool;
    
    // Filter by status
    const statusMatch = selectedStatus === 'all' || leave.status === selectedStatus;
    
    // Filter by search term (instructor name or employee ID)
    const searchMatch = searchTerm === '' || 
      leave.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (leave.employeeId && leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return schoolMatch && statusMatch && searchMatch;
  });
  
  // Group records by status for tabs
  const pendingRecords = filteredLeaveRecords.filter(leave => leave.status === 'Pending');
  const approvedRecords = filteredLeaveRecords.filter(leave => leave.status === 'Approved');
  const rejectedRecords = filteredLeaveRecords.filter(leave => leave.status === 'Rejected');
  const completedRecords = filteredLeaveRecords.filter(leave => leave.status === 'Completed');
  
  // Get school name by ID
  const getSchoolName = (schoolId: number) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };
  
  // Export to CSV
  const exportToCSV = () => {
    // Column headers
    const headers = [
      'Employee ID', 
      'Instructor Name', 
      'School', 
      'Leave Type', 
      'Start Date', 
      'End Date', 
      'Return Date',
      'PTO Days',
      'R&R Days', 
      'Destination', 
      'Status'
    ];
    
    // Convert records to CSV format
    const csvData = filteredLeaveRecords.map(leave => [
      leave.employeeId || '',
      leave.instructorName,
      getSchoolName(leave.schoolId),
      leave.leaveType,
      format(new Date(leave.startDate), 'yyyy-MM-dd'),
      format(new Date(leave.endDate), 'yyyy-MM-dd'),
      format(new Date(leave.returnDate), 'yyyy-MM-dd'),
      leave.ptodays,
      leave.rrdays,
      leave.destination,
      leave.status
    ]);
    
    // Join headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `staff-leave-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">Staff Leave Approval</h1>
          <p className="text-gray-500">Review and approve leave requests from staff members</p>
        </div>
        <Button variant="outline" onClick={exportToCSV} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by instructor name or employee ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Leave records tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingRecords.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                {pendingRecords.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            {approvedRecords.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                {approvedRecords.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {rejectedRecords.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                {rejectedRecords.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completedRecords.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                {completedRecords.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Records</TabsTrigger>
        </TabsList>
        
        {/* Pending tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Requests</CardTitle>
              <CardDescription>
                Requests waiting for your approval or rejection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveTable
                records={pendingRecords}
                isLoading={isLoading}
                onView={(leave) => {
                  setViewingLeave(leave);
                  setIsViewDialogOpen(true);
                }}
                getSchoolName={getSchoolName}
                renderStatusBadge={renderStatusBadge}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Approved tab */}
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Leave Requests</CardTitle>
              <CardDescription>
                Requests you have approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveTable
                records={approvedRecords}
                isLoading={isLoading}
                onView={(leave) => {
                  setViewingLeave(leave);
                  setIsViewDialogOpen(true);
                }}
                getSchoolName={getSchoolName}
                renderStatusBadge={renderStatusBadge}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Rejected tab */}
        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Leave Requests</CardTitle>
              <CardDescription>
                Requests you have rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveTable
                records={rejectedRecords}
                isLoading={isLoading}
                onView={(leave) => {
                  setViewingLeave(leave);
                  setIsViewDialogOpen(true);
                }}
                getSchoolName={getSchoolName}
                renderStatusBadge={renderStatusBadge}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Completed tab */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Leave Requests</CardTitle>
              <CardDescription>
                Requests for leaves that have been completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveTable
                records={completedRecords}
                isLoading={isLoading}
                onView={(leave) => {
                  setViewingLeave(leave);
                  setIsViewDialogOpen(true);
                }}
                getSchoolName={getSchoolName}
                renderStatusBadge={renderStatusBadge}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* All records tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Leave Records</CardTitle>
              <CardDescription>
                Complete history of leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveTable
                records={filteredLeaveRecords}
                isLoading={isLoading}
                onView={(leave) => {
                  setViewingLeave(leave);
                  setIsViewDialogOpen(true);
                }}
                getSchoolName={getSchoolName}
                renderStatusBadge={renderStatusBadge}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* View leave dialog */}
      {viewingLeave && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
              <DialogDescription>
                Review the details of this leave request
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{viewingLeave.instructorName}</h3>
                  {viewingLeave.employeeId && (
                    <p className="text-sm text-gray-500">Employee ID: {viewingLeave.employeeId}</p>
                  )}
                  <p className="text-sm text-gray-500">{getSchoolName(viewingLeave.schoolId)}</p>
                </div>
                {renderStatusBadge(viewingLeave.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-gray-50">
                <div>
                  <p className="text-xs text-gray-500">Leave Type</p>
                  <p className="font-medium">{viewingLeave.leaveType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Destination</p>
                  <p className="font-medium">{viewingLeave.destination}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="font-medium">{format(new Date(viewingLeave.startDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="font-medium">{format(new Date(viewingLeave.endDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Return Date</p>
                  <p className="font-medium">{format(new Date(viewingLeave.returnDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Days</p>
                  <p className="font-medium">{viewingLeave.ptodays + viewingLeave.rrdays} days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">PTO Days</p>
                  <p className="font-medium">{viewingLeave.ptodays} days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">R&R Days</p>
                  <p className="font-medium">{viewingLeave.rrdays} days</p>
                </div>
              </div>
              
              {viewingLeave.comments && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Comments</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{viewingLeave.comments}</p>
                </div>
              )}
              
              {viewingLeave.attachmentUrl && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Attachment</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => window.open(viewingLeave.attachmentUrl, '_blank')}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    View Attachment
                  </Button>
                </div>
              )}
            </div>
            
            <DialogFooter>
              {viewingLeave.status === 'Pending' && (
                <>
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" 
                    onClick={() => rejectLeave.mutate(viewingLeave.id)}
                    disabled={rejectLeave.isPending}
                  >
                    {rejectLeave.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => approveLeave.mutate(viewingLeave.id)}
                    disabled={approveLeave.isPending}
                  >
                    {approveLeave.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </>
              )}
              {viewingLeave.status !== 'Pending' && (
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Reusable Leave Table component
function LeaveTable({ 
  records, 
  isLoading, 
  onView, 
  getSchoolName, 
  renderStatusBadge
}: { 
  records: StaffLeave[]; 
  isLoading: boolean; 
  onView: (leave: StaffLeave) => void;
  getSchoolName: (schoolId: number) => string;
  renderStatusBadge: (status: string) => React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A2463]" />
      </div>
    );
  }
  
  if (records.length === 0) {
    return (
      <div className="bg-gray-50 rounded-md p-8 text-center">
        <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">No records found</h3>
        <p className="text-gray-400">There are no leave requests matching your filters.</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>INSTRUCTOR</TableHead>
          <TableHead>SCHOOL</TableHead>
          <TableHead>LEAVE TYPE</TableHead>
          <TableHead>DATES</TableHead>
          <TableHead>DAYS</TableHead>
          <TableHead>STATUS</TableHead>
          <TableHead className="text-right">ACTIONS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((leave) => (
          <TableRow key={leave.id}>
            <TableCell>
              <div>
                <p className="font-medium">{leave.instructorName}</p>
                {leave.employeeId && (
                  <p className="text-xs text-gray-500">ID: {leave.employeeId}</p>
                )}
              </div>
            </TableCell>
            <TableCell>{getSchoolName(leave.schoolId)}</TableCell>
            <TableCell>{leave.leaveType}</TableCell>
            <TableCell>
              <div>
                <p className="text-xs">{format(new Date(leave.startDate), 'MMM d, yyyy')}</p>
                <p className="text-xs text-gray-500">to {format(new Date(leave.endDate), 'MMM d, yyyy')}</p>
                <p className="text-xs text-gray-400">Return: {format(new Date(leave.returnDate), 'MMM d')}</p>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="text-sm">{leave.ptodays + leave.rrdays} total</p>
                {leave.ptodays > 0 && (
                  <p className="text-xs text-gray-500">{leave.ptodays} PTO</p>
                )}
                {leave.rrdays > 0 && (
                  <p className="text-xs text-gray-500">{leave.rrdays} R&R</p>
                )}
              </div>
            </TableCell>
            <TableCell>{renderStatusBadge(leave.status)}</TableCell>
            <TableCell className="text-right">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => onView(leave)}>
                      View Details
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View full details and take action</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}