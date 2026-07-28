import React, { useState } from 'react';
import { useForge } from '@/contexts/ForgeContext';
import { TitleBar, Sidebar } from '@/components/forge/Shell';
import Dashboard from '@/components/forge/Dashboard';
import ModelLibrary from '@/components/forge/ModelLibrary';
import Converter from '@/components/forge/Converter';
import ChatStudio from '@/components/forge/ChatStudio';
import Trainer from '@/components/forge/Trainer';
import ModelManager from '@/components/forge/ModelManager';
import HelpCenter from '@/components/forge/HelpCenter';
import SetupWizard from '@/components/forge/SetupWizard';
import { GlossaryModal, ToastStack } from '@/components/forge/Overlays';

const AppLayout: React.FC = () => {
  const { view, wizardDone } = useForge();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="forge-mica min-h-screen font-sans text-slate-200">
      <div className="flex min-h-screen flex-col forge-grid-lines">
        <TitleBar onMenu={() => setNavOpen((o) => !o)} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

          <main className="forge-scroll flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px]">
              {view === 'dashboard' && <Dashboard />}
              {view === 'library' && <ModelLibrary />}
              {view === 'convert' && <Converter />}
              {view === 'chat' && <ChatStudio />}
              {view === 'train' && <Trainer />}
              {view === 'manage' && <ModelManager />}
              {view === 'help' && <HelpCenter />}
            </div>
          </main>
        </div>
      </div>

      {!wizardDone && <SetupWizard />}
      <GlossaryModal />
      <ToastStack />
    </div>
  );
};

export default AppLayout;
