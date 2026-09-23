/**
 * The product's own logo, in the two shapes the UI needs.
 *
 * Both components render an image when the deployment configured one, and text
 * when it did not. The text is not a placeholder for a picture that is coming
 * tomorrow — it is the honest state: a deployment that has not chosen a brand
 * kit should show its own name, not another company's wordmark. Swapping in
 * artwork later is a build variable (`ORIGINHUB_LOGO` / `ORIGINHUB_MINI_LOGO`,
 * see `@/config/logos`), not a code change here.
 *
 * The upstream artwork is deliberately still shipped and still reachable: the
 * enterprise login kit takes a URL and renders it as an image, so that path keeps
 * `PRODUCT_WORDMARK`. See the note in `@/config/logos`.
 */

import { PRODUCT_NAME } from '@/config/branding';
import {
  MARK_OVERRIDE,
  PRODUCT_MARK,
  PRODUCT_WORDMARK,
  WORDMARK_OVERRIDE
} from '@/config/logos';
import React from 'react';
import styled from 'styled-components';

const WordmarkText = styled.span<{ $height: number }>`
  display: inline-flex;
  align-items: center;
  height: ${({ $height }) => `${$height}px`};
  color: var(--ant-color-text);
  font-size: ${({ $height }) => `${Math.round($height * 0.62)}px`};
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1;
  user-select: none;
  white-space: nowrap;
`;

const MarkBox = styled.span<{ $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  border-radius: ${({ $size }) => `${Math.max(4, Math.round($size * 0.25))}px`};
  background-color: var(--ant-color-primary);
  color: #fff;
  font-size: ${({ $size }) => `${Math.round($size * 0.44)}px`};
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
  user-select: none;
`;

/**
 * Initials for the square mark: at most two letters, derived from the product
 * name so that renaming the product renames the mark. Derived rather than
 * hardcoded, because a second copy of the brand name is exactly the thing this
 * repository's guard exists to prevent.
 */
const initials = (name: string): string => {
  const words = name.split(/[\s-_]+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * The horizontal wordmark.
 *
 * @param src  A resolved URL (the enterprise plugin's choice, or an override).
 *             Falls back to `ORIGINHUB_LOGO`, then to text.
 */
export const BrandWordmark: React.FC<{
  src?: string;
  height?: number;
  style?: React.CSSProperties;
  alt?: string;
}> = ({ src, height = 24, style, alt = 'logo' }) => {
  const resolved = src || WORDMARK_OVERRIDE;
  if (resolved) {
    return <img src={resolved} alt={alt} style={{ height, ...style }} />;
  }
  return (
    <WordmarkText $height={height} style={style}>
      {PRODUCT_NAME}
    </WordmarkText>
  );
};

/**
 * The square mark: collapsed sidebar, and the default icon for the built-in
 * ("deployments") inference provider.
 */
export const BrandMark: React.FC<{
  src?: string;
  size?: number;
  style?: React.CSSProperties;
  alt?: string;
}> = ({ src, size = 24, style, alt = 'logo' }) => {
  const resolved = src || MARK_OVERRIDE;
  if (resolved) {
    return (
      <img
        src={resolved}
        alt={alt}
        style={{ width: size, height: size, ...style }}
      />
    );
  }
  return (
    <MarkBox $size={size} style={style}>
      {initials(PRODUCT_NAME)}
    </MarkBox>
  );
};

/** Re-exported so a caller that needs a URL (the login kit) does not import two modules. */
export { PRODUCT_MARK, PRODUCT_WORDMARK };

export default BrandWordmark;
