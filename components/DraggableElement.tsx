import React from 'react';
import { CanvasElement, ElementType } from '../types';
import { Move } from 'lucide-react';

interface DraggableElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  isSelected,
  onSelect,
  onMouseDown,
}) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: element.type === ElementType.TEXT ? 'auto' : `${element.height}px`,
    zIndex: element.zIndex,
    cursor: isSelected ? 'move' : 'pointer',
    opacity: element.opacity ?? 1,
    border: isSelected ? '2px solid #3b82f6' : '1px dashed transparent',
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
    onMouseDown(e, element.id);
  };

  const renderContent = () => {
    switch (element.type) {
      case ElementType.TEXT:
        return (
          <div
            style={{
              fontSize: `${element.fontSize || 16}px`,
              fontWeight: element.fontWeight || 'normal',
              color: element.color || '#000000',
              textAlign: element.textAlign || 'left',
              width: '100%',
              userSelect: 'none',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5', // Enforce consistent line height for export
              fontFamily: 'Inter, sans-serif', // Enforce font family
              letterSpacing: 'normal',
              wordBreak: 'break-word'
            }}
          >
            {element.content}
          </div>
        );
      case ElementType.IMAGE:
      case ElementType.LOGO:
        return (
          <img
            src={element.content}
            alt="element"
            className="w-full h-full object-cover pointer-events-none"
            style={{ borderRadius: element.borderRadius }}
          />
        );
      case ElementType.SHAPE:
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: element.backgroundColor || '#cccccc',
              borderRadius: element.borderRadius || 0,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={element.id}
      style={style}
      onMouseDown={handleMouseDown}
      className={`group hover:border-blue-300 transition-colors ${isSelected ? 'shadow-lg' : ''}`}
    >
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
          <Move size={10} />
          {Math.round(element.x)},{Math.round(element.y)}
        </div>
      )}
      {renderContent()}
    </div>
  );
};