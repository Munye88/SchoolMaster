import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  School,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  Users,
  BookOpen,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ScheduleData {
  id?: number;
  schoolId: number;
  scheduleType: "yearly" | "timetable" | "student_day";
  title: string;
  academicYear: string;
  data: any;
  isActive: boolean;
}

interface School {
  id: number;
  name: string;
  code: string;
}

const ScheduleManager = () => {
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("yearly");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleData | null>(null);
  const [formData, setFormData] = useState<ScheduleData>({
    schoolId: 0,
    scheduleType: "yearly",
    title: "",
    academicYear: "2024-2025",
    data: {},
    isActive: true
  });

  // Fetch schools
  const { data: schools = [] } = useQuery<School[]>({
    queryKey: ['/api/schools']
  });

  // Fetch schedules
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['/api/schedules', selectedSchool, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSchool) params.append('schoolId', selectedSchool.toString());
      if (activeTab) params.append('scheduleType', activeTab);
      
      const response = await fetch(`/api/schedules?${params}`);
      return response.json();
    },
    enabled: !!selectedSchool
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (data: ScheduleData) => {
      const response = await apiRequest("POST", "/api/schedules", {
        ...data,
        data: JSON.stringify(data.data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      setIsDialogOpen(false);
      setEditingSchedule(null);
      toast({
        title: "Success",
        description: "Schedule created successfully"
      });
    }
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async (data: ScheduleData) => {
      const response = await apiRequest("PATCH", `/api/schedules/${data.id}`, {
        ...data,
        data: JSON.stringify(data.data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      setIsDialogOpen(false);
      setEditingSchedule(null);
      toast({
        title: "Success",
        description: "Schedule updated successfully"
      });
    }
  });

  const handleCreateNew = () => {
    setFormData({
      schoolId: selectedSchool || 0,
      scheduleType: activeTab as "yearly" | "timetable" | "student_day",
      title: "",
      academicYear: "2024-2025",
      data: getDefaultScheduleData(activeTab),
      isActive: true
    });
    setEditingSchedule(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (schedule: any) => {
    setFormData({
      ...schedule,
      data: typeof schedule.data === 'string' ? JSON.parse(schedule.data) : schedule.data
    });
    setEditingSchedule(schedule);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingSchedule) {
      updateScheduleMutation.mutate(formData);
    } else {
      createScheduleMutation.mutate(formData);
    }
  };

  const getDefaultScheduleData = (type: string) => {
    switch (type) {
      case "yearly":
        return {
          terms: [
            { name: "Term 1", startDate: "2024-10-03", endDate: "2024-12-15" },
            { name: "Term 2", startDate: "2025-01-15", endDate: "2025-05-01" }
          ],
          holidays: [
            { name: "Founding Day", date: "2025-02-23" },
            { name: "Ramadan Break", startDate: "2025-03-20", endDate: "2025-04-05" },
            { name: "Eid Al Adha", startDate: "2025-05-29", endDate: "2025-06-14" }
          ]
        };
      case "timetable":
        return {
          periods: [
            { name: "1st Period", startTime: "07:30", endTime: "08:15" },
            { name: "2nd Period", startTime: "08:15", endTime: "09:00" },
            { name: "3rd Period", startTime: "09:00", endTime: "09:45" },
            { name: "Break", startTime: "09:45", endTime: "10:00" },
            { name: "4th Period", startTime: "10:00", endTime: "10:45" },
            { name: "5th Period", startTime: "10:45", endTime: "11:30" },
            { name: "Prayer Break", startTime: "11:45", endTime: "12:05" },
            { name: "6th Period", startTime: "12:05", endTime: "12:50" }
          ]
        };
      case "student_day":
        return {
          events: [
            { name: "Student Days Begin", date: "2024-10-03" },
            { name: "Mid-term Evaluations", date: "2024-11-15" },
            { name: "Final Student Day", date: "2025-05-01" }
          ],
          specialDays: [
            { name: "National Day", date: "2024-09-23" },
            { name: "Founding Day", date: "2025-02-23" }
          ]
        };
      default:
        return {};
    }
  };

  const getScheduleIcon = (type: string) => {
    switch (type) {
      case "yearly": return <Calendar className="h-5 w-5" />;
      case "timetable": return <Clock className="h-5 w-5" />;
      case "student_day": return <Users className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const selectedSchoolName = schools.find(s => s.id === selectedSchool)?.name || "Select School";

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">Schedule Management</h1>
          <p className="text-gray-500">Manage yearly schedules, timetables, and student day schedules for all schools</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedSchool?.toString() || ""} onValueChange={(value) => setSelectedSchool(parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select School" />
            </SelectTrigger>
            <SelectContent>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id.toString()}>
                  <div className="flex items-center gap-2">
                    <School size={16} />
                    {school.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedSchool && (
            <Button onClick={handleCreateNew} className="bg-[#0A2463] hover:bg-[#071A4A]">
              <Plus size={16} className="mr-2" />
              New Schedule
            </Button>
          )}
        </div>
      </div>

      {selectedSchool ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School size={20} />
              {selectedSchoolName} - Schedule Management
            </CardTitle>
            <CardDescription>
              Create and manage different types of schedules for this school
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="yearly" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Yearly Schedule
                </TabsTrigger>
                <TabsTrigger value="timetable" className="flex items-center gap-2">
                  <Clock size={16} />
                  Daily Timetable
                </TabsTrigger>
                <TabsTrigger value="student_day" className="flex items-center gap-2">
                  <Users size={16} />
                  Student Days
                </TabsTrigger>
              </TabsList>

              {["yearly", "timetable", "student_day"].map((tabType) => (
                <TabsContent key={tabType} value={tabType} className="mt-6">
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-8">Loading schedules...</div>
                    ) : schedules.filter((s: any) => s.scheduleType === tabType).length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                          {getScheduleIcon(tabType)}
                        </div>
                        <h3 className="text-lg font-medium text-gray-500 mb-2">
                          No {tabType.replace('_', ' ')} schedules found
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          Create your first {tabType.replace('_', ' ')} schedule for {selectedSchoolName}
                        </p>
                        <Button onClick={handleCreateNew} variant="outline">
                          <Plus size={16} className="mr-2" />
                          Create {tabType.replace('_', ' ')} schedule
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {schedules
                          .filter((s: any) => s.scheduleType === tabType)
                          .map((schedule: any) => (
                            <Card key={schedule.id} className="border-l-4 border-l-[#0A2463]">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {getScheduleIcon(schedule.scheduleType)}
                                    <CardTitle className="text-lg">{schedule.title}</CardTitle>
                                    {schedule.isActive && (
                                      <Badge variant="default" className="bg-green-100 text-green-800">
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(schedule)}
                                    >
                                      <Edit size={14} className="mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Academic Year: {schedule.academicYear}
                                </p>
                              </CardHeader>
                              <CardContent>
                                <div className="text-sm text-gray-600">
                                  Last updated: {new Date(schedule.updatedAt).toLocaleDateString()}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <School size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">Select a School</h3>
            <p className="text-sm text-gray-400 mb-4">
              Choose a school from the dropdown above to manage its schedules
            </p>
          </CardContent>
        </Card>
      )}

      {/* Schedule Creation/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Edit Schedule" : "Create New Schedule"}
            </DialogTitle>
            <DialogDescription>
              {editingSchedule 
                ? "Update the schedule details below" 
                : `Create a new ${activeTab.replace('_', ' ')} schedule for ${selectedSchoolName}`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Schedule Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={`Enter ${activeTab.replace('_', ' ')} schedule title`}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select 
                value={formData.academicYear} 
                onValueChange={(value) => setFormData({ ...formData, academicYear: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                  <SelectItem value="2026-2027">2026-2027</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Schedule Data</Label>
              <Textarea
                value={JSON.stringify(formData.data, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({ ...formData, data: parsed });
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                className="font-mono text-sm"
                rows={12}
                placeholder="Enter schedule data as JSON"
              />
              <p className="text-xs text-gray-500">
                Edit the JSON data above to customize the schedule structure
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.title || createScheduleMutation.isPending || updateScheduleMutation.isPending}
            >
              <Save size={16} className="mr-2" />
              {editingSchedule ? "Update" : "Create"} Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleManager;