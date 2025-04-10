import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import InstructorProfile from "@/pages/InstructorProfile";
import Courses from "@/pages/Courses";
import Students from "@/pages/Students";
import TestTracker from "@/pages/TestTracker";
import Reports from "@/pages/Reports";
import Documents from "@/pages/Documents";
import Administration from "@/pages/Administration";
import BasicNavbar from "@/components/layout/BasicNavbar";
import SchoolInstructorProfiles from "./pages/school/InstructorProfiles";
import SchoolTimetable from "./pages/school/Timetable";
import SchoolStudentDaySchedule from "./pages/school/StudentDaySchedule";
import SchoolYearlySchedule from "./pages/school/YearlySchedule";
import SchoolSOP from "./pages/school/SOP";
import StaffEvaluations from "./pages/school/StaffEvaluations";
import StaffAttendance from "./pages/school/StaffAttendance";
import SchoolBookInventory from "./pages/school/BookInventory";
import StaffLeaveTracker from "./pages/school/StaffLeaveTracker";

function Router() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <BasicNavbar />
      <div className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/instructors" component={InstructorProfile} />
          <Route path="/instructors/:id" component={InstructorProfile} />
          <Route path="/courses" component={Courses} />
          <Route path="/students" component={Students} />
          <Route path="/test-tracker" component={TestTracker} />
          <Route path="/reports" component={Reports} />
          <Route path="/documents" component={Documents} />
          
          {/* Administration routes */}
          <Route path="/administration/company-policy" component={Administration} />
          <Route path="/administration/evaluation-guideline" component={Administration} />
          <Route path="/administration/employee-handbook" component={Administration} />
          <Route path="/administration/performance-policy" component={Administration} />
          <Route path="/administration/classroom-evaluation" component={Administration} />
          
          {/* School-specific document routes */}
          <Route path="/schools/:schoolCode/instructor-profiles" component={SchoolInstructorProfiles} />
          <Route path="/schools/:schoolCode/timetable" component={SchoolTimetable} />
          <Route path="/schools/:schoolCode/student-day-schedule" component={SchoolStudentDaySchedule} />
          <Route path="/schools/:schoolCode/yearly-schedule" component={SchoolYearlySchedule} />
          <Route path="/schools/:schoolCode/sop" component={SchoolSOP} />
          <Route path="/schools/:schoolCode/staff-evaluations" component={StaffEvaluations} />
          <Route path="/schools/:schoolCode/staff-attendance" component={StaffAttendance} />
          <Route path="/schools/:schoolCode/book-inventory" component={SchoolBookInventory} />
          <Route path="/schools/:schoolCode/staff-leave-tracker" component={StaffLeaveTracker} />
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;