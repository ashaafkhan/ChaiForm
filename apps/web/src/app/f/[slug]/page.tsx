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
  const themeConfig = theme.config || {};
  const themeColors = themeConfig.colors || {};
  const themeTypography = themeConfig.typography || {};
  const custom = (form?.customTheme as any) || {};

  const bg = custom.backgroundColor || themeColors.background || '#0a0a0f';
  const surface = custom.surfaceColor || themeColors.surface || '#16161f';
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
                style={{
                  animation: `fadeInUp 0.45s ease ${Math.min(i * 0.06, 0.5)}s forwards`,
                  opacity: 0,
                }}
              >
                {field.type !== 'statement' && field.type !== 'section_break' && (
                  <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: text }}>
                      {field.label}
                    </span>
                    {field.isRequired && (
                      <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
                    )}
                    {field.description && (
                      <span
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
