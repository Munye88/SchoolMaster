import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Upload, Download, Filter, FileText, FolderOpen, File, Image, FilePen, FileArchive, ThumbsUp, MessageSquare, Calendar, Clock, Eye } from "lucide-react";
import { useSchool } from "@/hooks/useSchool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

// Real document data interface
interface Document {
  id: number;
  title: string;
  category: 'policy' | 'handbook' | 'guideline' | 'evaluation';
  filename: string;
  originalName: string;
  uploadDate: string;
  description?: string;
}

const Documents = () => {
  const { selectedSchool, currentSchool } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Fetch real documents from API
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    queryFn: async () => {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    }
  });
  
  // Filter documents
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (categoryFilter === "all" || doc.category === categoryFilter)
  );
  
  // Get unique categories for filters
  const uniqueCategories = Array.from(new Set(documents.map(doc => doc.category)));
  
  // Format date helper
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };
  
  // Get icon based on document type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FilePen className="h-10 w-10 text-red-500" />;
      case "DOCX":
        return <FileText className="h-10 w-10 text-blue-500" />;
      case "ZIP":
        return <FileArchive className="h-10 w-10 text-yellow-500" />;
      case "IMG":
        return <Image className="h-10 w-10 text-green-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };
  
  // Handle document upload
  const handleUploadDocument = () => {
    // This would be implemented with document upload functionality
    alert("Document upload functionality would be implemented here.");
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading documents...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {selectedSchool && currentSchool 
              ? `${currentSchool.name} Documents` 
              : 'Document Repository'}
          </h1>
          <p className="text-gray-500 mt-1">Access and manage administrative documents</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search documents..." 
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#0A2463] hover:bg-[#071A4A] flex-1 sm:flex-none">
                <Upload className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Select a file to upload to the document repository
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 mb-2">Drag and drop files here, or click to browse</p>
                  <p className="text-xs text-gray-400">Supports PDF, DOCX, XLSX, ZIP files up to 25MB</p>
                  <Input type="file" className="hidden" id="file-upload" />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="mt-4">
                      Select File
                    </Button>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">School</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Schools</SelectItem>
                        <SelectItem value="1">KNFA</SelectItem>
                        <SelectItem value="2">NFS East</SelectItem>
                        <SelectItem value="3">NFS West</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-[#0A2463]" onClick={handleUploadDocument}>Upload</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto flex-col sm:flex-row">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="File Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-[#0A2463]" : ""}
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-[#0A2463]" : ""}
          >
            <FileText className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="shared">Shared with Me</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredDocuments.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium">No documents found</h3>
                      <p className="text-sm text-gray-500 mt-1 text-center max-w-md">
                        {searchQuery || typeFilter !== "all" || categoryFilter !== "all"
                          ? "No documents match your search criteria. Try different filters." 
                          : "There are no documents available at the moment."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredDocuments.map(doc => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center mb-4">
                        <FileText className="h-10 w-10 text-red-500" />
                        <Badge className="mt-2" variant="outline">{doc.category}</Badge>
                      </div>
                      <h3 className="font-medium text-center truncate" title={doc.title}>{doc.title}</h3>
                      <div className="flex justify-center items-center text-xs text-gray-500 mt-2">
                        <Calendar className="h-3 w-3 mr-1" /> {formatDate(doc.uploadDate)}
                      </div>
                      {doc.description && (
                        <p className="text-xs text-gray-600 mt-2 text-center truncate">{doc.description}</p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 pt-0 border-t border-gray-100">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Filename</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-gray-500">
                            {searchQuery || typeFilter !== "all" || categoryFilter !== "all"
                              ? "No documents match your search criteria." 
                              : "No documents available."}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocuments.map(doc => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <FileText className="h-5 w-5 text-red-500" />
                          </TableCell>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.category}</Badge>
                          </TableCell>
                          <TableCell>{doc.filename}</TableCell>
                          <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                          <TableCell>Admin</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Recent documents view
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shared">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Documents shared with you
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="starred">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Your starred documents
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Documents;
