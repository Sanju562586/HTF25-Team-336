import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MedicalHistoryItem, MedicalHistoryType } from '@/types/healthRecord';
import { Activity, Edit3, Save, X, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MedicalHistorySectionProps {
  data: MedicalHistoryItem[];
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: MedicalHistoryItem[]) => void;
  patientId: string;
}

export const MedicalHistorySection: React.FC<MedicalHistorySectionProps> = ({
  data,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  patientId
}) => {
  const [formData, setFormData] = useState<MedicalHistoryItem[]>(data);
  const [newItem, setNewItem] = useState<Omit<MedicalHistoryItem, 'id'>>({
    type: 'ALLERGY',
    title: '',
    description: '',
    onsetDate: '',
    severity: 'LOW',
    isActive: true
  });
  const { toast } = useToast();

  useEffect(() => {
    setFormData(data);
  }, [data, isEditing]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleCancel = () => {
    setFormData(data);
    setNewItem({
      type: 'ALLERGY',
      title: '',
      description: '',
      onsetDate: '',
      severity: 'LOW',
      isActive: true
    });
    onCancel();
  };

  const addNewItem = () => {
    if (!newItem.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a title for the medical history item.",
        variant: "destructive",
      });
      return;
    }

    const itemWithId: MedicalHistoryItem = {
      ...newItem,
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setFormData(prev => [...prev, itemWithId]);
    setNewItem({
      type: 'ALLERGY',
      title: '',
      description: '',
      onsetDate: '',
      severity: 'LOW',
      isActive: true
    });
  };

  const removeItem = (id: string) => {
    setFormData(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<MedicalHistoryItem>) => {
    setFormData(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const typeOptions: { value: MedicalHistoryType; label: string; color: string }[] = [
    { value: 'ALLERGY', label: 'Allergy', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'PAST_CONDITION', label: 'Past Condition', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'SURGERY', label: 'Surgery', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'FAMILY_HISTORY', label: 'Family History', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'OTHER', label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];

  const severityOptions = [
    { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'MODERATE', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  const getTypeColor = (type: MedicalHistoryType) => {
    return typeOptions.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity?: string) => {
    return severityOptions.find(s => s.value === severity)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-purple/5 border-border/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <span>Medical History</span>
              <p className="text-sm font-normal text-muted-foreground">
                {data.length} {data.length === 1 ? 'item' : 'items'} recorded
              </p>
            </div>
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
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
                <Activity className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No medical history recorded</p>
                <p className="text-sm text-muted-foreground/80 mt-1">Click Edit to add medical history items</p>
              </div>
            ) : (
              data.map((item) => (
                <div key={item.id} className="p-4 bg-muted/20 rounded-lg border border-muted-foreground/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeColor(item.type)}>
                        {typeOptions.find(t => t.value === item.type)?.label}
                      </Badge>
                      {item.severity && (
                        <Badge variant="outline" className={getSeverityColor(item.severity)}>
                          {item.severity}
                        </Badge>
                      )}
                      {!item.isActive && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-500">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {item.onsetDate && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.onsetDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add New Item Form */}
            <div className="p-4 bg-accent/20 rounded-lg border-2 border-dashed border-accent/30">
              <h4 className="font-semibold mb-4 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add New Medical History Item
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="newType">Type</Label>
                  <Select
                    value={newItem.type}
                    onValueChange={(value: MedicalHistoryType) => 
                      setNewItem(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newTitle">Title *</Label>
                  <Input
                    id="newTitle"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Peanut allergy, Hypertension"
                  />
                </div>
                <div>
                  <Label htmlFor="newSeverity">Severity</Label>
                  <Select
                    value={newItem.severity}
                    onValueChange={(value: 'LOW' | 'MODERATE' | 'HIGH') => 
                      setNewItem(prev => ({ ...prev, severity: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newOnsetDate">Onset Date</Label>
                  <Input
                    id="newOnsetDate"
                    type="date"
                    value={newItem.onsetDate}
                    onChange={(e) => setNewItem(prev => ({ ...prev, onsetDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="newDescription">Description</Label>
                <Textarea
                  id="newDescription"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about this condition..."
                  rows={2}
                />
              </div>
              <Button onClick={addNewItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Existing Items */}
            <div className="space-y-4">
              <h4 className="font-semibold">Current Items ({formData.length})</h4>
              {formData.map((item, index) => {
                return (
                  <div key={item.id} className="p-4 bg-muted/20 rounded-lg border border-muted-foreground/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <Badge className={getTypeColor(item.type)}>
                        {typeOptions.find(t => t.value === item.type)?.label}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={item.type}
                        onValueChange={(value: MedicalHistoryType) => 
                          updateItem(item.id, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {typeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Severity</Label>
                      <Select
                        value={item.severity}
                        onValueChange={(value: 'LOW' | 'MODERATE' | 'HIGH') => 
                          updateItem(item.id, { severity: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {severityOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Onset Date</Label>
                      <Input
                        type="date"
                        value={item.onsetDate || ''}
                        onChange={(e) => updateItem(item.id, { onsetDate: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Label>Description</Label>
                    <Textarea
                      value={item.description || ''}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`active-${item.id}`}
                      checked={item.isActive}
                      onChange={(e) => updateItem(item.id, { isActive: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor={`active-${item.id}`} className="text-sm">
                      Currently active
                    </Label>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
