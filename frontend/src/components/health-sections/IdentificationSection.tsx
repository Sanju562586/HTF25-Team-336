import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IdentificationDetails } from '@/types/healthRecord';
import { FileText, Edit3, Save, X, Loader2, CreditCard } from 'lucide-react';

interface IdentificationSectionProps {
  data: IdentificationDetails;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: IdentificationDetails) => void;
}

export const IdentificationSection: React.FC<IdentificationSectionProps> = ({
  data,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave
}) => {
  const [formData, setFormData] = useState<IdentificationDetails>(data);

  useEffect(() => {
    setFormData(data);
  }, [data, isEditing]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleCancel = () => {
    setFormData(data);
    onCancel();
  };

  const maskIdentificationNumber = (id: string) => {
    if (!id) return 'Not provided';
    if (id.length <= 4) return id;
    return '*'.repeat(id.length - 4) + id.slice(-4);
  };

  const formatPatientId = (id: string) => {
    if (!id) return 'Not assigned';
    return `PID-${id}`;
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-green/5 border-border/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <span>Identification Details</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Patient ID</Label>
              <p className="mt-1 text-sm font-medium font-mono bg-muted/30 px-2 py-1 rounded">
                {formatPatientId(data.patientId)}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Government ID (Aadhaar)</Label>
              <p className="mt-1 text-sm font-medium">{maskIdentificationNumber(data.nationalId)}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Insurance Policy Number</Label>
              <p className="mt-1 text-sm font-medium">{data.insurancePolicyNumber || 'Not provided'}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                className="font-mono"
                disabled
                placeholder="System generated"
              />
              <p className="text-xs text-muted-foreground mt-1">System generated - cannot be modified</p>
            </div>
            <div>
              <Label htmlFor="nationalId">Government ID (Aadhaar)</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                placeholder="XXXX XXXX XXXX"
                maxLength={12}
              />
            </div>
            <div>
              <Label htmlFor="insurancePolicyNumber">Insurance Policy Number</Label>
              <Input
                id="insurancePolicyNumber"
                value={formData.insurancePolicyNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, insurancePolicyNumber: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};