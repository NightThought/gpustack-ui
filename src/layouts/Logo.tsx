// @ts-nocheck
import { BrandMark, BrandWordmark } from '@/components/brand-logo';
import { useLogo } from '@/hooks/use-logo';
import React from 'react';

const LogoIcon: React.FC = () => {
  const { sidebarLogo } = useLogo();

  return <BrandWordmark src={sidebarLogo} height={24} />;
};

const SLogoIcon: React.FC = () => {
  const { miniLogo } = useLogo();

  return <BrandMark src={miniLogo} size={24} />;
};

export { LogoIcon, SLogoIcon };
