import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { Inbox, Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-[400px] border border-dashed rounded-lg">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon || <Inbox className="h-10 w-10 text-gray-500" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}