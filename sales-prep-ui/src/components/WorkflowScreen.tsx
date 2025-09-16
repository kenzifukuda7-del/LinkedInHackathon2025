'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

interface WorkflowScreenProps {
  onBack: () => void;
}

interface ResearchOptions {
  companyHistory: boolean;
  existingProducts: boolean;
  financialInfo: boolean;
  newsArticles: boolean;
  industryDeepDive: boolean;
  competitorsTrends: boolean;
  keyStakeholders: boolean;
  draftEmail: boolean;
  contractDetails: boolean;
  priorCorrespondence: boolean;
}

const linkedinProducts = {
  LTS: {
    name: 'LinkedIn Talent Solutions',
    description: 'Find, attract, and hire the right talent with LinkedIn Recruiter, Talent Insights, and job posting solutions.'
  },
  LLS: {
    name: 'LinkedIn Learning Solutions',
    description: 'Develop your workforce with personalized learning paths, skill assessments, and expert-led courses.'
  },
  LMS: {
    name: 'LinkedIn Marketing Solutions',
    description: 'Reach and engage your target audience with sponsored content, lead generation, and dynamic ads.'
  },
  LSS: {
    name: 'LinkedIn Sales Solutions',
    description: 'Identify prospects, build relationships, and close deals with Sales Navigator and CRM integrations.'
  }
};

export default function WorkflowScreen({ onBack }: WorkflowScreenProps) {
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<keyof typeof linkedinProducts>('LTS');
  const [researchOptions, setResearchOptions] = useState<ResearchOptions>({
    companyHistory: false,
    existingProducts: false,
    financialInfo: false,
    newsArticles: false,
    industryDeepDive: false,
    competitorsTrends: false,
    keyStakeholders: false,
    draftEmail: false,
    contractDetails: false,
    priorCorrespondence: false
  });
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [researchData, setResearchData] = useState<any>(null);

  const handleOptionChange = (option: keyof ResearchOptions) => {
    setResearchOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleGenerateResults = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          companyWebsite,
          selectedProduct,
          researchOptions
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate research');
      }

      const data = await response.json();
      setResearchData(data);
      
      // Expand all results by default
      const allResultTypes = Object.keys(data.results).filter(key => data.results[key]);
      setExpandedResults(new Set(allResultTypes));
    } catch (error) {
      console.error('Error generating research:', error);
      alert('Failed to generate research. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleResultExpansion = (resultType: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resultType)) {
        newSet.delete(resultType);
      } else {
        newSet.add(resultType);
      }
      return newSet;
    });
  };

  const toggleAllResults = () => {
    if (researchData) {
      const allResultTypes = Object.keys(researchData.results).filter(key => researchData.results[key]);
      setExpandedResults(prev => {
        // If all are expanded, collapse all; otherwise expand all
        const allExpanded = allResultTypes.every(type => prev.has(type));
        return allExpanded ? new Set() : new Set(allResultTypes);
      });
    }
  };

  const selectedOptions = Object.entries(researchOptions).filter(([_, isSelected]) => isSelected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Research Tool</h1>
        </div>

        {/* Inputs Section */}
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Company Website
              </label>
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.company.com"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              LinkedIn Product Focus
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value as keyof typeof linkedinProducts)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(linkedinProducts).map(([key, product]) => (
                <option key={key} value={key}>{product.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Research Options */}
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Research Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(researchOptions).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleOptionChange(key as keyof ResearchOptions)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-800 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleGenerateResults}
            disabled={!companyName || selectedOptions.length === 0 || isGenerating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg text-lg transition-colors duration-300"
          >
            {isGenerating ? 'Generating Results...' : 'Generate Research Results'}
          </button>
        </div>

        {/* Results Section */}
        {researchData && !isGenerating && (
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Research Results for {researchData.companyName}</h2>
              <div className="flex gap-2">
                <button
                  onClick={toggleAllResults}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                  Collapse All
                </button>
                <button
                  onClick={() => {
                    if (researchData.results.exportMarkdown) {
                      const blob = new Blob([researchData.results.exportMarkdown], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${researchData.companyName}_research.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Markdown
                </button>
              </div>
            </div>

            {/* Top Headlines Section */}
            {researchData.topHeadlines && researchData.topHeadlines.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Top Headlines to Mention</h3>
                <div className="space-y-2">
                  {researchData.topHeadlines.map((headline: any, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <a 
                          href={headline.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 font-medium hover:underline"
                        >
                          {headline.title}
                        </a>
                        {headline.date && (
                          <span className="text-sm text-blue-600 ml-2">({headline.date})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LOB Focus Section */}
            {researchData.lob && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">LinkedIn {researchData.lob} Value Proposition</h3>
                <p className="text-green-800">{researchData.lob}</p>
              </div>
            )}
            <div className="space-y-4">
              {Object.entries(researchData.results).map(([option, data]) => {
                if (!data) return null;
                const isExpanded = expandedResults.has(option);
                
                return (
                  <div key={option} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleResultExpansion(option)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <span className="font-semibold text-gray-900 capitalize">
                        {option.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-200">
                        <div className="pt-4">
                          {option === 'companyHistory' && (
                            <div className="space-y-2">
                              <p><strong>Founded:</strong> {data.founded}</p>
                              <p><strong>Headquarters:</strong> {data.headquarters}</p>
                              <p><strong>Employees:</strong> {data.employees}</p>
                              <p><strong>Industry:</strong> {data.industry}</p>
                              <p><strong>Description:</strong> {data.description}</p>
                            </div>
                          )}
                          {option === 'existingProducts' && (
                            <div className="space-y-2">
                              <p><strong>Products:</strong> {data.products?.join(', ')}</p>
                              <p><strong>Services:</strong> {data.services?.join(', ')}</p>
                            </div>
                          )}
                          {option === 'financialInfo' && (
                            <div className="space-y-3">
                              {data.earnings && Array.isArray(data.earnings) && data.earnings.map((report: any, index: number) => (
                                <div key={index} className="border-l-4 border-purple-500 pl-4">
                                  <h4 className="font-semibold">
                                    <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {report.title}
                                    </a>
                                  </h4>
                                  <p className="text-sm text-gray-600">{report.date ? `${report.date} - ` : ''}Earnings Report</p>
                                  <p className="text-sm">{report.snippet}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {option === 'newsArticles' && (
                            <div className="space-y-3">
                              {data.press && Array.isArray(data.press) && data.press.map((article: any, index: number) => (
                                <div key={index} className="border-l-4 border-blue-500 pl-4">
                                  <h4 className="font-semibold">
                                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {article.title}
                                    </a>
                                  </h4>
                                  <p className="text-sm text-gray-600">{article.date ? `${article.date} - ` : ''}Press Release</p>
                                  <p className="text-sm">{article.snippet}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {option === 'industryDeepDive' && (
                            <div className="space-y-3">
                              {data.industry && Array.isArray(data.industry) && data.industry.map((article: any, index: number) => (
                                <div key={index} className="border-l-4 border-green-500 pl-4">
                                  <h4 className="font-semibold">
                                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {article.title}
                                    </a>
                                  </h4>
                                  <p className="text-sm text-gray-600">{article.date ? `${article.date} - ` : ''}Industry Report</p>
                                  <p className="text-sm">{article.snippet}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {option === 'competitorsTrends' && (
                            <div className="space-y-2">
                              <p><strong>Competitors:</strong> {data.competitors && Array.isArray(data.competitors) ? data.competitors.join(', ') : 'N/A'}</p>
                            </div>
                          )}
                          {option === 'keyStakeholders' && (
                            <div className="space-y-3">
                              <p className="text-gray-600">{data.note || 'Key stakeholders data not available yet.'}</p>
                            </div>
                          )}
                          {option === 'draftEmail' && (
                            <div className="space-y-3">
                              <div>
                                <strong>Subject:</strong> {data.subject}
                              </div>
                              <div>
                                <strong>Body:</strong>
                                <pre className="mt-2 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">{data.body}</pre>
                              </div>
                            </div>
                          )}
                          {option === 'contractDetails' && (
                            <div className="space-y-2">
                              <p><strong>Current Contract:</strong> {data.currentContract}</p>
                              <p><strong>Renewal Date:</strong> {data.renewalDate}</p>
                              <p><strong>Contract Value:</strong> {data.contractValue}</p>
                              <p><strong>Usage:</strong> {data.usage}</p>
                            </div>
                          )}
                          {option === 'priorCorrespondence' && (
                            <div className="space-y-3">
                              <p className="text-gray-600">Prior correspondence data not available yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
