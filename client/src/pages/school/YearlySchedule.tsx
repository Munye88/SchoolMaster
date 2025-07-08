import React, { useState, useEffect } from "react";
import { useSchool } from "@/hooks/useSchool";
import { useSchoolParam } from "@/hooks/use-school-param";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer, Share2, CalendarDays, FileSpreadsheet, Upload, FileText, Trash2 } from "lucide-react";
import { PrintButton } from "@/components/ui/print-button";

const SchoolYearlySchedule = () => {
  const { selectedSchool, selectSchool } = useSchool();
  const schoolFromUrl = useSchoolParam();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: 'Updated Yearly Schedule',
    documentType: 'yearly_schedule' as const,
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

  // Query to fetch uploaded documents for this school
  const { data: schoolDocuments = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['school-documents', currentSchool?.id],
    queryFn: async () => {
      if (!currentSchool?.id) return [];
      const response = await fetch(`/api/school-documents?schoolId=${currentSchool.id}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
    enabled: !!currentSchool?.id,
  });

  // Upload yearly schedule mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('Uploading yearly schedule with data:', {
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
        description: "Yearly schedule uploaded successfully",
      });
      setUploadDialogOpen(false);
      setUploadForm({ title: 'Updated Yearly Schedule', documentType: 'yearly_schedule', description: '', file: null });
      queryClient.invalidateQueries({ queryKey: ['school-documents'] });
    },
    onError: (error: Error) => {
      console.error('Upload mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload yearly schedule",
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('🗑️ Deleting document with ID:', id);
      const response = await fetch(`/api/school-documents/${id}`, {
        method: 'DELETE',
      });
      console.log('Delete response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      // DELETE returns 204 with no content, so don't try to parse JSON
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "Document has been successfully removed",
      });
      queryClient.invalidateQueries({ queryKey: ['school-documents'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
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
        description: "Please enter a title for the yearly schedule",
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

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Filter documents to show only yearly schedules
  const yearlyScheduleDocuments = schoolDocuments.filter((doc: any) => 
    doc.documentType === 'yearly_schedule'
  );
  
  return (
    <div id="yearlyScheduleContent" className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {selectedSchool ? `${selectedSchool.name} Yearly Schedule` : 'Yearly Schedule'}
          </h1>
          <p className="text-gray-500">View annual academic calendar and events</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
                <Upload size={16} /> Upload Yearly Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-none">
              <DialogHeader>
                <DialogTitle className="text-center">Upload New Yearly Schedule</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Schedule Title</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Academic Year 2024-25 Schedule"
                    className="rounded-none"
                  />
                </div>
                
                <div>
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select
                    value={uploadForm.documentType}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, documentType: value as 'yearly_schedule' }))}
                  >
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
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
                    placeholder="Brief description of the yearly schedule"
                    rows={3}
                    className="rounded-none"
                  />
                </div>
                
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
                    className="rounded-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: PDF, Word, Excel, Images (Max 50MB)
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                    className="rounded-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="bg-[#0A2463] hover:bg-[#071A4A] rounded-none"
                  >
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload Schedule'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <PrintButton contentId="yearlyScheduleContent" />
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
            <FileSpreadsheet size={16} /> PowerBI Dashboard
          </Button>
        </div>
      </div>
      
      {/* Show uploaded documents first, then default content */}
      {yearlyScheduleDocuments.length > 0 ? (
        // Display uploaded documents content inline
        <div className="space-y-6">
          {yearlyScheduleDocuments.map((doc: any) => (
            <Card key={doc.id} className="rounded-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {doc.fileName} • Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                      className="rounded-none"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.title)}
                      disabled={deleteMutation.isPending}
                      className="rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deleteMutation.isPending ? (
                        'Deleting...'
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Display document content inline */}
                <div className="border rounded-none">
                  {doc.fileName.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={doc.fileUrl}
                      className="w-full h-[600px] border-none"
                      title={doc.title}
                    />
                  ) : doc.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={doc.fileUrl}
                      alt={doc.title}
                      className="w-full h-auto max-h-[600px] object-contain"
                    />
                  ) : doc.fileName.toLowerCase().match(/\.(xlsx|xls|docx|doc)$/i) ? (
                    <div className="p-8 text-center bg-blue-50">
                      <FileText className="mx-auto h-16 w-16 mb-4 text-blue-600" />
                      <h3 className="text-xl font-semibold mb-2">Document Uploaded Successfully</h3>
                      <p className="text-gray-700 mb-4">
                        <strong>{doc.fileName}</strong> has been uploaded and is ready for viewing.
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                          className="bg-[#0A2463] hover:bg-[#071A4A] rounded-none"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download & View
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <FileText className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                      <p className="text-gray-600">
                        Preview not available for this file type.
                      </p>
                      <p className="text-sm text-gray-500">
                        Click "Download" to view the document.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Show default content when no documents uploaded
        <Card className="mb-6">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-2xl font-bold">Naval Forces Schools</CardTitle>
            <p className="text-lg font-medium">Academic Year 2024-2025</p>
            <p className="text-base text-gray-500">English Language Training Program</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0A2463] text-white">
                  <th className="border border-gray-300 p-3">Quarter</th>
                  <th className="border border-gray-300 p-3">Dates</th>
                  <th className="border border-gray-300 p-3">Events</th>
                  <th className="border border-gray-300 p-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {/* Fall Quarter 2024 */}
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3 font-bold" rowSpan={5}>
                    Fall Quarter<br />(August - November 2024)
                  </td>
                  <td className="border border-gray-300 p-3">August 15, 2024</td>
                  <td className="border border-gray-300 p-3">Academic Staff Return</td>
                  <td className="border border-gray-300 p-3">Pre-term preparation</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3">August 28, 2024</td>
                  <td className="border border-gray-300 p-3">First Day of Classes</td>
                  <td className="border border-gray-300 p-3">New student orientation</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3">September 23, 2024</td>
                  <td className="border border-gray-300 p-3">National Day Holiday</td>
                  <td className="border border-gray-300 p-3">No classes</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3">October 3, 2024</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">Special activities</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3">October 31, 2024</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">End of quarter assessment</td>
                </tr>
                
                {/* Winter Quarter 2024-2025 */}
                <tr className="bg-purple-50">
                  <td className="border border-gray-300 p-3 font-bold" rowSpan={4}>
                    Winter Quarter<br />(November 2024 - February 2025)
                  </td>
                  <td className="border border-gray-300 p-3">November 28, 2024</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">Mid-year progress review</td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="border border-gray-300 p-3">December 26, 2024</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">Winter quarter assessment</td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="border border-gray-300 p-3">January 30, 2025</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">Advanced language practice</td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="border border-gray-300 p-3">February 23, 2025</td>
                  <td className="border border-gray-300 p-3">Founding Day</td>
                  <td className="border border-gray-300 p-3">National holiday, no classes</td>
                </tr>
                
                {/* Spring Quarter 2025 */}
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3 font-bold" rowSpan={4}>
                    Spring Quarter<br />(March - June 2025)
                  </td>
                  <td className="border border-gray-300 p-3">March 20 - April 5, 2025</td>
                  <td className="border border-gray-300 p-3">Ramadan Break</td>
                  <td className="border border-gray-300 p-3">No classes</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3">April 6, 2025</td>
                  <td className="border border-gray-300 p-3">Classes Resume</td>
                  <td className="border border-gray-300 p-3">Return to work after Ramadan</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3">May 1, 2025</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">Final student day</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3">May 29 - June 14, 2025</td>
                  <td className="border border-gray-300 p-3">Eid Al Adha Break</td>
                  <td className="border border-gray-300 p-3">No classes</td>
                </tr>
                
                {/* Summer Quarter 2025 */}
                <tr className="bg-amber-50">
                  <td className="border border-gray-300 p-3 font-bold" rowSpan={2}>
                    Summer Quarter<br />(June - August 2025)
                  </td>
                  <td className="border border-gray-300 p-3">June 15, 2025</td>
                  <td className="border border-gray-300 p-3">Summer Term Begins</td>
                  <td className="border border-gray-300 p-3">Return to work after Eid Al Adha</td>
                </tr>
                <tr className="bg-amber-50">
                  <td className="border border-gray-300 p-3">August 15, 2025</td>
                  <td className="border border-gray-300 p-3">End of Academic Year</td>
                  <td className="border border-gray-300 p-3">Completion of 2024-2025 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Key Academic Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Academic Year Start:</span>
                <span>August 28, 2024</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">First Student Day:</span>
                <span>October 3, 2024</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Founding Day:</span>
                <span>February 23, 2025</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Ramadan Break:</span>
                <span>March 20 - April 5, 2025</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Final Student Day:</span>
                <span>May 1, 2025</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Eid Al Adha Break:</span>
                <span>May 29 - June 14, 2025</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-medium">Academic Year End:</span>
                <span>August 15, 2025</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Calendar Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Student Days</h4>
                <ul className="list-disc ml-5 text-gray-700 space-y-1">
                  <li>Student days are scheduled for: Oct 3, Oct 31, Nov 28, Dec 26, Jan 30, and May 1</li>
                  <li>Each student day features specialized activities and assessments</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Holidays & Breaks</h4>
                <ul className="list-disc ml-5 text-gray-700 space-y-1">
                  <li>National Day: September 23, 2024</li>
                  <li>Founding Day: February 23, 2025</li>
                  <li>Ramadan Break: March 20 - April 5, 2025</li>
                  <li>Eid Al Adha Break: May 29 - June 14, 2025</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Important Notes</h4>
                <ul className="list-disc ml-5 text-gray-700 space-y-1">
                  <li>All dates correspond to both Georgian and Hijri calendars</li>
                  <li>Academic staff return 2 weeks prior to class start</li>
                  <li>Schedule is subject to change based on official announcements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Display uploaded documents content inline */}
      {yearlyScheduleDocuments.length > 0 && (
        <div className="mt-6 space-y-6">
          {yearlyScheduleDocuments.map((doc: any) => (
            <Card key={doc.id} className="rounded-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {doc.fileName} • Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                      className="rounded-none"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.title)}
                      disabled={deleteMutation.isPending}
                      className="rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deleteMutation.isPending ? (
                        'Deleting...'
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Display document content inline */}
                <div className="border rounded-none">
                  {doc.fileName.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={doc.fileUrl}
                      className="w-full h-[600px] border-none"
                      title={doc.title}
                    />
                  ) : doc.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={doc.fileUrl}
                      alt={doc.title}
                      className="w-full h-auto max-h-[600px] object-contain"
                    />
                  ) : (
                    <div className="p-4 text-center">
                      <FileText className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                      <p className="text-gray-600">
                        Preview not available for this file type.
                      </p>
                      <p className="text-sm text-gray-500">
                        Click "Download" to view the document.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Uploaded Documents Management Section */}
      <Card className="mt-6 rounded-none">
        <CardHeader>
          <CardTitle className="text-center">Document Management</CardTitle>
        </CardHeader>
        <CardContent>
          {documentsLoading ? (
            <div className="text-center py-4">Loading documents...</div>
          ) : yearlyScheduleDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 mb-2" />
              <p>No yearly schedule documents uploaded yet.</p>
              <p className="text-sm">Use the "Upload Yearly Schedule" button to add documents.</p>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600">
              <p>
                {yearlyScheduleDocuments.length} document{yearlyScheduleDocuments.length > 1 ? 's' : ''} uploaded
              </p>
              <p className="text-sm text-gray-500">
                Documents are displayed above. Use the "Upload Yearly Schedule" button to add more.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolYearlySchedule;