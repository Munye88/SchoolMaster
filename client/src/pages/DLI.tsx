import { useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { PrintButton } from "@/components/ui/print-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";

// Mock data for book inventory by school
const schoolInventory = [
  {
    id: 349,
    name: "KFNA",
    code: "KFNA",
    color: "#2563eb", // blue
    totalBooks: 95,
    inStock: 8,
    lowStock: 3,
    outOfStock: 3
  },
  {
    id: 350,
    name: "NFS East",
    code: "NFS_EAST",
    color: "#22c55e", // green
    totalBooks: 11670,
    inStock: 11667,
    lowStock: 2,
    outOfStock: 1
  },
  {
    id: 351,
    name: "NFS West",
    code: "NFS_WEST",
    color: "#8b5cf6", // purple
    totalBooks: 54,
    inStock: 50,
    lowStock: 1,
    outOfStock: 3
  }
];

const DLI = () => {
  const { selectedSchool } = useSchool();
  const [showConsolidated, setShowConsolidated] = useState(false);

  return (
    <div className="flex-1 p-8 bg-white overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">DLI Book Inventory Management</h1>
          <p className="text-xl text-gray-600">Track and manage book inventory across all schools</p>
        </div>
        
        <div className="flex justify-end mb-8">
          <div className="flex items-center space-x-2">
            <Label htmlFor="show-consolidated" className="text-gray-700 font-medium">
              Show Consolidated
            </Label>
            <Switch 
              id="show-consolidated" 
              checked={showConsolidated} 
              onCheckedChange={setShowConsolidated} 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schoolInventory.map((school) => (
            <SchoolInventoryCard key={school.id} school={school} />
          ))}
        </div>
      </div>
    </div>
  );
};

const SchoolInventoryCard = ({ school }: { school: typeof schoolInventory[0] }) => {
  return (
    <Card className="overflow-hidden border rounded-lg hover:shadow-md transition-shadow" style={{ borderColor: school.color }}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-4">
          <div 
            className="w-12 h-12 flex items-center justify-center rounded-lg mb-2"
            style={{ color: school.color }}
          >
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-center">{school.name}</h2>
          <p className="text-gray-500 text-sm">Total Inventory</p>
          <p className="text-4xl font-bold mt-2">{school.totalBooks}</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-green-600 font-medium">In Stock</span>
            </div>
            <span className="font-semibold">{school.inStock}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-yellow-600 font-medium">Low Stock</span>
            </div>
            <span className="font-semibold">{school.lowStock}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-red-600 font-medium">Out of Stock</span>
            </div>
            <span className="font-semibold">{school.outOfStock}</span>
          </div>
        </div>
        
        <Button 
          className="w-full mt-6" 
          style={{ backgroundColor: school.color }}
        >
          View Inventory
        </Button>
      </CardContent>
    </Card>
  );
};

export default DLI;