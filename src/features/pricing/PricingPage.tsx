import React from 'react';
import { PageShell } from '@/design-system/layout/PageShell';
import { PlanSelectorSection } from './PlanSelectorSection';

export const PricingPage: React.FC = () => {
  return (
    <PageShell>
      <div className="py-8 sm:py-12">
        <PlanSelectorSection />
      </div>
    </PageShell>
  );
};

export default PricingPage;
