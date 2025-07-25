import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, FileText, BookOpen, Settings, Users, 
  Shield, Clock, AlertTriangle, CheckCircle
} from "lucide-react";

const EltpSop = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = () => {
    setIsLoading(true);
    const link = document.createElement('a');
    link.href = '/documents/ELTP_Standard_Operating_Procedure.pdf';
    link.download = 'ELTP_Standard_Operating_Procedure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsLoading(false);
  };

  const sopSections = [
    {
      title: "Introduction",
      icon: <BookOpen className="w-5 h-5" />,
      description: "Purpose, scope, and guiding principles for ELT operations"
    },
    {
      title: "Governance & Organization", 
      icon: <Users className="w-5 h-5" />,
      description: "Leadership structure and chain of command"
    },
    {
      title: "Professional Conduct",
      icon: <Shield className="w-5 h-5" />,
      description: "Staff expectations, dress code, and professional standards"
    },
    {
      title: "Classroom Management",
      icon: <Settings className="w-5 h-5" />,
      description: "Electronics usage and student interaction protocols"
    },
    {
      title: "Academic Monitoring",
      icon: <CheckCircle className="w-5 h-5" />,
      description: "Student progress tracking and evaluation procedures"
    },
    {
      title: "Operational Policies",
      icon: <Clock className="w-5 h-5" />,
      description: "Leave policies, timesheet guidelines, and coverage procedures"
    },
    {
      title: "Program Change Control",
      icon: <FileText className="w-5 h-5" />,
      description: "Submission process and innovation culture guidelines"
    },
    {
      title: "Compliance & Accountability",
      icon: <AlertTriangle className="w-5 h-5" />,
      description: "Enforcement procedures and conflict resolution protocols"
    }
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            English Language Training Program (ELTP)
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            Standard Operating Procedure Manual
          </h2>
          <p className="text-gray-600 text-center">
            Comprehensive operational guidelines for ELT instructors and staff across all schoolhouses
          </p>
        </div>
        
        <Button 
          onClick={handleDownload}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 rounded-none"
        >
          <Download className="w-4 h-4 mr-2" />
          {isLoading ? "Downloading..." : "Download PDF"}
        </Button>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Document Version</p>
                <p className="text-xl font-bold">1.0</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Issue Date</p>
                <p className="text-xl font-bold">June 1, 2025</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Classification</p>
                <p className="text-xl font-bold">Confidential</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sections</p>
                <p className="text-xl font-bold">8</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Sections Overview */}
      <Card className="mb-6 rounded-none">
        <CardHeader>
          <CardTitle className="text-center">SOP Sections Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sopSections.map((section, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-none hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 text-blue-600">
                  {section.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-center">ELTP Standard Operating Procedure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <iframe 
              src="/documents/ELTP_Standard_Operating_Procedure.pdf" 
              width="100%" 
              height="800px"
              style={{ border: 'none' }}
              title="ELTP Standard Operating Procedure"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EltpSop;