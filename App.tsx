
import React, { useState, useRef } from 'react';
import { analyzeJobRisk } from './services/geminiService';
import { AssessmentResult } from './types';
import RiskGauge from './components/RiskGauge';
import SkillChart from './components/SkillChart';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes('linkedin.com');
    } catch {
      return false;
    }
  };

  const handleAnalyze = async () => {
    if (!profileUrl.trim()) {
      setError('Please enter a LinkedIn profile URL.');
      return;
    }

    if (!isValidUrl(profileUrl)) {
      setError('Please enter a valid LinkedIn URL.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeJobRisk(profileUrl);
      setResult(data);
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError('Analysis failed. The profile might be private or unreachable. Please ensure the URL is public.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadPDF = async () => {
    if (!resultRef.current || !result) return;
    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
        ignoreElements: (element) => element.classList.contains('no-export')
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AI-Risk-Assessment-${result.name.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setProfileUrl('');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      {!result && (
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4">
            <i className="fas fa-brain text-indigo-600 text-3xl"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Will <span className="gradient-text">AI</span> Take My Job?
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Find out if AI could do your job. Just paste your LinkedIn profile link to see your risk level and get a clear plan to stay ahead of the curve.
          </p>
        </header>
      )}

      {/* Input Section */}
      {!result && (
        <section className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 md:p-10 border border-slate-100">
          <div className="space-y-8">
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-3 text-center uppercase tracking-widest">
                LinkedIn Profile URL
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <i className="fab fa-linkedin text-xl"></i>
                </div>
                <input
                  type="url"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/your-profile"
                  className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-700 text-lg shadow-inner"
                />
              </div>
            </div>

            <div className="w-full bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100">
              <div className="flex items-start space-x-3">
                <i className="fas fa-magnifying-glass-chart text-indigo-600 mt-1"></i>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  Our engine leverages <strong>Google Search Grounding</strong> to cross-reference your profile with live industry reports and emerging AI trends for a data-driven forecast.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center animate-pulse">
                <i className="fas fa-exclamation-circle mr-2"></i> {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 text-lg"
            >
              {isAnalyzing ? (
                <><i className="fas fa-circle-notch fa-spin"></i><span>Analyzing...</span></>
              ) : (
                <><i className="fas fa-bolt"></i><span>Run Assessment</span></>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Dashboard Results Section */}
      {result && (
        <div id="result-section" ref={resultRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
          
          {/* Dashboard Top Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
             <div className="flex items-center space-x-4">
               <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0">
                 {result.name.charAt(0)}
               </div>
               <div>
                 <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{result.name}</h2>
                 <div className="flex items-center gap-2 mt-1">
                   <span className="text-indigo-600 font-bold text-sm">{result.role}</span>
                   <span className="text-slate-300">•</span>
                   <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{result.industry}</span>
                 </div>
               </div>
             </div>
             <div className="flex items-center space-x-2 no-export w-full md:w-auto">
               <button onClick={downloadPDF} disabled={isExporting} className="flex-1 md:flex-none px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-indigo-100">
                 {isExporting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-pdf"></i>}
                 {isExporting ? 'Preparing...' : 'Export PDF'}
               </button>
               <button onClick={reset} className="flex-1 md:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-all">
                 <i className="fas fa-rotate-left mr-2"></i> NEW
               </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch auto-rows-min">
            
            {/* ROW 1: Risk (4) & Skills (8) */}
            <div className="md:col-span-4 h-full flex flex-col">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex-grow flex flex-col">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                  <i className="fas fa-shield-halved mr-2 text-indigo-500"></i> Risk Assessment
                </h3>
                <div className="scale-90 flex-grow flex items-center justify-center">
                  <RiskGauge score={result.riskScore} level={result.overallRisk} />
                </div>
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {result.justification}
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 h-full flex flex-col">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <i className="fas fa-chart-simple mr-2 text-indigo-500"></i> Skills Distribution
                  </h3>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">AI Exposure Rating</span>
                </div>
                <div className="flex-grow">
                  <SkillChart skills={result.skillsAnalysis} />
                </div>
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start">
                  <i className="fas fa-info-circle text-indigo-400 mr-2 text-xs mt-0.5"></i>
                  <p className="text-[10px] text-slate-500 font-medium italic leading-snug">
                    {result.skillsMethodology}
                  </p>
                </div>
              </div>
            </div>

            {/* ROW 2: Archetype (4) & Advice/Roadmap (8) - Explicit horizontal alignment */}
            <div className="md:col-span-4 h-full">
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-end min-h-[340px]">
                <div className="absolute top-4 right-4 text-indigo-500/20 text-7xl rotate-12 pointer-events-none">
                  <i className="fas fa-fingerprint"></i>
                </div>
                <div className="relative z-10 space-y-3">
                  <span className="inline-block px-3 py-1 bg-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-300 border border-indigo-500/30">
                    Your Archetype
                  </span>
                  <h3 className="text-2xl font-black tracking-tight">{result.humanCentricEdge.archetype}</h3>
                  <p className="text-sm text-indigo-100/80 leading-relaxed font-medium">
                    {result.humanCentricEdge.explanation}
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-lg flex flex-col justify-center min-h-[340px]">
                  <i className="fas fa-quote-left text-3xl text-indigo-400/50 mb-6"></i>
                  <p className="text-lg md:text-xl font-bold leading-relaxed italic">
                    {result.guidance.strategicAdvice}
                  </p>
                </div>
                
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col h-full">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                    <i className="fas fa-route mr-2 text-emerald-500"></i> Action Roadmap
                  </h3>
                  <div className="space-y-4 flex-grow">
                    {result.guidance.positiveActionPlan.map((step, idx) => (
                      <div key={idx} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-emerald-200 transition-all">
                        <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-700 font-bold leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Frameworks - Full Width Horizontal Row */}
          <section className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px]"></div>
            <h3 className="text-lg font-black mb-8 flex items-center relative z-10">
              <i className="fas fa-compass mr-3 text-indigo-400"></i>
              Strategic Upskilling Frameworks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {result.guidance.frameworks.map((framework, idx) => (
                <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/40 transition-all flex flex-col h-full">
                  <div className="mb-4">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 block">Model {idx + 1}</span>
                    <h4 className="text-xl font-black">{framework.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium flex-grow">{framework.concept}</p>
                  <div className="space-y-2 mt-auto">
                    {framework.actionItems.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-start text-[10px] text-slate-300 bg-slate-900/40 p-2.5 rounded-xl border border-slate-700/30">
                        <i className="fas fa-check text-indigo-500 mt-0.5 mr-2 shrink-0"></i>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default App;
