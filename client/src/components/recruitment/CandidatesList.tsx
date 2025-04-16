import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Candidate } from '@shared/schema';
import { Eye, FileText, MoreVertical, Pencil, Trash2, UserCheck, Award, AlertCircle } from 'lucide-react';
import CandidateForm from './CandidateForm';
import CandidateDetails from './CandidateDetails';

interface CandidatesListProps {
  candidates: Candidate[];
  schoolId?: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'reviewed':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
    case 'shortlisted':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    case 'interviewed':
      return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100';
    case 'hired':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

const formatDate = (dateString?: Date | string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const CandidatesList: React.FC<CandidatesListProps> = ({ candidates, schoolId }) => {
  const { toast } = useToast();
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Candidate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCandidate = async () => {
    if (!confirmDelete) return;
    
    setIsDeleting(true);
    try {
      await apiRequest('DELETE', `/api/candidates/${confirmDelete.id}`);
      
      toast({
        title: 'Candidate Deleted',
        description: `${confirmDelete.name} has been removed from candidates.`,
      });
      
      // Refresh the candidates list
      queryClient.invalidateQueries({ queryKey: ['/api/schools', schoolId, 'candidates'] });
      
      // Close the dialog
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete candidate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setEditCandidate(null);
    queryClient.invalidateQueries({ queryKey: ['/api/schools', schoolId, 'candidates'] });
    toast({
      title: 'Candidate Updated',
      description: 'The candidate has been successfully updated.',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <FileText className="h-4 w-4" />;
      case 'reviewed':
        return <Eye className="h-4 w-4" />;
      case 'shortlisted':
        return <UserCheck className="h-4 w-4" />;
      case 'interviewed':
        return <UserCheck className="h-4 w-4" />;
      case 'hired':
        return <Award className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
          <CardDescription>
            Manage recruitment candidates for ELT instructor positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.yearsOfExperience} years</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(candidate.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(candidate.status)}
                          {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(candidate.uploadDate)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewCandidate(candidate)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditCandidate(candidate)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setConfirmDelete(candidate)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Total Candidates: {candidates.length}
        </CardFooter>
      </Card>

      {/* View Candidate Dialog */}
      {viewCandidate && (
        <Dialog open={!!viewCandidate} onOpenChange={() => setViewCandidate(null)}>
          <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Candidate Details</DialogTitle>
              <DialogDescription>
                Detailed information about {viewCandidate.name}
              </DialogDescription>
            </DialogHeader>
            <CandidateDetails candidate={viewCandidate} />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Candidate Dialog */}
      {editCandidate && (
        <Dialog open={!!editCandidate} onOpenChange={() => setEditCandidate(null)}>
          <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Candidate</DialogTitle>
              <DialogDescription>
                Update information for {editCandidate.name}
              </DialogDescription>
            </DialogHeader>
            <CandidateForm
              initialData={editCandidate}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditCandidate(null)}
              isEditing={true}
              schoolId={schoolId}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {confirmDelete.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteCandidate}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CandidatesList;