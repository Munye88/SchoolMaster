import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useSchool } from "@/hooks/useSchool";
import { Document } from "@shared/schema";

const Administration = () => {
  const [location] = useLocation();
  const { selectedSchool } = useSchool();
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);

  // Extract document type from URL
  const documentType = location.split('/').pop() || "";

  // Define document titles based on document type
  const documentTitles: Record<string, string> = {
    "company-policy": "Company Policy",
    "evaluation-guideline": "Instructor Evaluation Guideline",
    "employee-handbook": "Employee Handbook",
    "performance-policy": "Performance Evaluation Policy",
    "classroom-evaluation": "Training Guide Classroom Evaluation"
  };

  // Get documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents'],
    select: (data: Document[]) => {
      if (selectedSchool === 'all') {
        return data;
      }
      return data.filter(doc => 
        !doc.schoolId || 
        doc.schoolId === null || 
        doc.schoolId === (
          selectedSchool ? 
          parseInt(selectedSchool.replace(/[^\d]/g, '')) : 
          null
        )
      );
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
        "classroom-evaluation": "training"
      };
      
      const mappedType = documentTypeMap[documentType];
      const document = documents.find(doc => doc.type === mappedType);
      setActiveDocument(document || null);
    }
  }, [documents, documentType]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-[#0A2463]">Loading...</h1>
        </div>
      </div>
    );
  }

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
              <div className="aspect-video rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                <iframe 
                  src={activeDocument.fileUrl} 
                  className="w-full h-full border-0"
                  title={activeDocument.title}
                />
              </div>
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