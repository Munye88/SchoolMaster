import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Star, Trophy, Medal, Calendar, CheckCircle, Target } from "lucide-react";

interface RecognitionCandidate {
  id: number;
  name: string;
  school: string;
  nationality: string;
  attendanceScore: number;
  evaluationScore: number;
  totalAbsent: number;
  totalLate: number;
  totalSick: number;
  qualifiesForAttendance: boolean;
  qualifiesForEvaluation: boolean;
  qualifiesForBoth: boolean;
}

interface QuarterlyData {
  quarter: string;
  year: number;
  attendanceCandidates: RecognitionCandidate[];
  evaluationCandidates: RecognitionCandidate[];
  dualCandidates: RecognitionCandidate[];
}

export default function Recognition() {
  const [selectedQuarter, setSelectedQuarter] = useState("Q3");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedSchool, setSelectedSchool] = useState("all");

  const { data: recognitionData, isLoading } = useQuery<QuarterlyData>({
    queryKey: ['/api/recognition/quarterly', selectedQuarter, selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/recognition/quarterly?quarter=${selectedQuarter}&year=${selectedYear}`);
      if (!response.ok) throw new Error('Failed to fetch recognition data');
      return response.json();
    }
  });

  const { data: schools } = useQuery({
    queryKey: ['/api/schools'],
    queryFn: async () => {
      const response = await fetch('/api/schools');
      if (!response.ok) throw new Error('Failed to fetch schools');
      return response.json();
    }
  });

  const filterBySchool = (candidates: RecognitionCandidate[]) => {
    if (selectedSchool === "all") return candidates;
    return candidates.filter(candidate => candidate.school === selectedSchool);
  };

  const quarters = [
    { value: "Q1", label: "Q1 (Jan-Mar)" },
    { value: "Q2", label: "Q2 (Apr-Jun)" },
    { value: "Q3", label: "Q3 (Jul-Sep)" },
    { value: "Q4", label: "Q4 (Oct-Dec)" }
  ];

  const years = ["2024", "2025"];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recognition data...</p>
        </div>
      </div>
    );
  }

  const attendanceCandidates = recognitionData ? filterBySchool(recognitionData.attendanceCandidates) : [];
  const evaluationCandidates = recognitionData ? filterBySchool(recognitionData.evaluationCandidates) : [];
  const dualCandidates = recognitionData ? filterBySchool(recognitionData.dualCandidates) : [];

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900">Instructor Recognition Program</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Recognizing outstanding instructors for perfect attendance and exceptional evaluations across all schools
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-none shadow-sm border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder="Select quarter" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {quarters.map(quarter => (
                  <SelectItem key={quarter.value} value={quarter.value}>
                    {quarter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {years.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All Schools</SelectItem>
                {schools?.map((school: any) => (
                  <SelectItem key={school.id} value={school.name}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Recognition Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Perfect Attendance */}
        <Card className="rounded-none border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Perfect Attendance
            </CardTitle>
            <p className="text-sm text-gray-600">
              No absent, late, or sick days
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {attendanceCandidates.length}
            </div>
            <p className="text-sm text-gray-500">Qualified instructors</p>
          </CardContent>
        </Card>

        {/* Exceptional Evaluations */}
        <Card className="rounded-none border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Star className="h-5 w-5" />
              Exceptional Evaluations
            </CardTitle>
            <p className="text-sm text-gray-600">
              95% or above quarterly average
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {evaluationCandidates.length}
            </div>
            <p className="text-sm text-gray-500">Qualified instructors</p>
          </CardContent>
        </Card>

        {/* Dual Excellence */}
        <Card className="rounded-none border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Award className="h-5 w-5" />
              Dual Excellence
            </CardTitle>
            <p className="text-sm text-gray-600">
              Both attendance and evaluation criteria
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {dualCandidates.length}
            </div>
            <p className="text-sm text-gray-500">Elite instructors</p>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Lists */}
      <div className="space-y-8">
        {/* Dual Excellence Candidates */}
        {dualCandidates.length > 0 && (
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Award className="h-6 w-6" />
                Dual Excellence Award Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dualCandidates.map((candidate) => (
                  <div key={candidate.id} className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-none border border-yellow-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.school}</p>
                      </div>
                      <Badge className="bg-yellow-500 text-white rounded-none">
                        {candidate.nationality}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Perfect Attendance</span>
                      <span className="text-blue-600">{candidate.evaluationScore}% Evaluation</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Perfect Attendance Candidates */}
        {attendanceCandidates.length > 0 && (
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-6 w-6" />
                Perfect Attendance Award Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {attendanceCandidates.map((candidate) => (
                  <div key={candidate.id} className="bg-green-50 p-4 rounded-none border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.school}</p>
                      </div>
                      <Badge className="bg-green-500 text-white rounded-none">
                        {candidate.nationality}
                      </Badge>
                    </div>
                    <div className="text-sm text-green-600">
                      0 Absent • 0 Late • 0 Sick
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exceptional Evaluation Candidates */}
        {evaluationCandidates.length > 0 && (
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Star className="h-6 w-6" />
                Exceptional Evaluation Award Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evaluationCandidates.map((candidate) => (
                  <div key={candidate.id} className="bg-blue-50 p-4 rounded-none border border-blue-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.school}</p>
                      </div>
                      <Badge className="bg-blue-500 text-white rounded-none">
                        {candidate.nationality}
                      </Badge>
                    </div>
                    <div className="text-sm text-blue-600">
                      {candidate.evaluationScore}% Average Score
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {!isLoading && attendanceCandidates.length === 0 && evaluationCandidates.length === 0 && (
        <Card className="rounded-none">
          <CardContent className="text-center py-12">
            <Medal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recognition Candidates</h3>
            <p className="text-gray-600">
              No instructors met the recognition criteria for {selectedQuarter} {selectedYear}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}