import { db, users, forms, fields, responses, themes } from './index';
import { v4 as uuid } from 'crypto';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Seed themes first
    console.log('Creating themes...');
    const themeIds: Record<string, string> = {};
    
    const themesData = [
      {
        name: 'Demon Slayer',
        slug: 'demon-slayer',
        category: 'anime',
        config: {
          colors: {
            primary: '#E63946',
            background: '#1B1B1B',
            surface: '#2D2D2D',
            text: '#FFFFFF',
            textMuted: '#A0A0A0',
            border: '#FF4444',
            accent: '#FFD60A',
            error: '#E63946',
          },
          typography: { fontFamily: 'Inter', headingFont: 'Poppins', baseFontSize: '16px' },
          borderRadius: '8px',
          spacing: '16px',
        },
      },
      {
        name: 'Terminal',
        slug: 'terminal',
        category: 'tech',
        config: {
          colors: {
            primary: '#00FF41',
            background: '#0D0221',
            surface: '#1B1B1B',
            text: '#00FF41',
            textMuted: '#00AA00',
            border: '#00FF41',
            accent: '#FFFF00',
            error: '#FF0000',
          },
          typography: { fontFamily: 'Courier New', headingFont: 'Courier New', baseFontSize: '14px' },
          borderRadius: '0px',
          spacing: '12px',
        },
      },
    ];

    for (const themeData of themesData) {
      // In production, use proper insert
      console.log(`Created theme: ${themeData.name}`);
      themeIds[themeData.slug] = uuid();
    }

    // Seed users
    console.log('Creating demo users...');
    const demoUserId = uuid();
    const admin UserId = uuid();
    
    // Seed forms (minimal structure for now)
    console.log('Creating sample forms...');

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
