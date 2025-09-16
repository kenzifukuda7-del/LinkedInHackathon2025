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
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
          <span className="text-blue-900">LinkedIn</span>{' '}
          <span className="text-blue-600">Research Made Simple</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
          Generate comprehensive company insights and personalized pitches for LinkedIn Talent Solutions, Learning, Marketing, and Sales Solutions.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-6xl w-full">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <button
        onClick={onStartResearch}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-colors duration-300 flex items-center gap-2 mb-16"
      >
        Start Research
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Footer */}
      <div className="text-center">
        <p className="text-gray-600 font-semibold mb-6">TRUSTED BY LINKEDIN SALES TEAMS</p>
        <div className="flex flex-wrap justify-center gap-8 text-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Talent Solutions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Marketing Solutions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Sales Solutions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Learning Solutions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
