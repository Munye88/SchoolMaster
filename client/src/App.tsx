import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import InstructorLookup from "@/pages/instructor/InstructorLookup";
import NewInstructorProfile from "@/pages/instructor/InstructorProfile";
import Courses from "@/pages/Courses";
import CourseDetails from "@/pages/CourseDetails";
import TestTrackerProfessionalPage from "@/pages/TestTrackerProfessionalPage";
import ReportsEnhanced from "@/pages/ReportsEnhanced";
import ReportsSimple from "@/pages/ReportsSimple";
import Documents from "@/pages/Documents";
import Recognition from "@/pages/Recognition";
import Administration from "@/pages/Administration";
import TrainingDevelopment from "@/pages/TrainingDevelopment";
import DLI from "@/pages/DLI";
import InstructorRecognition from "@/pages/InstructorRecognition";
import ActionLogPage from "@/pages/action-log";
import QuarterlyCheckins from "@/pages/QuarterlyCheckins";
import RecruitmentPage from "@/pages/recruitment";
import TopNavigation from "./components/layout/TopNavigation";
import SchoolInstructorProfiles from "./pages/school/InstructorProfiles";
import SchoolTimetable from "./pages/school/Timetable";
import SchoolStudentDaySchedule from "./pages/school/StudentDaySchedule";
import SchoolYearlySchedule from "./pages/school/YearlySchedule";
import SchoolSOP from "./pages/school/SOP";
import StaffEvaluations from "./pages/school/StaffEvaluationsComplete";
import StaffAttendance from "./pages/school/StaffAttendanceEnhanced";
import StaffManagement from "./pages/school/StaffManagement";
import SchoolBookInventory from "./pages/school/BookInventory";
import StaffLeaveTracker from "./pages/school/StaffLeaveTracker";
import StaffCounseling from "./pages/school/StaffCounseling";
import DocumentManagement from "./pages/school/DocumentManagement";
import BookOrder from "./pages/dli/BookOrder";
import AlcptOrder from "./pages/dli/AlcptOrder";
import AnswerSheets from "./pages/dli/AnswerSheets";
import AuthPage from "./pages/auth-page";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";
import { SchoolProvider } from "@/hooks/useSchool";
import { AssistantDialog } from "@/components/assistant/AssistantDialog";

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
import ScheduleManager from "./pages/admin/ScheduleManager";
import DocumentManager from "./pages/administration/DocumentManager";
import AccessRequests from "./pages/admin/AccessRequests";

import TestTrackerEnhanced from "./pages/test-tracker/TestTrackerEnhanced";
import SchoolHome from "./pages/schools/SchoolHome";
import EmployeeHandbook from "./pages/administration/EmployeeHandbook";

function NavigationWithAuth() {
  const { user } = useAuth();

  return user ? <TopNavigation /> : null;
}

function Router() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <NavigationWithAuth />
      <div className="flex-1 overflow-auto">
        <Switch>
          {/* Auth route - public */}
          <Route path="/auth" component={AuthPage} />

          {/* Moon's Assistant has been removed */}

          {/* Protected routes */}
          <ProtectedRoute path="/" component={Dashboard} />
          <ProtectedRoute path="/instructors" component={NewInstructorProfile} />
          <ProtectedRoute
            path="/instructors/:id"
            component={NewInstructorProfile}
          />
          <ProtectedRoute
            path="/instructor-lookup"
            component={InstructorLookup}
          />
          <ProtectedRoute path="/courses" component={Courses} />
          <ProtectedRoute path="/courses/:id" component={CourseDetails} />
          <ProtectedRoute path="/dli" component={DLI} />
          <ProtectedRoute path="/dli/book-order" component={BookOrder} />
          <ProtectedRoute path="/dli/alcpt-order" component={AlcptOrder} />
          <ProtectedRoute path="/dli/answer-sheets" component={AnswerSheets} />
          <ProtectedRoute path="/test-tracker" component={TestTrackerProfessionalPage} />
          <ProtectedRoute path="/reports" component={ReportsEnhanced} />
          <ProtectedRoute path="/documents" component={Documents} />
          <ProtectedRoute path="/recognition" component={Recognition} />
          <ProtectedRoute path="/action-log" component={ActionLogPage} />
          <ProtectedRoute
            path="/quarterly-checkins"
            component={QuarterlyCheckins}
          />
          <ProtectedRoute path="/recruitment" component={RecruitmentPage} />

          {/* Administration routes */}
          <ProtectedRoute
            path="/administration/company-policy"
            component={Administration}
          />
          <ProtectedRoute
            path="/administration/evaluation-guideline"
            component={Administration}
          />
          <ProtectedRoute
            path="/administration/instructor-performance-policy"
            component={Administration}
          />
          <ProtectedRoute
            path="/administration/employee-handbook"
            component={Administration}
          />
          <ProtectedRoute
            path="/administration/performance-policy"
            component={Administration}
          />
          <ProtectedRoute
            path="/administration/classroom-evaluation"
            component={Administration}
          />
          <ProtectedRoute
            path="/administration/instructor-recognition"
            component={InstructorRecognition}
          />
          <ProtectedRoute
            path="/administration/manage-dashboard"
            component={ManageDashboard}
          />
          <ProtectedRoute
            path="/administration/users"
            component={UserManagement}
          />
          <ProtectedRoute path="/events" component={EventsPage} />

          {/* Training & Development routes */}
          <ProtectedRoute
            path="/training-development"
            component={TrainingDevelopment}
          />
          <ProtectedRoute
            path="/training-development/leadership-skills"
            component={TrainingDevelopment}
          />
          <ProtectedRoute
            path="/training-development/communication-techniques"
            component={TrainingDevelopment}
          />
          <ProtectedRoute
            path="/training-development/conflict-resolution"
            component={TrainingDevelopment}
          />
          <ProtectedRoute
            path="/training-development/decision-making"
            component={TrainingDevelopment}
          />
          <ProtectedRoute
            path="/training-development/team-building"
            component={TrainingDevelopment}
          />

          {/* Test Route for Moon's Assistant moved to public route above */}

          {/* Management routes */}
          <ProtectedRoute
            path="/management/schools"
            component={ManageSchools}
          />
          <ProtectedRoute
            path="/management/instructors"
            component={ManageInstructors}
          />
          <ProtectedRoute
            path="/management/students"
            component={ManageStudents}
          />
          <ProtectedRoute
            path="/management/courses"
            component={ManageCourses}
          />
          
          {/* Schedule Management */}
          <ProtectedRoute
            path="/admin/schedules"
            component={ScheduleManager}
          />
          <ProtectedRoute
            path="/administration/document-manager"
            component={DocumentManager}
          />
          
          {/* Admin routes */}
          <ProtectedRoute
            path="/admin/access-requests"
            component={AccessRequests}
          />
          
          {/* Instructor Profile Routes - Enhanced for transferred website */}
          <ProtectedRoute
            path="/instructor/profile/:id"
            component={NewInstructorProfile}
          />
          <ProtectedRoute
            path="/instructor/lookup"
            component={InstructorLookup}
          />
          
          {/* Additional instructor routes for compatibility */}
          <ProtectedRoute
            path="/instructor/:id"
            component={NewInstructorProfile}
          />
          <ProtectedRoute
            path="/instructors/profile/:id"
            component={NewInstructorProfile}
          />

          {/* School home pages - must come after specific routes */}

          {/* School-specific document routes */}
          <ProtectedRoute
            path="/schools/:schoolCode/instructor-profiles"
            component={SchoolInstructorProfiles}
          />
          <ProtectedRoute
            path="/schools/:schoolCode/timetable"
            component={SchoolTimetable}
          />
          <ProtectedRoute
            path="/schools/:schoolCode/student-day-schedule"
            component={SchoolStudentDaySchedule}
          />
          <ProtectedRoute
            path="/schools/:schoolCode/yearly-schedule"
            component={SchoolYearlySchedule}
          />
          <ProtectedRoute
            path="/schools/:schoolCode/sop"
            component={SchoolSOP}
          />
          <ProtectedRoute
            path="/schools/:schoolCode/staff-management"
            component={StaffManagement}
          />
          <ProtectedRoute
            path="/schools/:schoolCode/staff-evaluations"
            component={StaffEvaluations}
          />
          <ProtectedRoute
            path="/schools/:schoolCode/staff-attendance"
            component={StaffAttendance}
          />
          <ProtectedRoute
            path="/schools/:schoolCode/book-inventory"
            component={SchoolBookInventory}
          />
          <ProtectedRoute
            path="/schools/:schoolCode/staff-leave-tracker"
            component={StaffLeaveTracker}
          />
          <ProtectedRoute
            path="/schools/:schoolCode/staff-counseling"
            component={StaffCounseling}
          />
          <ProtectedRoute
            path="/schools/:schoolCode/documents"
            component={DocumentManagement}
          />

          {/* School ID-based routes (backward compatibility) */}
          <ProtectedRoute
            path="/school/:schoolId/staff-leave"
            component={StaffLeaveTracker}
          />
          <ProtectedRoute
            path="/school/:schoolId/staff-attendance"
            component={StaffAttendance}
          />
          <ProtectedRoute
            path="/school/:schoolId/staff-evaluations"
            component={StaffEvaluations}
          />
          <ProtectedRoute
            path="/school/:schoolId"
            component={SchoolHome}
          />

          {/* School home pages - must come after all specific routes */}
          <ProtectedRoute
            path="/schools/:schoolCode"
            component={SchoolHome}
          />

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
          {/* AI Assistant */}
          <AssistantDialog />
        </SchoolProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
