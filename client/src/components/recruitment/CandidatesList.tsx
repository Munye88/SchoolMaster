import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/common/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Candidate } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Search, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

interface CandidatesListProps {
  onSelectCandidate: (candidate: Candidate) => void;
  schoolId?: number;
}

export default function CandidatesList({ onSelectCandidate, schoolId }: CandidatesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: candidates = [], isLoading, error } = useQuery<Candidate[]>({
    queryKey: ['/api/candidates', schoolId],
    queryFn: async () => {
      const url = schoolId 
        ? `/api/candidates?schoolId=${schoolId}` 
        : '/api/candidates';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/candidates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({
        title: "Candidate deleted",
        description: "The candidate has been removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete candidate",
        variant: "destructive",
      });
    }
  });

  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'interviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'hired':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading candidates...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading candidates: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search candidates by name or email..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {candidates.length === 0 ? (
        <EmptyState
          title="No candidates yet"
          description="Start by adding your first candidate to the recruitment system."
          icon={<UserPlus className="h-10 w-10 text-gray-500" />}
        />
      ) : filteredCandidates.length === 0 ? (
        <EmptyState
          title="No results found"
          description={`No candidates match "${searchTerm}". Try a different search term.`}
          icon={<Search className="h-10 w-10 text-gray-500" />}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCandidates.map((candidate) => (
            <Card 
              key={candidate.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectCandidate(candidate)}
            >
              <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-base font-medium line-clamp-1">{candidate.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{candidate.email}</p>
                </div>
                <Badge variant="outline" className={getStatusColor(candidate.status)}>
                  {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Experience</p>
                    <p className="font-medium">{candidate.yearsExperience || 0} years</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Overall Score</p>
                    <p className="font-medium">{candidate.overallScore || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div>
                    <p className="text-gray-500">Submitted</p>
                    <p className="font-medium">
                      {new Date(candidate.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex justify-end items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(candidate.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}