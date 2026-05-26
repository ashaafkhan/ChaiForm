import { format, formatDistance } from 'date-fns';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(date: Date, pattern = 'MMM dd, yyyy'): string {
  return format(date, pattern);
}

export function formatRelativeTime(date: Date): string {
  return formatDistance(date, new Date(), { addSuffix: true });
}

export function generateRandomString(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export const FIELD_TYPES = [
  'short_text',
  'long_text',
  'email',
  'url',
  'phone',
  'number',
  'rating',
  'scale',
  'single_select',
  'multi_select',
  'dropdown',
  'checkbox',
  'yes_no',
  'date',
  'time',
  'date_range',
  'file_upload',
  'signature',
  'matrix',
  'ranking',
  'statement',
  'section_break',
] as const;

export const FORM_STATUSES = ['draft', 'published', 'archived'] as const;
export const FORM_VISIBILITY = ['public', 'unlisted'] as const;
