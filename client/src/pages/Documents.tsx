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

// Mock document data
interface Document {
  id: number;
  title: string;
  type: string;
  schoolId: number | null;
  uploadDate: Date;
  fileUrl: string;
  fileSize: string;
  author: string;
  category: string;
  views: number;
  status: "approved" | "pending" | "archived";
}

const Documents = () => {
  const { selectedSchool, currentSchool } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Mock documents data
  const mockDocuments: Document[] = [
    {
      id: 1,
      title: "Course Syllabus - Aviation",
      type: "PDF",
      schoolId: 1,
      uploadDate: new Date("2024-03-01"),
      fileUrl: "#",
      fileSize: "1.2 MB",
      author: "Admin",
      category: "Syllabus",
      views: 45,
      status: "approved"
    },
    {
      id: 2,
      title: "Student Handbook 2024",
      type: "PDF",
      schoolId: null, // Applies to all schools
      uploadDate: new Date("2024-01-15"),
      fileUrl: "#",
      fileSize: "3.5 MB",
      author: "Admin",
      category: "Handbook",
      views: 124,
      status: "approved"
    },
    {
      id: 3,
      title: "Instructor Evaluation Form",
      type: "DOCX",
      schoolId: null,
      uploadDate: new Date("2023-12-10"),
      fileUrl: "#",
      fileSize: "580 KB",
      author: "HR Department",
      category: "Form",
      views: 67,
      status: "approved"
    },
    {
      id: 4,
      title: "Technical Training Material",
      type: "ZIP",
      schoolId: 3,
      uploadDate: new Date("2024-02-25"),
      fileUrl: "#",
      fileSize: "15.2 MB",
      author: "Technical Dept",
      category: "Training",
      views: 38,
      status: "approved"
    },
    {
      id: 5,
      title: "Language Assessment Guide",
      type: "PDF",
      schoolId: 2,
      uploadDate: new Date("2024-02-14"),
      fileUrl: "#",
      fileSize: "2.1 MB",
      author: "Language Dept",
      category: "Assessment",
      views: 93,
      status: "approved"
    },
    {
      id: 6,
      title: "School Calendar 2024",
      type: "PDF",
      schoolId: null,
      uploadDate: new Date("2024-01-05"),
      fileUrl: "#",
      fileSize: "1.8 MB",
      author: "Admin",
      category: "Calendar",
      views: 215,
      status: "approved"
    },
    {
      id: 7,
      title: "Equipment Maintenance Manual",
      type: "PDF",
      schoolId: 1,
      uploadDate: new Date("2023-11-20"),
      fileUrl: "#",
      fileSize: "4.7 MB",
      author: "Maintenance",
      category: "Manual",
      views: 41,
      status: "approved"
    },
    {
      id: 8,
      title: "Graduation Ceremony Guidelines",
      type: "DOCX",
      schoolId: null,
      uploadDate: new Date("2024-03-10"),
      fileUrl: "#",
      fileSize: "720 KB",
      author: "Events Committee",
      category: "Event",
      views: 27,
      status: "pending"
    }
  ];
  
  // Filter documents
  const filteredDocuments = mockDocuments.filter(doc => 
    (selectedSchool ? (doc.schoolId === currentSchool?.id || doc.schoolId === null) : true) &&
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (typeFilter === "all" || doc.type === typeFilter) &&
    (categoryFilter === "all" || doc.category === categoryFilter)
  );
  
  // Get unique document types and categories for filters
  const uniqueTypes = Array.from(new Set(mockDocuments.map(doc => doc.type)));
  const uniqueCategories = Array.from(new Set(mockDocuments.map(doc => doc.category)));
  
  // Format date helper
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM dd, yyyy");
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
                        {getDocumentIcon(doc.type)}
                        <Badge className="mt-2" variant="outline">{doc.type}</Badge>
                      </div>
                      <h3 className="font-medium text-center truncate" title={doc.title}>{doc.title}</h3>
                      <div className="flex justify-center items-center text-xs text-gray-500 mt-2">
                        <Calendar className="h-3 w-3 mr-1" /> {formatDate(doc.uploadDate)}
                      </div>
                      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                        <span>{doc.fileSize}</span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" /> {doc.views}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 pt-0 border-t border-gray-100">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button variant="ghost" size="sm">
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
                      <TableHead>Size</TableHead>
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
                            {doc.type === "PDF" && <FilePen className="h-5 w-5 text-red-500" />}
                            {doc.type === "DOCX" && <FileText className="h-5 w-5 text-blue-500" />}
                            {doc.type === "ZIP" && <FileArchive className="h-5 w-5 text-yellow-500" />}
                          </TableCell>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>{doc.category}</TableCell>
                          <TableCell>{doc.fileSize}</TableCell>
                          <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                          <TableCell>{doc.author}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <svg width="15" height="3" viewBox="0 0 15 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.5 1.5C1.5 2.05228 1.94772 2.5 2.5 2.5C3.05228 2.5 3.5 2.05228 3.5 1.5C3.5 0.947715 3.05228 0.5 2.5 0.5C1.94772 0.5 1.5 0.947715 1.5 1.5Z" fill="currentColor"/>
                                    <path d="M6.5 1.5C6.5 2.05228 6.94772 2.5 7.5 2.5C8.05228 2.5 8.5 2.05228 8.5 1.5C8.5 0.947715 8.05228 0.5 7.5 0.5C6.94772 0.5 6.5 0.947715 6.5 1.5Z" fill="currentColor"/>
                                    <path d="M11.5 1.5C11.5 2.05228 11.9477 2.5 12.5 2.5C13.0523 2.5 13.5 2.05228 13.5 1.5C13.5 0.947715 13.0523 0.5 12.5 0.5C11.9477 0.5 11.5 0.947715 11.5 1.5Z" fill="currentColor"/>
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" /> Download
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <MessageSquare className="mr-2 h-4 w-4" /> Comment
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ThumbsUp className="mr-2 h-4 w-4" /> Approve
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
