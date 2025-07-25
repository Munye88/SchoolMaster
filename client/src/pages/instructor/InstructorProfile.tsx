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
  
  // Fetch instructor data with enhanced error handling for transferred website
  const { data: instructor, isLoading: isLoadingInstructor, error } = useQuery<Instructor>({
    queryKey: [`/api/instructors/${id}`],
    enabled: !!id,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Log states for debugging
  console.log(`🔍 InstructorProfile: ID=${id}, Loading=${isLoadingInstructor}, HasData=${!!instructor}, Error=${!!error}`);
  if (error) console.error('🔍 Error details:', error);
  if (instructor) console.log('🔍 Instructor data:', instructor);

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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading instructor profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error(`❌ Instructor profile error for ID ${id}:`, error);
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg">Error loading instructor profile</div>
          <p className="text-gray-400 mt-2">
            The instructor profile (ID: {id}) could not be found or loaded.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Error: {error?.message || 'Unknown error occurred'}
          </p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Instructors
          </Button>
        </div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Instructor not found</div>
          <p className="text-gray-400 mt-2">
            No instructor found with ID: {id}
          </p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Instructors
          </Button>
        </div>
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