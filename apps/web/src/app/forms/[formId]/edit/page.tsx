'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { getStoredUser } from '@/lib/auth';
import { ThemeSelector } from '@/components/ThemeSelector';
import { ThemeCustomizer, type ThemeConfig } from '@/components/ThemeCustomizer';

const FIELD_TYPES = [
  { type: 'short_text', label: 'Short Text', icon: '✏️', group: 'Basic' },
  { type: 'long_text', label: 'Long Text', icon: '📝', group: 'Basic' },
  { type: 'email', label: 'Email', icon: '📧', group: 'Basic' },
  { type: 'phone', label: 'Phone', icon: '📱', group: 'Basic' },
  { type: 'url', label: 'URL', icon: '🔗', group: 'Basic' },
  { type: 'number', label: 'Number', icon: '🔢', group: 'Basic' },
  { type: 'rating', label: 'Star Rating', icon: '⭐', group: 'Choice' },
  { type: 'scale', label: 'Scale (1-10)', icon: '📏', group: 'Choice' },
  { type: 'single_select', label: 'Single Choice', icon: '⊙', group: 'Choice' },
  { type: 'multi_select', label: 'Multi Choice', icon: '☑', group: 'Choice' },
  { type: 'dropdown', label: 'Dropdown', icon: '▾', group: 'Choice' },
  { type: 'yes_no', label: 'Yes / No', icon: '🔀', group: 'Choice' },
  { type: 'checkbox', label: 'Checkbox', icon: '✅', group: 'Choice' },
  { type: 'date', label: 'Date', icon: '📅', group: 'Date & Time' },
  { type: 'time', label: 'Time', icon: '🕐', group: 'Date & Time' },
  { type: 'statement', label: 'Statement', icon: '💬', group: 'Layout' },
  { type: 'section_break', label: 'Section Break', icon: '—', group: 'Layout' },
] as const;

type FieldType =
  | 'short_text' | 'long_text' | 'email' | 'url' | 'phone'
  | 'number' | 'rating' | 'scale' | 'single_select' | 'multi_select'
  | 'dropdown' | 'checkbox' | 'yes_no' | 'date' | 'time'
  | 'date_range' | 'file_upload' | 'signature' | 'matrix' | 'ranking'
  | 'statement' | 'section_break';

interface FieldOption { id: string; label: string; value: string; }
interface Field {
  id: string;
  type: FieldType;
  label: string;
  description?: string | null;
  placeholder?: string | null;
  order: number;
  page: number;
  isRequired: boolean;
  validation?: Record<string, unknown>;
  options?: FieldOption[];
}

const CHOICE_TYPES = ['single_select', 'multi_select', 'dropdown'];
const GROUPS = ['Basic', 'Choice', 'Date & Time', 'Layout'];

function useDebounce<T>(value: T, delay: number): T {
  const [dv, setDv] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDv(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return dv;
}

const S = {
  base: 'var(--bg-base)', card: 'var(--bg-card)', elevated: 'var(--bg-elevated)',
  overlay: 'var(--bg-overlay)', text: 'var(--text-primary)', muted: 'var(--text-secondary)',
  hint: 'var(--text-muted)', accent: 'var(--chai-orange)', border: 'rgba(255,255,255,0.07)',
  accentBorder: 'rgba(249,115,22,0.4)',
};

export default function FormEditorPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [formSlug, setFormSlug] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [toast, setToast] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState('Basic');
  const mounted = useRef(false);

  const [activeTab, setActiveTab] = useState<'fields' | 'design'>('fields');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [localCustomTheme, setLocalCustomTheme] = useState<any>(null);
  const utils = trpc.useUtils();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // Auth guard
  useEffect(() => {
    const u = getStoredUser();
    if (!u) router.push('/login');
  }, [router]);

  const { data: queryData } = trpc.forms.getById.useQuery({ formId });
  const { data: themesData, isLoading: isThemesLoading } = trpc.themes.list.useQuery({});
  const { data: formThemeData, isLoading: isFormThemeLoading } = trpc.themes.getFormTheme.useQuery({ formId });

  // Sync custom theme from DB
  useEffect(() => {
    if (formThemeData) {
      setLocalCustomTheme(formThemeData.customTheme || {});
    }
  }, [formThemeData]);

  useEffect(() => {
    if (queryData && !mounted.current) {
      setFormTitle(queryData.title);
      setFormDesc(queryData.description || '');
      setFormSlug(queryData.slug);
      setFields([...((queryData.fields as any) || [])].sort((a: Field, b: Field) => a.order - b.order));
      setIsPublished(queryData.status === 'published');
      mounted.current = true;
    }
  }, [queryData]);

  const updateMutation = trpc.forms.update.useMutation({ onSuccess: () => setSaveStatus('saved') });

  const applyThemeMutation = trpc.themes.applyToForm.useMutation({
    onSuccess: () => {
      setSaveStatus('saved');
      utils.themes.getFormTheme.invalidate({ formId });
    },
  });

  const debouncedCustomTheme = useDebounce(localCustomTheme, 1000);

  useEffect(() => {
    if (!mounted.current || localCustomTheme === null || !formThemeData) return;
    const dbCustom = formThemeData.customTheme || {};
    if (JSON.stringify(debouncedCustomTheme) !== JSON.stringify(dbCustom)) {
      setSaveStatus('saving');
      applyThemeMutation.mutate({
        formId,
        themeId: formThemeData.themeId || null,
        customTheme: debouncedCustomTheme,
      });
    }
  }, [debouncedCustomTheme]);

  const mapDbThemeToUiTheme = (dbTheme: any) => {
    const config = dbTheme.config || {};
    const colors = config.colors || {};
    const typography = config.typography || {};
    return {
      ...dbTheme,
      config: {
        primaryColor: colors.primary || '#f97316',
        secondaryColor: colors.surface || '#16161f',
        accentColor: colors.accent || '#f59e0b',
        backgroundColor: colors.background || '#0a0a0f',
        textColor: colors.text || '#f0f0ff',
        borderColor: colors.border || 'rgba(255,255,255,0.12)',
        fontFamily: typography.fontFamily || 'sans',
        fontSize: typography.baseFontSize || 'base',
        borderRadius: config.borderRadius || 'md',
        spacing: config.spacing || 'normal',
        buttonStyle: config.buttonStyle || 'solid',
      }
    };
  };

  const mappedThemes = (themesData || []).map(mapDbThemeToUiTheme);

  const getActiveConfig = (): ThemeConfig => {
    const activeTheme = (themesData || []).find(t => t.id === formThemeData?.themeId);
    const baseConfig = activeTheme ? mapDbThemeToUiTheme(activeTheme).config : {
      primaryColor: '#f97316',
      secondaryColor: '#16161f',
      accentColor: '#f59e0b',
      backgroundColor: '#0a0a0f',
      textColor: '#f0f0ff',
      borderColor: 'rgba(255,255,255,0.12)',
      fontFamily: 'sans',
      fontSize: 'base',
      borderRadius: 'md',
      spacing: 'normal',
      buttonStyle: 'solid',
    };
    const custom = localCustomTheme || {};
    return {
      primaryColor: custom.primaryColor || baseConfig.primaryColor,
      secondaryColor: custom.secondaryColor || baseConfig.secondaryColor,
      accentColor: custom.accentColor || baseConfig.accentColor,
      backgroundColor: custom.backgroundColor || baseConfig.backgroundColor,
      textColor: custom.textColor || baseConfig.textColor,
      borderColor: custom.borderColor || baseConfig.borderColor,
      fontFamily: custom.fontFamily || baseConfig.fontFamily,
      fontSize: custom.fontSize || baseConfig.fontSize,
      borderRadius: custom.borderRadius || baseConfig.borderRadius,
      spacing: custom.spacing || baseConfig.spacing,
      buttonStyle: custom.buttonStyle || baseConfig.buttonStyle,
    };
  };

  const handleSelectTheme = (themeId: string) => {
    setSaveStatus('saving');
    setLocalCustomTheme({});
    applyThemeMutation.mutate({
      formId,
      themeId: themeId || null,
      customTheme: null,
    });
  };

  const handleUpdateCustomTheme = (updatedConfig: Partial<ThemeConfig>) => {
    setLocalCustomTheme((prev: any) => ({
      ...(prev || {}),
      ...updatedConfig,
    }));
  };
  const createFieldMutation = trpc.fields.create.useMutation({
    onSuccess: (data: any) => {
      setFields(prev => [...prev, data.field as Field].sort((a, b) => a.order - b.order));
      setSelectedId(data.field.id);
      setActiveTab('fields');
      showToast('Field added ✓');
    },
  });
  const updateFieldMutation = trpc.fields.update.useMutation();
  const deleteFieldMutation = trpc.fields.delete.useMutation({
    onSuccess: () => showToast('Field deleted'),
  });
  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: () => { setIsPublished(true); showToast('Form published! 🚀'); },
  });
  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => { setIsPublished(false); showToast('Form unpublished'); },
  });

  // Auto-save
  const dTitle = useDebounce(formTitle, 1500);
  const dDesc = useDebounce(formDesc, 1500);
  useEffect(() => {
    if (!mounted.current || !dTitle) return;
    setSaveStatus('saving');
    updateMutation.mutate({ formId, title: dTitle, description: dDesc || undefined });
  }, [dTitle, dDesc]);

  const handleAddField = (type: FieldType) => {
    const info = FIELD_TYPES.find(f => f.type === type)!;
    const defaultOptions: FieldOption[] = CHOICE_TYPES.includes(type)
      ? [{ id: '1', label: 'Option A', value: 'option-a' }, { id: '2', label: 'Option B', value: 'option-b' }]
      : [];
    createFieldMutation.mutate({
      formId, type: type as any,
      label: `${info.label} Question`,
      page: 1, isRequired: false,
      options: defaultOptions.length ? defaultOptions : undefined,
    });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<Field>) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, ...updates } : f));
    const updated = { ...fields.find(f => f.id === fieldId)!, ...updates };
    updateFieldMutation.mutate({
      fieldId,
      label: updated.label,
      description: updated.description || undefined,
      placeholder: updated.placeholder || undefined,
      isRequired: updated.isRequired,
      validation: updated.validation as any,
      options: updated.options as any,
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    if (selectedId === fieldId) setSelectedId(null);
    deleteFieldMutation.mutate({ fieldId });
  };

  const selectedField = fields.find(f => f.id === selectedId) || null;
  // groupedFields unused and removed

  return (
    <div style={{ minHeight: '100vh', background: S.base, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'rgba(13,13,20,0.97)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${S.border}`, height: '52px', display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0 1rem', flexShrink: 0, zIndex: 50 }}>
        <Link href="/dashboard" style={{ color: S.muted, textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
          ← Dashboard
        </Link>
        <div style={{ width: '1px', height: '18px', background: S.border }} />
        <input
          value={formTitle}
          onChange={e => { setFormTitle(e.target.value); setSaveStatus('unsaved'); }}
          placeholder="Untitled Form"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: S.text, fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'Poppins, sans-serif', minWidth: 0 }}
        />
        <span style={{ fontSize: '0.75rem', color: saveStatus === 'unsaved' ? '#f59e0b' : S.hint, whiteSpace: 'nowrap' }}>
          {saveStatus === 'saving' ? '⏳ Saving...' : saveStatus === 'unsaved' ? '● Unsaved' : '✓ Saved'}
        </span>
        <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          onClick={() => { setSaveStatus('saving'); updateMutation.mutate({ formId, title: formTitle, description: formDesc || undefined }); }}>
          Save
        </button>
        {isPublished ? (
          <button className="btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => unpublishMutation.mutate({ formId })}>
            Unpublish
          </button>
        ) : (
          <button className="btn-primary" style={{ padding: '0.35rem 0.875rem', fontSize: '0.8rem' }}
            onClick={() => publishMutation.mutate({ formId, visibility: 'public' })}>
            Publish 🚀
          </button>
        )}
        {isPublished && formSlug && (
          <Link href={`/f/${formSlug}`} target="_blank">
            <button className="btn-ghost" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>🔗 View</button>
          </Link>
        )}
        <Link href={`/forms/${formId}/share`}>
          <button className="btn-ghost" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Share</button>
        </Link>
      </header>

      {/* 3-Panel */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '210px 1fr 290px', minHeight: 0, overflow: 'hidden' }}>
        {/* LEFT: Field Palette */}
        <div style={{ borderRight: `1px solid ${S.border}`, overflowY: 'auto', padding: '0.875rem 0.75rem', background: 'rgba(10,10,18,0.5)' }}>
          {/* Group tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
            {GROUPS.map(g => (
              <button key={g} onClick={() => setActiveGroup(g)} style={{ padding: '0.2rem 0.5rem', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, background: activeGroup === g ? 'rgba(249,115,22,0.2)' : 'transparent', color: activeGroup === g ? S.accent : S.hint }}>
                {g}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {FIELD_TYPES.filter(f => f.group === activeGroup).map(ft => (
              <button key={ft.type} onClick={() => handleAddField(ft.type)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.625rem', background: 'transparent', border: 'none', borderRadius: '7px', cursor: 'pointer', color: S.muted, fontSize: '0.8125rem', fontWeight: 500, textAlign: 'left', transition: 'all 0.12s', width: '100%' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = S.elevated; (e.currentTarget as HTMLElement).style.color = S.text; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = S.muted; }}>
                <span style={{ width: '18px', textAlign: 'center', fontSize: '0.875rem' }}>{ft.icon}</span>
                <span>{ft.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Canvas */}
        <div style={{ overflowY: 'auto', padding: '1.5rem' }}>
          <textarea value={formDesc} onChange={e => { setFormDesc(e.target.value); setSaveStatus('unsaved'); }}
            placeholder="Add a form description (optional)..."
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: S.muted, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', resize: 'none', lineHeight: 1.6, marginBottom: '1rem' }}
            rows={2} />
          <div style={{ height: '1px', background: S.border, marginBottom: '1.25rem' }} />

          {fields.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', border: `2px dashed ${S.border}`, borderRadius: '14px', color: S.muted, animation: 'fadeIn 0.4s ease' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>➕</div>
              <p style={{ fontWeight: 600, color: S.muted }}>Click any field type on the left to add it</p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.375rem', color: S.hint }}>Your form will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {fields.map((field, index) => (
                <div key={field.id} onClick={() => { setSelectedId(field.id); setActiveTab('fields'); }}
                  style={{
                    padding: '0.875rem 1.125rem',
                    background: selectedId === field.id ? 'rgba(249,115,22,0.07)' : S.card,
                    border: `1px solid ${selectedId === field.id ? S.accentBorder : S.border}`,
                    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    animation: 'fadeInUp 0.3s ease forwards',
                  }}
                  onMouseEnter={e => { if (selectedId !== field.id) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; }}
                  onMouseLeave={e => { if (selectedId !== field.id) (e.currentTarget as HTMLElement).style.borderColor = S.border; }}>
                  <span style={{ color: S.hint, fontSize: '0.75rem', fontWeight: 700, minWidth: '18px', paddingTop: '2px', fontFamily: 'monospace' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem' }}>{FIELD_TYPES.find(f => f.type === field.type)?.icon}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: S.text }}>{field.label}</span>
                      {field.isRequired && <span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 600 }}>REQUIRED</span>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: S.hint, marginTop: '0.15rem', display: 'block' }}>
                      {FIELD_TYPES.find(f => f.type === field.type)?.label}
                    </span>
                    {field.options && field.options.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {field.options.slice(0, 5).map(o => (
                          <span key={o.id} style={{ padding: '0.1rem 0.45rem', background: S.elevated, borderRadius: '4px', fontSize: '0.7rem', color: S.muted }}>{o.label}</span>
                        ))}
                        {field.options.length > 5 && <span style={{ fontSize: '0.7rem', color: S.hint }}>+{field.options.length - 5}</span>}
                      </div>
                    )}
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDeleteField(field.id); }}
                    style={{ background: 'transparent', border: 'none', color: S.hint, cursor: 'pointer', padding: '0.25rem', borderRadius: '4px', flexShrink: 0, fontSize: '0.875rem', lineHeight: 1 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = S.hint}>
                    ✕
                  </button>
                </div>
              ))}
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: S.hint }}>{fields.length} field{fields.length !== 1 ? 's' : ''} · Click a field to configure →</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Config Panel */}
        <div style={{ borderLeft: `1px solid ${S.border}`, display: 'flex', flexDirection: 'column', background: 'rgba(10,10,18,0.3)', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${S.border}`, background: 'rgba(13,13,20,0.5)', flexShrink: 0 }}>
            <button
              onClick={() => setActiveTab('fields')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: activeTab === 'fields' ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'fields' ? `2px solid ${S.accent}` : 'none',
                color: activeTab === 'fields' ? S.text : S.muted,
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Fields
            </button>
            <button
              onClick={() => setActiveTab('design')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: activeTab === 'design' ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'design' ? `2px solid ${S.accent}` : 'none',
                color: activeTab === 'design' ? S.text : S.muted,
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Design
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {activeTab === 'fields' ? (
              selectedField ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'slideInRight 0.25s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${S.border}` }}>
                    <span style={{ fontSize: '1.125rem' }}>{FIELD_TYPES.find(f => f.type === selectedField.type)?.icon}</span>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: S.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {FIELD_TYPES.find(f => f.type === selectedField.type)?.label}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: S.hint }}>Field Settings</p>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: S.muted, marginBottom: '0.35rem' }}>Label *</label>
                    <input className="input-field" style={{ fontSize: '0.875rem' }}
                      value={selectedField.label}
                      onChange={e => handleUpdateField(selectedField.id, { label: e.target.value })}
                      placeholder="Question label" />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: S.muted, marginBottom: '0.35rem' }}>Helper Text</label>
                    <input className="input-field" style={{ fontSize: '0.875rem' }}
                      value={selectedField.description || ''}
                      onChange={e => handleUpdateField(selectedField.id, { description: e.target.value })}
                      placeholder="Shown below the label" />
                  </div>

                  {!['statement', 'section_break', 'yes_no', 'checkbox', 'rating', 'scale'].includes(selectedField.type) && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: S.muted, marginBottom: '0.35rem' }}>Placeholder</label>
                      <input className="input-field" style={{ fontSize: '0.875rem' }}
                        value={selectedField.placeholder || ''}
                        onChange={e => handleUpdateField(selectedField.id, { placeholder: e.target.value })}
                        placeholder="Input hint text" />
                    </div>
                  )}

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', background: S.elevated, borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selectedField.isRequired}
                      onChange={e => handleUpdateField(selectedField.id, { isRequired: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: S.accent }} />
                    <span style={{ fontSize: '0.875rem', color: S.text }}>Required field</span>
                  </label>

                  {/* Options Editor */}
                  {CHOICE_TYPES.includes(selectedField.type) && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 500, color: S.muted }}>Options ({selectedField.options?.length || 0})</label>
                        <button onClick={() => {
                          const o: FieldOption = { id: Date.now().toString(), label: `Option ${(selectedField.options?.length || 0) + 1}`, value: `opt-${Date.now()}` };
                          handleUpdateField(selectedField.id, { options: [...(selectedField.options || []), o] });
                        }} style={{ background: 'transparent', border: 'none', color: S.accent, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700 }}>+ Add</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {(selectedField.options || []).map((opt, i) => (
                          <div key={opt.id} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <span style={{ color: S.hint, fontSize: '0.75rem', fontFamily: 'monospace', width: '16px' }}>{i + 1}.</span>
                            <input className="input-field" style={{ fontSize: '0.8125rem', flex: 1 }}
                              value={opt.label}
                              onChange={e => {
                                const newOpts = selectedField.options!.map((o, idx) =>
                                  idx === i ? { ...o, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '-') } : o
                                );
                                handleUpdateField(selectedField.id, { options: newOpts });
                              }}
                              placeholder={`Option ${i + 1}`} />
                            <button onClick={() => handleUpdateField(selectedField.id, { options: selectedField.options!.filter((_, idx) => idx !== i) })}
                              style={{ background: 'transparent', border: 'none', color: S.hint, cursor: 'pointer', flexShrink: 0, padding: '0.25rem' }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = S.hint}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedField.type === 'rating' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: S.muted, marginBottom: '0.35rem' }}>Max Stars</label>
                      <select className="input-field" style={{ fontSize: '0.875rem' }}
                        value={(selectedField.validation as any)?.maxRating || 5}
                        onChange={e => handleUpdateField(selectedField.id, { validation: { maxRating: parseInt(e.target.value) } })}>
                        {[3, 4, 5, 7, 10].map(n => <option key={n} value={n}>{n} stars</option>)}
                      </select>
                    </div>
                  )}

                  {selectedField.type === 'scale' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: S.muted, marginBottom: '0.35rem' }}>Min</label>
                        <input type="number" className="input-field" style={{ fontSize: '0.875rem' }}
                          value={(selectedField.validation as any)?.min ?? 1}
                          onChange={e => handleUpdateField(selectedField.id, { validation: { ...(selectedField.validation || {}), min: parseInt(e.target.value) } })} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: S.muted, marginBottom: '0.35rem' }}>Max</label>
                        <input type="number" className="input-field" style={{ fontSize: '0.875rem' }}
                          value={(selectedField.validation as any)?.max ?? 10}
                          onChange={e => handleUpdateField(selectedField.id, { validation: { ...(selectedField.validation || {}), max: parseInt(e.target.value) } })} />
                      </div>
                    </div>
                  )}

                  <button className="btn-danger" style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}
                    onClick={() => handleDeleteField(selectedField.id)}>
                    🗑️ Delete Field
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: S.hint, animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.875rem' }}>👈</div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: S.muted }}>Select a field to configure</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.375rem' }}>Click any field in the canvas</p>
                </div>
              )
            ) : (
              isCustomizing ? (
                <ThemeCustomizer
                  config={getActiveConfig()}
                  onUpdate={handleUpdateCustomTheme}
                  onClose={() => setIsCustomizing(false)}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    onClick={() => setIsCustomizing(true)}
                    style={{
                      width: '100%',
                      fontSize: '0.8rem',
                      padding: '0.5rem',
                      background: S.accent,
                      border: 'none',
                      color: '#fff',
                      fontWeight: 600,
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    🎨 Customize Theme Colors
                  </button>
                  <ThemeSelector
                    themes={mappedThemes}
                    selectedThemeId={formThemeData?.themeId || undefined}
                    onSelectTheme={handleSelectTheme}
                    isLoading={isThemesLoading || isFormThemeLoading}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast toast-info" style={{ animation: 'slideInRight 0.3s ease' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
