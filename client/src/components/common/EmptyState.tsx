import { Button } from "@/components/ui/button";
import { FolderSearch } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FolderSearch,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
      <div className="bg-gray-100 p-4 rounded-full">
        <Icon className="h-10 w-10 text-gray-500" />
      </div>
      <h3 className="font-medium text-lg text-gray-900">{title}</h3>
      <p className="text-gray-500 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}