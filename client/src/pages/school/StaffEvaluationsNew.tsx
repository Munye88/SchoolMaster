import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSchool } from '@/hooks/useSchool';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CalendarDays, User, Star, FileText, Plus, Edit, Trash2, Eye, Search, Filter, Users, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';
import { type Instructor } from '@shared/schema';

interface Evaluation {
  id: number;
  instructorId: number;
  evaluatorId: number;
  evaluationDate: string;
  overallRating: number;
  teachingEffectiveness: number;
  classroomManagement: number;
  professionalDevelopment: number;
  communication: number;
  strengths: string;
  areasForImprovement: string;
  comments: string;
  status: string;
  followUpDate: string | null;
  completionDate: string | null;
  evaluationType: string;
}

interface EvaluationFormData {
  instructorId: number;
  evaluatorId: number;
  evaluationDate: string;
  overallRating: number;
  teachingEffectiveness: number;
  classroomManagement: number;
  professionalDevelopment: number;
  communication: number;
  strengths: string;
  areasForImprovement: string;
  comments: string;
  status: string;
  followUpDate: string | null;
  completionDate: string | null;
  evaluationType: string;
}

export default function StaffEvaluationsNew() {
  const { selectedSchool } = useSchool();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingEvaluation, setViewingEvaluation] = useState<Evaluation | null>(null);

  // Fetch school evaluations
  const { data: evaluations = [], isLoading: loadingEvaluations } = useQuery({
    queryKey: ['school-evaluations', selectedSchool?.id],
    queryFn: () => apiRequest(`/api/schools/${selectedSchool?.id}/evaluations`),
    enabled: !!selectedSchool?.id,
  });

  // Fetch instructors for the school
  const { data: instructors = [], isLoading: loadingInstructors } = useQuery({
    queryKey: ['instructors', selectedSchool?.id],
    queryFn: () => apiRequest(`/api/schools/${selectedSchool?.id}/instructors`),
    enabled: !!selectedSchool?.id,
  });

  // Create evaluation mutation
  const createEvaluationMutation = useMutation({
    mutationFn: (evaluationData: EvaluationFormData) => 
      apiRequest('/api/evaluations', {
        method: 'POST',
        body: JSON.stringify(evaluationData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-evaluations'] });
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Evaluation created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create evaluation",
        variant: "destructive",
      });
    },
  });

  // Update evaluation mutation
  const updateEvaluationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EvaluationFormData> }) => 
      apiRequest(`/api/evaluations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-evaluations'] });
      setEditingEvaluation(null);
      toast({
        title: "Success",
        description: "Evaluation updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update evaluation",
        variant: "destructive",
      });
    },
  });

  // Delete evaluation mutation
  const deleteEvaluationMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/evaluations/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-evaluations'] });
      toast({
        title: "Success",
        description: "Evaluation deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete evaluation",
        variant: "destructive",
      });
    },
  });

  // Filter evaluations based on search term and filters
  const filteredEvaluations = evaluations.filter((evaluation: Evaluation) => {
    const instructor = instructors.find((i: Instructor) => i.id === evaluation.instructorId);
    const matchesSearch = !searchTerm || 
      instructor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.evaluationType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || evaluation.status === filterStatus;
    const matchesType = filterType === "all" || evaluation.evaluationType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get instructor name by ID
  const getInstructorName = (instructorId: number) => {
    const instructor = instructors.find((i: Instructor) => i.id === instructorId);
    return instructor?.name || 'Unknown Instructor';
  };

  // Get evaluation statistics
  const getEvaluationStats = () => {
    const total = evaluations.length;
    const completed = evaluations.filter((e: Evaluation) => e.status === 'completed').length;
    const pending = evaluations.filter((e: Evaluation) => e.status === 'pending').length;
    const overdue = evaluations.filter((e: Evaluation) => e.status === 'overdue').length;
    
    return { total, completed, pending, overdue };
  };

  const stats = getEvaluationStats();

  if (loadingEvaluations || loadingInstructors) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Staff Evaluations</h1>
        </div>
        <div>Loading evaluations...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Evaluations</h1>
          <p className="text-muted-foreground">
            {selectedSchool?.name} - Manage instructor evaluations and assessments
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setLocation(`/schools/${selectedSchool?.code}/staff-management`)}
            variant="outline" 
            className="rounded-none"
          >
            <Users className="h-4 w-4 mr-2" />
            Staff Hub
          </Button>
          <Button 
            onClick={() => setLocation(`/schools/${selectedSchool?.code}/staff-attendance`)}
            variant="outline" 
            className="rounded-none"
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Attendance
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="rounded-none">
                <Plus className="w-4 h-4 mr-2" />
                New Evaluation
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-none max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Evaluation</DialogTitle>
              </DialogHeader>
              <EvaluationForm 
                instructors={instructors}
                onSubmit={(data) => createEvaluationMutation.mutate(data)}
                isLoading={createEvaluationMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CalendarDays className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <CalendarDays className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search evaluations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-none"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 rounded-none">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48 rounded-none">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="probationary">Probationary</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Evaluations Table */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Instructor</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Overall Rating</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvaluations.map((evaluation: Evaluation) => (
                  <tr key={evaluation.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{getInstructorName(evaluation.instructorId)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="rounded-none">
                        {evaluation.evaluationType}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {format(new Date(evaluation.evaluationDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{evaluation.overallRating}/5</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={evaluation.status === 'completed' ? 'default' : 
                                evaluation.status === 'pending' ? 'secondary' : 'destructive'}
                        className="rounded-none"
                      >
                        {evaluation.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setViewingEvaluation(evaluation);
                            setShowViewDialog(true);
                          }}
                          className="rounded-none"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEvaluation(evaluation)}
                          className="rounded-none"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEvaluationMutation.mutate(evaluation.id)}
                          className="rounded-none text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredEvaluations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No evaluations found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Evaluation Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="rounded-none max-w-3xl">
          <DialogHeader>
            <DialogTitle>Evaluation Details</DialogTitle>
          </DialogHeader>
          {viewingEvaluation && (
            <EvaluationView 
              evaluation={viewingEvaluation}
              instructorName={getInstructorName(viewingEvaluation.instructorId)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Evaluation Dialog */}
      <Dialog open={!!editingEvaluation} onOpenChange={(open) => !open && setEditingEvaluation(null)}>
        <DialogContent className="rounded-none max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Evaluation</DialogTitle>
          </DialogHeader>
          {editingEvaluation && (
            <EvaluationForm 
              instructors={instructors}
              initialData={editingEvaluation}
              onSubmit={(data) => updateEvaluationMutation.mutate({ 
                id: editingEvaluation.id, 
                data 
              })}
              isLoading={updateEvaluationMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Evaluation Form Component
function EvaluationForm({ 
  instructors, 
  initialData, 
  onSubmit, 
  isLoading 
}: {
  instructors: Instructor[];
  initialData?: Evaluation;
  onSubmit: (data: EvaluationFormData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<EvaluationFormData>({
    instructorId: initialData?.instructorId || 0,
    evaluatorId: initialData?.evaluatorId || 1,
    evaluationDate: initialData?.evaluationDate || new Date().toISOString().split('T')[0],
    overallRating: initialData?.overallRating || 1,
    teachingEffectiveness: initialData?.teachingEffectiveness || 1,
    classroomManagement: initialData?.classroomManagement || 1,
    professionalDevelopment: initialData?.professionalDevelopment || 1,
    communication: initialData?.communication || 1,
    strengths: initialData?.strengths || '',
    areasForImprovement: initialData?.areasForImprovement || '',
    comments: initialData?.comments || '',
    status: initialData?.status || 'pending',
    followUpDate: initialData?.followUpDate || null,
    completionDate: initialData?.completionDate || null,
    evaluationType: initialData?.evaluationType || 'annual',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="instructorId">Instructor</Label>
          <Select 
            value={formData.instructorId.toString()} 
            onValueChange={(value) => setFormData({...formData, instructorId: parseInt(value)})}
          >
            <SelectTrigger className="rounded-none">
              <SelectValue placeholder="Select instructor" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {instructors.map((instructor) => (
                <SelectItem key={instructor.id} value={instructor.id.toString()}>
                  {instructor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="evaluationType">Evaluation Type</Label>
          <Select 
            value={formData.evaluationType} 
            onValueChange={(value) => setFormData({...formData, evaluationType: value})}
          >
            <SelectTrigger className="rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="probationary">Probationary</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="evaluationDate">Evaluation Date</Label>
          <Input
            type="date"
            value={formData.evaluationDate}
            onChange={(e) => setFormData({...formData, evaluationDate: e.target.value})}
            className="rounded-none"
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData({...formData, status: value})}
          >
            <SelectTrigger className="rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="overallRating">Overall Rating (1-5)</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={formData.overallRating}
            onChange={(e) => setFormData({...formData, overallRating: parseInt(e.target.value)})}
            className="rounded-none"
          />
        </div>
        
        <div>
          <Label htmlFor="teachingEffectiveness">Teaching Effectiveness (1-5)</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={formData.teachingEffectiveness}
            onChange={(e) => setFormData({...formData, teachingEffectiveness: parseInt(e.target.value)})}
            className="rounded-none"
          />
        </div>
        
        <div>
          <Label htmlFor="classroomManagement">Classroom Management (1-5)</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={formData.classroomManagement}
            onChange={(e) => setFormData({...formData, classroomManagement: parseInt(e.target.value)})}
            className="rounded-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="professionalDevelopment">Professional Development (1-5)</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={formData.professionalDevelopment}
            onChange={(e) => setFormData({...formData, professionalDevelopment: parseInt(e.target.value)})}
            className="rounded-none"
          />
        </div>
        
        <div>
          <Label htmlFor="communication">Communication (1-5)</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={formData.communication}
            onChange={(e) => setFormData({...formData, communication: parseInt(e.target.value)})}
            className="rounded-none"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="strengths">Strengths</Label>
        <Textarea
          value={formData.strengths}
          onChange={(e) => setFormData({...formData, strengths: e.target.value})}
          placeholder="List the instructor's key strengths..."
          className="rounded-none"
        />
      </div>

      <div>
        <Label htmlFor="areasForImprovement">Areas for Improvement</Label>
        <Textarea
          value={formData.areasForImprovement}
          onChange={(e) => setFormData({...formData, areasForImprovement: e.target.value})}
          placeholder="List areas that need improvement..."
          className="rounded-none"
        />
      </div>

      <div>
        <Label htmlFor="comments">Additional Comments</Label>
        <Textarea
          value={formData.comments}
          onChange={(e) => setFormData({...formData, comments: e.target.value})}
          placeholder="Any additional comments or observations..."
          className="rounded-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading} className="rounded-none">
          {isLoading ? 'Saving...' : initialData ? 'Update Evaluation' : 'Create Evaluation'}
        </Button>
      </div>
    </form>
  );
}

// Evaluation View Component
function EvaluationView({ evaluation, instructorName }: { evaluation: Evaluation; instructorName: string }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Instructor</Label>
          <p className="text-sm text-muted-foreground">{instructorName}</p>
        </div>
        
        <div>
          <Label>Evaluation Type</Label>
          <p className="text-sm text-muted-foreground">{evaluation.evaluationType}</p>
        </div>
        
        <div>
          <Label>Evaluation Date</Label>
          <p className="text-sm text-muted-foreground">
            {format(new Date(evaluation.evaluationDate), 'MMM dd, yyyy')}
          </p>
        </div>
        
        <div>
          <Label>Status</Label>
          <Badge variant="secondary" className="rounded-none">
            {evaluation.status}
          </Badge>
        </div>
      </div>

      <Separator />

      <div>
        <Label>Rating Breakdown</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex justify-between">
            <span>Overall Rating:</span>
            <span className="font-medium">{evaluation.overallRating}/5</span>
          </div>
          <div className="flex justify-between">
            <span>Teaching Effectiveness:</span>
            <span className="font-medium">{evaluation.teachingEffectiveness}/5</span>
          </div>
          <div className="flex justify-between">
            <span>Classroom Management:</span>
            <span className="font-medium">{evaluation.classroomManagement}/5</span>
          </div>
          <div className="flex justify-between">
            <span>Professional Development:</span>
            <span className="font-medium">{evaluation.professionalDevelopment}/5</span>
          </div>
          <div className="flex justify-between">
            <span>Communication:</span>
            <span className="font-medium">{evaluation.communication}/5</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <Label>Strengths</Label>
        <p className="text-sm text-muted-foreground mt-1">{evaluation.strengths}</p>
      </div>

      <div>
        <Label>Areas for Improvement</Label>
        <p className="text-sm text-muted-foreground mt-1">{evaluation.areasForImprovement}</p>
      </div>

      <div>
        <Label>Additional Comments</Label>
        <p className="text-sm text-muted-foreground mt-1">{evaluation.comments}</p>
      </div>
    </div>
  );
}