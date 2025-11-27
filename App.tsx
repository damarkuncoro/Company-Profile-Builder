import React, { useState, useRef, useEffect } from 'react';
import { EditorControls } from './components/EditorControls';
import { DraggableElement } from './components/DraggableElement';
import { CanvasElement, CanvasState, CompanyData, ElementType, TemplateType, AutoLayoutType, Page } from './types';
import { MousePointer2, ChevronLeft, ChevronRight, Plus, Trash2, Layers } from 'lucide-react';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_CANVAS_WIDTH = 794; // A4 @ 96 DPI
const INITIAL_CANVAS_HEIGHT = 1123;

const App: React.FC = () => {
  // --- STATE ---
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    tagline: '',
    industry: '',
    about: '',
    vision: '',
    mission: '',
    contact: ''
  });

  // Initialize with one page
  const [canvasState, setCanvasState] = useState<CanvasState>(() => {
    const firstPageId = generateId();
    return {
      pages: [{
        id: firstPageId,
        elements: [],
        backgroundColor: '#ffffff',
        backgroundOpacity: 1,
        backgroundImage: undefined
      }],
      activePageId: firstPageId,
      selectedId: null
    };
  });

  const [zoom, setZoom] = useState(0.7); // Initial zoom
  
  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Helpers
  const getActivePage = () => canvasState.pages.find(p => p.id === canvasState.activePageId)!;
  
  const updateActivePage = (updates: Partial<Page>) => {
    setCanvasState(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, ...updates } : p)
    }));
  };

  // --- ACTIONS ---

  const addElement = (type: ElementType, content: string = '') => {
    const newElement: CanvasElement = {
      id: generateId(),
      type,
      content,
      x: 100,
      y: 100,
      width: type === ElementType.TEXT ? 300 : (type === ElementType.LOGO ? 150 : 200),
      height: type === ElementType.TEXT ? 50 : (type === ElementType.LOGO ? 150 : 200),
      zIndex: getActivePage().elements.length + 1,
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left'
    };
    
    updateActivePage({
      elements: [...getActivePage().elements, newElement]
    });
    setCanvasState(prev => ({ ...prev, selectedId: newElement.id }));
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const activePage = getActivePage();
    const updatedElements = activePage.elements.map(el => el.id === id ? { ...el, ...updates } : el);
    updateActivePage({ elements: updatedElements });
  };

  const deleteElement = (id: string) => {
    const activePage = getActivePage();
    updateActivePage({
      elements: activePage.elements.filter(el => el.id !== id)
    });
    setCanvasState(prev => ({ ...prev, selectedId: null }));
  };

  const handleSelectElement = (id: string) => {
    setCanvasState(prev => ({ ...prev, selectedId: id }));
  };

  const setBackgroundColor = (color: string) => {
    updateActivePage({ backgroundColor: color, backgroundImage: undefined });
  };

  const setBackgroundImage = (url: string) => {
    updateActivePage({ backgroundImage: url });
  };

  // --- PAGE MANAGEMENT ---

  const addNewPage = () => {
    const newPageId = generateId();
    const newPage: Page = {
      id: newPageId,
      elements: [],
      backgroundColor: '#ffffff',
      backgroundOpacity: 1
    };
    setCanvasState(prev => ({
      ...prev,
      pages: [...prev.pages, newPage],
      activePageId: newPageId,
      selectedId: null
    }));
  };

  const deleteActivePage = () => {
    if (canvasState.pages.length <= 1) {
      alert("Cannot delete the only page.");
      return;
    }
    const pageIndex = canvasState.pages.findIndex(p => p.id === canvasState.activePageId);
    const newPages = canvasState.pages.filter(p => p.id !== canvasState.activePageId);
    // Determine new active page (previous one, or first one)
    const newActiveIndex = Math.max(0, pageIndex - 1);
    
    setCanvasState(prev => ({
      ...prev,
      pages: newPages,
      activePageId: newPages[newActiveIndex].id,
      selectedId: null
    }));
  };

  const navigatePage = (direction: 'prev' | 'next') => {
    const currentIndex = canvasState.pages.findIndex(p => p.id === canvasState.activePageId);
    if (direction === 'prev' && currentIndex > 0) {
      setCanvasState(prev => ({ ...prev, activePageId: prev.pages[currentIndex - 1].id, selectedId: null }));
    } else if (direction === 'next' && currentIndex < canvasState.pages.length - 1) {
      setCanvasState(prev => ({ ...prev, activePageId: prev.pages[currentIndex + 1].id, selectedId: null }));
    }
  };

  // --- AUTO GENERATE DESIGN FROM DATA ---
  const generateAutoDesign = (layoutType: AutoLayoutType) => {
    const { name, tagline, about, vision, mission, contact } = companyData;
    const safeName = name || 'Company Name';
    const safeTagline = tagline || 'Innovating for a better future';
    const safeAbout = about || 'We are a leading company dedicated to providing top-tier solutions in our industry. With years of experience and a team of experts, we deliver excellence.';
    const safeVision = vision || 'To be the global leader in delivering innovative solutions that empower businesses and society.';
    const safeMission = mission || 'To provide high-quality products and services that exceed customer expectations through continuous improvement.';
    const safeContact = contact || '123 Business Rd, Tech City, TC 90210 | info@company.com | www.company.com';

    // SPECIAL CASE: MULTI-PAGE GENERATION
    if (layoutType === AutoLayoutType.MULTI_PAGE_CORPORATE) {
        const pages: Page[] = [];

        // Helper to add page
        const addPage = (bgColor = '#ffffff', elements: CanvasElement[] = []) => {
            pages.push({
                id: generateId(),
                elements,
                backgroundColor: bgColor,
                backgroundOpacity: 1
            });
        };

        // --- DESIGN SYSTEM THEME (STRICT CONSISTENCY) ---
        const THEME = {
            colors: {
                primary: '#1e293b',   // Slate 800
                primaryDark: '#0f172a', // Slate 900 (Cover/Back)
                accent: '#3b82f6',    // Blue 500
                accentPop: '#f59e0b', // Amber 500 (Highlights)
                textMain: '#334155',  // Slate 700
                textLight: '#64748b', // Slate 500
                bgWhite: '#ffffff',
                bgAlt: '#f8fafc',     // Slate 50
                line: '#cbd5e1'       // Slate 300
            },
            fonts: {
                h1: { fontSize: 32, fontWeight: 'bold', color: '#1e293b' }, // Page Titles
                h2: { fontSize: 24, fontWeight: 'bold', color: '#334155' }, // Section Headers
                h3: { fontSize: 18, fontWeight: 'bold', color: '#3b82f6' }, // Sub-headers
                body: { fontSize: 14, color: '#334155', fontWeight: 'normal' },
                caption: { fontSize: 12, color: '#64748b', fontWeight: 'normal' }
            },
            layout: {
                marginX: 50,
                contentWidth: 694,
                headerY: 50,
                footerY: 1050
            }
        };

        // Helper: Generate Consistent Header & Footer
        // All internal pages (2-13) will use this to ensure alignment
        const createCommonElements = (title: string, pageNum: number): CanvasElement[] => {
            return [
                // --- HEADER ---
                // Decorative top bar strip
                { id: generateId(), type: ElementType.SHAPE, content: '', x: 0, y: 0, width: 794, height: 12, backgroundColor: THEME.colors.primary, zIndex: 10 },
                
                // Page Title Block
                { id: generateId(), type: ElementType.TEXT, content: title.toUpperCase(), x: THEME.layout.marginX, y: THEME.layout.headerY + 20, width: 500, height: 40, ...THEME.fonts.h1, zIndex: 1 },
                // Underline Accent
                { id: generateId(), type: ElementType.SHAPE, content: '', x: THEME.layout.marginX, y: THEME.layout.headerY + 60, width: 60, height: 4, backgroundColor: THEME.colors.accent, zIndex: 1 },

                // --- FOOTER ---
                // Thin Separator Line
                { id: generateId(), type: ElementType.SHAPE, content: '', x: THEME.layout.marginX, y: THEME.layout.footerY, width: THEME.layout.contentWidth, height: 1, backgroundColor: THEME.colors.line, zIndex: 0 },
                // Company Name (Left)
                { id: generateId(), type: ElementType.TEXT, content: safeName, x: THEME.layout.marginX, y: THEME.layout.footerY + 15, width: 400, height: 20, fontSize: 10, color: THEME.colors.textLight, zIndex: 1 },
                // Page Number (Right)
                { id: generateId(), type: ElementType.TEXT, content: String(pageNum).padStart(2, '0'), x: 700, y: THEME.layout.footerY + 10, width: 44, height: 20, fontSize: 14, fontWeight: 'bold', color: THEME.colors.primary, textAlign: 'right', zIndex: 1 }
            ];
        };

        // 1. Cover Page (Unique Design - The "Parent" Style)
        addPage(THEME.colors.primaryDark, [
             // Background Geometric Accents
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 0, y: 0, width: 794, height: 1123, backgroundColor: THEME.colors.primaryDark, zIndex: 0 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 400, y: 0, width: 394, height: 1123, backgroundColor: '#1e293b', zIndex: 0 },
             
             // Accent Lines
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 400, width: 694, height: 2, backgroundColor: THEME.colors.accent, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 390, width: 100, height: 4, backgroundColor: THEME.colors.accentPop, zIndex: 2 },

             // Branding
             { id: generateId(), type: ElementType.TEXT, content: "COMPANY PROFILE", x: 50, y: 350, width: 300, height: 40, fontSize: 18, fontWeight: 'bold', color: THEME.colors.accent, zIndex: 2 },
             { id: generateId(), type: ElementType.TEXT, content: safeName, x: 50, y: 430, width: 694, height: 100, fontSize: 52, fontWeight: 'bold', color: '#ffffff', textAlign: 'left', zIndex: 2 },
             { id: generateId(), type: ElementType.TEXT, content: safeTagline, x: 50, y: 550, width: 500, height: 60, fontSize: 20, color: '#94a3b8', zIndex: 2 },
             
             // Year / Footer
             { id: generateId(), type: ElementType.TEXT, content: new Date().getFullYear().toString(), x: 50, y: 1000, width: 694, height: 50, fontSize: 16, color: '#64748b', textAlign: 'left', zIndex: 2 },
        ]);

        // 2. Foreword
        addPage(THEME.colors.bgWhite, [
             ...createCommonElements("Foreword", 2),
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 160, width: 250, height: 300, backgroundColor: '#e2e8f0', borderRadius: 2, zIndex: 1 }, // Photo Placeholder
             { id: generateId(), type: ElementType.TEXT, content: "MESSAGE FROM THE DIRECTOR", x: 330, y: 160, width: 400, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: `"We are committed to delivering the best solutions for our clients. Our journey has been one of innovation and dedication. We believe in sustainable growth and partnership."\n\nThank you for trusting us.`, x: 330, y: 210, width: 414, height: 200, ...THEME.fonts.body, fontSize: 16, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Director Name", x: 330, y: 450, width: 200, height: 30, fontSize: 16, fontWeight: 'bold', color: THEME.colors.primary, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "CEO & Founder", x: 330, y: 475, width: 200, height: 20, ...THEME.fonts.caption, zIndex: 1 },
        ]);

        // 3. Profile Brief
        addPage(THEME.colors.bgAlt, [
             ...createCommonElements("About Us", 3),
             { id: generateId(), type: ElementType.TEXT, content: "WHO WE ARE", x: 50, y: 160, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: safeAbout, x: 50, y: 200, width: 694, height: 200, ...THEME.fonts.body, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 450, width: 694, height: 400, backgroundColor: '#cbd5e1', borderRadius: 0, zIndex: 1 }, // Image placeholder
        ]);

        // 4. History
        addPage(THEME.colors.bgWhite, [
             ...createCommonElements("Our History", 4),
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 98, y: 160, width: 4, height: 700, backgroundColor: THEME.colors.line, zIndex: 0 }, // Timeline Bar
             
             // Item 1
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 90, y: 180, width: 20, height: 20, backgroundColor: THEME.colors.accent, borderRadius: 10, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "2003", x: 130, y: 175, width: 100, height: 30, fontSize: 20, fontWeight: 'bold', color: THEME.colors.accent, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Company Inception. Started with 5 employees.", x: 130, y: 210, width: 500, height: 50, ...THEME.fonts.body, zIndex: 1 },

             // Item 2
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 90, y: 380, width: 20, height: 20, backgroundColor: THEME.colors.primary, borderRadius: 10, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "2010", x: 130, y: 375, width: 100, height: 30, fontSize: 20, fontWeight: 'bold', color: THEME.colors.primary, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "National Expansion. Opened 3 branch offices.", x: 130, y: 410, width: 500, height: 50, ...THEME.fonts.body, zIndex: 1 },

             // Item 3
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 90, y: 580, width: 20, height: 20, backgroundColor: THEME.colors.accentPop, borderRadius: 10, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "2024", x: 130, y: 575, width: 100, height: 30, fontSize: 20, fontWeight: 'bold', color: THEME.colors.accentPop, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Global Partnerships established.", x: 130, y: 610, width: 500, height: 50, ...THEME.fonts.body, zIndex: 1 },
        ]);

        // 5. Legality
        addPage(THEME.colors.bgAlt, [
             ...createCommonElements("Legality & Certification", 5),
             { id: generateId(), type: ElementType.TEXT, content: "Compliance & Standards", x: 50, y: 160, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "We adhere to international standards and regulations to ensure the highest quality.", x: 50, y: 200, width: 600, height: 40, ...THEME.fonts.body, zIndex: 1 },

             // Cards - White on Alt BG
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 260, width: 200, height: 150, backgroundColor: '#ffffff', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Business License", x: 75, y: 325, width: 150, height: 20, fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: THEME.colors.primary, zIndex: 2 },
             
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 297, y: 260, width: 200, height: 150, backgroundColor: '#ffffff', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "ISO 9001:2015", x: 322, y: 325, width: 150, height: 20, fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: THEME.colors.primary, zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 544, y: 260, width: 200, height: 150, backgroundColor: '#ffffff', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Industry Cert", x: 569, y: 325, width: 150, height: 20, fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: THEME.colors.primary, zIndex: 2 },
        ]);

        // 6. Vision & Mission
        addPage(THEME.colors.bgWhite, [
             ...createCommonElements("Strategic Direction", 6),
             
             // Vision Section
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 160, width: 694, height: 220, backgroundColor: '#eff6ff', borderRadius: 4, zIndex: 0 },
             { id: generateId(), type: ElementType.TEXT, content: "OUR VISION", x: 80, y: 190, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: safeVision, x: 80, y: 230, width: 634, height: 120, ...THEME.fonts.body, fontSize: 16, zIndex: 1 },

             // Mission Section
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 400, width: 694, height: 220, backgroundColor: THEME.colors.bgAlt, borderRadius: 4, zIndex: 0 },
             { id: generateId(), type: ElementType.TEXT, content: "OUR MISSION", x: 80, y: 430, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: safeMission, x: 80, y: 470, width: 634, height: 120, ...THEME.fonts.body, fontSize: 16, zIndex: 1 },
        ]);

        // 7. Core Values
        addPage(THEME.colors.bgAlt, [
             ...createCommonElements("Core Values", 7),
             
             // Grid Layout 2x2 - Consistent Colors
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 160, width: 330, height: 180, backgroundColor: THEME.colors.primary, borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "INTEGRITY", x: 70, y: 235, width: 290, height: 30, fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 414, y: 160, width: 330, height: 180, backgroundColor: THEME.colors.accent, borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "INNOVATION", x: 434, y: 235, width: 290, height: 30, fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 360, width: 330, height: 180, backgroundColor: '#475569', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "EXCELLENCE", x: 70, y: 435, width: 290, height: 30, fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 414, y: 360, width: 330, height: 180, backgroundColor: '#94a3b8', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "TEAMWORK", x: 434, y: 435, width: 290, height: 30, fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 2 },
        ]);

        // 8. Services
        addPage(THEME.colors.bgWhite, [
             ...createCommonElements("Our Services", 8),
             
             // Service 1
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 160, width: 694, height: 1, backgroundColor: THEME.colors.line, zIndex: 0 },
             { id: generateId(), type: ElementType.TEXT, content: "01. Service Name", x: 50, y: 180, width: 400, height: 30, ...THEME.fonts.h2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Comprehensive description of service one. We provide high quality solutions tailored to your needs.", x: 50, y: 220, width: 600, height: 60, ...THEME.fonts.body, zIndex: 1 },

             // Service 2
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 300, width: 694, height: 1, backgroundColor: THEME.colors.line, zIndex: 0 },
             { id: generateId(), type: ElementType.TEXT, content: "02. Service Name", x: 50, y: 320, width: 400, height: 30, ...THEME.fonts.h2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Comprehensive description of service two. Reliable, fast, and secure.", x: 50, y: 360, width: 600, height: 60, ...THEME.fonts.body, zIndex: 1 },

             // Service 3
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 440, width: 694, height: 1, backgroundColor: THEME.colors.line, zIndex: 0 },
             { id: generateId(), type: ElementType.TEXT, content: "03. Service Name", x: 50, y: 460, width: 400, height: 30, ...THEME.fonts.h2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Comprehensive description of service three. Advanced technology for modern business.", x: 50, y: 500, width: 600, height: 60, ...THEME.fonts.body, zIndex: 1 },
        ]);

        // 9. Advantages
        addPage(THEME.colors.bgAlt, [
             ...createCommonElements("Why Choose Us", 9),
             
             { id: generateId(), type: ElementType.TEXT, content: "Professional Team", x: 50, y: 160, width: 300, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Certified experts with years of experience.", x: 50, y: 190, width: 300, height: 60, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.TEXT, content: "24/7 Support", x: 400, y: 160, width: 300, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Always available to assist you anytime.", x: 400, y: 190, width: 300, height: 60, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.TEXT, content: "Latest Technology", x: 50, y: 280, width: 300, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Using the most advanced tools and tech.", x: 50, y: 310, width: 300, height: 60, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.TEXT, content: "Competitive Price", x: 400, y: 280, width: 300, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Best value for your investment.", x: 400, y: 310, width: 300, height: 60, ...THEME.fonts.body, zIndex: 1 },
        ]);

        // 10. Infrastructure
        addPage(THEME.colors.bgWhite, [
             ...createCommonElements("Infrastructure", 10),
             { id: generateId(), type: ElementType.TEXT, content: "Our Facilities", x: 50, y: 160, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Built to support mission-critical operations with redundant systems.", x: 50, y: 200, width: 600, height: 40, ...THEME.fonts.body, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 250, width: 694, height: 400, backgroundColor: '#cbd5e1', borderRadius: 0, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Data Center Overview", x: 50, y: 660, width: 300, height: 20, ...THEME.fonts.caption, zIndex: 1 },
        ]);

        // 11. Clients
        addPage(THEME.colors.bgAlt, [
             ...createCommonElements("Our Clients", 11),
             { id: generateId(), type: ElementType.TEXT, content: "Trusted Partners", x: 50, y: 160, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             
             // Client Logo Grid
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 220, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 231, y: 220, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 412, y: 220, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 593, y: 220, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 320, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 231, y: 320, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 412, y: 320, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 593, y: 320, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
        ]);

        // 12. Portfolio
        addPage(THEME.colors.bgWhite, [
             ...createCommonElements("Portfolio", 12),
             
             // Project 1
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 160, width: 330, height: 200, backgroundColor: '#cbd5e1', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Project Name A", x: 50, y: 370, width: 330, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Description of project A. Successfully implemented.", x: 50, y: 400, width: 330, height: 40, ...THEME.fonts.body, zIndex: 1 },

             // Project 2
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 414, y: 160, width: 330, height: 200, backgroundColor: '#cbd5e1', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Project Name B", x: 414, y: 370, width: 330, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Description of project B. Client satisfaction achieved.", x: 414, y: 400, width: 330, height: 40, ...THEME.fonts.body, zIndex: 1 },
        ]);

        // 13. Team
        addPage(THEME.colors.bgAlt, [
             ...createCommonElements("Management Team", 13),
             
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 150, y: 200, width: 150, height: 150, backgroundColor: '#ffffff', borderRadius: 75, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Full Name", x: 125, y: 360, width: 200, height: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: THEME.colors.primary, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Chief Executive Officer", x: 125, y: 390, width: 200, height: 20, fontSize: 14, textAlign: 'center', color: THEME.colors.textLight, zIndex: 1 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 500, y: 200, width: 150, height: 150, backgroundColor: '#ffffff', borderRadius: 75, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Full Name", x: 475, y: 360, width: 200, height: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: THEME.colors.primary, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Chief Technology Officer", x: 475, y: 390, width: 200, height: 20, fontSize: 14, textAlign: 'center', color: THEME.colors.textLight, zIndex: 1 },
        ]);

        // 14. Contact (Unique Layout - Back Cover)
        addPage(THEME.colors.primaryDark, [
            { id: generateId(), type: ElementType.SHAPE, content: '', x: 0, y: 0, width: 794, height: 1123, backgroundColor: THEME.colors.primaryDark, zIndex: 0 },
            
            { id: generateId(), type: ElementType.TEXT, content: "GET IN TOUCH", x: 50, y: 100, width: 694, height: 60, fontSize: 48, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 1 },
            { id: generateId(), type: ElementType.SHAPE, content: '', x: 347, y: 180, width: 100, height: 4, backgroundColor: THEME.colors.accent, zIndex: 1 },
            
            { id: generateId(), type: ElementType.TEXT, content: safeContact, x: 100, y: 250, width: 594, height: 200, fontSize: 20, color: '#e2e8f0', textAlign: 'center', zIndex: 1 },
            
            { id: generateId(), type: ElementType.SHAPE, content: '', x: 100, y: 500, width: 594, height: 400, backgroundColor: '#1e293b', zIndex: 1 }, // Map Placeholder
            { id: generateId(), type: ElementType.TEXT, content: "www.website.com", x: 50, y: 1000, width: 694, height: 30, fontSize: 16, color: '#64748b', textAlign: 'center', zIndex: 1 },
        ]);

        setCanvasState({
            pages: pages,
            activePageId: pages[0].id,
            selectedId: null
        });
        return;
    }

    // --- EXISTING SINGLE PAGE LAYOUTS ---
    const elements: CanvasElement[] = [];
    let bgColor = '#ffffff';

    if (layoutType === AutoLayoutType.MODERN_SIDEBAR) {
      bgColor = '#ffffff';
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 0, y: 0, width: 250, height: 1123, backgroundColor: '#0f172a', zIndex: 0 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeName, x: 25, y: 60, width: 200, height: 100, fontSize: 28, fontWeight: 'bold', color: '#ffffff', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeTagline, x: 25, y: 150, width: 200, height: 60, fontSize: 14, color: '#94a3b8', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "CONTACT", x: 25, y: 950, width: 200, height: 30, fontSize: 12, fontWeight: 'bold', color: '#64748b', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeContact, x: 25, y: 970, width: 200, height: 100, fontSize: 12, color: '#ffffff', zIndex: 1 });

      elements.push({ id: generateId(), type: ElementType.TEXT, content: "About Us", x: 300, y: 60, width: 400, height: 40, fontSize: 36, fontWeight: 'bold', color: '#0f172a', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 300, y: 110, width: 60, height: 6, backgroundColor: '#3b82f6', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeAbout, x: 300, y: 140, width: 440, height: 200, fontSize: 14, color: '#334155', zIndex: 1 });

      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 300, y: 400, width: 440, height: 250, backgroundColor: '#f8fafc', borderRadius: 10, zIndex: 0 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "Our Vision", x: 320, y: 420, width: 400, height: 30, fontSize: 20, fontWeight: 'bold', color: '#0f172a', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeVision, x: 320, y: 460, width: 400, height: 150, fontSize: 14, color: '#475569', zIndex: 1 });

      elements.push({ id: generateId(), type: ElementType.TEXT, content: "Our Mission", x: 320, y: 680, width: 400, height: 30, fontSize: 20, fontWeight: 'bold', color: '#0f172a', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeMission, x: 320, y: 720, width: 440, height: 150, fontSize: 14, color: '#475569', zIndex: 1 });
    
    } else if (layoutType === AutoLayoutType.CLASSIC_HEADER) {
      bgColor = '#ffffff';
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 0, y: 0, width: 794, height: 200, backgroundColor: '#1e3a8a', zIndex: 0 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeName, x: 50, y: 60, width: 694, height: 60, fontSize: 40, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeTagline, x: 150, y: 120, width: 494, height: 40, fontSize: 16, color: '#bfdbfe', textAlign: 'center', zIndex: 1 });

      elements.push({ id: generateId(), type: ElementType.TEXT, content: "COMPANY PROFILE", x: 50, y: 250, width: 694, height: 30, fontSize: 14, fontWeight: 'bold', color: '#94a3b8', textAlign: 'center', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeAbout, x: 100, y: 300, width: 594, height: 150, fontSize: 14, color: '#334155', textAlign: 'center', zIndex: 1 });

      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 500, width: 330, height: 300, backgroundColor: '#eff6ff', borderRadius: 8, zIndex: 0 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "VISION", x: 70, y: 520, width: 290, height: 30, fontSize: 18, fontWeight: 'bold', color: '#1d4ed8', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeVision, x: 70, y: 560, width: 290, height: 200, fontSize: 13, color: '#1e293b', zIndex: 1 });

      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 414, y: 500, width: 330, height: 300, backgroundColor: '#eff6ff', borderRadius: 8, zIndex: 0 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "MISSION", x: 434, y: 520, width: 290, height: 30, fontSize: 18, fontWeight: 'bold', color: '#1d4ed8', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeMission, x: 434, y: 560, width: 290, height: 200, fontSize: 13, color: '#1e293b', zIndex: 1 });

      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 0, y: 1000, width: 794, height: 123, backgroundColor: '#1e293b', zIndex: 0 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeContact, x: 50, y: 1030, width: 694, height: 80, fontSize: 14, color: '#ffffff', textAlign: 'center', zIndex: 1 });

    } else if (layoutType === AutoLayoutType.BOLD_GEOMETRIC) {
      bgColor = '#111827';
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: -100, y: -50, width: 600, height: 600, backgroundColor: '#ea580c', borderRadius: 300, zIndex: 0 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeName, x: 50, y: 150, width: 500, height: 100, fontSize: 56, fontWeight: 'bold', color: '#ffffff', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 300, width: 694, height: 2, backgroundColor: '#4b5563', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "WHO WE ARE", x: 50, y: 350, width: 200, height: 30, fontSize: 14, fontWeight: 'bold', color: '#ea580c', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeAbout, x: 50, y: 390, width: 694, height: 120, fontSize: 16, color: '#d1d5db', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "THE FUTURE", x: 50, y: 550, width: 200, height: 30, fontSize: 14, fontWeight: 'bold', color: '#ea580c', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeVision, x: 50, y: 590, width: 330, height: 200, fontSize: 14, color: '#d1d5db', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "THE PATH", x: 414, y: 550, width: 200, height: 30, fontSize: 14, fontWeight: 'bold', color: '#ea580c', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeMission, x: 414, y: 590, width: 330, height: 200, fontSize: 14, color: '#d1d5db', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 550, y: 850, width: 400, height: 400, backgroundColor: '#374151', borderRadius: 200, zIndex: 0 });
    }

    // Overwrite current page content for single page layouts
    updateActivePage({
        elements: elements,
        backgroundColor: bgColor,
        backgroundImage: undefined
    });
  };

  // --- TEMPLATES ---
  const applyTemplate = (type: TemplateType) => {
    let newElements: CanvasElement[] = [];
    let bgColor = '#ffffff';

    if (type === TemplateType.CORPORATE) {
        bgColor = '#f0f9ff';
        newElements = [
            { id: generateId(), type: ElementType.SHAPE, content: '', x: 0, y: 0, width: 794, height: 150, backgroundColor: '#1e3a8a', zIndex: 0 },
            { id: generateId(), type: ElementType.TEXT, content: companyData.name || 'COMPANY NAME', x: 40, y: 40, width: 500, height: 60, fontSize: 42, fontWeight: 'bold', color: '#ffffff', zIndex: 1 },
            { id: generateId(), type: ElementType.TEXT, content: 'Professional Profile', x: 40, y: 90, width: 300, height: 30, fontSize: 18, color: '#93c5fd', zIndex: 1 },
            { id: generateId(), type: ElementType.TEXT, content: 'ABOUT US', x: 40, y: 200, width: 200, height: 40, fontSize: 24, fontWeight: 'bold', color: '#1e3a8a', zIndex: 1 },
            { id: generateId(), type: ElementType.TEXT, content: companyData.about || 'We are a leading company...', x: 40, y: 250, width: 700, height: 100, fontSize: 14, color: '#334155', zIndex: 1 },
        ];
    } else if (type === TemplateType.CREATIVE) {
        bgColor = '#ffffff';
        newElements = [
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 500, y: 0, width: 300, height: 1123, backgroundColor: '#f3e8ff', zIndex: 0 },
             { id: generateId(), type: ElementType.TEXT, content: companyData.name || 'CREATIVE\nAGENCY', x: 50, y: 100, width: 400, height: 150, fontSize: 60, fontWeight: 'bold', color: '#000000', zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 260, width: 100, height: 10, backgroundColor: '#9333ea', zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: 'OUR VISION', x: 540, y: 100, width: 200, height: 40, fontSize: 20, fontWeight: 'bold', color: '#6b21a8', zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: companyData.vision || 'To create amazing things.', x: 540, y: 150, width: 200, height: 200, fontSize: 14, color: '#4b5563', zIndex: 1 },
        ];
    } else if (type === TemplateType.STARTUP) {
        bgColor = '#18181b';
        newElements = [
            { id: generateId(), type: ElementType.TEXT, content: companyData.name || 'STARTUP.IO', x: 300, y: 500, width: 400, height: 60, fontSize: 48, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 1 },
            { id: generateId(), type: ElementType.TEXT, content: 'Future of Technology', x: 300, y: 560, width: 400, height: 30, fontSize: 18, color: '#22c55e', textAlign: 'center', zIndex: 1 },
            { id: generateId(), type: ElementType.SHAPE, content: '', x: 100, y: 100, width: 594, height: 923, backgroundColor: 'transparent', zIndex: 0 },
        ];
    }

    updateActivePage({
        elements: newElements,
        backgroundColor: bgColor,
        backgroundImage: undefined
    });
  };

  // --- MOUSE EVENT HANDLERS FOR DRAG ---

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return; // Only left click
    const activePage = getActivePage();
    const element = activePage.elements.find(el => el.id === id);
    if (element) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX / zoom - element.x,
        y: e.clientY / zoom - element.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && canvasState.selectedId) {
      const x = e.clientX / zoom - dragOffset.x;
      const y = e.clientY / zoom - dragOffset.y;
      
      updateElement(canvasState.selectedId, { x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Global mouse up to catch drops outside elements
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const activePage = getActivePage();
  const activeElements = activePage.elements;
  const selectedElement = activeElements.find(el => el.id === canvasState.selectedId);
  
  // Calculate index for display
  const activePageIndex = canvasState.pages.findIndex(p => p.id === canvasState.activePageId);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <EditorControls 
        companyData={companyData}
        setCompanyData={setCompanyData}
        addElement={addElement}
        updateElement={updateElement}
        deleteElement={deleteElement}
        selectedElement={selectedElement}
        setBackgroundColor={setBackgroundColor}
        setBackgroundImage={setBackgroundImage}
        applyTemplate={applyTemplate}
        generateAutoDesign={generateAutoDesign}
      />

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Toolbar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10 no-print shadow-sm">
            <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">ProProfile Editor</span>
            </div>

            {/* PAGE CONTROLS */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                <button 
                  onClick={() => navigatePage('prev')}
                  disabled={activePageIndex === 0}
                  className="p-1.5 rounded hover:bg-white text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="px-3 text-xs font-semibold text-gray-600">
                  Page {activePageIndex + 1} / {canvasState.pages.length}
                </div>
                <button 
                  onClick={() => navigatePage('next')}
                  disabled={activePageIndex === canvasState.pages.length - 1}
                  className="p-1.5 rounded hover:bg-white text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button 
                  onClick={addNewPage}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white text-xs font-medium text-blue-600"
                  title="Add New Page"
                >
                  <Plus size={14} /> Add
                </button>
                 <button 
                  onClick={deleteActivePage}
                  disabled={canvasState.pages.length === 1}
                  className="p-1.5 rounded hover:bg-white hover:text-red-500 text-gray-500 disabled:opacity-30 disabled:hover:text-gray-500"
                  title="Delete Page"
                >
                  <Trash2 size={14} />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1 border border-gray-200">
                    <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="text-gray-600 hover:text-blue-600 font-bold px-1">-</button>
                    <span className="text-xs text-gray-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(2.0, z + 0.1))} className="text-gray-600 hover:text-blue-600 font-bold px-1">+</button>
                </div>
            </div>
        </div>

        {/* Canvas Area Container - Better Center & Scroll */}
        <div 
            className="flex-1 overflow-auto bg-gray-200 flex justify-center p-8 relative"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* 
               Wrapper controls the scrollable area size based on zoom 
               This fixes the visual positioning/scrollbar issues
            */}
            <div 
                style={{ 
                    width: `${INITIAL_CANVAS_WIDTH * zoom}px`, 
                    height: `${INITIAL_CANVAS_HEIGHT * zoom}px`,
                    position: 'relative',
                    transition: 'width 0.1s, height 0.1s'
                }}
            >
                <div 
                    id="canvas-area"
                    className="bg-white shadow-2xl absolute top-0 left-0 origin-top-left"
                    style={{
                        width: `${INITIAL_CANVAS_WIDTH}px`,
                        height: `${INITIAL_CANVAS_HEIGHT}px`,
                        backgroundColor: activePage.backgroundColor,
                        backgroundImage: activePage.backgroundImage ? `url(${activePage.backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: `scale(${zoom})`,
                    }}
                    onClick={() => setCanvasState(prev => ({...prev, selectedId: null}))}
                >
                    {activeElements.map(el => (
                        <DraggableElement 
                            key={el.id}
                            element={el}
                            isSelected={el.id === canvasState.selectedId}
                            onSelect={handleSelectElement}
                            onMouseDown={handleMouseDown}
                        />
                    ))}
                    
                    {/* Print/Safety Margins Overlay */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none border border-red-100 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-full h-full border-[10mm] border-transparent relative">
                            <div className="absolute top-0 left-0 text-[8px] text-red-200 font-mono p-1">Bleed/Margin Guide</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;