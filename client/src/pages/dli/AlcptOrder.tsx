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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import {
  ClipboardCheck,
  Calendar,
  Search,
  Download,
  Printer,
  Plus,
  FileText,
  FileCheck,
  Clock,
  CheckCircle2,
  Info,
  User,
  Send,
  BookText,
  Share,
  BarChart,
  BarChart2,
  ListChecks
} from 'lucide-react';

// Mock data for ALCPT forms
const alcptForms = [
  { id: 1, name: 'ALCPT Form 1', level: 'Basic', quantity: 15, status: 'In Stock', schoolId: 349, difficulty: 'Low' },
  { id: 2, name: 'ALCPT Form 2', level: 'Basic', quantity: 18, status: 'In Stock', schoolId: 349, difficulty: 'Low' },
  { id: 3, name: 'ALCPT Form 3', level: 'Basic', quantity: 10, status: 'Low Stock', schoolId: 349, difficulty: 'Low' },
  { id: 4, name: 'ALCPT Form 4', level: 'Intermediate', quantity: 8, status: 'Out of Stock', schoolId: 350, difficulty: 'Medium' },
  { id: 5, name: 'ALCPT Form 5', level: 'Intermediate', quantity: 12, status: 'In Stock', schoolId: 350, difficulty: 'Medium' },
  { id: 6, name: 'ALCPT Form 6', level: 'Intermediate', quantity: 14, status: 'In Stock', schoolId: 351, difficulty: 'Medium' },
  { id: 7, name: 'ALCPT Form 7', level: 'Advanced', quantity: 9, status: 'Low Stock', schoolId: 351, difficulty: 'High' },
  { id: 8, name: 'ALCPT Form 8', level: 'Advanced', quantity: 5, status: 'Out of Stock', schoolId: 351, difficulty: 'High' },
  { id: 9, name: 'ALCPT Form 9', level: 'Advanced', quantity: 7, status: 'Low Stock', schoolId: 349, difficulty: 'High' },
  { id: 10, name: 'ALCPT Form 10', level: 'Expert', quantity: 3, status: 'Out of Stock', schoolId: 350, difficulty: 'Very High' },
];

// Mock data for order history
const orderHistory = [
  { id: 201, date: '2025-03-20', forms: 'ALCPT Forms 1-3', quantity: 30, status: 'Delivered', schoolId: 349 },
  { id: 202, date: '2025-02-15', forms: 'ALCPT Forms 4-6', quantity: 25, status: 'Delivered', schoolId: 350 },
  { id: 203, date: '2025-01-10', forms: 'ALCPT Forms 7-8', quantity: 20, status: 'Delivered', schoolId: 351 },
  { id: 204, date: '2024-12-05', forms: 'ALCPT Forms 1-5', quantity: 35, status: 'Delivered', schoolId: 349 },
  { id: 205, date: '2024-11-01', forms: 'ALCPT Forms 6-10', quantity: 40, status: 'Delivered', schoolId: 350 },
];

// Mock data for available forms
const availableForms = [
  { id: 1, name: 'ALCPT Form 1', price: 35.99, description: 'Basic level ALCPT assessment with listening and reading comprehension sections.' },
  { id: 2, name: 'ALCPT Form 2', price: 35.99, description: 'Basic level ALCPT with alternative question formats.' },
  { id: 3, name: 'ALCPT Form 3', price: 35.99, description: 'Basic level ALCPT with focus on military vocabulary.' },
  { id: 4, name: 'ALCPT Form 4', price: 39.99, description: 'Intermediate level ALCPT for students with basic English proficiency.' },
  { id: 5, name: 'ALCPT Form 5', price: 39.99, description: 'Intermediate level ALCPT with expanded vocabulary sections.' },
  { id: 6, name: 'ALCPT Form 6', price: 39.99, description: 'Intermediate level ALCPT with aviation-specific terminology.' },
  { id: 7, name: 'ALCPT Form 7', price: 45.99, description: 'Advanced level ALCPT for students with intermediate English proficiency.' },
  { id: 8, name: 'ALCPT Form 8', price: 45.99, description: 'Advanced level ALCPT with complex grammatical structures.' },
  { id: 9, name: 'ALCPT Form 9', price: 45.99, description: 'Advanced level ALCPT with professional military communication scenarios.' },
  { id: 10, name: 'ALCPT Form 10', price: 49.99, description: 'Expert level ALCPT for advanced English proficiency evaluation.' },
  { id: 11, name: 'ALCPT Instructor Kit', price: 99.99, description: 'Complete set of instructor materials for administering ALCPT tests.' },
  { id: 12, name: 'ALCPT Answer Sheets (Pack of 100)', price: 29.99, description: 'Standard machine-readable answer sheets for ALCPT tests.' },
  { id: 13, name: 'ALCPT Digital Scoring Software', price: 149.99, description: 'Software for automated scoring and analytics of ALCPT tests.' },
];

// Mock data for test results
const testResultsData = [
  { formId: 1, avgScore: 75, students: 40, passingRate: 85, date: '2025-03-01' },
  { formId: 2, avgScore: 72, students: 35, passingRate: 80, date: '2025-02-15' },
  { formId: 3, avgScore: 78, students: 38, passingRate: 89, date: '2025-01-20' },
  { formId: 4, avgScore: 68, students: 42, passingRate: 71, date: '2024-12-10' },
  { formId: 5, avgScore: 71, students: 39, passingRate: 76, date: '2024-11-05' },
];

const AlcptOrder = () => {
  const { toast } = useToast();
  const { selectedSchool } = useSchool();
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  
  // State for new order form
  const [orderItems, setOrderItems] = useState<{
    formId: number;
    name: string;
    quantity: number;
    price: number;
  }[]>([]);
  
  // Filter forms by school, search query, level, and status
  const filteredForms = alcptForms.filter(form => {
    const matchesSchool = !selectedSchool || form.schoolId === selectedSchool.id;
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || form.level === selectedLevel;
    const matchesStatus = selectedStatus === 'all' || form.status === selectedStatus;
    
    return matchesSchool && matchesSearch && matchesLevel && matchesStatus;
  });
  
  // Filter order history by school
  const filteredHistory = orderHistory.filter(order => {
    return !selectedSchool || order.schoolId === selectedSchool.id;
  });
  
  // Add form to order
  const addFormToOrder = (formId: number) => {
    const formToAdd = availableForms.find(form => form.id === formId);
    if (!formToAdd) return;
    
    const existingItem = orderItems.find(item => item.formId === formId);
    if (existingItem) {
      setOrderItems(
        orderItems.map(item => 
          item.formId === formId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      );
    } else {
      setOrderItems([...orderItems, {
        formId: formToAdd.id,
        name: formToAdd.name,
        quantity: 1,
        price: formToAdd.price
      }]);
    }
  };
  
  // Update quantity of form in order
  const updateQuantity = (formId: number, quantity: number) => {
    if (quantity < 1) {
      setOrderItems(orderItems.filter(item => item.formId !== formId));
      return;
    }
    
    setOrderItems(
      orderItems.map(item => 
        item.formId === formId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  // Submit order
  const submitOrder = () => {
    if (orderItems.length === 0) {
      toast({
        title: "No forms selected",
        description: "Please add at least one ALCPT form to your order.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Order submitted successfully",
      description: `Your order has been submitted with ${orderItems.length} ALCPT form types.`,
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
  
  // Submit test results request
  const submitTestRequest = () => {
    toast({
      title: "Request submitted successfully",
      description: "Your request for ALCPT test materials has been submitted to the test coordinator.",
    });
    setShowForm(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-transparent bg-clip-text">
          ALCPT Order Management
        </h1>
        <p className="text-gray-500 mt-2">
          Track, manage, and order ALCPT test materials for {selectedSchool ? selectedSchool.name : 'all schools'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="h-2 w-full bg-gradient-to-r from-emerald-600 to-teal-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="text-emerald-600" size={18} />
              <CardTitle className="text-sm font-medium">Total ALCPT Forms</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-600">
              {filteredForms.reduce((total, form) => total + form.quantity, 0)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Across {selectedSchool ? '1 school' : '3 schools'} and {filteredForms.length} different forms
            </p>
            <Progress 
              value={70} 
              className="h-2 mt-4 bg-emerald-100"
            />
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="h-2 w-full bg-gradient-to-r from-teal-600 to-cyan-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="text-teal-600" size={18} />
              <CardTitle className="text-sm font-medium">Test Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {Math.round(testResultsData.reduce((sum, result) => sum + result.avgScore, 0) / testResultsData.length)}%
                </div>
                <div className="text-xs text-gray-500">Avg. Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {testResultsData.reduce((sum, result) => sum + result.students, 0)}
                </div>
                <div className="text-xs text-gray-500">Students Tested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {Math.round(testResultsData.reduce((sum, result) => sum + result.passingRate, 0) / testResultsData.length)}%
                </div>
                <div className="text-xs text-gray-500">Passing Rate</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4 gap-2"
            >
              <BarChart size={14} />
              View Detailed Analytics
            </Button>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="h-2 w-full bg-gradient-to-r from-cyan-600 to-blue-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="text-cyan-600" size={18} />
              <CardTitle className="text-sm font-medium">Test Schedule</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">Placement Test</div>
                  <div className="text-xs text-gray-500">Form 3</div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  April 15, 2025
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">Progress Test</div>
                  <div className="text-xs text-gray-500">Form 5</div>
                </div>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                  May 01, 2025
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">Final Evaluation</div>
                  <div className="text-xs text-gray-500">Form 9</div>
                </div>
                <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">
                  June 10, 2025
                </Badge>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
                className="text-xs gap-1"
              >
                <Send size={14} />
                Request Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('order')}
                className="text-xs gap-1"
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
            <ListChecks size={16} />
            ALCPT Inventory
          </TabsTrigger>
          <TabsTrigger value="order" className="gap-2">
            <Plus size={16} />
            New Order
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <FileCheck size={16} />
            Order History
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <BarChart size={16} />
            Test Performance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>ALCPT Forms Inventory</CardTitle>
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
                View and manage your ALCPT test materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search forms..."
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
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
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
                      <TableHead className="w-[280px]">Form Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredForms.length > 0 ? (
                      filteredForms.map((form) => (
                        <TableRow key={form.id}>
                          <TableCell className="font-medium">{form.name}</TableCell>
                          <TableCell>{form.level}</TableCell>
                          <TableCell>{form.difficulty}</TableCell>
                          <TableCell>{form.quantity}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(form.status)}>
                              {form.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addFormToOrder(form.id)}
                              disabled={form.status === 'Out of Stock'}
                            >
                              Order
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No forms found matching your filters
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
                  <CardTitle>New ALCPT Order</CardTitle>
                  <CardDescription>
                    Select ALCPT forms to add to your order
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Search available forms..."
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="rounded-md border overflow-hidden mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[280px]">Form Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="w-[300px]">Description</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableForms.map((form) => (
                          <TableRow key={form.id}>
                            <TableCell className="font-medium">{form.name}</TableCell>
                            <TableCell>${form.price.toFixed(2)}</TableCell>
                            <TableCell className="text-sm text-gray-500">{form.description}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => addFormToOrder(form.id)}
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
                        <div key={item.formId} className="flex justify-between items-center border-b pb-3">
                          <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.formId, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.formId, item.quantity + 1)}
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
                      <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p>Your order is empty</p>
                      <p className="text-sm mt-1">Add ALCPT forms from the available list</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
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
                View all previous ALCPT form orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Forms</TableHead>
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
                          <TableCell>{order.forms}</TableCell>
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
        
        <TabsContent value="performance">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Test Performance Analytics</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-9">
                    <Share className="h-4 w-4 mr-2" />
                    Share Report
                  </Button>
                  <Button variant="outline" size="sm" className="h-9">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
              <CardDescription>
                Analyze ALCPT test results and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-700">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
                      {Math.round(testResultsData.reduce((sum, result) => sum + result.avgScore, 0) / testResultsData.length)}%
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs">+2.1%</Badge>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      Compared to previous testing period
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-teal-700">Students Tested</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-teal-700 flex items-center gap-2">
                      {testResultsData.reduce((sum, result) => sum + result.students, 0)}
                      <Badge className="bg-teal-100 text-teal-800 text-xs">+12</Badge>
                    </div>
                    <p className="text-xs text-teal-600 mt-1">
                      Across {testResultsData.length} test sessions
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-cyan-700">Passing Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-cyan-700 flex items-center gap-2">
                      {Math.round(testResultsData.reduce((sum, result) => sum + result.passingRate, 0) / testResultsData.length)}%
                      <Badge className="bg-cyan-100 text-cyan-800 text-xs">+3.5%</Badge>
                    </div>
                    <p className="text-xs text-cyan-600 mt-1">
                      With a passing threshold of 70%
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ALCPT Form</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Passing Rate</TableHead>
                      <TableHead>Test Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testResultsData.map((result) => (
                      <TableRow key={result.formId}>
                        <TableCell className="font-medium">
                          Form {result.formId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={result.avgScore} 
                              className="h-2 w-16"
                            />
                            <span>{result.avgScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{result.students}</TableCell>
                        <TableCell>
                          <Badge className={
                            result.passingRate >= 85 ? "bg-green-100 text-green-800" :
                            result.passingRate >= 70 ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {result.passingRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(result.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Test request form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request ALCPT Test</DialogTitle>
            <DialogDescription>
              Fill out the form to request ALCPT test materials for your upcoming exam.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="testDate" className="text-right">
                Test Date
              </Label>
              <Input
                id="testDate"
                type="date"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="testForm" className="text-right">
                ALCPT Form
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Form 1 (Basic)</SelectItem>
                  <SelectItem value="2">Form 2 (Basic)</SelectItem>
                  <SelectItem value="3">Form 3 (Basic)</SelectItem>
                  <SelectItem value="4">Form 4 (Intermediate)</SelectItem>
                  <SelectItem value="5">Form 5 (Intermediate)</SelectItem>
                  <SelectItem value="6">Form 6 (Intermediate)</SelectItem>
                  <SelectItem value="7">Form 7 (Advanced)</SelectItem>
                  <SelectItem value="8">Form 8 (Advanced)</SelectItem>
                  <SelectItem value="9">Form 9 (Advanced)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="students" className="text-right">
                Students
              </Label>
              <Input
                id="students"
                type="number"
                min="1"
                defaultValue="20"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room" className="text-right">
                Room
              </Label>
              <Input
                id="room"
                placeholder="e.g. Lab 101"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requestType" className="text-right">
                Request Type
              </Label>
              <RadioGroup defaultValue="placement" className="col-span-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="placement" id="placement" />
                  <Label htmlFor="placement">Placement Test</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="progress" id="progress" />
                  <Label htmlFor="progress">Progress Test</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="final" id="final" />
                  <Label htmlFor="final">Final Evaluation</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Additional information about your test request"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={submitTestRequest} className="bg-emerald-600 hover:bg-emerald-700">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlcptOrder;