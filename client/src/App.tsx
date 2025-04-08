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
import Sidebar from "@/components/layout/Sidebar";
import TopNavigation from "@/components/layout/TopNavigation";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation />
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/instructors" component={InstructorProfile} />
          <Route path="/instructors/:id" component={InstructorProfile} />
          <Route path="/courses" component={Courses} />
          <Route path="/students" component={Students} />
          <Route path="/test-tracker" component={TestTracker} />
          <Route path="/reports" component={Reports} />
          <Route path="/documents" component={Documents} />
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
