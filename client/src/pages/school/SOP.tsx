import React from "react";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Share2 } from "lucide-react";

const SchoolSOP = () => {
  const { currentSchool } = useSchool();
  
  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {currentSchool ? `${currentSchool.name} Standard Operating Procedures` : 'Standard Operating Procedures'}
          </h1>
          <p className="text-gray-500">View and access school SOPs and guidelines</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
            <FileText size={16} /> View Full SOP
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Standard Operating Procedures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-500 mb-4">SOPs will be populated here</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Upload SOP documents to populate this section with school standard operating procedures and guidelines.
            </p>
            <Button className="mt-4 bg-[#0A2463] hover:bg-[#071A4A]">Upload SOP Documents</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolSOP;