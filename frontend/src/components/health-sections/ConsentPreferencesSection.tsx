import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConsentPreferences } from '@/types/healthRecord';
import { Shield, Edit3, Save, X, Loader2 } from 'lucide-react';

interface ConsentPreferencesSectionProps {
  data: ConsentPreferences;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: ConsentPreferences) => void;
}

export const ConsentPreferencesSection: React.FC<ConsentPreferencesSectionProps> = ({
  data,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave
}) => {
  const [formData, setFormData] = useState<ConsentPreferences>(data);

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

  const languages = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam'
  ];

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-cyan/5 border-border/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-600" />
            </div>
            <span>Consent & Preferences</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-6">
          {!isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <Label className="font-medium">Data Sharing Consent</Label>
                  <span className={`px-2 py-1 rounded text-sm ${data.dataSharingConsent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {data.dataSharingConsent ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <Label className="font-medium">SMS Notifications</Label>
                  <span className={`px-2 py-1 rounded text-sm ${data.smsNotifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {data.smsNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <Label className="font-medium">Email Notifications</Label>
                  <span className={`px-2 py-1 rounded text-sm ${data.emailNotifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {data.emailNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <Label className="font-medium">Preferred Language</Label>
                  <span className="font-medium">{data.preferredLanguage}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Data Sharing Consent</Label>
                    <p className="text-sm text-muted-foreground">Allow sharing health data with healthcare providers</p>
                  </div>
                  <Switch
                    checked={formData.dataSharingConsent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dataSharingConsent: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive appointment reminders via SMS</p>
                  </div>
                  <Switch
                    checked={formData.smsNotifications}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates and reminders via email</p>
                  </div>
                  <Switch
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                <div>
                  <Label className="font-medium">Preferred Language</Label>
                  <Select
                    value={formData.preferredLanguage}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLanguage: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};