import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import InstructorProfile from "@/pages/InstructorProfile";
import InstructorLookup from "@/pages/instructor/InstructorLookup";
import Courses from "@/pages/Courses";
import CourseDetails from "@/pages/CourseDetails";
import TestTracker from "@/pages/TestTracker";
import Reports from "@/pages/Reports";
import Documents from "@/pages/Documents";
import Administration from "@/pages/Administration";
import TrainingDevelopment from "@/pages/TrainingDevelopment";
import DLI from "@/pages/DLI";
import InstructorRecognition from "@/pages/InstructorRecognition";
import ActionLogPage from "@/pages/action-log";
import QuarterlyCheckins from "@/pages/QuarterlyCheckins";
import RecruitmentPage from "@/pages/recruitment";
import Sidebar from "@/components/layout/Sidebar";
import SchoolInstructorProfiles from "./pages/school/InstructorProfiles";
import SchoolTimetable from "./pages/school/Timetable";
import SchoolStudentDaySchedule from "./pages/school/StudentDaySchedule";
import SchoolYearlySchedule from "./pages/school/YearlySchedule";
import SchoolSOP from "./pages/school/SOP";
import StaffEvaluations from "./pages/school/StaffEvaluationsNew";
import StaffAttendance from "./pages/school/StaffAttendance";
import SchoolBookInventory from "./pages/school/BookInventory";
import StaffLeaveTracker from "./pages/school/StaffLeaveTracker";
import BookOrder from "./pages/dli/BookOrder";
import AlcptOrder from "./pages/dli/AlcptOrder";
import AnswerSheets from "./pages/dli/AnswerSheets";
import AuthPage from "./pages/auth-page";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";
import { AIChatbot } from "@/components/ai/AIChatbot";
import { SchoolProvider } from "@/hooks/useSchool";

// Admin pages
import StaffLeaveApproval from "./pages/administration/staff-leave";
import ManageDashboard from "./pages/administration/manage-dashboard";
import UserManagement from "./pages/administration/users";
import EventsPage from "./pages/events";

// Management pages
import ManageSchools from "./pages/management/ManageSchools";
import ManageInstructors from "./pages/management/ManageInstructorsNew";
import ManageStudents from "./pages/management/ManageStudents";
import ManageCourses from "./pages/management/ManageCoursesFixed";

function SidebarWithAuth() {
  const { user } = useAuth();
  
  // Don't show sidebar on the auth page
  return user ? <Sidebar /> : null;
}

function Router() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <SidebarWithAuth />
      <div className="flex-1 overflow-auto pl-0 lg:pl-56 pt-16">
        <Switch>
          {/* Auth route - public */}
          <Route path="/auth" component={AuthPage} />
          
          {/* Protected routes */}
          <ProtectedRoute path="/" component={Dashboard} />
          <ProtectedRoute path="/instructors" component={InstructorProfile} />
          <ProtectedRoute path="/instructors/:id" component={InstructorProfile} />
          <ProtectedRoute path="/instructor-lookup" component={InstructorLookup} />
          <ProtectedRoute path="/courses" component={Courses} />
          <ProtectedRoute path="/courses/:id" component={CourseDetails} />
          <ProtectedRoute path="/dli" component={DLI} />
          <ProtectedRoute path="/dli/book-order" component={BookOrder} />
          <ProtectedRoute path="/dli/alcpt-order" component={AlcptOrder} />
          <ProtectedRoute path="/dli/answer-sheets" component={AnswerSheets} />
          <ProtectedRoute path="/test-tracker" component={TestTracker} />
          <ProtectedRoute path="/reports" component={Reports} />
          <ProtectedRoute path="/documents" component={Documents} />
          <ProtectedRoute path="/action-log" component={ActionLogPage} />
          <ProtectedRoute path="/quarterly-checkins" component={QuarterlyCheckins} />
          <ProtectedRoute path="/recruitment" component={RecruitmentPage} />
          
          {/* Administration routes */}
          <ProtectedRoute path="/administration/company-policy" component={Administration} />
          <ProtectedRoute path="/administration/evaluation-guideline" component={Administration} />
          <ProtectedRoute path="/administration/instructor-performance-policy" component={Administration} />
          <ProtectedRoute path="/administration/employee-handbook" component={Administration} />
          <ProtectedRoute path="/administration/performance-policy" component={Administration} />
          <ProtectedRoute path="/administration/classroom-evaluation" component={Administration} />
          <ProtectedRoute path="/administration/instructor-recognition" component={InstructorRecognition} />
          <ProtectedRoute path="/administration/manage-dashboard" component={ManageDashboard} />
          <ProtectedRoute path="/administration/users" component={UserManagement} />
          <ProtectedRoute path="/events" component={EventsPage} />
          
          {/* Training & Development routes */}
          <ProtectedRoute path="/training-development" component={TrainingDevelopment} />
          <ProtectedRoute path="/training-development/leadership-skills" component={TrainingDevelopment} />
          <ProtectedRoute path="/training-development/communication-techniques" component={TrainingDevelopment} />
          <ProtectedRoute path="/training-development/conflict-resolution" component={TrainingDevelopment} />
          <ProtectedRoute path="/training-development/decision-making" component={TrainingDevelopment} />
          <ProtectedRoute path="/training-development/team-building" component={TrainingDevelopment} />
          
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
        <SchoolProvider>
          <Router />
          <div id="ai-chatbot-container" className="fixed bottom-6 right-6 z-[1000]">
            <AIChatbot />
          </div>
        </SchoolProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;