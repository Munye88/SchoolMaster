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
import { useToast } from '@/hooks/use-toast';
import { useSchool } from '@/hooks/useSchool';
import { BookText, CalendarDays, Search, Filter, Download, Printer, ArrowUpDown, Plus, FileText, FileCheck, Package } from 'lucide-react';

// Mock data for book orders
const bookOrders = [
  { id: 1, name: 'American Language Course Book 1', level: 'Beginner', quantity: 25, status: 'In Stock', schoolId: 349 },
  { id: 2, name: 'American Language Course Book 2', level: 'Beginner', quantity: 30, status: 'In Stock', schoolId: 349 },
  { id: 3, name: 'American Language Course Book 3', level: 'Elementary', quantity: 15, status: 'Low Stock', schoolId: 349 },
  { id: 4, name: 'American Language Course Book 4', level: 'Elementary', quantity: 8, status: 'Out of Stock', schoolId: 350 },
  { id: 5, name: 'American Language Course Book 5', level: 'Intermediate', quantity: 20, status: 'In Stock', schoolId: 350 },
  { id: 6, name: 'American Language Course Book 6', level: 'Intermediate', quantity: 18, status: 'In Stock', schoolId: 351 },
  { id: 7, name: 'American Language Course Book 7', level: 'Upper Intermediate', quantity: 12, status: 'Low Stock', schoolId: 351 },
  { id: 8, name: 'American Language Course Book 8', level: 'Upper Intermediate', quantity: 5, status: 'Out of Stock', schoolId: 351 },
  { id: 9, name: 'American Language Course Book 9', level: 'Advanced', quantity: 10, status: 'Low Stock', schoolId: 349 },
  { id: 10, name: 'American Language Course Book 10', level: 'Advanced', quantity: 3, status: 'Out of Stock', schoolId: 350 },
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
  
  // State for new order form
  const [orderItems, setOrderItems] = useState<{
    bookId: number;
    name: string;
    quantity: number;
    price: number;
  }[]>([]);
  
  // Filter books by school, search query, level, and status
  const filteredBooks = bookOrders.filter(book => {
    const matchesSchool = !selectedSchool || book.schoolId === selectedSchool.id;
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || book.level === selectedLevel;
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
    
    return matchesSchool && matchesSearch && matchesLevel && matchesStatus;
  });
  
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
                          <TableCell className="text-right">
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
    </div>
  );
};

export default BookOrder;