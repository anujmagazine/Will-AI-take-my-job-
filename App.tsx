
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
      setError('Analysis failed. The profile might be private. Try uploading a screenshot.');
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
                  <span>We use <b>Google Search</b> to analyze your public profile and industry trajectory.</span>
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
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <div className="flex items-center space-x-4">
               <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-100">
                 {result.role.charAt(0)}
               </div>
               <div>
                 <h3 className="font-bold text-slate-900 text-xl leading-tight">{result.role}</h3>
                 <p className="text-sm text-slate-500 mt-1 font-medium uppercase tracking-widest">{result.industry}</p>
               </div>
             </div>
             <button onClick={reset} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-colors">
               <i className="fas fa-arrow-left mr-2"></i> Back
             </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <i className="fas fa-gauge-high mr-2 text-indigo-500"></i> Automation Risk
                </h2>
                <RiskGauge score={result.riskScore} level={result.overallRisk} />
                <div className="mt-6 space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">The "Why"</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {result.justification}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-8">
              <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Skills Analysis</h2>
                <SkillChart skills={result.skillsAnalysis} />
                
                {/* Fixed "Human Advantage" Section */}
                <div className="mt-10 p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-lg relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                     <i className="fas fa-fingerprint text-8xl"></i>
                   </div>
                   <h3 className="text-indigo-200 text-sm font-bold uppercase tracking-[0.2em] mb-4 flex items-center">
                     <i className="fas fa-sparkles mr-2"></i> Your Human Advantage
                   </h3>
                   <div className="space-y-4 relative z-10">
                     <h2 className="text-3xl font-extrabold tracking-tight">
                       {result.humanCentricEdge.archetype}
                     </h2>
                     <div className="h-1 w-12 bg-indigo-400/50 rounded-full"></div>
                     <p className="text-lg text-indigo-50 font-medium leading-relaxed max-w-xl">
                       {result.humanCentricEdge.explanation}
                     </p>
                   </div>
                </div>
              </section>

              <section className="bg-slate-900 text-white rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
                <h2 className="text-2xl font-bold mb-8 flex items-center relative z-10">
                  <i className="fas fa-compass mr-3 text-indigo-400"></i>
                  Recommendation; What can you do next?
                </h2>
                <div className="mb-10 relative z-10">
                  <p className="text-slate-300 leading-relaxed text-lg italic border-l-4 border-indigo-500 pl-6 py-2">
                    "{result.guidance.strategicAdvice}"
                  </p>
                </div>
                <div className="grid gap-6 relative z-10">
                  {result.guidance.frameworks.map((framework, idx) => (
                    <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                      <h4 className="text-indigo-400 font-bold text-xl mb-2">{framework.name}</h4>
                      <p className="text-slate-300 text-sm mb-5 leading-relaxed font-medium">{framework.concept}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {framework.actionItems.map((item, i) => (
                          <div key={i} className="flex items-start text-xs text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-slate-700/30">
                            <i className="fas fa-rocket text-indigo-500 mt-0.5 mr-2 shrink-0"></i>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center">
                  <i className="fas fa-list-check mr-2 text-emerald-500"></i> Immediate Roadmap
                </h2>
                <div className="grid gap-4">
                  {result.guidance.positiveActionPlan.map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-5 p-5 rounded-2xl bg-slate-50 border border-transparent hover:border-emerald-100 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-slate-700 font-bold text-base">{step}</p>
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
