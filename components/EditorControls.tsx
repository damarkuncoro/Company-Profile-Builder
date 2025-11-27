import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CanvasElement, ElementType, CompanyData, TemplateType, AutoLayoutType, Page } from '../types';
import { generateCompanyContent } from '../services/geminiService';
import { DraggableElement } from './DraggableElement';
import { 
  Type, Image as ImageIcon, Box, Layout, Sparkles, 
  AlignLeft, AlignCenter, AlignRight, Trash2, Download, Printer, Plus,
  Layers, Hexagon, Database, Wand2, FileStack, XCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface EditorControlsProps {
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  addElement: (type: ElementType, content?: string) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectedElement: CanvasElement | undefined;
  setBackgroundColor: (color: string) => void;
  setBackgroundImage: (url: string) => void;
  applyTemplate: (type: TemplateType) => void;
  generateAutoDesign: (type: AutoLayoutType) => void;
  pages: Page[];
}

const CAKRAMEDIA_DATA: CompanyData = {
  name: "PT. Cakramedia Indocyber",
  tagline: "Solusi Teknologi Handal & Terintegrasi",
  industry: "Information & Communication Technology (ICT)",
  about: "PT. Cakramedia Indocyber adalah perusahaan yang bergerak di bidang Information & Communication Technology (ICT) yang telah berdiri sejak tahun 2003. Sejak tahun 2006, Cakramedia resmi menjadi Internet Service Provider (ISP) dengan izin Dirjen Postel dan terdaftar sebagai anggota APJII.",
  vision: "Menjadi penyedia solusi teknologi informasi dan komunikasi terdepan di Indonesia yang mendukung transformasi digital bisnis secara berkelanjutan.",
  mission: "Memberikan layanan berkualitas tinggi dengan fokus pada kepuasan pelanggan. Menghadirkan solusi teknologi yang aman, stabil, dan efisien. Mengembangkan infrastruktur jaringan yang andal dan berkelanjutan.",
  contact: "Gedung Cyber, Jakarta Selatan | info@cakramedia.co.id"
};

export const EditorControls: React.FC<EditorControlsProps> = ({
  companyData,
  setCompanyData,
  addElement,
  updateElement,
  deleteElement,
  selectedElement,
  setBackgroundColor,
  setBackgroundImage,
  applyTemplate,
  generateAutoDesign,
  pages
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'settings'>('content');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  // Automatically switch to Design tab when an element is selected
  useEffect(() => {
    if (selectedElement) {
      setActiveTab('design');
    }
  }, [selectedElement]);

  const handleAIAutoFill = async () => {
    if (!companyData.name || !companyData.industry) {
      alert("Please enter Company Name and Industry first.");
      return;
    }
    setIsGenerating(true);
    const generated = await generateCompanyContent(companyData.name, companyData.industry);
    if (generated) {
      setCompanyData(prev => ({
        ...prev,
        vision: generated.vision,
        mission: generated.mission,
        about: generated.about
      }));
    }
    setIsGenerating(false);
  };

  const handleExportPDF = async () => {
    const input = document.getElementById('canvas-area');
    if (!input) return;

    // Temporarily remove scale transform for capture
    const originalTransform = input.style.transform;
    input.style.transform = 'none';
    
    // Slight delay to allow DOM to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const canvas = await html2canvas(input, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            backgroundColor: null,
            scrollX: 0,
            scrollY: 0
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${companyData.name.replace(/\s+/g, '_')}_Page.pdf`);
    } catch (err) {
        console.error("PDF Export failed", err);
        alert("Could not export PDF.");
    } finally {
        input.style.transform = originalTransform;
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    // Increased delay to ensure images load and portal renders correctly
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!exportContainerRef.current) {
        setIsExporting(false);
        return;
    }

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const pageNodes = Array.from(exportContainerRef.current.children);

        for (let i = 0; i < pageNodes.length; i++) {
            const pageNode = pageNodes[i] as HTMLElement;
            
            // Capture the page
            const canvas = await html2canvas(pageNode, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: null,
                scrollX: 0,
                scrollY: 0,
                onclone: (documentClone) => {
                   // Ensure fonts are visible if problematic
                   const el = documentClone.getElementById(pageNode.id);
                   if (el) el.style.visibility = 'visible';
                }
            });

            const imgData = canvas.toDataURL('image/png');

            if (i > 0) {
                pdf.addPage();
            }
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }

        pdf.save(`${companyData.name.replace(/\s+/g, '_') || 'Company'}_FullProfile.pdf`);

    } catch (error) {
        console.error("Full export failed:", error);
        alert("Failed to export all pages.");
    } finally {
        setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: ElementType | 'bg' = ElementType.IMAGE) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'bg') {
            setBackgroundImage(reader.result as string);
        } else {
            addElement(type as ElementType, reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shadow-xl z-20 no-print">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('content')} 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Data
        </button>
        <button 
          onClick={() => setActiveTab('design')} 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'design' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Design
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Export
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* DATA TAB */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <button 
                onClick={() => setCompanyData(CAKRAMEDIA_DATA)}
                className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs py-2 rounded flex items-center justify-center gap-2 mb-2"
            >
                <Database size={14} /> Load Sample (PT. Cakramedia)
            </button>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h3 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1">
                <Sparkles size={12} /> AI Generator
              </h3>
              <p className="text-xs text-blue-600 mb-3">
                Fill Name & Industry, then click generate to autofill descriptions.
              </p>
              <button 
                onClick={handleAIAutoFill}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Thinking...' : 'Generate Content'} <Sparkles size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tagline</label>
                <input 
                  type="text" 
                  value={companyData.tagline}
                  onChange={(e) => setCompanyData({...companyData, tagline: e.target.value})}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Innovating the future..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Industry</label>
                <input 
                  type="text" 
                  value={companyData.industry}
                  onChange={(e) => setCompanyData({...companyData, industry: e.target.value})}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Technology, Food, etc."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">About Us</label>
                <textarea 
                  value={companyData.about}
                  onChange={(e) => setCompanyData({...companyData, about: e.target.value})}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none h-20 resize-none"
                  placeholder="Short description of your company..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Vision</label>
                <textarea 
                  value={companyData.vision}
                  onChange={(e) => setCompanyData({...companyData, vision: e.target.value})}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none h-20 resize-none"
                />
              </div>
               <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mission</label>
                <textarea 
                  value={companyData.mission}
                  onChange={(e) => setCompanyData({...companyData, mission: e.target.value})}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none h-20 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Info</label>
                <textarea 
                  value={companyData.contact}
                  onChange={(e) => setCompanyData({...companyData, contact: e.target.value})}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none h-16 resize-none"
                />
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-2">ADD TO CANVAS</p>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => addElement(ElementType.TEXT, companyData.name || "Company Name")} className="flex items-center gap-2 text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded text-gray-700">
                        <Type size={14} /> Name
                    </button>
                    <button onClick={() => addElement(ElementType.TEXT, companyData.vision || "Vision Statement")} className="flex items-center gap-2 text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded text-gray-700">
                        <Type size={14} /> Vision
                    </button>
                    <button onClick={() => addElement(ElementType.TEXT, "Heading")} className="flex items-center gap-2 text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded text-gray-700">
                        <Type size={14} /> Heading
                    </button>
                    <button onClick={() => addElement(ElementType.TEXT, "Body text goes here...")} className="flex items-center gap-2 text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded text-gray-700">
                        <Type size={14} /> Paragraph
                    </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DESIGN TAB */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            
            {/* 1. Selection Properties - MOVED TO TOP FOR IMMEDIATE EDITING */}
            {selectedElement ? (
              <div className="space-y-3 p-3 bg-blue-50 rounded border border-blue-200 animate-in fade-in slide-in-from-right-4 duration-300 shadow-sm">
                 <div className="flex justify-between items-center mb-2 border-b border-blue-200 pb-2">
                    <h3 className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1">
                        <Wand2 size={12} /> Edit Properties
                    </h3>
                    <button onClick={() => deleteElement(selectedElement.id)} className="text-red-500 hover:text-red-700 bg-white p-1 rounded border border-red-100 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                    </button>
                 </div>
                 
                 {/* Position/Size */}
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase">Width</label>
                        <input type="number" value={selectedElement.width} onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} className="w-full text-xs p-1 border rounded bg-white" />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase">Height</label>
                        <input type="number" value={selectedElement.height} onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} className="w-full text-xs p-1 border rounded bg-white" />
                    </div>
                 </div>

                 {/* Text Props */}
                 {selectedElement.type === ElementType.TEXT && (
                     <>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase">Content</label>
                            <textarea value={selectedElement.content} onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })} className="w-full text-xs p-1 border rounded resize-y bg-white" rows={3} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase">Size</label>
                                <input type="number" value={selectedElement.fontSize || 16} onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })} className="w-full text-xs p-1 border rounded bg-white" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase">Color</label>
                                <input type="color" value={selectedElement.color || '#000000'} onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })} className="w-full h-6 p-0 border rounded cursor-pointer" />
                            </div>
                        </div>
                        <div className="flex gap-1 bg-white p-1 rounded border border-gray-200 justify-center">
                            <button onClick={() => updateElement(selectedElement.id, { textAlign: 'left' })} className={`p-1 rounded ${selectedElement.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}><AlignLeft size={14}/></button>
                            <button onClick={() => updateElement(selectedElement.id, { textAlign: 'center' })} className={`p-1 rounded ${selectedElement.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}><AlignCenter size={14}/></button>
                            <button onClick={() => updateElement(selectedElement.id, { textAlign: 'right' })} className={`p-1 rounded ${selectedElement.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}><AlignRight size={14}/></button>
                        </div>
                     </>
                 )}

                 {/* Shape Props */}
                 {selectedElement.type === ElementType.SHAPE && (
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase">Color</label>
                        <input type="color" value={selectedElement.backgroundColor || '#cccccc'} onChange={(e) => updateElement(selectedElement.id, { backgroundColor: e.target.value })} className="w-full h-8 p-0 border rounded cursor-pointer" />
                        <label className="text-[10px] text-gray-500 uppercase mt-2 block">Rounded</label>
                        <input type="range" min="0" max="100" value={selectedElement.borderRadius || 0} onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })} className="w-full" />
                    </div>
                 )}

                 {/* Logo & Image Props */}
                 {(selectedElement.type === ElementType.LOGO || selectedElement.type === ElementType.IMAGE) && (
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase mt-2 block">Opacity: {Math.round((selectedElement.opacity ?? 1) * 100)}%</label>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={selectedElement.opacity ?? 1} 
                            onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })} 
                            className="w-full" 
                        />
                        
                        <label className="text-[10px] text-gray-500 uppercase mt-2 block">Corner Radius: {selectedElement.borderRadius || 0}px</label>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={selectedElement.borderRadius || 0} 
                            onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })} 
                            className="w-full" 
                        />
                    </div>
                 )}

                 <div className="pt-2 border-t border-blue-200 mt-2">
                    <label className="text-[10px] text-gray-500 uppercase">Layering</label>
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => updateElement(selectedElement.id, { zIndex: (selectedElement.zIndex || 1) + 1 })} className="flex-1 bg-white border border-gray-200 text-xs py-1 rounded hover:bg-gray-50">Bring Fwd</button>
                        <button onClick={() => updateElement(selectedElement.id, { zIndex: Math.max(0, (selectedElement.zIndex || 1) - 1) })} className="flex-1 bg-white border border-gray-200 text-xs py-1 rounded hover:bg-gray-50">Send Back</button>
                    </div>
                 </div>
              </div>
            ) : (
                <div className="text-center text-gray-400 text-xs py-2 border border-dashed border-gray-300 rounded mb-4 bg-gray-50">
                    Select an element on canvas to edit properties
                </div>
            )}

            {/* 2. Elements Section */}
            <div className="space-y-2">
               <h3 className="text-xs font-bold text-gray-900 uppercase">Add Elements</h3>
               <div className="grid grid-cols-3 gap-2">
                 <button onClick={() => addElement(ElementType.SHAPE)} className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                    <Box className="text-gray-600 mb-1" size={20} />
                    <span className="text-xs text-gray-600">Shape</span>
                 </button>
                 <label className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer">
                    <ImageIcon className="text-gray-600 mb-1" size={20} />
                    <span className="text-xs text-gray-600">Image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, ElementType.IMAGE)} />
                 </label>
                 <label className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer">
                    <Hexagon className="text-gray-600 mb-1" size={20} />
                    <span className="text-xs text-gray-600">Logo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, ElementType.LOGO)} />
                 </label>
               </div>
            </div>

            {/* 3. Auto Design Section */}
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-3 rounded-lg border border-violet-100">
                <h3 className="text-xs font-bold text-violet-800 uppercase mb-2 flex items-center gap-1">
                    <Wand2 size={12} /> Auto-Generate Design
                </h3>
                <p className="text-[10px] text-violet-600 mb-2">
                    Automatically create a layout using your entered data.
                </p>
                <div className="space-y-2">
                    <button onClick={() => generateAutoDesign(AutoLayoutType.MULTI_PAGE_CORPORATE)} className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 p-2 rounded text-xs transition-colors shadow-sm">
                        <Layers size={14} /> Full Profile (14 Pages)
                    </button>
                    <button onClick={() => generateAutoDesign(AutoLayoutType.COVER_MODERN)} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 p-2 rounded text-xs transition-colors">
                        <Layout size={14} /> Professional Cover
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => generateAutoDesign(AutoLayoutType.MODERN_SIDEBAR)} className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-violet-100 text-violet-700 border border-violet-200 p-2 rounded text-xs transition-colors">
                            <Layout size={14} /> Sidebar
                        </button>
                        <button onClick={() => generateAutoDesign(AutoLayoutType.CLASSIC_HEADER)} className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-violet-100 text-violet-700 border border-violet-200 p-2 rounded text-xs transition-colors">
                            <Layout size={14} /> Classic
                        </button>
                    </div>
                    <button onClick={() => generateAutoDesign(AutoLayoutType.BOLD_GEOMETRIC)} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-violet-100 text-violet-700 border border-violet-200 p-2 rounded text-xs transition-colors">
                        <Layout size={14} /> Bold Geometric
                    </button>
                </div>
            </div>

            {/* 4. Background Settings */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
               <h3 className="text-xs font-bold text-gray-900 uppercase">Background</h3>
               <div className="flex items-center gap-2">
                 <input type="color" onChange={(e) => setBackgroundColor(e.target.value)} className="h-8 w-8 p-0 border-0 rounded overflow-hidden cursor-pointer" />
                 <span className="text-xs text-gray-600">Color</span>
               </div>
               <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded hover:bg-gray-100 border border-gray-200">
                  <ImageIcon size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-600">Upload Image</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bg')} />
               </label>
            </div>
          </div>
        )}

        {/* SETTINGS / TEMPLATES TAB */}
        {activeTab === 'settings' && (
           <div className="space-y-6">
               <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-900 uppercase">Templates</h3>
                <button onClick={() => applyTemplate(TemplateType.CORPORATE)} className="w-full text-left p-3 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition-all mb-2 group">
                    <div className="font-semibold text-sm text-gray-800 group-hover:text-blue-700">Corporate Blue</div>
                    <div className="text-xs text-gray-500">Professional & Clean</div>
                </button>
                <button onClick={() => applyTemplate(TemplateType.CREATIVE)} className="w-full text-left p-3 border border-gray-200 rounded hover:border-purple-500 hover:bg-purple-50 transition-all mb-2 group">
                    <div className="font-semibold text-sm text-gray-800 group-hover:text-purple-700">Creative Studio</div>
                    <div className="text-xs text-gray-500">Bold & Modern</div>
                </button>
                <button onClick={() => applyTemplate(TemplateType.STARTUP)} className="w-full text-left p-3 border border-gray-200 rounded hover:border-green-500 hover:bg-green-50 transition-all group">
                    <div className="font-semibold text-sm text-gray-800 group-hover:text-green-700">Tech Startup</div>
                    <div className="text-xs text-gray-500">Minimalist Dark</div>
                </button>
               </div>

               <div className="space-y-2 pt-6 border-t border-gray-200">
                  <h3 className="text-xs font-bold text-gray-900 uppercase">Actions</h3>
                  <button onClick={handleExportAll} disabled={isExporting} className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                      <FileStack size={16} /> {isExporting ? 'Exporting...' : 'Export All Pages PDF'}
                  </button>
                  <button onClick={handleExportPDF} className="w-full bg-white text-gray-700 border border-gray-300 py-2 rounded flex items-center justify-center gap-2 text-sm hover:bg-gray-50 transition-colors shadow-sm">
                      <Download size={16} /> Export Active Page PDF
                  </button>
                  <button onClick={handlePrint} className="w-full bg-gray-800 text-white py-2 rounded flex items-center justify-center gap-2 text-sm hover:bg-gray-900 transition-colors shadow-sm">
                      <Printer size={16} /> Print Mode
                  </button>
               </div>
               
               <div className="mt-8 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <p className="font-bold mb-1">Print Friendly Tips:</p>
                  <ul className="list-disc pl-3 space-y-1">
                      <li>Use High-Res Images</li>
                      <li>Keep important text away from edges (Bleed)</li>
                      <li>Standard A4 size (210x297mm)</li>
                  </ul>
               </div>
           </div>
        )}

      </div>

      {/* Hidden Container for Multi-Page Export Rendering (Portal to Body) */}
      {isExporting && createPortal(
          <div 
            ref={exportContainerRef}
            style={{ 
                position: 'fixed', 
                left: '-10000px', 
                top: 0, 
                zIndex: -1000,
                // Ensure the container itself doesn't constrain children
                width: 'auto',
                height: 'auto'
            }}
          >
              {pages.map(page => (
                  <div 
                    key={page.id}
                    id={page.id}
                    className="bg-white" // Ensure standard background class match
                    style={{
                        width: '794px', // A4 pixel width @ 96 DPI
                        height: '1123px',
                        backgroundColor: page.backgroundColor,
                        backgroundImage: page.backgroundImage ? `url(${page.backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        // Explicitly clear text styles that might inherit from body
                        textAlign: 'left',
                    }}
                  >
                      {/* SORT ELEMENTS BY Z-INDEX FOR EXPORT */}
                      {page.elements
                          .slice()
                          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                          .map(el => (
                            <DraggableElement 
                                key={el.id}
                                element={el}
                                isSelected={false}
                                onSelect={() => {}}
                                onMouseDown={() => {}}
                            />
                      ))}
                  </div>
              ))}
          </div>,
          document.body
      )}
    </div>
  );
};