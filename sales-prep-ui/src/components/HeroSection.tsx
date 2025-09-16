'use client';

import { BarChart3, Users, Zap } from 'lucide-react';

interface HeroSectionProps {
  onStartResearch: () => void;
}

export default function HeroSection({ onStartResearch }: HeroSectionProps) {
  const features = [
    {
      icon: BarChart3,
      title: "Comprehensive Research",
      description: "Company history, financials, news, and industry analysis in one place"
    },
    {
      icon: Users,
      title: "Key Stakeholders",
      description: "Identify decision makers and champions within target organizations"
    },
    {
      icon: Zap,
      title: "AI-Powered Emails",
      description: "Generate personalized outreach emails tailored to LinkedIn products"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="text-blue-900">LinkedIn</span>{' '}
          <span className="text-blue-600">Research Tool</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-800 mb-12 max-w-2xl mx-auto font-medium">
          Generate comprehensive company insights for LinkedIn sales teams.
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onStartResearch}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition-colors duration-300"
      >
        Start Research
      </button>
    </div>
  );
}
