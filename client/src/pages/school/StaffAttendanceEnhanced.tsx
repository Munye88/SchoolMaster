import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Instructor } from "@shared/schema";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  Search, 
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Users,
  ClipboardList,
  CheckSquare,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface StaffAttendance {
  id: number;
  instructorId: number;
  date: string;
  status: string;
  notes?: string;
  instructor?: {
    name: string;
    schoolId: number;
  };
}

interface BulkAttendanceData {
  instructorId: number;
  date: string;
  status: string;
  notes?: string;
}

export default function StaffAttendanceEnhanced() {
  const { schoolCode } = useParams();
  const { selectedSchool } = useSchool();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isIndividualDialogOpen, setIsIndividualDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<StaffAttendance | null>(null);
  const [bulkSelectedInstructors, setBulkSelectedInstructors] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState("present");
  const [bulkNotes, setBulkNotes] = useState("");
  
  // Individual attendance form state
  const [individualForm, setIndividualForm] = useState({
    instructorId: "",
    status: "present",
    notes: ""
  });
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    status: "",
    notes: ""
  });



  // Get school from URL parameter or context
  const currentSchool = selectedSchool || (schoolCode ? { code: schoolCode } : null);

  // Fetch schools data to get the proper school ID
  const { data: schools = [] } = useQuery({
    queryKey: ['/api/schools'],
    queryFn: async () => {
      const response = await fetch('/api/schools');
      if (!response.ok) throw new Error('Failed to fetch schools');
      return response.json();
    },
  });

  // Get the complete school object with ID
  const completeSchool = schools.find((school: any) => school.code === currentSchool?.code);

  // Fetch instructors for the current school
  const { data: instructors = [] } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors', completeSchool?.id],
    queryFn: async () => {
      const response = await fetch('/api/instructors');
      if (!response.ok) throw new Error('Failed to fetch instructors');
      const allInstructors = await response.json();
      return completeSchool ? allInstructors.filter((instructor: Instructor) => 
        instructor.schoolId === completeSchool.id
      ) : [];
    },
    enabled: !!completeSchool,
  });

  // Fetch attendance records
  const { data: attendanceRecords = [], isLoading } = useQuery<StaffAttendance[]>({
    queryKey: ['/api/staff-attendance', completeSchool?.id, format(selectedDate, 'yyyy-MM')],
    queryFn: async () => {
      if (!completeSchool) return [];
      const dateStr = format(selectedDate, 'yyyy-MM');
      const response = await fetch(`/api/staff-attendance?schoolId=${completeSchool.id}&date=${dateStr}`);
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!completeSchool,
  });

  // Create individual attendance mutation
  const createAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: any) => {
      const response = await fetch('/api/staff-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...attendanceData,
          date: format(selectedDate, 'yyyy-MM-dd'),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create attendance record');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-attendance'] });
      setIsIndividualDialogOpen(false);
      setIndividualForm({ instructorId: "", status: "present", notes: "" });
      toast({
        title: "Success",
        description: "Attendance recorded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create bulk attendance mutation
  const createBulkAttendanceMutation = useMutation({
    mutationFn: async (attendanceRecords: BulkAttendanceData[]) => {
      const response = await fetch('/api/staff-attendance/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceRecords }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create bulk attendance records');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-attendance'] });
      setIsBulkDialogOpen(false);
      setBulkSelectedInstructors([]);
      setBulkStatus("present");
      setBulkNotes("");
      toast({
        title: "Success",
        description: `Bulk attendance recorded for ${data.count} instructors`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update attendance mutation
  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/staff-attendance/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update attendance record');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-attendance'] });
      setIsEditDialogOpen(false);
      setSelectedAttendance(null);
      toast({
        title: "Success",
        description: "Attendance updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete attendance mutation
  const deleteAttendanceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/staff-attendance/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete attendance record';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage);
      }
      
      // For DELETE operations, don't try to parse JSON if status is 204 (No Content)
      if (response.status === 204) {
        return null;
      }
      
      // Only parse JSON if there's content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-attendance'] });
      toast({
        title: "Success",
        description: "Attendance record deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter and sort logic
  const filteredRecords = attendanceRecords
    .filter(record => {
      const instructor = instructors.find(i => i.id === record.instructorId);
      const matchesSearch = !searchTerm || (instructor?.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by date in ascending order (oldest first, chronological order)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'late': return 'text-yellow-600 bg-yellow-50';
      case 'absent': return 'text-red-600 bg-red-50';
      case 'sick': return 'text-blue-600 bg-blue-50';
      case 'pto': return 'text-purple-600 bg-purple-50';
      case 'paternity': return 'text-indigo-600 bg-indigo-50';
      case 'bereavement': return 'text-gray-800 bg-gray-100';
      case 'marriage': return 'text-pink-600 bg-pink-50';
      case 'holiday': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleIndividualSubmit = () => {
    if (!individualForm.instructorId) {
      toast({
        title: "Error",
        description: "Please select an instructor",
        variant: "destructive",
      });
      return;
    }
    
    createAttendanceMutation.mutate({
      instructorId: parseInt(individualForm.instructorId),
      status: individualForm.status,
      notes: individualForm.notes,
    });
  };

  const handleBulkSubmit = () => {
    if (bulkSelectedInstructors.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one instructor",
        variant: "destructive",
      });
      return;
    }

    const attendanceRecords = bulkSelectedInstructors.map(instructorId => ({
      instructorId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status: bulkStatus,
      notes: bulkNotes,
    }));

    createBulkAttendanceMutation.mutate(attendanceRecords);
  };

  const handleEdit = (attendance: StaffAttendance) => {
    setSelectedAttendance(attendance);
    setEditForm({
      status: attendance.status,
      notes: attendance.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!selectedAttendance) return;
    
    updateAttendanceMutation.mutate({
      id: selectedAttendance.id,
      data: editForm,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      deleteAttendanceMutation.mutate(id);
    }
  };

  const toggleInstructorSelection = (instructorId: number) => {
    setBulkSelectedInstructors(prev => 
      prev.includes(instructorId)
        ? prev.filter(id => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const selectAllInstructors = () => {
    setBulkSelectedInstructors(instructors.map(i => i.id));
  };

  const deselectAllInstructors = () => {
    setBulkSelectedInstructors([]);
  };

  if (!completeSchool) {
    return (
      <div className="p-6">
        <Card className="rounded-none">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please select a school to view attendance records.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-center">Staff Attendance - {completeSchool.code}</h1>
            <p className="text-muted-foreground text-center">Track and manage staff attendance records</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isIndividualDialogOpen} onOpenChange={setIsIndividualDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Individual Record
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-none max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg text-center">Record Individual Attendance</DialogTitle>
                  <DialogDescription className="text-sm text-center">
                    Record attendance for a single instructor for {format(selectedDate, 'MMM dd, yyyy')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Instructor</label>
                    <Select 
                      value={individualForm.instructorId} 
                      onValueChange={(value) => setIndividualForm(prev => ({ ...prev, instructorId: value }))}
                    >
                      <SelectTrigger className="rounded-none h-9">
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        {instructors.map(instructor => (
                          <SelectItem key={instructor.id} value={instructor.id.toString()}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select 
                      value={individualForm.status} 
                      onValueChange={(value) => setIndividualForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="rounded-none h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="sick">Sick</SelectItem>
                        <SelectItem value="pto">PTO</SelectItem>
                        <SelectItem value="paternity">Paternity Leave</SelectItem>
                        <SelectItem value="bereavement">Bereavement</SelectItem>
                        <SelectItem value="marriage">Marriage</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                    <Input
                      className="rounded-none h-9"
                      value={individualForm.notes}
                      onChange={(e) => setIndividualForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button 
                    onClick={handleIndividualSubmit} 
                    disabled={createAttendanceMutation.isPending}
                    className="rounded-none"
                  >
                    {createAttendanceMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Record Attendance
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-none">
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Record
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-none max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg text-center">Bulk Attendance Recording</DialogTitle>
                  <DialogDescription className="text-sm text-center">
                    Record attendance for multiple instructors for {format(selectedDate, 'MMM dd, yyyy')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={selectAllInstructors}
                      className="rounded-none text-xs px-3 py-1"
                    >
                      Select All
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={deselectAllInstructors}
                      className="rounded-none text-xs px-3 py-1"
                    >
                      Deselect All
                    </Button>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-none p-3">
                    {instructors.map(instructor => (
                      <div key={instructor.id} className="flex items-center space-x-3 py-1.5">
                        <Checkbox
                          checked={bulkSelectedInstructors.includes(instructor.id)}
                          onCheckedChange={() => toggleInstructorSelection(instructor.id)}
                        />
                        <span className="text-sm text-gray-700">{instructor.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status for All Selected</label>
                    <Select value={bulkStatus} onValueChange={setBulkStatus}>
                      <SelectTrigger className="rounded-none h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="sick">Sick</SelectItem>
                        <SelectItem value="pto">PTO</SelectItem>
                        <SelectItem value="paternity">Paternity Leave</SelectItem>
                        <SelectItem value="bereavement">Bereavement</SelectItem>
                        <SelectItem value="marriage">Marriage</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                    <Input
                      className="rounded-none h-9"
                      value={bulkNotes}
                      onChange={(e) => setBulkNotes(e.target.value)}
                      placeholder="Notes for all selected instructors..."
                    />
                  </div>

                  <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded-none">
                    {bulkSelectedInstructors.length} instructor(s) selected
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button 
                    onClick={handleBulkSubmit} 
                    disabled={createBulkAttendanceMutation.isPending}
                    className="rounded-none"
                  >
                    {createBulkAttendanceMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Record Bulk Attendance
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Date Selection and Filters */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="rounded-none w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "MMMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-none">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-none pl-10 w-64"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-none w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="pto">PTO</SelectItem>
                <SelectItem value="paternity">Paternity Leave</SelectItem>
                <SelectItem value="bereavement">Bereavement</SelectItem>
                <SelectItem value="marriage">Marriage</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-center">Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
              <p className="text-gray-500">Start by recording attendance for your instructors.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Instructor</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Notes</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const instructor = instructors.find(i => i.id === record.instructorId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="text-center font-medium">
                          {instructor?.name || 'Unknown Instructor'}
                        </TableCell>
                        <TableCell className="text-center">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            getStatusColor(record.status)
                          )}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {record.notes || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(record)}
                              className="rounded-none h-8 w-8 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(record.id)}
                              className="rounded-none h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Summary */}
              <div className="mt-4 text-sm text-gray-500 text-center">
                Showing {filteredRecords.length} attendance records
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-center">Edit Attendance Record</DialogTitle>
            <DialogDescription className="text-sm text-center">
              Update the attendance record for {selectedAttendance && instructors.find(i => i.id === selectedAttendance.instructorId)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select 
                value={editForm.status} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="rounded-none h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="pto">PTO</SelectItem>
                  <SelectItem value="paternity">Paternity Leave</SelectItem>
                  <SelectItem value="bereavement">Bereavement</SelectItem>
                  <SelectItem value="marriage">Marriage</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Input
                className="rounded-none h-9"
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button 
              onClick={handleEditSubmit} 
              disabled={updateAttendanceMutation.isPending}
              className="rounded-none"
            >
              {updateAttendanceMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}