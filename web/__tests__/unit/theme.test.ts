import { describe, it, expect } from 'vitest';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';

describe('Theme Configuration', () => {
  describe('colors', () => {
    it('should have Noor brand gold color', () => {
      expect(colors.gold).toBe('#D4AF37');
    });

    it('should have dark background color', () => {
      expect(colors.background).toBe('#0f1419');
    });

    it('should have moonlight text color', () => {
      expect(colors.moonlight).toBe('#e8f0f8');
    });

    it('should have Islamic emerald green', () => {
      expect(colors.emerald).toBe('#009688');
    });

    it('should have indigo contemplation color', () => {
      expect(colors.indigo).toBe('#1A237E');
    });

    it('should have all required color variations', () => {
      expect(colors).toHaveProperty('goldLight');
      expect(colors).toHaveProperty('goldDim');
      expect(colors).toHaveProperty('emeraldLight');
      expect(colors).toHaveProperty('emeraldDark');
      expect(colors).toHaveProperty('indigoLight');
      expect(colors).toHaveProperty('indigoDark');
    });

    it('should have card colors for layering', () => {
      expect(colors).toHaveProperty('backgroundCard');
      expect(colors).toHaveProperty('backgroundCardLight');
    });

    it('should have moonlight variations for text hierarchy', () => {
      expect(colors).toHaveProperty('moonlight');
      expect(colors).toHaveProperty('moonlightDim');
      expect(colors).toHaveProperty('moonlightMuted');
    });
  });

  describe('spacing', () => {
    it('should have consistent spacing scale', () => {
      expect(spacing.xs).toBe(4);
      expect(spacing.sm).toBe(8);
      expect(spacing.md).toBe(12);
      expect(spacing.lg).toBe(16);
      expect(spacing.xl).toBe(20);
    });

    it('should have extended spacing values', () => {
      expect(spacing['2xl']).toBe(24);
      expect(spacing['3xl']).toBe(32);
      expect(spacing['4xl']).toBe(40);
      expect(spacing['5xl']).toBe(48);
      expect(spacing['6xl']).toBe(64);
    });
  });

  describe('typography', () => {
    it('should use Cormorant Garamond for serif display', () => {
      expect(typography.fontSerifDisplay).toContain('Cormorant Garamond');
    });

    it('should use Inter for sans body', () => {
      expect(typography.fontSansBody).toContain('Inter');
    });

    it('should use Amiri for Arabic text', () => {
      expect(typography.fontArabic).toContain('Amiri');
    });

    it('should have fallback fonts', () => {
      expect(typography.fontSerifDisplay).toContain('serif');
      expect(typography.fontSansBody).toContain('sans-serif');
      expect(typography.fontArabic).toContain('serif');
    });
  });

  describe('borderRadius', () => {
    it('should have consistent radius scale', () => {
      expect(borderRadius.xs).toBe(6);
      expect(borderRadius.sm).toBe(10);
      expect(borderRadius.md).toBe(14);
      expect(borderRadius.lg).toBe(18);
      expect(borderRadius.xl).toBe(24);
    });

    it('should have full radius for circular elements', () => {
      expect(borderRadius.full).toBe(9999);
    });
  });
});
