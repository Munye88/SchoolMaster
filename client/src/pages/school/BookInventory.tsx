import React from "react";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FilePlus, Printer, Search, Share2 } from "lucide-react";
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
    title: "American Language Course Book 1",
    author: "DLI",
    publisher: "Defense Language Institute",
    quantity: 45,
    category: "Student Textbook",
    isbn: "978-1-23456-789-0",
    location: "Main Storage",
    status: "Available"
  },
  {
    id: 2,
    title: "American Language Course Book 2",
    author: "DLI",
    publisher: "Defense Language Institute",
    quantity: 38,
    category: "Student Textbook",
    isbn: "978-1-23456-789-1",
    location: "Main Storage",
    status: "Available"
  },
  {
    id: 3,
    title: "American Language Course Book 3",
    author: "DLI",
    publisher: "Defense Language Institute",
    quantity: 25,
    category: "Student Textbook",
    isbn: "978-1-23456-789-2",
    location: "Main Storage",
    status: "Available"
  },
  {
    id: 4,
    title: "Technical English for Aviation",
    author: "Henry Jefferson",
    publisher: "Sky Publishing",
    quantity: 8,
    category: "Technical Manual",
    isbn: "978-1-23456-789-3",
    location: "Aviation Section",
    status: "Low Stock"
  },
  {
    id: 5,
    title: "Advanced English Grammar",
    author: "Emily Watson",
    publisher: "Academic Press",
    quantity: 0,
    category: "Reference",
    isbn: "978-1-23456-789-4",
    location: "Reference Section",
    status: "Out of Stock"
  },
  {
    id: 6,
    title: "ALCPT Practice Tests",
    author: "DLI Team",
    publisher: "Defense Language Institute",
    quantity: 12,
    category: "Assessment Material",
    isbn: "978-1-23456-789-5",
    location: "Assessment Shelf",
    status: "Low Stock"
  },
  {
    id: 7,
    title: "English for Naval Operations",
    author: "Robert Miller",
    publisher: "Naval Press",
    quantity: 20,
    category: "Technical Manual",
    isbn: "978-1-23456-789-6",
    location: "Technical Section",
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
  const { currentSchool } = useSchool();
  
  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {currentSchool ? `${currentSchool.name} Book Inventory` : 'Book Inventory'}
          </h1>
          <p className="text-gray-500">Manage and track textbooks and learning materials</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Printer size={16} /> Print
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
                <p className="text-sm font-medium">Book Order Placed</p>
                <p className="text-xs text-gray-500">50 copies of "American Language Course Book 1" ordered</p>
                <p className="text-xs text-gray-400">Today, 9:15 AM</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm font-medium">Low Stock Alert</p>
                <p className="text-xs text-gray-500">"Technical English for Aviation" is running low</p>
                <p className="text-xs text-gray-400">Yesterday, 2:30 PM</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm font-medium">Books Issued</p>
                <p className="text-xs text-gray-500">15 copies of "ALCPT Practice Tests" issued to Aviation class</p>
                <p className="text-xs text-gray-400">April 8, 2025</p>
              </div>
              <div>
                <p className="text-sm font-medium">Inventory Restocked</p>
                <p className="text-xs text-gray-500">30 new copies of "Advanced English Grammar" received</p>
                <p className="text-xs text-gray-400">April 5, 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolBookInventory;