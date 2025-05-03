import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

// School data matching the screenshot but for ALCPT Forms
const schoolData = [
  {
    id: 349,
    name: 'KFNA',
    code: 'KFNA',
    color: '#2563eb', // Blue
    borderColor: 'border-blue-600',
    headerBg: 'bg-blue-600',
    total: 95,
    inStock: 91,
    lowStock: 4,
    outOfStock: 0
  },
  {
    id: 350,
    name: 'NFS East',
    code: 'NFS_EAST',
    color: '#22c55e', // Green
    borderColor: 'border-green-600',
    headerBg: 'bg-green-600',
    total: 5060,
    inStock: 5057,
    lowStock: 2,
    outOfStock: 1
  },
  {
    id: 351,
    name: 'NFS West',
    code: 'NFS_WEST',
    color: '#8b5cf6', // Purple
    borderColor: 'border-purple-600',
    headerBg: 'bg-purple-600',
    total: 120,
    inStock: 116,
    lowStock: 3,
    outOfStock: 1
  }
];

const AlcptForm = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-[#0B1D51] mb-2">DLI ALCPT Forms Management</h1>
      <p className="text-gray-600 mb-6">Track and manage ALCPT forms across all schools</p>

      {/* Show Consolidated View button */}
      <div className="mb-6">
        <Button variant="outline" className="flex items-center gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          Show Consolidated View
        </Button>
      </div>

      {/* School cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {schoolData.map(school => (
          <div 
            key={school.id} 
            className={`bg-white rounded-lg overflow-hidden shadow ${school.borderColor} border-t-4`}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-1">{school.name}</h2>
              <div className="text-sm text-gray-500 mb-1">ALCPT Forms</div>
              <div className="text-5xl font-bold mb-4">{school.total}</div>
              <div className="text-sm text-gray-500 mb-3">Total Forms</div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
                <div className="flex justify-between">
                  <div>
                    <div className="text-xl font-bold text-green-600">{school.inStock}</div>
                    <div className="text-sm text-green-600">In Stock</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">{school.inStock}</div>
                    <div className="text-sm text-green-600">In Stock</div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div>
                    <div className="text-xl font-bold text-amber-500">{school.lowStock}</div>
                    <div className="text-sm text-amber-500">Low Stock</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-red-500">{school.outOfStock}</div>
                    <div className="text-sm text-red-500">Out of Stock</div>
                  </div>
                </div>
              </div>

              <Link href={`/dli/alcpt-form/${school.code.toLowerCase()}`}>
                <Button 
                  className="w-full bg-[#0B1D51] hover:bg-[#1334A3] text-white font-medium"
                >
                  View Inventory
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlcptForm;