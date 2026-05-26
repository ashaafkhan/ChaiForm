'use client';

import React from 'react';
import { Card } from '@chaiforms/ui/components/card';
import { Button } from '@chaiforms/ui/components/button';
import { Input } from '@chaiforms/ui/components/input';
import { Label } from '@chaiforms/ui/components/label';
import { Switch } from '@chaiforms/ui/components/switch';
import { X } from 'lucide-react';

export interface Field {
  id: string;
  formId: string;
  fieldType: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
}

interface FieldConfigPanelProps {
  field: Field | null;
  onUpdate: (fieldId: string, updates: Partial<Field>) => void;
  onClose: () => void;
}

const FIELD_TYPE_DESCRIPTIONS: Record<string, string> = {
  text: 'Single line text input',
  email: 'Email address input with validation',
  textarea: 'Multi-line text input',
  number: 'Numeric input only',
  date: 'Date picker',
  select: 'Dropdown list selection',
  checkbox: 'Multiple choice (select multiple)',
  radio: 'Single choice (select one)',
};

export const FieldConfigPanel: React.FC<FieldConfigPanelProps> = ({
  field,
  onUpdate,
  onClose,
}) => {
  if (!field) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-500">Select a field to configure</p>
      </div>
    );
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(field.id, { label: e.target.value });
  };

  const handlePlaceholderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(field.id, { placeholder: e.target.value });
  };

  const handleRequiredChange = (checked: boolean) => {
    onUpdate(field.id, { required: checked });
  };

  const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const options = e.target.value.split('\n').filter((opt) => opt.trim());
    onUpdate(field.id, { options });
  };

  const needsOptions = ['select', 'checkbox', 'radio'].includes(field.fieldType);

  return (
    <div className="h-full overflow-y-auto">
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Field Settings</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Field Type Display */}
        <div>
          <Label className="text-slate-600 text-xs uppercase tracking-wide">Field Type</Label>
          <div className="mt-2 p-3 bg-slate-100 rounded-lg border border-slate-200">
            <p className="font-mono text-sm font-medium text-slate-900">{field.fieldType}</p>
            <p className="text-xs text-slate-600 mt-1">
              {FIELD_TYPE_DESCRIPTIONS[field.fieldType] || 'Custom field type'}
            </p>
          </div>
        </div>

        {/* Label Input */}
        <div>
          <Label htmlFor="label" className="text-slate-700 font-medium">
            Field Label
          </Label>
          <Input
            id="label"
            value={field.label}
            onChange={handleLabelChange}
            placeholder="Enter field label"
            className="mt-1.5"
          />
        </div>

        {/* Placeholder Input (if applicable) */}
        {!['checkbox', 'radio', 'date'].includes(field.fieldType) && (
          <div>
            <Label htmlFor="placeholder" className="text-slate-700 font-medium">
              Placeholder Text
            </Label>
            <Input
              id="placeholder"
              value={field.placeholder || ''}
              onChange={handlePlaceholderChange}
              placeholder="Optional placeholder text"
              className="mt-1.5"
            />
          </div>
        )}

        {/* Required Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
          <Label htmlFor="required" className="text-slate-700 font-medium cursor-pointer">
            Required Field
          </Label>
          <Switch
            id="required"
            checked={field.required}
            onCheckedChange={handleRequiredChange}
          />
        </div>

        {/* Options Input (for select, checkbox, radio) */}
        {needsOptions && (
          <div>
            <Label htmlFor="options" className="text-slate-700 font-medium">
              Options
            </Label>
            <p className="text-xs text-slate-600 mt-0.5">Enter one option per line</p>
            <textarea
              id="options"
              value={field.options?.join('\n') || ''}
              onChange={handleOptionsChange}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              className="mt-2 w-full h-32 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Info Section */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            💡 <strong>Tip:</strong> Configure field properties here. Changes are saved automatically
            to the database when you click outside the panel.
          </p>
        </div>
      </Card>
    </div>
  );
};
