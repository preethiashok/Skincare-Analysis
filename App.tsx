import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Droplets, 
  Sun, 
  Moon, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  User,
  Activity,
  ThumbsUp,
  RefreshCw,
  ShoppingBag,
  Printer,
  Save,
  Trash2,
  FileText,
  Heart,
  Star,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Button } from './components/Button';
import { SelectionCard } from './components/SelectionCard';
import { generateSkincareRoutine } from './services/geminiService';
import { 
  AppState, 
  SkinType, 
  SkinConcern, 
  UserProfile, 
  RoutineResponse,
  SavedRoutine
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
  [SkinConcern.ACNE]: "✨",
  [SkinConcern.WRINKLES]: "💖",
  [SkinConcern.DARK_SPOTS]: "🌟",
  [SkinConcern.REDNESS]: "🌸",
  [SkinConcern.DULLNESS]: "☁️",
  [SkinConcern.TEXTURE]: "🎀",
  [SkinConcern.PORES]: "🫧",
  [SkinConcern.DRYNESS]: "💧"
};

const STORAGE_KEY = 'glowguide_saved_routine';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasSavedRoutine, setHasSavedRoutine] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    skinType: null,
    concerns: [],
    sensitivity: false
  });

  const [routine, setRoutine] = useState<RoutineResponse | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for saved routine on mount
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setHasSavedRoutine(true);
    }
  }, []);

  useEffect(() => {
    if (appState === AppState.RESULTS && resultsRef.current) {
        // Short timeout to ensure render is complete
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
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

  const saveRoutine = () => {
    if (routine && profile) {
      const savedData: SavedRoutine = {
        profile,
        routine,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
      setHasSavedRoutine(true);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const loadSavedRoutine = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: SavedRoutine = JSON.parse(saved);
        setProfile(parsed.profile);
        setRoutine(parsed.routine);
        setAppState(AppState.RESULTS);
      } catch (e) {
        console.error("Failed to parse saved routine");
        localStorage.removeItem(STORAGE_KEY);
        setHasSavedRoutine(false);
      }
    }
  };

  const deleteSavedRoutine = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasSavedRoutine(false);
    // If we are currently viewing the saved routine, reset
    if (appState === AppState.RESULTS) {
        resetApp();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetApp = () => {
    setProfile({ name: '', skinType: null, concerns: [], sensitivity: false });
    setStep(0);
    setAppState(AppState.WELCOME);
    setRoutine(null);
  };

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in-up">
      <div className="bg-white p-10 rounded-full shadow-[0_20px_50px_rgba(236,72,153,0.3)] mb-4 border-[6px] border-primary-100 relative">
        <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <Sparkles size={72} className="text-primary-500 relative z-10" />
      </div>
      <div className="space-y-4 max-w-2xl px-4">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
          Hi Barbie! <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-400">Let's Glow</span>
        </h1>
        <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed font-light">
          Your AI beauty bestie is here to curate the perfect routine just for you.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md px-4">
        <Button 
          size="lg" 
          onClick={() => setAppState(AppState.QUIZ)} 
          className="flex-1 group shadow-xl shadow-primary-300/50 hover:shadow-primary-400/60 rounded-full py-6 text-lg"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>

        {hasSavedRoutine && (
           <Button 
            size="lg" 
            variant="secondary"
            onClick={loadSavedRoutine} 
            className="flex-1 group rounded-full py-6 text-lg bg-white text-primary-600 border-2 border-primary-100 hover:bg-primary-50"
          >
            <FileText className="mr-2 h-5 w-5" />
            My Routine
          </Button>
        )}
      </div>
    </div>
  );

  const renderQuiz = () => {
    const steps = [
      // Step 0: Name
      <div key="name" className="space-y-8 max-w-md mx-auto py-8">
        <div className="text-center space-y-3">
            <h2 className="text-4xl font-extrabold text-slate-900">Let's be friends!</h2>
            <p className="text-primary-600 text-xl font-medium">What's your name?</p>
        </div>
        <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-300 h-6 w-6 group-focus-within:text-primary-500 transition-colors" />
            <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Type your name..."
                className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-primary-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all text-xl shadow-sm placeholder:text-primary-200"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && profile.name.trim() && handleNextStep()}
            />
        </div>
        <Button 
            className="w-full rounded-3xl py-4 text-lg" 
            disabled={!profile.name.trim()} 
            onClick={handleNextStep}
        >
            Next Step
        </Button>
      </div>,

      // Step 1: Skin Type
      <div key="type" className="space-y-6">
        <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-slate-900">What's your skin vibe?</h2>
            <p className="text-slate-500 text-lg">Help us understand your canvas.</p>
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
                setTimeout(handleNextStep, 300);
              }}
            />
          ))}
        </div>
        <div className="flex justify-start pt-4">
            <Button variant="ghost" onClick={handlePrevStep} className="text-primary-400 hover:text-primary-600 hover:bg-primary-50">Back</Button>
        </div>
      </div>,

      // Step 2: Concerns
      <div key="concerns" className="space-y-6">
        <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Skin Goals</h2>
            <p className="text-slate-500 text-lg">Select what you want to improve.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.values(SkinConcern).map((concern) => (
            <SelectionCard
              key={concern}
              title={concern}
              selected={profile.concerns.includes(concern)}
              multiSelect
              icon={<span className="text-xl filter drop-shadow-sm">{ConcernIcons[concern]}</span>}
              onClick={() => toggleConcern(concern)}
            />
          ))}
        </div>
        <div className="flex justify-between pt-8 items-center">
            <Button variant="ghost" onClick={handlePrevStep} className="text-primary-400 hover:text-primary-600 hover:bg-primary-50">Back</Button>
            <Button 
                onClick={handleNextStep}
                disabled={profile.concerns.length === 0}
                className="rounded-full px-8"
            >
                Next Step
            </Button>
        </div>
      </div>,

      // Step 3: Sensitivity
      <div key="sensitivity" className="space-y-6 max-w-lg mx-auto">
        <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Sensitive soul?</h2>
            <p className="text-slate-500 text-lg">How does your skin react to new friends?</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
            <SelectionCard
              title="Yes, it's delicate"
              description="I need gentle, loving care."
              selected={profile.sensitivity === true}
              onClick={() => setProfile({ ...profile, sensitivity: true })}
            />
            <SelectionCard
              title="No, it's resilient"
              description="My skin can handle stronger actives."
              selected={profile.sensitivity === false}
              onClick={() => setProfile({ ...profile, sensitivity: false })}
            />
        </div>
        <div className="flex justify-between pt-8 items-center">
            <Button variant="ghost" onClick={handlePrevStep} className="text-primary-400 hover:text-primary-600 hover:bg-primary-50">Back</Button>
            <Button 
                onClick={handleGenerate}
                variant="primary"
                className="shadow-xl shadow-primary-300/50 rounded-full px-10 py-4 text-lg animate-bounce-slow"
            >
                Create My Routine ✨
            </Button>
        </div>
      </div>
    ];

    return (
      <div className="animate-fade-in w-full max-w-3xl mx-auto">
        <div className="mb-10 px-4">
            <div className="h-4 w-full bg-white rounded-full overflow-hidden shadow-inner border border-primary-50">
                <div 
                    className="h-full bg-gradient-to-r from-primary-300 via-primary-500 to-primary-400 transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
            </div>
        </div>
        {steps[step]}
      </div>
    );
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8">
        <div className="relative">
            <div className="absolute inset-0 bg-primary-300 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="bg-white p-10 rounded-full shadow-2xl relative z-10 border-4 border-primary-100">
                <Sparkles size={64} className="text-primary-500 animate-spin" />
            </div>
        </div>
      <h2 className="text-4xl font-bold text-slate-800 animate-pulse">Formulating Magic...</h2>
      <p className="text-primary-600 text-lg max-w-md font-medium">
        Designing the perfect routine for your {profile.skinType?.toLowerCase()} skin.
      </p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
      <div className="bg-red-50 p-6 rounded-full">
        <AlertCircle size={64} className="text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800">Oops!</h2>
      <p className="text-slate-500 max-w-md">{error}</p>
      <Button onClick={() => setAppState(AppState.QUIZ)} variant="secondary">Try Again</Button>
    </div>
  );

  const renderResults = () => {
    if (!routine) return null;

    return (
      <div className="animate-fade-in space-y-8 pb-12 w-full" ref={resultsRef}>
        
        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-primary-200 shadow-lg shadow-primary-100/50 no-print sticky top-4 z-40 transition-all">
            <div className="flex items-center gap-2">
                <div className="bg-primary-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary-600" />
                </div>
                <span className="font-bold text-slate-700">for {profile.name}</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <Button onClick={saveRoutine} variant="secondary" size="sm" className="whitespace-nowrap rounded-full bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100">
                    <Save className="mr-2 h-4 w-4" />
                    {showSaveSuccess ? 'Saved!' : 'Save Routine'}
                </Button>
                <Button onClick={handlePrint} variant="secondary" size="sm" className="whitespace-nowrap rounded-full bg-white text-slate-600 border-slate-200 hover:bg-slate-50">
                    <Printer className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
                <Button onClick={resetApp} variant="ghost" size="sm" className="whitespace-nowrap text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Start Over
                </Button>
            </div>
        </div>

        {/* Analysis Section */}
        <div className="bg-gradient-to-br from-white to-primary-50 rounded-3xl p-8 border-2 border-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-primary-500" />
                <h2 className="text-2xl font-bold text-slate-900">Your Skin Analysis</h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-lg">{routine.analysis}</p>
        </div>

        {/* Routines Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Morning Routine */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <Sun className="text-amber-500 h-8 w-8" />
                    <h3 className="text-2xl font-bold text-slate-800">Morning Glow</h3>
                </div>
                <div className="space-y-6">
                    {routine.morningRoutine.map((step, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow break-inside-avoid">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-xs font-bold tracking-wider text-primary-500 uppercase bg-primary-50 px-3 py-1 rounded-full">{step.stepName}</span>
                                    <h4 className="text-xl font-bold text-slate-800 mt-2">{step.productType}</h4>
                                </div>
                                <div className="h-8 w-8 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 font-bold text-sm">
                                    {idx + 1}
                                </div>
                            </div>
                            
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">{step.reason}</p>
                            
                            <div className="mb-4 bg-slate-50 p-3 rounded-2xl">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {step.keyIngredients.map((ing, i) => (
                                        <span key={i} className="text-xs font-medium bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600">
                                            {ing}
                                        </span>
                                    ))}
                                </div>
                                {step.ingredientBenefits && (
                                    <div className="text-xs text-slate-500 mt-2 flex gap-2 items-start">
                                        <Info size={14} className="mt-0.5 shrink-0 text-primary-400" />
                                        <span>{step.ingredientBenefits}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100 pt-4 mt-4">
                                <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700">
                                    <ShoppingBag size={16} className="text-primary-500" />
                                    Market Finds
                                </div>
                                <ul className="space-y-3">
                                    {step.marketRecommendations.map((prod, pIdx) => (
                                        <li key={pIdx} className="group">
                                            <div className="flex justify-between items-baseline">
                                                <span className="font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">{prod.name}</span>
                                                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">{prod.approxPrice}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 mb-1">{prod.brand}</div>
                                            
                                            {/* Substitutes Section */}
                                            {prod.substitutes && prod.substitutes.length > 0 && (
                                                <div className="mt-2 text-xs bg-primary-50/50 p-2 rounded-lg border border-primary-50">
                                                    <span className="font-semibold text-primary-600">Or try: </span>
                                                    <span className="text-slate-600">{prod.substitutes.join(", ")}</span>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Evening Routine */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                    <Moon className="text-indigo-500 h-8 w-8" />
                    <h3 className="text-2xl font-bold text-slate-800">Evening Repair</h3>
                </div>
                <div className="space-y-6">
                    {routine.eveningRoutine.map((step, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow break-inside-avoid">
                             <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-xs font-bold tracking-wider text-indigo-500 uppercase bg-indigo-50 px-3 py-1 rounded-full">{step.stepName}</span>
                                    <h4 className="text-xl font-bold text-slate-800 mt-2">{step.productType}</h4>
                                </div>
                                <div className="h-8 w-8 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 font-bold text-sm">
                                    {idx + 1}
                                </div>
                            </div>
                            
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">{step.reason}</p>
                            
                             <div className="mb-4 bg-slate-50 p-3 rounded-2xl">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {step.keyIngredients.map((ing, i) => (
                                        <span key={i} className="text-xs font-medium bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600">
                                            {ing}
                                        </span>
                                    ))}
                                </div>
                                {step.ingredientBenefits && (
                                    <div className="text-xs text-slate-500 mt-2 flex gap-2 items-start">
                                        <Info size={14} className="mt-0.5 shrink-0 text-indigo-400" />
                                        <span>{step.ingredientBenefits}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100 pt-4 mt-4">
                                <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700">
                                    <ShoppingBag size={16} className="text-indigo-500" />
                                    Market Finds
                                </div>
                                <ul className="space-y-3">
                                    {step.marketRecommendations.map((prod, pIdx) => (
                                        <li key={pIdx} className="group">
                                            <div className="flex justify-between items-baseline">
                                                <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{prod.name}</span>
                                                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">{prod.approxPrice}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 mb-1">{prod.brand}</div>
                                            
                                            {/* Substitutes Section */}
                                            {prod.substitutes && prod.substitutes.length > 0 && (
                                                <div className="mt-2 text-xs bg-indigo-50/50 p-2 rounded-lg border border-indigo-50">
                                                    <span className="font-semibold text-indigo-600">Or try: </span>
                                                    <span className="text-slate-600">{prod.substitutes.join(", ")}</span>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Tips Section */}
        <div className="grid md:grid-cols-2 gap-8 print-break-inside-avoid">
            <div className="bg-green-50 rounded-3xl p-8 border border-green-100">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Lifestyle Tips
                </h3>
                <ul className="space-y-3">
                    {routine.dietaryTips.map((tip, idx) => (
                        <li key={idx} className="flex gap-3 text-green-900/80">
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
             <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Avoid These
                </h3>
                <ul className="space-y-3">
                    {routine.avoidIngredients.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-red-900/80">
                            <span className="h-2 w-2 mt-2 rounded-full bg-red-400 shrink-0"></span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        
        {/* Footer actions for saved routines */}
        {hasSavedRoutine && (
            <div className="flex justify-center pt-8 border-t border-slate-100 no-print">
                <Button 
                    variant="ghost" 
                    onClick={deleteSavedRoutine}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Saved Routine
                </Button>
            </div>
        )}
      </div>
    );
  };

  return (
    <>
        <div className="bg-primary-50 min-h-screen">
            <div className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-primary-100 no-print">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
                        <div className="bg-primary-500 p-2 rounded-xl shadow-lg shadow-primary-200">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">
                            Glow<span className="text-primary-500">Guide</span>
                        </span>
                    </div>
                </div>
            </div>
            <main className="container max-w-5xl mx-auto px-4 py-8 sm:py-12">
                {appState === AppState.WELCOME && renderWelcome()}
                {appState === AppState.QUIZ && renderQuiz()}
                {appState === AppState.LOADING && renderLoading()}
                {appState === AppState.ERROR && renderError()}
                {appState === AppState.RESULTS && renderResults()}
            </main>
             <footer className="py-8 text-center text-slate-400 text-sm no-print">
                <p>© {new Date().getFullYear()} GlowGuide AI. Stay fabulous! 💖</p>
            </footer>
        </div>
    </>
  );
};

export default App;