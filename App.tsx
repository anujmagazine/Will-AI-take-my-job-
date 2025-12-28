
import React, { useState } from 'react';
import { analyzeJobRisk } from './services/geminiService';
import { AssessmentResult } from './types';
import RiskGauge from './components/RiskGauge';
import SkillChart from './components/SkillChart';

const App: React.FC = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

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
      const base64Image = imagePreview?.split(',')[1];
      const data = await analyzeJobRisk(profileUrl, base64Image);
      setResult(data);
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError('Analysis failed. The profile might be private or unreachable. Try uploading a screenshot.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setProfileUrl('');
    setImagePreview(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4">
          <i className="fas fa-brain text-indigo-600 text-3xl"></i>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Will <span className="gradient-text">AI</span> Take My Job?
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Get a professional AI risk assessment based on your LinkedIn presence and global industry trends.
        </p>
      </header>

      {/* Input Section */}
      {!result && (
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 md:p-10 border border-slate-100">
          <div className="space-y-8">
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">
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

            <div className="flex flex-col items-center space-y-4">
              <div className="w-full flex items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Optional context</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="w-full grid md:grid-cols-2 gap-4">
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-indigo-400 transition-colors group bg-slate-50/50 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <div className="relative w-full h-24">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      <button 
                        onClick={(e) => { e.preventDefault(); setImagePreview(null); }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-camera text-slate-400 text-3xl mb-3 group-hover:text-indigo-500 transition-colors"></i>
                      <span className="text-sm font-semibold text-slate-500">Upload Screenshot</span>
                    </>
                  )}
                </div>
                <div className="flex items-center text-sm text-slate-500 leading-relaxed bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                  <i className="fas fa-info-circle text-indigo-400 mr-3 text-lg shrink-0"></i>
                  <span>We use <b>Google Search</b> to analyze public profile data and current market trends.</span>
                </div>
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
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Analyzing Profile...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-bolt"></i>
                  <span>Run Assessment</span>
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Results Section */}
      {result && (
        <div id="result-section" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 gap-6">
             <div className="flex items-center space-x-6">
               <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-indigo-200 shrink-0">
                 {result.name.charAt(0)}
               </div>
               <div>
                 <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                   {result.name}
                 </h2>
                 <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                   <p className="text-lg font-bold text-indigo-600">{result.role}</p>
                   <span className="hidden md:inline text-slate-300">•</span>
                   <p className="text-sm text-slate-500 font-semibold uppercase tracking-widest">{result.industry}</p>
                 </div>
               </div>
             </div>
             <button onClick={reset} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-sm font-black transition-all transform hover:scale-105 active:scale-95">
               <i className="fas fa-arrow-left mr-2"></i> NEW ASSESSMENT
             </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden h-fit">
              <div className="p-8">
                <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center">
                  <i className="fas fa-gauge-high mr-3 text-indigo-500"></i> RISK SCORE
                </h2>
                <RiskGauge score={result.riskScore} level={result.overallRisk} />
                <div className="mt-8 space-y-4">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Assessment Logic</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {result.justification}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-8">
              <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-800">Top Predominant Skills</h2>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ordered by Prominence</span>
                </div>
                <SkillChart skills={result.skillsAnalysis} />
                
                <div className="mt-10 p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-lg relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                     <i className="fas fa-fingerprint text-9xl"></i>
                   </div>
                   <h3 className="text-indigo-200 text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center">
                     <i className="fas fa-sparkles mr-2"></i> HUMAN ADVANTAGE
                   </h3>
                   <div className="space-y-4 relative z-10">
                     <h2 className="text-3xl font-black tracking-tight">
                       {result.humanCentricEdge.archetype}
                     </h2>
                     <div className="h-1 w-16 bg-indigo-400/50 rounded-full"></div>
                     <p className="text-xl text-indigo-50 font-medium leading-relaxed max-w-2xl">
                       {result.humanCentricEdge.explanation}
                     </p>
                   </div>
                </div>
              </section>

              <section className="bg-slate-900 text-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-0"></div>
                <h2 className="text-3xl font-black mb-10 flex items-center relative z-10">
                  <i className="fas fa-compass mr-4 text-indigo-400"></i>
                  Recommendation; What can you do next?
                </h2>
                <div className="mb-12 relative z-10">
                  <p className="text-slate-300 leading-relaxed text-xl italic border-l-4 border-indigo-500 pl-8 py-2 max-w-3xl">
                    "{result.guidance.strategicAdvice}"
                  </p>
                </div>
                <div className="grid gap-8 relative z-10">
                  {result.guidance.frameworks.map((framework, idx) => (
                    <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/60 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                        <h4 className="text-indigo-400 font-black text-2xl">{framework.name}</h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700/50 w-fit">Career Framework</span>
                      </div>
                      <p className="text-slate-200 text-base mb-8 leading-relaxed font-medium">{framework.concept}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {framework.actionItems.map((item, i) => (
                          <div key={i} className="flex items-start text-xs text-slate-400 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/30 hover:border-indigo-500/30 transition-colors">
                            <i className="fas fa-check-circle text-indigo-500 mt-1 mr-3 shrink-0"></i>
                            <span className="leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                <h2 className="text-2xl font-black text-slate-800 mb-10 flex items-center">
                  <i className="fas fa-list-check mr-3 text-emerald-500"></i> Immediate Roadmap
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {result.guidance.positiveActionPlan.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-6 p-6 rounded-3xl bg-slate-50 border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xl shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                        {idx + 1}
                      </div>
                      <p className="text-slate-700 font-bold text-lg leading-snug pt-2">{step}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
