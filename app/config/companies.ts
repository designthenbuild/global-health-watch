// GLOBAL HEALTH WATCH — COMPANY LIST
// To add a company: copy a line, change the details, save, then git add . && git commit -m "Add X" && git push

export interface Company { name: string; website?: string; region?: string; description?: string; }

export const COMPANIES: Record<string, Company[]> = {
  LONGEVITY: [
    { name: 'Altos Labs', website: 'https://www.altoslabs.com', region: 'Global', description: 'Cellular rejuvenation biotech' },
    { name: 'Neko Health', website: 'https://www.nekohealth.com', region: 'Europe', description: 'Full-body health scanning' },
    { name: 'Function Health', website: 'https://www.functionhealth.com', region: 'North America', description: 'Whole-body biomarker testing' },
    { name: 'GlycanAge', website: 'https://glycanage.com', region: 'Europe', description: 'Biological age testing' },
    { name: 'Buck Institute', website: 'https://www.buckinstitute.org', region: 'North America', description: 'Aging research institute' },
    { name: 'Calico', website: 'https://www.calicolabs.com', region: 'North America', description: 'Alphabet longevity lab' },
    { name: 'Insilico Medicine', website: 'https://insilico.com', region: 'Global', description: 'AI drug discovery' },
    { name: 'Juvenescence', website: 'https://juvlabs.com', region: 'Europe', description: 'Longevity biotech' },
    { name: 'Maximon', website: 'https://www.maximon.com', region: 'Europe', description: 'Longevity venture builder' },
    { name: 'Clinique La Prairie', website: 'https://www.cliniquelaprairie.com', region: 'Europe', description: 'Longevity medical spa' },
    { name: 'Fountain Life', website: 'https://www.fountainlife.com', region: 'North America', description: 'Longevity diagnostics' },
    { name: 'NOVOS Labs', website: 'https://novoslabs.com', region: 'Global', description: 'Longevity supplements' },
  ],
  PERFORMANCE: [
    { name: 'Oura', website: 'https://ouraring.com', region: 'Global', description: 'Sleep & recovery ring' },
    { name: 'WHOOP', website: 'https://www.whoop.com', region: 'North America', description: 'Performance wearable' },
    { name: 'Apple Health', website: 'https://www.apple.com/health', region: 'Global', description: 'Health & fitness platform' },
    { name: 'Garmin', website: 'https://www.garmin.com', region: 'Global', description: 'GPS & fitness wearables' },
    { name: 'Firstbeat', website: 'https://www.firstbeat.com', region: 'Europe', description: 'Physiological analytics for sport' },
    { name: 'Tonal', website: 'https://www.tonal.com', region: 'North America', description: 'AI-powered strength training' },
    { name: 'STATSports', website: 'https://statsports.com', region: 'Europe', description: 'GPS wearable for elite sport' },
    { name: 'KINEXON', website: 'https://kinexon.com', region: 'Europe', description: 'Real-time athlete tracking' },
    { name: 'Hudl', website: 'https://www.hudl.com', region: 'North America', description: 'Sports video analytics' },
    { name: 'Kitman Labs', website: 'https://www.kitmanlabs.com', region: 'Europe', description: 'AI athlete analytics' },
    { name: 'PlayerMaker', website: 'https://www.playermaker.com', region: 'Europe', description: 'Soccer player sensors' },
    { name: 'Zebra Technologies', website: 'https://www.zebra.com', region: 'North America', description: 'Real-time location tracking' },
    { name: 'EXOS', website: 'https://www.teamexos.com', region: 'North America', description: 'Elite performance training' },
    { name: 'Aspetar', website: 'https://www.aspetar.com', region: 'GCC·MENA', description: 'Sports medicine hospital Qatar' },
    { name: 'Thymia', website: 'https://thymia.ai', region: 'Europe', description: 'Voice biomarkers for performance' },
  ],
  INVESTMENTS: [
    { name: 'Andreessen Horowitz', website: 'https://a16z.com', region: 'North America', description: 'Leading VC firm' },
    { name: 'Flagship Pioneering', website: 'https://www.flagshippioneering.com', region: 'North America', description: 'Biotech venture creation' },
    { name: 'Mubadala', website: 'https://www.mubadala.com', region: 'GCC·MENA', description: 'Abu Dhabi sovereign wealth fund' },
    { name: 'Apollo Health Ventures', website: 'https://www.apollo.vc', region: 'Europe', description: 'Longevity focused VC' },
    { name: 'M42', website: 'https://m42.ae', region: 'GCC·MENA', description: 'Abu Dhabi global health company' },
    { name: 'Healthspan Capital', website: 'https://www.healthspancapital.vc', region: 'Global', description: 'Longevity investment fund' },
    { name: 'Sapphire Sport', website: 'https://www.sapphiresport.com', region: 'Global', description: 'Sports & health tech VC' },
  ],
  'MENTAL HEALTH': [
    { name: 'MAPS', website: 'https://maps.org', region: 'Global', description: 'Psychedelic research nonprofit' },
    { name: 'Compass Pathways', website: 'https://compasspathways.com', region: 'Europe', description: 'Psilocybin therapy' },
    { name: 'Mindmed', website: 'https://mindmed.co', region: 'North America', description: 'Psychedelic medicine biotech' },
    { name: 'Flow Neuroscience', website: 'https://www.flowneuroscience.com', region: 'Europe', description: 'tDCS treatment for depression' },
    { name: 'Thymia', website: 'https://thymia.ai', region: 'Europe', description: 'Voice biomarkers for mental health' },
    { name: 'Headspace', website: 'https://www.headspace.com', region: 'Global', description: 'Meditation & mindfulness app' },
    { name: 'Calm', website: 'https://www.calm.com', region: 'Global', description: 'Sleep & meditation app' },
  ],
  DISCOVERIES: [
    { name: 'Moderna', website: 'https://www.modernatx.com', region: 'North America', description: 'mRNA therapeutics' },
    { name: 'BioNTech', website: 'https://www.biontech.com', region: 'Europe', description: 'mRNA cancer & vaccine biotech' },
    { name: 'Recursion', website: 'https://www.recursion.com', region: 'North America', description: 'AI drug discovery' },
    { name: 'Intellia Therapeutics', website: 'https://www.intelliatx.com', region: 'North America', description: 'CRISPR therapeutics' },
    { name: 'Legacy', website: 'https://www.givelegacy.com', region: 'North America', description: 'Male fertility testing' },
    { name: 'Bioptimus', website: 'https://www.bioptimus.com', region: 'Europe', description: 'AI foundation models for biology' },
  ],
  THREATS: [
    { name: 'WHO', website: 'https://www.who.int', region: 'Global', description: 'World Health Organization' },
    { name: 'CDC', website: 'https://www.cdc.gov', region: 'North America', description: 'US Centers for Disease Control' },
    { name: 'ECDC', website: 'https://www.ecdc.europa.eu', region: 'Europe', description: 'European Centre for Disease Prevention' },
    { name: 'ProMED', website: 'https://promedmail.org', region: 'Global', description: 'Infectious disease surveillance' },
    { name: 'Gavi', website: 'https://www.gavi.org', region: 'Global', description: 'Vaccine alliance' },
    { name: 'CEPI', website: 'https://cepi.net', region: 'Global', description: 'Coalition for epidemic preparedness' },
  ],
};

export const ALL_COMPANY_NAMES: string[] = Object.values(COMPANIES).flat().map(c => c.name);
export function getCompaniesForCategory(category: string): Company[] { return COMPANIES[category] || []; }
export function getCompanyNamesForCategory(category: string): string[] { return getCompaniesForCategory(category).map(c => c.name); }
export function extractMentionedCompanies(text: string): string[] { const lower = text.toLowerCase(); return ALL_COMPANY_NAMES.filter(name => lower.includes(name.toLowerCase())); }
