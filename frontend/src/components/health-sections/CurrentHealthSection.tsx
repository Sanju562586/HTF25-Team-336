import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CurrentHealthData, CurrentMedication } from '@/types/healthRecord';
import { Activity, Edit3, Save, X, Loader2, Plus, Trash2, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CurrentHealthSectionProps {
  data: CurrentHealthData;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: CurrentHealthData) => void;
  patientId: string;
}

export const CurrentHealthSection: React.FC<CurrentHealthSectionProps> = ({
  data,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  patientId
}) => {
  const [formData, setFormData] = useState<CurrentHealthData>(data);
  const [newMedication, setNewMedication] = useState<Omit<CurrentMedication, 'id'>>({
    name: '',
    dosage: '',
    frequency: '',
    prescribedBy: '',
    startDate: '',
    endDate: '',
    notes: '',
    isActive: true
  });
  const { toast } = useToast();

  useEffect(() => {
    setFormData(data);
  }, [data, isEditing]);

  // Auto-calculate BMI when weight or height changes
  useEffect(() => {
    if (formData.weight > 0 && formData.height > 0) {
      const heightInMeters = formData.height / 100;
      const bmi = formData.weight / (heightInMeters * heightInMeters);
      setFormData(prev => ({ ...prev, bmi: Math.round(bmi * 10) / 10 }));
    }
  }, [formData.weight, formData.height]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleCancel = () => {
    setFormData(data);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      prescribedBy: '',
      startDate: '',
      endDate: '',
      notes: '',
      isActive: true
    });
    onCancel();
  };

  const addNewMedication = () => {
    if (!newMedication.name.trim() || !newMedication.dosage.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter medication name and dosage.",
        variant: "destructive",
      });
      return;
    }

    const medicationWithId: CurrentMedication = {
      ...newMedication,
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, medicationWithId]
    }));

    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      prescribedBy: '',
      startDate: '',
      endDate: '',
      notes: '',
      isActive: true
    });
  };

  const removeMedication = (id: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== id)
    }));
  };

  const updateMedication = (id: string, updates: Partial<CurrentMedication>) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map(med => 
        med.id === id ? { ...med, ...updates } : med
      )
    }));
  };

  const getBMICategory = (bmi?: number) => {
    if (!bmi) return { category: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    
    if (bmi < 18.5) return { category: 'Underweight', color: 'bg-blue-100 text-blue-800' };
    if (bmi < 25) return { category: 'Normal', color: 'bg-green-100 text-green-800' };
    if (bmi < 30) return { category: 'Overweight', color: 'bg-yellow-100 text-yellow-800' };
    return { category: 'Obese', color: 'bg-red-100 text-red-800' };
  };

  const getVitalStatus = (vital: string, value: number) => {
    // Simplified vital signs ranges
    const ranges: Record<string, { normal: [number, number], color: string }> = {
      bloodPressureSystolic: { normal: [90, 140], color: 'text-green-600' },
      bloodPressureDiastolic: { normal: [60, 90], color: 'text-green-600' },
      pulse: { normal: [60, 100], color: 'text-green-600' },
      temperature: { normal: [97, 100], color: 'text-green-600' },
      respiratoryRate: { normal: [12, 20], color: 'text-green-600' },
      oxygenSaturation: { normal: [95, 100], color: 'text-green-600' }
    };

    const range = ranges[vital];
    if (!range) return 'text-gray-600';

    const [min, max] = range.normal;
    return value >= min && value <= max ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-green/5 border-border/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <span>Current Health Data</span>
              <p className="text-sm font-normal text-muted-foreground">
                Physical measurements & vital signs
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
      <CardContent className="pt-0 space-y-6">
        {/* Physical Measurements */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Physical Measurements
          </h4>
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Weight</Label>
                <p className="mt-1 text-sm font-medium">{data.weight > 0 ? `${data.weight} kg` : 'Not recorded'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Height</Label>
                <p className="mt-1 text-sm font-medium">{data.height > 0 ? `${data.height} cm` : 'Not recorded'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">BMI</Label>
                <div className="mt-1 flex items-center space-x-2">
                  <p className="text-sm font-medium">{data.bmi || 'Not calculated'}</p>
                  {data.bmi && (
                    <Badge className={getBMICategory(data.bmi).color}>
                      {getBMICategory(data.bmi).category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    weight: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    height: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
              <div>
                <Label>BMI (Auto-calculated)</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm font-medium">{formData.bmi || 'Not calculated'}</span>
                  {formData.bmi && (
                    <Badge className={getBMICategory(formData.bmi).color}>
                      {getBMICategory(formData.bmi).category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vital Signs */}
        <div>
          <h4 className="font-semibold mb-4">Vital Signs</h4>
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Blood Pressure</Label>
                <p className={`mt-1 text-sm font-medium ${getVitalStatus('bloodPressureSystolic', data.vitals.bloodPressureSystolic)}`}>
                  {data.vitals.bloodPressureSystolic}/{data.vitals.bloodPressureDiastolic} mmHg
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pulse</Label>
                <p className={`mt-1 text-sm font-medium ${getVitalStatus('pulse', data.vitals.pulse)}`}>
                  {data.vitals.pulse} bpm
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Temperature</Label>
                <p className={`mt-1 text-sm font-medium ${getVitalStatus('temperature', data.vitals.temperature)}`}>
                  {data.vitals.temperature}°F
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Respiratory Rate</Label>
                <p className={`mt-1 text-sm font-medium ${getVitalStatus('respiratoryRate', data.vitals.respiratoryRate)}`}>
                  {data.vitals.respiratoryRate} /min
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Oxygen Saturation</Label>
                <p className={`mt-1 text-sm font-medium ${getVitalStatus('oxygenSaturation', data.vitals.oxygenSaturation)}`}>
                  {data.vitals.oxygenSaturation}%
                </p>
              </div>
              {data.vitals.recordedAt && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recorded At</Label>
                  <p className="mt-1 text-sm font-medium">
                    {new Date(data.vitals.recordedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Blood Pressure Systolic (mmHg)</Label>
                <Input
                  type="number"
                  value={formData.vitals.bloodPressureSystolic}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vitals: { 
                      ...prev.vitals, 
                      bloodPressureSystolic: parseInt(e.target.value) || 120 
                    }
                  }))}
                />
              </div>
              <div>
                <Label>Blood Pressure Diastolic (mmHg)</Label>
                <Input
                  type="number"
                  value={formData.vitals.bloodPressureDiastolic}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vitals: { 
                      ...prev.vitals, 
                      bloodPressureDiastolic: parseInt(e.target.value) || 80 
                    }
                  }))}
                />
              </div>
              <div>
                <Label>Pulse (bpm)</Label>
                <Input
                  type="number"
                  value={formData.vitals.pulse}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vitals: { 
                      ...prev.vitals, 
                      pulse: parseInt(e.target.value) || 72 
                    }
                  }))}
                />
              </div>
              <div>
                <Label>Temperature (°F)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.vitals.temperature}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vitals: { 
                      ...prev.vitals, 
                      temperature: parseFloat(e.target.value) || 98.6 
                    }
                  }))}
                />
              </div>
              <div>
                <Label>Respiratory Rate (/min)</Label>
                <Input
                  type="number"
                  value={formData.vitals.respiratoryRate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vitals: { 
                      ...prev.vitals, 
                      respiratoryRate: parseInt(e.target.value) || 16 
                    }
                  }))}
                />
              </div>
              <div>
                <Label>Oxygen Saturation (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.vitals.oxygenSaturation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vitals: { 
                      ...prev.vitals, 
                      oxygenSaturation: parseInt(e.target.value) || 98 
                    }
                  }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Current Medications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center">
              Current Medications ({data.medications.length})
            </h4>
          </div>
          
          {!isEditing ? (
            <div className="space-y-4">
              {data.medications.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <Activity className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">No current medications</p>
                </div>
              ) : (
                data.medications.map((medication) => (
                  <div key={medication.id} className="p-4 bg-muted/20 rounded-lg border border-muted-foreground/10">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-foreground">{medication.name}</h5>
                      <div className="flex items-center space-x-2">
                        <Badge className={medication.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {medication.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Dosage:</span> {medication.dosage}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span> {medication.frequency}
                      </div>
                      {medication.prescribedBy && (
                        <div>
                          <span className="font-medium">Prescribed by:</span> {medication.prescribedBy}
                        </div>
                      )}
                    </div>
                    {medication.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{medication.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add New Medication Form */}
              <div className="p-4 bg-accent/20 rounded-lg border-2 border-dashed border-accent/30">
                <h5 className="font-semibold mb-4 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Medication
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="newMedName">Medication Name *</Label>
                    <Input
                      id="newMedName"
                      value={newMedication.name}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Aspirin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newMedDosage">Dosage *</Label>
                    <Input
                      id="newMedDosage"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 100mg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newMedFrequency">Frequency</Label>
                    <Input
                      id="newMedFrequency"
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                      placeholder="e.g., Once daily"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="newMedPrescriber">Prescribed By</Label>
                    <Input
                      id="newMedPrescriber"
                      value={newMedication.prescribedBy}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, prescribedBy: e.target.value }))}
                      placeholder="Doctor's name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newMedStartDate">Start Date</Label>
                    <Input
                      id="newMedStartDate"
                      type="date"
                      value={newMedication.startDate}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="newMedNotes">Notes</Label>
                  <Textarea
                    id="newMedNotes"
                    value={newMedication.notes}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this medication..."
                    rows={2}
                  />
                </div>
                <Button onClick={addNewMedication} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </div>

              {/* Current Medications List */}
              <div className="space-y-4">
                <h5 className="font-semibold">Current Medications ({formData.medications.length})</h5>
                {formData.medications.map((medication, index) => (
                  <div key={medication.id} className="p-4 bg-muted/20 rounded-lg border border-muted-foreground/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeMedication(medication.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label>Medication Name</Label>
                        <Input
                          value={medication.name}
                          onChange={(e) => updateMedication(medication.id, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Dosage</Label>
                        <Input
                          value={medication.dosage}
                          onChange={(e) => updateMedication(medication.id, { dosage: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Frequency</Label>
                        <Input
                          value={medication.frequency}
                          onChange={(e) => updateMedication(medication.id, { frequency: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Prescribed By</Label>
                        <Input
                          value={medication.prescribedBy || ''}
                          onChange={(e) => updateMedication(medication.id, { prescribedBy: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={medication.startDate}
                          onChange={(e) => updateMedication(medication.id, { startDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label>Notes</Label>
                      <Textarea
                        value={medication.notes || ''}
                        onChange={(e) => updateMedication(medication.id, { notes: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`active-${medication.id}`}
                        checked={medication.isActive}
                        onChange={(e) => updateMedication(medication.id, { isActive: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor={`active-${medication.id}`} className="text-sm">
                        Currently active
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};