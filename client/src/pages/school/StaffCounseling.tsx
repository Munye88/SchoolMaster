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
import { AlertTriangle, Loader2, Pencil, Trash2, Filter, UserPlus, FileWarning, Users } from 'lucide-react';
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
  
  // Get counseling type color for badge
  const getCounselingTypeColorBadge = (type: string) => {
    switch (type) {
      case 'Verbal Warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'Written Warning':
        return 'bg-orange-100 text-orange-800';
      case 'Final Warning':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get background color for charts
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Verbal Warning':
        return '#FFD166'; // Warm yellow
      case 'Written Warning':
        return '#F87171'; // Soft red
      case 'Final Warning':
        return '#DC2626'; // Deep red
      default:
        return '#6B7280';
    }
  };
  
  // Get gradient colors for instructor chart
  const getInstructorBarColor = (index: number) => {
    const colors = [
      '#22C55E', // Green
      '#3B82F6', // Blue
      '#A855F7', // Purple
      '#EC4899', // Pink
      '#F97316', // Orange
    ];
    return colors[index % colors.length];
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileWarning className="h-7 w-7 mr-3 text-indigo-600" />
            Staff Counseling Records
          </h1>
          <p className="mt-1 text-gray-500 font-medium">
            {schoolName} - View and manage counseling records for instructors
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-medium transition-all"
        >
          <UserPlus className="h-4 w-4 mr-2" /> Add New Counseling Record
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
              <Card className="shadow-lg">
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" /> 
                    Counseling by Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pt-4">
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          innerRadius={35}
                          paddingAngle={4}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => (
                            <text 
                              x={name.length > 12 ? -15 : 0} 
                              y={0} 
                              fill="#333" 
                              textAnchor="middle" 
                              dominantBaseline="central"
                              style={{ fontWeight: 'bold', fontSize: '12px', textShadow: '0 0 3px white' }}
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          )}
                        >
                          {typeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getTypeColor(entry.name)} stroke="#fff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center"
                          wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        />
                        <RechartsTooltip 
                          formatter={(value) => [`${value} records`, 'Count']} 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            borderRadius: '6px',
                            border: 'none',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Instructors */}
              <Card className="shadow-lg">
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Top Instructors with Counseling Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pt-4">
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={instructorChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 25, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          type="number" 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#4b5563', fontSize: 12 }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={110}
                          tickFormatter={(value) =>
                            value.length > 14 ? `${value.substring(0, 14)}...` : value
                          }
                          tick={{ fill: '#4b5563', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <RechartsTooltip 
                          formatter={(value) => [`${value} records`, 'Count']} 
                          cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            borderRadius: '6px',
                            border: 'none',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#0ea5e9"
                          radius={[0, 4, 4, 0]}
                          barSize={24}
                          label={(props) => {
                            const { x, y, width, value } = props;
                            return (
                              <text 
                                x={x + width + 5} 
                                y={y + 12} 
                                fill="#6b7280" 
                                fontSize={10}
                                textAnchor="start"
                              >
                                {value}
                              </text>
                            );
                          }}
                        >
                          {instructorChartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getInstructorBarColor(index)}
                              stroke="#fff"
                              strokeWidth={1}
                            />
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
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
              <CardTitle className="flex items-center">
                <FileWarning className="h-5 w-5 mr-2 text-indigo-500" />
                Counseling Records
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Label htmlFor="filter-instructor" className="mr-2 font-medium">Filter by Instructor:</Label>
                <Select
                  value={selectedInstructorId}
                  onValueChange={(value) => setSelectedInstructorId(value)}
                >
                  <SelectTrigger className="w-[220px] bg-white border-gray-300">
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
            <CardContent className="pt-4">
              {filteredCounselingRecords && filteredCounselingRecords.length > 0 ? (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Instructor</TableHead>
                        <TableHead className="font-semibold text-gray-700">Type</TableHead>
                        <TableHead className="font-semibold text-gray-700">Comments</TableHead>
                        <TableHead className="font-semibold text-gray-700">Attachment</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCounselingRecords.map((counseling: StaffCounseling, index: number) => (
                        <TableRow 
                          key={counseling.id}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <TableCell className="font-medium">{formatDate(counseling.counselingDate)}</TableCell>
                          <TableCell>{getInstructorName(counseling.instructorId)}</TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCounselingTypeColorBadge(counseling.counselingType)}`}>
                              {counseling.counselingType}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{counseling.comments}</TableCell>
                          <TableCell>
                            {counseling.attachmentUrl ? (
                              <a 
                                href={counseling.attachmentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                View
                              </a>
                            ) : (
                              <span className="text-gray-500 text-sm">None</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openEditDialog(counseling)}
                                className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
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
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <FileWarning className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    No counseling records found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {counselingRecords && counselingRecords.length > 0 
                      ? 'Try selecting a different instructor or add a new record.'
                      : 'Start by adding a new counseling record.'}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" /> Add New Counseling Record
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Counseling Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="flex items-center text-xl">
              <UserPlus className="h-5 w-5 mr-2 text-indigo-500" />
              Add New Counseling Record
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Enter the details for the new staff counseling record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 py-5">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructorId" className="text-right font-medium text-gray-700">
                  Instructor
                </Label>
                <Select
                  name="instructorId"
                  value={formData.instructorId}
                  onValueChange={(value) => handleSelectChange('instructorId', value)}
                >
                  <SelectTrigger className="col-span-3 bg-white">
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
                <Label htmlFor="counselingType" className="text-right font-medium text-gray-700">
                  Type
                </Label>
                <Select
                  name="counselingType"
                  value={formData.counselingType}
                  onValueChange={(value: 'Verbal Warning' | 'Written Warning' | 'Final Warning') => 
                    handleSelectChange('counselingType', value)
                  }
                >
                  <SelectTrigger className="col-span-3 bg-white">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verbal Warning">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></span>
                        Verbal Warning
                      </div>
                    </SelectItem>
                    <SelectItem value="Written Warning">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-orange-500 mr-2"></span>
                        Written Warning
                      </div>
                    </SelectItem>
                    <SelectItem value="Final Warning">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-red-600 mr-2"></span>
                        Final Warning
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="counselingDate" className="text-right font-medium text-gray-700">
                  Date
                </Label>
                <Input
                  id="counselingDate"
                  name="counselingDate"
                  type="date"
                  value={formData.counselingDate}
                  onChange={handleInputChange}
                  className="col-span-3 bg-white border-gray-300"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4 pt-1">
                <Label htmlFor="comments" className="text-right font-medium text-gray-700 pt-2">
                  Comments
                </Label>
                <Textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  className="col-span-3 bg-white border-gray-300 min-h-[120px]"
                  placeholder="Enter any additional details or notes about this counseling session..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attachment" className="text-right font-medium text-gray-700">
                  Attachment
                </Label>
                <div className="col-span-3">
                  <Input
                    id="attachment"
                    type="file"
                    onChange={handleFileChange}
                    className="bg-white border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can upload documentation related to this counseling record (PDF, DOC, JPG).
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t pt-4 mt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                className="border-gray-300 bg-white text-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Record'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Counseling Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="flex items-center text-xl">
              <Pencil className="h-5 w-5 mr-2 text-indigo-500" />
              Edit Counseling Record
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Update the details for the staff counseling record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-5 py-5">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructorId" className="text-right font-medium text-gray-700">
                  Instructor
                </Label>
                <Select
                  name="instructorId"
                  value={formData.instructorId}
                  onValueChange={(value) => handleSelectChange('instructorId', value)}
                >
                  <SelectTrigger className="col-span-3 bg-white">
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
                <Label htmlFor="counselingType" className="text-right font-medium text-gray-700">
                  Type
                </Label>
                <Select
                  name="counselingType"
                  value={formData.counselingType}
                  onValueChange={(value: 'Verbal Warning' | 'Written Warning' | 'Final Warning') => 
                    handleSelectChange('counselingType', value)
                  }
                >
                  <SelectTrigger className="col-span-3 bg-white">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verbal Warning">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></span>
                        Verbal Warning
                      </div>
                    </SelectItem>
                    <SelectItem value="Written Warning">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-orange-500 mr-2"></span>
                        Written Warning
                      </div>
                    </SelectItem>
                    <SelectItem value="Final Warning">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-red-600 mr-2"></span>
                        Final Warning
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="counselingDate" className="text-right font-medium text-gray-700">
                  Date
                </Label>
                <Input
                  id="counselingDate"
                  name="counselingDate"
                  type="date"
                  value={formData.counselingDate}
                  onChange={handleInputChange}
                  className="col-span-3 bg-white border-gray-300"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4 pt-1">
                <Label htmlFor="comments" className="text-right font-medium text-gray-700 pt-2">
                  Comments
                </Label>
                <Textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  className="col-span-3 bg-white border-gray-300 min-h-[120px]"
                  placeholder="Enter any additional details or notes about this counseling session..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attachment" className="text-right font-medium text-gray-700">
                  Attachment
                </Label>
                <div className="col-span-3">
                  <Input
                    id="attachment"
                    type="file"
                    onChange={handleFileChange}
                    className="bg-white border-gray-300"
                  />
                  {currentCounseling?.attachmentUrl && (
                    <div className="mt-2">
                      <a 
                        href={currentCounseling.attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        View current attachment
                      </a>
                      <p className="text-gray-500 text-xs mt-1 ml-5">
                        Uploading a new file will replace the current one
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="border-t pt-4 mt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-300 bg-white text-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Record'
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