import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { extractFilename } from '@/utils/stringHelpers';

interface BulkResumeUploadProps {
  onClose: () => void;
  onSuccess: () => void;
  schoolId?: number;
}

interface UploadResult {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

export default function BulkResumeUpload({ onClose, onSuccess, schoolId }: BulkResumeUploadProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Handle file selection
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array and filter out any non-PDF/DOC files
      const fileArray = Array.from(e.target.files);
      const validFiles = fileArray.filter(file => {
        const isValid = file.type === 'application/pdf' || 
                      file.type === 'application/msword' || 
                      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                      file.type === 'text/plain';
        
        if (!isValid) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported file type. Please upload PDF, DOC, or DOCX files.`,
            variant: "destructive"
          });
        }
        
        return isValid;
      });
      
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };
  
  // Remove a file from the list
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // Process all resumes
  const processResumes = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one resume file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setUploadResults(files.map(file => ({
      file,
      status: 'pending',
      progress: 0
    })));
    
    // Process files one by one
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update status to uploading
      setUploadResults(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'uploading', progress: 10 };
        return updated;
      });
      
      try {
        // Step 1: Upload and parse resume
        const formData = new FormData();
        formData.append('resume', file);
        
        // Update progress
        setUploadResults(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], progress: 30 };
          return updated;
        });
        
        // Send to parsing endpoint
        const parseResponse = await fetch('/api/candidates/parse-resume', {
          method: 'POST',
          body: formData
        });
        
        if (!parseResponse.ok) {
          throw new Error(`Failed to parse resume: ${parseResponse.statusText}`);
        }
        
        // Update progress
        setUploadResults(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], progress: 60 };
          return updated;
        });
        
        const parsedData = await parseResponse.json();
        
        // Step 2: Create candidate with parsed data
        const candidateData = {
          ...parsedData,
          schoolId: schoolId || undefined
        };
        
        // Update progress
        setUploadResults(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], progress: 80 };
          return updated;
        });
        
        const createResponse = await fetch('/api/candidates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(candidateData)
        });
        
        if (!createResponse.ok) {
          throw new Error(`Failed to create candidate: ${createResponse.statusText}`);
        }
        
        const createdCandidate = await createResponse.json();
        
        // Update results
        setUploadResults(prev => {
          const updated = [...prev];
          updated[i] = { 
            ...updated[i], 
            status: 'success', 
            progress: 100,
            result: createdCandidate
          };
          return updated;
        });
        
        successCount++;
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        
        // Update results with error
        setUploadResults(prev => {
          const updated = [...prev];
          updated[i] = { 
            ...updated[i], 
            status: 'error', 
            progress: 100,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
          return updated;
        });
        
        errorCount++;
      }
      
      // Update overall progress
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }
    
    // All files processed
    setIsProcessing(false);
    
    // Show summary toast
    toast({
      title: "Bulk Upload Complete",
      description: `Successfully processed ${successCount} of ${files.length} files. ${errorCount} errors occurred.`,
      variant: errorCount > 0 ? "destructive" : "default"
    });
    
    // If at least one was successful, notify parent component
    if (successCount > 0) {
      onSuccess();
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle>Bulk Resume Upload</CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* File selection area */}
        {!isProcessing && (
          <div className="space-y-4">
            <label 
              htmlFor="bulk-resume-upload" 
              className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md cursor-pointer hover:bg-blue-50 hover:border-blue-300"
            >
              <FileUp className="h-10 w-10 text-blue-500 mb-2" />
              <div className="text-center">
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Click to select multiple resumes
                </p>
                <p className="text-xs text-gray-500">
                  Upload PDF, DOC, or DOCX files (max 10MB each)
                </p>
              </div>
              <input
                id="bulk-resume-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileSelection}
              />
            </label>
            
            {/* Selected files list */}
            {files.length > 0 && (
              <div className="border rounded-md p-2">
                <div className="text-sm font-medium mb-2 px-2">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 px-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <FileUp className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(file.size / 1024)} KB
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Processing results */}
        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">
                Processing {uploadResults.length} files
              </div>
              <div className="text-sm">
                {uploadProgress}% complete
              </div>
            </div>
            
            <Progress value={uploadProgress} className="h-2 w-full" />
            
            <div className="border rounded-md p-2 mt-4">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {uploadResults.map((result, index) => (
                  <div key={index} className="flex items-center border-b last:border-b-0 pb-2 pt-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {result.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                        {(result.status === 'pending' || result.status === 'uploading') && (
                          <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                        )}
                        <span className="text-sm font-medium truncate" title={result.file.name}>
                          {result.file.name}
                        </span>
                      </div>
                      
                      {result.status === 'error' && (
                        <div className="text-xs text-red-500 mt-1 ml-6">
                          {result.error || 'Unknown error'}
                        </div>
                      )}
                      
                      {result.status === 'success' && result.result && (
                        <div className="text-xs text-gray-500 mt-1 ml-6">
                          {result.result.name} • {result.result.email}
                          {result.result.aiProvider && (
                            <Badge variant="outline" className="ml-2 text-xs px-1">
                              {result.result.aiProvider}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="w-16 flex-shrink-0">
                      <Progress value={result.progress} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onClose}
          disabled={isProcessing}
        >
          {isProcessing ? 'Close when done' : 'Cancel'}
        </Button>
        
        {!isProcessing && (
          <Button 
            onClick={processResumes}
            disabled={files.length === 0}
            className="gap-1"
          >
            <Upload className="h-4 w-4" />
            Process {files.length} resume{files.length !== 1 ? 's' : ''}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
