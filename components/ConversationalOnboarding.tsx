"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ArrowRight, ArrowLeft, CheckCircle, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface OnboardingData {
  // Brand data (Step 1)
  company_name: string;
  brand_description: string;
  tone_of_voice: string;
  target_audience: string;
  region: string;

  // Launch data (Steps 2 & 3)
  launch_description: string;
  launch_type: string;
  goal: string;
  channels: string[];
  launch_date: string;
  context_notes: string;
}

interface ConversationalOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
  isSubmitting?: boolean;
}

type FormFieldWithOptions = {
  id: keyof OnboardingData;
  label: string;
  type: "select" | "multiselect";
  options: { value: string; label: string }[];
  required: boolean;
};

type FormFieldWithoutOptions = {
  id: keyof OnboardingData;
  label: string;
  type: "text" | "textarea" | "date";
  placeholder?: string;
  required: boolean;
};

type FormField = FormFieldWithOptions | FormFieldWithoutOptions;

function hasOptions(field: FormField): field is FormFieldWithOptions {
  return 'options' in field && Array.isArray(field.options);
}

const toneOfVoiceOptions = [
  { value: "casual", label: "Casual" },
  { value: "confident", label: "Confident" },
  { value: "playful", label: "Playful" },
  { value: "professional", label: "Professional" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
];

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "pr", label: "PR" },
  { value: "community", label: "Community" },
  { value: "other", label: "Other" },
];

const regionOptions = [
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Spain", label: "Spain" },
  { value: "Italy", label: "Italy" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Other", label: "Other" },
];

const brandStepFields: FormField[] = [
  {
    id: "company_name",
    label: "Brand name",
    type: "text",
    placeholder: "e.g. Vibe Aura",
    required: true,
  },
  {
    id: "brand_description",
    label: "Brand description",
    type: "textarea",
    placeholder: "Design-led padel lifestyle brand focused on presence and simplicity.",
    required: true,
  },
  {
    id: "tone_of_voice",
    label: "Tone of voice",
    type: "select",
    options: toneOfVoiceOptions,
    required: true,
  },
  {
    id: "target_audience",
    label: "Target audience",
    type: "text",
    placeholder: "Padel players, design-conscious 25–40s, EU-based.",
    required: true,
  },
  {
    id: "region",
    label: "Region",
    type: "select",
    options: regionOptions,
    required: true,
  },
];

const step2Fields: FormField[] = [
  {
    id: "launch_description",
    label: "What are you launching?",
    type: "textarea",
    placeholder: "Tell us, briefly, what it is you are launching",
    required: true,
  },
  {
    id: "launch_type",
    label: "Type of product",
    type: "text",
    placeholder: "e.g. Apparel, Digital Product, Course, Event",
    required: true,
  },
  {
    id: "goal",
    label: "Primary goal",
    type: "textarea",
    placeholder: "Tell us what your primary goal is, sales, signups, pre-orders etc",
    required: true,
  },
];

const step3Fields: FormField[] = [
  {
    id: "channels",
    label: "What platforms are you using?",
    type: "multiselect",
    options: platformOptions,
    required: true,
  },
  {
    id: "launch_date",
    label: "When are you launching?",
    type: "date",
    placeholder: "Date picker",
    required: true,
  },
  {
    id: "context_notes",
    label: "Anything else we should know?",
    type: "textarea",
    placeholder: "Tell us, briefly, what it is you are launching",
    required: false,
  },
];

export default function ConversationalOnboarding({
  isOpen,
  onClose,
  onComplete,
  isSubmitting = false
}: ConversationalOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    // Brand data (Step 1)
    company_name: "",
    brand_description: "",
    tone_of_voice: "",
    target_audience: "",
    region: "United Kingdom",

    // Launch data (Steps 2 & 3)
    launch_description: "",
    launch_type: "",
    goal: "",
    channels: [],
    launch_date: "",
    context_notes: "",
  });

  const getCurrentFields = () => {
    switch (currentStep) {
      case 0: return brandStepFields;
      case 1: return step2Fields;
      case 2: return step3Fields;
      default: return [];
    }
  };

  const currentFields = getCurrentFields();

  const updateFormData = (field: keyof OnboardingData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(platform)
        ? prev.channels.filter(p => p !== platform)
        : [...prev.channels, platform]
    }));
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsGenerating(true);
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0: return "Before we plan your first launch, tell us a bit about your brand.";
      case 1: return "Let's set up your first Launch Plan";
      case 2: return "Where you'll launch";
      default: return "Let's set up your first Launch Plan";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 0: return "This helps us tailor tone, messaging, and strategy to your style.";
      case 1: return "We'll capture some basic details and generate your plan, you can tweak it later if needed.";
      case 2: return "Tell us about your launch channels and timeline.";
      default: return "We'll capture some basic details and generate your plan, you can tweak it later if needed.";
    }
  };

  const isCurrentStepValid = () => {
    return currentFields.every(field => {
      if (field.required) {
        const value = formData[field.id as keyof OnboardingData];
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value && value.toString().trim() !== "";
      }
      return true;
    });
  };


  if (!isOpen) return null;

  // Show generating screen
  if (isGenerating) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[600px] w-[600px] min-h-[400px] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Generating Launch Plan</DialogTitle>
          <div className="flex flex-col items-center justify-center p-12 gap-8 w-full h-full bg-slate-50 rounded-xl">
            {/* Logo */}
            <div className="flex flex-row items-center p-0 gap-2 w-[146px] h-[25px] flex-none order-0 flex-grow-0">
              <img src="/Clearlaunch-logo-light.svg" alt="ClearLaunch" className="h-6 w-auto" />
            </div>

            {/* Generating Content */}
            <div className="flex flex-col items-center gap-6 text-center">
              {/* Spinner */}
              <div className="relative">
                <div className="w-16 h-16 border-4 border-cyan-200 rounded-full animate-spin border-t-cyan-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-3">
                <h2 className="text-3xl font-semibold leading-9 tracking-tight text-slate-800">
                  Generating your launch plan
                </h2>
                <p className="text-lg leading-7 text-slate-500 max-w-md">
                  Our AI is crafting a personalised launch strategy tailored to your brand and goals. This will just take a moment...
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-cyan-200 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1060px] w-[1060px] min-h-[667px] max-h-[90vh] p-0 overflow-y-auto">
        <DialogTitle className="sr-only">Onboarding Setup</DialogTitle>
        <div className="flex flex-row items-center p-10 gap-10 w-full h-full bg-slate-50 rounded-xl">
          {/* Left Column - Form */}
          <div className="flex flex-col items-start p-0 gap-4 w-[460px] flex-none order-0 flex-grow-0">
            {/* Header Content */}
            <div className="flex flex-col items-start p-0 gap-6 w-[460px] flex-none order-0 self-stretch flex-grow-0">
              {/* Logo and Branding */}
              <div className="flex flex-row items-center p-0 gap-2 w-[146px] h-[25px] flex-none order-0 flex-grow-0">
                <img src="/Clearlaunch-logo-light.svg" alt="ClearLaunch" className="h-6 w-auto" />
              </div>

              {/* Welcome Message */}
              <div className="flex flex-col items-start p-0 gap-3 w-[460px] flex-none order-1 self-stretch flex-grow-0">
                <h2 className="w-[460px] text-3xl font-semibold leading-9 tracking-tight text-slate-800 flex-none order-0 self-stretch flex-grow-0">
                  {getStepTitle()}
                </h2>
                <p className="w-[460px] text-base leading-7 text-slate-500 flex-none order-1 self-stretch flex-grow-0">
                  {getStepDescription()}
                </p>
                <p className="w-[460px] h-5 text-xs font-medium leading-5 text-slate-500 flex-none order-2 self-stretch flex-grow-0">
                  Step {currentStep + 1}/3
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col items-start p-0 gap-4 w-[460px] flex-none order-1 self-stretch flex-grow-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full space-y-4"
                >
                  {currentFields.map((field) => (
                    <div key={field.id} className="w-full">
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={formData[field.id as keyof OnboardingData] as string}
                          onChange={(e) => updateFormData(field.id as keyof OnboardingData, e.target.value)}
                          placeholder={'placeholder' in field ? field.placeholder : undefined}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-cyan-500 focus:outline-none bg-white resize-none"
                        />
                      ) : field.type === "date" ? (
                        <input
                          type="date"
                          value={formData[field.id as keyof OnboardingData] as string}
                          onChange={(e) => updateFormData(field.id as keyof OnboardingData, e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-cyan-500 focus:outline-none bg-white"
                        />
                      ) : field.type === "multiselect" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between pr-1"
                            >
                              <span>
                                {(formData[field.id as keyof OnboardingData] as string[]).length > 0
                                  ? `${(formData[field.id as keyof OnboardingData] as string[]).length} platform(s) selected`
                                  : "Select platforms"}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                            {hasOptions(field) && field.options.map((option) => (
                              <DropdownMenuCheckboxItem
                                key={option.value}
                                checked={(formData[field.id as keyof OnboardingData] as string[]).includes(option.value)}
                                onCheckedChange={() => togglePlatform(option.value)}
                                className="cursor-pointer"
                              >
                                {option.label}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : field.type === "select" ? (
                        <select
                          value={formData[field.id as keyof OnboardingData] as string}
                          onChange={(e) => updateFormData(field.id as keyof OnboardingData, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-cyan-500 focus:outline-none bg-white"
                        >
                          <option value="">Select {field.label.toLowerCase()}</option>
                          {hasOptions(field) && field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formData[field.id as keyof OnboardingData] as string}
                          onChange={(e) => updateFormData(field.id as keyof OnboardingData, e.target.value)}
                          placeholder={'placeholder' in field ? field.placeholder : undefined}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-cyan-500 focus:outline-none bg-white"
                        />
                      )}
                    </div>
                  ))}

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={!isCurrentStepValid() || isSubmitting}
                      className="flex items-center gap-2 px-6 py-2 text-white bg-gradient-to-r from-sky-500 to-indigo-500 shadow-lg shadow-sky-900/20 hover:from-sky-400 hover:to-indigo-400 hover:shadow-sky-900/40 border border-transparent rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          Generating...
                        </div>
                      ) : (
                        <>
                          {currentStep === 2 ? "Generate Plan" : "Continue"}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Benefits */}
          <div className="flex flex-col justify-center items-start p-6 gap-6 w-[480px] bg-cyan-50 rounded-lg flex-none order-1 self-stretch flex-grow-0">
            <h2 className="w-[432px] text-3xl font-semibold leading-9 tracking-tight text-cyan-900 flex-none order-0 self-stretch flex-grow-0">
              Turn your ideas into launches, without the chaos.
            </h2>

            <div className="flex flex-col items-start p-0 gap-5 w-[432px] flex-none order-1 self-stretch flex-grow-0">
              {/* Benefit 1 */}
              <div className="flex flex-row items-center p-0 gap-2 w-[432px] flex-none order-0 self-stretch flex-grow-0">
                <CheckCircle className="w-6 h-6 text-cyan-900 flex-none order-0 flex-grow-0" />
                <p className="w-[400px] text-xl leading-7 text-cyan-900 flex-none order-1 flex-grow-1">
                  Plan launches 5x faster with automated task lists.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="flex flex-row items-center p-0 gap-2 w-[432px] flex-none order-1 self-stretch flex-grow-0">
                <CheckCircle className="w-6 h-6 text-cyan-900 flex-none order-0 flex-grow-0" />
                <p className="w-[400px] text-xl leading-7 text-cyan-900 flex-none order-1 flex-grow-1">
                  Work smarter, not harder with guided launch strategies.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="flex flex-row items-center p-0 gap-2 w-[432px] flex-none order-2 self-stretch flex-grow-0">
                <CheckCircle className="w-6 h-6 text-cyan-900 flex-none order-0 flex-grow-0" />
                <p className="w-[400px] text-xl leading-7 text-cyan-900 flex-none order-1 flex-grow-1">
                  Stay on track and hit every milestone on time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

