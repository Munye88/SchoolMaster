import { useParams } from "wouter";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, BookOpen, CheckCircle, ClipboardList, Users, FileClock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SchoolSOP = () => {
  const { schoolCode = "" } = useParams<{ schoolCode: string }>();
  const { schools } = useSchool();
  
  // Find the current school
  const currentSchool = schools.find(school => school.code === schoolCode);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentSchool?.name || schoolCode} - Standard Operating Procedures</h1>
          <p className="text-muted-foreground mt-1">
            Key procedures and guidelines for instructors and staff
          </p>
        </div>
      </div>
      
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          All instructors must be familiar with these procedures. Regular compliance checks will be conducted.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="instructional" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="instructional">Instructional Guidelines</TabsTrigger>
          <TabsTrigger value="administrative">Administrative Procedures</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Protocols</TabsTrigger>
        </TabsList>
        
        <TabsContent value="instructional" className="p-4 border rounded-md mt-2">
          <div className="grid gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Classroom Management
              </h2>
              <Separator className="my-2" />
              <div className="space-y-3 pl-2">
                <h3 className="font-medium">1. Attendance Procedure</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  All instructors must follow this process for recording student attendance:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Take attendance within the first 5 minutes of class</li>
                  <li>Record in both physical attendance register and digital system</li>
                  <li>Mark late arrivals with time of arrival</li>
                  <li>Report absences to the administrative office by end of day</li>
                  <li>Submit weekly attendance summary every Thursday</li>
                </ul>
                
                <h3 className="font-medium mt-4">2. Lesson Plan Submission</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Lesson plans must be prepared and submitted following these guidelines:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Weekly lesson plans due every Thursday for the following week</li>
                  <li>Use the approved lesson plan template for all submissions</li>
                  <li>Include learning objectives, activities, materials, and assessment methods</li>
                  <li>Align all content with the approved curriculum</li>
                  <li>Incorporate at least one communicative activity per lesson</li>
                </ul>
                
                <h3 className="font-medium mt-4">3. Classroom Setup and Maintenance</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Instructors are responsible for:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Arriving 10 minutes before class to prepare the room</li>
                  <li>Setting up necessary technology and materials</li>
                  <li>Maintaining clean and organized classroom environment</li>
                  <li>Reporting any equipment issues to IT support immediately</li>
                  <li>Ensuring classroom is secure at the end of sessions</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Assessment and Grading
              </h2>
              <Separator className="my-2" />
              <div className="space-y-3 pl-2">
                <h3 className="font-medium">1. Test Administration</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  When administering assessments:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Collect all electronic devices before distributing test materials</li>
                  <li>Verify student identity against class roster</li>
                  <li>Read test instructions verbatim from instructor guide</li>
                  <li>Monitor actively throughout the test period</li>
                  <li>Document any suspected academic dishonesty</li>
                </ul>
                
                <h3 className="font-medium mt-4">2. Grading Timeline</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Adhere to these grading deadlines:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Daily assignments: Return within 2 business days</li>
                  <li>Quizzes: Grade and return within 3 business days</li>
                  <li>Major exams: Complete grading within 5 business days</li>
                  <li>Term projects: Provide grades and feedback within 7 business days</li>
                  <li>Enter all grades into system within 24 hours of completion</li>
                </ul>
                
                <h3 className="font-medium mt-4">3. Feedback Requirements</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  When providing feedback:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Include specific strengths and areas for improvement</li>
                  <li>Reference grading rubrics for all major assignments</li>
                  <li>Provide actionable suggestions for improvement</li>
                  <li>Schedule one-on-one meetings for students scoring below 70%</li>
                  <li>Document all feedback conversations in student records</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="administrative" className="p-4 border rounded-md mt-2">
          <div className="grid gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                Administrative Requirements
              </h2>
              <Separator className="my-2" />
              <div className="space-y-3 pl-2">
                <h3 className="font-medium">1. Reporting Procedures</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Required reports and submission schedules:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Daily attendance logs: Submit by 4:00 PM each day</li>
                  <li>Weekly progress reports: Due every Friday by 12:00 PM</li>
                  <li>Monthly student performance summary: Due by the 3rd of each month</li>
                  <li>Incident reports: Submit within 24 hours of any classroom incident</li>
                  <li>Equipment maintenance requests: Submit as needed through online portal</li>
                </ul>
                
                <h3 className="font-medium mt-4">2. Leave Requests</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Process for requesting time off:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Submit leave requests at least 2 weeks in advance when possible</li>
                  <li>Use the online HR portal for all leave submissions</li>
                  <li>Prepare detailed lesson plans for substitute instructors</li>
                  <li>Emergency leave: Notify supervisor by phone as soon as possible</li>
                  <li>Submit verification documents within 3 days of return from sick leave</li>
                </ul>
                
                <h3 className="font-medium mt-4">3. Equipment and Supplies</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Procedures for requesting and maintaining materials:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Submit supply requests through online system by the 15th of each month</li>
                  <li>Sign out all equipment from resource center using check-out log</li>
                  <li>Return all shared resources within 24 hours of use</li>
                  <li>Report damaged equipment immediately to IT department</li>
                  <li>Inventory classroom supplies at the end of each month</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <FileClock className="h-5 w-5 text-blue-600" />
                Documentation Standards
              </h2>
              <Separator className="my-2" />
              <div className="space-y-3 pl-2">
                <h3 className="font-medium">1. Record Keeping</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Standards for maintaining accurate records:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Maintain digital and physical copies of all student assessments</li>
                  <li>Update student progress logs weekly in the database</li>
                  <li>Archive all course materials at the end of each semester</li>
                  <li>Secure all student data according to privacy guidelines</li>
                  <li>Retain copies of all formal communications with students and parents</li>
                </ul>
                
                <h3 className="font-medium mt-4">2. Communication Protocols</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Guidelines for professional communication:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Use official email for all professional correspondence</li>
                  <li>Respond to emails within 24 business hours</li>
                  <li>Document all parent/guardian communication in the system</li>
                  <li>Follow the communication chain of command for all issues</li>
                  <li>Use approved templates for routine communications</li>
                </ul>
                
                <h3 className="font-medium mt-4">3. Meeting Participation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Expectations for staff meetings:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Attend all scheduled departmental meetings (weekly on Wednesdays)</li>
                  <li>Prepare required materials and updates before each meeting</li>
                  <li>Submit agenda items 48 hours in advance when applicable</li>
                  <li>Review meeting minutes and complete assigned action items</li>
                  <li>Notify administration in advance if unable to attend</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="emergency" className="p-4 border rounded-md mt-2">
          <div className="grid gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Emergency Response Procedures
              </h2>
              <Separator className="my-2" />
              <div className="space-y-3 pl-2">
                <h3 className="font-medium">1. Medical Emergencies</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Steps to take during a medical emergency:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Contact school nurse at ext. 123 or emergency services at 997</li>
                  <li>Do not move injured person unless absolutely necessary</li>
                  <li>Send a reliable student to guide medical personnel to location</li>
                  <li>Clear the area of unnecessary personnel and maintain calm</li>
                  <li>Complete incident report immediately after the situation is resolved</li>
                </ul>
                
                <h3 className="font-medium mt-4">2. Fire and Evacuation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Fire response protocol:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Sound alarm and evacuate students using nearest exit</li>
                  <li>Take attendance roster and emergency contact information</li>
                  <li>Lead students to designated assembly area</li>
                  <li>Take attendance again at assembly point and report missing persons</li>
                  <li>Do not re-enter building until authorized by emergency officials</li>
                </ul>
                
                <h3 className="font-medium mt-4">3. Lockdown Procedures</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Actions during lockdown situation:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Lock all doors and windows immediately upon notification</li>
                  <li>Move students away from doors and windows</li>
                  <li>Maintain silence and turn off lights</li>
                  <li>Do not respond to knocks or calls from outside the room</li>
                  <li>Wait for all-clear signal from administration or security</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Student Safety and Welfare
              </h2>
              <Separator className="my-2" />
              <div className="space-y-3 pl-2">
                <h3 className="font-medium">1. Mandatory Reporting</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Requirements for reporting concerns:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Report any suspected abuse or endangerment immediately to principal</li>
                  <li>Document all observations in writing with date and time</li>
                  <li>Maintain strict confidentiality regarding all reports</li>
                  <li>Cooperate fully with any resulting investigation</li>
                  <li>Follow up with counseling department for student support</li>
                </ul>
                
                <h3 className="font-medium mt-4">2. Behavioral Crisis</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Managing behavioral incidents:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Remain calm and speak in a controlled, respectful tone</li>
                  <li>Call for assistance using classroom phone emergency button</li>
                  <li>Remove other students from the area if possible</li>
                  <li>Do not attempt to physically restrain a student</li>
                  <li>Document incident in detail after resolution</li>
                </ul>
                
                <h3 className="font-medium mt-4">3. Severe Weather</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Protocol during severe weather events:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Move students to designated shelter areas when alert is issued</li>
                  <li>Take attendance roster and emergency supplies</li>
                  <li>Keep students away from windows and exterior walls</li>
                  <li>Monitor emergency radio for updates</li>
                  <li>Remain in shelter until official all-clear is given</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Document Control Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Document Number:</span> SOP-{currentSchool?.code || "SCHOOL"}-2025-01</p>
              <p><span className="font-medium">Version:</span> 3.2</p>
              <p><span className="font-medium">Effective Date:</span> January 15, 2025</p>
            </div>
            <div>
              <p><span className="font-medium">Last Review Date:</span> December 10, 2024</p>
              <p><span className="font-medium">Next Review:</span> June 15, 2025</p>
              <p><span className="font-medium">Document Owner:</span> School Administration Office</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolSOP;