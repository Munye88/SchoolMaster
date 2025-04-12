import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Instructor, Evaluation, InsertEvaluation } from "@shared/schema";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Share2, 
  Download, 
  FileText, 
  PieChart as PieChartIcon, 
  CalendarDays, 
  BarChart as BarChartIcon, 
  PencilIcon, 
  PlusIcon,
  SaveIcon,
  XIcon
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

const PASSING_SCORE = 85; // Passing score is 85% as per requirements

const StaffEvaluations = () => {
  const { selectedSchool } = useSchool();
  const [selectedTab, setSelectedTab] = useState("quarterly");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [evalScore, setEvalScore] = useState<number>(85);
  const [evalQuarter, setEvalQuarter] = useState<string>("Q1");
  const [evalFeedback, setEvalFeedback] = useState<string>("");
  const [evalDate, setEvalDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [evalAttachment, setEvalAttachment] = useState<string | null>(null);
  
  // Fetch instructors and evaluations
  const { data: instructors = [], isLoading: isLoadingInstructors } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });

  const { data: evaluations = [], isLoading: isLoadingEvaluations } = useQuery<Evaluation[]>({
    // Include selectedSchool in the queryKey to trigger refetch when school changes
    queryKey: ['/api/evaluations', selectedSchool],
    // Make sure query runs even when selectedSchool changes
    refetchOnWindowFocus: true,
  });

  const schoolInstructors = selectedSchool 
    ? instructors.filter(instructor => instructor.schoolId === parseInt(selectedSchool.toString(), 10)) 
    : instructors;
  
  // Create mock evaluation data for instructors if none exist
  const createEvaluationMutation = useMutation({
    mutationFn: async (data: InsertEvaluation) => {
      const res = await apiRequest("POST", "/api/evaluations", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluations'] });
    },
  });

  // If no evaluations exist, create sample data (just for testing)
  useEffect(() => {
    if (!isLoadingInstructors && !isLoadingEvaluations && evaluations.length === 0 && schoolInstructors.length > 0) {
      const quarters = ["Q1", "Q2", "Q3"];
      
      schoolInstructors.forEach(instructor => {
        quarters.forEach(quarter => {
          const randomScore = Math.floor(Math.random() * 16) + 75; // Random score between 75-90
          createEvaluationMutation.mutate({
            instructorId: instructor.id,
            score: randomScore,
            quarter,
            year: "2025",
            feedback: null,
            evaluatorId: null
          });
        });
      });
    }
  }, [schoolInstructors, evaluations, isLoadingInstructors, isLoadingEvaluations, selectedSchool]);

  // Process quarterly data for each instructor
  const instructorQuarterlyData = schoolInstructors.map(instructor => {
    const instructorEvals = evaluations.filter(
      evaluation => evaluation.instructorId === instructor.id && evaluation.year === selectedYear
    );
    
    // Get quarterly scores
    const q1Score = instructorEvals.find(e => e.quarter === "Q1")?.score || 0;
    const q2Score = instructorEvals.find(e => e.quarter === "Q2")?.score || 0;
    const q3Score = instructorEvals.find(e => e.quarter === "Q3")?.score || 0;
    
    // Calculate average score
    const quarters = instructorEvals.map(e => e.quarter);
    const avgScore = instructorEvals.length > 0 
      ? Math.round(instructorEvals.reduce((sum, evaluation) => sum + evaluation.score, 0) / instructorEvals.length) 
      : 0;
    
    return {
      id: instructor.id,
      name: instructor.name,
      q1Score,
      q2Score,
      q3Score,
      avgScore,
      passing: avgScore >= PASSING_SCORE,
      quarters: quarters,
      nationality: instructor.nationality,
      evaluationsCount: instructorEvals.length,
      school: "Unknown"
    };
  });

  // Calculate statistics
  const passCount = instructorQuarterlyData.filter(item => item.passing).length;
  const passRate = schoolInstructors.length > 0 
    ? Math.round((passCount / schoolInstructors.length) * 100) 
    : 0;
  
  const avgScore = instructorQuarterlyData.length > 0
    ? Math.round(instructorQuarterlyData.reduce((sum, item) => sum + item.avgScore, 0) / instructorQuarterlyData.length)
    : 0;

  // Quarter average scores
  const q1Avg = instructorQuarterlyData.length > 0
    ? Math.round(instructorQuarterlyData.reduce((sum, item) => sum + item.q1Score, 0) / instructorQuarterlyData.length)
    : 0;
    
  const q2Avg = instructorQuarterlyData.length > 0
    ? Math.round(instructorQuarterlyData.reduce((sum, item) => sum + item.q2Score, 0) / instructorQuarterlyData.length)
    : 0;
    
  const q3Avg = instructorQuarterlyData.length > 0
    ? Math.round(instructorQuarterlyData.reduce((sum, item) => sum + item.q3Score, 0) / instructorQuarterlyData.length)
    : 0;

  const quarterlyData = [
    { quarter: "Q1", avgScore: q1Avg, color: "#3498db" },
    { quarter: "Q2", avgScore: q2Avg, color: "#2ecc71" },
    { quarter: "Q3", avgScore: q3Avg, color: "#e74c3c" },
  ];

  // Loading state
  if (isLoadingInstructors || isLoadingEvaluations) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-[#0A2463] to-[#3E92CC] bg-clip-text text-transparent">
              Staff Evaluations
            </span>
          </h1>
          <p className="text-gray-500">Monitor instructor performance across quarterly evaluations</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
            <FileText size={16} /> PowerBI Dashboard
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overall Passing Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{passRate}%</div>
              <div className={`p-2 rounded-full ${passRate >= 85 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                <PieChartIcon size={20} />
              </div>
            </div>
            <Progress 
              value={passRate} 
              className="h-2 mt-4"
            />
            <p className="text-xs text-gray-500 mt-2">
              {passCount} of {schoolInstructors.length} instructors meet or exceed the 85% evaluation threshold
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Quarterly Averages ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-[#3498db]">{q1Avg}%</div>
                <div className="text-xs text-gray-500">Quarter 1</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#2ecc71]">{q2Avg}%</div>
                <div className="text-xs text-gray-500">Quarter 2</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#e74c3c]">{q3Avg}%</div>
                <div className="text-xs text-gray-500">Quarter 3</div>
              </div>
            </div>
            <div className="flex mt-4 gap-1">
              <Progress value={q1Avg} className="h-2 flex-1" />
              <Progress value={q2Avg} className="h-2 flex-1" />
              <Progress value={q3Avg} className="h-2 flex-1" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Average scores across quarterly evaluations for all instructors
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Year Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-bold">{selectedYear}</div>
              <div className="p-2 bg-blue-100 text-blue-800 rounded-full">
                <CalendarDays size={20} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={selectedYear === "2024" ? "default" : "outline"} 
                className="flex-1"
                onClick={() => setSelectedYear("2024")}
              >
                2024
              </Button>
              <Button 
                variant={selectedYear === "2025" ? "default" : "outline"} 
                className="flex-1"
                onClick={() => setSelectedYear("2025")}
              >
                2025
              </Button>
              <Button 
                variant={selectedYear === "2026" ? "default" : "outline"} 
                className="flex-1"
                onClick={() => setSelectedYear("2026")}
              >
                2026
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs and Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="quarterly">Quarterly Scores</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Quarterly Scores Tab */}
        <TabsContent value="quarterly" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Quarterly Evaluation Scores for {selectedYear}</CardTitle>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Search instructors..." 
                    className="max-w-xs"
                  />
                  <Button 
                    className="bg-[#0A2463] hover:bg-[#071A4A] gap-2"
                    onClick={() => {
                      setSelectedInstructor(null);
                      setDialogMode("add");
                      setEvalScore(85);
                      setEvalQuarter("Q1");
                      setEvalFeedback("");
                      setEvalDate(format(new Date(), 'yyyy-MM-dd'));
                      setEvalAttachment(null);
                      setDialogOpen(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add New Evaluation
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor Name</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Quarter 1 Score</TableHead>
                    <TableHead className="text-center">Quarter 2 Score</TableHead>
                    <TableHead className="text-center">Quarter 3 Score</TableHead>
                    <TableHead className="text-center">Average</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instructorQuarterlyData.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell className="font-medium">{instructor.name}</TableCell>
                      <TableCell className="text-center">{format(new Date(), 'MM/dd/yy')}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full ${
                          instructor.q1Score >= PASSING_SCORE 
                            ? 'bg-green-100 text-green-800' 
                            : instructor.q1Score > 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {instructor.q1Score > 0 ? `${instructor.q1Score}%` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full ${
                          instructor.q2Score >= PASSING_SCORE 
                            ? 'bg-green-100 text-green-800' 
                            : instructor.q2Score > 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {instructor.q2Score > 0 ? `${instructor.q2Score}%` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full ${
                          instructor.q3Score >= PASSING_SCORE 
                            ? 'bg-green-100 text-green-800' 
                            : instructor.q3Score > 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {instructor.q3Score > 0 ? `${instructor.q3Score}%` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {instructor.evaluationsCount > 0 ? `${instructor.avgScore}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const instr = schoolInstructors.find(i => i.id === instructor.id);
                              if (instr) {
                                setSelectedInstructor(instr);
                                setDialogMode("edit");
                                setDialogOpen(true);
                              }
                            }}
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                            onClick={() => {
                              const instr = schoolInstructors.find(i => i.id === instructor.id);
                              if (instr) {
                                setSelectedInstructor(instr);
                                setDialogMode("add");
                                setEvalScore(85);
                                setEvalQuarter("Q1");
                                setEvalFeedback("");
                                setDialogOpen(true);
                              }
                            }}
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Score
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Evaluation Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={instructorQuarterlyData.filter(i => i.evaluationsCount > 0)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="avgScore" name="Average Score (%)" fill="#0A2463" radius={[4, 4, 0, 0]}>
                      {instructorQuarterlyData.filter(i => i.evaluationsCount > 0).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.avgScore >= PASSING_SCORE ? "#10B981" : "#EF4444"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={quarterlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="quarter" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="avgScore" name="Average Score (%)" radius={[4, 4, 0, 0]}>
                        {quarterlyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Passing', value: passCount, color: '#10B981' },
                          { name: 'Needs Improvement', value: schoolInstructors.length - passCount, color: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Evaluation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add" ? "Add Evaluation Score" : "Edit Evaluation Score"} {selectedInstructor ? `for ${selectedInstructor.name}` : ''}
            </DialogTitle>
            <DialogDescription>
              Enter the evaluation details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {!selectedInstructor && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructor" className="text-right">
                  Instructor
                </Label>
                <Select 
                  onValueChange={(val) => {
                    const instructorId = parseInt(val, 10);
                    const instr = schoolInstructors.find(i => i.id === instructorId);
                    if (instr) {
                      setSelectedInstructor(instr);
                    }
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolInstructors.map(instructor => (
                      <SelectItem key={instructor.id} value={instructor.id.toString()}>
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quarter" className="text-right">
                Quarter
              </Label>
              <Select 
                value={evalQuarter} 
                onValueChange={setEvalQuarter}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Quarter 1</SelectItem>
                  <SelectItem value="Q2">Quarter 2</SelectItem>
                  <SelectItem value="Q3">Quarter 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Evaluation Date
              </Label>
              <Input
                id="date"
                type="date"
                value={evalDate}
                onChange={(e) => setEvalDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="score" className="text-right">
                Score (%)
              </Label>
              <Input
                id="score"
                type="number"
                min={0}
                max={100}
                value={evalScore}
                onChange={(e) => setEvalScore(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feedback" className="text-right">
                Feedback
              </Label>
              <Input
                id="feedback"
                placeholder="Optional feedback comments"
                value={evalFeedback}
                onChange={(e) => setEvalFeedback(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attachment" className="text-right">
                Formal Evaluation
              </Label>
              <div className="col-span-3">
                <Input
                  id="attachment"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setEvalAttachment(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="col-span-3"
                />
                {evalAttachment && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Formal evaluation document attached
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="gap-2"
            >
              <XIcon size={16} />
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedInstructor) {
                  createEvaluationMutation.mutate({
                    instructorId: selectedInstructor.id,
                    score: evalScore,
                    quarter: evalQuarter,
                    year: selectedYear,
                    evaluationDate: evalDate,
                    feedback: evalFeedback || null,
                    attachmentUrl: evalAttachment || null,
                    evaluatorId: null
                  });
                  setDialogOpen(false);
                  
                  // Reset after saving
                  if (dialogMode === "add") {
                    setSelectedInstructor(null);
                    setEvalScore(85);
                    setEvalQuarter("Q1");
                    setEvalFeedback("");
                    setEvalAttachment(null);
                  }
                }
              }} 
              disabled={!selectedInstructor}
              className="gap-2 bg-[#0A2463] hover:bg-[#071A4A]"
            >
              <SaveIcon size={16} />
              Save Evaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffEvaluations;