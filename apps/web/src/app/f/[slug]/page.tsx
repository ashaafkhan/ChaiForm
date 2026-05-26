'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

type FieldType = string;

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string | null;
  placeholder?: string | null;
  isRequired: boolean;
  options?: Array<{ id: string; label: string; value: string }>;
  validation?: Record<string, unknown>;
  page: number;
  order: number;
}

interface FormSettings {
  submitButtonText?: string;
  successMessage?: string;
  showProgressBar?: boolean;
  notifyRespondent?: boolean;
  collectEmailOfRespondent?: boolean;
}

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [password, setPassword] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const sessionId = useRef(Math.random().toString(36).slice(2));
  const tracked = useRef(false);
  const started = useRef(false);

  const {
    data: form,
    error,
    isLoading,
  } = trpc.forms.getPublicBySlug.useQuery(
    { slug, password: password || undefined },
    { retry: false, enabled: true }
  );

  const trackMutation = trpc.analytics.trackEvent.useMutation();
  const submitMutation = trpc.responses.submit.useMutation({
    onSuccess: () => {
      router.push(`/f/${slug}/success`);
    },
    onError: (err) => {
      setIsSubmitting(false);
      alert(err.message);
    },
  });

  useEffect(() => {
    if (form && !tracked.current) {
      tracked.current = true;
      trackMutation.mutate({
        formId: form.id,
        eventType: 'form_view',
        sessionId: sessionId.current,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;
    setPassword(passwordInput);
  };

  const updateAnswer = (fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[fieldId];
        return n;
      });
    }
    if (!started.current && form) {
      started.current = true;
      trackMutation.mutate({
        formId: form.id,
        eventType: 'form_start',
        sessionId: sessionId.current,
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fieldList = (form?.fields || []) as FormField[];
    for (const field of fieldList) {
      if (field.isRequired) {
        const val = answers[field.id];
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[field.id] = 'This field is required';
        }
      }
      if (field.type === 'email' && answers[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(answers[field.id]))) {
          newErrors[field.id] = 'Please enter a valid email address';
        }
      }
      if (field.type === 'url' && answers[field.id]) {
        try {
          new URL(String(answers[field.id]));
        } catch {
          newErrors[field.id] = 'Please enter a valid URL';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErrorId = Object.keys(errors)[0];
      if (firstErrorId) {
        document.getElementById(`field-${firstErrorId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setIsSubmitting(true);
    const completionTime = Math.round((Date.now() - startTime) / 1000);
    submitMutation.mutate({
      formId: form!.id,
      answers: answers as any,
      completionTimeSeconds: completionTime,
      metadata: { sessionId: sessionId.current },
    });
  };

  // Theme and custom override resolving
  const theme = (form?.theme as any) || {};
  const themeSlug = theme.slug || '';
  const themeConfig = theme.config || {};
  const themeColors = themeConfig.colors || {};
  const themeTypography = themeConfig.typography || {};
  const custom = (form?.customTheme as any) || {};

  const bg = custom.backgroundColor || themeColors.background || '#0a0a0f';
  const surface = custom.surfaceColor || custom.secondaryColor || themeColors.surface || '#16161f';
  const text = custom.textColor || themeColors.text || '#f0f0ff';
  const textMuted = custom.textMutedColor || themeColors.textMuted || '#9090b0';
  const primary = custom.primaryColor || themeColors.primary || '#f97316';
  const accent = custom.accentColor || themeColors.accent || '#f59e0b';
  const borderColor = custom.borderColor || themeColors.border || 'rgba(255,255,255,0.12)';
  const fontFamily = custom.fontFamily || themeTypography.fontFamily || 'Inter, sans-serif';
  const radiusMap: Record<string, string> = { none: '0px', sm: '4px', md: '8px', lg: '12px' };
  const customRadius = custom.borderRadius ? (radiusMap[custom.borderRadius] || custom.borderRadius) : undefined;
  const radius = customRadius || themeConfig.borderRadius || '10px';

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily,
        }}
      >
        <div style={{ textAlign: 'center', color: textMuted }}>
          <div
            style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              display: 'inline-block',
              animation: 'spin 1s linear infinite',
            }}
          >
            ☕
          </div>
          <p style={{ fontSize: '1rem' }}>Loading form…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Error states ─────────────────────────────────────────────────────────────
  if (error) {
    const msg = error.message.toLowerCase();

    if (msg.includes('password') || msg.includes('invalid password')) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily,
          }}
        >
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem' }}>🔒</div>
              <h1
                style={{
                  color: text,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginTop: '1rem',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Password Protected
              </h1>
              <p style={{ color: textMuted, marginTop: '0.5rem' }}>
                Enter the password to access this form
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="password"
                placeholder="Enter form password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                style={{
                  padding: '0.875rem 1rem',
                  background: surface,
                  border: `2px solid ${borderColor}`,
                  borderRadius: radius,
                  color: text,
                  fontSize: '1rem',
                  fontFamily,
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.875rem',
                  background: `linear-gradient(135deg, ${primary}, #f59e0b)`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: radius,
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontFamily,
                }}
              >
                Unlock Form →
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (msg.includes('expired') || msg.includes('closed')) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily,
          }}
        >
          <div style={{ textAlign: 'center', color: text }}>
            <div style={{ fontSize: '3.5rem' }}>⌛</div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: '1rem 0 0.5rem',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Form Expired
            </h1>
            <p style={{ color: textMuted }}>This form is no longer accepting responses.</p>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily,
        }}
      >
        <div style={{ textAlign: 'center', color: text }}>
          <div style={{ fontSize: '3.5rem' }}>🚫</div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '1rem 0 0.5rem',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Form Not Found
          </h1>
          <p style={{ color: textMuted }}>This form doesn&apos;t exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  const settings = (form.settings as FormSettings) || {};
  const formFields = (form.fields as FormField[])
    .slice()
    .sort((a, b) => a.order - b.order);

  const answerableFields = formFields.filter(
    (f) => f.type !== 'statement' && f.type !== 'section_break'
  );
  const filledCount = answerableFields.filter(
    (f) => answers[f.id] !== undefined && answers[f.id] !== ''
  ).length;
  const progress =
    answerableFields.length > 0 ? Math.round((filledCount / answerableFields.length) * 100) : 0;

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: `${surface}99`,
    border: `2px solid ${borderColor}`,
    borderRadius: radius,
    color: text,
    fontSize: '1rem',
    fontFamily,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.id];
    const fieldInputBase = {
      ...inputBase,
      border: `2px solid ${hasError ? '#ef4444' : borderColor}`,
    };

    const onFocusTrack = () => {
      trackMutation.mutate({
        formId: form.id,
        eventType: 'field_focus',
        fieldId: field.id,
        sessionId: sessionId.current,
      });
    };

    switch (field.type) {
      case 'short_text':
      case 'email':
      case 'url':
      case 'phone':
        return (
          <input
            type={
              field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'
            }
            style={fieldInputBase}
            placeholder={field.placeholder || ''}
            value={String(answers[field.id] || '')}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            onFocus={onFocusTrack}
          />
        );

      case 'long_text':
        return (
          <textarea
            style={{ ...fieldInputBase, minHeight: '120px', resize: 'vertical' }}
            placeholder={field.placeholder || ''}
            value={String(answers[field.id] || '')}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            onFocus={onFocusTrack}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            style={fieldInputBase}
            placeholder={field.placeholder || ''}
            value={String(answers[field.id] ?? '')}
            onChange={(e) => updateAnswer(field.id, e.target.value ? parseFloat(e.target.value) : '')}
            onFocus={onFocusTrack}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            style={fieldInputBase}
            value={String(answers[field.id] || '')}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            onFocus={onFocusTrack}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            style={fieldInputBase}
            value={String(answers[field.id] || '')}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            onFocus={onFocusTrack}
          />
        );

      case 'single_select':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {field.options?.map((opt) => {
              const isSelected = answers[field.id] === opt.value;
              return (
                <label
                  key={opt.id}
                  className={`option-label ${isSelected ? 'option-label-selected' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: isSelected ? `${primary}1A` : `${surface}88`,
                    border: `2px solid ${isSelected ? primary : borderColor}`,
                    borderRadius: radius,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => updateAnswer(field.id, opt.value)}
                    style={{ accentColor: primary, width: '18px', height: '18px' }}
                  />
                  <span style={{ color: text, fontSize: '0.9375rem' }}>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );

      case 'multi_select':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {field.options?.map((opt) => {
              const selected =
                Array.isArray(answers[field.id]) &&
                (answers[field.id] as string[]).includes(opt.value);
              return (
                <label
                  key={opt.id}
                  className={`option-label ${selected ? 'option-label-selected' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: selected ? `${primary}1A` : `${surface}88`,
                    border: `2px solid ${selected ? primary : borderColor}`,
                    borderRadius: radius,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={selected}
                    onChange={(e) => {
                      const cur = (answers[field.id] as string[]) || [];
                      updateAnswer(
                        field.id,
                        e.target.checked
                          ? [...cur, opt.value]
                          : cur.filter((v) => v !== opt.value)
                      );
                    }}
                    style={{ accentColor: primary, width: '18px', height: '18px' }}
                  />
                  <span style={{ color: text, fontSize: '0.9375rem' }}>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );

      case 'dropdown':
        return (
          <select
            style={{ ...fieldInputBase, cursor: 'pointer' }}
            value={String(answers[field.id] || '')}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
          >
            <option value="">Select an option…</option>
            {field.options?.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'rating': {
        const maxRating = (field.validation as any)?.maxRating || 5;
        const currentRating = Number(answers[field.id] || 0);
        return (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateAnswer(field.id, star)}
                style={{
                  fontSize: '2rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  transform: currentRating >= star ? 'scale(1.2)' : 'scale(1)',
                  filter:
                    currentRating >= star ? 'none' : 'grayscale(1) opacity(0.35)',
                  padding: '0.25rem',
                }}
              >
                ⭐
              </button>
            ))}
          </div>
        );
      }

      case 'scale': {
        const min = (field.validation as any)?.min || 1;
        const max = (field.validation as any)?.max || 10;
        const current = Number(answers[field.id] || 0);
        return (
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateAnswer(field.id, n)}
                className={`scale-button ${current === n ? 'scale-button-selected' : ''}`}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  border: `2px solid ${current === n ? primary : borderColor}`,
                  background:
                    current === n
                      ? `linear-gradient(135deg, ${primary}, #f59e0b)`
                      : 'transparent',
                  color: current === n ? '#fff' : text,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontSize: '0.9rem',
                  fontFamily,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        );
      }

      case 'yes_no':
        return (
          <div style={{ display: 'flex', gap: '0.875rem' }}>
            {[
              { label: '👍 Yes', value: true },
              { label: '👎 No', value: false },
            ].map((opt) => {
              const isSelected = answers[field.id] === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => updateAnswer(field.id, opt.value)}
                  className={`option-label scale-button ${isSelected ? 'option-label-selected scale-button-selected' : ''}`}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: radius,
                    border: `2px solid ${isSelected ? primary : borderColor}`,
                    background: isSelected ? `${primary}1A` : 'transparent',
                    color: text,
                    fontWeight: 500,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      case 'checkbox':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!answers[field.id]}
              onChange={(e) => updateAnswer(field.id, e.target.checked)}
              style={{ accentColor: primary, width: '20px', height: '20px' }}
            />
            <span style={{ color: text }}>Yes</span>
          </label>
        );

      case 'statement':
        return (
          <p
            style={{
              color: textMuted,
              lineHeight: 1.7,
              padding: '0.75rem 0',
              fontSize: '1rem',
              margin: 0,
            }}
          >
            {field.description || field.label}
          </p>
        );

      case 'section_break':
        return (
          <div
            style={{
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
              margin: '0.5rem 0',
            }}
          />
        );

      default:
        return (
          <input
            style={fieldInputBase}
            value={String(answers[field.id] || '')}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div
      className={`form-page-theme-${themeSlug}`}
      style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse 100% 50% at 50% 0%, rgba(249,115,22,0.06), transparent), ${bg}`,
        fontFamily,
        padding: '2rem 1rem 4rem',
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1) opacity(0.5);
        }

        /* MATRIX THEME */
        .form-page-theme-the-matrix {
          position: relative;
          overflow-x: hidden;
          background-color: #0D0208 !important;
          background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                            linear-gradient(90deg, rgba(0, 255, 65, 0.03), rgba(0, 255, 65, 0.01), rgba(0, 255, 65, 0.03)) !important;
          background-size: 100% 4px, 6px 100% !important;
          font-family: 'Courier New', Courier, monospace !important;
        }
        .form-page-theme-the-matrix::after {
          content: " ";
          display: block;
          position: fixed;
          top: 0; left: 0; bottom: 0; right: 0;
          background: radial-gradient(circle, transparent 50%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
          z-index: 10;
        }
        .form-page-theme-the-matrix .field-card-wrapper {
          background: rgba(13, 2, 8, 0.9) !important;
          border: 1px solid #00FF41 !important;
          border-radius: 2px !important;
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.15) !important;
          padding: 1.5rem !important;
          margin-bottom: 2rem !important;
        }
        .form-page-theme-the-matrix .field-card-wrapper:hover {
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.3) !important;
        }
        .form-page-theme-the-matrix .field-label {
          color: #00FF41 !important;
          font-family: 'Courier New', Courier, monospace !important;
          text-shadow: 0 0 5px #00FF41, 0 0 10px rgba(0, 255, 65, 0.5) !important;
          letter-spacing: 0.05em !important;
        }
        .form-page-theme-the-matrix .field-description {
          color: #00AA2B !important;
          font-family: 'Courier New', Courier, monospace !important;
        }
        .form-page-theme-the-matrix input[type="text"],
        .form-page-theme-the-matrix input[type="email"],
        .form-page-theme-the-matrix input[type="url"],
        .form-page-theme-the-matrix input[type="number"],
        .form-page-theme-the-matrix input[type="date"],
        .form-page-theme-the-matrix input[type="time"],
        .form-page-theme-the-matrix textarea,
        .form-page-theme-the-matrix select {
          background: #000000 !important;
          border: 1px solid #00AA2B !important;
          color: #00FF41 !important;
          border-radius: 2px !important;
          font-family: 'Courier New', Courier, monospace !important;
          box-shadow: inset 0 0 5px rgba(0, 255, 65, 0.2) !important;
        }
        .form-page-theme-the-matrix input:focus,
        .form-page-theme-the-matrix textarea:focus,
        .form-page-theme-the-matrix select:focus {
          border-color: #00FF41 !important;
          box-shadow: 0 0 12px #00FF41, inset 0 0 5px rgba(0, 255, 65, 0.5) !important;
          outline: none !important;
        }
        .form-page-theme-the-matrix .option-label {
          background: #000000 !important;
          border: 1px solid #00AA2B !important;
          border-radius: 2px !important;
        }
        .form-page-theme-the-matrix .option-label:hover {
          border-color: #00FF41 !important;
          box-shadow: 0 0 8px rgba(0, 255, 65, 0.3) !important;
        }
        .form-page-theme-the-matrix .option-label-selected {
          background: rgba(0, 255, 65, 0.1) !important;
          border-color: #00FF41 !important;
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.4) !important;
        }
        .form-page-theme-the-matrix .scale-button {
          background: #000000 !important;
          border: 1px solid #00AA2B !important;
          color: #00FF41 !important;
          border-radius: 2px !important;
        }
        .form-page-theme-the-matrix .scale-button-selected {
          background: #00FF41 !important;
          color: #000000 !important;
          border-color: #00FF41 !important;
          box-shadow: 0 0 12px #00FF41 !important;
        }
        .form-page-theme-the-matrix .submit-button {
          background: #000000 !important;
          border: 2px solid #00FF41 !important;
          color: #00FF41 !important;
          border-radius: 2px !important;
          text-transform: uppercase !important;
          font-family: 'Courier New', Courier, monospace !important;
          font-weight: 900 !important;
          letter-spacing: 0.1em !important;
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.3) !important;
        }
        .form-page-theme-the-matrix .submit-button:hover:not(:disabled) {
          background: #00FF41 !important;
          color: #000000 !important;
          box-shadow: 0 0 20px #00FF41 !important;
        }

        /* CYBERPUNK THEME */
        .form-page-theme-cyberpunk {
          background-color: #0c0c0e !important;
          background-image: 
            linear-gradient(rgba(255, 45, 120, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 45, 120, 0.05) 1px, transparent 1px) !important;
          background-size: 30px 30px !important;
          position: relative;
        }
        .form-page-theme-cyberpunk .field-card-wrapper {
          background: #111115 !important;
          border: 2px solid #ff2d78 !important;
          border-radius: 0px !important;
          box-shadow: 4px 4px 0px #00ffff !important;
          padding: 1.5rem !important;
          margin-bottom: 2rem !important;
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%) !important;
        }
        .form-page-theme-cyberpunk .field-card-wrapper:hover {
          box-shadow: 6px 6px 0px #00ffff, -2px -2px 10px rgba(255, 45, 120, 0.4) !important;
        }
        .form-page-theme-cyberpunk .field-label {
          color: #00ffff !important;
          font-family: 'Orbitron', 'Inter', sans-serif !important;
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
          text-shadow: 0 0 5px rgba(0, 255, 255, 0.6) !important;
        }
        .form-page-theme-cyberpunk .field-description {
          color: #888899 !important;
        }
        .form-page-theme-cyberpunk input[type="text"],
        .form-page-theme-cyberpunk input[type="email"],
        .form-page-theme-cyberpunk input[type="url"],
        .form-page-theme-cyberpunk input[type="number"],
        .form-page-theme-cyberpunk input[type="date"],
        .form-page-theme-cyberpunk input[type="time"],
        .form-page-theme-cyberpunk textarea,
        .form-page-theme-cyberpunk select {
          background: #1a1a24 !important;
          border: 1px solid #ff2d78 !important;
          color: #ffffff !important;
          border-radius: 0px !important;
          box-shadow: inset 2px 2px 0px rgba(0, 255, 255, 0.1) !important;
        }
        .form-page-theme-cyberpunk input:focus,
        .form-page-theme-cyberpunk textarea:focus,
        .form-page-theme-cyberpunk select:focus {
          border-color: #00ffff !important;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.5), inset 2px 2px 0px rgba(255, 45, 120, 0.2) !important;
          outline: none !important;
        }
        .form-page-theme-cyberpunk .option-label {
          background: #15151b !important;
          border: 1px solid #333344 !important;
          border-radius: 0px !important;
        }
        .form-page-theme-cyberpunk .option-label:hover {
          border-color: #ff2d78 !important;
        }
        .form-page-theme-cyberpunk .option-label-selected {
          background: rgba(255, 45, 120, 0.1) !important;
          border-color: #ff2d78 !important;
          box-shadow: 3px 3px 0px #00ffff !important;
        }
        .form-page-theme-cyberpunk .scale-button {
          background: #15151b !important;
          border: 1px solid #ff2d78 !important;
          color: #ffffff !important;
          border-radius: 0px !important;
        }
        .form-page-theme-cyberpunk .scale-button-selected {
          background: #00ffff !important;
          color: #000000 !important;
          border-color: #00ffff !important;
          box-shadow: 3px 3px 0px #ff2d78 !important;
          font-weight: bold !important;
        }
        .form-page-theme-cyberpunk .submit-button {
          background: #ff2d78 !important;
          border: none !important;
          color: #ffffff !important;
          border-radius: 0px !important;
          font-family: 'Orbitron', sans-serif !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          box-shadow: 4px 4px 0px #00ffff !important;
          clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px)) !important;
        }
        .form-page-theme-cyberpunk .submit-button:hover:not(:disabled) {
          background: #00ffff !important;
          color: #000000 !important;
          box-shadow: 4px 4px 0px #ff2d78 !important;
        }

        /* INTERSTELLAR THEME */
        .form-page-theme-interstellar {
          background-color: #060913 !important;
          background-image: 
            radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
            radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px),
            radial-gradient(rgba(245, 166, 35, 0.05) 2px, transparent 40px) !important;
          background-size: 550px 550px, 350px 350px, 450px 450px !important;
          background-position: 0 0, 40px 60px, 130px 270px !important;
        }
        .form-page-theme-interstellar .field-card-wrapper {
          background: rgba(14, 18, 36, 0.75) !important;
          border: 1px solid rgba(245, 166, 35, 0.25) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(16px) !important;
          padding: 1.75rem !important;
        }
        .form-page-theme-interstellar .field-card-wrapper:hover {
          border-color: rgba(245, 166, 35, 0.5) !important;
          box-shadow: 0 15px 50px rgba(245, 166, 35, 0.1) !important;
        }
        .form-page-theme-interstellar h1,
        .form-page-theme-interstellar .field-label {
          font-family: 'Cinzel', 'Playfair Display', Georgia, serif !important;
          color: #FFEED5 !important;
          letter-spacing: 0.03em !important;
        }
        .form-page-theme-interstellar .field-description {
          color: #8fa0c0 !important;
        }
        .form-page-theme-interstellar input[type="text"],
        .form-page-theme-interstellar input[type="email"],
        .form-page-theme-interstellar input[type="url"],
        .form-page-theme-interstellar input[type="number"],
        .form-page-theme-interstellar input[type="date"],
        .form-page-theme-interstellar input[type="time"],
        .form-page-theme-interstellar textarea,
        .form-page-theme-interstellar select {
          background: rgba(10, 12, 22, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          color: #ffffff !important;
          border-radius: 8px !important;
        }
        .form-page-theme-interstellar input:focus,
        .form-page-theme-interstellar textarea:focus,
        .form-page-theme-interstellar select:focus {
          border-color: #F5A623 !important;
          box-shadow: 0 0 12px rgba(245, 166, 35, 0.35) !important;
          outline: none !important;
        }
        .form-page-theme-interstellar .option-label {
          background: rgba(20, 25, 45, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
        }
        .form-page-theme-interstellar .option-label:hover {
          border-color: rgba(245, 166, 35, 0.3) !important;
        }
        .form-page-theme-interstellar .option-label-selected {
          background: rgba(245, 166, 35, 0.12) !important;
          border-color: #F5A623 !important;
          box-shadow: 0 0 15px rgba(245, 166, 35, 0.15) !important;
        }
        .form-page-theme-interstellar .scale-button {
          background: rgba(20, 25, 45, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #FFEED5 !important;
        }
        .form-page-theme-interstellar .scale-button-selected {
          background: linear-gradient(135deg, #F5A623, #d97706) !important;
          border-color: #F5A623 !important;
          box-shadow: 0 0 15px rgba(245, 166, 35, 0.4) !important;
        }
        .form-page-theme-interstellar .submit-button {
          background: linear-gradient(135deg, #F5A623, #b45309) !important;
          color: #0a0a16 !important;
          font-weight: 800 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(245, 166, 35, 0.25) !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        .form-page-theme-interstellar .submit-button:hover:not(:disabled) {
          box-shadow: 0 6px 25px rgba(245, 166, 35, 0.4) !important;
          transform: translateY(-1px) !important;
        }

        /* DEMON SLAYER THEME */
        .form-page-theme-demon-slayer {
          background-color: #120505 !important;
          background-image: radial-gradient(circle at 50% 10%, #300a0a, #120505) !important;
          position: relative;
        }
        .form-page-theme-demon-slayer .field-card-wrapper {
          background: rgba(30, 12, 12, 0.9) !important;
          border: 1px solid #E63946 !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 20px rgba(230, 57, 70, 0.1) !important;
          padding: 1.5rem !important;
        }
        .form-page-theme-demon-slayer .field-card-wrapper:hover {
          box-shadow: 0 8px 30px rgba(230, 57, 70, 0.25) !important;
          border-color: #ff5e6c !important;
        }
        .form-page-theme-demon-slayer .field-label {
          color: #ffdddd !important;
          text-shadow: 0 0 8px rgba(230, 57, 70, 0.5) !important;
        }
        .form-page-theme-demon-slayer .field-description {
          color: #b08888 !important;
        }
        .form-page-theme-demon-slayer input[type="text"],
        .form-page-theme-demon-slayer input[type="email"],
        .form-page-theme-demon-slayer input[type="url"],
        .form-page-theme-demon-slayer input[type="number"],
        .form-page-theme-demon-slayer input[type="date"],
        .form-page-theme-demon-slayer input[type="time"],
        .form-page-theme-demon-slayer textarea,
        .form-page-theme-demon-slayer select {
          background: #1b0a0a !important;
          border: 1px solid #5a2020 !important;
          color: #ffdddd !important;
          border-radius: 6px !important;
        }
        .form-page-theme-demon-slayer input:focus,
        .form-page-theme-demon-slayer textarea:focus,
        .form-page-theme-demon-slayer select:focus {
          border-color: #E63946 !important;
          box-shadow: 0 0 10px rgba(230, 57, 70, 0.6) !important;
          outline: none !important;
        }
        .form-page-theme-demon-slayer .option-label {
          background: #251010 !important;
          border: 1px solid #4a1a1a !important;
          border-radius: 6px !important;
        }
        .form-page-theme-demon-slayer .option-label:hover {
          border-color: #E63946 !important;
        }
        .form-page-theme-demon-slayer .option-label-selected {
          background: rgba(230, 57, 70, 0.15) !important;
          border-color: #E63946 !important;
          box-shadow: 0 0 10px rgba(230, 57, 70, 0.3) !important;
        }
        .form-page-theme-demon-slayer .scale-button {
          background: #251010 !important;
          border: 1px solid #4a1a1a !important;
          color: #ffdddd !important;
        }
        .form-page-theme-demon-slayer .scale-button-selected {
          background: linear-gradient(135deg, #E63946, #e67e22) !important;
          border-color: #E63946 !important;
          box-shadow: 0 0 15px rgba(230, 57, 70, 0.5) !important;
        }
        .form-page-theme-demon-slayer .submit-button {
          background: linear-gradient(135deg, #E63946, #FF9F1C, #E63946) !important;
          background-size: 200% auto !important;
          color: #ffffff !important;
          font-weight: 800 !important;
          border-radius: 6px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          box-shadow: 0 4px 15px rgba(230, 57, 70, 0.4) !important;
          transition: all 0.4s ease !important;
        }
        .form-page-theme-demon-slayer .submit-button:hover:not(:disabled) {
          background-position: right center !important;
          box-shadow: 0 6px 20px rgba(255, 159, 28, 0.6) !important;
        }

        /* OCEAN BREEZE THEME */
        .form-page-theme-ocean-breeze {
          background-color: #eef8fc !important;
          background-image: radial-gradient(at 0% 0%, #dbf0f9 0px, transparent 50%),
                            radial-gradient(at 100% 100%, #e0f2fe 0px, transparent 50%) !important;
        }
        .form-page-theme-ocean-breeze .field-card-wrapper {
          background: rgba(255, 255, 255, 0.85) !important;
          border: 1px solid rgba(14, 165, 233, 0.15) !important;
          border-radius: 20px !important;
          box-shadow: 0 10px 30px rgba(14, 165, 233, 0.05), inset 0 2px 4px rgba(255,255,255,0.6) !important;
          backdrop-filter: blur(12px) !important;
          padding: 1.5rem !important;
        }
        .form-page-theme-ocean-breeze .field-card-wrapper:hover {
          box-shadow: 0 15px 40px rgba(14, 165, 233, 0.1) !important;
          transform: translateY(-2px) !important;
        }
        .form-page-theme-ocean-breeze .field-label {
          color: #0f172a !important;
          font-family: 'Outfit', 'Inter', sans-serif !important;
        }
        .form-page-theme-ocean-breeze .field-description {
          color: #475569 !important;
        }
        .form-page-theme-ocean-breeze input[type="text"],
        .form-page-theme-ocean-breeze input[type="email"],
        .form-page-theme-ocean-breeze input[type="url"],
        .form-page-theme-ocean-breeze input[type="number"],
        .form-page-theme-ocean-breeze input[type="date"],
        .form-page-theme-ocean-breeze input[type="time"],
        .form-page-theme-ocean-breeze textarea,
        .form-page-theme-ocean-breeze select {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-bottom: 3px solid #cbd5e1 !important;
          color: #0f172a !important;
          border-radius: 8px !important;
        }
        .form-page-theme-ocean-breeze input:focus,
        .form-page-theme-ocean-breeze textarea:focus,
        .form-page-theme-ocean-breeze select:focus {
          border-color: #0EA5E9 !important;
          border-bottom-color: #14B8A6 !important;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.08) !important;
          outline: none !important;
        }
        .form-page-theme-ocean-breeze .option-label {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
        }
        .form-page-theme-ocean-breeze .option-label:hover {
          border-color: #0EA5E9 !important;
        }
        .form-page-theme-ocean-breeze .option-label-selected {
          background: rgba(14, 165, 233, 0.08) !important;
          border-color: #0EA5E9 !important;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1) !important;
        }
        .form-page-theme-ocean-breeze .scale-button {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
          border-radius: 10px !important;
        }
        .form-page-theme-ocean-breeze .scale-button-selected {
          background: linear-gradient(135deg, #0EA5E9, #14B8A6) !important;
          border-color: #0EA5E9 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3) !important;
        }
        .form-page-theme-ocean-breeze .submit-button {
          background: linear-gradient(135deg, #0EA5E9, #14B8A6) !important;
          color: #ffffff !important;
          border-radius: 30px !important;
          font-weight: 700 !important;
          box-shadow: 0 6px 20px rgba(14, 165, 233, 0.25) !important;
        }
        .form-page-theme-ocean-breeze .submit-button:hover:not(:disabled) {
          box-shadow: 0 8px 25px rgba(20, 184, 166, 0.4) !important;
          transform: translateY(-1px) !important;
        }

        /* MIDNIGHT THEME */
        .form-page-theme-midnight {
          background-color: #080810 !important;
          background-image: radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.12) 0px, transparent 50%),
                            radial-gradient(at 100% 100%, rgba(167, 139, 250, 0.08) 0px, transparent 50%) !important;
        }
        .form-page-theme-midnight .field-card-wrapper {
          background: rgba(26, 26, 46, 0.45) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 32px 0 rgba(139, 92, 246, 0.08), inset 0 1px 0px rgba(255,255,255,0.05) !important;
          backdrop-filter: blur(16px) !important;
          padding: 1.5rem !important;
        }
        .form-page-theme-midnight .field-card-wrapper:hover {
          border-color: rgba(139, 92, 246, 0.25) !important;
          box-shadow: 0 12px 40px 0 rgba(139, 92, 246, 0.15) !important;
        }
        .form-page-theme-midnight .field-label {
          color: #f0f0ff !important;
          text-shadow: 0 0 10px rgba(139, 92, 246, 0.2) !important;
        }
        .form-page-theme-midnight .field-description {
          color: #9090b0 !important;
        }
        .form-page-theme-midnight input[type="text"],
        .form-page-theme-midnight input[type="email"],
        .form-page-theme-midnight input[type="url"],
        .form-page-theme-midnight input[type="number"],
        .form-page-theme-midnight input[type="date"],
        .form-page-theme-midnight input[type="time"],
        .form-page-theme-midnight textarea,
        .form-page-theme-midnight select {
          background: rgba(15, 15, 30, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #f0f0ff !important;
          border-radius: 10px !important;
        }
        .form-page-theme-midnight input:focus,
        .form-page-theme-midnight textarea:focus,
        .form-page-theme-midnight select:focus {
          border-color: #8B5CF6 !important;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.3) !important;
          outline: none !important;
        }
        .form-page-theme-midnight .option-label {
          background: rgba(20, 20, 38, 0.4) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 10px !important;
        }
        .form-page-theme-midnight .option-label:hover {
          border-color: rgba(139, 92, 246, 0.2) !important;
        }
        .form-page-theme-midnight .option-label-selected {
          background: rgba(139, 92, 246, 0.1) !important;
          border-color: #8B5CF6 !important;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.15) !important;
        }
        .form-page-theme-midnight .scale-button {
          background: rgba(20, 20, 38, 0.4) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: #f0f0ff !important;
        }
        .form-page-theme-midnight .scale-button-selected {
          background: linear-gradient(135deg, #8B5CF6, #A78BFA) !important;
          border-color: #8B5CF6 !important;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.4) !important;
        }
        .form-page-theme-midnight .submit-button {
          background: linear-gradient(135deg, #8B5CF6, #6366f1) !important;
          color: #ffffff !important;
          border-radius: 10px !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3) !important;
        }
        .form-page-theme-midnight .submit-button:hover:not(:disabled) {
          box-shadow: 0 6px 25px rgba(139, 92, 246, 0.5) !important;
        }
      `}</style>

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Progress Bar */}
        {settings.showProgressBar !== false && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: textMuted }}>Progress</span>
              <span style={{ fontSize: '0.8rem', color: primary, fontWeight: 600 }}>
                {progress}%
              </span>
            </div>
            <div
              style={{
                height: '4px',
                background: borderColor,
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${primary}, ${accent})`,
                  borderRadius: '2px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Form Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: text,
              fontFamily: 'Poppins, sans-serif',
              lineHeight: 1.2,
              margin: '0 0 0.75rem',
            }}
          >
            {form.title}
          </h1>
          {form.description && (
            <p style={{ color: textMuted, fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
              {form.description}
            </p>
          )}
        </div>

        {/* Fields */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {formFields.map((field, i) => (
              <div
                key={field.id}
                id={`field-${field.id}`}
                className="field-card-wrapper"
                style={{
                  animation: `fadeInUp 0.45s ease ${Math.min(i * 0.06, 0.5)}s forwards`,
                  opacity: 0,
                }}
              >
                {field.type !== 'statement' && field.type !== 'section_break' && (
                  <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                    <span className="field-label" style={{ fontSize: '1rem', fontWeight: 600, color: text }}>
                      {field.label}
                    </span>
                    {field.isRequired && (
                      <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
                    )}
                    {field.description && (
                      <span
                        className="field-description"
                        style={{
                          display: 'block',
                          color: textMuted,
                          fontSize: '0.875rem',
                          marginTop: '0.25rem',
                          fontWeight: 400,
                          lineHeight: 1.5,
                        }}
                      >
                        {field.description}
                      </span>
                    )}
                  </label>
                )}

                {renderField(field)}

                {errors[field.id] && (
                  <p
                    style={{
                      color: '#ef4444',
                      fontSize: '0.8125rem',
                      marginTop: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    ⚠ {errors[field.id]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
            style={{
              marginTop: '2.5rem',
              padding: '1rem 2rem',
              background: isSubmitting
                ? 'rgba(249,115,22,0.5)'
                : `linear-gradient(135deg, ${primary}, ${accent})`,
              color: '#fff',
              border: 'none',
              borderRadius: radius,
              fontWeight: 700,
              fontSize: '1.0625rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              width: '100%',
              fontFamily,
              boxShadow: `0 4px 20px ${primary}40`,
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}
          >
            {isSubmitting ? '⏳ Submitting…' : settings.submitButtonText || 'Submit'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: textMuted, fontSize: '0.8rem' }}>
          Powered by{' '}
          <a
            href="/"
            style={{ color: primary, textDecoration: 'none', fontWeight: 600 }}
          >
            ☕ ChaiForms
          </a>
        </p>
      </div>
    </div>
  );
}
