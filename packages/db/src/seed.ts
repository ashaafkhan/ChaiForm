import { db, users, forms, fields, themes } from './index';
import bcryptjs from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding ChaiForms database...');

  // ===== THEMES =====
  console.log('Creating themes...');
  const themeData = [
    {
      name: 'The Matrix',
      slug: 'the-matrix',
      description: 'Neon green on black — enter the simulation',
      category: 'movies',
      isBuiltIn: true,
      config: {
        colors: { primary: '#00FF41', background: '#0D0208', surface: '#0a1a0a', text: '#00FF41', textMuted: '#00AA2B', border: '#003B00', accent: '#FFFF00', error: '#FF0000' },
        typography: { fontFamily: 'Courier New, monospace', headingFont: 'Courier New, monospace', baseFontSize: '16px' },
        borderRadius: '2px', spacing: '16px',
      },
    },
    {
      name: 'Interstellar',
      slug: 'interstellar',
      description: 'Deep space Navy with golden amber accents',
      category: 'movies',
      isBuiltIn: true,
      config: {
        colors: { primary: '#F5A623', background: '#0A0E1A', surface: '#141828', text: '#E8E8FF', textMuted: '#8888AA', border: '#2A2E44', accent: '#F5A623', error: '#FF6B6B' },
        typography: { fontFamily: 'Inter, sans-serif', headingFont: 'Poppins, sans-serif', baseFontSize: '16px' },
        borderRadius: '8px', spacing: '20px',
      },
    },
    {
      name: 'Demon Slayer',
      slug: 'demon-slayer',
      description: 'Crimson and black with flame gradients',
      category: 'anime',
      isBuiltIn: true,
      config: {
        colors: { primary: '#E63946', background: '#1B0A0A', surface: '#2D1010', text: '#FFE4E4', textMuted: '#CC8888', border: '#5A2020', accent: '#FFD60A', error: '#FF0000' },
        typography: { fontFamily: 'Inter, sans-serif', headingFont: 'Poppins, sans-serif', baseFontSize: '16px' },
        borderRadius: '6px', spacing: '16px',
      },
    },
    {
      name: 'Cyberpunk',
      slug: 'cyberpunk',
      description: 'Hot pink and cyan on dark grey',
      category: 'anime',
      isBuiltIn: true,
      config: {
        colors: { primary: '#FF2D78', background: '#0D0D0D', surface: '#1A1A1A', text: '#FFFFFF', textMuted: '#888888', border: '#333333', accent: '#00FFFF', error: '#FF0000' },
        typography: { fontFamily: 'Inter, sans-serif', headingFont: 'Poppins, sans-serif', baseFontSize: '16px' },
        borderRadius: '0px', spacing: '16px',
      },
    },
    {
      name: 'Ocean Breeze',
      slug: 'ocean-breeze',
      description: 'Calm blues and teals for a clean feel',
      category: 'nature',
      isBuiltIn: true,
      config: {
        colors: { primary: '#0EA5E9', background: '#F0F9FF', surface: '#FFFFFF', text: '#0F172A', textMuted: '#64748B', border: '#E2E8F0', accent: '#14B8A6', error: '#EF4444' },
        typography: { fontFamily: 'Inter, sans-serif', headingFont: 'Poppins, sans-serif', baseFontSize: '16px' },
        borderRadius: '12px', spacing: '20px',
      },
    },
    {
      name: 'Midnight',
      slug: 'midnight',
      description: 'Elegant dark with purple accents',
      category: 'minimal',
      isBuiltIn: true,
      config: {
        colors: { primary: '#8B5CF6', background: '#0F0F1A', surface: '#1A1A2E', text: '#F0F0FF', textMuted: '#9090B0', border: '#2A2A40', accent: '#A78BFA', error: '#EF4444' },
        typography: { fontFamily: 'Inter, sans-serif', headingFont: 'Poppins, sans-serif', baseFontSize: '16px' },
        borderRadius: '10px', spacing: '18px',
      },
    },
    {
      name: 'Sunset',
      slug: 'sunset',
      description: 'Warm orange and pink gradients',
      category: 'nature',
      isBuiltIn: true,
      config: {
        colors: { primary: '#F97316', background: '#FFF7ED', surface: '#FFFFFF', text: '#1C0A00', textMuted: '#78350F', border: '#FED7AA', accent: '#EC4899', error: '#EF4444' },
        typography: { fontFamily: 'Inter, sans-serif', headingFont: 'Poppins, sans-serif', baseFontSize: '16px' },
        borderRadius: '12px', spacing: '20px',
      },
    },
    {
      name: 'ChaiForms Default',
      slug: 'chaiforms-default',
      description: 'The official ChaiForms theme',
      category: 'minimal',
      isBuiltIn: true,
      config: {
        colors: { primary: '#F97316', background: '#0A0A0F', surface: '#16161F', text: '#F0F0FF', textMuted: '#9090B0', border: '#2A2A3A', accent: '#F59E0B', error: '#EF4444' },
        typography: { fontFamily: 'Inter, sans-serif', headingFont: 'Poppins, sans-serif', baseFontSize: '16px' },
        borderRadius: '10px', spacing: '20px',
      },
    },
  ];

  const themeIds: Record<string, string> = {};

  for (const theme of themeData) {
    const existing = await db.query.themes.findFirst({ where: eq(themes.slug, theme.slug) });
    if (existing) {
      themeIds[theme.slug] = existing.id;
      console.log(`  Theme exists: ${theme.name}`);
      continue;
    }
    const [inserted] = await db.insert(themes).values(theme).returning();
    themeIds[theme.slug] = inserted.id;
    console.log(`  Created theme: ${theme.name}`);
  }

  // ===== USERS =====
  console.log('Creating demo users...');
  const adminHash = await bcryptjs.hash('admin123', 10);
  const demoHash = await bcryptjs.hash('demo123', 10);

  let adminUser = await db.query.users.findFirst({ where: eq(users.email, 'admin@chaiforms.dev') });
  if (!adminUser) {
    [adminUser] = await db.insert(users).values({
      name: 'Admin User',
      email: 'admin@chaiforms.dev',
      passwordHash: adminHash,
      isAdmin: true,
      isVerified: true,
      plan: 'enterprise',
    }).returning();
    console.log('  Created admin user: admin@chaiforms.dev / admin123');
  } else {
    console.log('  Admin user already exists');
  }

  let demoUser = await db.query.users.findFirst({ where: eq(users.email, 'demo@chaiforms.dev') });
  if (!demoUser) {
    [demoUser] = await db.insert(users).values({
      name: 'Demo Creator',
      email: 'demo@chaiforms.dev',
      passwordHash: demoHash,
      isAdmin: false,
      isVerified: true,
      plan: 'pro',
    }).returning();
    console.log('  Created demo user: demo@chaiforms.dev / demo123');
  } else {
    console.log('  Demo user already exists');
  }

  // ===== FORMS =====
  console.log('Creating sample forms...');

  const sampleForms = [
    {
      slug: 'anime-personality-quiz',
      title: 'Which Anime Character Are You?',
      description: 'Find out which iconic anime character matches your personality!',
      status: 'published' as const,
      visibility: 'public' as const,
      themeSlug: 'demon-slayer',
      templateCategory: 'quiz',
      fields: [
        { type: 'short_text' as const, label: 'What is your name?', isRequired: true, order: 1 },
        { type: 'single_select' as const, label: 'Choose your fighting style:', isRequired: true, order: 2, options: [{id:'1',label:'Speed & Agility',value:'speed'},{id:'2',label:'Raw Power',value:'power'},{id:'3',label:'Tactical Mind',value:'tactical'},{id:'4',label:'Elemental Magic',value:'magic'}] },
        { type: 'rating' as const, label: 'How determined are you to protect your friends?', isRequired: true, order: 3, validation: { maxRating: 5 } },
        { type: 'multi_select' as const, label: 'Which traits describe you best?', isRequired: false, order: 4, options: [{id:'1',label:'Loyal',value:'loyal'},{id:'2',label:'Hot-headed',value:'hot-headed'},{id:'3',label:'Calm',value:'calm'},{id:'4',label:'Mysterious',value:'mysterious'},{id:'5',label:'Cheerful',value:'cheerful'}] },
        { type: 'yes_no' as const, label: 'Would you sacrifice yourself for your team?', isRequired: true, order: 5 },
      ],
    },
    {
      slug: 'developer-os-survey',
      title: 'Developer OS & Tools Survey 2026',
      description: 'Tell us about your development environment and tools of choice.',
      status: 'published' as const,
      visibility: 'public' as const,
      themeSlug: 'the-matrix',
      templateCategory: 'survey',
      fields: [
        { type: 'single_select' as const, label: 'Primary Operating System', isRequired: true, order: 1, options: [{id:'1',label:'Windows 11',value:'windows'},{id:'2',label:'macOS',value:'macos'},{id:'3',label:'Linux (Ubuntu/Debian)',value:'linux-ubuntu'},{id:'4',label:'Linux (Arch)',value:'linux-arch'},{id:'5',label:'Linux (other)',value:'linux-other'}] },
        { type: 'multi_select' as const, label: 'Languages you use daily', isRequired: true, order: 2, options: [{id:'1',label:'TypeScript',value:'typescript'},{id:'2',label:'Python',value:'python'},{id:'3',label:'Go',value:'go'},{id:'4',label:'Rust',value:'rust'},{id:'5',label:'Java',value:'java'},{id:'6',label:'C++',value:'cpp'}] },
        { type: 'rating' as const, label: 'Rate your terminal setup (1-5)', isRequired: true, order: 3, validation: { maxRating: 5 } },
        { type: 'single_select' as const, label: 'Preferred code editor', isRequired: true, order: 4, options: [{id:'1',label:'VS Code',value:'vscode'},{id:'2',label:'Neovim',value:'neovim'},{id:'3',label:'JetBrains IDEs',value:'jetbrains'},{id:'4',label:'Emacs',value:'emacs'},{id:'5',label:'Other',value:'other'}] },
        { type: 'long_text' as const, label: 'What tool changed your workflow the most this year?', isRequired: false, order: 5 },
        { type: 'email' as const, label: 'Drop your email to receive results', isRequired: false, order: 6 },
      ],
    },
    {
      slug: 'startup-feedback-form',
      title: 'Product Feedback — ChaiForms Beta',
      description: 'Help us improve by sharing your honest feedback.',
      status: 'published' as const,
      visibility: 'public' as const,
      themeSlug: 'chaiforms-default',
      templateCategory: 'feedback',
      fields: [
        { type: 'rating' as const, label: 'How would you rate ChaiForms overall?', isRequired: true, order: 1, validation: { maxRating: 5 } },
        { type: 'multi_select' as const, label: 'Which features do you love?', isRequired: false, order: 2, options: [{id:'1',label:'Form Builder',value:'builder'},{id:'2',label:'Analytics',value:'analytics'},{id:'3',label:'Themes',value:'themes'},{id:'4',label:'CSV Export',value:'csv'},{id:'5',label:'QR Code Sharing',value:'qr'}] },
        { type: 'long_text' as const, label: 'What feature is missing that you need most?', isRequired: true, order: 3 },
        { type: 'scale' as const, label: 'How likely are you to recommend ChaiForms? (1-10)', isRequired: true, order: 4, validation: { min: 1, max: 10 } },
        { type: 'single_select' as const, label: 'Would you pay for ChaiForms Pro?', isRequired: true, order: 5, options: [{id:'1',label:'Yes, definitely',value:'yes'},{id:'2',label:'Maybe, depends on pricing',value:'maybe'},{id:'3',label:'No, free tier is enough',value:'no'}] },
        { type: 'email' as const, label: 'Email for updates (optional)', isRequired: false, order: 6 },
      ],
    },
    {
      slug: 'movie-ratings-quiz',
      title: 'Ultimate Movie Ratings Survey',
      description: 'Share your all-time favorite movies and ratings across genres.',
      status: 'published' as const,
      visibility: 'public' as const,
      themeSlug: 'interstellar',
      templateCategory: 'entertainment',
      fields: [
        { type: 'short_text' as const, label: 'Your all-time favorite movie?', isRequired: true, order: 1 },
        { type: 'single_select' as const, label: 'Favorite genre', isRequired: true, order: 2, options: [{id:'1',label:'Sci-Fi',value:'scifi'},{id:'2',label:'Action',value:'action'},{id:'3',label:'Horror',value:'horror'},{id:'4',label:'Drama',value:'drama'},{id:'5',label:'Comedy',value:'comedy'},{id:'6',label:'Thriller',value:'thriller'}] },
        { type: 'rating' as const, label: 'Rate the last movie you watched', isRequired: true, order: 3, validation: { maxRating: 5 } },
        { type: 'yes_no' as const, label: 'Do you prefer watching at home over cinema?', isRequired: true, order: 4 },
        { type: 'long_text' as const, label: 'Write a mini review of your favorite movie', isRequired: false, order: 5 },
      ],
    },
    {
      slug: 'event-rsvp-form',
      title: 'Chai & Code Hackathon RSVP',
      description: 'Register your attendance for the Web Dev 2026 Hackathon.',
      status: 'published' as const,
      visibility: 'public' as const,
      themeSlug: 'sunset',
      templateCategory: 'event',
      fields: [
        { type: 'short_text' as const, label: 'Full Name', isRequired: true, order: 1 },
        { type: 'email' as const, label: 'Email Address', isRequired: true, order: 2 },
        { type: 'phone' as const, label: 'Phone Number', isRequired: false, order: 3 },
        { type: 'single_select' as const, label: 'Attendance Mode', isRequired: true, order: 4, options: [{id:'1',label:'In-person',value:'inperson'},{id:'2',label:'Online',value:'online'}] },
        { type: 'multi_select' as const, label: 'Which sessions will you attend?', isRequired: false, order: 5, options: [{id:'1',label:'Opening Keynote',value:'keynote'},{id:'2',label:'tRPC Workshop',value:'trpc'},{id:'3',label:'Drizzle ORM Deep Dive',value:'drizzle'},{id:'4',label:'Judging Session',value:'judging'}] },
        { type: 'long_text' as const, label: 'Any dietary restrictions or special requirements?', isRequired: false, order: 6 },
        { type: 'checkbox' as const, label: 'I agree to the event terms and conditions', isRequired: true, order: 7 },
      ],
    },
  ];

  for (const formData of sampleForms) {
    const existing = await db.query.forms.findFirst({ where: eq(forms.slug, formData.slug) });
    if (existing) {
      console.log(`  Form exists: ${formData.title}`);
      continue;
    }

    const themeId = themeIds[formData.themeSlug];
    const { fields: formFields, themeSlug, ...formValues } = formData;

    const [newForm] = await db.insert(forms).values({
      userId: demoUser!.id,
      title: formValues.title,
      description: formValues.description,
      slug: formValues.slug,
      status: formValues.status,
      visibility: formValues.visibility,
      themeId: themeId || null,
      isTemplate: true,
      templateCategory: formValues.templateCategory,
      responseCount: Math.floor(Math.random() * 150) + 20,
      viewCount: Math.floor(Math.random() * 500) + 100,
      publishedAt: new Date(),
    }).returning();

    for (const field of formFields) {
      await db.insert(fields).values({
        formId: newForm.id,
        type: field.type,
        label: field.label,
        isRequired: field.isRequired,
        order: field.order,
        page: 1,
        options: (field as any).options || [],
        validation: (field as any).validation || {},
      });
    }

    console.log(`  Created form: ${formData.title}`);
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Admin: admin@chaiforms.dev / admin123');
  console.log('  Demo:  demo@chaiforms.dev / demo123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
