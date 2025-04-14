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
import { Share2, Download, FileText, PieChart as PieChartIcon } from "lucide-react";
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

const PASSING_SCORE = 85; // As per requirement, the passing score is 85%

const StaffEvaluations = () => {
  const { selectedSchool } = useSchool();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [evalData, setEvalData] = useState<any[]>([]);

  // Fetch instructors and evaluations
  const { data: instructors = [], isLoading: isLoadingInstructors } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors', selectedSchool, currentSchool?.id],
    refetchOnWindowFocus: true,
  });

  const { data: evaluations = [], isLoading: isLoadingEvaluations } = useQuery<Evaluation[]>({
    queryKey: ['/api/evaluations', selectedSchool, currentSchool?.id],
    // Ensure the data is reloaded when the school changes
    refetchOnWindowFocus: true,
    // Since selectedSchool is in the queryKey, any change in selected school will trigger a refetch
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
          passing: avgScore >= PASSING_SCORE,
          nationality: instructor.nationality
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

  // Process nationality data
  const americanCount = schoolInstructors.filter(i => i.nationality === 'American').length;
  const britishCount = schoolInstructors.filter(i => i.nationality === 'British').length;
  const canadianCount = schoolInstructors.filter(i => i.nationality === 'Canadian').length;

  const americanPercent = schoolInstructors.length > 0 
    ? Math.round((americanCount / schoolInstructors.length) * 100) 
    : 0;
  const britishPercent = schoolInstructors.length > 0 
    ? Math.round((britishCount / schoolInstructors.length) * 100) 
    : 0;
  const canadianPercent = schoolInstructors.length > 0 
    ? Math.round((canadianCount / schoolInstructors.length) * 100) 
    : 0;

  const nationalityData = [
    { name: 'American', value: americanCount, percent: americanPercent, color: '#3498db' },
    { name: 'British', value: britishCount, percent: britishPercent, color: '#e74c3c' },
    { name: 'Canadian', value: canadianCount, percent: canadianPercent, color: '#2ecc71' }
  ];

  // Process nationality evaluation performance data
  const nationalityPerformanceData = [
    { 
      name: 'American', 
      avgScore: evalData.filter(i => i.nationality === 'American').length > 0 
        ? Math.round(evalData.filter(i => i.nationality === 'American')
            .reduce((sum, item) => sum + item.score, 0) / evalData.filter(i => i.nationality === 'American').length) 
        : 0,
      count: americanCount,
      passing: evalData.filter(i => i.nationality === 'American' && i.passing).length,
      color: '#3498db'
    },
    { 
      name: 'British', 
      avgScore: evalData.filter(i => i.nationality === 'British').length > 0 
        ? Math.round(evalData.filter(i => i.nationality === 'British')
            .reduce((sum, item) => sum + item.score, 0) / evalData.filter(i => i.nationality === 'British').length) 
        : 0,
      count: britishCount,
      passing: evalData.filter(i => i.nationality === 'British' && i.passing).length,
      color: '#e74c3c'
    },
    { 
      name: 'Canadian', 
      avgScore: evalData.filter(i => i.nationality === 'Canadian').length > 0 
        ? Math.round(evalData.filter(i => i.nationality === 'Canadian')
            .reduce((sum, item) => sum + item.score, 0) / evalData.filter(i => i.nationality === 'Canadian').length) 
        : 0,
      count: canadianCount,
      passing: evalData.filter(i => i.nationality === 'Canadian' && i.passing).length,
      color: '#2ecc71'
    }
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
                <PieChartIcon size={20} />
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
                <PieChartIcon size={20} />
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
            <CardTitle className="text-sm font-medium text-gray-500">Nationality Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nationalityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {nationalityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, _, entry) => {
                    const percent = Math.round((Number(value) / schoolInstructors.length) * 100);
                    return [`${value} (${percent}%)`, entry.payload.name];
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#3498db] rounded-full mr-1"></div>
                <p className="text-xs text-gray-500">
                  {americanPercent}% American
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#e74c3c] rounded-full mr-1"></div>
                <p className="text-xs text-gray-500">
                  {britishPercent}% British
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#2ecc71] rounded-full mr-1"></div>
                <p className="text-xs text-gray-500">
                  {canadianPercent}% Canadian
                </p>
              </div>
            </div>
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
            <TabsTrigger value="nationality">Nationality Breakdown</TabsTrigger>
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

        <TabsContent value="nationality" className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>PowerBI Nationality Analysis</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Detailed breakdown of instructor nationalities and their evaluation performance
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Nationality Distribution</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={nationalityData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          paddingAngle={2}
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${percent}%`}
                          labelLine={false}
                        >
                          {nationalityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, _, entry) => [
                          `${value} instructors (${entry.payload.percent}%)`, 
                          entry.payload.name
                        ]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Performance by Nationality</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={nationalityPerformanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value, name) => {
                          return name === "avgScore" ? [`${value}%`, "Average Score"] : [value, "Count"];
                        }} />
                        <Legend />
                        <Bar 
                          dataKey="avgScore" 
                          name="Average Score" 
                          radius={[4, 4, 0, 0]}
                        >
                          {nationalityPerformanceData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.avgScore >= PASSING_SCORE ? "#10B981" : "#F59E0B"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Nationality Performance Metrics</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Number of Instructors</TableHead>
                      <TableHead>Distribution</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Passing Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nationalityPerformanceData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: data.color}}></div>
                            {data.name}
                          </div>
                        </TableCell>
                        <TableCell>{data.count}</TableCell>
                        <TableCell>
                          {Math.round((data.count / schoolInstructors.length) * 100)}%
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            data.avgScore >= PASSING_SCORE ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {data.avgScore}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {data.count > 0 ? Math.round((data.passing / data.count) * 100) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-center mt-8 mb-4">
                <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
                  <FileText size={16} /> Open in PowerBI Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffEvaluations;