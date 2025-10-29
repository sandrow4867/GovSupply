import React, { useState } from 'react';
import ReusableFooter from './ReusableFooter';
import SupportModal from './SupportModal';
import { useLanguage } from '../contexts/LanguageContext';
import { SupportIcon } from './icons/SupportIcon';
import { useTheme } from '../contexts/ThemeContext';
import { GovSupplyLogoFull, GovSupplyLogoFullDark } from './Icons';

const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();
  const { theme } = useTheme();

  const LogoComponent = ({ className }: { className?: string }) => (
    theme === 'dark' 
    ? <GovSupplyLogoFullDark className={className} />
    : <GovSupplyLogoFull className={className} />
  );

  return (
    <>
      <ReusableFooter
        LogoComponent={LogoComponent}
        tagline={t('footer.tagline')}
        supportButtonText={t('footer.supportButton')}
        supportButtonIcon={SupportIcon}
        copyrightText={t('footer.copyright')}
        version={t('footer.version')}
        onSupportClick={() => setIsModalOpen(true)}
      />
      <SupportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Footer;
