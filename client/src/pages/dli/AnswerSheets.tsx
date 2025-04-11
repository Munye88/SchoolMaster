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
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  ArrowUpDown, 
  Plus, 
  FileText, 
  FileCheck, 
  Package, 
  Edit, 
  Trash2, 
  Upload, 
  FileUp, 
  School, 
  ChevronDown 
} from 'lucide-react';

// Mock data for answer sheets inventory
const answerSheetsInventory = [
  // KNFA Sheets
  { id: 1, name: 'Answer Sheet Type A', quantity: 250, status: 'In Stock', schoolId: 349 },
  { id: 2, name: 'Answer Sheet Type B', quantity: 180, status: 'In Stock', schoolId: 349 },
  { id: 3, name: 'Answer Sheet Type C', quantity: 120, status: 'Low Stock', schoolId: 349 },
  { id: 4, name: 'ALCPT Listening Sheet', quantity: 90, status: 'Low Stock', schoolId: 349 },
  { id: 5, name: 'ALCPT Reading Sheet', quantity: 140, status: 'In Stock', schoolId: 349 },
  
  // NFS East Sheets
  { id: 6, name: 'Answer Sheet Type A', quantity: 200, status: 'In Stock', schoolId: 350 },
  { id: 7, name: 'Answer Sheet Type B', quantity: 90, status: 'Low Stock', schoolId: 350 },
  { id: 8, name: 'Answer Sheet Type C', quantity: 40, status: 'Low Stock', schoolId: 350 },
  { id: 9, name: 'ALCPT Listening Sheet', quantity: 60, status: 'Low Stock', schoolId: 350 },
  { id: 10, name: 'ALCPT Reading Sheet', quantity: 85, status: 'Low Stock', schoolId: 350 },
  
  // NFS West Sheets
  { id: 11, name: 'Answer Sheet Type A', quantity: 220, status: 'In Stock', schoolId: 351 },
  { id: 12, name: 'Answer Sheet Type B', quantity: 150, status: 'In Stock', schoolId: 351 },
  { id: 13, name: 'Answer Sheet Type C', quantity: 70, status: 'Low Stock', schoolId: 351 },
  { id: 14, name: 'ALCPT Listening Sheet', quantity: 30, status: 'Low Stock', schoolId: 351 },
  { id: 15, name: 'ALCPT Reading Sheet', quantity: 10, status: 'Out of Stock', schoolId: 351 },
];

// Mock data for inventory update history
const inventoryUpdateHistory = [
  { id: 101, date: '2025-03-10', sheets: 'Answer Sheet Type A, B, C', quantity: 500, status: 'Received', schoolId: 349, notes: 'Annual inventory refresh' },
  { id: 102, date: '2025-02-20', sheets: 'ALCPT Listening Sheets', quantity: 200, status: 'Distributed', schoolId: 350, notes: 'New course materials' },
  { id: 103, date: '2025-01-15', sheets: 'Answer Sheet Type A', quantity: 300, status: 'Received', schoolId: 351, notes: 'Replacement for damaged items' },
  { id: 104, date: '2024-12-05', sheets: 'ALCPT Reading Sheets', quantity: 150, status: 'Distributed', schoolId: 349, notes: 'Start of new term' },
  { id: 105, date: '2024-11-01', sheets: 'Answer Sheet Type B, C', quantity: 400, status: 'Received', schoolId: 350, notes: 'Inventory replenishment' },
];

// Mock data for sheet catalog
const sheetCatalog = [
  { id: 1, name: 'Answer Sheet Type A' },
  { id: 2, name: 'Answer Sheet Type B' },
  { id: 3, name: 'Answer Sheet Type C' },
  { id: 4, name: 'ALCPT Listening Sheet' },
  { id: 5, name: 'ALCPT Reading Sheet' },
  { id: 6, name: 'General Test Sheet' },
  { id: 7, name: 'Placement Test Sheet' },
  { id: 8, name: 'Progress Test Sheet' },
  { id: 9, name: 'Final Exam Sheet' },
  { id: 10, name: 'Scantron Sheet' },
];

const AnswerSheets = () => {
  const { toast } = useToast();
  const { selectedSchool } = useSchool();
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [localSheetsInventory, setLocalSheetsInventory] = useState(answerSheetsInventory);
  const [showSchoolInventory, setShowSchoolInventory] = useState(true);
  
  // State for dialogs
  const [showAddSheetDialog, setShowAddSheetDialog] = useState(false);
  const [showEditSheetDialog, setShowEditSheetDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showInventoryUpdateDialog, setShowInventoryUpdateDialog] = useState(false);
  
  // State for sheet being edited or deleted
  const [currentSheet, setCurrentSheet] = useState<{
    id?: number;
    name: string;
    quantity: number;
    status: string;
    schoolId: number;
  }>({
    name: '',
    quantity: 0,
    status: 'Out of Stock',
    schoolId: selectedSchool?.id || 349,
  });
  
  // State for inventory update
  const [inventoryUpdateItems, setInventoryUpdateItems] = useState<{
    sheetId: number;
    name: string;
    quantity: number;
  }[]>([]);
  
  // State for selected school in school inventory view
  const [viewingSchoolId, setViewingSchoolId] = useState<number | null>(null);
  
  // Get school by ID
  const getSchoolById = (id: number) => {
    switch (id) {
      case 349: return { id: 349, name: 'KNFA', code: 'KNFA', color: 'blue' };
      case 350: return { id: 350, name: 'NFS East', code: 'NFS_EAST', color: 'green' };
      case 351: return { id: 351, name: 'NFS West', code: 'NFS_WEST', color: 'orange' };
      default: return null;
    }
  };
  
  // List of schools
  const schools = [
    { id: 349, name: 'KNFA', code: 'KNFA', color: 'blue' },
    { id: 350, name: 'NFS East', code: 'NFS_EAST', color: 'green' },
    { id: 351, name: 'NFS West', code: 'NFS_WEST', color: 'orange' },
  ];
  
  // Filter sheets by school, search query, and status
  const filteredSheets = localSheetsInventory.filter(sheet => {
    const matchesSchool = selectedSchool ? sheet.schoolId === selectedSchool.id : 
                         viewingSchoolId ? sheet.schoolId === viewingSchoolId : true;
    const matchesSearch = sheet.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || sheet.status === selectedStatus;
    
    return matchesSchool && matchesSearch && matchesStatus;
  });
  
  // Get sheets for a specific school
  const getSchoolSheets = (schoolId: number) => {
    return localSheetsInventory.filter(sheet => sheet.schoolId === schoolId);
  };
  
  // Add a new sheet to inventory
  const handleAddSheet = () => {
    // Generate new ID by finding max ID and adding 1
    const newId = Math.max(...localSheetsInventory.map(sheet => sheet.id)) + 1;
    
    // Determine status based on quantity
    let status = 'Out of Stock';
    if (currentSheet.quantity > 100) {
      status = 'In Stock';
    } else if (currentSheet.quantity > 0) {
      status = 'Low Stock';
    }
    
    const newSheet = {
      id: newId,
      name: currentSheet.name,
      quantity: currentSheet.quantity,
      status: status,
      schoolId: currentSheet.schoolId,
    };
    
    setLocalSheetsInventory([...localSheetsInventory, newSheet]);
    setShowAddSheetDialog(false);
    setCurrentSheet({
      name: '',
      quantity: 0,
      status: 'Out of Stock',
      schoolId: selectedSchool?.id || 349,
    });
    
    toast({
      title: "Answer sheets added",
      description: `${newSheet.name} has been added to the inventory.`,
    });
  };
  
  // Edit an existing sheet
  const handleEditSheet = () => {
    if (!currentSheet.id) return;
    
    // Determine status based on quantity
    let status = 'Out of Stock';
    if (currentSheet.quantity > 100) {
      status = 'In Stock';
    } else if (currentSheet.quantity > 0) {
      status = 'Low Stock';
    }
    
    const updatedSheets = localSheetsInventory.map(sheet => {
      if (sheet.id === currentSheet.id) {
        return {
          ...sheet,
          name: currentSheet.name,
          quantity: currentSheet.quantity,
          status: status,
          schoolId: currentSheet.schoolId,
        };
      }
      return sheet;
    });
    
    setLocalSheetsInventory(updatedSheets);
    setShowEditSheetDialog(false);
    
    toast({
      title: "Answer sheets updated",
      description: `${currentSheet.name} has been updated.`,
    });
  };
  
  // Delete a sheet
  const handleDeleteSheet = () => {
    if (!currentSheet.id) return;
    
    const updatedSheets = localSheetsInventory.filter(sheet => sheet.id !== currentSheet.id);
    setLocalSheetsInventory(updatedSheets);
    setShowDeleteConfirmation(false);
    
    toast({
      title: "Answer sheets removed",
      description: `${currentSheet.name} has been removed from the inventory.`,
    });
  };
  
  // Edit sheet setup
  const openEditDialog = (sheet: typeof localSheetsInventory[0]) => {
    setCurrentSheet({
      id: sheet.id,
      name: sheet.name,
      quantity: sheet.quantity,
      status: sheet.status,
      schoolId: sheet.schoolId,
    });
    setShowEditSheetDialog(true);
  };
  
  // Delete sheet setup
  const openDeleteDialog = (sheet: typeof localSheetsInventory[0]) => {
    setCurrentSheet({
      id: sheet.id,
      name: sheet.name,
      quantity: sheet.quantity,
      status: sheet.status,
      schoolId: sheet.schoolId,
    });
    setShowDeleteConfirmation(true);
  };
  
  // Filter inventory update history by school
  const filteredHistory = inventoryUpdateHistory.filter(update => {
    return selectedSchool ? update.schoolId === selectedSchool.id : 
          viewingSchoolId ? update.schoolId === viewingSchoolId : true;
  });
  
  // Add sheet to inventory update
  const addSheetToInventoryUpdate = (sheetId: number) => {
    const sheetToAdd = sheetCatalog.find(sheet => sheet.id === sheetId);
    if (!sheetToAdd) return;
    
    const existingItem = inventoryUpdateItems.find(item => item.sheetId === sheetId);
    if (existingItem) {
      setInventoryUpdateItems(
        inventoryUpdateItems.map(item => 
          item.sheetId === sheetId 
            ? { ...item, quantity: item.quantity + 10 } 
            : item
        )
      );
    } else {
      setInventoryUpdateItems([...inventoryUpdateItems, {
        sheetId: sheetToAdd.id,
        name: sheetToAdd.name,
        quantity: 10
      }]);
    }
  };
  
  // Update quantity of sheet in inventory update
  const updateInventoryQuantity = (sheetId: number, quantity: number) => {
    if (quantity < 1) {
      setInventoryUpdateItems(inventoryUpdateItems.filter(item => item.sheetId !== sheetId));
      return;
    }
    
    setInventoryUpdateItems(
      inventoryUpdateItems.map(item => 
        item.sheetId === sheetId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  // Submit inventory update
  const submitInventoryUpdate = () => {
    if (inventoryUpdateItems.length === 0) {
      toast({
        title: "No answer sheets selected",
        description: "Please add at least one set of answer sheets to your inventory update.",
        variant: "destructive",
      });
      return;
    }
    
    // Update inventory quantities
    const updatedInventory = [...localSheetsInventory];
    
    inventoryUpdateItems.forEach(item => {
      const existingSheetIndex = updatedInventory.findIndex(
        sheet => sheet.name === item.name && sheet.schoolId === (viewingSchoolId || selectedSchool?.id || 349)
      );
      
      if (existingSheetIndex >= 0) {
        // Update existing sheet
        const newQuantity = updatedInventory[existingSheetIndex].quantity + item.quantity;
        let newStatus = 'Out of Stock';
        if (newQuantity > 100) {
          newStatus = 'In Stock';
        } else if (newQuantity > 0) {
          newStatus = 'Low Stock';
        }
        
        updatedInventory[existingSheetIndex] = {
          ...updatedInventory[existingSheetIndex],
          quantity: newQuantity,
          status: newStatus
        };
      } else {
        // Add new sheet to inventory
        let status = 'Out of Stock';
        if (item.quantity > 100) {
          status = 'In Stock';
        } else if (item.quantity > 0) {
          status = 'Low Stock';
        }
        
        const newId = Math.max(...updatedInventory.map(sheet => sheet.id)) + 1;
        updatedInventory.push({
          id: newId,
          name: item.name,
          quantity: item.quantity,
          status: status,
          schoolId: viewingSchoolId || selectedSchool?.id || 349
        });
      }
    });
    
    setLocalSheetsInventory(updatedInventory);
    setInventoryUpdateItems([]);
    setShowInventoryUpdateDialog(false);
    
    toast({
      title: "Inventory updated",
      description: `${inventoryUpdateItems.length} answer sheet types have been updated in the inventory.`,
    });
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Low Stock':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Received':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Distributed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };
  
  // Toggle between all schools view and specific school view
  const toggleSchoolView = () => {
    setShowSchoolInventory(!showSchoolInventory);
    setViewingSchoolId(null);
  };
  
  // View a specific school's inventory
  const viewSchoolInventory = (schoolId: number) => {
    setViewingSchoolId(schoolId);
  };

  // Get school color
  const getSchoolColor = (schoolId: number) => {
    switch (schoolId) {
      case 349: return 'bg-blue-600';
      case 350: return 'bg-green-600';
      case 351: return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
          Answer Sheets Inventory Management
        </h1>
        <p className="text-gray-500 mt-2">
          Track and manage test answer sheets across all schools
        </p>
      </div>
      
      {/* Toggle view button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={toggleSchoolView}
        >
          <School size={16} />
          {showSchoolInventory ? 'Show Consolidated View' : 'Show School-by-School View'}
        </Button>
      </div>
      
      {/* School-by-School View */}
      {showSchoolInventory ? (
        <>
          {viewingSchoolId ? (
            // Single school detailed view
            <>
              <div className="mb-6 flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewingSchoolId(null)}
                >
                  Back to All Schools
                </Button>
                <h2 className="text-xl font-semibold">
                  {getSchoolById(viewingSchoolId)?.name} Inventory
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="overflow-hidden border-0 shadow-md">
                  <div className={`h-2 w-full ${getSchoolColor(viewingSchoolId)}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="text-purple-600" size={18} />
                      <CardTitle className="text-sm font-medium">Total Answer Sheets</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-purple-600">
                      {getSchoolSheets(viewingSchoolId).reduce((total, sheet) => total + sheet.quantity, 0)}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Across {getSchoolSheets(viewingSchoolId).length} sheet types
                    </p>
                    <Progress 
                      value={75} 
                      className="h-2 mt-4 bg-purple-100"
                    />
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-0 shadow-md">
                  <div className={`h-2 w-full ${getSchoolColor(viewingSchoolId)}`} />
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
                          {getSchoolSheets(viewingSchoolId).filter(sheet => sheet.status === 'In Stock').length}
                        </div>
                        <div className="text-xs text-gray-500">In Stock</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">
                          {getSchoolSheets(viewingSchoolId).filter(sheet => sheet.status === 'Low Stock').length}
                        </div>
                        <div className="text-xs text-gray-500">Low Stock</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {getSchoolSheets(viewingSchoolId).filter(sheet => sheet.status === 'Out of Stock').length}
                        </div>
                        <div className="text-xs text-gray-500">Out of Stock</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-0 shadow-md">
                  <div className={`h-2 w-full ${getSchoolColor(viewingSchoolId)}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileCheck className="text-purple-600" size={18} />
                      <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-purple-600">
                      {inventoryUpdateHistory.filter(update => update.schoolId === viewingSchoolId).length}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Inventory updates in the past 6 months
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
                        onClick={() => setShowInventoryUpdateDialog(true)}
                      >
                        <Plus size={14} />
                        Update Inventory
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
                  <TabsTrigger value="history" className="gap-2">
                    <FileCheck size={16} />
                    Update History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="inventory">
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Answer Sheets Inventory</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 gap-1"
                            onClick={() => {
                              setCurrentSheet({
                                name: '',
                                quantity: 0,
                                status: 'Out of Stock',
                                schoolId: viewingSchoolId,
                              });
                              setShowAddSheetDialog(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Add Sheets
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
                        View and manage {getSchoolById(viewingSchoolId)?.name} answer sheets inventory
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            placeholder="Search sheets..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        
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
                              <TableHead className="w-[300px]">Sheet Name</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getSchoolSheets(viewingSchoolId).length > 0 ? (
                              getSchoolSheets(viewingSchoolId).map((sheet) => (
                                <TableRow key={sheet.id}>
                                  <TableCell className="font-medium">{sheet.name}</TableCell>
                                  <TableCell>{sheet.quantity}</TableCell>
                                  <TableCell>
                                    <Badge className={getStatusColor(sheet.status)}>
                                      {sheet.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => openEditDialog(sheet)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => openDeleteDialog(sheet)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                  No answer sheets found matching your filters
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Inventory Update History</CardTitle>
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
                        View all previous inventory updates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Update ID</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Sheets</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {inventoryUpdateHistory.filter(update => update.schoolId === viewingSchoolId).length > 0 ? (
                              inventoryUpdateHistory
                                .filter(update => update.schoolId === viewingSchoolId)
                                .map((update) => (
                                <TableRow key={update.id}>
                                  <TableCell className="font-medium">#{update.id}</TableCell>
                                  <TableCell>{new Date(update.date).toLocaleDateString()}</TableCell>
                                  <TableCell>{update.sheets}</TableCell>
                                  <TableCell>{update.quantity}</TableCell>
                                  <TableCell>
                                    <Badge className={getStatusColor(update.status)}>
                                      {update.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{update.notes}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                  No update history found
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
            </>
          ) : (
            // School selection view
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {schools.map(school => (
                <Card 
                  key={school.id} 
                  className="overflow-hidden border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => viewSchoolInventory(school.id)}
                >
                  <div className={`h-2 w-full ${getSchoolColor(school.id)}`} />
                  <CardHeader className="pb-2">
                    <CardTitle>{school.name}</CardTitle>
                    <CardDescription>Answer Sheets Inventory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="text-3xl font-bold">
                        {getSchoolSheets(school.id).reduce((total, sheet) => total + sheet.quantity, 0)}
                      </div>
                      <p className="text-sm text-gray-500">Total Sheets</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {getSchoolSheets(school.id).filter(sheet => sheet.status === 'In Stock').length}
                        </div>
                        <p className="text-xs text-gray-500">In Stock</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-amber-600">
                          {getSchoolSheets(school.id).filter(sheet => sheet.status === 'Low Stock').length}
                        </div>
                        <p className="text-xs text-gray-500">Low Stock</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-red-600">
                          {getSchoolSheets(school.id).filter(sheet => sheet.status === 'Out of Stock').length}
                        </div>
                        <p className="text-xs text-gray-500">Out of Stock</p>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      View Inventory
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        // Consolidated view
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="h-2 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="text-purple-600" size={18} />
                  <CardTitle className="text-sm font-medium">Total Answer Sheets</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600">
                  {localSheetsInventory.reduce((total, sheet) => total + sheet.quantity, 0)}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Across 3 schools and {localSheetsInventory.length} sheet types
                </p>
                <Progress 
                  value={75} 
                  className="h-2 mt-4 bg-purple-100"
                />
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="h-2 w-full bg-gradient-to-r from-indigo-600 to-blue-600" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="text-indigo-600" size={18} />
                  <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {localSheetsInventory.filter(sheet => sheet.status === 'In Stock').length}
                    </div>
                    <div className="text-xs text-gray-500">In Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {localSheetsInventory.filter(sheet => sheet.status === 'Low Stock').length}
                    </div>
                    <div className="text-xs text-gray-500">Low Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {localSheetsInventory.filter(sheet => sheet.status === 'Out of Stock').length}
                    </div>
                    <div className="text-xs text-gray-500">Out of Stock</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-sky-600" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <School className="text-blue-600" size={18} />
                  <CardTitle className="text-sm font-medium">School Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">KNFA</span>
                    <span className="text-sm text-gray-500">
                      {getSchoolSheets(349).reduce((total, sheet) => total + sheet.quantity, 0)} sheets
                    </span>
                  </div>
                  <Progress value={33} className="h-2 bg-blue-100" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">NFS East</span>
                    <span className="text-sm text-gray-500">
                      {getSchoolSheets(350).reduce((total, sheet) => total + sheet.quantity, 0)} sheets
                    </span>
                  </div>
                  <Progress value={33} className="h-2 bg-green-100" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">NFS West</span>
                    <span className="text-sm text-gray-500">
                      {getSchoolSheets(351).reduce((total, sheet) => total + sheet.quantity, 0)} sheets
                    </span>
                  </div>
                  <Progress value={33} className="h-2 bg-orange-100" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-0 shadow-md mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Answer Sheets Inventory Across All Schools</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 gap-1"
                    onClick={() => {
                      setCurrentSheet({
                        name: '',
                        quantity: 0,
                        status: 'Out of Stock',
                        schoolId: selectedSchool?.id || 349,
                      });
                      setShowAddSheetDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Sheets
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
                View and manage answer sheets inventory across all schools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search sheets..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
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
                      <TableHead className="w-[250px]">Sheet Name</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSheets.length > 0 ? (
                      filteredSheets.map((sheet) => (
                        <TableRow key={sheet.id}>
                          <TableCell className="font-medium">{sheet.name}</TableCell>
                          <TableCell>
                            {getSchoolById(sheet.schoolId)?.name}
                          </TableCell>
                          <TableCell>{sheet.quantity}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(sheet.status)}>
                              {sheet.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditDialog(sheet)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openDeleteDialog(sheet)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No answer sheets found matching your filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Inventory Update History</CardTitle>
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
                View all previous inventory updates across all schools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Update ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Sheets</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryUpdateHistory.length > 0 ? (
                      inventoryUpdateHistory.map((update) => (
                        <TableRow key={update.id}>
                          <TableCell className="font-medium">#{update.id}</TableCell>
                          <TableCell>{new Date(update.date).toLocaleDateString()}</TableCell>
                          <TableCell>{getSchoolById(update.schoolId)?.name}</TableCell>
                          <TableCell>{update.sheets}</TableCell>
                          <TableCell>{update.quantity}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(update.status)}>
                              {update.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{update.notes}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No update history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Sheet Dialog */}
      <Dialog open={showAddSheetDialog} onOpenChange={setShowAddSheetDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Answer Sheets</DialogTitle>
            <DialogDescription>
              Enter the details of the new answer sheets to add to the inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sheetName" className="text-right">
                Sheet Name
              </Label>
              <Input
                id="sheetName"
                className="col-span-3"
                value={currentSheet.name}
                onChange={(e) => setCurrentSheet({ ...currentSheet, name: e.target.value })}
                placeholder="Answer Sheet Type X"
              />
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
                value={currentSheet.quantity}
                onChange={(e) => setCurrentSheet({ ...currentSheet, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="school" className="text-right">
                School
              </Label>
              <Select
                value={currentSheet.schoolId.toString()}
                onValueChange={(value) => setCurrentSheet({ ...currentSheet, schoolId: parseInt(value) })}
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
            <Button variant="outline" onClick={() => setShowAddSheetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSheet}>Add Sheets</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sheet Dialog */}
      <Dialog open={showEditSheetDialog} onOpenChange={setShowEditSheetDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Answer Sheets</DialogTitle>
            <DialogDescription>
              Update the details of the selected answer sheets.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSheetName" className="text-right">
                Sheet Name
              </Label>
              <Input
                id="editSheetName"
                className="col-span-3"
                value={currentSheet.name}
                onChange={(e) => setCurrentSheet({ ...currentSheet, name: e.target.value })}
              />
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
                value={currentSheet.quantity}
                onChange={(e) => setCurrentSheet({ ...currentSheet, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSchool" className="text-right">
                School
              </Label>
              <Select
                value={currentSheet.schoolId.toString()}
                onValueChange={(value) => setCurrentSheet({ ...currentSheet, schoolId: parseInt(value) })}
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
            <Button variant="outline" onClick={() => setShowEditSheetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSheet}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove these answer sheets from the inventory? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2"><strong>Sheet:</strong> {currentSheet.name}</p>
            <p><strong>Quantity:</strong> {currentSheet.quantity}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSheet}>
              Delete Sheets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Form Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Upload Answer Sheet Form</DialogTitle>
            <DialogDescription>
              Upload an answer sheet document or inventory list.
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
                placeholder="Answer Sheet Inventory Document"
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
                  <SelectItem value="inventory">Inventory Document</SelectItem>
                  <SelectItem value="form">Answer Sheet Template</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="school" className="text-right">
                School
              </Label>
              <Select defaultValue={selectedSchool ? selectedSchool.id.toString() : viewingSchoolId ? viewingSchoolId.toString() : "349"}>
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
      
      {/* Inventory Update Dialog */}
      <Dialog open={showInventoryUpdateDialog} onOpenChange={setShowInventoryUpdateDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
            <DialogDescription>
              Add or remove answer sheets from your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Available Sheet Types</h4>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input placeholder="Search sheets..." className="pl-10" />
              </div>
              <div className="max-h-60 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead>Sheet Name</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sheetCatalog.map((sheet) => (
                      <TableRow key={sheet.id}>
                        <TableCell className="font-medium">{sheet.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => addSheetToInventoryUpdate(sheet.id)}
                          >
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Sheets to Update</h4>
              {inventoryUpdateItems.length > 0 ? (
                <div className="space-y-3">
                  {inventoryUpdateItems.map((item) => (
                    <div key={item.sheetId} className="flex justify-between items-center border-b pb-2">
                      <div className="text-sm">{item.name}</div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateInventoryQuantity(item.sheetId, item.quantity - 10)}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateInventoryQuantity(item.sheetId, item.quantity + 10)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <Select defaultValue="received">
                      <SelectTrigger>
                        <SelectValue placeholder="Update type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Received (Add to inventory)</SelectItem>
                        <SelectItem value="distributed">Distributed (Remove from inventory)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Textarea 
                      className="mt-4"
                      placeholder="Notes about this inventory update"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 border rounded-md">
                  <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>No sheets selected</p>
                  <p className="text-sm mt-1">Add sheets from the available list</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInventoryUpdateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitInventoryUpdate}
              disabled={inventoryUpdateItems.length === 0}
            >
              Update Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnswerSheets;