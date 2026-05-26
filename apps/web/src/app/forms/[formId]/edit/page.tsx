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
import { ThemeSelector } from '@/components/ThemeSelector';
import { ThemeCustomizer, ThemeConfig } from '@/components/ThemeCustomizer';
import { ChevronLeft, Save, Palette } from 'lucide-react';

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

interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  config: ThemeConfig;
}

type EditorTab = 'fields' | 'styling';

export default function FormEditorPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('fields');
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string>();
  const [customTheme, setCustomTheme] = useState<ThemeConfig | undefined>();
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);

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
        // setSelectedThemeId(form.themeId);
        // setCustomTheme(form.customTheme);
      } catch (error) {
        console.error('Failed to load form:', error);
      }
    };

    loadForm();
  }, [formId]);

  // Load available themes
  useEffect(() => {
    const loadThemes = async () => {
      try {
        // TODO: Load themes from tRPC
        // const themes = await trpc.themes.list.query({});
        // setAvailableThemes(themes);
      } catch (error) {
        console.error('Failed to load themes:', error);
      }
    };

    loadThemes();
  }, []);

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
      // if (selectedThemeId || customTheme) {
      //   await trpc.themes.applyToForm.mutate({
      //     formId,
      //     themeId: selectedThemeId,
      //     customTheme: customTheme,
      //   });
      // }
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

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId || undefined);
    setCustomTheme(undefined);
    setShowThemeCustomizer(false);
  };

  const handleUpdateCustomTheme = (updates: Partial<ThemeConfig>) => {
    setCustomTheme((prev) => ({ ...prev, ...updates } as ThemeConfig));
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

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('fields')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'fields'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Fields
            </button>
            <button
              onClick={() => setActiveTab('styling')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                activeTab === 'styling'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              Styling
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'fields' ? (
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Theme Selector */}
            <div className="lg:col-span-1">
              <Card className="p-4 space-y-4">
                <h3 className="font-semibold text-slate-900">Select Theme</h3>
                <ThemeSelector
                  themes={availableThemes}
                  selectedThemeId={selectedThemeId}
                  onSelectTheme={handleSelectTheme}
                  isLoading={false}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowThemeCustomizer(!showThemeCustomizer)}
                >
                  {showThemeCustomizer ? 'Hide' : 'Show'} Customizer
                </Button>
              </Card>
            </div>

            {/* Middle Column: Theme Customizer */}
            <div className="lg:col-span-1">
              {showThemeCustomizer && customTheme ? (
                <ThemeCustomizer
                  config={customTheme}
                  onUpdate={handleUpdateCustomTheme}
                  onClose={() => setShowThemeCustomizer(false)}
                />
              ) : (
                <Card className="p-6 flex items-center justify-center h-full bg-slate-50">
                  <p className="text-slate-500 text-center">
                    Select a theme or click "Show Customizer" to create a custom theme
                  </p>
                </Card>
              )}
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
        )}

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
