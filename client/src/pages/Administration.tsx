import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Download, BookOpen, ClipboardList, CheckSquare, Award, Users, Info, FileDown } from "lucide-react";
import { useSchool } from "@/hooks/useSchool";
import { Document } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Administration = () => {
  const [location] = useLocation();
  const { selectedSchool } = useSchool();
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Extract document type from URL
  const documentType = location.split('/').pop() || "";

  // Define document titles based on document type
  const documentTitles: Record<string, string> = {
    "company-policy": "Company Policy",
    "evaluation-guideline": "Instructor Evaluation Guideline",
    "employee-handbook": "Employee Handbook",
    "performance-policy": "Performance Evaluation Policy",
    "classroom-evaluation": "Training Guide Classroom Evaluation",
    "instructor-performance-policy": "Instructor Performance & Evaluation Policy"
  };

  // Get documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents'],
    select: (data: Document[]) => {
      if (selectedSchool === 'all') {
        return data;
      }
      
      // If selectedSchool is an object with an id
      if (selectedSchool && typeof selectedSchool === 'object' && 'id' in selectedSchool) {
        return data.filter(doc => 
          !doc.schoolId || 
          doc.schoolId === null || 
          doc.schoolId === selectedSchool.id
        );
      }
      
      // Default case, no filtering by school
      return data;
    }
  });

  // Find active document based on document type
  useEffect(() => {
    if (documents && documentType) {
      // Map document type from URL to document type in database
      const documentTypeMap: Record<string, string> = {
        "company-policy": "policy",
        "evaluation-guideline": "evaluation",
        "employee-handbook": "handbook",
        "performance-policy": "performance",
        "classroom-evaluation": "training",
        "instructor-performance-policy": "instructor-policy"
      };
      
      const mappedType = documentTypeMap[documentType];
      const document = documents?.find(doc => doc.type === mappedType);
      setActiveDocument(document || null);
    }
  }, [documents, documentType]);

  // Special cases for PDFs
  const isEvaluationGuideline = documentType === "evaluation-guideline";
  const evaluationGuidelinePdfUrl = "/documents/Instructor_Evaluation_Guideline.pdf";
  
  const isInstructorPerformancePolicy = documentType === "instructor-performance-policy";
  const instructorPerformancePolicyPdfUrl = "/documents/GovCIO_SAMS_Evaluation_Policy.pdf";
  
  const isClassroomEvaluation = documentType === "classroom-evaluation";
  const classroomEvaluationPdfUrl = "/classroom-evaluation-guide.pdf";

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-[#0A2463]">Loading...</h1>
        </div>
      </div>
    );
  }

  // Evaluation guideline sections
  const evaluationSections = [
    {
      id: "overview",
      title: "Overview",
      icon: <BookOpen className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">Purpose of Instructor Evaluation</h3>
            <p className="text-gray-700 mb-4">
              Evaluating ELT instructors is an ongoing process designed to enhance the quality of instruction. 
              As an instructor, it is important to view each evaluation as an opportunity for growth, 
              receiving constructive feedback that highlights strengths and areas of improvement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-4 rounded-md border border-blue-200">
                <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                  <CheckSquare className="h-4 w-4 mr-2" /> Planned Evaluations
                </h4>
                <p className="text-sm text-gray-600">
                  Allow time for preparation, though they might not always reflect a typical teaching style.
                </p>
              </div>
              <div className="bg-white p-4 rounded-md border border-blue-200">
                <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                  <CheckSquare className="h-4 w-4 mr-2" /> Unplanned Evaluations
                </h4>
                <p className="text-sm text-gray-600">
                  Give a more authentic view of everyday instruction. Consistency in your regular teaching approach is key.
                </p>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Evaluation Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-blue-200 overflow-hidden">
              <div className="h-2 bg-blue-500 w-full"></div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Introduction</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">13 points</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  This section emphasizes the instructor's ability to establish the tone and context for the lesson.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 overflow-hidden">
              <div className="h-2 bg-purple-500 w-full"></div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Presentation</CardTitle>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">64 points</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  This section assesses the instructor's effectiveness in delivering and engaging with the content.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 overflow-hidden">
              <div className="h-2 bg-green-500 w-full"></div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Instructor/Student Interaction</CardTitle>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">16 points</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  This section gauges the instructor's proficiency in interacting with students, fostering participation and understanding.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 overflow-hidden">
              <div className="h-2 bg-amber-500 w-full"></div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Summary</CardTitle>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">7 points</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  This section concludes the evaluation, highlighting the instructor's ability to summarize the lesson's key takeaways.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "preparation",
      title: "Preparation",
      icon: <ClipboardList className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <h3 className="text-xl font-semibold text-green-800 mb-3">Essential Preparation Guidelines</h3>
            <p className="text-gray-700 mb-4">
              Ensure that all instructional materials are prepared, the lesson is well-planned, 
              the classroom and training environment are organized, and all necessary equipment 
              is available and functioning properly. Always be ready for an evaluation, as your 
              students constantly evaluate your performance whenever you teach.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Pacing Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Ensure that your pacing schedule or lesson plan is clearly displayed on the bulletin board 
                  or whiteboard. This helps both students and the instructor stay informed about the content, 
                  exercises and activities planned for the class.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Classroom Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Before the start of each period, ensure that your classroom is arranged. Proper seating 
                  arrangements are essential for an organized and conducive learning environment. Additionally, 
                  check that the Smartboard is in working condition and ready for use.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Award className="h-5 w-5 mr-2 text-amber-600" />
                  Effective Training Aids
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Use training aids like PowerPoint and EasiNote to enhance the effectiveness of your lessons. 
                  These tools can help make your teaching more engaging and creative.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mt-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-3">Important Reminder</h3>
            <p className="text-gray-700">
              Keep in mind that students share their experiences, both formally and informally, with others, 
              so it is essential to be well-prepared and deliver high-quality instruction each time you enter 
              the classroom.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "introduction",
      title: "Introduction",
      icon: <FileText className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">Introduction Guidelines</h3>
            <p className="text-gray-700 mb-4">
              The introduction lays the foundation for the lesson. It should capture students' interest and motivate 
              them to engage with the material. Below are the key elements the evaluator will focus on when assessing 
              your performance, along with guidance on how to structure your instruction to meet those expectations.
            </p>
          </div>
          
          <Card className="border-green-200">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="text-lg text-green-800">Example Introduction</CardTitle>
              <CardDescription>A model introduction that demonstrates effective techniques</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-gray-700 bg-white p-4 rounded-md border border-gray-100">
                <p>
                  <span className="font-medium text-gray-900">Greeting:</span> "Good morning, everyone! My name is Mr. Munye, and I will be your instructor for this cycle, teaching Book 5."
                </p>
                <p>
                  <span className="font-medium text-gray-900">Objectives:</span> "Our objective for this period is to learn how to use the present continuous tense, complete exercises A and B on pages 50-55, and practice writing 3-5 sentences on our own after completing the exercises."
                </p>
                <p>
                  <span className="font-medium text-gray-900">Relevance:</span> "This grammar lesson is important and beneficial, as it will be on the book test and the ALCPT. Learning this grammar will also help if you plan to travel outside Saudi Arabia or continue your studies in the west."
                </p>
                <p>
                  <span className="font-medium text-gray-900">Engagement:</span> "I encourage each of you to actively engage in the class—pay close attention, take notes, and not be afraid to ask questions. It is alright to make mistakes; that is how we learn and improve. Remember, I am here to support you, and my goal is to see all of you work hard and succeed."
                </p>
                <p>
                  <span className="font-medium text-gray-900">Motivation:</span> "Let's take advantage of our class time and work together. I am confident in you and believe you will do well in this class."
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Key Elements to Include</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckSquare className="h-4 w-4 text-purple-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Clear statement of lesson objectives</span>
                </li>
                <li className="flex items-start">
                  <CheckSquare className="h-4 w-4 text-purple-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Explanation of why the lesson is important and beneficial</span>
                </li>
                <li className="flex items-start">
                  <CheckSquare className="h-4 w-4 text-purple-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Encouragement of student participation</span>
                </li>
                <li className="flex items-start">
                  <CheckSquare className="h-4 w-4 text-purple-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Clear explanation of what students should expect</span>
                </li>
                <li className="flex items-start">
                  <CheckSquare className="h-4 w-4 text-purple-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Motivational statements to engage students</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
              <h3 className="text-lg font-semibold text-amber-800 mb-3">Evaluation Criteria</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckSquare className="h-4 w-4 text-amber-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Clarity and organization of introduction</span>
                </li>
                <li className="flex items-start">
                  <CheckSquare className="h-4 w-4 text-amber-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Effectiveness in capturing student interest</span>
                </li>
                <li className="flex items-start">
                  <CheckSquare className="h-4 w-4 text-amber-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Presentation of clear learning objectives</span>
                </li>
                <li className="flex items-start">
                  <CheckSquare className="h-4 w-4 text-amber-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Relevance of content to student needs</span>
                </li>
                <li className="flex items-start">
                  <CheckSquare className="h-4 w-4 text-amber-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Establishment of a positive learning environment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "document",
      title: "Full Document",
      icon: <FileText className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium">Instructor Evaluation Guideline</h3>
                <p className="text-sm text-gray-500">PDF Document • Created by Munye Sufi & Abdibasid Barre</p>
              </div>
            </div>
            <Button variant="outline" asChild className="gap-2">
              <a href={evaluationGuidelinePdfUrl} download="Instructor_Evaluation_Guideline.pdf">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
            </Button>
          </div>
          
          <div className="aspect-video rounded-md overflow-hidden bg-gray-100 border border-gray-200">
            <object
              data={evaluationGuidelinePdfUrl}
              type="application/pdf"
              className="w-full h-[800px]"
            >
              <div className="flex items-center justify-center h-full p-6 text-center">
                <div>
                  <p className="mb-4 text-gray-600">Unable to display PDF document.</p>
                  <a 
                    href={evaluationGuidelinePdfUrl}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here to open the PDF
                  </a>
                </div>
              </div>
            </object>
          </div>
          
          <div className="flex justify-end">
            <a 
              href={evaluationGuidelinePdfUrl}
              download="Instructor_Evaluation_Guideline.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-[#0A2463] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Evaluation Guide
            </a>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h3 className="text-blue-800 font-medium mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-600" />
              About the Instructor Evaluation Guideline
            </h3>
            <p className="text-gray-700 text-sm">
              This guideline provides a comprehensive framework for evaluating ELT instructors, with an emphasis on 
              continuous improvement and professional development. The document covers four key evaluation areas: 
              Introduction, Presentation, Instructor-Student Interaction, and Summary. It offers practical examples 
              and clear criteria to help instructors understand what constitutes effective teaching practice.
            </p>
          </div>
        </div>
      )
    }
  ];

  // Render Instructor Evaluation Guideline page
  // Special case for Instructor Performance & Evaluation Policy
  if (isInstructorPerformancePolicy) {
    return (
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0A2463]">
                Instructor Performance & Evaluation Policy
              </h1>
              <p className="text-gray-600 mt-1">
                Guidelines for instructor performance expectations and evaluation procedures
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={instructorPerformancePolicyPdfUrl}
                download="GovCIO_SAMS_Evaluation_Policy.pdf"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <p className="text-gray-700">
                This document provides comprehensive guidelines for instructor performance expectations, evaluation
                methods, and professional development procedures. Please review this document to understand the
                performance standards and evaluation process at SAMS.
              </p>
            </div>
            <div className="aspect-auto h-[800px]">
              <iframe 
                src={instructorPerformancePolicyPdfUrl} 
                className="w-full h-full border-0" 
                title="Instructor Performance & Evaluation Policy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isEvaluationGuideline) {
    return (
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Instructor Evaluation Guideline
              </h1>
              <p className="text-gray-600 mt-1">
                A comprehensive guide for evaluating ELT instructors and enhancing teaching quality
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border border-gray-200 p-1 grid w-full grid-cols-2 md:grid-cols-4 gap-1">
              {evaluationSections.map((section) => (
                <TabsTrigger 
                  key={section.id}
                  value={section.id}
                  className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 flex items-center gap-2"
                >
                  {section.icon}
                  <span>{section.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {evaluationSections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="border-none p-0 outline-none">
                {section.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    );
  }

  // Render other documents
  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-[#0A2463]">
          {documentTitles[documentType] || "Administration Documents"}
        </h1>
        
        {activeDocument ? (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <FileText className="mr-2 h-5 w-5 text-[#0A2463]" />
                {activeDocument.title}
              </CardTitle>
              <CardDescription>
                {`Document type: ${activeDocument.type}`}<br />
                {`Upload date: ${new Date(activeDocument.uploadDate).toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentType === "employee-handbook" ? (
                <div className="space-y-4">
                  <div className="aspect-video rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <object
                      data={activeDocument.fileUrl}
                      type="application/pdf"
                      className="w-full h-full"
                    >
                      <div className="flex items-center justify-center h-full p-6 text-center">
                        <div>
                          <p className="mb-4 text-gray-600">Unable to display PDF document.</p>
                          <a 
                            href={activeDocument.fileUrl}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Click here to open the PDF
                          </a>
                        </div>
                      </div>
                    </object>
                  </div>
                  
                  <div className="flex justify-end">
                    <a 
                      href={activeDocument.fileUrl}
                      download="SAMS_Employee_Handbook.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-[#0A2463] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Handbook
                    </a>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <h3 className="text-blue-800 font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-600" />
                      About the SAMS Employee Handbook
                    </h3>
                    <p className="text-gray-700 text-sm">
                      This handbook contains important information about policies, procedures, and expectations for all 
                      Aviation English Language Training (ELT) employees. All staff members should thoroughly review this 
                      document. For any questions, please contact the administration.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  <iframe 
                    src={activeDocument.fileUrl} 
                    className="w-full h-full border-0"
                    title={activeDocument.title}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Document Not Found</CardTitle>
              <CardDescription>
                The requested document does not exist or is not accessible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please check the URL or contact an administrator if you believe this is an error.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Administration;