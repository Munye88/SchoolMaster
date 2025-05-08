import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter, 
  BarChart2, 
  PieChart, 
  LineChart, 
  Share2, 
  Users, 
  CheckCircle, 
  Award,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Plane,
  Clock,
  Check,
  X
} from "lucide-react";
import { PrintButton } from "@/components/ui/print-button";
import { useSchool } from "@/hooks/useSchool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { 
  BarChart, Bar, 
  LineChart as RechartsLineChart, Line, 
  PieChart as RechartsPieChart, Pie, Cell,
  AreaChart, Area,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { selectedSchool } = useSchool();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("month");
  const [reportType, setReportType] = useState("performance");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Mock dates for report range
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Helper function to go to previous month/period
  const goToPrevious = () => {
    if (timeRange === "month") {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else if (timeRange === "quarter") {
      const currentQuarter = Math.floor(selectedMonth / 3);
      if (currentQuarter === 0) {
        setSelectedMonth(9); // October of previous year
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth((currentQuarter - 1) * 3); // First month of previous quarter
      }
    } else if (timeRange === "year") {
      setSelectedYear(selectedYear - 1);
    }
    toast({
      title: "Date range updated",
      description: "The reports have been updated for the selected period.",
    });
  };
  
  // Helper function to go to next month/period
  const goToNext = () => {
    if (timeRange === "month") {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    } else if (timeRange === "quarter") {
      const currentQuarter = Math.floor(selectedMonth / 3);
      if (currentQuarter === 3) {
        setSelectedMonth(0); // January of next year
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth((currentQuarter + 1) * 3); // First month of next quarter
      }
    } else if (timeRange === "year") {
      setSelectedYear(selectedYear + 1);
    }
    toast({
      title: "Date range updated",
      description: "The reports have been updated for the selected period.",
    });
  };
  
  // Reset to current period when time range changes
  useEffect(() => {
    const currentDate = new Date();
    setSelectedMonth(currentDate.getMonth());
    setSelectedYear(currentDate.getFullYear());
  }, [timeRange]);
  
  // Sample data for charts
  const schoolPerformanceData = [
    { name: 'KNFA', alcpt: 85, bookTest: 83, ecl: 82, fill: '#0A2463' },
    { name: 'NFS East', alcpt: 87, bookTest: 84, ecl: 84, fill: '#4CB944' },
    { name: 'NFS West', alcpt: 83, bookTest: 80, ecl: 81, fill: '#FF8811' }
  ];
  
  const courseCompletionData = [
    { name: 'Completed', value: 25.0, fill: '#4CB944' },
    { name: 'In Progress', value: 75.0, fill: '#FF8811' },
    { name: 'Not Started', value: 0.0, fill: '#E63946' }
  ];
  
  const monthlyPerformanceData = [
    { month: 'Jan', alcpt: 79, bookTest: 78, ecl: 77 },
    { month: 'Feb', alcpt: 80, bookTest: 79, ecl: 78 },
    { month: 'Mar', alcpt: 82, bookTest: 80, ecl: 79 },
    { month: 'Apr', alcpt: 83, bookTest: 81, ecl: 80 },
    { month: 'May', alcpt: 84, bookTest: 82, ecl: 80 },
    { month: 'Jun', alcpt: 84, bookTest: 82, ecl: 81 },
    { month: 'Jul', alcpt: 85, bookTest: 83, ecl: 81 },
    { month: 'Aug', alcpt: 86, bookTest: 83, ecl: 82 },
    { month: 'Sep', alcpt: 85, bookTest: 83, ecl: 82 },
    { month: 'Oct', alcpt: 84, bookTest: 82, ecl: 81 },
    { month: 'Nov', alcpt: 85, bookTest: 83, ecl: 82 },
    { month: 'Dec', alcpt: 86, bookTest: 84, ecl: 83 }
  ];
  
  const instructorEvaluationData = [
    { score: '95%+', count: 5, fill: '#4CB944' },
    { score: '90-94%', count: 5, fill: '#85C88A' },
    { score: '85-89%', count: 17, fill: '#FFB84C' },
    { score: '80-84%', count: 19, fill: '#F16767' },
    { score: '<80%', count: 14, fill: '#E63946' }
  ];
  
  const attendanceData = [
    { month: 'Jan', knfa: 95, nfsEast: 93, nfsWest: 91 },
    { month: 'Feb', knfa: 94, nfsEast: 92, nfsWest: 90 },
    { month: 'Mar', knfa: 96, nfsEast: 94, nfsWest: 93 },
    { month: 'Apr', knfa: 95, nfsEast: 95, nfsWest: 92 },
    { month: 'May', knfa: 93, nfsEast: 96, nfsWest: 90 },
    { month: 'Jun', knfa: 94, nfsEast: 93, nfsWest: 91 },
    { month: 'Jul', knfa: 96, nfsEast: 95, nfsWest: 92 },
    { month: 'Aug', knfa: 97, nfsEast: 94, nfsWest: 93 },
    { month: 'Sep', knfa: 96, nfsEast: 93, nfsWest: 94 },
    { month: 'Oct', knfa: 95, nfsEast: 92, nfsWest: 92 },
    { month: 'Nov', knfa: 94, nfsEast: 94, nfsWest: 93 },
    { month: 'Dec', knfa: 95, nfsEast: 96, nfsWest: 94 }
  ];
  
  // Staff leave data - separated PTO and R&R into distinct categories
  const leaveTypeData = [
    { name: 'PTO', value: 28, fill: '#0A2463' },
    { name: 'R&R', value: 20, fill: '#3B82F6' },
    { name: 'Paternity', value: 12, fill: '#4CB944' },
    { name: 'Bereavement', value: 8, fill: '#FF8811' },
    { name: 'Negative PTO', value: 4, fill: '#E63946' }
  ];
  
  const leaveBySchoolData = [
    { name: 'KNFA', pto: 10, rr: 6, paternity: 4, bereavement: 3, negativePto: 1 },
    { name: 'NFS East', pto: 8, rr: 6, paternity: 5, bereavement: 2, negativePto: 1 },
    { name: 'NFS West', pto: 10, rr: 8, paternity: 3, bereavement: 3, negativePto: 2 }
  ];
  
  const leaveMonthlyTrendsData = [
    { month: 'Jan', count: 4 },
    { month: 'Feb', count: 6 },
    { month: 'Mar', count: 8 },
    { month: 'Apr', count: 5 },
    { month: 'May', count: 7 },
    { month: 'Jun', count: 12 },
    { month: 'Jul', count: 9 },
    { month: 'Aug', count: 6 },
    { month: 'Sep', count: 5 },
    { month: 'Oct', count: 7 },
    { month: 'Nov', count: 8 },
    { month: 'Dec', count: 15 }
  ];
  
  const leaveDurationData = [
    { duration: '1-3 days', count: 28, fill: '#63CAFF' },
    { duration: '4-7 days', count: 32, fill: '#0A2463' },
    { duration: '8-14 days', count: 10, fill: '#4CB944' },
    { duration: '15+ days', count: 2, fill: '#FF8811' }
  ];

  return (
    <main id="reportsContent" className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0A2463] to-blue-600 bg-clip-text text-transparent">
            {selectedSchool 
              ? `${selectedSchool.name} Reports` 
              : 'Analytics & Reports'}
          </h1>
          <p className="text-gray-600 mt-1 font-medium">Track performance and view detailed analytics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-36 border-blue-200 focus:ring-blue-400 shadow-sm">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                <Filter className="mr-2 h-4 w-4" /> Filters {activeFilters.length > 0 && <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilters.length}</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Reports</DialogTitle>
                <DialogDescription>
                  Select filters to apply to your reports
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Schools</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="kfna" checked={activeFilters.includes('KFNA')} onCheckedChange={(checked) => {
                        if (checked) {
                          setActiveFilters([...activeFilters, 'KFNA']);
                        } else {
                          setActiveFilters(activeFilters.filter(f => f !== 'KFNA'));
                        }
                      }} />
                      <Label htmlFor="kfna">KFNA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="nfsEast" checked={activeFilters.includes('NFS East')} onCheckedChange={(checked) => {
                        if (checked) {
                          setActiveFilters([...activeFilters, 'NFS East']);
                        } else {
                          setActiveFilters(activeFilters.filter(f => f !== 'NFS East'));
                        }
                      }} />
                      <Label htmlFor="nfsEast">NFS East</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="nfsWest" checked={activeFilters.includes('NFS West')} onCheckedChange={(checked) => {
                        if (checked) {
                          setActiveFilters([...activeFilters, 'NFS West']);
                        } else {
                          setActiveFilters(activeFilters.filter(f => f !== 'NFS West'));
                        }
                      }} />
                      <Label htmlFor="nfsWest">NFS West</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Test Types</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alcpt" checked={activeFilters.includes('ALCPT')} onCheckedChange={(checked) => {
                        if (checked) {
                          setActiveFilters([...activeFilters, 'ALCPT']);
                        } else {
                          setActiveFilters(activeFilters.filter(f => f !== 'ALCPT'));
                        }
                      }} />
                      <Label htmlFor="alcpt">ALCPT</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ecl" checked={activeFilters.includes('ECL')} onCheckedChange={(checked) => {
                        if (checked) {
                          setActiveFilters([...activeFilters, 'ECL']);
                        } else {
                          setActiveFilters(activeFilters.filter(f => f !== 'ECL'));
                        }
                      }} />
                      <Label htmlFor="ecl">ECL</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bookTest" checked={activeFilters.includes('Book Test')} onCheckedChange={(checked) => {
                        if (checked) {
                          setActiveFilters([...activeFilters, 'Book Test']);
                        } else {
                          setActiveFilters(activeFilters.filter(f => f !== 'Book Test'));
                        }
                      }} />
                      <Label htmlFor="bookTest">Book Test</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="opi" checked={activeFilters.includes('OPI')} onCheckedChange={(checked) => {
                        if (checked) {
                          setActiveFilters([...activeFilters, 'OPI']);
                        } else {
                          setActiveFilters(activeFilters.filter(f => f !== 'OPI'));
                        }
                      }} />
                      <Label htmlFor="opi">OPI</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={() => setActiveFilters([])}>
                  <X className="h-4 w-4 mr-2" /> Reset Filters
                </Button>
                <Button type="submit" onClick={() => {
                  setShowFilters(false);
                  toast({
                    title: "Filters applied",
                    description: `${activeFilters.length} filter${activeFilters.length !== 1 ? 's' : ''} applied to reports.`,
                  });
                }}>
                  <Check className="h-4 w-4 mr-2" /> Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all duration-300" onClick={() => {
            toast({
              title: "Report exported",
              description: "Your report has been downloaded successfully.",
            });
          }}>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium">
            {timeRange === "month" && `${months[selectedMonth]} ${selectedYear}`}
            {timeRange === "quarter" && `Q${Math.floor(selectedMonth / 3) + 1} ${selectedYear}`}
            {timeRange === "year" && `${selectedYear}`}
            {timeRange === "week" && `Week of ${new Date(selectedYear, selectedMonth, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            {timeRange === "custom" && "Custom Date Range"}
          </div>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <PrintButton contentId="reportsContent" />
          <Button variant="outline" size="sm" onClick={() => {
            const today = new Date();
            setSelectedMonth(today.getMonth());
            setSelectedYear(today.getFullYear());
            toast({
              title: "Reset to current period",
              description: "Reports have been updated to show the current period.",
            });
          }}>
            <Calendar className="mr-2 h-4 w-4" /> Reset Date
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-md border-blue-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-700">Total Students</CardTitle>
              <CardDescription className="text-xs text-gray-500">Across all schools</CardDescription>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-[#0A2463]">489</div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-500">+12% </span>
              <span className="text-xs text-gray-500 ml-1">since last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-green-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-green-50 to-white border-b border-green-100">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-700">Course Completion Rate</CardTitle>
              <CardDescription className="text-xs text-gray-500">Average across programs</CardDescription>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-700">25.0%</div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-500">+0.0% </span>
              <span className="text-xs text-gray-500 ml-1">since last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-amber-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-700">Average Test Score</CardTitle>
              <CardDescription className="text-xs text-gray-500">All test types</CardDescription>
            </div>
            <div className="p-2 bg-amber-100 rounded-full">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-700">81.5</div>
            <div className="flex items-center mt-1">
              <ArrowDownRight className="h-3 w-3 text-amber-500 mr-1" />
              <span className="text-xs font-medium text-amber-500">-1.3% </span>
              <span className="text-xs text-gray-500 ml-1">since last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="performance" className="mb-6" onValueChange={setReportType}>
        <TabsList className="mb-6 bg-blue-50 p-1 rounded-lg border border-blue-100 shadow-sm">
          <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm" value="performance">
            <BarChart2 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm" value="attendance">
            <Users className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm" value="evaluations">
            <Award className="h-4 w-4 mr-2" />
            Staff Evaluations
          </TabsTrigger>
          <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm" value="staffLeave">
            <Plane className="h-4 w-4 mr-2" />
            Staff Leave
          </TabsTrigger>
          <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm" value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <BarChart2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#0A2463]">Student Performance by School</CardTitle>
                      <CardDescription>
                        Average test scores across different schools
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>KNFA</DropdownMenuItem>
                      <DropdownMenuItem>NFS East</DropdownMenuItem>
                      <DropdownMenuItem>NFS West</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={schoolPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[70, 90]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value}%`, '']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="alcpt" name="ALCPT" fill="#0A2463" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="bookTest" name="Book Test" fill="#4CB944" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ecl" name="ECL" fill="#FF8811" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <PieChart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-green-800">Course Completion Rate</CardTitle>
                      <CardDescription>
                        Percentage of students completing courses on time
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-900 hover:bg-green-50">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-900 hover:bg-green-50">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-green-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-green-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                      <Pie
                        data={courseCompletionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {courseCompletionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-6">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <LineChart className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-amber-800">Performance Trends Over Time</CardTitle>
                    <CardDescription>
                      Track test scores and performance metrics over time
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-amber-200 hover:bg-amber-50 text-amber-700">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80 bg-gradient-to-b from-amber-50 to-white py-3 px-1">
              <div className="w-full h-full rounded-lg bg-white shadow-inner border border-amber-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={monthlyPerformanceData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[70, 90]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value}%`, '']} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="alcpt"
                      name="ALCPT"
                      stroke="#0A2463"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bookTest"
                      name="Book Test"
                      stroke="#4CB944"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ecl"
                      name="ECL"
                      stroke="#FF8811"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#0A2463]">Student Attendance Reports</CardTitle>
                    <CardDescription>
                      Track student attendance across all courses and schools
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 text-blue-700">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
              <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={attendanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[85, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value}%`, '']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="knfa" 
                      name="KNFA" 
                      stroke="#0A2463" 
                      fill="#0A2463" 
                      fillOpacity={0.3} 
                      activeDot={{ r: 6 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="nfsEast" 
                      name="NFS East" 
                      stroke="#4CB944" 
                      fill="#4CB944" 
                      fillOpacity={0.3} 
                      activeDot={{ r: 6 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="nfsWest" 
                      name="NFS West" 
                      stroke="#FF8811" 
                      fill="#FF8811" 
                      fillOpacity={0.3} 
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="evaluations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Award className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-purple-900">Staff Evaluation by Quarter</CardTitle>
                      <CardDescription>
                        Track instructor evaluations and performance reviews
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Q1 2025</DropdownMenuItem>
                      <DropdownMenuItem>Q2 2025</DropdownMenuItem>
                      <DropdownMenuItem>Q3 2025</DropdownMenuItem>
                      <DropdownMenuItem>Q4 2025</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-purple-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-purple-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={instructorEvaluationData}
                      layout="vertical"
                      margin={{ top: 20, right: 50, left: 80, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                      <XAxis type="number" domain={[0, 25]} />
                      <YAxis 
                        type="category" 
                        dataKey="score" 
                        tick={{ fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value} instructors`, '']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar 
                        dataKey="count" 
                        name="Instructor Count" 
                        radius={[0, 4, 4, 0]} 
                      >
                        {instructorEvaluationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-white border-b border-rose-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-100 rounded-full">
                      <PieChart className="h-4 w-4 text-rose-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-rose-900">Evaluation Distribution</CardTitle>
                      <CardDescription>
                        Score distribution across all instructors
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-rose-700 hover:text-rose-900 hover:bg-rose-50">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-rose-700 hover:text-rose-900 hover:bg-rose-50">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-rose-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-rose-100 p-4">
                  <div className="h-full flex flex-col">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={instructorEvaluationData}
                            cx="50%"
                            cy="40%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {instructorEvaluationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value} instructors`, '']} 
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {instructorEvaluationData.map((entry, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="flex items-center mb-1">
                            <div 
                              className="h-3 w-3 rounded-full mr-1" 
                              style={{ backgroundColor: entry.fill }}
                            />
                            <span className="text-xs font-medium">{entry.score}</span>
                          </div>
                          <span className="text-xs font-bold">{entry.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="staffLeave">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Plane className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#0A2463]">Leave Types Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of leave requests by category
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>All Schools</DropdownMenuItem>
                      <DropdownMenuItem>KNFA</DropdownMenuItem>
                      <DropdownMenuItem>NFS East</DropdownMenuItem>
                      <DropdownMenuItem>NFS West</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie
                        data={leaveTypeData}
                        cx="50%"
                        cy="45%"
                        outerRadius={80}
                        innerRadius={30}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        stroke="#fff"
                        strokeWidth={2}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        labelLine={false}
                      >
                        {leaveTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Legend 
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        formatter={(value) => {
                          const match = leaveTypeData.find(item => item.name === value);
                          return `${value}: ${match?.value} requests`;
                        }}
                        wrapperStyle={{
                          paddingTop: '20px',
                          textTransform: 'capitalize'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-green-800">Leave Duration Distribution</CardTitle>
                      <CardDescription>
                        Analysis of leave request durations
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-900 hover:bg-green-50">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-900 hover:bg-green-50">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-green-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-green-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={leaveDurationData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="duration" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value} requests`, '']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="count" name="Number of Requests" radius={[4, 4, 0, 0]}>
                        {leaveDurationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-6">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <LineChart className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-amber-800">Monthly Leave Trends</CardTitle>
                    <CardDescription>
                      Track staff leave requests throughout the year
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-amber-200 hover:bg-amber-50 text-amber-700">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80 bg-gradient-to-b from-amber-50 to-white py-3 px-1">
              <div className="w-full h-full rounded-lg bg-white shadow-inner border border-amber-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={leaveMonthlyTrendsData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value} requests`, '']} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Leave Requests"
                      stroke="#FF8811"
                      fill="#FF8811"
                      fillOpacity={0.3}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <BarChart2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#0A2463]">Leave by School & Type</CardTitle>
                    <CardDescription>
                      Compare leave distribution across schools
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 text-blue-700">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
              <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leaveBySchoolData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value} requests`, '']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="pto" name="PTO" fill="#0A2463" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rr" name="R&R" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="paternity" name="Paternity" fill="#4CB944" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="bereavement" name="Bereavement" fill="#FF8811" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="negativePto" name="Negative PTO" fill="#E63946" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-6">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-indigo-900">Long-term Performance Trends</CardTitle>
                    <CardDescription>
                      Track year-over-year metrics and enrollment trends
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 text-indigo-700">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80 bg-gradient-to-b from-indigo-50 to-white py-3 px-1">
              <div className="w-full h-full rounded-lg bg-white shadow-inner border border-indigo-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={monthlyPerformanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[70, 90]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value}%`, '']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="alcpt" 
                      name="ALCPT" 
                      stroke="#0A2463" 
                      fill="#0A2463" 
                      fillOpacity={0.1}
                    />
                    <Bar 
                      dataKey="bookTest" 
                      name="Book Test" 
                      barSize={20} 
                      fill="#4CB944"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="ecl"
                      name="ECL"
                      stroke="#FF8811"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#0A2463]">Report Summary</CardTitle>
                <CardDescription>
                  {reportType === "performance" && "Key insights from the performance report"}
                  {reportType === "attendance" && "Key insights from the attendance report"}
                  {reportType === "evaluations" && "Key insights from the staff evaluations"}
                  {reportType === "staffLeave" && "Key insights from the staff leave data"}
                  {reportType === "trends" && "Key insights from the trends analysis"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-green-800 font-medium">
                  {reportType === "performance" && "Overall performance has improved by 12% since last quarter."}
                  {reportType === "attendance" && "Attendance rate is 96%, which is above the target of 90%."}
                  {reportType === "evaluations" && "85% of instructors received satisfactory or above ratings."}
                  {reportType === "staffLeave" && "Leave types now clearly separated with PTO and R&R shown as distinct categories."}
                  {reportType === "trends" && "Steady improvement in test scores over the past 6 months."}
                </span>
              </li>
              <li className="flex items-start bg-amber-50 p-3 rounded-lg border border-amber-100">
                <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <span className="text-amber-800 font-medium">
                  {reportType === "performance" && "NFS East shows the highest improvement in test scores."}
                  {reportType === "attendance" && "Technical Training courses have the lowest attendance rate."}
                  {reportType === "evaluations" && "Quarterly evaluations are completed for 95% of staff."}
                  {reportType === "staffLeave" && "PTO (28) and R&R (20) make up 67% of all leave requests."}
                  {reportType === "trends" && "Course enrollment has increased by 23% year over year."}
                </span>
              </li>
              <li className="flex items-start bg-red-50 p-3 rounded-lg border border-red-100">
                <div className="h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <span className="text-red-800 font-medium">
                  {reportType === "performance" && "Technical Training course pass rates need improvement."}
                  {reportType === "attendance" && "Action needed for students with attendance below 80%."}
                  {reportType === "evaluations" && "3 instructors require performance improvement plans."}
                  {reportType === "staffLeave" && "Negative PTO requests increased by 33% since last quarter."}
                  {reportType === "trends" && "Aviation course enrollment has declined in Q3."}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-purple-900">Recommendations</CardTitle>
                <CardDescription>
                  Strategic actions based on report insights
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100">
                <div className="h-6 w-6 rounded-full bg-[#0A2463] text-white flex items-center justify-center mr-3 mt-0.5 shadow-md">1</div>
                <span className="text-blue-900 font-medium">
                  {reportType === "performance" && "Schedule additional support sessions for Technical Training courses."}
                  {reportType === "attendance" && "Implement attendance incentives for low attendance courses."}
                  {reportType === "evaluations" && "Conduct focused training for instructors needing improvement."}
                  {reportType === "staffLeave" && "Optimize staffing levels during December and June peak leave periods."}
                  {reportType === "trends" && "Revise Aviation course curriculum to increase enrollment."}
                </span>
              </li>
              <li className="flex items-start bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100">
                <div className="h-6 w-6 rounded-full bg-[#0A2463] text-white flex items-center justify-center mr-3 mt-0.5 shadow-md">2</div>
                <span className="text-blue-900 font-medium">
                  {reportType === "performance" && "Recognize and reward instructors with highest performance improvements."}
                  {reportType === "attendance" && "Follow up with students having attendance below threshold."}
                  {reportType === "evaluations" && "Establish peer mentoring program for new instructors."}
                  {reportType === "staffLeave" && "Implement better tracking system for PTO and R&R categories."}
                  {reportType === "trends" && "Expand successful Language Training course offerings."}
                </span>
              </li>
              <li className="flex items-start bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100">
                <div className="h-6 w-6 rounded-full bg-[#0A2463] text-white flex items-center justify-center mr-3 mt-0.5 shadow-md">3</div>
                <span className="text-blue-900 font-medium">
                  {reportType === "performance" && "Share best practices from NFS East with other schools."}
                  {reportType === "attendance" && "Review scheduling for courses with attendance issues."}
                  {reportType === "evaluations" && "Update evaluation criteria for next quarter based on feedback."}
                  {reportType === "staffLeave" && "Monitor and reduce the increasing trend of Negative PTO requests."}
                  {reportType === "trends" && "Implement new tracking metrics for course effectiveness."}
                </span>
              </li>
            </ul>
            
            <Button className="w-full mt-6 bg-[#0A2463] hover:bg-[#071A4A] shadow-md hover:shadow-lg transition-all duration-300">
              <FileText className="h-4 w-4 mr-2" /> Generate Detailed Action Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Reports;
