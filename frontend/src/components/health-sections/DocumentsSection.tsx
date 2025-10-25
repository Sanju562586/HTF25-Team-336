import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { HealthDocument, DocumentType } from '@/types/healthRecord';
import { Upload, FileText, Trash2, Eye, Download, Activity, Pill, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { healthRecordAPI } from '@/services/healthRecordApi';

interface DocumentsSectionProps {
  data: HealthDocument[] | null | undefined;
  isSaving: boolean;
  onSave: (data: HealthDocument[]) => void;
  patientId: string;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  data,
  isSaving,
  onSave,
  patientId
}) => {
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [viewingDocument, setViewingDocument] = useState<HealthDocument | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<HealthDocument | null>(null);
  const { toast } = useToast();

  const [newDocument, setNewDocument] = useState({
    type: 'OTHER' as DocumentType,
    name: '',
    file: null as File | null,
    description: ''
  });

  // Safe data access - always use an array
  const safeData = data || [];

  useEffect(() => {
    setDocuments(safeData);
  }, [safeData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewDocument(prev => ({
        ...prev,
        file,
        name: file.name
      }));
    }
  };

  const handleUploadDocument = async () => {
    if (!newDocument.file || !newDocument.name) {
      toast({
        title: "Missing information",
        description: "Please select a file and provide a name",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      const uploadedDocument = await healthRecordAPI.uploadDocument(
        patientId, 
        newDocument.file, 
        newDocument.type, 
        newDocument.description || ''
      );

      // Add the new document to the list
      const updatedDocuments = [...documents, uploadedDocument];
      setDocuments(updatedDocuments);
      onSave(updatedDocuments);

      // Reset form
      setNewDocument({
        type: 'OTHER',
        name: '',
        file: null,
        description: ''
      });
      setShowUploadForm(false);

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = (document: HealthDocument) => {
    setDocumentToDelete(document);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    const documentId = documentToDelete.id!;
    
    try {
      setDeletingId(documentId);
      
      // Parse documentId to number (assuming backend expects number)
      const documentIdNum = parseInt(documentId);
      
      if (isNaN(documentIdNum)) {
        throw new Error('Invalid document ID');
      }

      // Delete from backend
      await healthRecordAPI.deleteDocument(documentIdNum);
      
      // Remove from local state
      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocuments);
      onSave(updatedDocuments);

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      
      let errorMessage = "Failed to delete document";
      if (error.response?.status === 400) {
        errorMessage = "Bad request - invalid document ID or format";
      } else if (error.response?.status === 404) {
        errorMessage = "Document not found";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error - please try again later";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setDocumentToDelete(null);
    }
  };

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'LAB_REPORT', label: 'Lab Report' },
    { value: 'PRESCRIPTION', label: 'Prescription' },
    { value: 'SCAN', label: 'Medical Scan' },
    { value: 'VACCINATION_RECORD', label: 'Vaccination Record' },
    { value: 'INSURANCE', label: 'Insurance Document' },
    { value: 'OTHER', label: 'Other' }
  ];

  const getFileIcon = (type: DocumentType) => {
    switch (type) {
      case 'LAB_REPORT': return <Activity className="w-8 h-8 text-blue-500" />;
      case 'PRESCRIPTION': return <Pill className="w-8 h-8 text-green-500" />;
      case 'SCAN': return <FileText className="w-8 h-8 text-purple-500" />;
      default: return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase();
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-card via-card/95 to-indigo/5 border-border/30 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <span>Documents</span>
                <p className="text-sm font-normal text-muted-foreground">
                  {documents.length} document{documents.length !== 1 ? 's' : ''}
                </p>
              </div>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowUploadForm(true)}
              disabled={uploading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {documents.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
              <Upload className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No documents uploaded</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowUploadForm(true)}
                disabled={uploading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(doc.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{doc.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {documentTypes.find(t => t.value === doc.type)?.label} • {new Date(doc.uploadDate).toLocaleDateString()}
                        {doc.size && ` • ${(doc.size / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setViewingDocument(doc)}
                      disabled={deletingId === doc.id}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(doc)}
                      disabled={deletingId === doc.id}
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <Select
                value={newDocument.type}
                onValueChange={(value: DocumentType) => setNewDocument(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Document Name</Label>
              <Input
                placeholder="Enter document name"
                value={newDocument.name}
                onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Description (Optional)</Label>
              <Input
                placeholder="Enter description"
                value={newDocument.description}
                onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>File</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.png,.jpeg,.doc,.docx"
                onChange={handleFileChange}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUploadForm(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadDocument}
                disabled={!newDocument.file || !newDocument.name || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewingDocument?.name}</DialogTitle>
          </DialogHeader>
          
          {viewingDocument && (
            <div className="flex flex-col items-center justify-center p-6">
              {viewingDocument.url.match(/\.(pdf)$/i) ? (
                <iframe 
                  src={viewingDocument.url} 
                  className="w-full h-96 border rounded-lg"
                  title={viewingDocument.name}
                />
              ) : viewingDocument.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img 
                  src={viewingDocument.url} 
                  alt={viewingDocument.name}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="text-center py-12">
                  {getFileIcon(viewingDocument.type)}
                  <p className="mt-4 text-muted-foreground">
                    {getFileExtension(viewingDocument.name)} Document
                  </p>
                  <Button className="mt-4" asChild>
                    <a href={viewingDocument.url} download target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </a>
                  </Button>
                </div>
              )}
              
              {viewingDocument.description && (
                <div className="mt-6 p-4 bg-muted/20 rounded-lg w-full">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm">{viewingDocument.description}</p>
                </div>
              )}
              
              <div className="mt-6 grid grid-cols-2 gap-4 w-full text-sm">
                <div>
                  <span className="font-medium">Type:</span>{' '}
                  {documentTypes.find(t => t.value === viewingDocument.type)?.label}
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span>{' '}
                  {new Date(viewingDocument.uploadDate).toLocaleDateString()}
                </div>
                {viewingDocument.size && (
                  <div>
                    <span className="font-medium">Size:</span>{' '}
                    {(viewingDocument.size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document "
              {documentToDelete?.name}" from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};