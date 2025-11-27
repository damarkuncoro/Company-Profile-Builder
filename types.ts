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
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  zIndex: number;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
}

export interface CompanyData {
  name: string;
  tagline: string;
  industry: string;
  about: string;
  vision: string;
  mission: string;
  contact: string;
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
  MULTI_PAGE_CORPORATE = 'MULTI_PAGE_CORPORATE',
  COVER_MODERN = 'COVER_MODERN'
}