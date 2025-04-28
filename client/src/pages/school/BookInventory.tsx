import React from "react";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FilePlus, Printer, Search, Share2 } from "lucide-react";
import { PrintButton } from "@/components/ui/print-button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  quantity: number;
  category: string;
  isbn: string;
  location: string;
  status: "Available" | "Low Stock" | "Out of Stock";
}

const mockBooks: Book[] = [
  {
    id: 1,
    title: "ALC Book 1 - Student Textbook",
    author: "DLI",
    publisher: "Defense Language Institute",
    quantity: 120,
    category: "ALC Materials",
    isbn: "978-1-DLI-ALC-01",
    location: "ELS Storage Room 103",
    status: "Available"
  },
  {
    id: 2,
    title: "ALC Book 2 - Student Textbook",
    author: "DLI",
    publisher: "Defense Language Institute",
    quantity: 115,
    category: "ALC Materials",
    isbn: "978-1-DLI-ALC-02",
    location: "ELS Storage Room 103",
    status: "Available"
  },
  {
    id: 3,
    title: "ALC Book 3 - Student Textbook",
    author: "DLI",
    publisher: "Defense Language Institute",
    quantity: 108,
    category: "ALC Materials",
    isbn: "978-1-DLI-ALC-03",
    location: "ELS Storage Room 103",
    status: "Available"
  },
  {
    id: 4,
    title: "ALC Book 4 - Student Textbook",
    author: "DLI",
    publisher: "Defense Language Institute",
    quantity: 95,
    category: "ALC Materials",
    isbn: "978-1-DLI-ALC-04",
    location: "ELS Storage Room 103",
    status: "Available"
  },
  {
    id: 5,
    title: "ALC Book 5 - Student Textbook",
    author: "DLI",
    publisher: "Defense Language Institute",
    quantity: 82,
    category: "ALC Materials",
    isbn: "978-1-DLI-ALC-05",
    location: "ELS Storage Room 103",
    status: "Available"
  },
  {
    id: 6,
    title: "ALC Book 6 - Student Textbook",
    author: "DLI",
    publisher: "Defense Language Institute",
    quantity: 76,
    category: "ALC Materials",
    isbn: "978-1-DLI-ALC-06",
    location: "ELS Storage Room 103",
    status: "Available"
  },
  {
    id: 7,
    title: "Aviation English Course Book",
    author: "DLI AE Division",
    publisher: "Defense Language Institute",
    quantity: 54,
    category: "Aviation English",
    isbn: "978-1-DLI-AE-01",
    location: "Aviation Section Cabinet",
    status: "Available"
  },
  {
    id: 8,
    title: "Aviation English Workbook",
    author: "DLI AE Division",
    publisher: "Defense Language Institute",
    quantity: 42,
    category: "Aviation English",
    isbn: "978-1-DLI-AE-02",
    location: "Aviation Section Cabinet",
    status: "Available"
  },
  {
    id: 9,
    title: "Cadets 223 Textbook",
    author: "Naval ELT Division",
    publisher: "Naval Forces Publishing",
    quantity: 68,
    category: "Cadets Materials",
    isbn: "978-1-NF-CDT-223",
    location: "Technical Section Room 105",
    status: "Available"
  },
  {
    id: 10,
    title: "Cadets 224 Textbook",
    author: "Naval ELT Division",
    publisher: "Naval Forces Publishing",
    quantity: 65,
    category: "Cadets Materials",
    isbn: "978-1-NF-CDT-224",
    location: "Technical Section Room 105",
    status: "Available"
  },
  {
    id: 11,
    title: "Technical English Manual",
    author: "Naval Tech Writing Team",
    publisher: "Naval Forces Publishing",
    quantity: 45,
    category: "Technical English",
    isbn: "978-1-NF-TE-01",
    location: "Technical Section Room 105",
    status: "Available"
  },
  {
    id: 12,
    title: "ALCPT Form 1",
    author: "DLI Testing Division",
    publisher: "Defense Language Institute",
    quantity: 8,
    category: "Assessment Materials",
    isbn: "978-1-DLI-ALCPT-01",
    location: "Secure Testing Room 101",
    status: "Low Stock"
  },
  {
    id: 13,
    title: "ALCPT Form 2",
    author: "DLI Testing Division",
    publisher: "Defense Language Institute",
    quantity: 7,
    category: "Assessment Materials",
    isbn: "978-1-DLI-ALCPT-02",
    location: "Secure Testing Room 101",
    status: "Low Stock"
  },
  {
    id: 14,
    title: "ALCPT Form 3",
    author: "DLI Testing Division",
    publisher: "Defense Language Institute",
    quantity: 0,
    category: "Assessment Materials",
    isbn: "978-1-DLI-ALCPT-03",
    location: "Secure Testing Room 101",
    status: "Out of Stock"
  },
  {
    id: 15,
    title: "ECL Official Guide",
    author: "DLI Testing Division",
    publisher: "Defense Language Institute",
    quantity: 3,
    category: "Assessment Materials",
    isbn: "978-1-DLI-ECL-01",
    location: "Secure Testing Room 101",
    status: "Low Stock"
  },
  {
    id: 16,
    title: "ECL Practice Tests",
    author: "DLI Testing Division",
    publisher: "Defense Language Institute",
    quantity: 0,
    category: "Assessment Materials",
    isbn: "978-1-DLI-ECL-02",
    location: "Secure Testing Room 101",
    status: "Out of Stock"
  },
  {
    id: 17,
    title: "Refresher Course Workbook",
    author: "DLI Refresher Division",
    publisher: "Defense Language Institute",
    quantity: 38,
    category: "Refresher Materials",
    isbn: "978-1-DLI-REF-01",
    location: "ELS Storage Room 103",
    status: "Available"
  },
  {
    id: 18,
    title: "Instructor Resource Guide",
    author: "DLI Instructor Development",
    publisher: "Defense Language Institute",
    quantity: 22,
    category: "Instructor Materials",
    isbn: "978-1-DLI-INSTR-01",
    location: "Instructor Room 102",
    status: "Available"
  }
];

const getStatusColor = (status: Book["status"]) => {
  switch (status) {
    case "Available":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Low Stock":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "Out of Stock":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

const SchoolBookInventory = () => {
  const { selectedSchool } = useSchool();
  
  return (
    <div id="bookInventoryContent" className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {selectedSchool ? `${selectedSchool.name} Book Inventory` : 'Book Inventory'}
          </h1>
          <p className="text-gray-500">Manage and track textbooks and learning materials</p>
        </div>
        
        <div className="flex gap-2">
          <PrintButton contentId="bookInventoryContent" />
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
            <FilePlus size={16} /> Add Book
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Book Inventory</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search books..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Book ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBooks.map(book => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.id}</TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.publisher}</TableCell>
                    <TableCell>{book.category}</TableCell>
                    <TableCell className="text-center">{book.quantity}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={getStatusColor(book.status)}>
                        {book.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{book.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Books:</span>
                <span className="font-semibold">{mockBooks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Quantity:</span>
                <span className="font-semibold">{mockBooks.reduce((sum, book) => sum + book.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Available Titles:</span>
                <span className="font-semibold">{mockBooks.filter(book => book.status === "Available").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Low Stock Titles:</span>
                <span className="font-semibold text-yellow-600">{mockBooks.filter(book => book.status === "Low Stock").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Out of Stock Titles:</span>
                <span className="font-semibold text-red-600">{mockBooks.filter(book => book.status === "Out of Stock").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Book Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(mockBooks.map(book => book.category))).map(category => (
                <div key={category} className="flex justify-between">
                  <span className="text-gray-500">{category}:</span>
                  <span className="font-semibold">{mockBooks.filter(book => book.category === category).length}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <p className="text-sm font-medium">ALCPT Forms Ordered</p>
                <p className="text-xs text-gray-500">20 copies each of ALCPT Forms 1, 2, and 3 ordered from DLI</p>
                <p className="text-xs text-gray-400">Today, 10:30 AM</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm font-medium">Low Stock Alert</p>
                <p className="text-xs text-gray-500">ECL Official Guide inventory is critically low (3 copies remaining)</p>
                <p className="text-xs text-gray-400">Yesterday, 2:45 PM</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm font-medium">Books Issued</p>
                <p className="text-xs text-gray-500">25 copies of "Aviation English Course Book" issued to new Aviation class</p>
                <p className="text-xs text-gray-400">April 8, 2025</p>
              </div>
              <div>
                <p className="text-sm font-medium">Inventory Audit Completed</p>
                <p className="text-xs text-gray-500">Quarterly inventory audit completed for all ALC materials</p>
                <p className="text-xs text-gray-400">April 1, 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolBookInventory;