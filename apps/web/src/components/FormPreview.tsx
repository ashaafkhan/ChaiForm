'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Label } from '@chaiforms/ui';
import { Eye, EyeOff } from 'lucide-react';

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

interface FormPreviewProps {
  formTitle: string;
  formDescription?: string;
  fields: Field[];
  isPublished?: boolean;
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  formTitle,
  formDescription,
  fields,
  isPublished = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});

  if (!isVisible) {
    return (
      <Card className="p-4 flex items-center justify-center h-full bg-slate-50 border-2 border-dashed border-slate-300">
        <Button
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          Show Preview
        </Button>
      </Card>
    );
  }

  const handleInputChange = (
    fieldId: string,
    value: string | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const renderFieldInput = (field: Field) => {
    const baseProps = {
      className:
        'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
      value: formData[field.id] || '',
      onChange: (e: React.ChangeEvent<any>) =>
        handleInputChange(field.id, e.target.value),
    };

    switch (field.fieldType) {
      case 'text':
        return (
          <Input
            {...baseProps}
            type="text"
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case 'email':
        return (
          <Input
            {...baseProps}
            type="email"
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case 'number':
        return (
          <Input
            {...baseProps}
            type="number"
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case 'date':
        return (
          <Input
            {...baseProps}
            type="date"
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            placeholder={field.placeholder}
            rows={4}
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            {...baseProps}
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${field.id}-${option}`}
                  value={option}
                  onChange={(e) => {
                    const current = (Array.isArray(formData[field.id])
                      ? formData[field.id]
                      : []) as string[];
                    if (e.target.checked) {
                      handleInputChange(field.id, [...current, option]);
                    } else {
                      handleInputChange(
                        field.id,
                        current.filter((v) => v !== option),
                      );
                    }
                  }}
                  className="rounded border-slate-300"
                />
                <Label
                  htmlFor={`${field.id}-${option}`}
                  className="ml-2 cursor-pointer text-slate-700"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}-${option}`}
                  name={field.id}
                  value={option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  checked={formData[field.id] === option}
                  className="rounded-full border-slate-300"
                  required={field.required}
                />
                <Label
                  htmlFor={`${field.id}-${option}`}
                  className="ml-2 cursor-pointer text-slate-700"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      default:
        return <Input {...baseProps} />;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <Card className="p-6 space-y-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Live Preview
            </h3>
            {isPublished && (
              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                📢 Published
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="gap-1"
          >
            <EyeOff className="w-4 h-4" />
            Hide
          </Button>
        </div>

        {/* Form Title & Description */}
        <div className="pb-4 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">{formTitle || 'Untitled Form'}</h2>
          {formDescription && (
            <p className="text-slate-600 text-sm mt-2">{formDescription}</p>
          )}
        </div>

        {/* Fields Preview */}
        {fields.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No fields added yet. Add fields to see preview here.</p>
          </div>
        ) : (
          <form className="space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                <Label className="text-slate-900 font-medium">
                  {field.label || 'Untitled'}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <div className="mt-2">
                  {renderFieldInput(field)}
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <Button className="w-full mt-6" disabled={fields.length === 0}>
              Submit
            </Button>
          </form>
        )}

        {/* Footer Info */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
          💡 This is a preview of how your form will appear to respondents. Changes are applied
          instantly.
        </div>
      </Card>
    </div>
  );
};
