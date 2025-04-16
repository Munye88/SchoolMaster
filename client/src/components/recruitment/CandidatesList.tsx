import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Candidate } from "@shared/schema";
import { Search, UserRound } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";

interface CandidatesListProps {
  onSelectCandidate: (candidate: Candidate) => void;
  schoolId?: number;
}

export default function CandidatesList({ onSelectCandidate, schoolId }: CandidatesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("uploadDate-desc");
  
  // Fetch candidates
  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
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

  // Filter candidates based on search term and status
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (candidate.phone && candidate.phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort candidates
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    const [field, direction] = sortBy.split('-');
    const multiplier = direction === 'desc' ? -1 : 1;
    
    switch (field) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'uploadDate':
        return multiplier * (new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      case 'score':
        return multiplier * ((a.overallScore || 0) - (b.overallScore || 0));
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-gray-100 text-gray-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "shortlisted":
        return "bg-green-100 text-green-800";
      case "interviewed":
        return "bg-purple-100 text-purple-800";
      case "hired":
        return "bg-emerald-100 text-emerald-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusLabels = {
    new: "New",
    reviewed: "Reviewed",
    shortlisted: "Shortlisted",
    interviewed: "Interviewed",
    hired: "Hired",
    rejected: "Rejected"
  };

  return (
    <Card>
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-lg font-medium">ELT Instructor Candidates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uploadDate-desc">Recent First</SelectItem>
                <SelectItem value="uploadDate-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="status-asc">Status (A-Z)</SelectItem>
                <SelectItem value="score-desc">Score (High-Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-pulse text-gray-400">Loading candidates...</div>
            </div>
          ) : sortedCandidates.length === 0 ? (
            <EmptyState
              title="No candidates found"
              description={
                searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Add candidates to start the recruitment process"
              }
              icon={UserRound}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {sortedCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onSelectCandidate(candidate)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{candidate.name}</h3>
                        <Badge className={getStatusColor(candidate.status)}>
                          {statusLabels[candidate.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>{candidate.email}</div>
                        {candidate.phone && <div>{candidate.phone}</div>}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {candidate.nativeEnglishSpeaker && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded">Native English</span>
                        )}
                        {candidate.degree && (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded">
                            {candidate.degree}{candidate.degreeField ? `: ${candidate.degreeField}` : ''}
                          </span>
                        )}
                        {candidate.yearsExperience && candidate.yearsExperience > 0 && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded">
                            {candidate.yearsExperience}+ years exp.
                          </span>
                        )}
                        {candidate.hasCertifications && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-800 rounded">
                            {candidate.certifications || 'Certified'}
                          </span>
                        )}
                        {candidate.militaryExperience && (
                          <span className="px-2 py-0.5 bg-gray-50 text-gray-800 rounded">Military Exp.</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {candidate.uploadDate && (
                        <span className="text-xs text-gray-500">
                          {new Date(candidate.uploadDate).toLocaleDateString()}
                        </span>
                      )}
                      {candidate.overallScore !== undefined && candidate.overallScore > 0 && (
                        <span className="font-medium flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded ${
                            candidate.overallScore >= 8 ? 'bg-green-100 text-green-800' :
                            candidate.overallScore >= 6 ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Score: {candidate.overallScore}/10
                          </span>
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCandidate(candidate);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}