import { useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

// Data for book inventory by school
const schoolInventory = [
  {
    id: 349,
    name: "KFNA",
    code: "KFNA",
    color: "#2563eb",
    totalBooks: 95,
    inStock: 8,
    lowStock: 3,
    outOfStock: 3
  },
  {
    id: 350,
    name: "NFS East",
    code: "NFS_EAST",
    color: "#22c55e",
    totalBooks: 11670,
    inStock: 11667,
    lowStock: 2,
    outOfStock: 1
  },
  {
    id: 351,
    name: "NFS West",
    code: "NFS_WEST",
    color: "#8b5cf6",
    totalBooks: 54,
    inStock: 50,
    lowStock: 1,
    outOfStock: 3
  }
];

const DLI = () => {
  const [showConsolidated, setShowConsolidated] = useState(false);

  return (
    <div className="flex-1 p-8 bg-white overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">DLI Book Inventory Management</h1>
            <p className="text-gray-600 mt-1">Track and manage book inventory across all schools</p>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Show Consolidated</span>
            <Switch 
              checked={showConsolidated}
              onCheckedChange={setShowConsolidated}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schoolInventory.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      </div>
    </div>
  );
};

const SchoolCard = ({ school }: { school: typeof schoolInventory[0] }) => {
  const stockLabel = school.id === 351 ? "Stock" : "In Stock";
  
  return (
    <Card className="border border-gray-200 rounded-lg overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col items-center mb-5">
          <div className="mb-2">
            {school.name === "KFNA" && <BookIcon color="#2563eb" />}
            {school.name === "NFS East" && <BookIcon color="#22c55e" />}
            {school.name === "NFS West" && <BookIcon color="#8b5cf6" />}
          </div>
          
          <h2 className="text-2xl font-bold text-center">{school.name}</h2>
          <p className="text-gray-500 text-sm">Total Inventory</p>
          <p className="text-4xl font-bold mt-1">{school.totalBooks}</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">●</span>
              <span className="text-green-600 font-medium">{stockLabel}</span>
            </div>
            <span className="font-semibold">{school.inStock}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-2">●</span>
              <span className="text-yellow-500 font-medium">Low Stock</span>
            </div>
            <span className="font-semibold">{school.lowStock}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">●</span>
              <span className="text-red-500 font-medium">Out of Stock</span>
            </div>
            <span className="font-semibold">{school.outOfStock}</span>
          </div>
        </div>
        
        <Link href={`/dli/book-order`}>
          <Button 
            className="w-full mt-4 text-white font-medium py-1.5" 
            style={{ backgroundColor: school.color }}
          >
            View Inventory
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

const BookIcon = ({ color }: { color: string }) => (
  <svg width="40" height="40" viewBox="0 0 64 64" fill={color}>
    <path d="M19.9 7c-3.5 0-6.5 0.7-8.9 2.1v37.5c2.4-1.2 5.4-1.8 8.9-1.8 3.6 0 7.7 0.7 10.1 2.1 2.4-1.4 6.5-2.1 10.1-2.1 3.5 0 6.5 0.7 8.9 1.8V9.1c-2.4-1.4-5.4-2.1-8.9-2.1-3.6 0-7.7 0.7-10.1 2.1-2.4-1.4-6.5-2.1-10.1-2.1z" />
  </svg>
);

export default DLI;