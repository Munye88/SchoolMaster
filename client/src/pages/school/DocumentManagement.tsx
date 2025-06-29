import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Download, Trash, Calendar, BookOpen, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface SchoolDocument {
  id: number;
  title: string;
  fileName: string;
  fileUrl: string;
  documentType: 'daily_schedule' | 'yearly_schedule' | 'handbook' | 'policy' | 'other';
  schoolId: number;
  uploadedBy: number;
  uploadDate: string;
  description?: string;
}

export default function DocumentManagement() {
  const { selectedSchool } = useSchool();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    documentType: 'daily_schedule' as SchoolDocument['documentType'],
    description: '',
    file: null as File | null
  });

  // Fetch school documents
  const { data: documents = [], isLoading } = useQuery<SchoolDocument[]>({
    queryKey: ['/api/school-documents', selectedSchool?.id],
    enabled: !!selectedSchool,
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/school-documents', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "Document has been successfully uploaded",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/school-documents'] });
      setUploadDialogOpen(false);
      setUploadForm({
        title: '',
        documentType: 'daily_schedule',
        description: '',
        file: null
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/school-documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "Document has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/school-documents'] });
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
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = () => {
    if (!uploadForm.file || !uploadForm.title || !selectedSchool) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('title', uploadForm.title);
    formData.append('documentType', uploadForm.documentType);
    formData.append('description', uploadForm.description);
    formData.append('schoolId', selectedSchool.id.toString());

    uploadMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = (document: SchoolDocument) => {
    window.open(document.fileUrl, '_blank');
  };

  const getDocumentIcon = (type: SchoolDocument['documentType']) => {
    switch (type) {
      case 'daily_schedule':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'yearly_schedule':
        return <Calendar className="h-5 w-5 text-green-600" />;
      case 'handbook':
        return <BookOpen className="h-5 w-5 text-purple-600" />;
      case 'policy':
        return <FileText className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDocumentTypeLabel = (type: SchoolDocument['documentType']) => {
    switch (type) {
      case 'daily_schedule':
        return 'Daily Schedule';
      case 'yearly_schedule':
        return 'Yearly Schedule';
      case 'handbook':
        return 'Student Handbook';
      case 'policy':
        return 'Policy Document';
      default:
        return 'Other Document';
    }
  };

  const filterDocumentsByType = (type: SchoolDocument['documentType']) => {
    return documents.filter(doc => doc.documentType === type);
  };

  if (!selectedSchool) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Please select a school to manage documents</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {selectedSchool.name} - Document Management
          </h1>
          <p className="text-gray-500">Manage school schedules and documents</p>
        </div>
        
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0A2463] hover:bg-[#071A4A]">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title"
                />
              </div>
              
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select
                  value={uploadForm.documentType}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, documentType: value as SchoolDocument['documentType'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily_schedule">Daily Schedule</SelectItem>
                    <SelectItem value="yearly_schedule">Yearly Schedule</SelectItem>
                    <SelectItem value="handbook">Student Handbook</SelectItem>
                    <SelectItem value="policy">Policy Document</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter document description"
                />
              </div>
              
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="schedules" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="handbooks">Handbooks</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="all">All Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Daily Schedules
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filterDocumentsByType('daily_schedule').length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No daily schedules uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {filterDocumentsByType('daily_schedule').map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getDocumentIcon(doc.documentType)}
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-gray-500">{doc.fileName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(doc.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Yearly Schedules
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filterDocumentsByType('yearly_schedule').length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No yearly schedules uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {filterDocumentsByType('yearly_schedule').map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getDocumentIcon(doc.documentType)}
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-gray-500">{doc.fileName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(doc.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="handbooks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Student Handbooks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filterDocumentsByType('handbook').length === 0 ? (
                <p className="text-gray-500 text-center py-8">No handbooks uploaded</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterDocumentsByType('handbook').map(doc => (
                    <div key={doc.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        {getDocumentIcon(doc.documentType)}
                        <h3 className="font-medium">{doc.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{doc.description}</p>
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(doc.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Policy Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filterDocumentsByType('policy').length === 0 ? (
                <p className="text-gray-500 text-center py-8">No policy documents uploaded</p>
              ) : (
                <div className="space-y-3">
                  {filterDocumentsByType('policy').map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getDocumentIcon(doc.documentType)}
                        <div>
                          <h3 className="font-medium">{doc.title}</h3>
                          <p className="text-sm text-gray-500">{doc.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(doc.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No documents uploaded</p>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getDocumentIcon(doc.documentType)}
                        <div>
                          <h3 className="font-medium">{doc.title}</h3>
                          <p className="text-sm text-gray-500">
                            {getDocumentTypeLabel(doc.documentType)} • {doc.fileName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(doc.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}