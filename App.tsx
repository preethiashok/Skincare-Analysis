import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Droplets, 
  Sun, 
  Moon, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight,
  User,
  Activity,
  ThumbsUp,
  RefreshCw,
  Info,
  ShoppingBag
} from 'lucide-react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { SelectionCard } from './components/SelectionCard';
import { generateSkincareRoutine } from './services/geminiService';
import { 
  AppState, 
  SkinType, 
  SkinConcern, 
  UserProfile, 
  RoutineResponse 
} from './types';

// Icons mapping for visual appeal
const SkinTypeIcons = {
  [SkinType.DRY]: <Droplets size={20} />,
  [SkinType.OILY]: <Sun size={20} />,
  [SkinType.COMBINATION]: <Activity size={20} />,
  [SkinType.NORMAL]: <ThumbsUp size={20} />,
  [SkinType.SENSITIVE]: <ShieldCheck size={20} />,
};

const ConcernIcons = {
  [SkinConcern.ACNE]: "🔴",
  [SkinConcern.WRINKLES]: "👵",
  [SkinConcern.DARK_SPOTS]: "🌑",
  [SkinConcern.REDNESS]: "☺️",
  [SkinConcern.DULLNESS]: "☁️",
  [SkinConcern.TEXTURE]: "🧱",
  [SkinConcern.PORES]: "🕳️",
  [SkinConcern.DRYNESS]: "🏜️"
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    skinType: null,
    concerns: [],
    sensitivity: false
  });

  const [routine, setRoutine] = useState<RoutineResponse | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (appState === AppState.RESULTS && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [appState]);

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const toggleConcern = (concern: SkinConcern) => {
    setProfile(prev => {
      const exists = prev.concerns.includes(concern);
      if (exists) {
        return { ...prev, concerns: prev.concerns.filter(c => c !== concern) };
      }
      return { ...prev, concerns: [...prev.concerns, concern] };
    });
  };

  const handleGenerate = async () => {
    setAppState(AppState.LOADING);
    setError(null);
    try {
      const result = await generateSkincareRoutine(profile);
      setRoutine(result);
      setAppState(AppState.RESULTS);
    } catch (err) {
      setError("Failed to generate recommendations. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setProfile({ name: '', skinType: null, concerns: [], sensitivity: false });
    setStep(0);
    setAppState(AppState.WELCOME);
    setRoutine(null);
  };

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in-up">
      <div className="bg-primary-100 p-6 rounded-full shadow-xl shadow-primary-100/50 mb-4">
        <Sparkles size={48} className="text-primary-600" />
      </div>
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Discover Your Perfect <span className="text-primary-600">Glow</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
          Unlock a personalized skincare routine tailored to your unique skin biology using advanced AI analysis.
          Say goodbye to guesswork.
        </p>
      </div>
      <Button 
        size="lg" 
        onClick={() => setAppState(AppState.QUIZ)} 
        className="group mt-8"
      >
        Start Assessment
        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Button>
      
      <div className="mt-12 grid grid-cols-3 gap-8 text-center text-sm text-slate-500">
        <div>
            <div className="font-bold text-slate-900 text-lg">100%</div>
            <div>Personalized</div>
        </div>
        <div>
            <div className="font-bold text-slate-900 text-lg">Science</div>
            <div>Backed</div>
        </div>
        <div>
            <div className="font-bold text-slate-900 text-lg">Instant</div>
            <div>Results</div>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const steps = [
      // Step 0: Name
      <div key="name" className="space-y-6 max-w-md mx-auto">
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Let's get to know you</h2>
            <p className="text-slate-500">What should we call you?</p>
        </div>
        <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your Name"
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all text-lg"
                autoFocus
            />
        </div>
        <Button 
            className="w-full" 
            disabled={!profile.name.trim()} 
            onClick={handleNextStep}
        >
            Next Step
        </Button>
      </div>,

      // Step 1: Skin Type
      <div key="type" className="space-y-6">
        <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">What is your skin type?</h2>
            <p className="text-slate-500">Select the one that describes you best</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.values(SkinType).map((type) => (
            <SelectionCard
              key={type}
              title={type}
              selected={profile.skinType === type}
              icon={SkinTypeIcons[type]}
              onClick={() => {
                setProfile({ ...profile, skinType: type });
                // Small delay to show selection before auto-advance
                setTimeout(handleNextStep, 300);
              }}
            />
          ))}
        </div>
        <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={handlePrevStep}>Back</Button>
        </div>
      </div>,

      // Step 2: Concerns
      <div key="concerns" className="space-y-6">
        <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">What are your main concerns?</h2>
            <p className="text-slate-500">Select as many as apply</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.values(SkinConcern).map((concern) => (
            <SelectionCard
              key={concern}
              title={concern}
              selected={profile.concerns.includes(concern)}
              multiSelect
              icon={<span className="text-xl">{ConcernIcons[concern]}</span>}
              onClick={() => toggleConcern(concern)}
            />
          ))}
        </div>
        <div className="flex justify-between pt-8">
            <Button variant="ghost" onClick={handlePrevStep}>Back</Button>
            <Button 
                onClick={handleNextStep}
                disabled={profile.concerns.length === 0}
            >
                Next Step
            </Button>
        </div>
      </div>,

      // Step 3: Sensitivity
      <div key="sensitivity" className="space-y-6 max-w-lg mx-auto">
        <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Is your skin sensitive?</h2>
            <p className="text-slate-500">Do you experience stinging, burning, or frequent irritation?</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
            <SelectionCard
              title="Yes, my skin is sensitive"
              description="I need gentle, fragrance-free products."
              selected={profile.sensitivity === true}
              onClick={() => setProfile({ ...profile, sensitivity: true })}
            />
            <SelectionCard
              title="No, my skin is resilient"
              description="I can tolerate active ingredients well."
              selected={profile.sensitivity === false}
              onClick={() => setProfile({ ...profile, sensitivity: false })}
            />
        </div>
        <div className="flex justify-between pt-8">
            <Button variant="ghost" onClick={handlePrevStep}>Back</Button>
            <Button 
                onClick={handleGenerate}
                variant="primary"
            >
                Generate My Routine
            </Button>
        </div>
      </div>
    ];

    return (
      <div className="animate-fade-in w-full max-w-3xl mx-auto">
        <div className="mb-8">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary-500 transition-all duration-500 ease-out"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">Step {step + 1} of {steps.length}</p>
        </div>
        {steps[step]}
      </div>
    );
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 animate-pulse">
        <div className="relative">
            <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="bg-white p-6 rounded-full shadow-xl relative z-10">
                <RefreshCw size={48} className="text-primary-600 animate-spin" />
            </div>
        </div>
      <h2 className="text-2xl font-bold text-slate-800">Analysing your profile...</h2>
      <p className="text-slate-500 max-w-md">
        Our AI dermatologist is reviewing your skin type ({profile.skinType}) and concerns to formulate the perfect regimen.
      </p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
      <AlertCircle size={64} className="text-red-500" />
      <h2 className="text-2xl font-bold text-slate-800">Something went wrong</h2>
      <p className="text-slate-500 max-w-md">{error}</p>
      <Button onClick={() => setAppState(AppState.QUIZ)}>Try Again</Button>
    </div>
  );

  const renderResults = () => {
    if (!routine) return null;

    return (
      <div className="animate-fade-in space-y-12 pb-12" ref={resultsRef}>
        {/* Header Analysis */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-6">
                <Sparkles size={16} />
                Personalized for {profile.name}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Your Skin Analysis</h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-4xl mx-auto">
                {routine.analysis}
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            {/* Morning Routine */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                        <Sun size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Morning Routine</h3>
                </div>
                {routine.morningRoutine.map((step, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Step {idx + 1}</span>
                            <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">{step.stepName}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{step.productType}</h4>
                        <p className="text-slate-500 text-sm mb-4">{step.reason}</p>
                        
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {step.keyIngredients.map((ing, i) => (
                                    <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium border border-slate-200">
                                        {ing}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              <span className="font-semibold text-slate-600">Why it works:</span> {step.ingredientBenefits}
                            </p>

                             {/* Market Picks */}
                            <div className="mt-2 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShoppingBag size={14} className="text-primary-600" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Affordable Picks</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {step.marketRecommendations.map((prod, pIdx) => (
                                        <div key={pIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center group/item hover:border-primary-200 transition-colors">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800">{prod.brand}</div>
                                                <div className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[150px]" title={prod.name}>{prod.name}</div>
                                            </div>
                                            <div className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full whitespace-nowrap">
                                                {prod.approxPrice}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-amber-50/50 p-3 rounded-lg flex gap-3 items-start border border-amber-100/50">
                                <Info size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-slate-600 italic">{step.usageTips}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Evening Routine */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                        <Moon size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Evening Routine</h3>
                </div>
                {routine.eveningRoutine.map((step, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Step {idx + 1}</span>
                            <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">{step.stepName}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{step.productType}</h4>
                        <p className="text-slate-500 text-sm mb-4">{step.reason}</p>
                        
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {step.keyIngredients.map((ing, i) => (
                                    <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium border border-slate-200">
                                        {ing}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              <span className="font-semibold text-slate-600">Why it works:</span> {step.ingredientBenefits}
                            </p>

                             {/* Market Picks */}
                            <div className="mt-2 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShoppingBag size={14} className="text-primary-600" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Affordable Picks</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {step.marketRecommendations.map((prod, pIdx) => (
                                        <div key={pIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center group/item hover:border-primary-200 transition-colors">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800">{prod.brand}</div>
                                                <div className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[150px]" title={prod.name}>{prod.name}</div>
                                            </div>
                                            <div className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full whitespace-nowrap">
                                                {prod.approxPrice}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                             <div className="bg-indigo-50/50 p-3 rounded-lg flex gap-3 items-start border border-indigo-100/50">
                                <Info size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-slate-600 italic">{step.usageTips}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Additional Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-secondary-50 rounded-3xl p-8 border border-secondary-100">
                <h3 className="text-xl font-bold text-secondary-900 mb-6 flex items-center gap-2">
                   <span className="bg-secondary-200 p-1.5 rounded-lg"><ThumbsUp size={18} className="text-secondary-700"/></span>
                   Lifestyle Tips
                </h3>
                <ul className="space-y-4">
                    {routine.dietaryTips.map((tip, idx) => (
                        <li key={idx} className="flex gap-3 items-start">
                            <div className="h-2 w-2 rounded-full bg-secondary-400 mt-2 shrink-0" />
                            <span className="text-secondary-800">{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-slate-100 rounded-3xl p-8 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <span className="bg-slate-200 p-1.5 rounded-lg"><AlertCircle size={18} className="text-slate-700"/></span>
                   Ingredients to Avoid
                </h3>
                <div className="flex flex-wrap gap-3">
                    {routine.avoidIngredients.map((item, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium">
                            🚫 {item}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex justify-center pt-12">
             <Button variant="outline" size="lg" onClick={resetApp} className="gap-2">
                <RefreshCw size={20} />
                Start New Analysis
             </Button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      {appState === AppState.WELCOME && renderWelcome()}
      {appState === AppState.QUIZ && renderQuiz()}
      {appState === AppState.LOADING && renderLoading()}
      {appState === AppState.RESULTS && renderResults()}
      {appState === AppState.ERROR && renderError()}
    </Layout>
  );
};

export default App;