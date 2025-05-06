import { useState, useEffect, useMemo } from 'react';
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
import { Loader2, Pencil, Trash2, Filter, UserPlus, FileWarning } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
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
  instructorName?: string; // For joining with instructor data
}

interface Instructor {
  id: number;
  name: string;
  imageUrl: string | null;
  role: string | null;
  nationality: string;
  schoolId: number;
}

interface CounselingStats {
  totalCounselings: number;
  byType: Record<string, number>;
  byInstructor: Record<number, { name: string, count: number }>;
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
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('all');
  
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
    queryKey: ['/api/instructors'],
    queryFn: async () => {
      const response = await fetch('/api/instructors');
      if (!response.ok) throw new Error('Failed to fetch instructors');
      return response.json();
    }
  });
  
  // Filter instructors for the current school
  const schoolInstructors = useMemo(() => {
    if (!instructors || !schoolId) return [];
    return instructors.filter((instructor: Instructor) => instructor.schoolId === (typeof schoolId === 'string' ? parseInt(schoolId) : schoolId));
  }, [instructors, schoolId]);

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
    const instructor = schoolInstructors?.find((i: Instructor) => i.id === id) || 
                     instructors?.find((i: Instructor) => i.id === id);
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
  
  // Get background color for charts
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Verbal Warning':
        return '#EAB308';
      case 'Written Warning':
        return '#EA580C';
      case 'Final Warning':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };
  
  // Calculate statistics from counseling records
  const counselingStats = useMemo(() => {
    if (!counselingRecords || counselingRecords.length === 0) {
      return {
        totalCounselings: 0,
        byType: {},
        byInstructor: {}
      } as CounselingStats;
    }
    
    const stats: CounselingStats = {
      totalCounselings: counselingRecords.length,
      byType: {},
      byInstructor: {}
    };
    
    counselingRecords.forEach((record: StaffCounseling) => {
      // Count by type
      if (!stats.byType[record.counselingType]) {
        stats.byType[record.counselingType] = 0;
      }
      stats.byType[record.counselingType]++;
      
      // Count by instructor
      if (!stats.byInstructor[record.instructorId]) {
        stats.byInstructor[record.instructorId] = {
          name: getInstructorName(record.instructorId),
          count: 0
        };
      }
      stats.byInstructor[record.instructorId].count++;
    });
    
    return stats;
  }, [counselingRecords, schoolInstructors]);
  
  // Prepare chart data
  const typeChartData = useMemo(() => {
    return Object.entries(counselingStats.byType).map(([type, count]) => ({
      name: type,
      value: count
    }));
  }, [counselingStats.byType]);
  
  const instructorChartData = useMemo(() => {
    return Object.entries(counselingStats.byInstructor)
      .map(([id, { name, count }]) => ({
        name,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 instructors
  }, [counselingStats.byInstructor]);
  
  // Filter counseling records based on selected instructor
  const filteredCounselingRecords = useMemo(() => {
    if (!counselingRecords) return [];
    if (selectedInstructorId === 'all') return counselingRecords;
    return counselingRecords.filter(
      (record: StaffCounseling) => record.instructorId.toString() === selectedInstructorId
    );
  }, [counselingRecords, selectedInstructorId]);

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
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Statistics Cards */}
          {counselingRecords && counselingRecords.length > 0 && (
            <>
              {/* Counseling Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Counseling by Type</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {typeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getTypeColor(entry.name)} />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip formatter={(value) => [`${value} records`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Instructors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Top Instructors with Counseling Records</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={instructorChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={100}
                          tickFormatter={(value) =>
                            value.length > 15 ? `${value.substring(0, 15)}...` : value
                          }
                        />
                        <RechartsTooltip formatter={(value) => [`${value} records`, 'Count']} />
                        <Bar dataKey="count" fill="#0ea5e9">
                          {instructorChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {!isLoading && (
        <div className="mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Counseling Records</CardTitle>
              <div className="flex items-center space-x-2">
                <Label htmlFor="filter-instructor" className="mr-2">Filter by Instructor:</Label>
                <Select
                  value={selectedInstructorId}
                  onValueChange={(value) => setSelectedInstructorId(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Instructors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Instructors</SelectItem>
                    {schoolInstructors?.map((instructor: Instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id.toString()}>
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCounselingRecords && filteredCounselingRecords.length > 0 ? (
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
                    {filteredCounselingRecords.map((counseling: StaffCounseling) => (
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
                  {counselingRecords && counselingRecords.length > 0 
                    ? 'No counseling records found for the selected instructor.'
                    : 'No counseling records found. Click "Add New Counseling Record" to create one.'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
                    {schoolInstructors?.map((instructor: Instructor) => (
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
                    {schoolInstructors?.map((instructor: Instructor) => (
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