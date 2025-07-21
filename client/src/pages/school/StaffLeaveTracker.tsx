import { useParams } from 'wouter';
import { Instructor, PtoBalance } from '@shared/schema';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from 'react';
import { Plus, FileText, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { useSchool } from '@/hooks/useSchool';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";

interface StaffLeave {
  id: number;
  instructorId: number;
  instructorName: string;
  startDate: string;
  endDate: string;
  returnDate: string;
  leaveBalance?: number;
  ptodays: number;
  rrdays: number;
  leaveType: "PTO" | "R&R" | "Emergency" | "Paternity" | "Bereavement" | "Other";
  destination: string;
  status: string;
  comments?: string;
  schoolId: number;
}

export default function StaffLeaveTracker() {
  const { schoolId } = useParams();
  const { schools } = useSchool();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("leave-records");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    instructorId: '',
    startDate: '',
    endDate: '',
    returnDate: '',
    leaveBalance: '',
    ptodays: '',
    rrdays: '',
    leaveType: 'PTO',
    destination: '',
    status: 'Pending',
    comments: ''
  });

  // Find current school from schools array
  const currentSchool = schools.find(school => school.id === parseInt(schoolId || '0'));

  const { data: leaveRecords = [], isLoading: isLoadingLeave } = useQuery<StaffLeave[]>({
    queryKey: ['/api/staff-leave', schoolId],
    enabled: !!schoolId,
  });

  const { data: instructors = [], isLoading: isLoadingInstructors } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });

  const { data: ptoBalances = [], isLoading: isLoadingPto } = useQuery<PtoBalance[]>({
    queryKey: ['/api/pto-balance'],
  });

  // Parse school ID once
  const currentSchoolId = parseInt(schoolId || '0');
  
  // Debug logging to see what we have
  console.log('🏫 School ID from params:', schoolId, 'parsed:', currentSchoolId);
  console.log('📚 All instructors loaded:', instructors?.length || 0);
  console.log('🎯 Current school:', currentSchool);

  const schoolLeaveRecords = leaveRecords.filter(
    (record: StaffLeave) => record.schoolId === currentSchoolId
  );

  // Get school instructors - SIMPLIFIED LOGIC
  const schoolInstructors = useMemo(() => {
    console.log('🔄 INSTRUCTOR FILTER - SIMPLIFIED:', {
      instructorsCount: instructors?.length || 0,
      currentSchoolId,
      isLoadingInstructors
    });
    
    // If we have instructors and a school ID, filter them immediately
    if (instructors && instructors.length > 0 && currentSchoolId) {
      const filtered = instructors.filter(instructor => instructor.schoolId === currentSchoolId);
      console.log('✅ FILTERED INSTRUCTORS:', filtered.length, 'for school', currentSchoolId);
      return filtered;
    }
    
    console.log('❌ NO DATA YET - instructors:', instructors?.length, 'schoolId:', currentSchoolId);
    return [];
  }, [instructors, currentSchoolId]);

  console.log('🔍 Filtered school instructors count:', schoolInstructors.length);
  console.log('📋 School instructors:', schoolInstructors.map(i => `${i.name} (ID: ${i.id})`));
  console.log('⏳ Loading states - Instructors:', isLoadingInstructors, 'Leave:', isLoadingLeave);

  const createLeaveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/staff-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          schoolId: parseInt(schoolId || '0'),
          ptodays: parseInt(data.ptodays) || 0,
          rrdays: parseInt(data.rrdays) || 0,
          leaveBalance: parseInt(data.leaveBalance) || 0,
        }),
      });
      if (!response.ok) throw new Error('Failed to create leave request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-leave'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Leave request created successfully" });
    },
  });

  const deleteLeaveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/staff-leave/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete leave request');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-leave'] });
      toast({ title: "Success", description: "Leave request deleted successfully" });
    },
  });

  const deletePtoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/pto-balance/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete PTO balance');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pto-balance'] });
      toast({ title: "Success", description: "PTO balance deleted successfully" });
    },
  });

  const resetForm = () => {
    setFormData({
      instructorId: '',
      startDate: '',
      endDate: '',
      returnDate: '',
      leaveBalance: '',
      ptodays: '',
      rrdays: '',
      leaveType: 'PTO',
      destination: '',
      status: 'Pending',
      comments: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLeaveMutation.mutate({
      ...formData,
      instructorId: parseInt(formData.instructorId),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this leave request?')) {
      deleteLeaveMutation.mutate(id);
    }
  };

  const handleDeletePto = (id: number) => {
    if (confirm('Are you sure you want to delete this PTO balance record?')) {
      deletePtoMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Staff Leave Tracker</h1>
        <p className="text-gray-600 mt-2">Manage leave requests and PTO balances for {currentSchool?.name}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 rounded-none">
          <TabsTrigger value="leave-records" className="rounded-none">
            <FileText className="h-4 w-4 mr-2" />
            Leave Records
          </TabsTrigger>
          <TabsTrigger value="pto-balance" className="rounded-none">
            <Clock className="h-4 w-4 mr-2" />
            PTO Balance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leave-records" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-center flex-1">Leave Requests</h3>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-[#0A2463] hover:bg-[#0A2463]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Leave Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-none">
                <DialogHeader>
                  <DialogTitle className="text-center">Add New Leave Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-center block mb-2">Instructor</Label>
                      <Select 
                        key={`${currentSchoolId}-${schoolInstructors.length}`}
                        value={formData.instructorId} 
                        onValueChange={(value) => setFormData({...formData, instructorId: value})}
                        disabled={schoolInstructors.length === 0}
                      >
                        <SelectTrigger className="rounded-none">
                          <SelectValue 
                            key={`trigger-${currentSchoolId}-${schoolInstructors.length}`}
                            placeholder={schoolInstructors.length === 0 ? "Loading instructors..." : "Select instructor"} 
                          />
                        </SelectTrigger>
                        <SelectContent className="rounded-none max-h-60 overflow-y-auto">
                          {schoolInstructors.length > 0 ? (
                            schoolInstructors.map((instructor: Instructor) => (
                              <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                {instructor.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>
                              Loading instructors...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-center block mb-2">Leave Type</Label>
                      <Select value={formData.leaveType} onValueChange={(value) => setFormData({...formData, leaveType: value})}>
                        <SelectTrigger className="rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          <SelectItem value="PTO">PTO</SelectItem>
                          <SelectItem value="R&R">R&R</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Paternity">Paternity</SelectItem>
                          <SelectItem value="Bereavement">Bereavement</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-center block mb-2">Start Date</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="rounded-none text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-center block mb-2">End Date</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="rounded-none text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-center block mb-2">Return Date</Label>
                      <Input
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                        className="rounded-none text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-center block mb-2">Leave Balance (Hours)</Label>
                      <Input
                        type="number"
                        value={formData.leaveBalance}
                        onChange={(e) => setFormData({...formData, leaveBalance: e.target.value})}
                        className="rounded-none text-center"
                        placeholder="Enter available hours"
                      />
                    </div>
                    <div>
                      <Label className="text-center block mb-2">PTO Days</Label>
                      <Input
                        type="number"
                        value={formData.ptodays}
                        onChange={(e) => setFormData({...formData, ptodays: e.target.value})}
                        className="rounded-none text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-center block mb-2">R&R Days</Label>
                      <Input
                        type="number"
                        value={formData.rrdays}
                        onChange={(e) => setFormData({...formData, rrdays: e.target.value})}
                        className="rounded-none text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-center block mb-2">Destination</Label>
                    <Input
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="rounded-none text-center"
                      placeholder="Travel destination"
                    />
                  </div>

                  <div>
                    <Label className="text-center block mb-2">Comments</Label>
                    <Textarea
                      value={formData.comments}
                      onChange={(e) => setFormData({...formData, comments: e.target.value})}
                      className="rounded-none text-center"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-center space-x-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-none">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLeaveMutation.isPending} className="rounded-none bg-[#0A2463] hover:bg-[#0A2463]/90">
                      {createLeaveMutation.isPending ? 'Saving...' : 'Save Request'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Instructor</TableHead>
                  <TableHead className="text-center">Leave Type</TableHead>
                  <TableHead className="text-center">Period</TableHead>
                  <TableHead className="text-center">Destination</TableHead>
                  <TableHead className="text-center">Duration</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLeave ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : schoolLeaveRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No leave records found
                    </TableCell>
                  </TableRow>
                ) : (
                  schoolLeaveRecords.map((record: StaffLeave) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-center">{record.instructorName}</TableCell>
                      <TableCell className="text-center">{record.leaveType}</TableCell>
                      <TableCell className="text-center">
                        {record.startDate} to {record.endDate}
                      </TableCell>
                      <TableCell className="text-center">{record.destination}</TableCell>
                      <TableCell className="text-center">
                        {record.ptodays + record.rrdays} days
                      </TableCell>
                      <TableCell className="text-center">{record.status}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button size="sm" variant="outline" className="rounded-none">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-none">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(record.id)}
                            className="rounded-none text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="pto-balance" className="space-y-6">
          <h3 className="text-xl font-semibold text-center">PTO Balance Management</h3>

          <div className="bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Instructor</TableHead>
                  <TableHead className="text-center">Total Hours</TableHead>
                  <TableHead className="text-center">Used Hours</TableHead>
                  <TableHead className="text-center">Remaining Hours</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPto ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : ptoBalances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No PTO balance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  ptoBalances.map((balance: any) => (
                    <TableRow key={balance.id}>
                      <TableCell className="text-center">{balance.instructorName || 'Unknown'}</TableCell>
                      <TableCell className="text-center">{balance.totalDays}</TableCell>
                      <TableCell className="text-center">{balance.usedDays}</TableCell>
                      <TableCell className="text-center">{balance.remainingDays}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeletePto(balance.id)}
                          className="rounded-none text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}