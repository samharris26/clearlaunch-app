"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Check, Zap } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'launches' | 'ai';
  currentPlan: 'free' | 'pro' | 'power';
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: ['1 active launch', '20 AI credits per month', 'AI task tools disabled'],
    current: false,
    recommended: false,
  },
  {
    name: 'Pro',
    price: '£10',
    period: '/month',
    description: 'For growing businesses',
    features: ['3 active launches', '100 AI calls/month', 'Advanced templates', 'Priority support'],
    current: false,
    recommended: true,
  },
  {
    name: 'Power',
    price: '£30',
    period: '/month',
    description: 'For power users and agencies',
    features: ['10 active launches', '300 AI calls/month', 'All templates', 'Priority AI access', 'Advanced analytics'],
    current: false,
    recommended: false,
  }
];

export default function UpgradeModal({ isOpen, onClose, type, currentPlan }: UpgradeModalProps) {
  const getTitle = () => {
    if (type === 'launches') {
      return "You've reached your launch limit";
    } else {
      return "You've reached your AI call limit";
    }
  };

  const getDescription = () => {
    if (type === 'launches') {
      return "Upgrade to create more launches and unlock advanced features.";
    } else {
      return "Upgrade to unlock more AI-powered features and create better launch plans.";
    }
  };

  const getCurrentPlanIndex = () => {
    switch (currentPlan) {
      case 'free': return 0;
      case 'pro': return 1;
      case 'power': return 2;
      default: return 0;
    }
  };

  const currentPlanIndex = getCurrentPlanIndex();
  const plansWithCurrent = plans.map((plan, index) => ({
    ...plan,
    current: index === currentPlanIndex
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Zap className="h-6 w-6 text-cyan-500" />
                {getTitle()}
              </DialogTitle>
              <DialogDescription className="text-base text-slate-600 mt-2">
                {getDescription()}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </DialogHeader>

        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansWithCurrent.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border-2 p-6 transition-all ${
                  plan.current
                    ? 'border-cyan-500 bg-cyan-50'
                    : plan.recommended
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}
                
                {plan.recommended && !plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                  
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-slate-800">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {plan.current ? (
                    <div className="w-full py-2 px-4 text-center text-sm font-medium text-slate-500 bg-slate-100 rounded-lg">
                      Current Plan
                    </div>
                  ) : (
                    <Link
                      href={`/pricing?plan=${plan.name.toLowerCase()}`}
                      onClick={onClose}
                      className={`block w-full py-2 px-4 text-center text-sm font-medium rounded-lg transition-colors ${
                        plan.recommended
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-cyan-600 text-white hover:bg-cyan-700'
                      }`}
                    >
                      {plan.name === 'Free' ? 'View Details' : `Upgrade to ${plan.name}`}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              All plans include 24/7 support and regular updates.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

