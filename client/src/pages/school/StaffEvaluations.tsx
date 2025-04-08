import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Instructor, Evaluation } from "@shared/schema";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Share2, Download, FileText, PieChart } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from "recharts";

const PASSING_SCORE = 85; // As per requirement, the passing score is 85%

const StaffEvaluations = () => {
  const { selectedSchool, currentSchool } = useSchool();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [evalData, setEvalData] = useState<any[]>([]);

  // Fetch instructors and evaluations
  const { data: instructors = [], isLoading: isLoadingInstructors } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });

  const { data: evaluations = [], isLoading: isLoadingEvaluations } = useQuery<Evaluation[]>({
    queryKey: ['/api/evaluations'],
  });

  const schoolInstructors = instructors.filter(instructor => 
    !selectedSchool || instructor.schoolId === currentSchool?.id
  );

  // Process evaluation data for visualization
  useEffect(() => {
    if (!isLoadingInstructors && !isLoadingEvaluations && schoolInstructors.length > 0) {
      const instructorScores = schoolInstructors.map(instructor => {
        const instructorEvals = evaluations.filter(evaluation => evaluation.instructorId === instructor.id);
        const avgScore = instructorEvals.length > 0 
          ? instructorEvals.reduce((sum, evaluation) => sum + evaluation.score, 0) / instructorEvals.length 
          : 0;
        
        return {
          name: instructor.name,
          score: Math.round(avgScore),
          passing: avgScore >= PASSING_SCORE
        };
      });
      
      setEvalData(instructorScores);
    }
  }, [instructors, evaluations, schoolInstructors, isLoadingInstructors, isLoadingEvaluations]);

  // Calculate statistics
  const passCount = evalData.filter(item => item.passing).length;
  const passRate = schoolInstructors.length > 0 
    ? Math.round((passCount / schoolInstructors.length) * 100) 
    : 0;
  
  const avgScore = evalData.length > 0
    ? Math.round(evalData.reduce((sum, item) => sum + item.score, 0) / evalData.length)
    : 0;

  const quarterlyData = [
    { quarter: "Q1", avgScore: 86 },
    { quarter: "Q2", avgScore: 88 },
    { quarter: "Q3", avgScore: 84 },
    { quarter: "Q4", avgScore: 89 }
  ];

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
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {currentSchool ? `${currentSchool.name} Staff Evaluations` : 'Staff Evaluations'}
          </h1>
          <p className="text-gray-500">Monitor instructor performance and evaluation metrics</p>
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
            <CardTitle className="text-sm font-medium text-gray-500">Passing Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{passRate}%</div>
              <div className="p-2 bg-green-100 text-green-800 rounded-full">
                <PieChart size={20} />
              </div>
            </div>
            <Progress 
              value={passRate} 
              className={`h-2 mt-4 ${passRate >= 85 ? "bg-green-500" : "bg-amber-500"}`}
            />
            <p className="text-xs text-gray-500 mt-2">
              {passCount} of {schoolInstructors.length} instructors meet or exceed the 85% evaluation threshold
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{avgScore}%</div>
              <div className={`p-2 rounded-full ${avgScore >= 85 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                <PieChart size={20} />
              </div>
            </div>
            <Progress 
              value={avgScore} 
              className={`h-2 mt-4 ${avgScore >= 85 ? "bg-green-500" : "bg-amber-500"}`}
            />
            <p className="text-xs text-gray-500 mt-2">
              Average staff evaluation score across {evaluations.length} evaluations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Quarterly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="quarter" axisLine={false} tickLine={false} />
                  <YAxis hide domain={[75, 100]} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#0A2463" radius={[4, 4, 0, 0]}>
                    {quarterlyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.avgScore >= 85 ? "#10B981" : "#F59E0B"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Quarterly average evaluation scores trends
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs and Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
            <TabsTrigger value="history">Evaluation History</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Evaluation Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={evalData}
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
                    <Bar dataKey="score" name="Score (%)" fill="#0A2463" radius={[4, 4, 0, 0]}>
                      {evalData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.score >= PASSING_SCORE ? "#10B981" : "#F59E0B"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Evaluation Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Latest Score</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Evaluations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evalData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.score}%</TableCell>
                      <TableCell>{item.score}%</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.passing ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.passing ? 'Passing' : 'Needs Improvement'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Evaluator</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Quarter</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluations
                    .filter(evaluation => {
                      const instructor = instructors.find(i => i.id === evaluation.instructorId);
                      return !selectedSchool || instructor?.schoolId === currentSchool?.id;
                    })
                    .map((evaluation, index) => {
                      const instructor = instructors.find(i => i.id === evaluation.instructorId);
                      return (
                        <TableRow key={index}>
                          <TableCell>{`${evaluation.year}-${evaluation.quarter}`}</TableCell>
                          <TableCell className="font-medium">{instructor?.name || 'Unknown'}</TableCell>
                          <TableCell>Administrator</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              evaluation.score >= PASSING_SCORE ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {evaluation.score}%
                            </span>
                          </TableCell>
                          <TableCell>{evaluation.quarter}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">View Report</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffEvaluations;