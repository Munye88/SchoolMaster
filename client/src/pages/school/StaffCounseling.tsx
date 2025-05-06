import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useSchoolParam } from '@/hooks/use-school-param';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

// Type definitions
interface StaffCounseling {
  id: number;
  schoolId: number;
  instructorId: number;
  counselingType: 'Verbal Warning' | 'Written Warning' | 'Final Warning';
  counselingDate: string;
  comments: string | null;
  attachmentUrl: string | null;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date | null;
}

interface Instructor {
  id: number;
  name: string;
  imageUrl: string | null;
  role: string | null;
  nationality: string;
  schoolId: number;
}

const StaffCounseling = () => {
  const schoolInfo = useSchoolParam();
  const schoolId = schoolInfo?.id;
  const schoolName = schoolInfo?.name;
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCounseling, setCurrentCounseling] = useState<StaffCounseling | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    instructorId: '',
    counselingType: 'Verbal Warning' as 'Verbal Warning' | 'Written Warning' | 'Final Warning',
    counselingDate: format(new Date(), 'yyyy-MM-dd'),
    comments: '',
    attachment: null as File | null
  });

  // Fetch counseling records for this school
  const { data: counselingRecords, isLoading } = useQuery({
    queryKey: ['/api/schools', schoolId, 'staff-counseling'],
    queryFn: async () => {
      if (!schoolId) return [];
      const response = await fetch(`/api/schools/${schoolId}/staff-counseling`);
      if (!response.ok) throw new Error('Failed to fetch counseling records');
      return response.json();
    },
    enabled: !!schoolId
  });

  // Fetch instructors for this school
  const { data: instructors } = useQuery({
    queryKey: ['/api/schools', schoolId, 'instructors'],
    queryFn: async () => {
      if (!schoolId) return [];
      const response = await fetch(`/api/schools/${schoolId}/instructors`);
      if (!response.ok) throw new Error('Failed to fetch instructors');
      return response.json();
    },
    enabled: !!schoolId
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/staff-counseling', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create counseling record');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools', schoolId, 'staff-counseling'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Counseling record created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number, formData: FormData }) => {
      const response = await fetch(`/api/staff-counseling/${id}`, {
        method: 'PATCH',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update counseling record');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools', schoolId, 'staff-counseling'] });
      setIsEditDialogOpen(false);
      setCurrentCounseling(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Counseling record updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/staff-counseling/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete counseling record');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools', schoolId, 'staff-counseling'] });
      toast({
        title: 'Success',
        description: 'Counseling record deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      instructorId: '',
      counselingType: 'Verbal Warning',
      counselingDate: format(new Date(), 'yyyy-MM-dd'),
      comments: '',
      attachment: null
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, attachment: e.target.files![0] }));
    }
  };

  // Handle form submission for creating
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create form data
    const submitFormData = new FormData();
    // Add JSON data
    submitFormData.append('data', JSON.stringify({
      schoolId,
      instructorId: parseInt(formData.instructorId),
      counselingType: formData.counselingType,
      counselingDate: formData.counselingDate,
      comments: formData.comments || null
    }));
    
    // Add file if present
    if (formData.attachment) {
      submitFormData.append('attachment', formData.attachment);
    }
    
    createMutation.mutate(submitFormData);
  };

  // Handle edit form submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCounseling) return;
    
    // Create form data
    const submitFormData = new FormData();
    // Add JSON data
    submitFormData.append('data', JSON.stringify({
      instructorId: parseInt(formData.instructorId),
      counselingType: formData.counselingType,
      counselingDate: formData.counselingDate,
      comments: formData.comments || null
    }));
    
    // Add file if present
    if (formData.attachment) {
      submitFormData.append('attachment', formData.attachment);
    }
    
    updateMutation.mutate({ id: currentCounseling.id, formData: submitFormData });
  };

  // Open edit dialog
  const openEditDialog = (counseling: StaffCounseling) => {
    setCurrentCounseling(counseling);
    setFormData({
      instructorId: counseling.instructorId.toString(),
      counselingType: counseling.counselingType,
      counselingDate: counseling.counselingDate,
      comments: counseling.comments || '',
      attachment: null
    });
    setIsEditDialogOpen(true);
  };

  // Get instructor name by ID
  const getInstructorName = (id: number) => {
    const instructor = instructors?.find(i => i.id === id);
    return instructor?.name || 'Unknown';
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  // Get counseling type color
  const getCounselingTypeColor = (type: string) => {
    switch (type) {
      case 'Verbal Warning':
        return 'text-yellow-600';
      case 'Written Warning':
        return 'text-orange-600';
      case 'Final Warning':
        return 'text-red-600';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {schoolName} - Staff Counseling Records
        </h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add New Counseling Record
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Counseling Records</CardTitle>
          </CardHeader>
          <CardContent>
            {counselingRecords && counselingRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Attachment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {counselingRecords.map((counseling: StaffCounseling) => (
                    <TableRow key={counseling.id}>
                      <TableCell>{formatDate(counseling.counselingDate)}</TableCell>
                      <TableCell>{getInstructorName(counseling.instructorId)}</TableCell>
                      <TableCell className={getCounselingTypeColor(counseling.counselingType)}>
                        {counseling.counselingType}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{counseling.comments}</TableCell>
                      <TableCell>
                        {counseling.attachmentUrl ? (
                          <a 
                            href={counseling.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Document
                          </a>
                        ) : (
                          'None'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(counseling)}
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the counseling record.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(counseling.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No counseling records found. Click "Add New Counseling Record" to create one.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Counseling Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Counseling Record</DialogTitle>
            <DialogDescription>
              Enter the details for the new staff counseling record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructorId" className="text-right">
                  Instructor
                </Label>
                <Select
                  name="instructorId"
                  value={formData.instructorId}
                  onValueChange={(value) => handleSelectChange('instructorId', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors?.map((instructor: Instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id.toString()}>
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="counselingType" className="text-right">
                  Type
                </Label>
                <Select
                  name="counselingType"
                  value={formData.counselingType}
                  onValueChange={(value: 'Verbal Warning' | 'Written Warning' | 'Final Warning') => 
                    handleSelectChange('counselingType', value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verbal Warning">Verbal Warning</SelectItem>
                    <SelectItem value="Written Warning">Written Warning</SelectItem>
                    <SelectItem value="Final Warning">Final Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="counselingDate" className="text-right">
                  Date
                </Label>
                <Input
                  id="counselingDate"
                  name="counselingDate"
                  type="date"
                  value={formData.counselingDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comments" className="text-right">
                  Comments
                </Label>
                <Textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attachment" className="text-right">
                  Attachment
                </Label>
                <Input
                  id="attachment"
                  type="file"
                  onChange={handleFileChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Counseling Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Counseling Record</DialogTitle>
            <DialogDescription>
              Update the details for the staff counseling record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructorId" className="text-right">
                  Instructor
                </Label>
                <Select
                  name="instructorId"
                  value={formData.instructorId}
                  onValueChange={(value) => handleSelectChange('instructorId', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors?.map((instructor: Instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id.toString()}>
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="counselingType" className="text-right">
                  Type
                </Label>
                <Select
                  name="counselingType"
                  value={formData.counselingType}
                  onValueChange={(value: 'Verbal Warning' | 'Written Warning' | 'Final Warning') => 
                    handleSelectChange('counselingType', value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verbal Warning">Verbal Warning</SelectItem>
                    <SelectItem value="Written Warning">Written Warning</SelectItem>
                    <SelectItem value="Final Warning">Final Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="counselingDate" className="text-right">
                  Date
                </Label>
                <Input
                  id="counselingDate"
                  name="counselingDate"
                  type="date"
                  value={formData.counselingDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comments" className="text-right">
                  Comments
                </Label>
                <Textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attachment" className="text-right">
                  Attachment
                </Label>
                <div className="col-span-3">
                  <Input
                    id="attachment"
                    type="file"
                    onChange={handleFileChange}
                  />
                  {currentCounseling?.attachmentUrl && (
                    <div className="mt-2 text-sm">
                      <a 
                        href={currentCounseling.attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Current attachment
                      </a>
                      <p className="text-gray-500 text-xs mt-1">
                        Uploading a new file will replace the current one
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffCounseling;