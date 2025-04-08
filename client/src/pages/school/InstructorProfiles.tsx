import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSchool } from "@/hooks/useSchool";
import { getQueryFn } from "@/lib/queryClient";
import { School, Instructor } from "@shared/schema";
import { User, Phone, Calendar, Building, Flag, Award, MapPin } from "lucide-react";

// Male instructor names with diverse nationalities
const maleInstructorData = [
  // KNFA Instructors
  { name: "John Doe", nationality: "American", credentials: "MA in TESOL", startDate: "2021-06-01", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241234", accompaniedStatus: "Accompanied", role: "Senior ELT Instructor" },
  { name: "Michael Chen", nationality: "Canadian", credentials: "PhD in Applied Linguistics", startDate: "2020-03-15", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241235", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "James Wilson", nationality: "British", credentials: "BA in English Literature, CELTA", startDate: "2022-01-10", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241236", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Ahmed Al-Farsi", nationality: "Omani", credentials: "MA in Curriculum Development", startDate: "2019-08-20", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241237", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Robert Kim", nationality: "South Korean", credentials: "MEd in TESOL", startDate: "2021-09-05", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241238", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Sean Murphy", nationality: "Irish", credentials: "MA in Applied Linguistics", startDate: "2020-07-12", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241239", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "David Thompson", nationality: "Australian", credentials: "BA in Education, DELTA", startDate: "2022-02-15", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241240", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Mohammed Al-Balushi", nationality: "Saudi", credentials: "MA in English Studies", startDate: "2019-11-03", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241241", accompaniedStatus: "Accompanied", role: "Senior ELT Instructor" },
  { name: "Carlos Rodriguez", nationality: "Spanish", credentials: "PhD in Language Teaching", startDate: "2021-04-18", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241242", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Philippe Dubois", nationality: "French", credentials: "MA in Foreign Language Education", startDate: "2020-10-25", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241243", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Lars Svensson", nationality: "Swedish", credentials: "MEd in Teaching English", startDate: "2022-01-07", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241244", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Marco Rossi", nationality: "Italian", credentials: "BA in English, CELTA, DELTA", startDate: "2019-06-30", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241245", accompaniedStatus: "Accompanied", role: "Senior ELT Instructor" },
  { name: "Ibrahim Hassan", nationality: "Egyptian", credentials: "MA in TESOL", startDate: "2021-08-15", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241246", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Sanjay Patel", nationality: "Indian", credentials: "MEd in English Education", startDate: "2020-05-22", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241247", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Takashi Yamamoto", nationality: "Japanese", credentials: "MA in Applied Linguistics", startDate: "2022-03-01", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241248", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Alexei Petrov", nationality: "Russian", credentials: "PhD in Languages", startDate: "2019-09-12", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241249", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Hans Schmidt", nationality: "German", credentials: "MA in English Literature", startDate: "2021-02-28", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241250", accompaniedStatus: "Accompanied", role: "Senior ELT Instructor" },
  { name: "Cheng Wei", nationality: "Chinese", credentials: "MEd in ESL", startDate: "2020-08-05", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241251", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Fahad Al-Mansour", nationality: "Kuwaiti", credentials: "MA in Education", startDate: "2022-04-10", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241252", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Thiago Silva", nationality: "Brazilian", credentials: "BA in English, CELTA", startDate: "2019-12-07", compound: "Al Reem", schoolCode: "KNFA", phone: "+966550241253", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  
  // NFS East Instructors
  { name: "William Johnson", nationality: "American", credentials: "MA in TESOL", startDate: "2021-05-15", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242234", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Thomas Brown", nationality: "British", credentials: "BA in Linguistics, CELTA", startDate: "2020-07-22", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242235", accompaniedStatus: "Unaccompanied", role: "Senior ELT Instructor" },
  { name: "Daniel Lee", nationality: "Canadian", credentials: "MEd in English Education", startDate: "2022-01-18", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242236", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Mohsin Khan", nationality: "Pakistani", credentials: "MA in TESOL", startDate: "2019-09-30", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242237", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Patrick O'Connor", nationality: "Irish", credentials: "PhD in Applied Linguistics", startDate: "2021-10-12", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242238", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Nasser Al-Otaibi", nationality: "Saudi", credentials: "MA in Teaching English", startDate: "2020-04-25", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242239", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Greg Wilson", nationality: "Australian", credentials: "BA in English, DELTA", startDate: "2022-03-07", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242240", accompaniedStatus: "Accompanied", role: "Senior ELT Instructor" },
  { name: "Jose Martinez", nationality: "Spanish", credentials: "MA in Linguistics", startDate: "2019-08-15", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242241", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Rajiv Sharma", nationality: "Indian", credentials: "MEd in ESL", startDate: "2021-07-01", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242242", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Pierre Dupont", nationality: "French", credentials: "PhD in Education", startDate: "2020-11-19", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242243", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Omar Farooq", nationality: "Pakistani", credentials: "MA in TESOL", startDate: "2022-02-28", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242244", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Yuki Tanaka", nationality: "Japanese", credentials: "BA in English Studies", startDate: "2019-10-05", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242245", accompaniedStatus: "Accompanied", role: "Senior ELT Instructor" },
  { name: "Ali Al-Ahmed", nationality: "UAE", credentials: "MEd in Curriculum Design", startDate: "2021-03-12", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242246", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Gustav Lindberg", nationality: "Swedish", credentials: "MA in Applied Linguistics", startDate: "2020-06-18", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242247", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Paulo Costa", nationality: "Portuguese", credentials: "MEd in TESOL", startDate: "2022-05-01", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242248", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Hector Gonzalez", nationality: "Mexican", credentials: "PhD in Linguistics", startDate: "2019-07-17", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242249", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Kim Min-ho", nationality: "South Korean", credentials: "BA in English, CELTA", startDate: "2021-12-05", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242250", accompaniedStatus: "Accompanied", role: "Senior ELT Instructor" },
  { name: "Rami Al-Hamad", nationality: "Jordanian", credentials: "MA in Education", startDate: "2020-02-14", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242251", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Wolfgang Müller", nationality: "German", credentials: "MEd in English Teaching", startDate: "2022-04-20", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242252", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Victor Andersson", nationality: "Finnish", credentials: "MA in TESOL", startDate: "2019-11-25", compound: "Al Bustan", schoolCode: "NFSE", phone: "+966550242253", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  
  // NFS West Instructors
  { name: "Richard Taylor", nationality: "American", credentials: "PhD in Applied Linguistics", startDate: "2021-04-10", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243234", accompaniedStatus: "Accompanied", role: "Senior ELT Instructor" },
  { name: "Andrew Miller", nationality: "British", credentials: "MA in TESOL", startDate: "2020-09-05", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243235", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Matthew Williams", nationality: "Canadian", credentials: "BA in Education, DELTA", startDate: "2022-02-15", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243236", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Saeed Al-Zahrani", nationality: "Saudi", credentials: "MEd in Curriculum Development", startDate: "2019-07-22", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243237", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Jack O'Neill", nationality: "Irish", credentials: "MA in English Literature", startDate: "2021-11-30", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243238", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Liu Wei", nationality: "Chinese", credentials: "PhD in Language Education", startDate: "2020-05-17", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243239", accompaniedStatus: "Accompanied", role: "Senior ELT Instructor" },
  { name: "Jason Brooks", nationality: "Australian", credentials: "MA in Applied Linguistics", startDate: "2022-01-09", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243240", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Antonio Fernandez", nationality: "Spanish", credentials: "BA in English Studies, CELTA", startDate: "2019-10-12", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243241", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Vihaan Sharma", nationality: "Indian", credentials: "MEd in TESOL", startDate: "2021-08-25", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243242", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Jean-Claude Blanc", nationality: "French", credentials: "MA in Education", startDate: "2020-03-08", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243243", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Abdullah Al-Qahtani", nationality: "Saudi", credentials: "PhD in Linguistics", startDate: "2022-06-01", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243244", accompaniedStatus: "Unaccompanied", role: "Senior ELT Instructor" },
  { name: "Jun Tanaka", nationality: "Japanese", credentials: "MEd in ESL", startDate: "2019-12-15", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243245", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Francesco Rossi", nationality: "Italian", credentials: "BA in English, DELTA", startDate: "2021-02-20", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243246", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Tariq Mahmood", nationality: "Pakistani", credentials: "MA in Linguistics", startDate: "2020-10-30", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243247", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Erik Johansson", nationality: "Swedish", credentials: "PhD in Education", startDate: "2022-03-15", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243248", accompaniedStatus: "Accompanied", role: "Senior ELT Instructor" },
  { name: "Miguel Santos", nationality: "Brazilian", credentials: "MA in Teaching English", startDate: "2019-08-05", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243249", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Dmitri Sokolov", nationality: "Russian", credentials: "MEd in English Education", startDate: "2021-07-12", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243250", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Jürgen Weber", nationality: "German", credentials: "BA in Education, CELTA", startDate: "2020-01-25", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243251", accompaniedStatus: "Unaccompanied", role: "ELT Instructor" },
  { name: "Khaled Al-Harbi", nationality: "Saudi", credentials: "MA in TESOL", startDate: "2022-05-10", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243252", accompaniedStatus: "Accompanied", role: "ELT Instructor" },
  { name: "Vincent Park", nationality: "South Korean", credentials: "PhD in Applied Linguistics", startDate: "2019-06-30", compound: "Al Waha", schoolCode: "NFSW", phone: "+966550243253", accompaniedStatus: "Accompanied", role: "Senior ELT Instructor" },
];

// Format date from YYYY-MM-DD to Month DD, YYYY
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Component for instructor profile card
const InstructorCard = ({ instructor }: { instructor: any }) => {
  const initials = instructor.name
    .split(' ')
    .map((n: string) => n[0])
    .join('');
    
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <Avatar className="h-16 w-16">
          <AvatarImage src={instructor.imageUrl || ""} alt={instructor.name} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <CardTitle>{instructor.name}</CardTitle>
          <CardDescription>{instructor.role || "ELT Instructor"}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{instructor.nationality}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{instructor.credentials}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Started {formatDate(instructor.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Compound: {instructor.compound}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Status: {instructor.accompaniedStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{instructor.phone}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SchoolInstructorProfiles = () => {
  const { schoolCode = "" } = useParams<{ schoolCode: string }>();
  const { schools } = useSchool();
  
  // Find the current school
  const currentSchool = schools.find(school => school.code === schoolCode);
  
  // Filter instructors for this school
  const filteredInstructors = maleInstructorData.filter(instructor => 
    instructor.schoolCode === schoolCode
  );

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentSchool?.name || schoolCode} - Instructor Profiles</h1>
          <p className="text-muted-foreground mt-1">
            View detailed profiles of all {filteredInstructors.length} instructors at this school.
          </p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {filteredInstructors.map((instructor, index) => (
          <InstructorCard key={index} instructor={instructor} />
        ))}
      </div>
    </div>
  );
};

export default SchoolInstructorProfiles;