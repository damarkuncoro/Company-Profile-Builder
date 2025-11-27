import React, { useState, useRef, useEffect } from 'react';
import { EditorControls } from './components/EditorControls';
import { DraggableElement } from './components/DraggableElement';
import { CanvasElement, CanvasState, CompanyData, ElementType, TemplateType, AutoLayoutType, Page, Language } from './types';
import { MousePointer2, ChevronLeft, ChevronRight, Plus, Trash2, Layers } from 'lucide-react';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_CANVAS_WIDTH = 794; // A4 @ 96 DPI
const INITIAL_CANVAS_HEIGHT = 1123;

// --- TRANSLATION DICTIONARY ---
export const DICTIONARY = {
    id: {
        // UI
        ui_data: "Data",
        ui_design: "Desain",
        ui_export: "Ekspor",
        ui_page: "Halaman",
        
        // Content Titles
        title_cover: "PROFIL PERUSAHAAN",
        title_foreword: "KATA PENGANTAR",
        title_director_speech: "SAMBUTAN DIREKTUR UTAMA",
        title_about: "TENTANG KAMI",
        title_who: "SIAPA KAMI",
        title_history: "SEJARAH PERUSAHAAN",
        title_legality: "LEGALITAS & SERTIFIKASI",
        title_compliance: "Kepatuhan & Standarisasi",
        title_strategy: "ARAH STRATEGIS",
        title_vision: "VISI KAMI",
        title_mission: "MISI KAMI",
        title_values: "NILAI PERUSAHAAN",
        title_services: "LAYANAN UTAMA",
        title_advantages: "KEUNGGULAN KAMI",
        title_infra: "INFRASTRUKTUR & TEKNOLOGI",
        title_clients: "KLIEN & PARTNER",
        title_portfolio: "PORTOFOLIO PROYEK",
        title_team: "TIM MANAJEMEN",
        title_contact: "HUBUNGI KAMI",
        
        // Placeholders & Defaults
        ph_director_quote: `"Kami berkomitmen untuk memberikan solusi terbaik bagi klien kami. Perjalanan kami adalah inovasi dan dedikasi. Kami percaya pada pertumbuhan berkelanjutan dan kemitraan jangka panjang."`,
        ph_history_1: "Pendirian Perusahaan. Dimulai dengan 5 karyawan.",
        ph_history_2: "Ekspansi Nasional. Membuka 3 kantor cabang baru.",
        ph_history_3: "Kemitraan Global tercapai dengan berbagai vendor internasional.",
        ph_legality_desc: "Kami mematuhi standar dan peraturan internasional untuk memastikan kualitas tertinggi dalam setiap layanan.",
        ph_service_desc: "Deskripsi lengkap mengenai layanan. Kami menyediakan solusi berkualitas tinggi yang disesuaikan dengan kebutuhan Anda.",
        ph_team_role_1: "Direktur Utama",
        ph_team_role_2: "Direktur Operasional",
        ph_contact_map: "Peta Lokasi Kantor",

        // Long Text Defaults
        default_about: "Perusahaan kami berdedikasi untuk memberikan solusi terbaik di industri. Dengan pengalaman bertahun-tahun dan tim ahli, kami menghadirkan keunggulan dalam setiap layanan.",
        default_vision: "Menjadi pemimpin global dalam memberikan solusi inovatif yang memberdayakan bisnis dan masyarakat.",
        default_mission: "Memberikan produk dan layanan berkualitas tinggi yang melebihi ekspektasi pelanggan melalui perbaikan berkelanjutan.",
        
        // Advantage Items
        adv_1_title: "Tim Profesional",
        adv_1_desc: "Ahli bersertifikasi dengan pengalaman bertahun-tahun.",
        adv_2_title: "Layanan 24/7",
        adv_2_desc: "Selalu tersedia untuk membantu Anda kapan saja.",
        adv_3_title: "Teknologi Terkini",
        adv_3_desc: "Menggunakan perangkat dan teknologi paling mutakhir.",
        adv_4_title: "Harga Kompetitif",
        adv_4_desc: "Nilai terbaik untuk investasi bisnis Anda.",

        // Infra & Clients
        infra_facility_title: "Fasilitas Kami",
        infra_facility_desc: "Dibangun untuk mendukung operasional mission-critical dengan sistem redundansi penuh.",
        client_trusted_title: "Partner Terpercaya",
        
        // Values
        val_integrity: "INTEGRITAS",
        val_innovation: "INOVASI",
        val_excellence: "KEUNGGULAN",
        val_collab: "KERJASAMA"
    },
    en: {
        // UI
        ui_data: "Data",
        ui_design: "Design",
        ui_export: "Export",
        ui_page: "Page",

        // Content Titles
        title_cover: "COMPANY PROFILE",
        title_foreword: "FOREWORD",
        title_director_speech: "DIRECTOR'S MESSAGE",
        title_about: "ABOUT US",
        title_who: "WHO WE ARE",
        title_history: "COMPANY HISTORY",
        title_legality: "LEGALITY & CERTIFICATION",
        title_compliance: "Compliance & Standardization",
        title_strategy: "STRATEGIC DIRECTION",
        title_vision: "OUR VISION",
        title_mission: "OUR MISSION",
        title_values: "CORE VALUES",
        title_services: "MAIN SERVICES",
        title_advantages: "OUR ADVANTAGES",
        title_infra: "INFRASTRUCTURE & TECHNOLOGY",
        title_clients: "CLIENTS & PARTNERS",
        title_portfolio: "PROJECT PORTFOLIO",
        title_team: "MANAGEMENT TEAM",
        title_contact: "CONTACT US",

        // Placeholders & Defaults
        ph_director_quote: `"We are committed to providing the best solutions for our clients. Our journey is one of innovation and dedication. We believe in sustainable growth and long-term partnerships."`,
        ph_history_1: "Company Establishment. Started with 5 employees.",
        ph_history_2: "National Expansion. Opened 3 new branch offices.",
        ph_history_3: "Global Partnership achieved with various international vendors.",
        ph_legality_desc: "We adhere to international standards and regulations to ensure the highest quality in every service.",
        ph_service_desc: "Complete description of the service. We provide high-quality solutions tailored to your needs.",
        ph_team_role_1: "Chief Executive Officer",
        ph_team_role_2: "Chief Operating Officer",
        ph_contact_map: "Office Location Map",

        // Long Text Defaults
        default_about: "Our company is dedicated to delivering the best solutions in the industry. With years of experience and a team of experts, we deliver excellence in every service.",
        default_vision: "To be a global leader in providing innovative solutions that empower businesses and communities.",
        default_mission: "Deliver high-quality products and services that exceed customer expectations through continuous improvement.",
        
        // Advantage Items
        adv_1_title: "Professional Team",
        adv_1_desc: "Certified experts with years of experience.",
        adv_2_title: "24/7 Service",
        adv_2_desc: "Always available to assist you at any time.",
        adv_3_title: "Latest Technology",
        adv_3_desc: "Using the latest devices and technology.",
        adv_4_title: "Competitive Price",
        adv_4_desc: "Best value for your business investment.",

        // Infra & Clients
        infra_facility_title: "Our Facilities",
        infra_facility_desc: "Built to support mission-critical operations with full redundancy systems.",
        client_trusted_title: "Trusted Partners",

        // Values
        val_integrity: "INTEGRITY",
        val_innovation: "INNOVATION",
        val_excellence: "EXCELLENCE",
        val_collab: "COLLABORATION"
    }
};

const App: React.FC = () => {
  // --- STATE ---
  const [language, setLanguage] = useState<Language>('id'); // Default to Indonesian

  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    tagline: '',
    industry: '',
    about: '',
    vision: '',
    mission: '',
    contact: '',
    directorName: '',
    directorRole: '',
    directorMessage: '',
    history: Array(3).fill({ year: '', event: '' }),
    legalities: Array(3).fill(''),
    values: Array(4).fill(''),
    services: Array(3).fill({ title: '', description: '' }),
    advantages: Array(4).fill({ title: '', description: '' }),
    teamMembers: Array(2).fill({ name: '', role: '' }),
    projects: Array(2).fill({ name: '', description: '' }),
    infrastructure: '',
    clients: Array(8).fill('')
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

  const switchLanguage = (newLang: Language) => {
    if (newLang === language) return;

    const oldDict = DICTIONARY[language];
    const newDict = DICTIONARY[newLang];
    
    // Create a translation map for simple replacements
    const translationMap: Record<string, string> = {};
    
    // Map all values from old dictionary to new dictionary
    Object.keys(oldDict).forEach(key => {
        // @ts-ignore
        const oldText = oldDict[key];
        // @ts-ignore
        const newText = newDict[key];
        if (typeof oldText === 'string' && typeof newText === 'string' && oldText !== newText) {
            translationMap[oldText] = newText;
        }
    });

    // Update all elements on all pages
    setCanvasState(prev => ({
        ...prev,
        pages: prev.pages.map(page => ({
            ...page,
            elements: page.elements.map(el => {
                if (el.type === ElementType.TEXT && translationMap[el.content]) {
                    // Perfect match replacement
                    return { ...el, content: translationMap[el.content] };
                }
                return el;
            })
        }))
    }));

    setLanguage(newLang);
  };

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
    // Get translations based on current language
    const t = DICTIONARY[language];

    const { name, tagline, about, vision, mission, contact } = companyData;
    const safeName = name || 'NAMA PERUSAHAAN';
    const safeTagline = tagline || 'Solusi Terpercaya untuk Masa Depan';
    const safeAbout = about || t.default_about;
    const safeVision = vision || t.default_vision;
    const safeMission = mission || t.default_mission;
    const safeContact = contact || 'Gedung Cyber, Jl. Kuningan Barat No.8 | info@perusahaan.co.id | www.perusahaan.co.id';
    const safeInfra = companyData.infrastructure || t.infra_facility_desc;

    // Data helpers
    const getVal = (idx: number, def: string) => companyData.values?.[idx] || def;
    const getSvc = (idx: number, defT: string, defD: string) => ({
        title: companyData.services?.[idx]?.title || defT,
        desc: companyData.services?.[idx]?.description || defD
    });
    const getAdv = (idx: number, defT: string, defD: string) => ({
        title: companyData.advantages?.[idx]?.title || defT,
        desc: companyData.advantages?.[idx]?.description || defD
    });
    const getHist = (idx: number, defY: string, defE: string) => ({
        year: companyData.history?.[idx]?.year || defY,
        event: companyData.history?.[idx]?.event || defE
    });
    const getLegal = (idx: number, def: string) => companyData.legalities?.[idx] || def;
    const getTeam = (idx: number, defN: string, defR: string) => ({
        name: companyData.teamMembers?.[idx]?.name || defN,
        role: companyData.teamMembers?.[idx]?.role || defR
    });
    const getProj = (idx: number, defN: string, defD: string) => ({
        name: companyData.projects?.[idx]?.name || defN,
        desc: companyData.projects?.[idx]?.description || defD
    });
    const getClient = (idx: number, def: string) => companyData.clients?.[idx] || def;

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
                primary: '#1e293b',   // Slate 800 (Dark Corporate)
                primaryDark: '#0f172a', // Slate 900 (Cover/Back)
                accent: '#2563eb',    // Blue 600 (Professional Blue)
                accentLight: '#dbeafe', // Blue 100
                accentPop: '#f59e0b', // Amber 500 (Highlights)
                textMain: '#334155',  // Slate 700
                textLight: '#64748b', // Slate 500
                bgWhite: '#ffffff',
                bgAlt: '#f8fafc',     // Slate 50
                line: '#e2e8f0'       // Slate 200
            },
            fonts: {
                h1: { fontSize: 32, fontWeight: 'bold', color: '#1e293b' }, // Page Titles
                h2: { fontSize: 22, fontWeight: 'bold', color: '#334155' }, // Section Headers
                h3: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' }, // Sub-headers
                body: { fontSize: 13, color: '#334155', fontWeight: 'normal' },
                caption: { fontSize: 11, color: '#64748b', fontWeight: 'normal' }
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
                { id: generateId(), type: ElementType.TEXT, content: String(pageNum).padStart(2, '0'), x: 700, y: THEME.layout.footerY + 10, width: 44, height: 20, fontSize: 14, fontWeight: 'bold', color: THEME.colors.primary, textAlign: 'right', zIndex: 1 },
            ];
        };

        // 1. Cover (Cover)
        addPage(THEME.colors.primaryDark, [
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 0, y: 0, width: 794, height: 1123, backgroundColor: THEME.colors.primaryDark, zIndex: 0 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 400, y: 0, width: 394, height: 1123, backgroundColor: '#1e293b', zIndex: 0 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 400, width: 694, height: 2, backgroundColor: THEME.colors.accent, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 390, width: 100, height: 4, backgroundColor: THEME.colors.accentPop, zIndex: 2 },
             { id: generateId(), type: ElementType.TEXT, content: t.title_cover, x: 50, y: 350, width: 300, height: 40, fontSize: 18, fontWeight: 'bold', color: THEME.colors.accent, zIndex: 2 },
             { id: generateId(), type: ElementType.TEXT, content: safeName, x: 50, y: 430, width: 694, height: 100, fontSize: 52, fontWeight: 'bold', color: '#ffffff', textAlign: 'left', zIndex: 2 },
             { id: generateId(), type: ElementType.TEXT, content: safeTagline, x: 50, y: 550, width: 500, height: 60, fontSize: 20, color: '#94a3b8', zIndex: 2 },
             { id: generateId(), type: ElementType.TEXT, content: new Date().getFullYear().toString(), x: 50, y: 1000, width: 694, height: 50, fontSize: 16, color: '#64748b', textAlign: 'left', zIndex: 2 },
        ]);

        // 2. Kata Pengantar / Sambutan Direktur
        addPage(THEME.colors.bgWhite, [
             ...createCommonElements(t.title_foreword, 2),
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 160, width: 250, height: 300, backgroundColor: '#e2e8f0', borderRadius: 2, zIndex: 1 }, // Photo Placeholder
             { id: generateId(), type: ElementType.TEXT, content: t.title_director_speech, x: 330, y: 160, width: 400, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: companyData.directorMessage || t.ph_director_quote, x: 330, y: 210, width: 414, height: 200, ...THEME.fonts.body, fontSize: 14, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: companyData.directorName || "Nama Direktur", x: 330, y: 450, width: 200, height: 30, fontSize: 16, fontWeight: 'bold', color: THEME.colors.primary, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: companyData.directorRole || t.ph_team_role_1, x: 330, y: 475, width: 200, height: 20, ...THEME.fonts.caption, zIndex: 1 },
        ]);

        // 3. Profil Singkat Perusahaan
        addPage(THEME.colors.bgAlt, [
             ...createCommonElements(t.title_about, 3),
             { id: generateId(), type: ElementType.TEXT, content: t.title_who, x: 50, y: 160, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: safeAbout, x: 50, y: 200, width: 694, height: 200, ...THEME.fonts.body, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 450, width: 694, height: 400, backgroundColor: '#cbd5e1', borderRadius: 0, zIndex: 1 }, // Image placeholder
        ]);

        // 4. Sejarah Perusahaan
        const h1 = getHist(0, '2003', t.ph_history_1);
        const h2 = getHist(1, '2010', t.ph_history_2);
        const h3 = getHist(2, '2024', t.ph_history_3);

        addPage(THEME.colors.bgWhite, [
             ...createCommonElements(t.title_history, 4),
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 98, y: 160, width: 4, height: 700, backgroundColor: THEME.colors.line, zIndex: 0 },
             
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 90, y: 180, width: 20, height: 20, backgroundColor: THEME.colors.accent, borderRadius: 10, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: h1.year, x: 130, y: 175, width: 100, height: 30, fontSize: 20, fontWeight: 'bold', color: THEME.colors.accent, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: h1.event, x: 130, y: 210, width: 500, height: 50, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 90, y: 380, width: 20, height: 20, backgroundColor: THEME.colors.primary, borderRadius: 10, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: h2.year, x: 130, y: 375, width: 100, height: 30, fontSize: 20, fontWeight: 'bold', color: THEME.colors.primary, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: h2.event, x: 130, y: 410, width: 500, height: 50, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 90, y: 580, width: 20, height: 20, backgroundColor: THEME.colors.accentPop, borderRadius: 10, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: h3.year, x: 130, y: 575, width: 100, height: 30, fontSize: 20, fontWeight: 'bold', color: THEME.colors.accentPop, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: h3.event, x: 130, y: 610, width: 500, height: 50, ...THEME.fonts.body, zIndex: 1 },
        ]);

        // 5. Legalitas & Sertifikasi
        const l1 = getLegal(0, "Surat Izin Usaha");
        const l2 = getLegal(1, "ISO 9001:2015");
        const l3 = getLegal(2, "Certification");

        addPage(THEME.colors.bgAlt, [
             ...createCommonElements(t.title_legality, 5),
             { id: generateId(), type: ElementType.TEXT, content: t.title_compliance, x: 50, y: 160, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: t.ph_legality_desc, x: 50, y: 200, width: 600, height: 40, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 260, width: 200, height: 150, backgroundColor: '#ffffff', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: l1, x: 75, y: 325, width: 150, height: 20, fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: THEME.colors.primary, zIndex: 2 },
             
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 297, y: 260, width: 200, height: 150, backgroundColor: '#ffffff', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: l2, x: 322, y: 325, width: 150, height: 20, fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: THEME.colors.primary, zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 544, y: 260, width: 200, height: 150, backgroundColor: '#ffffff', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: l3, x: 569, y: 325, width: 150, height: 20, fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: THEME.colors.primary, zIndex: 2 },
        ]);

        // 6. Visi & Misi
        addPage(THEME.colors.bgWhite, [
             ...createCommonElements(t.title_strategy, 6),
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 160, width: 694, height: 220, backgroundColor: THEME.colors.accentLight, borderRadius: 4, zIndex: 0 },
             { id: generateId(), type: ElementType.TEXT, content: t.title_vision, x: 80, y: 190, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: safeVision, x: 80, y: 230, width: 634, height: 120, ...THEME.fonts.body, fontSize: 16, zIndex: 1 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 400, width: 694, height: 220, backgroundColor: THEME.colors.bgAlt, borderRadius: 4, zIndex: 0 },
             { id: generateId(), type: ElementType.TEXT, content: t.title_mission, x: 80, y: 430, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: safeMission, x: 80, y: 470, width: 634, height: 120, ...THEME.fonts.body, fontSize: 16, zIndex: 1 },
        ]);

        // 7. Nilai Perusahaan
        const v1 = getVal(0, t.val_integrity);
        const v2 = getVal(1, t.val_innovation);
        const v3 = getVal(2, t.val_excellence);
        const v4 = getVal(3, t.val_collab);

        addPage(THEME.colors.bgAlt, [
             ...createCommonElements(t.title_values, 7),
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 160, width: 330, height: 180, backgroundColor: THEME.colors.primary, borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: v1, x: 70, y: 235, width: 290, height: 30, fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 414, y: 160, width: 330, height: 180, backgroundColor: THEME.colors.accent, borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: v2, x: 434, y: 235, width: 290, height: 30, fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 360, width: 330, height: 180, backgroundColor: '#475569', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: v3, x: 70, y: 435, width: 290, height: 30, fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 414, y: 360, width: 330, height: 180, backgroundColor: '#94a3b8', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: v4, x: 434, y: 435, width: 290, height: 30, fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 2 },
        ]);

        // 8. Layanan Utama
        const s1 = getSvc(0, "01. Service Name", t.ph_service_desc);
        const s2 = getSvc(1, "02. Service Name", t.ph_service_desc);
        const s3 = getSvc(2, "03. Service Name", t.ph_service_desc);

        addPage(THEME.colors.bgWhite, [
             ...createCommonElements(t.title_services, 8),
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 160, width: 694, height: 1, backgroundColor: THEME.colors.line, zIndex: 0 },
             { id: generateId(), type: ElementType.TEXT, content: s1.title, x: 50, y: 180, width: 400, height: 30, ...THEME.fonts.h2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: s1.desc, x: 50, y: 220, width: 600, height: 60, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 300, width: 694, height: 1, backgroundColor: THEME.colors.line, zIndex: 0 },
             { id: generateId(), type: ElementType.TEXT, content: s2.title, x: 50, y: 320, width: 400, height: 30, ...THEME.fonts.h2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: s2.desc, x: 50, y: 360, width: 600, height: 60, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 440, width: 694, height: 1, backgroundColor: THEME.colors.line, zIndex: 0 },
             { id: generateId(), type: ElementType.TEXT, content: s3.title, x: 50, y: 460, width: 400, height: 30, ...THEME.fonts.h2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: s3.desc, x: 50, y: 500, width: 600, height: 60, ...THEME.fonts.body, zIndex: 1 },
        ]);

        // 9. Keunggulan Perusahaan
        const a1 = getAdv(0, t.adv_1_title, t.adv_1_desc);
        const a2 = getAdv(1, t.adv_2_title, t.adv_2_desc);
        const a3 = getAdv(2, t.adv_3_title, t.adv_3_desc);
        const a4 = getAdv(3, t.adv_4_title, t.adv_4_desc);

        addPage(THEME.colors.bgAlt, [
             ...createCommonElements(t.title_advantages, 9),
             { id: generateId(), type: ElementType.TEXT, content: a1.title, x: 50, y: 160, width: 300, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: a1.desc, x: 50, y: 190, width: 300, height: 60, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.TEXT, content: a2.title, x: 400, y: 160, width: 300, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: a2.desc, x: 400, y: 190, width: 300, height: 60, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.TEXT, content: a3.title, x: 50, y: 280, width: 300, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: a3.desc, x: 50, y: 310, width: 300, height: 60, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.TEXT, content: a4.title, x: 400, y: 280, width: 300, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: a4.desc, x: 400, y: 310, width: 300, height: 60, ...THEME.fonts.body, zIndex: 1 },
        ]);

        // 10. Infrastruktur / Teknologi
        addPage(THEME.colors.bgWhite, [
             ...createCommonElements(t.title_infra, 10),
             { id: generateId(), type: ElementType.TEXT, content: t.infra_facility_title, x: 50, y: 160, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: safeInfra, x: 50, y: 200, width: 600, height: 40, ...THEME.fonts.body, zIndex: 1 },
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 250, width: 694, height: 400, backgroundColor: '#cbd5e1', borderRadius: 0, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: "Photo Data Center / Infrastructure", x: 50, y: 660, width: 300, height: 20, ...THEME.fonts.caption, zIndex: 1 },
        ]);

        // 11. Klien & Partner
        addPage(THEME.colors.bgAlt, [
             ...createCommonElements(t.title_clients, 11),
             { id: generateId(), type: ElementType.TEXT, content: t.client_trusted_title, x: 50, y: 160, width: 600, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             
             // Client Logo Grid
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 220, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: getClient(0, "CLIENT 1"), x: 50, y: 250, width: 150, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#94a3b8', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 231, y: 220, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: getClient(1, "CLIENT 2"), x: 231, y: 250, width: 150, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#94a3b8', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 412, y: 220, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: getClient(2, "CLIENT 3"), x: 412, y: 250, width: 150, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#94a3b8', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 593, y: 220, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: getClient(3, "CLIENT 4"), x: 593, y: 250, width: 150, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#94a3b8', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 320, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: getClient(4, "CLIENT 5"), x: 50, y: 350, width: 150, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#94a3b8', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 231, y: 320, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: getClient(5, "CLIENT 6"), x: 231, y: 350, width: 150, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#94a3b8', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 412, y: 320, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: getClient(6, "CLIENT 7"), x: 412, y: 350, width: 150, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#94a3b8', zIndex: 2 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 593, y: 320, width: 150, height: 80, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: getClient(7, "CLIENT 8"), x: 593, y: 350, width: 150, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#94a3b8', zIndex: 2 },
        ]);

        // 12. Portofolio Proyek
        const p1 = getProj(0, "Project Name A", "Description of project A.");
        const p2 = getProj(1, "Project Name B", "Description of project B.");

        addPage(THEME.colors.bgWhite, [
             ...createCommonElements(t.title_portfolio, 12),
             
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 160, width: 330, height: 200, backgroundColor: '#cbd5e1', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: p1.name, x: 50, y: 370, width: 330, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: p1.desc, x: 50, y: 400, width: 330, height: 40, ...THEME.fonts.body, zIndex: 1 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 414, y: 160, width: 330, height: 200, backgroundColor: '#cbd5e1', borderRadius: 2, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: p2.name, x: 414, y: 370, width: 330, height: 30, ...THEME.fonts.h3, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: p2.desc, x: 414, y: 400, width: 330, height: 40, ...THEME.fonts.body, zIndex: 1 },
        ]);

        // 13. Tim Manajemen
        const tm1 = getTeam(0, "Full Name", t.ph_team_role_1);
        const tm2 = getTeam(1, "Full Name", t.ph_team_role_2);

        addPage(THEME.colors.bgAlt, [
             ...createCommonElements(t.title_team, 13),
             
             { id: generateId(), type: ElementType.SHAPE, content: '', x: 150, y: 200, width: 150, height: 150, backgroundColor: '#ffffff', borderRadius: 75, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: tm1.name, x: 125, y: 360, width: 200, height: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: THEME.colors.primary, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: tm1.role, x: 125, y: 390, width: 200, height: 20, fontSize: 14, textAlign: 'center', color: THEME.colors.textLight, zIndex: 1 },

             { id: generateId(), type: ElementType.SHAPE, content: '', x: 500, y: 200, width: 150, height: 150, backgroundColor: '#ffffff', borderRadius: 75, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: tm2.name, x: 475, y: 360, width: 200, height: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: THEME.colors.primary, zIndex: 1 },
             { id: generateId(), type: ElementType.TEXT, content: tm2.role, x: 475, y: 390, width: 200, height: 20, fontSize: 14, textAlign: 'center', color: THEME.colors.textLight, zIndex: 1 },
        ]);

        // 14. Kontak & Lokasi (Back Cover)
        addPage(THEME.colors.primaryDark, [
            { id: generateId(), type: ElementType.SHAPE, content: '', x: 0, y: 0, width: 794, height: 1123, backgroundColor: THEME.colors.primaryDark, zIndex: 0 },
            
            { id: generateId(), type: ElementType.TEXT, content: t.title_contact, x: 50, y: 100, width: 694, height: 60, fontSize: 48, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 1 },
            { id: generateId(), type: ElementType.SHAPE, content: '', x: 347, y: 180, width: 100, height: 4, backgroundColor: THEME.colors.accent, zIndex: 1 },
            
            { id: generateId(), type: ElementType.TEXT, content: safeContact, x: 100, y: 250, width: 594, height: 200, fontSize: 18, color: '#e2e8f0', textAlign: 'center', zIndex: 1 },
            
            { id: generateId(), type: ElementType.SHAPE, content: '', x: 100, y: 500, width: 594, height: 400, backgroundColor: '#1e293b', zIndex: 1 }, // Map Placeholder
            { id: generateId(), type: ElementType.TEXT, content: t.ph_contact_map, x: 100, y: 700, width: 594, height: 30, fontSize: 14, color: '#64748b', textAlign: 'center', zIndex: 2 },
            
            { id: generateId(), type: ElementType.TEXT, content: "www.perusahaan.co.id", x: 50, y: 1000, width: 694, height: 30, fontSize: 16, color: '#64748b', textAlign: 'center', zIndex: 1 },
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

      elements.push({ id: generateId(), type: ElementType.TEXT, content: t.title_about, x: 300, y: 60, width: 400, height: 40, fontSize: 36, fontWeight: 'bold', color: '#0f172a', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 300, y: 110, width: 60, height: 6, backgroundColor: '#3b82f6', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeAbout, x: 300, y: 140, width: 440, height: 200, fontSize: 14, color: '#334155', zIndex: 1 });

      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 300, y: 400, width: 440, height: 250, backgroundColor: '#f8fafc', borderRadius: 10, zIndex: 0 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: t.title_vision, x: 320, y: 420, width: 400, height: 30, fontSize: 20, fontWeight: 'bold', color: '#0f172a', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeVision, x: 320, y: 460, width: 400, height: 150, fontSize: 14, color: '#475569', zIndex: 1 });

      elements.push({ id: generateId(), type: ElementType.TEXT, content: t.title_mission, x: 320, y: 680, width: 400, height: 30, fontSize: 20, fontWeight: 'bold', color: '#0f172a', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeMission, x: 320, y: 720, width: 440, height: 150, fontSize: 14, color: '#475569', zIndex: 1 });
    
    } else if (layoutType === AutoLayoutType.CLASSIC_HEADER) {
      bgColor = '#ffffff';
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 0, y: 0, width: 794, height: 200, backgroundColor: '#1e3a8a', zIndex: 0 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeName, x: 50, y: 60, width: 694, height: 60, fontSize: 40, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeTagline, x: 150, y: 120, width: 494, height: 40, fontSize: 16, color: '#bfdbfe', textAlign: 'center', zIndex: 1 });

      elements.push({ id: generateId(), type: ElementType.TEXT, content: t.title_cover, x: 50, y: 250, width: 694, height: 30, fontSize: 14, fontWeight: 'bold', color: '#94a3b8', textAlign: 'center', zIndex: 1 });
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
      elements.push({ id: generateId(), type: ElementType.TEXT, content: t.title_who, x: 50, y: 350, width: 200, height: 30, fontSize: 14, fontWeight: 'bold', color: '#ea580c', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeAbout, x: 50, y: 390, width: 694, height: 120, fontSize: 16, color: '#d1d5db', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "THE FUTURE", x: 50, y: 550, width: 200, height: 30, fontSize: 14, fontWeight: 'bold', color: '#ea580c', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeVision, x: 50, y: 590, width: 330, height: 200, fontSize: 14, color: '#d1d5db', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "THE PATH", x: 414, y: 550, width: 200, height: 30, fontSize: 14, fontWeight: 'bold', color: '#ea580c', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeMission, x: 414, y: 590, width: 330, height: 200, fontSize: 14, color: '#d1d5db', zIndex: 1 });
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 550, y: 850, width: 400, height: 400, backgroundColor: '#374151', borderRadius: 200, zIndex: 0 });

    } else if (layoutType === AutoLayoutType.COVER_MODERN) {
      bgColor = '#0f172a'; // Deep Slate Background
      
      // 1. Watermark Year (Huge, Low Opacity)
      elements.push({ id: generateId(), type: ElementType.TEXT, content: new Date().getFullYear().toString(), x: 300, y: 0, width: 600, height: 250, fontSize: 250, fontWeight: 'bold', color: '#1e293b', opacity: 0.5, zIndex: 0 });

      // 2. Main Image Area (Top Right Quadrant)
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 150, y: 0, width: 644, height: 800, backgroundColor: '#1e293b', zIndex: 0 }); // Placeholder for photo
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "INSERT COVER PHOTO", x: 300, y: 380, width: 300, height: 30, fontSize: 16, color: '#475569', textAlign: 'center', zIndex: 1 });

      // 3. Left Accent Strip
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 50, y: 0, width: 50, height: 600, backgroundColor: '#3b82f6', zIndex: 1 }); // Blue Vertical

      // 4. Hero Content Box (Overlapping image and background)
      // Semi-transparent overlay box for text contrast
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 80, y: 500, width: 600, height: 450, backgroundColor: '#0f172a', opacity: 0.95, zIndex: 2 });
      
      // 5. Typography Hierarchy
      // "COMPANY" (Light)
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "COMPANY", x: 120, y: 540, width: 500, height: 50, fontSize: 42, fontWeight: 'normal', color: '#94a3b8', zIndex: 3 });
      // "PROFILE" (Bold)
      elements.push({ id: generateId(), type: ElementType.TEXT, content: "PROFILE", x: 120, y: 590, width: 500, height: 70, fontSize: 64, fontWeight: 'bold', color: '#ffffff', zIndex: 3 });
      
      // Accent Line
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 120, y: 680, width: 80, height: 6, backgroundColor: '#f59e0b', zIndex: 3 }); // Amber accent

      // Company Name (Hero)
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeName, x: 120, y: 720, width: 520, height: 100, fontSize: 32, fontWeight: 'bold', color: '#f59e0b', zIndex: 3 });
      
      // Tagline
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeTagline, x: 120, y: 800, width: 500, height: 60, fontSize: 18, color: '#cbd5e1', zIndex: 3 });

      // 6. Footer / Website
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 680, y: 900, width: 114, height: 223, backgroundColor: '#1e293b', zIndex: 2 });
      // Rotated text simulation (Stacked characters or just vertical placement) - since we don't have rotation yet, we use a clean bottom bar instead.
      elements.push({ id: generateId(), type: ElementType.SHAPE, content: '', x: 0, y: 1050, width: 794, height: 73, backgroundColor: '#ffffff', zIndex: 2 });
      elements.push({ id: generateId(), type: ElementType.TEXT, content: safeContact.split('|')[0] || 'www.company.com', x: 50, y: 1075, width: 694, height: 30, fontSize: 14, color: '#0f172a', textAlign: 'right', fontWeight: 'bold', zIndex: 3 });

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
        pages={canvasState.pages}
        language={language}
        setLanguage={switchLanguage}
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
                  {DICTIONARY[language].ui_page} {activePageIndex + 1} / {canvasState.pages.length}
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
                    {/* SORT ELEMENTS BY Z-INDEX FOR DISPLAY */}
                    {activeElements
                        .slice()
                        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                        .map(el => (
                            <DraggableElement 
                                key={el.id}
                                element={el}
                                isSelected={el.id === canvasState.selectedId}
                                onSelect={handleSelectElement}
                                onMouseDown={handleMouseDown}
                            />
                    ))}
                    
                    {/* Print/Safety Margins Overlay */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none border border-red-100 opacity-0 hover:opacity-100 transition-opacity" style={{ zIndex: 9999 }}>
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