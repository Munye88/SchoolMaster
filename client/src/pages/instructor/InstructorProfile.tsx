import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Instructor, School } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Printer } from 'lucide-react';
import { InstructorProfileDetails } from '@/components/instructors/InstructorProfileDetails';
import { Loader2 } from 'lucide-react';

const InstructorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  // Fetch instructor data
  const { data: instructor, isLoading: isLoadingInstructor, error } = useQuery<Instructor>({
    queryKey: ['/api/instructors', id],
    enabled: !!id,
  });

  // Fetch schools for name resolution
  const { data: schools } = useQuery<School[]>({
    queryKey: ['/api/schools'],
  });

  const getSchoolName = (schoolId: number) => {
    return schools?.find(school => school.id === schoolId)?.name || 'Unknown School';
  };

  const handleBack = () => {
    setLocation('/management/instructors');
  };

  const handleEdit = () => {
    setLocation(`/management/instructors?edit=${id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoadingInstructor) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">Error loading instructor profile</div>
        <p className="text-gray-400 mt-2">The instructor profile could not be found or loaded.</p>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Instructors
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Instructors
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Profile</h1>
            <p className="text-gray-600">Complete profile for {instructor.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Details */}
      <InstructorProfileDetails 
        instructor={instructor} 
        schoolName={getSchoolName(instructor.schoolId)}
      />
    </div>
  );
};

export default InstructorProfile;