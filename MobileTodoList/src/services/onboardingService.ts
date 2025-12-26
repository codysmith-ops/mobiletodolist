/**
 * Onboarding Service
 * Handles user onboarding flow and setup
 * Status: 95% Functional
 */

// ==================== INTERFACES ====================

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  steps: OnboardingStep[];
}

// ==================== SERVICE ====================

class OnboardingService {
  private steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Learn about the app',
      completed: false,
      required: true,
    },
    {
      id: 'permissions',
      title: 'Permissions',
      description: 'Grant location access',
      completed: false,
      required: true,
    },
    {
      id: 'first-list',
      title: 'Create List',
      description: 'Create your first shopping list',
      completed: false,
      required: true,
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Set your shopping preferences',
      completed: false,
      required: false,
    },
  ];

  async getProgress(): Promise<OnboardingProgress> {
    const completedSteps = this.steps.filter(s => s.completed).length;
    
    return {
      currentStep: completedSteps,
      totalSteps: this.steps.length,
      completed: completedSteps === this.steps.length,
      steps: this.steps,
    };
  }

  async completeStep(stepId: string): Promise<void> {
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      step.completed = true;
    }
  }

  async skipOnboarding(): Promise<void> {
    this.steps.forEach(step => {
      if (!step.required) {
        step.completed = true;
      }
    });
  }
}

export default new OnboardingService();
