'use client';

import dynamic from 'next/dynamic';

const TemplateApp = dynamic(() => import('@/template/App'), { ssr: false });

export function TemplateCatalog() {
  return <TemplateApp />;
}
