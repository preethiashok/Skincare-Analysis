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
  ShoppingBag,
  Printer,
  Save,
  Trash2,
  FileText,
  Repeat
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
  [SkinConcern.ACNE]: "🔴",
  [SkinConcern.WRINKLES]: "👵",
  [SkinConcern.DARK_SPOTS]: "🌑",
  [SkinConcern.REDNESS]: "☺️",
  [SkinConcern.DULLNESS]: "☁️",
  [SkinConcern.TEXTURE]: "🧱",
  [SkinConcern.PORES]: "🕳️",
  [SkinConcern.DRYNESS]: "🏜️"
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in-up">
      <div className="bg-white p-8 rounded-full shadow-2xl shadow-primary-200 mb-4 border-4 border-primary-100">
        <Sparkles size={64} className="text-primary-500" />
      </div>
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900">
          Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-600">Dream Skin</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
          Your personal AI beauty consultant is here. Get a custom routine tailored to your unique sparkle.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button 
          size="lg" 
          onClick={() => setAppState(AppState.QUIZ)} 
          className="group shadow-xl shadow-primary-300/50 hover:shadow-primary-400/60 rounded-full px-10"
        >
          Start Assessment
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>

        {hasSavedRoutine && (
           <Button 
            size="lg" 
            variant="secondary"
            onClick={loadSavedRoutine} 
            className="group rounded-full"
          >
            <FileText className="mr-2 h-5 w-5" />
            View Saved Routine
          </Button>
        )}
      </div>
      
      <div className="mt-12 grid grid-cols-3 gap-8 text-center text-sm text-slate-500">
        <div>
            <div className="font-bold text-primary-600 text-lg">100%</div>
            <div>Personalized</div>
        </div>
        <div>
            <div className="font-bold text-primary-600 text-lg">Science</div>
            <div>Backed</div>
        </div>
        <div>
            <div className="font-bold text-primary-600 text-lg">Instant</div>
            <div>Glow</div>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const steps = [
      // Step 0: Name
      <div key="name" className="space-y-6 max-w-md mx-auto">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Hey gorgeous! ✨</h2>
            <p className="text-slate-500 text-lg">What should we call you?</p>
        </div>
        <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300 h-5 w-5" />
            <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your Name"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-primary-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all text-lg shadow-sm"
                autoFocus
            />
        </div>
        <Button 
            className="w-full rounded-2xl" 
            disabled={!profile.name.trim()} 
            onClick={handleNextStep}
        >
            Next Step
        </Button>
      </div>,

      // Step 1: Skin Type
      <div key="type" className="space-y-6">
        <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">What's your skin type?</h2>
            <p className="text-slate-500">Pick the one that feels like you</p>
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
            <h2 className="text-2xl font-bold text-slate-900">Skin Goals</h2>
            <p className="text-slate-500">Select everything you want to work on</p>
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
            <h2 className="text-2xl font-bold text-slate-900">Sensitive side?</h2>
            <p className="text-slate-500">Does your skin react easily to new products?</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
            <SelectionCard
              title="Yes, it's sensitive"
              description="I need gentle, fragrance-free care."
              selected={profile.sensitivity === true}
              onClick={() => setProfile({ ...profile, sensitivity: true })}
            />
            <SelectionCard
              title="No, it's pretty resilient"
              description="I can handle active ingredients."
              selected={profile.sensitivity === false}
              onClick={() => setProfile({ ...profile, sensitivity: false })}
            />
        </div>
        <div className="flex justify-between pt-8">
            <Button variant="ghost" onClick={handlePrevStep}>Back</Button>
            <Button 
                onClick={handleGenerate}
                variant="primary"
                className="shadow-xl shadow-primary-300/50"
            >
                Reveal My Routine
            </Button>
        </div>
      </div>
    ];

    return (
      <div className="animate-fade-in w-full max-w-3xl mx-auto">
        <div className="mb-8">
            <div className="h-3 w-full bg-white rounded-full overflow-hidden shadow-inner">
                <div 
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
            </div>
            <p className="text-xs text-primary-400 mt-2 text-right font-medium">Step {step + 1} of {steps.length}</p>
        </div>
        {steps[step]}
      </div>
    );
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 animate-pulse">
        <div className="relative">
            <div className="absolute inset-0 bg-primary-300 rounded-full blur-2xl opacity-40 animate-pulse"></div>
            <div className="bg-white p-8 rounded-full shadow-2xl relative z-10 border-4 border-primary-50">
                <RefreshCw size={56} className="text-primary-500 animate-spin" />
            </div>
        </div>
      <h2 className="text-3xl font-bold text-slate-800">Formulating Magic...</h2>
      <p className="text-slate-500 max-w-md">
        Designing the perfect routine for your {profile.skinType.toLowerCase()} skin.
      </p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
      <AlertCircle size={64} className="text-red-400" />
      <h2 className="text-2xl font-bold text-slate-800">Oops!</h2>
      <p className="text-slate-500 max-w-md">{error}</p>
      <Button onClick={() => setAppState(AppState.QUIZ)}>Try Again</Button>
    </div>
  );

  const renderResults = () => {
    if (!routine) return null;

    return (
      <div className="animate-fade-in space-y-8 pb-12" ref={resultsRef}>
        
        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur p-4 rounded-2xl border border-primary-100 shadow-sm no-print sticky top-20 z-40">
            <div className="