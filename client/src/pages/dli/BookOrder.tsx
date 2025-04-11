import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSchool } from '@/hooks/useSchool';
import { BookText, CalendarDays, Search, Filter, Download, Printer, ArrowUpDown, Plus, FileText, FileCheck, Package, Edit, Trash2, Upload, FileUp } from 'lucide-react';

// Mock data for book orders - expanded to include more books for each school
const bookOrders = [
  // KNFA Books
  { id: 1, name: 'American Language Course Book 1', level: 'Beginner', quantity: 25, status: 'In Stock', schoolId: 349 },
  { id: 2, name: 'American Language Course Book 2', level: 'Beginner', quantity: 30, status: 'In Stock', schoolId: 349 },
  { id: 3, name: 'American Language Course Book 3', level: 'Elementary', quantity: 15, status: 'Low Stock', schoolId: 349 },
  { id: 9, name: 'American Language Course Book 9', level: 'Advanced', quantity: 10, status: 'Low Stock', schoolId: 349 },
  { id: 11, name: 'American Language Course Book 12', level: 'Advanced', quantity: 8, status: 'In Stock', schoolId: 349 },
  { id: 13, name: 'American Language Course Book 15', level: 'Expert', quantity: 5, status: 'Low Stock', schoolId: 349 },
  { id: 16, name: 'American Language Course Book 18', level: 'Expert', quantity: 2, status: 'Out of Stock', schoolId: 349 },
  
  // NFS East Books
  { id: 4, name: 'American Language Course Book 4', level: 'Elementary', quantity: 8, status: 'Out of Stock', schoolId: 350 },
  { id: 5, name: 'American Language Course Book 5', level: 'Intermediate', quantity: 20, status: 'In Stock', schoolId: 350 },
  { id: 10, name: 'American Language Course Book 10', level: 'Advanced', quantity: 3, status: 'Out of Stock', schoolId: 350 },
  { id: 14, name: 'American Language Course Book 16', level: 'Expert', quantity: 6, status: 'In Stock', schoolId: 350 },
  { id: 17, name: 'American Language Course Book 21', level: 'Expert', quantity: 4, status: 'Low Stock', schoolId: 350 },
  { id: 19, name: 'American Language Course Book 25', level: 'Master', quantity: 2, status: 'Out of Stock', schoolId: 350 },
  { id: 21, name: 'American Language Course Book 29', level: 'Master', quantity: 1, status: 'Out of Stock', schoolId: 350 },
  
  // NFS West Books
  { id: 6, name: 'American Language Course Book 6', level: 'Intermediate', quantity: 18, status: 'In Stock', schoolId: 351 },
  { id: 7, name: 'American Language Course Book 7', level: 'Upper Intermediate', quantity: 12, status: 'Low Stock', schoolId: 351 },
  { id: 8, name: 'American Language Course Book 8', level: 'Upper Intermediate', quantity: 5, status: 'Out of Stock', schoolId: 351 },
  { id: 12, name: 'American Language Course Book 14', level: 'Advanced', quantity: 7, status: 'In Stock', schoolId: 351 },
  { id: 15, name: 'American Language Course Book 17', level: 'Expert', quantity: 9, status: 'In Stock', schoolId: 351 },
  { id: 18, name: 'American Language Course Book 23', level: 'Master', quantity: 3, status: 'Low Stock', schoolId: 351 },
  { id: 20, name: 'American Language Course Book 28', level: 'Master', quantity: 0, status: 'Out of Stock', schoolId: 351 },
  { id: 22, name: 'American Language Course Book 34', level: 'Master', quantity: 0, status: 'Out of Stock', schoolId: 351 },
];

// Mock data for order history
const orderHistory = [
  { id: 101, date: '2025-03-15', books: 'ALC Books 1-5', quantity: 50, status: 'Delivered', schoolId: 349 },
  { id: 102, date: '2025-02-28', books: 'ALC Books 6-10', quantity: 40, status: 'Delivered', schoolId: 350 },
  { id: 103, date: '2025-01-20', books: 'ALC Books 1-3', quantity: 30, status: 'Delivered', schoolId: 351 },
  { id: 104, date: '2024-12-10', books: 'ALC Books 4-7', quantity: 45, status: 'Delivered', schoolId: 349 },
  { id: 105, date: '2024-11-05', books: 'ALC Books 8-10', quantity: 25, status: 'Delivered', schoolId: 350 },
];

// Mock data for new order
const availableBooks = [
  { id: 1, name: 'American Language Course Book 1', price: 25.99 },
  { id: 2, name: 'American Language Course Book 2', price: 25.99 },
  { id: 3, name: 'American Language Course Book 3', price: 27.99 },
  { id: 4, name: 'American Language Course Book 4', price: 27.99 },
  { id: 5, name: 'American Language Course Book 5', price: 29.99 },
  { id: 6, name: 'American Language Course Book 6', price: 29.99 },
  { id: 7, name: 'American Language Course Book 7', price: 31.99 },
  { id: 8, name: 'American Language Course Book 8', price: 31.99 },
  { id: 9, name: 'American Language Course Book 9', price: 33.99 },
  { id: 10, name: 'American Language Course Book 10', price: 33.99 },
  { id: 11, name: 'American Language Course Book 11', price: 35.99 },
  { id: 12, name: 'American Language Course Book 12', price: 35.99 },
  { id: 13, name: 'General English Training Audio CDs', price: 45.99 },
  { id: 14, name: 'Aviation English Handbook', price: 38.99 },
  { id: 15, name: 'Military Terminology Dictionary', price: 42.99 },
];

const BookOrder = () => {
  const { toast } = useToast();
  const { selectedSchool } = useSchool();
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [localBookOrders, setLocalBookOrders] = useState(bookOrders);
  
  // State for dialogs
  const [showAddBookDialog, setShowAddBookDialog] = useState(false);
  const [showEditBookDialog, setShowEditBookDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  // State for book being edited or deleted
  const [currentBook, setCurrentBook] = useState<{
    id?: number;
    name: string;
    level: string;
    quantity: number;
    status: string;
    schoolId: number;
  }>({
    name: '',
    level: 'Beginner',
    quantity: 0,
    status: 'Out of Stock',
    schoolId: selectedSchool?.id || 349,
  });
  
  // State for new order form
  const [orderItems, setOrderItems] = useState<{
    bookId: number;
    name: string;
    quantity: number;
    price: number;
  }[]>([]);
  
  // Filter books by school, search query, level, and status
  const filteredBooks = localBookOrders.filter(book => {
    const matchesSchool = !selectedSchool || book.schoolId === selectedSchool.id;
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || book.level === selectedLevel;
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
    
    return matchesSchool && matchesSearch && matchesLevel && matchesStatus;
  });
  
  // Add a new book to inventory
  const handleAddBook = () => {
    // Generate new ID by finding max ID and adding 1
    const newId = Math.max(...localBookOrders.map(book => book.id)) + 1;
    
    // Determine status based on quantity
    let status = 'Out of Stock';
    if (currentBook.quantity > 20) {
      status = 'In Stock';
    } else if (currentBook.quantity > 0) {
      status = 'Low Stock';
    }
    
    const newBook = {
      id: newId,
      name: currentBook.name,
      level: currentBook.level,
      quantity: currentBook.quantity,
      status: status,
      schoolId: currentBook.schoolId,
    };
    
    setLocalBookOrders([...localBookOrders, newBook]);
    setShowAddBookDialog(false);
    setCurrentBook({
      name: '',
      level: 'Beginner',
      quantity: 0,
      status: 'Out of Stock',
      schoolId: selectedSchool?.id || 349,
    });
    
    toast({
      title: "Book added",
      description: `${newBook.name} has been added to the inventory.`,
    });
  };
  
  // Edit an existing book
  const handleEditBook = () => {
    if (!currentBook.id) return;
    
    // Determine status based on quantity
    let status = 'Out of Stock';
    if (currentBook.quantity > 20) {
      status = 'In Stock';
    } else if (currentBook.quantity > 0) {
      status = 'Low Stock';
    }
    
    const updatedBooks = localBookOrders.map(book => {
      if (book.id === currentBook.id) {
        return {
          ...book,
          name: currentBook.name,
          level: currentBook.level,
          quantity: currentBook.quantity,
          status: status,
          schoolId: currentBook.schoolId,
        };
      }
      return book;
    });
    
    setLocalBookOrders(updatedBooks);
    setShowEditBookDialog(false);
    
    toast({
      title: "Book updated",
      description: `${currentBook.name} has been updated.`,
    });
  };
  
  // Delete a book
  const handleDeleteBook = () => {
    if (!currentBook.id) return;
    
    const updatedBooks = localBookOrders.filter(book => book.id !== currentBook.id);
    setLocalBookOrders(updatedBooks);
    setShowDeleteConfirmation(false);
    
    toast({
      title: "Book removed",
      description: `${currentBook.name} has been removed from the inventory.`,
    });
  };
  
  // Edit book setup
  const openEditDialog = (book: {
    id: number;
    name: string;
    level: string;
    quantity: number;
    status: string;
    schoolId: number;
  }) => {
    setCurrentBook({
      id: book.id,
      name: book.name,
      level: book.level,
      quantity: book.quantity,
      status: book.status,
      schoolId: book.schoolId,
    });
    setShowEditBookDialog(true);
  };
  
  // Delete book setup
  const openDeleteDialog = (book: {
    id: number;
    name: string;
    level: string;
    quantity: number;
    status: string;
    schoolId: number;
  }) => {
    setCurrentBook({
      id: book.id,
      name: book.name,
      level: book.level,
      quantity: book.quantity,
      status: book.status,
      schoolId: book.schoolId,
    });
    setShowDeleteConfirmation(true);
  };
  
  // Filter order history by school
  const filteredHistory = orderHistory.filter(order => {
    return !selectedSchool || order.schoolId === selectedSchool.id;
  });
  
  // Add book to order
  const addBookToOrder = (bookId: number) => {
    const bookToAdd = availableBooks.find(book => book.id === bookId);
    if (!bookToAdd) return;
    
    const existingItem = orderItems.find(item => item.bookId === bookId);
    if (existingItem) {
      setOrderItems(
        orderItems.map(item => 
          item.bookId === bookId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      );
    } else {
      setOrderItems([...orderItems, {
        bookId: bookToAdd.id,
        name: bookToAdd.name,
        quantity: 1,
        price: bookToAdd.price
      }]);
    }
  };
  
  // Update quantity of book in order
  const updateQuantity = (bookId: number, quantity: number) => {
    if (quantity < 1) {
      setOrderItems(orderItems.filter(item => item.bookId !== bookId));
      return;
    }
    
    setOrderItems(
      orderItems.map(item => 
        item.bookId === bookId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  // Submit order
  const submitOrder = () => {
    if (orderItems.length === 0) {
      toast({
        title: "No books selected",
        description: "Please add at least one book to your order.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Order submitted successfully",
      description: `Your order has been submitted with ${orderItems.length} book types.`,
    });
    
    // Clear order after submission
    setOrderItems([]);
  };
  
  // Calculate total price
  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Low Stock':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
          DLI Book Order Management
        </h1>
        <p className="text-gray-500 mt-2">
          Track, manage, and order books for {selectedSchool ? selectedSchool.name : 'all schools'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="h-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BookText className="text-indigo-600" size={18} />
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-indigo-600">
              {filteredBooks.reduce((total, book) => total + book.quantity, 0)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Across {selectedSchool ? '1 school' : '3 schools'} and {filteredBooks.length} book types
            </p>
            <Progress 
              value={75} 
              className="h-2 mt-4 bg-indigo-100"
            />
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="h-2 w-full bg-gradient-to-r from-purple-600 to-fuchsia-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="text-purple-600" size={18} />
              <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredBooks.filter(book => book.status === 'In Stock').length}
                </div>
                <div className="text-xs text-gray-500">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {filteredBooks.filter(book => book.status === 'Low Stock').length}
                </div>
                <div className="text-xs text-gray-500">Low Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredBooks.filter(book => book.status === 'Out of Stock').length}
                </div>
                <div className="text-xs text-gray-500">Out of Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="h-2 w-full bg-gradient-to-r from-fuchsia-600 to-pink-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="text-fuchsia-600" size={18} />
              <CardTitle className="text-sm font-medium">Order History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-fuchsia-600">
              {filteredHistory.length}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Total orders in the past 6 months
            </p>
            <div className="flex items-center justify-between mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 gap-1"
                onClick={() => setActiveTab('history')}
              >
                <FileCheck size={14} />
                View History
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1"
                onClick={() => setActiveTab('order')}
              >
                <Plus size={14} />
                New Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="inventory" className="gap-2">
            <Package size={16} />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="order" className="gap-2">
            <Plus size={16} />
            New Order
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <FileCheck size={16} />
            Order History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Book Inventory</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 gap-1"
                    onClick={() => {
                      setCurrentBook({
                        name: '',
                        level: 'Beginner',
                        quantity: 0,
                        status: 'Out of Stock',
                        schoolId: selectedSchool?.id || 349,
                      });
                      setShowAddBookDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Book
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 gap-1"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    <FileUp className="h-4 w-4" />
                    Upload Form
                  </Button>
                  <Button variant="outline" size="sm" className="h-9">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="h-9">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <CardDescription>
                View and manage your book inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search books..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Elementary">Elementary</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Upper Intermediate">Upper Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Book Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.name}</TableCell>
                          <TableCell>{book.level}</TableCell>
                          <TableCell>{book.quantity}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(book.status)}>
                              {book.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditDialog(book)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openDeleteDialog(book)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addBookToOrder(book.id)}
                              disabled={book.status === 'Out of Stock'}
                            >
                              Order
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No books found matching your filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="order">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="border-0 shadow-md h-full">
                <CardHeader>
                  <CardTitle>New Book Order</CardTitle>
                  <CardDescription>
                    Select books to add to your order
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Search available books..."
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="rounded-md border overflow-hidden mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Book Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableBooks.map((book) => (
                          <TableRow key={book.id}>
                            <TableCell className="font-medium">{book.name}</TableCell>
                            <TableCell>${book.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => addBookToOrder(book.id)}
                              >
                                Add
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="border-0 shadow-md h-full">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>
                    Review your order before submission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orderItems.length > 0 ? (
                    <div className="space-y-4">
                      {orderItems.map((item) => (
                        <div key={item.bookId} className="flex justify-between items-center border-b pb-3">
                          <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-500">Subtotal:</span>
                          <span className="font-medium">${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-500">Shipping:</span>
                          <span className="font-medium">$0.00</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span>${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BookText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p>Your order is empty</p>
                      <p className="text-sm mt-1">Add books from the available list</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={submitOrder}
                    disabled={orderItems.length === 0}
                  >
                    Submit Order
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Order History</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-9">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="h-9">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <CardDescription>
                View all previous book orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Books</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell>{order.books}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No order history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Book Dialog */}
      <Dialog open={showAddBookDialog} onOpenChange={setShowAddBookDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogDescription>
              Enter the details of the new book to add to the inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bookName" className="text-right">
                Book Name
              </Label>
              <Input
                id="bookName"
                className="col-span-3"
                value={currentBook.name}
                onChange={(e) => setCurrentBook({ ...currentBook, name: e.target.value })}
                placeholder="American Language Course Book X"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="level" className="text-right">
                Level
              </Label>
              <Select
                value={currentBook.level}
                onValueChange={(value) => setCurrentBook({ ...currentBook, level: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Elementary">Elementary</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Upper Intermediate">Upper Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                className="col-span-3"
                type="number"
                min="0"
                value={currentBook.quantity}
                onChange={(e) => setCurrentBook({ ...currentBook, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="school" className="text-right">
                School
              </Label>
              <Select
                value={currentBook.schoolId.toString()}
                onValueChange={(value) => setCurrentBook({ ...currentBook, schoolId: parseInt(value) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="349">KNFA</SelectItem>
                  <SelectItem value="350">NFS East</SelectItem>
                  <SelectItem value="351">NFS West</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBookDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBook}>Add Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={showEditBookDialog} onOpenChange={setShowEditBookDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>
              Update the details of the selected book.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editBookName" className="text-right">
                Book Name
              </Label>
              <Input
                id="editBookName"
                className="col-span-3"
                value={currentBook.name}
                onChange={(e) => setCurrentBook({ ...currentBook, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editLevel" className="text-right">
                Level
              </Label>
              <Select
                value={currentBook.level}
                onValueChange={(value) => setCurrentBook({ ...currentBook, level: value })}
              >
                <SelectTrigger className="col-span-3" id="editLevel">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Elementary">Elementary</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Upper Intermediate">Upper Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editQuantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="editQuantity"
                className="col-span-3"
                type="number"
                min="0"
                value={currentBook.quantity}
                onChange={(e) => setCurrentBook({ ...currentBook, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSchool" className="text-right">
                School
              </Label>
              <Select
                value={currentBook.schoolId.toString()}
                onValueChange={(value) => setCurrentBook({ ...currentBook, schoolId: parseInt(value) })}
              >
                <SelectTrigger className="col-span-3" id="editSchool">
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="349">KNFA</SelectItem>
                  <SelectItem value="350">NFS East</SelectItem>
                  <SelectItem value="351">NFS West</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditBookDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBook}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this book from the inventory? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2"><strong>Book:</strong> {currentBook.name}</p>
            <p><strong>Quantity:</strong> {currentBook.quantity}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBook}>
              Delete Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Form Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Upload Book Form</DialogTitle>
            <DialogDescription>
              Upload a book form document or inventory list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="formTitle" className="text-right">
                Title
              </Label>
              <Input
                id="formTitle"
                className="col-span-3"
                placeholder="Book Inventory Form"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="formType" className="text-right">
                Type
              </Label>
              <Select defaultValue="inventory">
                <SelectTrigger className="col-span-3" id="formType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventory Form</SelectItem>
                  <SelectItem value="order">Order Form</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="school" className="text-right">
                School
              </Label>
              <Select defaultValue={selectedSchool ? selectedSchool.id.toString() : "349"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="349">KNFA</SelectItem>
                  <SelectItem value="350">NFS East</SelectItem>
                  <SelectItem value="351">NFS West</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                File
              </Label>
              <div className="col-span-3">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, DOC, XLS or images (MAX. 10MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comments" className="text-right">
                Comments
              </Label>
              <Textarea
                id="comments"
                className="col-span-3"
                placeholder="Enter any additional notes about this document"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Form uploaded",
                description: "The document has been successfully uploaded.",
              });
              setShowUploadDialog(false);
            }}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookOrder;