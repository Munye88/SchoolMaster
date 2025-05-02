import { useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { PrintButton } from "@/components/ui/print-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  FileText, 
  Search, 
  Copy, 
  BookOpen, 
  FileUp, 
  Filter,
  Printer,
  CheckCircle2,
  AlertCircle,
  BookTemplate,
  ShoppingCart,
  History,
  BarChart
} from "lucide-react";

// Mock data for ALCPT forms
const alcptForms = [
  { id: 1, formNumber: "ALCPT Form 1", availableCopies: 25, lastOrdered: "2025-01-15" },
  { id: 2, formNumber: "ALCPT Form 2", availableCopies: 20, lastOrdered: "2025-01-15" },
  { id: 3, formNumber: "ALCPT Form 3", availableCopies: 15, lastOrdered: "2025-02-10" },
  { id: 4, formNumber: "ALCPT Form 4", availableCopies: 12, lastOrdered: "2025-02-10" },
  { id: 5, formNumber: "ALCPT Form 5", availableCopies: 10, lastOrdered: "2025-03-05" },
  { id: 6, formNumber: "ALCPT Form 6A", availableCopies: 15, lastOrdered: "2025-03-15" },
  { id: 7, formNumber: "ALCPT Form 6B", availableCopies: 10, lastOrdered: "2025-03-15" },
  { id: 8, formNumber: "ALCPT Form 7", availableCopies: 8, lastOrdered: "2025-03-20" },
  { id: 9, formNumber: "ALCPT Form 8", availableCopies: 5, lastOrdered: "2024-12-15" },
  { id: 10, formNumber: "ALCPT Form 9", availableCopies: 30, lastOrdered: "2025-04-01" },
];

// Mock data for answer sheets
const answerSheets = [
  { id: 1, type: "Standard", availableCopies: 500, lastOrdered: "2025-03-01" },
  { id: 2, type: "ECL", availableCopies: 300, lastOrdered: "2025-02-15" },
  { id: 3, type: "OPI", availableCopies: 150, lastOrdered: "2025-01-10" },
];

// Mock data for DLI reference books
const referenceBooks = [
  { id: 1, title: "American Language Course Book 1", availableCopies: 45, lastOrdered: "2024-09-15" },
  { id: 2, title: "American Language Course Book 2", availableCopies: 40, lastOrdered: "2024-09-15" },
  { id: 3, title: "American Language Course Book 3", availableCopies: 38, lastOrdered: "2024-10-20" },
  { id: 4, title: "American Language Course Book 4", availableCopies: 35, lastOrdered: "2024-10-20" },
  { id: 5, title: "American Language Course Book 5", availableCopies: 32, lastOrdered: "2024-11-05" },
  { id: 6, title: "American Language Course Book 6", availableCopies: 30, lastOrdered: "2024-11-05" },
  { id: 7, title: "ECL Study Guide", availableCopies: 25, lastOrdered: "2025-01-10" },
  { id: 8, title: "OPI Preparation Manual", availableCopies: 15, lastOrdered: "2025-01-10" },
  { id: 9, title: "Aviation English Reference", availableCopies: 20, lastOrdered: "2025-02-15" },
  { id: 10, title: "Technical English Vocabulary Guide", availableCopies: 18, lastOrdered: "2025-02-15" },
];

const DLI = () => {
  const { selectedSchool } = useSchool();
  const [activeTab, setActiveTab] = useState("alcpt-forms");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter functions for each tab content
  const filteredALCPTForms = alcptForms.filter(form => 
    form.formNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredAnswerSheets = answerSheets.filter(sheet => 
    sheet.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredReferenceBooks = referenceBooks.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to format date strings
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Function to determine inventory status color
  const getInventoryStatusColor = (count: number) => {
    if (count > 20) return "bg-green-100 text-green-800 border-green-200";
    if (count > 10) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  // Function to determine inventory status text
  const getInventoryStatus = (count: number) => {
    if (count > 20) return "Sufficient";
    if (count > 10) return "Low Stock";
    return "Critical";
  };

  return (
    <div id="dliContent" className="flex-1 bg-gradient-to-b from-blue-50 via-white to-blue-50 overflow-y-auto">
      {/* Hero Header with centered title */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-purple-600 py-10 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-3">
            {selectedSchool 
              ? `${selectedSchool.name} DLI Book Inventory` 
              : 'DLI Book Inventory Management'}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Comprehensive tracking and management system for DLI books, ALCPT forms, and answer sheets
          </p>
          
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button className="bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 gap-2 font-medium">
              <FileUp className="h-4 w-4" /> Order Forms
            </Button>
            <Button className="bg-purple-700 hover:bg-purple-800 border-none gap-2 font-medium">
              <Download className="h-4 w-4" /> Download Catalog
            </Button>
            <PrintButton contentId="dliContent" />
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Forms</p>
                  <p className="text-white text-3xl font-bold">{alcptForms.length}</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Answer Sheets</p>
                  <p className="text-white text-3xl font-bold">{answerSheets.length}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <Copy className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Reference Books</p>
                  <p className="text-white text-3xl font-bold">{referenceBooks.length}</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-red-100 text-sm font-medium mb-1">Critical Stock</p>
                  <p className="text-white text-3xl font-bold">
                    {[...alcptForms, ...answerSheets, ...referenceBooks].filter(item => 
                      'availableCopies' in item && item.availableCopies <= 10
                    ).length}
                  </p>
                </div>
                <div className="bg-red-500 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden mb-8">
          {/* Colorful Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-blue-100">
              <div className="flex justify-center py-4">
                <TabsList className="bg-gray-100 p-1 rounded-full border border-gray-200 shadow-sm">
                  <TabsTrigger 
                    value="alcpt-forms"
                    className="rounded-full px-6 py-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    ALCPT Forms
                  </TabsTrigger>
                  <TabsTrigger 
                    value="answer-sheets"
                    className="rounded-full px-6 py-1.5 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Answer Sheets
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reference-books"
                    className="rounded-full px-6 py-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Reference Books
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Search Box - Centered */}
              <div className="flex justify-center px-4 pb-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
                  <Input 
                    placeholder="Search resources..." 
                    className="pl-10 py-6 rounded-full bg-blue-50 border-blue-200 focus:border-blue-500 text-center"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          
            <TabsContent value="alcpt-forms" className="mt-0 px-4 py-6">
              <Card className="border-blue-200 shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white text-xl">ALCPT Forms Inventory</CardTitle>
                      <CardDescription className="text-blue-100">
                        Track available forms and manage distribution
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" className="gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
                        <Filter className="h-4 w-4" /> Filter
                      </Button>
                      <Button variant="secondary" size="sm" className="gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
                        <ShoppingCart className="h-4 w-4" /> Order
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-blue-50">
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Form Number</TableHead>
                        <TableHead className="text-center">Available Copies</TableHead>
                        <TableHead>Last Ordered</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredALCPTForms.map((form) => (
                        <TableRow key={form.id} className="hover:bg-blue-50 cursor-pointer transition-colors">
                          <TableCell className="font-medium">{form.id}</TableCell>
                          <TableCell className="font-medium text-blue-700">{form.formNumber}</TableCell>
                          <TableCell className="text-center">{form.availableCopies}</TableCell>
                          <TableCell>{formatDate(form.lastOrdered)}</TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant="outline" 
                              className={getInventoryStatusColor(form.availableCopies)}
                            >
                              {getInventoryStatus(form.availableCopies)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          
            <TabsContent value="answer-sheets" className="mt-0 px-4 py-6">
              <Card className="border-green-200 shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white text-xl">Answer Sheets Inventory</CardTitle>
                      <CardDescription className="text-green-100">
                        Manage answer sheets for different test types
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" className="gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
                        <Filter className="h-4 w-4" /> Filter
                      </Button>
                      <Button variant="secondary" size="sm" className="gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
                        <Printer className="h-4 w-4" /> Print
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-green-50">
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Available Copies</TableHead>
                        <TableHead>Last Ordered</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAnswerSheets.map((sheet) => (
                        <TableRow key={sheet.id} className="hover:bg-green-50 cursor-pointer transition-colors">
                          <TableCell className="font-medium">{sheet.id}</TableCell>
                          <TableCell className="font-medium text-green-700">{sheet.type}</TableCell>
                          <TableCell className="text-center">{sheet.availableCopies}</TableCell>
                          <TableCell>{formatDate(sheet.lastOrdered)}</TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant="outline" 
                              className={getInventoryStatusColor(sheet.availableCopies)}
                            >
                              {getInventoryStatus(sheet.availableCopies)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-800 hover:bg-green-50">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          
            <TabsContent value="reference-books" className="mt-0 px-4 py-6">
              <Card className="border-purple-200 shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-500 text-white pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white text-xl">Reference Books Inventory</CardTitle>
                      <CardDescription className="text-purple-100">
                        Track DLI reference materials and textbooks
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" className="gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
                        <Filter className="h-4 w-4" /> Filter
                      </Button>
                      <Button variant="secondary" size="sm" className="gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
                        <BookTemplate className="h-4 w-4" /> Catalog
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-purple-50">
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-center">Available Copies</TableHead>
                        <TableHead>Last Ordered</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReferenceBooks.map((book) => (
                        <TableRow key={book.id} className="hover:bg-purple-50 cursor-pointer transition-colors">
                          <TableCell className="font-medium">{book.id}</TableCell>
                          <TableCell className="font-medium text-purple-700">{book.title}</TableCell>
                          <TableCell className="text-center">{book.availableCopies}</TableCell>
                          <TableCell>{formatDate(book.lastOrdered)}</TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant="outline" 
                              className={getInventoryStatusColor(book.availableCopies)}
                            >
                              {getInventoryStatus(book.availableCopies)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-800 hover:bg-purple-50">
                              <BookOpen className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      
        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-blue-200 shadow-md">
            <CardHeader className="bg-blue-50 border-b border-blue-100 pb-3">
              <CardTitle className="text-center text-blue-700 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Inventory Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Total ALCPT Forms:</span>
                  <span className="font-semibold">{alcptForms.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Total Answer Sheets:</span>
                  <span className="font-semibold">{answerSheets.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Total Reference Books:</span>
                  <span className="font-semibold">{referenceBooks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-amber-500">Low Stock Items:</span>
                  <span className="font-semibold text-amber-600">
                    {[...alcptForms, ...answerSheets, ...referenceBooks].filter(item => 
                      'availableCopies' in item && item.availableCopies <= 20 && item.availableCopies > 10
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-red-500">Critical Stock Items:</span>
                  <span className="font-semibold text-red-600">
                    {[...alcptForms, ...answerSheets, ...referenceBooks].filter(item => 
                      'availableCopies' in item && item.availableCopies <= 10
                    ).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card className="border-green-200 shadow-md">
            <CardHeader className="bg-green-50 border-b border-green-100 pb-3">
              <CardTitle className="text-center text-green-700 flex items-center justify-center gap-2">
                <History className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="p-3 border border-green-100 rounded-lg bg-green-50/50">
                  <p className="text-sm font-medium text-green-800">ALCPT Form 9</p>
                  <p className="text-xs text-gray-500">30 copies ordered</p>
                  <p className="text-xs text-gray-400">April 1, 2025</p>
                </div>
                <div className="p-3 border border-green-100 rounded-lg bg-green-50/50">
                  <p className="text-sm font-medium text-green-800">ALCPT Forms 6A & 6B</p>
                  <p className="text-xs text-gray-500">25 copies (combined) ordered</p>
                  <p className="text-xs text-gray-400">March 15, 2025</p>
                </div>
                <div className="p-3 border border-green-100 rounded-lg bg-green-50/50">
                  <p className="text-sm font-medium text-green-800">Standard Answer Sheets</p>
                  <p className="text-xs text-gray-500">500 copies ordered</p>
                  <p className="text-xs text-gray-400">March 1, 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="bg-purple-50 border-b border-purple-100 pb-3">
              <CardTitle className="text-center text-purple-700 flex items-center justify-center gap-2">
                <BarChart className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resource-type" className="text-purple-700">Most Used Resources</Label>
                  <div className="bg-purple-50 p-2 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">ALCPT Form 1</span>
                      <span className="text-xs text-purple-600">82%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-2 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Standard Answer Sheets</span>
                      <span className="text-xs text-purple-600">76%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-2 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">ALC Book 1</span>
                      <span className="text-xs text-purple-600">64%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '64%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DLI;