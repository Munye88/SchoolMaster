import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trash2, Check, X, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface AccessRequest {
  id: number;
  fullName: string;
  email: string;
  reason: string;
  requestType: 'registration' | 'password_reset';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

export default function AccessRequests() {
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [approvalForm, setApprovalForm] = useState({ username: '', password: '' });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/access-requests'],
    queryFn: async () => {
      const response = await fetch('/api/access-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch access requests');
      }
      return response.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, username, password }: { id: number; username: string; password: string }) => {
      const response = await fetch(`/api/access-requests/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve request');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/access-requests'] });
      setSelectedRequest(null);
      setApprovalForm({ username: '', password: '' });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/access-requests/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject request');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/access-requests'] });
      setSelectedRequest(null);
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const response = await fetch('/api/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
      return response.json();
    },
    onSuccess: () => {
      setShowPasswordChange(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleApprove = () => {
    if (!selectedRequest || !approvalForm.username || !approvalForm.password) return;
    
    approveMutation.mutate({
      id: selectedRequest.id,
      username: approvalForm.username,
      password: approvalForm.password
    });
  };

  const handleReject = (request: AccessRequest) => {
    if (confirm(`Are you sure you want to reject the access request from ${request.fullName}?`)) {
      rejectMutation.mutate(request.id);
    }
  };

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('All fields are required');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirmation do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const pendingRequests = requests.filter((r: AccessRequest) => r.status === 'pending');
  const processedRequests = requests.filter((r: AccessRequest) => r.status !== 'pending');

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Access Request Management</h1>
          <div className="text-center text-gray-600">Loading access requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Access Request Management</h1>
          <Button 
            onClick={() => setShowPasswordChange(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-none"
          >
            Change Password
          </Button>
        </div>
        
        {/* Pending Requests */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Pending Requests ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length === 0 ? (
            <Card className="p-8 rounded-none">
              <div className="text-center text-gray-600">
                No pending access requests at this time.
              </div>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pendingRequests.map((request: AccessRequest) => (
                <Card key={request.id} className="p-6 rounded-none">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{request.fullName}</h3>
                        <Badge className={`${getStatusBadge(request.status)} rounded-none`}>
                          {request.status.toUpperCase()}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 rounded-none">
                          {request.requestType === 'registration' ? 'New Account' : 'Password Reset'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-gray-700">
                        <p><strong>Email:</strong> {request.email}</p>
                        <p><strong>Reason:</strong> {request.reason}</p>
                        <p><strong>Requested:</strong> {format(new Date(request.createdAt), 'PPP p')}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => setSelectedRequest(request)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-none"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      <Button
                        onClick={() => handleReject(request)}
                        variant="destructive"
                        className="rounded-none"
                        size="sm"
                        disabled={rejectMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Approval Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 p-6 rounded-none">
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-6">
                Approve Access Request
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Applicant</Label>
                  <p className="text-gray-900">{selectedRequest.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Reason</Label>
                  <p className="text-gray-900">{selectedRequest.reason}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username for New Account
                  </Label>
                  <Input
                    id="username"
                    value={approvalForm.username}
                    onChange={(e) => setApprovalForm({ ...approvalForm, username: e.target.value })}
                    placeholder="Enter username"
                    className="rounded-none text-center"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password for New Account
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={approvalForm.password}
                    onChange={(e) => setApprovalForm({ ...approvalForm, password: e.target.value })}
                    placeholder="Enter password"
                    className="rounded-none text-center"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setSelectedRequest(null)}
                  variant="outline"
                  className="flex-1 rounded-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-none"
                  disabled={!approvalForm.username || !approvalForm.password || approveMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {approveMutation.isPending ? 'Creating...' : 'Approve & Create Account'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Processed Requests History */}
        {processedRequests.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              Request History ({processedRequests.length})
            </h2>
            
            <div className="grid gap-4">
              {processedRequests.map((request: AccessRequest) => (
                <Card key={request.id} className="p-4 rounded-none bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900">{request.fullName}</span>
                      <span className="text-gray-600 ml-2">({request.email})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusBadge(request.status)} rounded-none`}>
                        {request.status.toUpperCase()}
                      </Badge>
                      {request.processedAt && (
                        <span className="text-sm text-gray-600">
                          {format(new Date(request.processedAt), 'MM/dd/yyyy')}
                        </span>
                      )}
                      {request.processedBy && (
                        <span className="text-sm text-gray-600">by {request.processedBy}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md rounded-none">
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Change Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-gray-700 font-medium">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="rounded-none"
                      placeholder="Enter your current password"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="rounded-none"
                      placeholder="Enter your new password"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="rounded-none"
                      placeholder="Confirm your new password"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setShowPasswordChange(false)}
                    variant="outline"
                    className="flex-1 rounded-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordChange}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-none"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
                
                <div className="mt-4 text-sm text-gray-600 text-center">
                  Password must be at least 6 characters long
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}