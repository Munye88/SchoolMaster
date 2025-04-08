import { useContext } from "react";
import { SchoolContext } from "../main";
import { useQuery } from "@tanstack/react-query";
import { type School } from "@shared/schema";

export function useSchool() {
  const { selectedSchool, setSelectedSchool } = useContext(SchoolContext);
  
  // Fetch all schools
  const { data: schools = [], isLoading } = useQuery<School[]>({
    queryKey: ['/api/schools'],
  });
  
  // Fetch the selected school details
  const { data: schoolDetails } = useQuery<School>({
    queryKey: ['/api/schools/code', selectedSchool],
    enabled: !!selectedSchool,
  });
  
  // Get the current school object
  const currentSchool = schools.find(school => school.code === selectedSchool);
  
  return {
    schools,
    isLoading,
    selectedSchool,
    setSelectedSchool,
    currentSchool,
    schoolDetails
  };
}
