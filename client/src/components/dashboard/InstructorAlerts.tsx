import React from 'react';
import { AlertCircle, AlertTriangle, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StaffAttendance, StaffLeave, Evaluation, Instructor } from "@shared/schema";
import { useSchool } from '@/hooks/useSchool';

interface InstructorAlertsProps {
  instructors: Instructor[];
  staffAttendance: StaffAttendance[];
  staffLeave: StaffLeave[];
  evaluations: Evaluation[];
}

const InstructorAlerts: React.FC<InstructorAlertsProps> = ({
  instructors,
  staffAttendance,
  staffLeave,
  evaluations,
}) => {
  const { selectedSchool } = useSchool();
  // Find absent instructors (those marked absent in staff attendance)
  const absentInstructors = staffAttendance
    .filter(record => record.status === 'absent' && new Date(record.date).toDateString() === new Date().toDateString())
    .map(record => {
      const instructor = instructors.find(i => i.id === record.instructorId);
      return {
        id: record.instructorId,
        name: instructor?.name || `Instructor #${record.instructorId}`,
        schoolId: instructor?.schoolId || 0,
        reason: record.comments || 'No reason provided',
        type: 'absent' as const,
      };
    });

  // Find instructors on leave (active leave periods)
  const today = new Date();
  const instructorsOnLeave = staffLeave
    .filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      return today >= startDate && today <= endDate && leave.status === 'Approved';
    })
    .map(leave => {
      const instructor = instructors.find(i => i.id === leave.instructorId);
      return {
        id: leave.instructorId,
        name: instructor?.name || `Instructor #${leave.instructorId}`,
        schoolId: instructor?.schoolId || 0,
        reason: `${leave.leaveType || 'PTO'} - Returns ${format(new Date(leave.returnDate), 'MMM dd')}`,
        type: 'leave' as const,
      };
    });

  // Find instructors with low evaluation scores (below 85%)
  const lowPerformingInstructors = evaluations
    .filter(evaluation => evaluation.score < 85)
    .map(evaluation => {
      const instructor = instructors.find(i => i.id === evaluation.instructorId);
      return {
        id: evaluation.instructorId,
        name: instructor?.name || `Instructor #${evaluation.instructorId}`,
        schoolId: instructor?.schoolId || 0,
        reason: `${evaluation.score}% in ${evaluation.quarter}`,
        type: 'evaluation' as const,
      };
    });

  // Combine all alerts
  const allAlerts = [...absentInstructors, ...instructorsOnLeave, ...lowPerformingInstructors];

  // If no alerts, show a friendly message
  if (allAlerts.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-lg font-semibold text-[#0A2463] flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-green-500" />
            Instructor Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-3">
              <AlertCircle className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-gray-600">All instructors are present and performing well.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2 border-b">
        <CardTitle className="text-lg font-semibold text-[#0A2463] flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
          Instructor Alerts ({allAlerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[240px] w-full">
          <div className="p-2">
            {allAlerts.map((alert, index) => {
              // Determine color and icon based on alert type
              let badgeColor = '';
              let alertIcon = null;
              
              switch (alert.type) {
                case 'absent':
                  badgeColor = 'bg-red-100 text-red-800 border-red-200';
                  alertIcon = <X className="h-4 w-4 mr-2 text-red-600" />;
                  break;
                case 'leave':
                  badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                  alertIcon = <Calendar className="h-4 w-4 mr-2 text-amber-600" />;
                  break;
                case 'evaluation':
                  badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
                  alertIcon = <AlertCircle className="h-4 w-4 mr-2 text-purple-600" />;
                  break;
              }
              
              return (
                <div 
                  key={`${alert.type}-${alert.id}-${index}`} 
                  className="mb-2 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-800">{alert.name}</div>
                      <Badge className={`text-xs px-2 py-0.5 ${badgeColor}`}>
                        {alert.type === 'absent' && 'Absent Today'}
                        {alert.type === 'leave' && 'On Leave'}
                        {alert.type === 'evaluation' && 'Low Score'}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      {alertIcon}
                      <span>{alert.reason}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InstructorAlerts;