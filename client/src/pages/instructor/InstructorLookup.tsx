import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Mail, Phone, MapPin, Award, Briefcase, Calendar as CalendarIcon, UserCheck, Star, FileText, CalendarDays, XIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

const InstructorLookup = () => {
  const { selectedSchool } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch all instructors
  const { data: instructors = [], isLoading: loadingInstructors } = useQuery<any[]>({
    queryKey: ['/api/instructors'],
    refetchOnWindowFocus: false,
  });

  // Fetch evaluations
  const { data: evaluations = [], isLoading: loadingEvaluations } = useQuery<any[]>({
    queryKey: ['/api/evaluations'],
    refetchOnWindowFocus: false,
    enabled: !!selectedInstructor,
  });

  // Fetch attendance
  const { data: attendance = [], isLoading: loadingAttendance } = useQuery<any[]>({
    queryKey: ['/api/staff-attendance', selectedInstructor?.schoolId],
    refetchOnWindowFocus: false,
    enabled: !!selectedInstructor,
  });

  // Fetch recognitions
  const { data: recognitions = [], isLoading: loadingRecognitions } = useQuery<any[]>({
    queryKey: ['/api/recognitions'],
    refetchOnWindowFocus: false,
    enabled: !!selectedInstructor,
  });
  
  // Fetch PTO balance data
  const { data: ptoBalances = [], isLoading: loadingPtoBalances } = useQuery<any[]>({
    queryKey: ['/api/pto-balance'],
    refetchOnWindowFocus: false,
    enabled: !!selectedInstructor,
  });
  
  // Fetch staff counseling records with proper error handling
  const { 
    data: staffCounselingRecords = [], 
    isLoading: loadingCounselingRecords,
    error: counselingError
  } = useQuery<any[]>({
    queryKey: [`/api/instructors/${selectedInstructor?.id}/staff-counseling`],
    refetchOnWindowFocus: false,
    enabled: !!selectedInstructor && !!selectedInstructor.id,
  });
  
  // Calculate PTO balance directly from staff leave data
  const calculatePtoData = (instructorId: number) => {
    const currentYear = new Date().getFullYear();
    
    // Get PTO leaves
    const instructorPtoLeaves = staffLeaves.filter(
      leave => leave.instructorId === instructorId && 
      new Date(leave.startDate).getFullYear() === currentYear &&
      leave.leaveType.toLowerCase() === 'pto' &&
      leave.status.toLowerCase() === 'approved'
    );
    
    // Get R&R leaves
    const instructorRRLeaves = staffLeaves.filter(
      leave => leave.instructorId === instructorId && 
      new Date(leave.startDate).getFullYear() === currentYear &&
      leave.leaveType.toLowerCase() === 'r&r' &&
      leave.status.toLowerCase() === 'approved'
    );
    
    const totalPtoDays = 21; // Default annual allowance
    const usedPtoDays = instructorPtoLeaves.reduce((total, leave) => total + leave.ptodays, 0);
    const usedRRDays = instructorRRLeaves.reduce((total, leave) => total + leave.rrdays, 0);
    
    // Combined used days (PTO + R&R)
    const totalUsedDays = usedPtoDays + usedRRDays;
    
    // Calculate remaining days after both PTO and R&R
    const remainingPtoDays = totalPtoDays - totalUsedDays;
    
    return {
      totalDays: totalPtoDays,
      usedDays: totalUsedDays, // Combined total of PTO + R&R days used
      hasRRTaken: instructorRRLeaves.length > 0, // Whether they've taken R&R leave
      remainingDays: Math.max(0, remainingPtoDays) // Ensure it doesn't go below 0
    };
  };
  
  // Fetch staff leave data
  const { data: staffLeaves = [], isLoading: loadingStaffLeaves } = useQuery<any[]>({
    queryKey: ['/api/staff-leave'],
    refetchOnWindowFocus: false,
    enabled: !!selectedInstructor,
  });

  // Filter instructors based on search query
  const filteredInstructors = searchQuery
    ? instructors.filter(
        instructor =>
          instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          instructor.nationality.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
    
  // Filter data for selected instructor
  const instructorEvaluations = evaluations.filter(
    e => selectedInstructor && e.instructorId === selectedInstructor.id
  );
  
  // Filter attendance data for selected instructor only
  const instructorAttendance = attendance.filter(
    a => selectedInstructor && a.instructorId === selectedInstructor.id
  );
  
  // Filter instructor recognitions
  const instructorRecognitions = recognitions.filter(
    r => selectedInstructor && r.instructorId === selectedInstructor.id
  );
  
  // Use staff counseling records as-is since they should already be filtered by instructor
  const instructorCounselingRecords = staffCounselingRecords;
  

  
  // Calculate average evaluation score
  const avgEvalScore = instructorEvaluations.length > 0
    ? Math.round(instructorEvaluations.reduce((sum, evalItem) => sum + evalItem.score, 0) / instructorEvaluations.length)
    : 0;
    
  // Calculate attendance rate
  const attendanceRate = instructorAttendance.length > 0
    ? Math.round((instructorAttendance.filter(a => a.status.toLowerCase() === "present").length / instructorAttendance.length) * 100)
    : 0;

  // Get instructor school name
  const getSchoolName = (schoolId: number) => {
    const schoolMap: Record<number, string> = {
      350: "NFS East",
      351: "KFNA",
      352: "NFS West"
    };
    return schoolMap[schoolId] || "Unknown School";
  };

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-[#0A2463] to-[#3E92CC] bg-clip-text text-transparent">
              Instructor Lookup
            </span>
          </h1>
          <p className="text-gray-500">Search for instructors and view complete information</p>
        </div>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Instructors</CardTitle>
          <CardDescription>Enter an instructor's name or nationality to begin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name or nationality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery("")}
              className="w-24"
            >
              Clear
            </Button>
          </div>

          {/* Search Results */}
          {searchQuery && filteredInstructors.length > 0 && (
            <div className="mt-4 border rounded-md divide-y max-h-60 overflow-y-auto">
              {filteredInstructors.map(instructor => (
                <div 
                  key={instructor.id}
                  className="p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedInstructor(instructor);
                    setSearchQuery("");
                  }}
                >
                  <Avatar className="h-12 w-12 border-2 border-blue-300 relative overflow-hidden">
                    {instructor.imageUrl ? (
                      <AvatarImage 
                        src={instructor.imageUrl} 
                        alt={instructor.name}
                        className="absolute object-cover"
                        style={{
                          objectPosition: "center center",
                          width: "calc(100% - 4px)",
                          height: "calc(100% - 4px)",
                          left: "2px",
                          top: "2px"
                        }}
                      />
                    ) : (
                      <AvatarFallback className="absolute" style={{
                        width: "calc(100% - 4px)",
                        height: "calc(100% - 4px)",
                        left: "2px",
                        top: "2px"
                      }}>
                        {instructor.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{instructor.name}</p>
                    <p className="text-sm text-gray-500">{instructor.nationality}</p>
                  </div>
                  <Badge variant="outline">{getSchoolName(instructor.schoolId)}</Badge>
                </div>
              ))}
            </div>
          )}

          {searchQuery && filteredInstructors.length === 0 && (
            <div className="mt-4 p-4 text-center border rounded-md bg-gray-50">
              <p className="text-gray-500">No instructors found matching "{searchQuery}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructor Details Section */}
      {selectedInstructor ? (
        <div className="space-y-6">
          {/* Instructor Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="h-28 w-28 border-4 border-blue-300 relative overflow-hidden">
                  {selectedInstructor.imageUrl ? (
                    <AvatarImage 
                      src={selectedInstructor.imageUrl} 
                      alt={selectedInstructor.name}
                      className="absolute object-cover"
                      style={{
                        objectPosition: "center center",
                        width: "calc(100% - 6px)",
                        height: "calc(100% - 6px)",
                        left: "3px",
                        top: "3px"
                      }}
                    />
                  ) : (
                    <AvatarFallback className="text-2xl absolute" style={{
                      width: "calc(100% - 6px)",
                      height: "calc(100% - 6px)",
                      left: "3px",
                      top: "3px"
                    }}>
                      {selectedInstructor.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{selectedInstructor.name}</h2>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300">
                      {selectedInstructor.nationality}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300">
                      {getSchoolName(selectedInstructor.schoolId)}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">
                      {selectedInstructor.credentials}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      <span>Joined: {selectedInstructor.startDate ? format(new Date(selectedInstructor.startDate), 'MMM dd, yyyy') : 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedInstructor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Compound: {selectedInstructor.compound}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Evaluation Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{avgEvalScore}%</div>
                  <div className={`p-2 rounded-full ${avgEvalScore >= 85 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    <Star className="h-5 w-5" />
                  </div>
                </div>
                <Progress value={avgEvalScore} className="h-2 mt-4" />
                <p className="text-xs text-gray-500 mt-2">
                  {instructorEvaluations.length} evaluations recorded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{attendanceRate}%</div>
                  <div className={`p-2 rounded-full ${attendanceRate >= 90 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    <UserCheck className="h-5 w-5" />
                  </div>
                </div>
                <Progress value={attendanceRate} className="h-2 mt-4" />
                <p className="text-xs text-gray-500 mt-2">
                  {instructorAttendance.filter(a => a.status.toLowerCase() === "present").length} of {instructorAttendance.length} days present
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recognition Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{instructorRecognitions.length}</div>
                  <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                    <Award className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 h-2"></div>
                <p className="text-xs text-gray-500 mt-2">
                  {instructorRecognitions.length > 0 
                    ? `Most recent: ${instructorRecognitions[0]?.awardTitle || 'Unknown Award'}`
                    : 'No recognitions yet'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="recognition">Recognition</TabsTrigger>
              <TabsTrigger value="pto">PTO Balance</TabsTrigger>
              <TabsTrigger value="counseling">Counseling</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Instructor Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-base font-medium text-gray-900">{selectedInstructor.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nationality</label>
                        <p className="text-base font-medium text-gray-900">{selectedInstructor.nationality}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone Number</label>
                        <p className="text-base font-medium text-gray-900">{selectedInstructor.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Accompanied Status</label>
                        <p className="text-base font-medium text-gray-900">{selectedInstructor.accompaniedStatus}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Compound</label>
                        <p className="text-base font-medium text-gray-900 break-words overflow-wrap-anywhere">{selectedInstructor.compound}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">School</label>
                        <p className="text-base font-medium text-gray-900">{getSchoolName(selectedInstructor.schoolId)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Role</label>
                        <p className="text-base font-medium text-gray-900">{selectedInstructor.role}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Credentials</label>
                        <p className="text-base font-medium text-gray-900">{selectedInstructor.credentials}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                        <p className="text-base font-medium text-gray-900">
                          {selectedInstructor.startDate ? format(new Date(selectedInstructor.startDate), 'MMMM dd, yyyy') : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Instructor ID</label>
                        <p className="text-base font-medium text-gray-900">{selectedInstructor.id}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Evaluations Tab */}
            <TabsContent value="evaluations">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-xl font-bold">Staff Evaluations</CardTitle>
                </CardHeader>
                <CardContent>
                  {instructorEvaluations.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => {
                          const quarterEval = instructorEvaluations.find(e => e.quarter === quarter);
                          const score = quarterEval?.score || 0;
                          return (
                            <Card key={quarter}>
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="text-xl font-bold mb-3 text-gray-900">{quarter}</div>
                                  <div className={`inline-flex items-center justify-center h-20 w-20 rounded-none text-2xl font-bold ${
                                    score >= 85 ? 'bg-green-100 text-green-800' : 
                                    score > 0 ? 'bg-red-100 text-red-800' : 
                                    'bg-gray-100 text-gray-500'
                                  }`}>
                                    {score > 0 ? `${score}%` : 'N/A'}
                                  </div>
                                  {quarterEval && (
                                    <div className="mt-3 text-sm text-gray-600 font-medium">
                                      {quarterEval.evaluationDate ? format(new Date(quarterEval.evaluationDate), 'MMM dd, yyyy') : 'Unknown date'}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      <div className="border rounded-none overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Quarter</th>
                              <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Score</th>
                              <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Type</th>
                              <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Feedback</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {instructorEvaluations.map(evaluation => (
                              <tr key={evaluation.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">{evaluation.quarter}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                                  {evaluation.evaluationDate ? format(new Date(evaluation.evaluationDate), 'MMM dd, yyyy') : 'Unknown date'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-none ${
                                    evaluation.score >= 85 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {evaluation.score}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                                  {evaluation.evaluationType ? 
                                    (evaluation.evaluationType.charAt(0).toUpperCase() + evaluation.evaluationType.slice(1)) 
                                    : 'Unknown'}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-gray-700 max-w-xs truncate">
                                  {evaluation.feedback || 'No feedback provided'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No evaluations</h3>
                      <p className="mt-1 text-sm text-gray-500">No evaluation records found for this instructor.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-xl font-bold">Staff Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  {instructorAttendance.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-xl font-bold mb-3 text-gray-900">Present Days</div>
                              <div className="text-4xl font-bold text-green-600">
                                {instructorAttendance.filter(a => a.status.toLowerCase() === "present").length}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-xl font-bold mb-3 text-gray-900">Absent Days</div>
                              <div className="text-4xl font-bold text-red-600">
                                {instructorAttendance.filter(a => a.status.toLowerCase() === "absent").length}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-xl font-bold mb-3 text-gray-900">Late Days</div>
                              <div className="text-4xl font-bold text-amber-600">
                                {instructorAttendance.filter(a => a.status.toLowerCase() === "late").length}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="border rounded-none overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Time In</th>
                              <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Time Out</th>
                              <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {instructorAttendance.slice(0, 10).map(record => (
                              <tr key={record.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-none ${
                                    record.status.toLowerCase() === 'present' ? 'bg-green-100 text-green-800' : 
                                    record.status.toLowerCase() === 'absent' ? 'bg-red-100 text-red-800' : 
                                    'bg-amber-100 text-amber-800'
                                  }`}>
                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                                  {record.timeIn || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                                  {record.timeOut || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 max-w-xs truncate">
                                  {record.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No attendance records</h3>
                      <p className="mt-1 text-sm text-gray-500">No attendance records found for this instructor.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recognition Tab */}
            <TabsContent value="recognition">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-xl font-bold">Instructor Recognition</CardTitle>
                </CardHeader>
                <CardContent>
                  {instructorRecognitions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {instructorRecognitions.map(recognition => (
                        <Card key={recognition.id}>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="flex justify-center mb-4">
                                <div className="h-16 w-16 rounded-none bg-blue-100 text-blue-600 flex items-center justify-center">
                                  <Award className="h-8 w-8" />
                                </div>
                              </div>
                              <h3 className="font-bold text-lg text-gray-900 mb-2">{recognition.awardTitle}</h3>
                              <p className="text-sm font-medium text-gray-600 mb-3">
                                Awarded on {recognition.awardDate ? format(new Date(recognition.awardDate), 'MMMM dd, yyyy') : 'Unknown date'}
                              </p>
                              <p className="text-sm text-gray-700 mb-4">{recognition.description}</p>
                              {recognition.certificateUrl && (
                                <Button variant="outline" className="rounded-none gap-2">
                                  <FileText className="h-4 w-4" />
                                  View Certificate
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Award className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No recognition awards</h3>
                      <p className="text-sm font-medium text-gray-600">This instructor hasn't received any recognition awards yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* PTO Balance Tab */}
            <TabsContent value="pto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold">PTO Balance</CardTitle>
                  <CardDescription className="text-sm font-medium">Leave history and remaining balance</CardDescription>
                  {selectedInstructor && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600">Current Year Balance</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {loadingStaffLeaves ? (
                          <Loader2 className="h-5 w-5 animate-spin inline" />
                        ) : (
                          calculatePtoData(selectedInstructor.id).remainingDays
                        )} days
                      </p>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {loadingPtoBalances || loadingStaffLeaves ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* PTO Summary Card */}
                      <Card className="shadow-sm">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-none">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">Total PTO Days</h3>
                              <p className="text-4xl font-bold text-blue-600">
                                {calculatePtoData(selectedInstructor.id).totalDays}
                              </p>
                            </div>
                            <div className="flex flex-col items-center p-6 bg-amber-50 rounded-none">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">Used Days</h3>
                              <p className="text-4xl font-bold text-amber-600">
                                {calculatePtoData(selectedInstructor.id).usedDays}
                              </p>
                              <div className="mt-3 text-sm">
                                <span className="font-bold">R&R Taken:</span> {calculatePtoData(selectedInstructor.id).hasRRTaken ? 
                                <Badge className="rounded-none bg-green-100 text-green-800">Yes</Badge> : 
                                <Badge className="rounded-none bg-gray-100 text-gray-800">No</Badge>}
                              </div>
                            </div>
                            <div className="flex flex-col items-center p-6 bg-green-50 rounded-none">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">Remaining Days</h3>
                              <p className="text-4xl font-bold text-green-600">
                                {calculatePtoData(selectedInstructor.id).remainingDays}
                              </p>
                              <div className="mt-3 text-sm font-medium text-gray-600">(After PTO & R&R)</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* PTO History Table */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Leave History</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {staffLeaves
                                .filter(leave => leave.instructorId === selectedInstructor.id)
                                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                                .map((leave, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                        leave.leaveType === 'PTO' 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : leave.leaveType === 'R&R' 
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {leave.leaveType}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm">
                                        {format(new Date(leave.startDate), 'MMM d, yyyy')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Return: {format(new Date(leave.returnDate), 'MMM d, yyyy')}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {leave.leaveType === 'PTO' ? (
                                        <span className="text-blue-600 font-semibold">{leave.ptodays}</span>
                                      ) : leave.leaveType === 'R&R' ? (
                                        <span className="text-green-600 font-semibold">{leave.rrdays}</span>
                                      ) : (
                                        <span className="text-amber-600 font-semibold">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {leave.destination}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                        leave.status === 'Approved' 
                                          ? 'bg-green-100 text-green-800' 
                                          : leave.status === 'Pending' 
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {leave.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                                
                              {staffLeaves.filter(leave => leave.instructorId === selectedInstructor?.id).length === 0 && (
                                <tr>
                                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No leave records found for this instructor
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Counseling Records Tab */}
            <TabsContent value="counseling">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold">Staff Counseling Records</CardTitle>
                  <CardDescription className="text-sm font-medium">Counseling records and disciplinary actions for {selectedInstructor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingCounselingRecords ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-yellow-50 p-6 rounded-none text-center">
                          <h3 className="text-lg font-bold text-yellow-800 mb-2">Verbal Counseling</h3>
                          <p className="text-4xl font-bold text-yellow-900">
                            {instructorCounselingRecords.filter(r => r?.counselingType?.toLowerCase?.().includes('verbal')).length}
                          </p>
                        </div>
                        <div className="bg-orange-50 p-6 rounded-none text-center">
                          <h3 className="text-lg font-bold text-orange-800 mb-2">Written Counseling</h3>
                          <p className="text-4xl font-bold text-orange-900">
                            {instructorCounselingRecords.filter(r => r?.counselingType?.toLowerCase?.().includes('written')).length}
                          </p>
                        </div>
                        <div className="bg-red-50 p-6 rounded-none text-center">
                          <h3 className="text-lg font-bold text-red-800 mb-2">Final Warning</h3>
                          <p className="text-4xl font-bold text-red-900">
                            {instructorCounselingRecords.filter(r => r?.counselingType?.toLowerCase?.().includes('final')).length}
                          </p>
                        </div>
                      </div>

                      {/* Counseling Records List */}
                      <h3 className="text-center text-lg font-bold mb-4">Counseling History</h3>
                      <div className="border rounded-none overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Type</th>
                              <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Comments</th>
                              <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Attachment</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {instructorCounselingRecords
                              .sort((a, b) => {
                                if (!a?.counselingDate) return 1;
                                if (!b?.counselingDate) return -1;
                                return new Date(b.counselingDate).getTime() - new Date(a.counselingDate).getTime();
                              })
                              .map((record, index) => (
                                <tr key={record.id || index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-3 py-1 text-sm font-bold rounded-none ${
                                      record?.counselingType?.toLowerCase?.().includes('verbal') 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : record?.counselingType?.toLowerCase?.().includes('written')
                                          ? 'bg-orange-100 text-orange-800'
                                          : 'bg-red-100 text-red-800'
                                    }`}>
                                      {record?.counselingType || 'Unknown'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                                    {record?.counselingDate ? format(new Date(record.counselingDate), 'MMM dd, yyyy') : 'Unknown date'}
                                  </td>
                                  <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 max-w-xs truncate">
                                    {record?.comments || 'No comments'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {record?.attachmentUrl ? (
                                      <a 
                                        href={record.attachmentUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-blue-600 hover:text-blue-800 font-bold"
                                      >
                                        View
                                      </a>
                                    ) : (
                                      <span className="text-gray-400 font-bold">None</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            {instructorCounselingRecords.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-lg font-bold text-gray-600">
                                  No counseling records found for instructor: {selectedInstructor?.name} (ID: {selectedInstructor?.id})
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">Search for an instructor</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Use the search box above to find an instructor and view their complete profile, evaluations, attendance, recognition, PTO balance, and counseling records.
          </p>
        </Card>
      )}
    </div>
  );
};

export default InstructorLookup;