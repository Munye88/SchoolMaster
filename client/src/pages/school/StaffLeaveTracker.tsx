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
import { useState } from 'react';
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

  const { data: instructors = [] } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });

  const { data: ptoBalances = [] } = useQuery<PtoBalance[]>({
    queryKey: ['/api/pto-balance'],
  });

  // Simple filtering
  const currentSchoolId = parseInt(schoolId || '0');
  const schoolLeaveRecords = leaveRecords.filter(record => record.schoolId === currentSchoolId);
  const schoolInstructors = instructors.filter(instructor => instructor.schoolId === currentSchoolId);

  const addLeaveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/staff-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add leave request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-leave'] });
      setIsAddDialogOpen(false);
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
      toast({ title: "Success", description: "Leave request added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: "Failed to add leave request", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedInstructor = schoolInstructors.find(i => i.id.toString() === formData.instructorId);
    
    const leaveData = {
      instructorId: parseInt(formData.instructorId),
      instructorName: selectedInstructor?.name || '',
      startDate: formData.startDate,
      endDate: formData.endDate,
      returnDate: formData.returnDate,
      leaveBalance: parseInt(formData.leaveBalance) || 0,
      ptodays: parseInt(formData.ptodays) || 0,
      rrdays: parseInt(formData.rrdays) || 0,
      leaveType: formData.leaveType,
      destination: formData.destination,
      status: formData.status,
      comments: formData.comments,
      schoolId: currentSchoolId
    };

    addLeaveMutation.mutate(leaveData);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Staff Leave Tracker</h1>
        <p className="text-gray-600">
          Manage leave requests and PTO balances for {currentSchool?.name}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none">
          <TabsTrigger 
            value="leave-records" 
            className="rounded-none data-[state=active]:bg-[#0A2463] data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Leave Records
          </TabsTrigger>
          <TabsTrigger 
            value="pto-balance" 
            className="rounded-none data-[state=active]:bg-[#0A2463] data-[state=active]:text-white"
          >
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
                        value={formData.instructorId} 
                        onValueChange={(value) => setFormData({...formData, instructorId: value})}
                      >
                        <SelectTrigger className="rounded-none">
                          <SelectValue placeholder="Select instructor" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none max-h-60 overflow-y-auto">
                          {console.log('🎯 DROPDOWN RENDER - School Instructors:', schoolInstructors.length, schoolInstructors)}
                          {schoolInstructors.length > 0 ? (
                            schoolInstructors.map((instructor: Instructor) => (
                              <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                {instructor.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-instructors" disabled>
                              No instructors available ({instructors.length} total instructors)
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
                        placeholder="Enter hours"
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
                      placeholder="Enter destination"
                    />
                  </div>

                  <div>
                    <Label className="text-center block mb-2">Comments</Label>
                    <Textarea
                      value={formData.comments}
                      onChange={(e) => setFormData({...formData, comments: e.target.value})}
                      className="rounded-none text-center"
                      placeholder="Additional comments (optional)"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full rounded-none bg-[#0A2463] hover:bg-[#0A2463]/90"
                    disabled={addLeaveMutation.isPending}
                  >
                    {addLeaveMutation.isPending ? 'Adding...' : 'Add Leave Request'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-none border">
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
                {schoolLeaveRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No leave records found
                    </TableCell>
                  </TableRow>
                ) : (
                  schoolLeaveRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-center">{record.instructorName}</TableCell>
                      <TableCell className="text-center">{record.leaveType}</TableCell>
                      <TableCell className="text-center">
                        {record.startDate} to {record.endDate}
                      </TableCell>
                      <TableCell className="text-center">{record.destination}</TableCell>
                      <TableCell className="text-center">
                        PTO: {record.ptodays}, R&R: {record.rrdays}
                      </TableCell>
                      <TableCell className="text-center">{record.status}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button variant="outline" size="sm" className="rounded-none">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-none">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-none">
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
          <div className="rounded-none border">
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
                {ptoBalances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No PTO balance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  ptoBalances
                    .filter(balance => {
                      const instructor = instructors.find(i => i.id === balance.instructorId);
                      return instructor?.schoolId === currentSchoolId;
                    })
                    .map((balance) => {
                      const instructor = instructors.find(i => i.id === balance.instructorId);
                      return (
                        <TableRow key={balance.id}>
                          <TableCell className="text-center">{instructor?.name}</TableCell>
                          <TableCell className="text-center">{balance.totalDays}</TableCell>
                          <TableCell className="text-center">{balance.usedDays}</TableCell>
                          <TableCell className="text-center">{balance.remainingDays}</TableCell>
                          <TableCell className="text-center">
                            <Button variant="outline" size="sm" className="rounded-none">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}