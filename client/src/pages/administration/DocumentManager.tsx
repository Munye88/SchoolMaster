import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Download, Trash2, Plus, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: number;
  title: string;
  category: 'policy' | 'handbook' | 'guideline' | 'evaluation';
  filename: string;
  uploadDate: string;
  description?: string;
}

export default function DocumentManager() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentCategory, setDocumentCategory] = useState<Document['category']>('handbook');
  const [documentDescription, setDocumentDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    queryFn: async () => {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    }
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setSelectedFile(null);
      setDocumentTitle("");
      setDocumentDescription("");
      toast({
        title: "Success",
        description: "Document uploaded successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Success",
        description: "Document deleted successfully"
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentTitle) {
        setDocumentTitle(file.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentTitle) {
      toast({
        title: "Error",
        description: "Please select a file and enter a title",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', documentTitle);
    formData.append('category', documentCategory);
    formData.append('description', documentDescription);

    uploadMutation.mutate(formData);
  };

  const categoryColors = {
    policy: 'bg-blue-100 text-blue-800',
    handbook: 'bg-green-100 text-green-800',
    guideline: 'bg-yellow-100 text-yellow-800',
    evaluation: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.xlsx,.xls"
                onChange={handleFileSelect}
              />
            </div>
            <div>
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={documentCategory}
                onChange={(e) => setDocumentCategory(e.target.value as Document['category'])}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="handbook">Employee Handbook</option>
                <option value="policy">Policy Document</option>
                <option value="guideline">Guidelines</option>
                <option value="evaluation">Evaluation Forms</option>
              </select>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                placeholder="Brief description of the document"
                rows={3}
              />
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !documentTitle || uploadMutation.isPending}
            className="w-full md:w-auto"
          >
            {uploadMutation.isPending ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No documents uploaded yet
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[doc.category]}`}>
                          {doc.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}