import { MARK_OVERRIDE, WORDMARK_OVERRIDE } from '@/config/logos';
import useUserSettings from '@/hooks/use-user-settings';
import { getGPUStackPlugin } from '@/plugins';

const useLogo = () => {
  const { isDarkTheme, userSettings } = useUserSettings();

  const enterprisePlugin = getGPUStackPlugin();
  const resolved =
    enterprisePlugin?.branding?.resolveLogos?.(userSettings, isDarkTheme) ?? {};

  // An empty value is the signal that no artwork is configured — the callers
  // render `<BrandWordmark src={...} />`, which falls back to the product name.
  // Returning the bundled upstream image here instead is what used to put
  // someone else's wordmark in the sidebar of every deployment.
  return {
    sidebarLogo: resolved.sidebarLogo || WORDMARK_OVERRIDE,
    miniLogo: resolved.miniLogo || MARK_OVERRIDE
  };
};

export { useLogo };
