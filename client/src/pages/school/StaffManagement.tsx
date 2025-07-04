import { useParams } from "wouter";
import { useEffect } from "react";
import { useSchool } from "@/hooks/useSchool";
import { useQuery } from "@tanstack/react-query";
import StaffModuleNavigation from "@/components/school/StaffModuleNavigation";

export default function StaffManagement() {
  const { schoolCode } = useParams<{ schoolCode: string }>();
  const { selectedSchool, setSelectedSchool } = useSchool();

  // Fetch schools data
  const { data: schoolsData = [] } = useQuery<Array<{id: number, name: string, code: string, location: string}>>({
    queryKey: ['/api/schools'],
  });

  // Set selected school from URL
  useEffect(() => {
    if (schoolCode && schoolsData.length > 0) {
      const school = schoolsData.find((s) => s.code === schoolCode);
      if (school && (!selectedSchool || selectedSchool.id !== school.id)) {
        setSelectedSchool(school);
      }
    }
  }, [schoolCode, schoolsData, selectedSchool, setSelectedSchool]);

  return (
    <div className="container mx-auto p-6">
      <StaffModuleNavigation />
    </div>
  );
}