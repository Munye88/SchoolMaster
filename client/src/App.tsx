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
import AuthPage from "./pages/auth-page";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";

// Management pages
import ManageSchools from "./pages/management/ManageSchools";
import ManageInstructors from "./pages/management/ManageInstructors";
import ManageStudents from "./pages/management/ManageStudents";
import ManageCourses from "./pages/management/ManageCourses";

function NavbarWithAuth() {
  const { user } = useAuth();
  
  // Don't show navbar on the auth page
  return user ? <BasicNavbar /> : null;
}

function Router() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <NavbarWithAuth />
      <div className="flex-1 overflow-auto">
        <Switch>
          {/* Auth route - public */}
          <Route path="/auth" component={AuthPage} />
          
          {/* Protected routes */}
          <ProtectedRoute path="/" component={Dashboard} />
          <ProtectedRoute path="/instructors" component={InstructorProfile} />
          <ProtectedRoute path="/instructors/:id" component={InstructorProfile} />
          <ProtectedRoute path="/courses" component={Courses} />
          <ProtectedRoute path="/students" component={Students} />
          <ProtectedRoute path="/test-tracker" component={TestTracker} />
          <ProtectedRoute path="/reports" component={Reports} />
          <ProtectedRoute path="/documents" component={Documents} />
          
          {/* Administration routes */}
          <ProtectedRoute path="/administration/company-policy" component={Administration} />
          <ProtectedRoute path="/administration/evaluation-guideline" component={Administration} />
          <ProtectedRoute path="/administration/employee-handbook" component={Administration} />
          <ProtectedRoute path="/administration/performance-policy" component={Administration} />
          <ProtectedRoute path="/administration/classroom-evaluation" component={Administration} />
          
          {/* Management routes */}
          <ProtectedRoute path="/management/schools" component={ManageSchools} />
          <ProtectedRoute path="/management/instructors" component={ManageInstructors} />
          <ProtectedRoute path="/management/students" component={ManageStudents} />
          <ProtectedRoute path="/management/courses" component={ManageCourses} />
          
          {/* School-specific document routes */}
          <ProtectedRoute path="/schools/:schoolCode/instructor-profiles" component={SchoolInstructorProfiles} />
          <ProtectedRoute path="/schools/:schoolCode/timetable" component={SchoolTimetable} />
          <ProtectedRoute path="/schools/:schoolCode/student-day-schedule" component={SchoolStudentDaySchedule} />
          <ProtectedRoute path="/schools/:schoolCode/yearly-schedule" component={SchoolYearlySchedule} />
          <ProtectedRoute path="/schools/:schoolCode/sop" component={SchoolSOP} />
          <ProtectedRoute path="/schools/:schoolCode/staff-evaluations" component={StaffEvaluations} />
          <ProtectedRoute path="/schools/:schoolCode/staff-attendance" component={StaffAttendance} />
          <ProtectedRoute path="/schools/:schoolCode/book-inventory" component={SchoolBookInventory} />
          <ProtectedRoute path="/schools/:schoolCode/staff-leave-tracker" component={StaffLeaveTracker} />
          
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
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;