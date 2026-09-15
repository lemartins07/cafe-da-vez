import '@testing-library/jest-dom/vitest';
import { createElement, type SVGProps } from 'react';
import { vi } from 'vitest';

const SvgIcon = (props: SVGProps<SVGSVGElement>) => createElement('svg', props);

vi.mock('@/components/icons/eye.svg', () => ({ default: SvgIcon }));
vi.mock('@/components/icons/eye-close.svg', () => ({ default: SvgIcon }));
