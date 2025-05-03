import { useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Link, Route } from "wouter";
import BookInventoryNew from "./dli/BookInventoryNew";
import AlcptFormNew from "./dli/AlcptFormNew";
import AnswerSheetsNew from "./dli/AnswerSheetsNew";

// Data for book inventory by school
const schoolInventory = [
  {
    id: 349,
    name: "KFNA",
    code: "KFNA",
    color: "#2563eb",
    totalBooks: 95,
    inStock: 91,
    lowStock: 4,
    outOfStock: 0
  },
  {
    id: 350,
    name: "NFS East",
    code: "NFS_EAST",
    color: "#22c55e",
    totalBooks: 11670,
    inStock: 11666,
    lowStock: 3,
    outOfStock: 1
  },
  {
    id: 351,
    name: "NFS West",
    code: "NFS_WEST",
    color: "#8b5cf6",
    totalBooks: 54,
    inStock: 50,
    lowStock: 3,
    outOfStock: 2
  }
];

const DLI = () => {
  return (
    <div className="flex-1">
      <Route path="/dli" component={BookInventoryNew} />
      <Route path="/dli/book-inventory" component={BookInventoryNew} />
      <Route path="/dli/alcpt-form" component={AlcptFormNew} />
      <Route path="/dli/answer-sheets" component={AnswerSheetsNew} />
    </div>
  );
};

const BookIcon = ({ color }: { color: string }) => (
  <svg width="40" height="40" viewBox="0 0 64 64" fill={color}>
    <path d="M19.9 7c-3.5 0-6.5 0.7-8.9 2.1v37.5c2.4-1.2 5.4-1.8 8.9-1.8 3.6 0 7.7 0.7 10.1 2.1 2.4-1.4 6.5-2.1 10.1-2.1 3.5 0 6.5 0.7 8.9 1.8V9.1c-2.4-1.4-5.4-2.1-8.9-2.1-3.6 0-7.7 0.7-10.1 2.1-2.4-1.4-6.5-2.1-10.1-2.1z" />
  </svg>
);

export default DLI;