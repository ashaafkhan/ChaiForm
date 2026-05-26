'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@chaiforms/ui/components/card';
import { Button } from '@chaiforms/ui/components/button';
import { Check } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  config: {
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
  };
}

interface ThemeSelectorProps {
  themes: Theme[];
  selectedThemeId?: string;
  onSelectTheme: (themeId: string) => void;
  isLoading?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  selectedThemeId,
  onSelectTheme,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-500">No themes available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {themes.map((theme) => (
        <div
          key={theme.id}
          onClick={() => onSelectTheme(theme.id)}
          className={`cursor-pointer transition-all ${
            selectedThemeId === theme.id
              ? 'ring-2 ring-blue-500'
              : 'hover:shadow-md'
          }`}
        >
          <Card className="p-4 relative overflow-hidden">
            {/* Theme Preview */}
            <div
              className="absolute top-0 left-0 right-0 h-12 transition"
              style={{ backgroundColor: theme.config.primaryColor }}
            />

            {/* Content */}
            <div className="relative pt-2 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  {theme.name}
                  {selectedThemeId === theme.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </h3>
                {theme.description && (
                  <p className="text-xs text-slate-600 mt-1">{theme.description}</p>
                )}
                {theme.category && (
                  <span className="inline-block mt-2 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                    {theme.category}
                  </span>
                )}
              </div>

              {/* Color Swatches */}
              <div className="flex gap-1 ml-3">
                <div
                  className="w-6 h-6 rounded-full border border-slate-300"
                  style={{ backgroundColor: theme.config.primaryColor }}
                  title="Primary"
                />
                <div
                  className="w-6 h-6 rounded-full border border-slate-300"
                  style={{ backgroundColor: theme.config.secondaryColor }}
                  title="Secondary"
                />
                <div
                  className="w-6 h-6 rounded-full border border-slate-300"
                  style={{ backgroundColor: theme.config.accentColor }}
                  title="Accent"
                />
              </div>
            </div>

            {/* Color Info */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-600">Font:</span>
                <span className="ml-1 font-mono">{theme.config.fontFamily}</span>
              </div>
              <div>
                <span className="text-slate-600">Radius:</span>
                <span className="ml-1 font-mono">{theme.config.borderRadius}</span>
              </div>
            </div>
          </Card>
        </div>
      ))}

      {/* No Theme Option */}
      <div
        onClick={() => onSelectTheme('')}
        className={`cursor-pointer transition-all ${
          !selectedThemeId ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
        }`}
      >
        <Card className="p-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            No Theme
            {!selectedThemeId && <Check className="w-4 h-4 text-blue-600" />}
          </h3>
          <p className="text-xs text-slate-600 mt-1">Use default form styling</p>
        </Card>
      </div>
    </div>
  );
};
