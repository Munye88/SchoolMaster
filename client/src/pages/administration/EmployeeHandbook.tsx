import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, Download, FileText, Edit, Trash2, Plus, 
  Calendar, User, Eye, CheckCircle, AlertCircle,
  BookOpen, FileCheck, Settings
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HandbookDocument {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  version: string;
  category: 'handbook' | 'policy' | 'procedure' | 'guideline';
  status: 'active' | 'draft' | 'archived';
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
}

const EmployeeHandbook = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<HandbookDocument | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<'handbook' | 'policy' | 'procedure' | 'guideline'>('handbook');
  const [version, setVersion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents'],
    select: (data: any[]) => {
      // Filter for handbook category documents and map to HandbookDocument interface
      return data
        .filter(doc => doc.category === 'handbook')
        .map(doc => ({
          id: doc.id,
          title: doc.title,
          description: doc.description,
          fileName: doc.filename,
          fileUrl: `/api/documents/${doc.id}/download`,
          fileSize: 0, // Not provided by API
          version: "1.0", // Default version
          category: doc.category as 'handbook' | 'policy' | 'procedure' | 'guideline',
          status: 'active' as 'active' | 'draft' | 'archived',
          uploadedBy: "Administrator",
          uploadedAt: doc.uploadDate,
          lastModified: doc.uploadDate
        }));
    }
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded successfully",
        description: "The document has been added to the employee handbook.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setUploadDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<HandbookDocument> }) => {
      const response = await fetch(`/api/administration/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document updated successfully",
        description: "The document information has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setEditDialogOpen(false);
      setSelectedDocument(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/administration/documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document deleted successfully",
        description: "The document has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory('handbook');
    setVersion("");
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('version', version);

    uploadMutation.mutate(formData);
  };

  const handleEdit = (document: HandbookDocument) => {
    setSelectedDocument(document);
    setTitle(document.title);
    setDescription(document.description);
    setCategory(document.category);
    setVersion(document.version);
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedDocument) return;

    updateMutation.mutate({
      id: selectedDocument.id,
      data: {
        title,
        description,
        category,
        version,
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'handbook': return <BookOpen className="w-4 h-4" />;
      case 'policy': return <FileCheck className="w-4 h-4" />;
      case 'procedure': return <Settings className="w-4 h-4" />;
      case 'guideline': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'handbook': return 'bg-blue-100 text-blue-800';
      case 'policy': return 'bg-green-100 text-green-800';
      case 'procedure': return 'bg-purple-100 text-purple-800';
      case 'guideline': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading employee handbook...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Employee Handbook Management</h1>
          <p className="text-gray-600">Upload and manage employee handbook documents, policies, and procedures</p>
        </div>
        
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Add a new document to the employee handbook system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Document Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="handbook">Employee Handbook</option>
                    <option value="policy">Policy Document</option>
                    <option value="procedure">Procedure</option>
                    <option value="guideline">Guideline</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Version</label>
                  <Input
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g., 1.0, 2.1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">File *</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.txt"
                  className="w-full p-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, TXT (Max: 10MB)
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Documents</p>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft Documents</p>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'draft').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">
                  {new Set(documents.map(d => d.category)).size}
                </p>
              </div>
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
              <p className="text-gray-500 mb-4">Get started by uploading your first employee handbook document.</p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-shrink-0">
                          {getCategoryIcon(document.category)}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{document.title}</h3>
                        <Badge className={getCategoryColor(document.category)}>
                          {document.category}
                        </Badge>
                        <Badge className={getStatusColor(document.status)}>
                          {document.status}
                        </Badge>
                        {document.version && (
                          <Badge variant="outline">v{document.version}</Badge>
                        )}
                      </div>
                      {document.description && (
                        <p className="text-gray-600 mb-3">{document.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {document.uploadedBy}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(document.uploadedAt), 'MMM dd, yyyy')}
                        </div>
                        <div>{formatFileSize(document.fileSize)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(document.fileUrl, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = document.fileUrl;
                          link.download = document.fileName;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(document)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Document</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{document.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(document.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update the document information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Document Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the document"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="handbook">Employee Handbook</option>
                  <option value="policy">Policy Document</option>
                  <option value="procedure">Procedure</option>
                  <option value="guideline">Guideline</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Version</label>
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g., 1.0, 2.1"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Document"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeHandbook;