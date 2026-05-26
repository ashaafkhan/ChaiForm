'use client';

import React from 'react';
import { Card } from '@chaiforms/ui/components/card';
import { Label } from '@chaiforms/ui/components/label';
import { Input } from '@chaiforms/ui/components/input';
import { Button } from '@chaiforms/ui/components/button';
import { X } from 'lucide-react';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  fontSize: string;
  borderRadius: string;
  spacing: string;
  buttonStyle: string;
}

interface ThemeCustomizerProps {
  config: ThemeConfig;
  onUpdate: (config: Partial<ThemeConfig>) => void;
  onClose: () => void;
}

const FONT_FAMILIES = [
  { value: 'sans', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Monospace' },
];

const FONT_SIZES = [
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Normal' },
  { value: 'lg', label: 'Large' },
];

const BORDER_RADIUS = [
  { value: 'none', label: 'Sharp' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const SPACINGS = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'comfortable', label: 'Comfortable' },
];

const BUTTON_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
];

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  config,
  onUpdate,
  onClose,
}) => {
  const handleColorChange = (colorKey: string, value: string) => {
    onUpdate({ [colorKey]: value } as Partial<ThemeConfig>);
  };

  const handleSelectChange = (key: string, value: string) => {
    onUpdate({ [key]: value } as Partial<ThemeConfig>);
  };

  return (
    <div className="h-full overflow-y-auto">
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Customize Theme</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Colors Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Colors</h4>

          {[
            { key: 'primaryColor', label: 'Primary Color' },
            { key: 'secondaryColor', label: 'Secondary Color' },
            { key: 'accentColor', label: 'Accent Color' },
            { key: 'backgroundColor', label: 'Background Color' },
            { key: 'textColor', label: 'Text Color' },
            { key: 'borderColor', label: 'Border Color' },
          ].map(({ key, label }) => (
            <div key={key}>
              <Label htmlFor={key} className="text-slate-700 text-sm">
                {label}
              </Label>
              <div className="flex gap-2 mt-1.5">
                <input
                  id={key}
                  type="color"
                  value={config[key as keyof ThemeConfig]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border border-slate-300"
                />
                <Input
                  type="text"
                  value={config[key as keyof ThemeConfig]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Typography Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Typography</h4>

          {/* Font Family */}
          <div>
            <Label htmlFor="fontFamily" className="text-slate-700 text-sm">
              Font Family
            </Label>
            <select
              id="fontFamily"
              value={config.fontFamily}
              onChange={(e) => handleSelectChange('fontFamily', e.target.value)}
              className="mt-1.5 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FONT_FAMILIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <Label htmlFor="fontSize" className="text-slate-700 text-sm">
              Font Size
            </Label>
            <select
              id="fontSize"
              value={config.fontSize}
              onChange={(e) => handleSelectChange('fontSize', e.target.value)}
              className="mt-1.5 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FONT_SIZES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Layout Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Layout</h4>

          {/* Border Radius */}
          <div>
            <Label htmlFor="borderRadius" className="text-slate-700 text-sm">
              Corner Roundness
            </Label>
            <select
              id="borderRadius"
              value={config.borderRadius}
              onChange={(e) => handleSelectChange('borderRadius', e.target.value)}
              className="mt-1.5 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {BORDER_RADIUS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Spacing */}
          <div>
            <Label htmlFor="spacing" className="text-slate-700 text-sm">
              Spacing
            </Label>
            <select
              id="spacing"
              value={config.spacing}
              onChange={(e) => handleSelectChange('spacing', e.target.value)}
              className="mt-1.5 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SPACINGS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Button Style */}
          <div>
            <Label htmlFor="buttonStyle" className="text-slate-700 text-sm">
              Button Style
            </Label>
            <select
              id="buttonStyle"
              value={config.buttonStyle}
              onChange={(e) => handleSelectChange('buttonStyle', e.target.value)}
              className="mt-1.5 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {BUTTON_STYLES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900">
          💡 <strong>Tip:</strong> Changes are applied to your form preview instantly.
        </div>
      </Card>
    </div>
  );
};
