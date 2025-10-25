import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LifestyleInformation, SmokingHabit, AlcoholHabit, DietaryPreference, ActivityLevel } from '@/types/healthRecord';
import { Heart, Edit3, Save, X, Loader2 } from 'lucide-react';

interface LifestyleSectionProps {
  data: LifestyleInformation;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: LifestyleInformation) => void;
}

export const LifestyleSection: React.FC<LifestyleSectionProps> = ({
  data,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave
}) => {
  const [formData, setFormData] = useState<LifestyleInformation>(data);

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

  const smokingOptions: { value: SmokingHabit; label: string }[] = [
    { value: 'NEVER', label: 'Never' },
    { value: 'FORMER', label: 'Former smoker' },
    { value: 'OCCASIONAL', label: 'Occasional' },
    { value: 'REGULAR', label: 'Regular' }
  ];

  const alcoholOptions: { value: AlcoholHabit; label: string }[] = [
    { value: 'NEVER', label: 'Never' },
    { value: 'OCCASIONAL', label: 'Occasional' },
    { value: 'MODERATE', label: 'Moderate' },
    { value: 'REGULAR', label: 'Regular' }
  ];

  const dietOptions: { value: DietaryPreference; label: string }[] = [
    { value: 'VEGETARIAN', label: 'Vegetarian' },
    { value: 'NON_VEGETARIAN', label: 'Non-Vegetarian' },
    { value: 'VEGAN', label: 'Vegan' },
    { value: 'PESCATARIAN', label: 'Pescatarian' }
  ];

  const activityOptions: { value: ActivityLevel; label: string }[] = [
    { value: 'SEDENTARY', label: 'Sedentary' },
    { value: 'LIGHT', label: 'Light' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'VERY_ACTIVE', label: 'Very Active' }
  ];

  const stressOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MODERATE', label: 'Moderate' },
    { value: 'HIGH', label: 'High' }
  ];

  const sleepQualityOptions = [
    { value: 'POOR', label: 'Poor' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'GOOD', label: 'Good' },
    { value: 'EXCELLENT', label: 'Excellent' }
  ];

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-orange/5 border-border/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-orange-600" />
            </div>
            <span>Lifestyle Information</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Smoking Habit</Label>
              <p className="mt-1 text-sm font-medium">
                {smokingOptions.find(s => s.value === data.smokingHabit)?.label || 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alcohol Habit</Label>
              <p className="mt-1 text-sm font-medium">
                {alcoholOptions.find(a => a.value === data.alcoholHabit)?.label || 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dietary Preference</Label>
              <p className="mt-1 text-sm font-medium">
                {dietOptions.find(d => d.value === data.dietaryPreferences)?.label || 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Physical Activity</Label>
              <p className="mt-1 text-sm font-medium">
                {activityOptions.find(a => a.value === data.physicalActivityLevel)?.label || 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sleep Hours</Label>
              <p className="mt-1 text-sm font-medium">{data.sleepHours} hours per night</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stress Level</Label>
              <p className="mt-1 text-sm font-medium">
                {stressOptions.find(s => s.value === data.stressLevel)?.label || 'Not specified'}
              </p>
            </div>
            {data.exerciseFrequency && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exercise Frequency</Label>
                <p className="mt-1 text-sm font-medium">{data.exerciseFrequency}</p>
              </div>
            )}
            {data.sleepQuality && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sleep Quality</Label>
                <p className="mt-1 text-sm font-medium">
                  {sleepQualityOptions.find(q => q.value === data.sleepQuality)?.label}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="smokingHabit">Smoking Habit</Label>
                <Select
                  value={formData.smokingHabit}
                  onValueChange={(value: SmokingHabit) => 
                    setFormData(prev => ({ ...prev, smokingHabit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {smokingOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="alcoholHabit">Alcohol Habit</Label>
                <Select
                  value={formData.alcoholHabit}
                  onValueChange={(value: AlcoholHabit) => 
                    setFormData(prev => ({ ...prev, alcoholHabit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {alcoholOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dietaryPreferences">Dietary Preference</Label>
                <Select
                  value={formData.dietaryPreferences}
                  onValueChange={(value: DietaryPreference) => 
                    setFormData(prev => ({ ...prev, dietaryPreferences: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dietOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="physicalActivityLevel">Physical Activity Level</Label>
                <Select
                  value={formData.physicalActivityLevel}
                  onValueChange={(value: ActivityLevel) => 
                    setFormData(prev => ({ ...prev, physicalActivityLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sleepHours">Sleep Hours per Night</Label>
                <Input
                  id="sleepHours"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.sleepHours}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    sleepHours: parseInt(e.target.value) || 8 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="stressLevel">Stress Level</Label>
                <Select
                  value={formData.stressLevel}
                  onValueChange={(value: 'LOW' | 'MODERATE' | 'HIGH') => 
                    setFormData(prev => ({ ...prev, stressLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stressOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exerciseFrequency">Exercise Frequency (Optional)</Label>
                <Input
                  id="exerciseFrequency"
                  value={formData.exerciseFrequency || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    exerciseFrequency: e.target.value 
                  }))}
                  placeholder="e.g., 3 times per week, Daily morning walks"
                />
              </div>
              <div>
                <Label htmlFor="sleepQuality">Sleep Quality (Optional)</Label>
                <Select
                  value={formData.sleepQuality || ''}
                  onValueChange={(value: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT') => 
                    setFormData(prev => ({ ...prev, sleepQuality: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sleep quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {sleepQualityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};