import React from 'react';
import { Button } from './common/Button';

interface ReusableFooterProps {
  LogoComponent: React.ComponentType<{className?: string}>;
  tagline: string;
  supportButtonText: string;
  supportButtonIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  copyrightText: string;
  version: string;
  onSupportClick: () => void;
  showSupportButton?: boolean;
}

const ReusableFooter: React.FC<ReusableFooterProps> = ({
  LogoComponent,
  tagline,
  supportButtonText,
  supportButtonIcon: SupportButtonIcon,
  copyrightText,
  version,
  onSupportClick,
  showSupportButton = true,
}) => {
  return (
    <footer className="bg-navy text-sm flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <LogoComponent className="h-10 w-auto" />
            <p className="text-medium-gray mt-2">{tagline}</p>
          </div>
          
          {showSupportButton && (
            <Button variant="primary" onClick={onSupportClick} className="flex-shrink-0">
              {SupportButtonIcon && <SupportButtonIcon className="w-5 h-5 mr-2" />}
              {supportButtonText}
            </Button>
          )}
        </div>
        
        <hr className="my-8 border-t border-white/10" />

        <div className="text-center text-medium-gray">
          <p>{`${version} - ${copyrightText}`}</p>
        </div>
      </div>
    </footer>
  );
};

export default ReusableFooter;
