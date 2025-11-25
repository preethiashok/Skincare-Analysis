import React from 'react';
import { Check } from 'lucide-react';

interface SelectionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  multiSelect?: boolean;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ 
  title, 
  description, 
  selected, 
  onClick, 
  icon 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200
        hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
        ${selected 
          ? 'border-primary-500 bg-primary-50 shadow-md ring-1 ring-primary-200' 
          : 'border-white bg-white/80 shadow-sm hover:border-primary-300'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
            {icon && (
                <div className={`p-2 rounded-xl w-fit ${selected ? 'bg-primary-500 text-white shadow-sm' : 'bg-primary-50 text-primary-400'}`}>
                    {icon}
                </div>
            )}
            <div>
                <h3 className={`font-semibold text-lg ${selected ? 'text-primary-900' : 'text-slate-700'}`}>
                    {title}
                </h3>
                {description && (
                    <p className={`text-sm mt-1 ${selected ? 'text-primary-700' : 'text-slate-500'}`}>
                    {description}
                    </p>
                )}
            </div>
        </div>
        
        <div className={`
          flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors
          ${selected ? 'border-primary-500 bg-primary-500 text-white' : 'border-primary-100 bg-transparent text-transparent'}
        `}>
          <Check size={14} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};