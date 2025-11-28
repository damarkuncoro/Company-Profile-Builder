export enum ElementType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SHAPE = 'SHAPE',
  LOGO = 'LOGO'
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  content: string; // Text content or Image URL
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  zIndex: number;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
}

export interface HistoryItem { year: string; event: string; }
export interface ServiceItem { title: string; description: string; }
export interface TeamMember { name: string; role: string; }
export interface ProjectItem { name: string; description: string; }
export interface AdvantageItem { title: string; description: string; }

export interface CompanyData {
  // General
  name: string;
  tagline: string;
  industry: string;
  about: string;
  vision: string;
  mission: string;
  contact: string;

  // Leadership (Foreword)
  directorName: string;
  directorRole: string;
  directorMessage: string;

  // History & Legal
  history: HistoryItem[];
  legalities: string[]; // List of cert names or legal docs
  
  // Strategy
  values: string[]; // List of 4 core values

  // Offerings
  services: ServiceItem[];
  advantages: AdvantageItem[];

  // Operations & Clients (NEW)
  infrastructure: string;
  clients: string[];

  // Proof
  teamMembers: TeamMember[];
  projects: ProjectItem[];
}

export interface Page {
  id: string;
  elements: CanvasElement[];
  backgroundColor: string;
  backgroundImage?: string;
  backgroundOpacity: number;
}

export interface CanvasState {
  pages: Page[];
  activePageId: string;
  selectedId: string | null;
}

export enum TemplateType {
  BLANK = 'BLANK',
  CORPORATE = 'CORPORATE',
  CREATIVE = 'CREATIVE',
  STARTUP = 'STARTUP'
}

export enum AutoLayoutType {
  MODERN_SIDEBAR = 'MODERN_SIDEBAR',
  CLASSIC_HEADER = 'CLASSIC_HEADER',
  BOLD_GEOMETRIC = 'BOLD_GEOMETRIC',
  MINI_PROFILE = 'MINI_PROFILE',
  STANDARD_PROFILE = 'STANDARD_PROFILE',
  MULTI_PAGE_CORPORATE = 'MULTI_PAGE_CORPORATE',
  COVER_MODERN = 'COVER_MODERN'
}

export type Language = 'id' | 'en';