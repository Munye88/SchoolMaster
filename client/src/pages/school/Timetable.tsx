import React, { useState, useEffect } from "react";
import { useSchool } from "@/hooks/useSchool";
import { useSchoolParam } from "@/hooks/use-school-param";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Share2, Printer, Clock, Users, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SchoolTimetable = () => {
  const { selectedSchool, selectSchool } = useSchool();
  const schoolFromUrl = useSchoolParam();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("aviation");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: 'Updated Timetable',
    documentType: 'daily_schedule' as const,
    description: '',
    file: null as File | null
  });

  // Auto-select school from URL if not already selected
  useEffect(() => {
    if (schoolFromUrl && (!selectedSchool || selectedSchool.id !== schoolFromUrl.id)) {
      selectSchool(schoolFromUrl);
    }
  }, [schoolFromUrl, selectedSchool, selectSchool]);

  // Use the school from URL or selected school
  const currentSchool = selectedSchool || schoolFromUrl;
  
  // Always show timetables for now
  const isKNFA = true; // Force display for all schools until fixed

  // Upload timetable mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('Uploading timetable with data:', {
        title: formData.get('title'),
        documentType: formData.get('documentType'),
        schoolId: formData.get('schoolId'),
        hasFile: !!formData.get('file')
      });
      
      const response = await fetch('/api/school-documents', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        console.error('Upload error:', errorData);
        throw new Error(errorData.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Upload successful:', data);
      toast({
        title: "Success",
        description: "Timetable uploaded successfully",
      });
      setUploadDialogOpen(false);
      setUploadForm({ title: 'Updated Timetable', documentType: 'daily_schedule', description: '', file: null });
      queryClient.invalidateQueries({ queryKey: ['/api/school-documents'] });
    },
    onError: (error: Error) => {
      console.error('Upload mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload timetable",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('📁 File selected:', file ? {
      name: file.name,
      size: file.size,
      type: file.type
    } : 'No file');
    
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
      console.log('✅ File added to upload form');
    }
  };

  const handleUpload = () => {
    console.log('🔵 Upload button clicked!');
    console.log('Upload form state:', uploadForm);
    console.log('Current school:', currentSchool);
    
    if (!uploadForm.file) {
      console.error('❌ No file selected');
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (!uploadForm.title) {
      console.error('❌ No title provided');
      toast({
        title: "Error", 
        description: "Please enter a title for the timetable",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentSchool) {
      console.error('❌ No school selected');
      toast({
        title: "Error",
        description: "No school selected",
        variant: "destructive",
      });
      return;
    }
    
    console.log('✅ All validation passed, creating FormData');
    
    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('title', uploadForm.title);
    formData.append('documentType', uploadForm.documentType);
    formData.append('description', uploadForm.description);
    formData.append('schoolId', currentSchool.id.toString());
    
    console.log('📤 Submitting upload mutation');
    uploadMutation.mutate(formData);
  };
  
  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {currentSchool ? `${currentSchool.name} Timetable` : 'Timetable'}
          </h1>
          <p className="text-gray-500">View and manage course schedules</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
                <Upload size={16} /> Upload Timetable
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-none">
              <DialogHeader>
                <DialogTitle className="text-center">Upload New Timetable</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Timetable Title</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Aviation Officers Schedule - August 2024"
                    className="rounded-none"
                  />
                </div>
                
                <div>
                  <Label htmlFor="documentType">Schedule Type</Label>
                  <Select
                    value={uploadForm.documentType}
                    onValueChange={(value) => setUploadForm(prev => ({ 
                      ...prev, 
                      documentType: value as 'daily_schedule' | 'yearly_schedule' 
                    }))}
                  >
                    <SelectTrigger className="rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="daily_schedule">Daily Schedule</SelectItem>
                      <SelectItem value="yearly_schedule">Yearly Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about this timetable"
                    className="rounded-none"
                  />
                </div>
                
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="rounded-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: PDF, Word, Excel
                  </p>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('🔘 Button clicked - Debug state:', {
                        hasFile: !!uploadForm.file,
                        hasTitle: !!uploadForm.title,
                        isPending: uploadMutation.isPending,
                        isDisabled: !uploadForm.file || !uploadForm.title || uploadMutation.isPending
                      });
                      handleUpload();
                    }}
                    disabled={!uploadForm.file || !uploadForm.title || uploadMutation.isPending}
                    className="flex-1 bg-[#0A2463] hover:bg-[#071A4A] rounded-none"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload Timetable"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadDialogOpen(false)}
                    className="rounded-none"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button variant="outline" className="gap-2">
            <Printer size={16} /> Print
          </Button>
        </div>
      </div>
      
      {isKNFA ? (
        <Tabs 
          defaultValue="aviation" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="flex justify-center mb-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="aviation" className="flex items-center gap-2">
                <Clock size={16} /> Aviation Officers
              </TabsTrigger>
              <TabsTrigger value="enlisted" className="flex items-center gap-2">
                <Users size={16} /> Enlisted
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="aviation" className="mt-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">Naval Forces Schools</CardTitle>
                <div className="text-lg font-medium">English Language School</div>
                <div className="text-lg font-medium">King Abdul-Aziz Naval Base</div>
                <div className="text-base">Jubail, Saudi Arabia</div>
                <div className="mt-4 text-xl font-bold">AVIATION OFFICERS SCHEDULE</div>
                <div className="text-base">28 AUGUST 2024</div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3">1st Period</td>
                        <td className="border border-gray-300 p-3 text-center">0730</td>
                        <td className="border border-gray-300 p-3 text-center">0815</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">0815</td>
                        <td className="border border-gray-300 p-3 text-center">0820</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">2nd Period</td>
                        <td className="border border-gray-300 p-3 text-center">0820</td>
                        <td className="border border-gray-300 p-3 text-center">0905</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Long Break</td>
                        <td className="border border-gray-300 p-3 text-center">0905</td>
                        <td className="border border-gray-300 p-3 text-center">0925</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">3rd Period</td>
                        <td className="border border-gray-300 p-3 text-center">0925</td>
                        <td className="border border-gray-300 p-3 text-center">1010</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">1010</td>
                        <td className="border border-gray-300 p-3 text-center">1015</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">4th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1015</td>
                        <td className="border border-gray-300 p-3 text-center">1100</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">1100</td>
                        <td className="border border-gray-300 p-3 text-center">1105</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">5th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1105</td>
                        <td className="border border-gray-300 p-3 text-center">1145</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Prayer Break</td>
                        <td className="border border-gray-300 p-3 text-center">1145</td>
                        <td className="border border-gray-300 p-3 text-center">1205</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">6th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1210</td>
                        <td className="border border-gray-300 p-3 text-center">1250</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 text-gray-700 italic">
                  *Period six is an additional period that will be used only when needed.
                </div>
                <div className="mt-8 flex justify-end">
                  <div className="text-right">
                    <div className="mb-1">____________________________________</div>
                    <div>Zeiad M. Alrajhi, CAPT</div>
                    <div>ELS Commander</div>
                    <div>Naval Forces Schools Jubail</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="enlisted" className="mt-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">Naval Forces Schools</CardTitle>
                <div className="text-lg font-medium">English Language School</div>
                <div className="text-lg font-medium">King Abdul-Aziz Naval Base</div>
                <div className="text-base">Jubail, Saudi Arabia</div>
                <div className="mt-4 text-xl font-bold">ENLISTED SCHEDULE</div>
                <div className="text-base">28 AUGUST 2024</div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3">1st Period</td>
                        <td className="border border-gray-300 p-3 text-center">0730</td>
                        <td className="border border-gray-300 p-3 text-center">0815</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">0815</td>
                        <td className="border border-gray-300 p-3 text-center">0820</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">2nd Period</td>
                        <td className="border border-gray-300 p-3 text-center">0820</td>
                        <td className="border border-gray-300 p-3 text-center">0905</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">0905</td>
                        <td className="border border-gray-300 p-3 text-center">0910</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">3rd Period</td>
                        <td className="border border-gray-300 p-3 text-center">0910</td>
                        <td className="border border-gray-300 p-3 text-center">0955</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Long Break</td>
                        <td className="border border-gray-300 p-3 text-center">0955</td>
                        <td className="border border-gray-300 p-3 text-center">1015</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">4th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1015</td>
                        <td className="border border-gray-300 p-3 text-center">1100</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">1100</td>
                        <td className="border border-gray-300 p-3 text-center">1105</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">5th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1105</td>
                        <td className="border border-gray-300 p-3 text-center">1145</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Prayer Break</td>
                        <td className="border border-gray-300 p-3 text-center">1145</td>
                        <td className="border border-gray-300 p-3 text-center">1205</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">6th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1205</td>
                        <td className="border border-gray-300 p-3 text-center">1250</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 text-gray-700 italic">
                  *Period six is an additional period that will be used only when needed.
                </div>
                <div className="mt-8 flex justify-end">
                  <div className="text-right">
                    <div className="mb-1">____________________________________</div>
                    <div>Zeiad M. Alrajhi, CAPT</div>
                    <div>ELS Commander</div>
                    <div>Naval Forces Schools Jubail</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-gray-500 mb-4">Timetable will be populated from PowerBI</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Connect your Excel sheets with timetable data to populate this section with course schedules.
              </p>
              <Button className="mt-4 bg-[#0A2463] hover:bg-[#071A4A]">Connect PowerBI</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchoolTimetable;