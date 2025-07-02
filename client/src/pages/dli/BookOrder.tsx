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
import { BookText, CalendarDays, Search, Filter, Download, Printer, ArrowUpDown, Plus, FileText, FileCheck, Package, Edit, Trash2, Upload, FileUp, School, ChevronDown } from 'lucide-react';

// Mock data for book inventory - expanded to include more books for each school
const bookInventory = [
  // KFNA Books
  { id: 1, name: 'American Language Course Book 1', level: '', quantity: 25, status: 'In Stock', schoolId: 349 },
  { id: 2, name: 'American Language Course Book 2', level: '', quantity: 30, status: 'In Stock', schoolId: 349 },
  { id: 3, name: 'American Language Course Book 3', level: '', quantity: 15, status: 'Low Stock', schoolId: 349 },
  { id: 9, name: 'American Language Course Book 9', level: '', quantity: 10, status: 'Low Stock', schoolId: 349 },
  { id: 11, name: 'American Language Course Book 12', level: '', quantity: 8, status: 'In Stock', schoolId: 349 },
  { id: 13, name: 'American Language Course Book 15', level: '', quantity: 5, status: 'Low Stock', schoolId: 349 },
  { id: 16, name: 'American Language Course Book 18', level: '', quantity: 2, status: 'Out of Stock', schoolId: 349 },
  
  // NFS East Books - Updated from inventory spreadsheet on April 28, 2025
  { id: 4, name: 'American Language Course Book 1', level: '', quantity: 410, status: 'In Stock', schoolId: 350 },
  { id: 5, name: 'American Language Course Book 2', level: '', quantity: 488, status: 'In Stock', schoolId: 350 },
  { id: 24, name: 'American Language Course Book 3', level: '', quantity: 446, status: 'In Stock', schoolId: 350 },
  { id: 25, name: 'American Language Course Book 4', level: '', quantity: 392, status: 'In Stock', schoolId: 350 },
  { id: 26, name: 'American Language Course Book 5', level: '', quantity: 563, status: 'In Stock', schoolId: 350 },
  { id: 27, name: 'American Language Course Book 6', level: '', quantity: 374, status: 'In Stock', schoolId: 350 },
  { id: 28, name: 'American Language Course Book 7', level: '', quantity: 383, status: 'In Stock', schoolId: 350 },
  { id: 29, name: 'American Language Course Book 8', level: '', quantity: 460, status: 'In Stock', schoolId: 350 },
  { id: 30, name: 'American Language Course Book 9', level: '', quantity: 496, status: 'In Stock', schoolId: 350 },
  { id: 31, name: 'American Language Course Book 10', level: '', quantity: 515, status: 'In Stock', schoolId: 350 },
  { id: 32, name: 'American Language Course Book 11', level: '', quantity: 564, status: 'In Stock', schoolId: 350 },
  { id: 33, name: 'American Language Course Book 12', level: '', quantity: 457, status: 'In Stock', schoolId: 350 },
  { id: 34, name: 'American Language Course Book 13', level: '', quantity: 589, status: 'In Stock', schoolId: 350 },
  { id: 35, name: 'American Language Course Book 14', level: '', quantity: 653, status: 'In Stock', schoolId: 350 },
  { id: 36, name: 'American Language Course Book 15', level: '', quantity: 551, status: 'In Stock', schoolId: 350 },
  { id: 37, name: 'American Language Course Book 16', level: '', quantity: 569, status: 'In Stock', schoolId: 350 },
  { id: 38, name: 'American Language Course Book 17', level: '', quantity: 181, status: 'In Stock', schoolId: 350 },
  { id: 39, name: 'American Language Course Book 18', level: '', quantity: 257, status: 'In Stock', schoolId: 350 },
  { id: 40, name: 'American Language Course Book 19', level: '', quantity: 168, status: 'In Stock', schoolId: 350 },
  { id: 41, name: 'American Language Course Book 20', level: '', quantity: 299, status: 'In Stock', schoolId: 350 },
  { id: 42, name: 'American Language Course Book 21', level: '', quantity: 180, status: 'In Stock', schoolId: 350 },
  { id: 43, name: 'American Language Course Book 22', level: '', quantity: 141, status: 'In Stock', schoolId: 350 },
  { id: 44, name: 'American Language Course Book 23', level: '', quantity: 204, status: 'In Stock', schoolId: 350 },
  { id: 45, name: 'American Language Course Book 24', level: '', quantity: 377, status: 'In Stock', schoolId: 350 },
  { id: 46, name: 'American Language Course Book 25', level: '', quantity: 270, status: 'In Stock', schoolId: 350 },
  { id: 47, name: 'American Language Course Book 26', level: '', quantity: 247, status: 'In Stock', schoolId: 350 },
  { id: 48, name: 'American Language Course Book 27', level: '', quantity: 250, status: 'In Stock', schoolId: 350 },
  { id: 49, name: 'American Language Course Book 28', level: '', quantity: 259, status: 'In Stock', schoolId: 350 },
  { id: 50, name: 'American Language Course Book 29', level: '', quantity: 223, status: 'In Stock', schoolId: 350 },
  { id: 51, name: 'American Language Course Book 30', level: '', quantity: 169, status: 'In Stock', schoolId: 350 },
  { id: 52, name: 'American Language Course Book 31', level: '', quantity: 184, status: 'In Stock', schoolId: 350 },
  { id: 53, name: 'American Language Course Book 32', level: '', quantity: 107, status: 'In Stock', schoolId: 350 },
  { id: 54, name: 'American Language Course Book 33', level: '', quantity: 111, status: 'In Stock', schoolId: 350 },
  { id: 55, name: 'American Language Course Book 34', level: '', quantity: 133, status: 'In Stock', schoolId: 350 },
  
  // NFS West Books
  { id: 6, name: 'American Language Course Book 6', level: '', quantity: 18, status: 'In Stock', schoolId: 351 },
  { id: 7, name: 'American Language Course Book 7', level: '', quantity: 12, status: 'Low Stock', schoolId: 351 },
  { id: 8, name: 'American Language Course Book 8', level: '', quantity: 5, status: 'Low Stock', schoolId: 351 },
  { id: 12, name: 'American Language Course Book 14', level: '', quantity: 7, status: 'In Stock', schoolId: 351 },
  { id: 15, name: 'American Language Course Book 17', level: '', quantity: 9, status: 'In Stock', schoolId: 351 },
  { id: 18, name: 'American Language Course Book 23', level: '', quantity: 3, status: 'Low Stock', schoolId: 351 },
  { id: 20, name: 'American Language Course Book 28', level: '', quantity: 0, status: 'Out of Stock', schoolId: 351 },
  { id: 22, name: 'American Language Course Book 34', level: '', quantity: 0, status: 'Out of Stock', schoolId: 351 },
];

// Mock data for inventory update history
const inventoryUpdateHistory = [
  { id: 101, date: '2025-03-15', books: 'ALC Books 1-5', quantity: 50, status: 'Received', schoolId: 349, notes: 'Annual inventory refresh' },
  { id: 102, date: '2025-02-28', books: 'ALC Books 6-10', quantity: 40, status: 'Distributed', schoolId: 350, notes: 'New course materials' },
  { id: 103, date: '2025-01-20', books: 'ALC Books 1-3', quantity: 30, status: 'Received', schoolId: 351, notes: 'Replacement for damaged items' },
  { id: 104, date: '2024-12-10', books: 'ALC Books 4-7', quantity: 45, status: 'Distributed', schoolId: 349, notes: 'Start of new term' },
  { id: 105, date: '2024-11-05', books: 'ALC Books 8-10', quantity: 25, status: 'Received', schoolId: 350, notes: 'Inventory replenishment' },
];

// Mock data for book catalog - Complete list of all 34 books
const bookCatalog = [
  { id: 1, name: 'American Language Course Book 1', level: '' },
  { id: 2, name: 'American Language Course Book 2', level: '' },
  { id: 3, name: 'American Language Course Book 3', level: '' },
  { id: 4, name: 'American Language Course Book 4', level: '' },
  { id: 5, name: 'American Language Course Book 5', level: '' },
  { id: 6, name: 'American Language Course Book 6', level: '' },
  { id: 7, name: 'American Language Course Book 7', level: '' },
  { id: 8, name: 'American Language Course Book 8', level: '' },
  { id: 9, name: 'American Language Course Book 9', level: '' },
  { id: 10, name: 'American Language Course Book 10', level: '' },
  { id: 11, name: 'American Language Course Book 11', level: '' },
  { id: 12, name: 'American Language Course Book 12', level: '' },
  { id: 13, name: 'American Language Course Book 13', level: '' },
  { id: 14, name: 'American Language Course Book 14', level: '' },
  { id: 15, name: 'American Language Course Book 15', level: '' },
  { id: 16, name: 'American Language Course Book 16', level: '' },
  { id: 17, name: 'American Language Course Book 17', level: '' },
  { id: 18, name: 'American Language Course Book 18', level: '' },
  { id: 19, name: 'American Language Course Book 19', level: '' },
  { id: 20, name: 'American Language Course Book 20', level: '' },
  { id: 21, name: 'American Language Course Book 21', level: '' },
  { id: 22, name: 'American Language Course Book 22', level: '' },
  { id: 23, name: 'American Language Course Book 23', level: '' },
  { id: 24, name: 'American Language Course Book 24', level: '' },
  { id: 25, name: 'American Language Course Book 25', level: '' },
  { id: 26, name: 'American Language Course Book 26', level: '' },
  { id: 27, name: 'American Language Course Book 27', level: '' },
  { id: 28, name: 'American Language Course Book 28', level: '' },
  { id: 29, name: 'American Language Course Book 29', level: '' },
  { id: 30, name: 'American Language Course Book 30', level: '' },
  { id: 31, name: 'American Language Course Book 31', level: '' },
  { id: 32, name: 'American Language Course Book 32', level: '' },
  { id: 33, name: 'American Language Course Book 33', level: '' },
  { id: 34, name: 'American Language Course Book 34', level: '' },
];

const BookOrder = () => {
  const { toast } = useToast();
  const { selectedSchool } = useSchool();
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [localBookInventory, setLocalBookInventory] = useState(bookInventory);
  const [showSchoolInventory, setShowSchoolInventory] = useState(true);
  
  // State for dialogs
  const [showAddBookDialog, setShowAddBookDialog] = useState(false);
  const [showEditBookDialog, setShowEditBookDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showInventoryUpdateDialog, setShowInventoryUpdateDialog] = useState(false);
  
  // State for file upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("inventory");
  const [uploadSchool, setUploadSchool] = useState(selectedSchool?.id.toString() || "349");
  const [uploadComments, setUploadComments] = useState("");
  
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
    level: '',
    quantity: 0,
    status: 'Out of Stock',
    schoolId: selectedSchool?.id || 349,
  });
  
  // State for inventory update
  const [inventoryUpdateItems, setInventoryUpdateItems] = useState<{
    bookId: number;
    name: string;
    quantity: number;
  }[]>([]);
  
  // State for selected school in school inventory view
  const [viewingSchoolId, setViewingSchoolId] = useState<number | null>(null);
  
  // Get school by ID
  const getSchoolById = (id: number) => {
    switch (id) {
      case 349: return { id: 349, name: 'KFNA', code: 'KFNA', color: 'blue' };
      case 350: return { id: 350, name: 'NFS East', code: 'NFS_EAST', color: 'green' };
      case 351: return { id: 351, name: 'NFS West', code: 'NFS_WEST', color: 'purple' };
      default: return null;
    }
  };
  
  // List of schools
  const schools = [
    { id: 349, name: 'KFNA', code: 'KFNA', color: 'blue' },
    { id: 350, name: 'NFS East', code: 'NFS_EAST', color: 'green' },
    { id: 351, name: 'NFS West', code: 'NFS_WEST', color: 'purple' },
  ];
  
  // Filter books by school, search query, status, and level
  const filteredBooks = localBookInventory.filter(book => {
    const matchesSchool = selectedSchool ? book.schoolId === selectedSchool.id : 
                         viewingSchoolId ? book.schoolId === viewingSchoolId : true;
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
    const matchesLevel = selectedLevel === 'all' || book.level === selectedLevel;
    
    return matchesSchool && matchesSearch && matchesStatus && matchesLevel;
  });
  
  // Get books for a specific school
  const getSchoolBooks = (schoolId: number) => {
    return localBookInventory.filter(book => book.schoolId === schoolId);
  };
  
  // Add a new book to inventory
  const handleAddBook = () => {
    // Generate new ID by finding max ID and adding 1
    const newId = Math.max(...localBookInventory.map(book => book.id)) + 1;
    
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
    
    setLocalBookInventory([...localBookInventory, newBook]);
    setShowAddBookDialog(false);
    setCurrentBook({
      name: '',
      level: '',
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
    
    const updatedBooks = localBookInventory.map(book => {
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
    
    setLocalBookInventory(updatedBooks);
    setShowEditBookDialog(false);
    
    toast({
      title: "Book updated",
      description: `${currentBook.name} has been updated.`,
    });
  };
  
  // Delete a book
  const handleDeleteBook = () => {
    if (!currentBook.id) return;
    
    const updatedBooks = localBookInventory.filter(book => book.id !== currentBook.id);
    setLocalBookInventory(updatedBooks);
    setShowDeleteConfirmation(false);
    
    toast({
      title: "Book removed",
      description: `${currentBook.name} has been removed from the inventory.`,
    });
  };
  
  // Edit book setup
  const openEditDialog = (book: typeof localBookInventory[0]) => {
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
  const openDeleteDialog = (book: typeof localBookInventory[0]) => {
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
  
  // Filter inventory update history by school
  const filteredHistory = inventoryUpdateHistory.filter(update => {
    return selectedSchool ? update.schoolId === selectedSchool.id : 
          viewingSchoolId ? update.schoolId === viewingSchoolId : true;
  });
  
  // Add book to inventory update
  const addBookToInventoryUpdate = (bookId: number) => {
    const bookToAdd = bookCatalog.find(book => book.id === bookId);
    if (!bookToAdd) return;
    
    const existingItem = inventoryUpdateItems.find(item => item.bookId === bookId);
    if (existingItem) {
      setInventoryUpdateItems(
        inventoryUpdateItems.map(item => 
          item.bookId === bookId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      );
    } else {
      setInventoryUpdateItems([...inventoryUpdateItems, {
        bookId: bookToAdd.id,
        name: bookToAdd.name,
        quantity: 1
      }]);
    }
  };
  
  // Update quantity of book in inventory update
  const updateInventoryQuantity = (bookId: number, quantity: number) => {
    if (quantity < 1) {
      setInventoryUpdateItems(inventoryUpdateItems.filter(item => item.bookId !== bookId));
      return;
    }
    
    setInventoryUpdateItems(
      inventoryUpdateItems.map(item => 
        item.bookId === bookId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  // Submit inventory update
  const submitInventoryUpdate = () => {
    if (inventoryUpdateItems.length === 0) {
      toast({
        title: "No books selected",
        description: "Please add at least one book to your inventory update.",
        variant: "destructive",
      });
      return;
    }
    
    // Update inventory quantities
    const updatedInventory = [...localBookInventory];
    
    inventoryUpdateItems.forEach(item => {
      const existingBookIndex = updatedInventory.findIndex(
        book => book.id === item.bookId && book.schoolId === (viewingSchoolId || selectedSchool?.id || 349)
      );
      
      if (existingBookIndex >= 0) {
        // Update existing book
        const newQuantity = updatedInventory[existingBookIndex].quantity + item.quantity;
        let newStatus = 'Out of Stock';
        if (newQuantity > 20) {
          newStatus = 'In Stock';
        } else if (newQuantity > 0) {
          newStatus = 'Low Stock';
        }
        
        updatedInventory[existingBookIndex] = {
          ...updatedInventory[existingBookIndex],
          quantity: newQuantity,
          status: newStatus
        };
      } else {
        // Add new book to inventory
        let status = 'Out of Stock';
        if (item.quantity > 20) {
          status = 'In Stock';
        } else if (item.quantity > 0) {
          status = 'Low Stock';
        }
        
        const book = bookCatalog.find(b => b.id === item.bookId);
        if (book) {
          const newId = Math.max(...updatedInventory.map(b => b.id)) + 1;
          updatedInventory.push({
            id: newId,
            name: book.name,
            level: book.level,
            quantity: item.quantity,
            status: status,
            schoolId: viewingSchoolId || selectedSchool?.id || 349
          });
        }
      }
    });
    
    setLocalBookInventory(updatedInventory);
    setInventoryUpdateItems([]);
    setShowInventoryUpdateDialog(false);
    
    toast({
      title: "Inventory updated",
      description: `${inventoryUpdateItems.length} book types have been updated in the inventory.`,
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
  
  // File upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "The file size exceeds the 10MB limit.",
          variant: "destructive",
        });
        return;
      }
      setUploadFile(file);
    }
  };
  
  const handleFileUpload = () => {
    if (!uploadFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (!uploadTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for this document.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, you would use FormData to send the file to the server
    // const formData = new FormData();
    // formData.append('file', uploadFile);
    // formData.append('title', uploadTitle);
    // formData.append('type', uploadType);
    // formData.append('schoolId', uploadSchool);
    // formData.append('comments', uploadComments);
    
    // Submit the form data to the server
    // For now, we'll just show a success message
    toast({
      title: "Form uploaded",
      description: "The document has been successfully uploaded.",
    });
    
    // Reset form state
    setUploadFile(null);
    setUploadTitle("");
    setUploadType("inventory");
    setUploadSchool(selectedSchool?.id.toString() || "349");
    setUploadComments("");
    setShowUploadDialog(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B1D51]">
          DLI Book Inventory Management
        </h1>
        <p className="text-gray-600 mt-2">
          Track and manage book inventory across all schools
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
          Show Consolidated View
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
                <Card className="overflow-hidden border-0 shadow-md rounded-none">
                  <div className={`h-2 w-full ${getSchoolColor(viewingSchoolId)}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <BookText className="text-indigo-600" size={18} />
                      <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-indigo-600">
                      {getSchoolBooks(viewingSchoolId).reduce((total, book) => total + book.quantity, 0)}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Across {getSchoolBooks(viewingSchoolId).length} book types
                    </p>
                    <Progress 
                      value={75} 
                      className="h-2 mt-4 bg-indigo-100"
                    />
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-0 shadow-md rounded-none">
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
                          {getSchoolBooks(viewingSchoolId).filter(book => book.status === 'In Stock').length}
                        </div>
                        <div className="text-xs text-gray-500">In Stock</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">
                          {getSchoolBooks(viewingSchoolId).filter(book => book.status === 'Low Stock').length}
                        </div>
                        <div className="text-xs text-gray-500">Low Stock</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {getSchoolBooks(viewingSchoolId).filter(book => book.status === 'Out of Stock').length}
                        </div>
                        <div className="text-xs text-gray-500">Out of Stock</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-0 shadow-md rounded-none">
                  <div className={`h-2 w-full ${getSchoolColor(viewingSchoolId)}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="text-fuchsia-600" size={18} />
                      <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-fuchsia-600">
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
                  <Card className="border-0 shadow-md rounded-none">
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
                                schoolId: viewingSchoolId,
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
                        View and manage {getSchoolById(viewingSchoolId)?.name} book inventory
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
                            <SelectItem value="Expert">Expert</SelectItem>
                            <SelectItem value="Master">Master</SelectItem>
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
                              <TableHead>Quantity</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getSchoolBooks(viewingSchoolId).length > 0 ? (
                              getSchoolBooks(viewingSchoolId).map((book) => (
                                <TableRow key={book.id}>
                                  <TableCell className="font-medium">{book.name}</TableCell>
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
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
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
                
                <TabsContent value="history">
                  <Card className="border-0 shadow-md rounded-none">
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
                              <TableHead>Books</TableHead>
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
                                  <TableCell>{update.books}</TableCell>
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
                  className="overflow-hidden border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow rounded-none"
                  onClick={() => viewSchoolInventory(school.id)}
                >
                  <div className={`h-2 w-full ${getSchoolColor(school.id)}`} />
                  <CardHeader className="pb-2">
                    <CardTitle>{school.name}</CardTitle>
                    <CardDescription>Book Inventory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="text-3xl font-bold">
                        {getSchoolBooks(school.id).reduce((total, book) => total + book.quantity, 0)}
                      </div>
                      <p className="text-sm text-gray-500">Total Books</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {getSchoolBooks(school.id).filter(book => book.status === 'In Stock').length}
                        </div>
                        <p className="text-xs text-gray-500">In Stock</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-amber-600">
                          {getSchoolBooks(school.id).filter(book => book.status === 'Low Stock').length}
                        </div>
                        <p className="text-xs text-gray-500">Low Stock</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-red-600">
                          {getSchoolBooks(school.id).filter(book => book.status === 'Out of Stock').length}
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
            <Card className="overflow-hidden border-0 shadow-md rounded-none">
              <div className="h-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BookText className="text-indigo-600" size={18} />
                  <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-indigo-600">
                  {localBookInventory.reduce((total, book) => total + book.quantity, 0)}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Across 3 schools and {localBookInventory.length} book types
                </p>
                <Progress 
                  value={75} 
                  className="h-2 mt-4 bg-indigo-100"
                />
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-0 shadow-md rounded-none">
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
                      {localBookInventory.filter(book => book.status === 'In Stock').length}
                    </div>
                    <div className="text-xs text-gray-500">In Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {localBookInventory.filter(book => book.status === 'Low Stock').length}
                    </div>
                    <div className="text-xs text-gray-500">Low Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {localBookInventory.filter(book => book.status === 'Out of Stock').length}
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
                  <School className="text-fuchsia-600" size={18} />
                  <CardTitle className="text-sm font-medium">School Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">KFNA</span>
                    <span className="text-sm text-gray-500">
                      {getSchoolBooks(349).reduce((total, book) => total + book.quantity, 0)} books
                    </span>
                  </div>
                  <div className="h-2 bg-blue-100 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: '33%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">NFS East</span>
                    <span className="text-sm text-gray-500">
                      {getSchoolBooks(350).reduce((total, book) => total + book.quantity, 0)} books
                    </span>
                  </div>
                  <div className="h-2 bg-green-100 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: '33%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">NFS West</span>
                    <span className="text-sm text-gray-500">
                      {getSchoolBooks(351).reduce((total, book) => total + book.quantity, 0)} books
                    </span>
                  </div>
                  <div className="h-2 bg-orange-100 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600" style={{ width: '33%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-0 shadow-md mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Book Inventory Across All Schools</CardTitle>
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
                View and manage book inventory across all schools
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
                      <TableHead className="w-[250px]">Book Name</TableHead>
                      <TableHead>School</TableHead>
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
                          <TableCell>
                            {getSchoolById(book.schoolId)?.name}
                          </TableCell>
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
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No books found matching your filters
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
                      <TableHead>Books</TableHead>
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
                          <TableCell>{update.books}</TableCell>
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
                  <SelectItem value="349">KFNA</SelectItem>
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
                  <SelectItem value="349">KFNA</SelectItem>
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
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="formType" className="text-right">
                Type
              </Label>
              <Select 
                defaultValue="inventory" 
                value={uploadType}
                onValueChange={setUploadType}
              >
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
              <Select 
                defaultValue={selectedSchool ? selectedSchool.id.toString() : viewingSchoolId ? viewingSchoolId.toString() : "349"}
                value={uploadSchool}
                onValueChange={setUploadSchool}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="349">KFNA</SelectItem>
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
                  <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 ${uploadFile ? 'border-green-300 bg-green-50' : 'border-gray-300 border-dashed bg-gray-50 hover:bg-gray-100'} rounded-lg cursor-pointer`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadFile ? (
                        <>
                          <FileCheck className="w-8 h-8 mb-3 text-green-500" />
                          <p className="mb-2 text-sm text-green-600 font-medium">File selected</p>
                          <p className="text-xs text-green-500">{uploadFile.name} ({(uploadFile.size / 1024).toFixed(2)} KB)</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-500">PDF, DOC, XLS or images (MAX. 10MB)</p>
                        </>
                      )}
                    </div>
                    <input 
                      id="dropzone-file" 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
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
                value={uploadComments}
                onChange={(e) => setUploadComments(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleFileUpload}
              disabled={!uploadFile || !uploadTitle.trim()}
            >
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
              Add or remove books from your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Available Books</h4>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input placeholder="Search books..." className="pl-10" />
              </div>
              <div className="max-h-60 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead>Book Name</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookCatalog.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => addBookToInventoryUpdate(book.id)}
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
              <h4 className="text-sm font-medium mb-2">Books to Update</h4>
              {inventoryUpdateItems.length > 0 ? (
                <div className="space-y-3">
                  {inventoryUpdateItems.map((item) => (
                    <div key={item.bookId} className="flex justify-between items-center border-b pb-2">
                      <div className="text-sm">{item.name}</div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateInventoryQuantity(item.bookId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateInventoryQuantity(item.bookId, item.quantity + 1)}
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
                  <BookText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>No books selected</p>
                  <p className="text-sm mt-1">Add books from the available list</p>
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

export default BookOrder;