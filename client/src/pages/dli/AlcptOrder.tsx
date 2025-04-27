import React, { useState, useEffect } from 'react';
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

// Mock data for ALCPT forms inventory
const alcptFormsInventory = [
  // KNFA Forms
  { id: 1, name: 'ALCPT Form 126', quantity: 25, status: 'In Stock', schoolId: 349 },
  { id: 2, name: 'ALCPT Form 127', quantity: 30, status: 'In Stock', schoolId: 349 },
  { id: 3, name: 'ALCPT Form 128', quantity: 15, status: 'Low Stock', schoolId: 349 },
  { id: 9, name: 'ALCPT Form 134', quantity: 10, status: 'Low Stock', schoolId: 349 },
  { id: 11, name: 'ALCPT Form 138', quantity: 8, status: 'In Stock', schoolId: 349 },
  { id: 13, name: 'ALCPT Form 142', quantity: 5, status: 'Low Stock', schoolId: 349 },
  { id: 16, name: 'ALCPT Form 146', quantity: 2, status: 'Out of Stock', schoolId: 349 },
  
  // NFS East Forms
  { id: 4, name: 'ALCPT Form 129', quantity: 8, status: 'Low Stock', schoolId: 350 },
  { id: 5, name: 'ALCPT Form 130', quantity: 20, status: 'In Stock', schoolId: 350 },
  { id: 10, name: 'ALCPT Form 135', quantity: 3, status: 'Low Stock', schoolId: 350 },
  { id: 14, name: 'ALCPT Form 143', quantity: 6, status: 'In Stock', schoolId: 350 },
  { id: 17, name: 'ALCPT Form 147', quantity: 4, status: 'Low Stock', schoolId: 350 },
  { id: 19, name: 'ALCPT Form 150', quantity: 2, status: 'Low Stock', schoolId: 350 },
  { id: 21, name: 'ALCPT Form 153', quantity: 1, status: 'Low Stock', schoolId: 350 },
  
  // NFS West Forms
  { id: 6, name: 'ALCPT Form 131', quantity: 18, status: 'In Stock', schoolId: 351 },
  { id: 7, name: 'ALCPT Form 132', quantity: 12, status: 'Low Stock', schoolId: 351 },
  { id: 8, name: 'ALCPT Form 133', quantity: 5, status: 'Low Stock', schoolId: 351 },
  { id: 12, name: 'ALCPT Form 139', quantity: 7, status: 'In Stock', schoolId: 351 },
  { id: 15, name: 'ALCPT Form 144', quantity: 9, status: 'In Stock', schoolId: 351 },
  { id: 18, name: 'ALCPT Form 148', quantity: 3, status: 'Low Stock', schoolId: 351 },
  { id: 20, name: 'ALCPT Form 151', quantity: 0, status: 'Out of Stock', schoolId: 351 },
  { id: 22, name: 'ALCPT Form 154', quantity: 0, status: 'Out of Stock', schoolId: 351 },
];

// Mock data for inventory update history
const inventoryUpdateHistory = [
  { id: 101, date: '2025-03-15', forms: 'ALCPT Forms 126-130', quantity: 50, status: 'Received', schoolId: 349, notes: 'Annual inventory refresh' },
  { id: 102, date: '2025-02-28', forms: 'ALCPT Forms 131-135', quantity: 40, status: 'Distributed', schoolId: 350, notes: 'New course materials' },
  { id: 103, date: '2025-01-20', forms: 'ALCPT Forms 126-128', quantity: 30, status: 'Received', schoolId: 351, notes: 'Replacement for damaged items' },
  { id: 104, date: '2024-12-10', forms: 'ALCPT Forms 129-132', quantity: 45, status: 'Distributed', schoolId: 349, notes: 'Start of new term' },
  { id: 105, date: '2024-11-05', forms: 'ALCPT Forms 133-135', quantity: 25, status: 'Received', schoolId: 350, notes: 'Inventory replenishment' },
];

// Mock data for form catalog
const formCatalog = [
  { id: 1, name: 'ALCPT Form 126' },
  { id: 2, name: 'ALCPT Form 127' },
  { id: 3, name: 'ALCPT Form 128' },
  { id: 4, name: 'ALCPT Form 129' },
  { id: 5, name: 'ALCPT Form 130' },
  { id: 6, name: 'ALCPT Form 131' },
  { id: 7, name: 'ALCPT Form 132' },
  { id: 8, name: 'ALCPT Form 133' },
  { id: 9, name: 'ALCPT Form 134' },
  { id: 10, name: 'ALCPT Form 135' },
  { id: 11, name: 'ALCPT Form 136' },
  { id: 12, name: 'ALCPT Form 137' },
  { id: 13, name: 'ALCPT Form 138' },
  { id: 14, name: 'ALCPT Form 139' },
  { id: 15, name: 'ALCPT Form 140' },
  { id: 16, name: 'ALCPT Form 141' },
  { id: 17, name: 'ALCPT Form 142' },
  { id: 18, name: 'ALCPT Form 143' },
  { id: 19, name: 'ALCPT Form 144' },
  { id: 20, name: 'ALCPT Form 145' },
  { id: 21, name: 'ALCPT Form 146' },
  { id: 22, name: 'ALCPT Form 147' },
  { id: 23, name: 'ALCPT Form 148' },
  { id: 24, name: 'ALCPT Form 149' },
  { id: 25, name: 'ALCPT Form 150' },
  { id: 26, name: 'ALCPT Form 151' },
  { id: 27, name: 'ALCPT Form 152' },
  { id: 28, name: 'ALCPT Form 153' },
  { id: 29, name: 'ALCPT Form 154' },
  { id: 30, name: 'ALCPT Form 155' },
];

const AlcptOrder = () => {
  const { toast } = useToast();
  const { selectedSchool } = useSchool();
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [localFormsInventory, setLocalFormsInventory] = useState(alcptFormsInventory);
  const [showSchoolInventory, setShowSchoolInventory] = useState(true);
  
  // State for dialogs
  const [showAddFormDialog, setShowAddFormDialog] = useState(false);
  const [showEditFormDialog, setShowEditFormDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showInventoryUpdateDialog, setShowInventoryUpdateDialog] = useState(false);
  
  // State for form being edited or deleted
  const [currentForm, setCurrentForm] = useState<{
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
    formId: number;
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
      case 351: return { id: 351, name: 'NFS West', code: 'NFS_WEST', color: 'purple' };
      default: return null;
    }
  };
  
  // List of schools
  const schools = [
    { id: 349, name: 'KNFA', code: 'KNFA', color: 'blue' },
    { id: 350, name: 'NFS East', code: 'NFS_EAST', color: 'green' },
    { id: 351, name: 'NFS West', code: 'NFS_WEST', color: 'purple' },
  ];
  
  // Filter forms by school, search query, and status
  const filteredForms = localFormsInventory.filter(form => {
    const matchesSchool = selectedSchool ? form.schoolId === selectedSchool.id : 
                         viewingSchoolId ? form.schoolId === viewingSchoolId : true;
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || form.status === selectedStatus;
    
    return matchesSchool && matchesSearch && matchesStatus;
  });
  
  // Get forms for a specific school
  const getSchoolForms = (schoolId: number) => {
    return localFormsInventory.filter(form => form.schoolId === schoolId);
  };
  
  // Add a new form to inventory
  const handleAddForm = () => {
    // Generate new ID by finding max ID and adding 1
    const newId = Math.max(...localFormsInventory.map(form => form.id)) + 1;
    
    // Determine status based on quantity
    let status = 'Out of Stock';
    if (currentForm.quantity > 20) {
      status = 'In Stock';
    } else if (currentForm.quantity > 0) {
      status = 'Low Stock';
    }
    
    const newForm = {
      id: newId,
      name: currentForm.name,
      quantity: currentForm.quantity,
      status: status,
      schoolId: currentForm.schoolId,
    };
    
    setLocalFormsInventory([...localFormsInventory, newForm]);
    setShowAddFormDialog(false);
    setCurrentForm({
      name: '',
      quantity: 0,
      status: 'Out of Stock',
      schoolId: selectedSchool?.id || 349,
    });
    
    toast({
      title: "Form added",
      description: `${newForm.name} has been added to the inventory.`,
    });
  };
  
  // Edit an existing form
  const handleEditForm = () => {
    if (!currentForm.id) return;
    
    // Determine status based on quantity
    let status = 'Out of Stock';
    if (currentForm.quantity > 20) {
      status = 'In Stock';
    } else if (currentForm.quantity > 0) {
      status = 'Low Stock';
    }
    
    const updatedForms = localFormsInventory.map(form => {
      if (form.id === currentForm.id) {
        return {
          ...form,
          name: currentForm.name,
          quantity: currentForm.quantity,
          status: status,
          schoolId: currentForm.schoolId,
        };
      }
      return form;
    });
    
    setLocalFormsInventory(updatedForms);
    setShowEditFormDialog(false);
    
    toast({
      title: "Form updated",
      description: `${currentForm.name} has been updated.`,
    });
  };
  
  // Delete a form
  const handleDeleteForm = () => {
    if (!currentForm.id) return;
    
    const updatedForms = localFormsInventory.filter(form => form.id !== currentForm.id);
    setLocalFormsInventory(updatedForms);
    setShowDeleteConfirmation(false);
    
    toast({
      title: "Form removed",
      description: `${currentForm.name} has been removed from the inventory.`,
    });
  };
  
  // Edit form setup
  const openEditDialog = (form: typeof localFormsInventory[0]) => {
    setCurrentForm({
      id: form.id,
      name: form.name,
      quantity: form.quantity,
      status: form.status,
      schoolId: form.schoolId,
    });
    setShowEditFormDialog(true);
  };
  
  // Delete form setup
  const openDeleteDialog = (form: typeof localFormsInventory[0]) => {
    setCurrentForm({
      id: form.id,
      name: form.name,
      quantity: form.quantity,
      status: form.status,
      schoolId: form.schoolId,
    });
    setShowDeleteConfirmation(true);
  };
  
  // Filter inventory update history by school
  const filteredHistory = inventoryUpdateHistory.filter(update => {
    return selectedSchool ? update.schoolId === selectedSchool.id : 
          viewingSchoolId ? update.schoolId === viewingSchoolId : true;
  });
  
  // Add form to inventory update
  const addFormToInventoryUpdate = (formId: number) => {
    const formToAdd = formCatalog.find(form => form.id === formId);
    if (!formToAdd) return;
    
    const existingItem = inventoryUpdateItems.find(item => item.formId === formId);
    if (existingItem) {
      setInventoryUpdateItems(
        inventoryUpdateItems.map(item => 
          item.formId === formId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      );
    } else {
      setInventoryUpdateItems([...inventoryUpdateItems, {
        formId: formToAdd.id,
        name: formToAdd.name,
        quantity: 1
      }]);
    }
  };
  
  // Update quantity of form in inventory update
  const updateInventoryQuantity = (formId: number, quantity: number) => {
    if (quantity < 1) {
      setInventoryUpdateItems(inventoryUpdateItems.filter(item => item.formId !== formId));
      return;
    }
    
    setInventoryUpdateItems(
      inventoryUpdateItems.map(item => 
        item.formId === formId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  // Submit inventory update
  const submitInventoryUpdate = () => {
    if (inventoryUpdateItems.length === 0) {
      toast({
        title: "No forms selected",
        description: "Please add at least one form to your inventory update.",
        variant: "destructive",
      });
      return;
    }
    
    // Update inventory quantities
    const updatedInventory = [...localFormsInventory];
    
    inventoryUpdateItems.forEach(item => {
      const existingFormIndex = updatedInventory.findIndex(
        form => form.name === item.name && form.schoolId === (viewingSchoolId || selectedSchool?.id || 349)
      );
      
      if (existingFormIndex >= 0) {
        // Update existing form
        const newQuantity = updatedInventory[existingFormIndex].quantity + item.quantity;
        let newStatus = 'Out of Stock';
        if (newQuantity > 20) {
          newStatus = 'In Stock';
        } else if (newQuantity > 0) {
          newStatus = 'Low Stock';
        }
        
        updatedInventory[existingFormIndex] = {
          ...updatedInventory[existingFormIndex],
          quantity: newQuantity,
          status: newStatus
        };
      } else {
        // Add new form to inventory
        let status = 'Out of Stock';
        if (item.quantity > 20) {
          status = 'In Stock';
        } else if (item.quantity > 0) {
          status = 'Low Stock';
        }
        
        const newId = Math.max(...updatedInventory.map(form => form.id)) + 1;
        updatedInventory.push({
          id: newId,
          name: item.name,
          quantity: item.quantity,
          status: status,
          schoolId: viewingSchoolId || selectedSchool?.id || 349
        });
      }
    });
    
    setLocalFormsInventory(updatedInventory);
    setInventoryUpdateItems([]);
    setShowInventoryUpdateDialog(false);
    
    toast({
      title: "Inventory updated",
      description: `${inventoryUpdateItems.length} form types have been updated in the inventory.`,
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
      case 351: return 'bg-purple-600'; // Changed from orange to purple
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-transparent bg-clip-text">
          ALCPT Forms Inventory Management
        </h1>
        <p className="text-gray-500 mt-2">
          Track and manage ALCPT form inventory across all schools
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
                      <ClipboardCheck className="text-emerald-600" size={18} />
                      <CardTitle className="text-sm font-medium">Total ALCPT Forms</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-emerald-600">
                      {getSchoolForms(viewingSchoolId).reduce((total, form) => total + form.quantity, 0)}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Across {getSchoolForms(viewingSchoolId).length} form types
                    </p>
                    <Progress 
                      value={75} 
                      className="h-2 mt-4 bg-emerald-100"
                    />
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-0 shadow-md">
                  <div className={`h-2 w-full ${getSchoolColor(viewingSchoolId)}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="text-emerald-600" size={18} />
                      <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {getSchoolForms(viewingSchoolId).filter(form => form.status === 'In Stock').length}
                        </div>
                        <div className="text-xs text-gray-500">In Stock</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">
                          {getSchoolForms(viewingSchoolId).filter(form => form.status === 'Low Stock').length}
                        </div>
                        <div className="text-xs text-gray-500">Low Stock</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {getSchoolForms(viewingSchoolId).filter(form => form.status === 'Out of Stock').length}
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
                      <FileCheck className="text-emerald-600" size={18} />
                      <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-emerald-600">
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
                        <CardTitle>ALCPT Forms Inventory</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 gap-1"
                            onClick={() => {
                              setCurrentForm({
                                name: '',
                                quantity: 0,
                                status: 'Out of Stock',
                                schoolId: viewingSchoolId,
                              });
                              setShowAddFormDialog(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Add Form
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
                        View and manage {getSchoolById(viewingSchoolId)?.name} ALCPT forms inventory
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
                              <TableHead className="w-[300px]">Form Name</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getSchoolForms(viewingSchoolId).length > 0 ? (
                              getSchoolForms(viewingSchoolId).map((form) => (
                                <TableRow key={form.id}>
                                  <TableCell className="font-medium">{form.name}</TableCell>
                                  <TableCell>{form.quantity}</TableCell>
                                  <TableCell>
                                    <Badge className={getStatusColor(form.status)}>
                                      {form.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => openEditDialog(form)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => openDeleteDialog(form)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
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
                              <TableHead>Forms</TableHead>
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
                                  <TableCell>{update.forms}</TableCell>
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
                    <CardDescription>ALCPT Forms Inventory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="text-3xl font-bold">
                        {getSchoolForms(school.id).reduce((total, form) => total + form.quantity, 0)}
                      </div>
                      <p className="text-sm text-gray-500">Total Forms</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {getSchoolForms(school.id).filter(form => form.status === 'In Stock').length}
                        </div>
                        <p className="text-xs text-gray-500">In Stock</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-amber-600">
                          {getSchoolForms(school.id).filter(form => form.status === 'Low Stock').length}
                        </div>
                        <p className="text-xs text-gray-500">Low Stock</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-red-600">
                          {getSchoolForms(school.id).filter(form => form.status === 'Out of Stock').length}
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
              <div className="h-2 w-full bg-gradient-to-r from-emerald-600 to-teal-600" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="text-emerald-600" size={18} />
                  <CardTitle className="text-sm font-medium">Total ALCPT Forms</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-emerald-600">
                  {localFormsInventory.reduce((total, form) => total + form.quantity, 0)}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Across 3 schools and {localFormsInventory.length} form types
                </p>
                <Progress 
                  value={75} 
                  className="h-2 mt-4 bg-emerald-100"
                />
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="h-2 w-full bg-gradient-to-r from-teal-600 to-cyan-600" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="text-teal-600" size={18} />
                  <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {localFormsInventory.filter(form => form.status === 'In Stock').length}
                    </div>
                    <div className="text-xs text-gray-500">In Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {localFormsInventory.filter(form => form.status === 'Low Stock').length}
                    </div>
                    <div className="text-xs text-gray-500">Low Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {localFormsInventory.filter(form => form.status === 'Out of Stock').length}
                    </div>
                    <div className="text-xs text-gray-500">Out of Stock</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="h-2 w-full bg-gradient-to-r from-cyan-600 to-blue-600" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <School className="text-cyan-600" size={18} />
                  <CardTitle className="text-sm font-medium">School Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">KNFA</span>
                    <span className="text-sm text-gray-500">
                      {getSchoolForms(349).reduce((total, form) => total + form.quantity, 0)} forms
                    </span>
                  </div>
                  <Progress value={33} className="h-2 bg-blue-100" indicatorClassName="bg-blue-600" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">NFS East</span>
                    <span className="text-sm text-gray-500">
                      {getSchoolForms(350).reduce((total, form) => total + form.quantity, 0)} forms
                    </span>
                  </div>
                  <Progress value={33} className="h-2 bg-green-100" indicatorClassName="bg-green-600" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">NFS West</span>
                    <span className="text-sm text-gray-500">
                      {getSchoolForms(351).reduce((total, form) => total + form.quantity, 0)} forms
                    </span>
                  </div>
                  <Progress value={33} className="h-2 bg-orange-100" indicatorClassName="bg-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-0 shadow-md mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>ALCPT Forms Inventory Across All Schools</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 gap-1"
                    onClick={() => {
                      setCurrentForm({
                        name: '',
                        quantity: 0,
                        status: 'Out of Stock',
                        schoolId: selectedSchool?.id || 349,
                      });
                      setShowAddFormDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Form
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
                View and manage ALCPT forms inventory across all schools
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
                      <TableHead className="w-[250px]">Form Name</TableHead>
                      <TableHead>School</TableHead>
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
                          <TableCell>
                            {getSchoolById(form.schoolId)?.name}
                          </TableCell>
                          <TableCell>{form.quantity}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(form.status)}>
                              {form.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditDialog(form)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openDeleteDialog(form)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No forms found matching your filters
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
                      <TableHead>Forms</TableHead>
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
                          <TableCell>{update.forms}</TableCell>
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

      {/* Add Form Dialog */}
      <Dialog open={showAddFormDialog} onOpenChange={setShowAddFormDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New ALCPT Form</DialogTitle>
            <DialogDescription>
              Enter the details of the new ALCPT form to add to the inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="formName" className="text-right">
                Form Name
              </Label>
              <Input
                id="formName"
                className="col-span-3"
                value={currentForm.name}
                onChange={(e) => setCurrentForm({ ...currentForm, name: e.target.value })}
                placeholder="ALCPT Form XXX"
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
                value={currentForm.quantity}
                onChange={(e) => setCurrentForm({ ...currentForm, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="school" className="text-right">
                School
              </Label>
              <Select
                value={currentForm.schoolId.toString()}
                onValueChange={(value) => setCurrentForm({ ...currentForm, schoolId: parseInt(value) })}
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
            <Button variant="outline" onClick={() => setShowAddFormDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddForm}>Add Form</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditFormDialog} onOpenChange={setShowEditFormDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit ALCPT Form</DialogTitle>
            <DialogDescription>
              Update the details of the selected ALCPT form.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editFormName" className="text-right">
                Form Name
              </Label>
              <Input
                id="editFormName"
                className="col-span-3"
                value={currentForm.name}
                onChange={(e) => setCurrentForm({ ...currentForm, name: e.target.value })}
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
                value={currentForm.quantity}
                onChange={(e) => setCurrentForm({ ...currentForm, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSchool" className="text-right">
                School
              </Label>
              <Select
                value={currentForm.schoolId.toString()}
                onValueChange={(value) => setCurrentForm({ ...currentForm, schoolId: parseInt(value) })}
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
            <Button variant="outline" onClick={() => setShowEditFormDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditForm}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this ALCPT form from the inventory? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2"><strong>Form:</strong> {currentForm.name}</p>
            <p><strong>Quantity:</strong> {currentForm.quantity}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteForm}>
              Delete Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Form Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Upload ALCPT Form</DialogTitle>
            <DialogDescription>
              Upload an ALCPT form document or inventory list.
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
                placeholder="ALCPT Inventory Document"
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
                  <SelectItem value="form">ALCPT Form</SelectItem>
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
              Add or remove ALCPT forms from your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Available Forms</h4>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input placeholder="Search forms..." className="pl-10" />
              </div>
              <div className="max-h-60 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead>Form Name</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formCatalog.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell className="font-medium">{form.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => addFormToInventoryUpdate(form.id)}
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
              <h4 className="text-sm font-medium mb-2">Forms to Update</h4>
              {inventoryUpdateItems.length > 0 ? (
                <div className="space-y-3">
                  {inventoryUpdateItems.map((item) => (
                    <div key={item.formId} className="flex justify-between items-center border-b pb-2">
                      <div className="text-sm">{item.name}</div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateInventoryQuantity(item.formId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateInventoryQuantity(item.formId, item.quantity + 1)}
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
                  <p>No forms selected</p>
                  <p className="text-sm mt-1">Add forms from the available list</p>
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

export default AlcptOrder;