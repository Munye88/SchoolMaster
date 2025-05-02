import { useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
        <div className="flex justify-between items-center mb-8">
          {/* Header */}
          <div>
            <h1 className="text-[32px] font-bold text-[#0f172a]">DLI Book Inventory Management</h1>
            <p className="text-gray-600 mt-1">Track and manage book inventory across all schools</p>
          </div>
          
          {/* Toggle Switch */}
          <div className="flex items-center space-x-3">
            <span className="text-base font-medium text-gray-700">Show Consolidated</span>
            <Switch
              checked={showConsolidated}
              onCheckedChange={setShowConsolidated}
            />
          </div>
        </div>
        
        {/* School Cards */}
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
  // Set unique label for NFS West
  const stockLabel = school.id === 351 ? "Stock" : "In Stock";
  
  return (
    <Card className="overflow-hidden border rounded-lg" style={{ borderColor: school.color }}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-6">
          {/* Book Icon */}
          <BookIcon color={school.color} />
          <h2 className="text-2xl font-bold text-center mt-2">{school.name}</h2>
          <p className="text-gray-500 text-sm">Total Inventory</p>
          <p className="text-4xl font-bold">{school.totalBooks}</p>
        </div>
        
        <div className="space-y-3 pt-2">
          {/* In Stock Row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6L5 8L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-green-600 font-medium">{stockLabel}</span>
            </div>
            <span className="font-semibold">{school.inStock}</span>
          </div>
          
          {/* Low Stock Row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8v5" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="1.5" fill="white" />
                </svg>
              </div>
              <span className="text-yellow-500 font-medium">Low Stock</span>
            </div>
            <span className="font-semibold">{school.lowStock}</span>
          </div>
          
          {/* Out of Stock Row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8v5" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="1.5" fill="white" />
                </svg>
              </div>
              <span className="text-red-500 font-medium">Out of Stock</span>
            </div>
            <span className="font-semibold">{school.outOfStock}</span>
          </div>
        </div>
        
        <Button 
          className="w-full mt-6 py-2 text-white font-medium" 
          style={{ backgroundColor: school.color }}
        >
          View Inventory
        </Button>
      </CardContent>
    </Card>
  );
};

// Book icon component with different colors
const BookIcon = ({ color }: { color: string }) => {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
      <path d="M12 5c1.915 0 3.597.28 5 .847V5c0-1.105-.893-2-1.998-2H4.998C3.893 3 3 3.895 3 5v14c0 1.105.893 2 1.998 2h10.004c1.105 0 1.998-.895 1.998-2v-.847A11.953 11.953 0 0 1 12 19c-1.915 0-3.597-.28-5-.847V5.847C8.403 5.28 10.085 5 12 5Z" fill={color} />
      <path d="M17 5.5V14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 16.75v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default DLI;