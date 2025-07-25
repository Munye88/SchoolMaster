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
import { 
  CalendarDays, 
  User, 
  Star, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Users, 
  ClipboardCheck,
  TrendingUp,
  Calendar,
  Award,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { type Instructor } from '@shared/schema';

interface Evaluation {
  id: number;
  instructorId: number;
  evaluatorId?: number;
  evaluationDate: string;
  overallRating: number;
  teachingEffectiveness: number;
  classroomManagement: number;
  professionalDevelopment: number;
  communication: number;
  strengths?: string;
  areasForImprovement?: string;
  comments?: string;
  status: string;
  followUpDate?: string;
  completionDate?: string;
  evaluationType: string;
  quarter?: string;
  year: string;
  score?: number;
  feedback?: string;
  attachmentUrl?: string;
  employeeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EvaluationFormData {
  instructorId: number;
  evaluatorId?: number;
  evaluationDate: string;
  overallRating: number;
  teachingEffectiveness: number;
  classroomManagement: number;
  professionalDevelopment: number;
  communication: number;
  strengths?: string;
  areasForImprovement?: string;
  comments?: string;
  status: string;
  followUpDate?: string;
  completionDate?: string;
  evaluationType: string;
  quarter?: string;
  year: string;
  score?: number;
  feedback?: string;
  attachmentUrl?: string;
  employeeId?: string;
}

interface EvaluationFormProps {
  evaluation?: Evaluation | null;
  instructors: Instructor[];
  onSubmit: (data: EvaluationFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  evaluation,
  instructors,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const defaultQuarter = evaluation?.quarter || 'Q1';
  const defaultEvaluationType = evaluation?.evaluationType || (defaultQuarter === 'Q4' ? 'summative' : 'formative');
  
  const [formData, setFormData] = useState<EvaluationFormData>({
    instructorId: evaluation?.instructorId || 0,
    evaluatorId: evaluation?.evaluatorId || undefined,
    evaluationDate: evaluation?.evaluationDate || new Date().toISOString().split('T')[0],
    overallRating: evaluation?.overallRating || 1,
    teachingEffectiveness: evaluation?.teachingEffectiveness || 1,
    classroomManagement: evaluation?.classroomManagement || 1,
    professionalDevelopment: evaluation?.professionalDevelopment || 1,
    communication: evaluation?.communication || 1,
    strengths: evaluation?.strengths || '',
    areasForImprovement: evaluation?.areasForImprovement || '',
    comments: evaluation?.comments || '',
    status: evaluation?.status || 'draft',
    followUpDate: evaluation?.followUpDate || '',
    completionDate: evaluation?.completionDate || '',
    evaluationType: defaultEvaluationType,
    quarter: defaultQuarter,
    year: evaluation?.year || new Date().getFullYear().toString(),
    score: evaluation?.score || undefined,
    feedback: evaluation?.feedback || '',
    attachmentUrl: evaluation?.attachmentUrl || '',
    employeeId: evaluation?.employeeId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleRatingChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedInstructor = instructors.find(i => i.id === formData.instructorId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="instructorId">Instructor *</Label>
          <Select
            value={formData.instructorId.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, instructorId: parseInt(value) }))}
          >
            <SelectTrigger className="rounded-none">
              <SelectValue placeholder="Select instructor" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {instructors.map((instructor) => (
                <SelectItem key={instructor.id} value={instructor.id.toString()}>
                  {instructor.name} - {instructor.nationality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="evaluationDate">Evaluation Date *</Label>
          <Input
            id="evaluationDate"
            type="date"
            value={formData.evaluationDate}
            onChange={(e) => setFormData(prev => ({ ...prev, evaluationDate: e.target.value }))}
            className="rounded-none"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="evaluationType">Evaluation Type *</Label>
          <Select
            value={formData.evaluationType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, evaluationType: value }))}
          >
            <SelectTrigger className="rounded-none">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="formative">Formative</SelectItem>
              <SelectItem value="summative">Summative</SelectItem>
              <SelectItem value="probationary">Probationary</SelectItem>
            </SelectContent>
          </Select>
        </div>



        <div className="space-y-2">
          <Label htmlFor="quarter">Quarter</Label>
          <Select
            value={formData.quarter}
            onValueChange={(value) => {
              const evaluationType = value === 'Q4' ? 'summative' : 'formative';
              setFormData(prev => ({ ...prev, quarter: value, evaluationType }));
            }}
          >
            <SelectTrigger className="rounded-none">
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="Q1">Quarter 1 (Formative)</SelectItem>
              <SelectItem value="Q2">Quarter 2 (Formative)</SelectItem>
              <SelectItem value="Q3">Quarter 3 (Formative)</SelectItem>
              <SelectItem value="Q4">Quarter 4 (Summative)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Select
            value={formData.year}
            onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
          >
            <SelectTrigger className="rounded-none">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
              <SelectItem value="2028">2028</SelectItem>
              <SelectItem value="2029">2029</SelectItem>
              <SelectItem value="2030">2030</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Score Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center">Evaluation Score</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="score" className="text-sm font-medium">Score (0-100)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={formData.score || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value ? parseInt(e.target.value) : undefined }))}
              placeholder="Enter score (0-100)"
              className="rounded-none"
            />
            <p className="text-xs text-gray-500">Enter a score between 0 and 100</p>
          </div>
        </div>
      </div>



      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-none"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !formData.instructorId}
          className="rounded-none"
        >
          {isLoading ? 'Saving...' : evaluation ? 'Update Evaluation' : 'Create Evaluation'}
        </Button>
      </div>
    </form>
  );
};

export default function StaffEvaluationsComplete() {
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
    queryKey: ['evaluations', selectedSchool?.id],
    queryFn: async () => {
      console.log(`StaffEvaluationsComplete: Fetching evaluations for school ${selectedSchool?.name} (ID: ${selectedSchool?.id})`);
      const response = await fetch(`/api/schools/${selectedSchool?.id}/evaluations`);
      if (!response.ok) {
        throw new Error('Failed to fetch evaluations');
      }
      const data = await response.json();
      console.log(`StaffEvaluationsComplete: Fetched ${data.length} evaluations for ${selectedSchool?.name}`);
      return data;
    },
    enabled: !!selectedSchool?.id,
  });

  // Fetch instructors for the school
  const { data: allInstructors = [], isLoading: loadingInstructors } = useQuery({
    queryKey: ['instructors', selectedSchool?.id],
    queryFn: () => fetch(`/api/instructors`).then(res => res.json()),
  });

  // Filter instructors by school
  const instructors = allInstructors.filter((instructor: any) => 
    instructor.schoolId === selectedSchool?.id
  );

  // Create evaluation mutation
  const createEvaluationMutation = useMutation({
    mutationFn: (evaluationData: EvaluationFormData) => 
      fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluationData),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
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
      fetch(`/api/evaluations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
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
      fetch(`/api/evaluations/${id}`, {
        method: 'DELETE',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
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

  const handleCreateEvaluation = (data: EvaluationFormData) => {
    createEvaluationMutation.mutate(data);
  };

  const handleUpdateEvaluation = (data: EvaluationFormData) => {
    if (editingEvaluation) {
      updateEvaluationMutation.mutate({ id: editingEvaluation.id, data });
    }
  };

  const handleDeleteEvaluation = (id: number) => {
    if (confirm('Are you sure you want to delete this evaluation?')) {
      deleteEvaluationMutation.mutate(id);
    }
  };

  // Filter evaluations by school instructors
  const schoolEvaluations = evaluations.filter((evaluation: Evaluation) => 
    instructors.some((instructor: any) => instructor.id === evaluation.instructorId)
  );

  // Apply filters
  const filteredEvaluations = schoolEvaluations.filter((evaluation: Evaluation) => {
    const instructor = allInstructors.find((i: Instructor) => i.id === evaluation.instructorId);
    const matchesSearch = !searchTerm || 
      instructor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.evaluationType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || evaluation.status === filterStatus;
    const matchesType = filterType === 'all' || evaluation.evaluationType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const totalEvaluations = schoolEvaluations.length;
  const completedEvaluations = schoolEvaluations.length; // All evaluations are considered completed
  const draftEvaluations = schoolEvaluations.filter((e: Evaluation) => e.status === 'draft').length;
  const averageScore = schoolEvaluations.length > 0 
    ? schoolEvaluations.reduce((sum: number, e: Evaluation) => sum + (e.score || 0), 0) / schoolEvaluations.length 
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loadingEvaluations || loadingInstructors) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading evaluations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Evaluations</h1>
          <p className="text-gray-600">{selectedSchool?.name} - Performance Management</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="rounded-none">
          <Plus className="w-4 h-4 mr-2" />
          New Evaluation
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center">
              <ClipboardCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvaluations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedEvaluations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {averageScore.toFixed(1)}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-none">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search evaluations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-none"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 rounded-none">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 rounded-none">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="probationary">Probationary</SelectItem>
                <SelectItem value="special">Special Review</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto text-sm text-gray-500">
              {filteredEvaluations.length} of {totalEvaluations} evaluations
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations Table */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Evaluation Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvaluations.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluations found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first evaluation to get started.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)} className="rounded-none">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Evaluation
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Instructor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Period</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvaluations.map((evaluation: Evaluation) => {
                    const instructor = allInstructors.find((i: Instructor) => i.id === evaluation.instructorId);
                    return (
                      <tr key={evaluation.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <User className="w-8 h-8 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{instructor?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{instructor?.nationality}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-sm font-medium text-gray-900">
                            {evaluation.evaluationType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {evaluation.quarter ? `${evaluation.quarter} ` : ''}{evaluation.year}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            <span className={`font-medium px-3 py-1 rounded-none border ${
                              evaluation.score && evaluation.score >= 85 
                                ? 'text-green-600 bg-green-50 border-green-200' 
                                : evaluation.score 
                                  ? 'text-red-600 bg-red-50 border-red-200'
                                  : 'text-gray-600 bg-gray-50 border-gray-200'
                            }`}>
                              {evaluation.score || 'N/A'}/100
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {format(new Date(evaluation.evaluationDate), 'MMM dd, yyyy')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setViewingEvaluation(evaluation);
                                setShowViewDialog(true);
                              }}
                              className="rounded-none"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingEvaluation(evaluation)}
                              className="rounded-none"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEvaluation(evaluation.id)}
                              className="rounded-none text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Evaluation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">Create New Evaluation</DialogTitle>
          </DialogHeader>
          <EvaluationForm
            instructors={instructors}
            onSubmit={handleCreateEvaluation}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={createEvaluationMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Evaluation Dialog */}
      <Dialog open={!!editingEvaluation} onOpenChange={() => setEditingEvaluation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">Edit Evaluation</DialogTitle>
          </DialogHeader>
          <EvaluationForm
            evaluation={editingEvaluation}
            instructors={instructors}
            onSubmit={handleUpdateEvaluation}
            onCancel={() => setEditingEvaluation(null)}
            isLoading={updateEvaluationMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* View Evaluation Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader className="relative">
            <DialogTitle className="text-center text-lg font-bold">Evaluation Details</DialogTitle>
            <button
              onClick={() => setShowViewDialog(false)}
              className="absolute right-0 top-0 p-2 hover:bg-gray-100 rounded-none border border-gray-300 bg-white text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </DialogHeader>
          {viewingEvaluation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Instructor</Label>
                  <p className="text-sm text-gray-900">
                    {allInstructors.find((i: Instructor) => i.id === viewingEvaluation.instructorId)?.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Evaluation Date</Label>
                  <p className="text-sm text-gray-900">
                    {format(new Date(viewingEvaluation.evaluationDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <p className="text-sm text-gray-900 capitalize">{viewingEvaluation.evaluationType}</p>
                </div>

              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 text-center">Evaluation Score</h4>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-none border-2 ${
                    viewingEvaluation.score && viewingEvaluation.score >= 85 
                      ? 'bg-green-50 border-green-200' 
                      : viewingEvaluation.score 
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                  }`}>
                    <span className={`text-3xl font-bold ${
                      viewingEvaluation.score && viewingEvaluation.score >= 85 
                        ? 'text-green-600' 
                        : viewingEvaluation.score 
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}>
                      {viewingEvaluation.score || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Score out of 100 {viewingEvaluation.score && viewingEvaluation.score < 85 && '(Below Passing)'}
                  </p>
                </div>
              </div>


            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}