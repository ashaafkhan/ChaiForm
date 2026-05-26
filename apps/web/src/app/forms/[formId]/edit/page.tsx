'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@chaiforms/ui/components/button';
import { Input } from '@chaiforms/ui/components/input';
import { Card } from '@chaiforms/ui/components/card';
import { FieldEditor } from '@/components/FieldEditor';
import { FieldConfigPanel } from '@/components/FieldConfigPanel';
import { FormPreview } from '@/components/FormPreview';
import { ChevronLeft, Save } from 'lucide-react';

interface Field {
  id: string;
  formId: string;
  fieldType: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
}

export default function FormEditorPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load form data on mount
  useEffect(() => {
    const loadForm = async () => {
      try {
        // TODO: Fetch form data from API using tRPC
        // const form = await trpc.forms.getById.query({ id: formId });
        // setFormTitle(form.title);
        // setFormDescription(form.description);
        // setFields(form.fields);
        // setIsPublished(form.status === 'published');
      } catch (error) {
        console.error('Failed to load form:', error);
      }
    };

    loadForm();
  }, [formId]);

  const handleAddField = (fieldType: string) => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      formId,
      fieldType: fieldType as Field['fieldType'],
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      placeholder: '',
      required: false,
      order: fields.length,
      options: ['text', 'textarea', 'email', 'number', 'date'].includes(fieldType)
        ? undefined
        : [],
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<Field>) => {
    setFields(
      fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
    );
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(undefined);
    }
  };

  const handleReorderFields = (reorderedFields: Field[]) => {
    setFields(reorderedFields);
  };

  const handleDuplicateField = async (fieldId: string) => {
    const fieldToDuplicate = fields.find((f) => f.id === fieldId);
    if (!fieldToDuplicate) return;

    const duplicatedField: Field = {
      ...fieldToDuplicate,
      id: `field-${Date.now()}`,
      label: `${fieldToDuplicate.label} (Copy)`,
      order: fields.length,
    };

    setFields([...fields, duplicatedField]);
    setSelectedFieldId(duplicatedField.id);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save form to API using tRPC
      // await trpc.forms.update.mutate({
      //   id: formId,
      //   title: formTitle,
      //   description: formDescription,
      // });
      // await trpc.fields.reorder.mutate({
      //   formId,
      //   fields: fields.map(f => ({ id: f.id, order: f.order }))
      // });
      console.log('Form saved successfully');
    } catch (error) {
      console.error('Failed to save form:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      if (isPublished) {
        // TODO: Unpublish form
        // await trpc.forms.unpublish.mutate({ id: formId });
      } else {
        // TODO: Publish form
        // await trpc.forms.publish.mutate({ id: formId, visibility: 'public' });
      }
      setIsPublished(!isPublished);
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>

              <div className="flex-1 min-w-0">
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Form title"
                  className="text-lg font-semibold border-0 bg-transparent focus:ring-0 px-0 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>

              <Button
                onClick={handlePublish}
                disabled={isSaving}
                size="sm"
                variant={isPublished ? 'destructive' : 'default'}
              >
                {isPublished ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Field Editor */}
          <div className="lg:col-span-1">
            <FieldEditor
              fields={fields}
              formId={formId}
              onFieldAdd={handleAddField}
              onFieldUpdate={handleUpdateField}
              onFieldDelete={handleDeleteField}
              onFieldReorder={handleReorderFields}
              onFieldDuplicate={handleDuplicateField}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
            />
          </div>

          {/* Middle Column: Field Config */}
          <div className="lg:col-span-1">
            <FieldConfigPanel
              field={selectedField || null}
              onUpdate={handleUpdateField}
              onClose={() => setSelectedFieldId(undefined)}
            />
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-1">
            <FormPreview
              formTitle={formTitle}
              formDescription={formDescription}
              fields={fields}
              isPublished={isPublished}
            />
          </div>
        </div>

        {/* Form Description */}
        <div className="mt-6">
          <Card className="p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Form Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Tell respondents what this form is about..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
