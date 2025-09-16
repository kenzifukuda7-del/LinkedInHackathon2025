'use client';

import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import WorkflowScreen from '@/components/WorkflowScreen';

export default function Home() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  const handleStartResearch = () => {
    setShowWorkflow(true);
  };

  if (showWorkflow) {
    return <WorkflowScreen onBack={() => setShowWorkflow(false)} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <HeroSection onStartResearch={handleStartResearch} />
    </main>
  );
}