'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card } from '@chaiforms/ui';
import { ChevronLeft, Search } from 'lucide-react';
import { ThemeSelector } from '@/components/ThemeSelector';
import { trpc } from '@/lib/trpc';

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

export default function ThemesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>();

  const { data: themesData, isLoading } = trpc.themes.list.useQuery({});
  const themes = (themesData || []) as unknown as Theme[];

  const [filteredThemes, setFilteredThemes] = useState<Theme[]>([]);

  const categories = Array.from(new Set(themes.map((t) => t.category).filter(Boolean)));

  // Filter themes
  useEffect(() => {
    let filtered = themes;

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    setFilteredThemes(filtered);
  }, [themes, searchTerm, selectedCategory]);

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">Themes</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 space-y-4 sticky top-24">
              {/* Search */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Search Themes
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Categories
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        !selectedCategory
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category!)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                          selectedCategory === category
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600">
                  <strong>{filteredThemes.length}</strong> theme{filteredThemes.length !== 1 ? 's' : ''}{' '}
                  available
                </p>
              </div>
            </Card>
          </div>

          {/* Themes Grid */}
          <div className="lg:col-span-3">
            {filteredThemes.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-slate-600 mb-4">No themes found matching your criteria.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <ThemeSelector
                themes={filteredThemes}
                selectedThemeId={selectedThemeId}
                onSelectTheme={handleSelectTheme}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
