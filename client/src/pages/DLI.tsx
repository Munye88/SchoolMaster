import { useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Custom book icons for each school
const BookIcon = ({ color }: { color: string }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Circle indicator icon with different states
const StatusCircle = ({ type }: { type: 'green' | 'yellow' | 'red' }) => {
  const colors = {
    green: "#22c55e",
    yellow: "#f59e0b",
    red: "#ef4444"
  };
  
  const isNFSEast = type === 'green';
  
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" fill={colors[type]} />
      {/* Show check mark for green state */}
      {type === 'green' && (
        <path 
          d="M5 8L7 10L11 6" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      )}
      {/* Show exclamation mark for yellow and red states */}
      {(type === 'yellow' || type === 'red') && (
        <text 
          x="8" 
          y="12" 
          fontFamily="Arial" 
          fontSize="12" 
          fontWeight="bold" 
          textAnchor="middle" 
          fill="white"
        >
          !
        </text>
      )}
    </svg>
  );
};

// Data for book inventory by school
const schoolInventory = [
  {
    id: 349,
    name: "KFNA",
    code: "KFNA",
    color: "blue",
    totalBooks: 95,
    inStock: 8,
    lowStock: 3,
    outOfStock: 3
  },
  {
    id: 350,
    name: "NFS East",
    code: "NFS_EAST",
    color: "green",
    totalBooks: 11670,
    inStock: 11667,
    lowStock: 2,
    outOfStock: 1
  },
  {
    id: 351,
    name: "NFS West",
    code: "NFS_WEST",
    color: "purple",
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy-900">DLI Book Inventory Management</h1>
          <p className="text-lg text-gray-600 mt-2">Track and manage book inventory across all schools</p>
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
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      </div>
    </div>
  );
};

const SchoolCard = ({ school }: { school: typeof schoolInventory[0] }) => {
  const getColor = (colorName: string) => {
    switch (colorName) {
      case 'blue': return {
        border: '#2563eb',
        button: '#2563eb',
        icon: '#2563eb'
      };
      case 'green': return {
        border: '#22c55e',
        button: '#22c55e',
        icon: '#22c55e'
      };
      case 'purple': return {
        border: '#8b5cf6',
        button: '#8b5cf6',
        icon: '#8b5cf6'
      };
      default: return {
        border: '#6b7280',
        button: '#6b7280',
        icon: '#6b7280'
      };
    }
  };

  const colors = getColor(school.color);
  
  // Set unique label for NFS West
  const inStockLabel = school.id === 351 ? "Stock" : "In Stock";

  return (
    <Card className="overflow-hidden border border-2 rounded-lg" style={{ borderColor: colors.border }}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-4">
          <BookIcon color={colors.icon} />
          <h2 className="text-2xl font-bold text-center">{school.name}</h2>
          <p className="text-gray-500 text-sm">Total Inventory</p>
          <p className="text-4xl font-bold mt-2">{school.totalBooks}</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <StatusCircle type="green" />
              <span className="text-green-600 font-medium ml-2">{inStockLabel}</span>
            </div>
            <span className="font-semibold">{school.inStock}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <StatusCircle type="yellow" />
              <span className="text-yellow-600 font-medium ml-2">Low Stock</span>
            </div>
            <span className="font-semibold">{school.lowStock}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <StatusCircle type="red" />
              <span className="text-red-600 font-medium ml-2">Out of Stock</span>
            </div>
            <span className="font-semibold">{school.outOfStock}</span>
          </div>
        </div>
        
        <Button 
          className="w-full mt-6 font-medium text-white" 
          style={{ backgroundColor: colors.button }}
        >
          View Inventory
        </Button>
      </CardContent>
    </Card>
  );
};

export default DLI;