import React from 'react';
import { format } from 'date-fns';
import { Instructor } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StandardInstructorAvatar } from './StandardInstructorAvatar';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Building, 
  CreditCard,
  Users,
  FileText,
  Clock
} from 'lucide-react';

interface InstructorProfileDetailsProps {
  instructor: Instructor;
  schoolName: string;
}

export const InstructorProfileDetails: React.FC<InstructorProfileDetailsProps> = ({
  instructor,
  schoolName
}) => {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="rounded-none">
        <CardHeader>
          <div className="flex items-center gap-4">
            <StandardInstructorAvatar
              imageUrl={instructor.imageUrl}
              name={instructor.name}
              size="xl"
              schoolColor="#0A2463"
            />
            <div className="flex-1">
              <CardTitle className="text-2xl">{instructor.name}</CardTitle>
              <p className="text-gray-600 text-lg">{instructor.role || 'ELT Instructor'}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{instructor.nationality}</Badge>
                <Badge variant="outline">{instructor.accompaniedStatus}</Badge>
                <Badge 
                  variant={instructor.status === 'Active' ? 'default' : 'secondary'}
                  className={instructor.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {instructor.status || 'Active'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-sm">{instructor.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nationality</label>
                <p className="text-sm">{instructor.nationality}</p>
              </div>
            </div>
            
            {instructor.dateOfBirth && (
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-sm">{format(new Date(instructor.dateOfBirth), 'MMM d, yyyy')}</p>
              </div>
            )}
            
            {instructor.passportNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">Passport Number</label>
                <p className="text-sm">{instructor.passportNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {instructor.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm">{instructor.email}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-sm">{instructor.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <label className="text-sm font-medium text-gray-500">Compound</label>
                <p className="text-sm">{instructor.compound}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {(instructor.emergencyContactName || instructor.emergencyContact) && (
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {instructor.emergencyContactName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Name</label>
                  <p className="text-sm">{instructor.emergencyContactName}</p>
                </div>
              )}
              
              {instructor.emergencyContactPhone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                  <p className="text-sm">{instructor.emergencyContactPhone}</p>
                </div>
              )}
              
              {instructor.emergencyContact && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                  <p className="text-sm">{instructor.emergencyContact}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Professional Information */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Position</label>
              <p className="text-sm">{instructor.role || 'ELT Instructor'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Credentials</label>
              <p className="text-sm">{instructor.credentials}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">School</label>
              <p className="text-sm">{schoolName}</p>
            </div>
            
            {instructor.department && (
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <p className="text-sm">{instructor.department}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employment Details */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Employment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Start Date</label>
              <p className="text-sm">{format(new Date(instructor.startDate), 'MMM d, yyyy')}</p>
            </div>
            
            {instructor.hireDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Hire Date</label>
                <p className="text-sm">{format(new Date(instructor.hireDate), 'MMM d, yyyy')}</p>
              </div>
            )}
            
            {instructor.contractEndDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Contract End Date</label>
                <p className="text-sm">{format(new Date(instructor.contractEndDate), 'MMM d, yyyy')}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500">Employment Status</label>
              <p className="text-sm capitalize">{instructor.employmentStatus || 'Active'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Accompanied Status</label>
              <p className="text-sm">{instructor.accompaniedStatus}</p>
            </div>
            
            {instructor.salary && (
              <div>
                <label className="text-sm font-medium text-gray-500">Salary</label>
                <p className="text-sm">${instructor.salary.toLocaleString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      {instructor.notes && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{instructor.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Record Information */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Record Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-sm">
                {instructor.createdAt ? format(new Date(instructor.createdAt as string | Date), 'MMM d, yyyy HH:mm') : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-sm">
                {instructor.updatedAt ? format(new Date(instructor.updatedAt as string | Date), 'MMM d, yyyy HH:mm') : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};