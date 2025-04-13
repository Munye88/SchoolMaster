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
  Printer
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
    <div id="dliContent" className="flex-1 p-6 bg-gradient-to-b from-gray-50 to-white overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0A2463] to-blue-600 bg-clip-text text-transparent">
            {selectedSchool 
              ? `${selectedSchool.name} DLI Resources` 
              : 'DLI Resources Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage ALCPT forms, answer sheets, and reference materials
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <PrintButton contentId="dliContent" />
          <Button variant="outline" className="gap-2">
            <FileUp className="h-4 w-4" /> Order Forms
          </Button>
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
            <Download className="h-4 w-4" /> Download Catalog
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-blue-50 p-1 rounded-lg border border-blue-100 shadow-sm">
              <TabsTrigger 
                value="alcpt-forms"
                className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                ALCPT Forms
              </TabsTrigger>
              <TabsTrigger 
                value="answer-sheets"
                className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
              >
                <Copy className="h-4 w-4 mr-2" />
                Answer Sheets
              </TabsTrigger>
              <TabsTrigger 
                value="reference-books"
                className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Reference Books
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search resources..." 
              className="pl-8 border-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="alcpt-forms" className="mt-0">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>ALCPT Forms Inventory</CardTitle>
                  <CardDescription>
                    Track available forms and manage distribution
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" /> Filter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Printer className="h-4 w-4" /> Print Forms
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
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.id}</TableCell>
                      <TableCell>{form.formNumber}</TableCell>
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
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="answer-sheets" className="mt-0">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Answer Sheets Inventory</CardTitle>
                  <CardDescription>
                    Manage answer sheets for different test types
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" /> Filter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Printer className="h-4 w-4" /> Print Sheets
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-blue-50">
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
                    <TableRow key={sheet.id}>
                      <TableCell className="font-medium">{sheet.id}</TableCell>
                      <TableCell>{sheet.type}</TableCell>
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
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reference-books" className="mt-0">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Reference Books Inventory</CardTitle>
                  <CardDescription>
                    Track DLI reference materials and textbooks
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" /> Filter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" /> Order Books
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-blue-50">
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
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.id}</TableCell>
                      <TableCell>{book.title}</TableCell>
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
                        <Button variant="ghost" size="sm">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resource Summary</CardTitle>
          </CardHeader>
          <CardContent>
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
                <span className="text-sm font-medium text-gray-500">Low Stock Items:</span>
                <span className="font-semibold text-amber-600">
                  {[...alcptForms, ...answerSheets, ...referenceBooks].filter(item => 
                    'availableCopies' in item && item.availableCopies <= 20 && item.availableCopies > 10
                  ).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Critical Stock Items:</span>
                <span className="font-semibold text-red-600">
                  {[...alcptForms, ...answerSheets, ...referenceBooks].filter(item => 
                    'availableCopies' in item && item.availableCopies <= 10
                  ).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border border-blue-100 rounded-lg bg-blue-50">
                <p className="text-sm font-medium text-blue-800">ALCPT Form 9</p>
                <p className="text-xs text-gray-500">30 copies ordered</p>
                <p className="text-xs text-gray-400">April 1, 2025</p>
              </div>
              <div className="p-3 border border-blue-100 rounded-lg bg-blue-50">
                <p className="text-sm font-medium text-blue-800">ALCPT Forms 6A & 6B</p>
                <p className="text-xs text-gray-500">25 copies (combined) ordered</p>
                <p className="text-xs text-gray-400">March 15, 2025</p>
              </div>
              <div className="p-3 border border-blue-100 rounded-lg bg-blue-50">
                <p className="text-sm font-medium text-blue-800">Standard Answer Sheets</p>
                <p className="text-xs text-gray-500">500 copies ordered</p>
                <p className="text-xs text-gray-400">March 1, 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Order Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resource-type">Resource Type</Label>
                <select 
                  id="resource-type" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alcpt">ALCPT Form</option>
                  <option value="answer-sheet">Answer Sheet</option>
                  <option value="reference">Reference Book</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-id">Item</Label>
                <select 
                  id="item-id" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an item</option>
                  <option value="1">ALCPT Form 1</option>
                  <option value="2">ALCPT Form 2</option>
                  <option value="3">ALCPT Form 3</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" min="1" defaultValue="10" />
              </div>
              <Button className="w-full bg-[#0A2463] hover:bg-[#071A4A]">
                Submit Order
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DLI;