import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Award, Star, Trophy, Medal, Calendar, CheckCircle, Target, Eye, User } from "lucide-react";

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
  hasData?: boolean;
}

// Instructor Details Dialog Component
function InstructorDetailsDialog({ instructor, quarter, year }: { instructor: RecognitionCandidate; quarter: string; year: string }) {
  const { data: instructorDetails, isLoading } = useQuery({
    queryKey: ['/api/recognition/instructor', instructor.id, quarter, year],
    queryFn: async () => {
      const response = await fetch(`/api/recognition/instructor/${instructor.id}?quarter=${quarter}&year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch instructor details');
      return response.json();
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-blue-600 hover:text-blue-800 font-semibold p-0 h-auto">
          {instructor.name}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-none">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-center">
            <User className="h-5 w-5" />
            {instructor.name} - {quarter} {year} Recognition Details
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="rounded-none border">
                <CardHeader className="pb-2 bg-gray-50">
                  <CardTitle className="text-sm text-gray-900 font-bold">Summary</CardTitle>
                </CardHeader>
                <CardContent className="bg-white py-2">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">School:</span>
                      <span className="font-semibold text-gray-900">{instructor.school}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Nationality:</span>
                      <span className="font-semibold text-gray-900">{instructor.nationality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Quarter:</span>
                      <span className="font-semibold text-gray-900">{quarter} {year}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-none border">
                <CardHeader className="pb-2 bg-gray-50">
                  <CardTitle className="text-sm text-gray-900 font-bold">Performance</CardTitle>
                </CardHeader>
                <CardContent className="bg-white py-2">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Attendance:</span>
                      <span className="font-bold text-blue-600">{instructorDetails?.summary?.attendanceScore || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Evaluation:</span>
                      <span className="font-bold text-green-600">{instructorDetails?.summary?.evaluationScore || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Days:</span>
                      <span className="font-bold text-gray-900">{instructorDetails?.summary?.totalDays || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Records */}
            <Card className="rounded-none border">
              <CardHeader className="bg-gray-50 py-2">
                <CardTitle className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Attendance Records
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white py-2">
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="text-center bg-green-50 p-2 rounded-none border border-green-200">
                    <div className="text-lg font-bold text-green-700">{instructorDetails?.summary?.totalPresent || 0}</div>
                    <div className="text-xs font-semibold text-green-600">Present</div>
                  </div>
                  <div className="text-center bg-red-50 p-2 rounded-none border border-red-200">
                    <div className="text-lg font-bold text-red-700">{instructorDetails?.summary?.totalAbsent || 0}</div>
                    <div className="text-xs font-semibold text-red-600">Absent</div>
                  </div>
                  <div className="text-center bg-yellow-50 p-2 rounded-none border border-yellow-200">
                    <div className="text-lg font-bold text-yellow-700">{instructorDetails?.summary?.totalLate || 0}</div>
                    <div className="text-xs font-semibold text-yellow-600">Late</div>
                  </div>
                  <div className="text-center bg-orange-50 p-2 rounded-none border border-orange-200">
                    <div className="text-lg font-bold text-orange-700">{instructorDetails?.summary?.totalSick || 0}</div>
                    <div className="text-xs font-semibold text-orange-600">Sick</div>
                  </div>
                </div>
                
                {instructorDetails?.attendanceRecords?.length > 0 && (
                  <div className="max-h-32 overflow-y-auto border border-gray-200">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-2 font-bold text-gray-900">Date</th>
                          <th className="text-left p-2 font-bold text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instructorDetails.attendanceRecords.map((record: any, index: number) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-2 text-gray-800 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                            <td className="p-2">
                              <Badge className={`rounded-none font-semibold text-xs ${
                                record.status === 'present' ? 'bg-green-600 text-white' :
                                record.status === 'absent' ? 'bg-red-600 text-white' :
                                record.status === 'late' ? 'bg-yellow-600 text-white' :
                                'bg-orange-600 text-white'
                              }`}>
                                {record.status.toUpperCase()}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evaluation Records */}
            <Card className="rounded-none border">
              <CardHeader className="bg-gray-50 py-2">
                <CardTitle className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <Star className="h-4 w-4 text-yellow-600" />
                  Evaluation Records
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white py-2">
                {instructorDetails?.evaluationRecords?.length > 0 ? (
                  <div className="max-h-32 overflow-y-auto border border-gray-200">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-2 font-bold text-gray-900">Date</th>
                          <th className="text-left p-2 font-bold text-gray-900">Score</th>
                          <th className="text-left p-2 font-bold text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instructorDetails.evaluationRecords.map((record: any, index: number) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-2 text-gray-800 font-medium">{new Date(record.evaluationDate).toLocaleDateString()}</td>
                            <td className="p-2 font-bold text-sm text-blue-600">{record.score}%</td>
                            <td className="p-2">
                              <Badge className={`rounded-none font-semibold text-xs ${
                                record.score >= 95 ? 'bg-green-600 text-white' :
                                record.score >= 85 ? 'bg-yellow-600 text-white' :
                                'bg-red-600 text-white'
                              }`}>
                                {record.score >= 95 ? 'EXCELLENT' :
                                 record.score >= 85 ? 'GOOD' : 'NEEDS IMPROVEMENT'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 border border-gray-200 rounded-none">
                    <div className="text-sm font-semibold text-gray-700">No evaluation records found</div>
                    <div className="text-xs text-gray-500 mt-1">No evaluations for this quarter.</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
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
    { value: "Q1", label: "Q1 (Jun-Aug)" },
    { value: "Q2", label: "Q2 (Sep-Nov)" },
    { value: "Q3", label: "Q3 (Dec-Feb)" },
    { value: "Q4", label: "Q4 (Mar-May)" }
  ];

  const years = ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];

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

      {/* No Data Message for Future Years */}
      {recognitionData && recognitionData.hasData === false && parseInt(selectedYear) > new Date().getFullYear() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-none p-6 mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">No Recognition Data Available</h3>
              <p className="text-yellow-700">
                No attendance or evaluation data has been recorded for {selectedQuarter} {selectedYear} yet. 
                Recognition candidates will appear here once data is available.
              </p>
            </div>
          </div>
        </div>
      )}

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
            {attendanceCandidates.length === 0 && recognitionData && recognitionData.hasData && (
              <p className="text-xs text-gray-500 mt-2">
                All instructors have at least one absent, late, or sick day this period
              </p>
            )}
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
                        <InstructorDetailsDialog instructor={candidate} quarter={selectedQuarter} year={selectedYear} />
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
                        <InstructorDetailsDialog instructor={candidate} quarter={selectedQuarter} year={selectedYear} />
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
                        <InstructorDetailsDialog instructor={candidate} quarter={selectedQuarter} year={selectedYear} />
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