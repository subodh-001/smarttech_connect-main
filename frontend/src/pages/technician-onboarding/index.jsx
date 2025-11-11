import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/NewAuthContext';
import {
  ClipboardCheck,
  BadgeCheck,
  ShieldCheck,
  Wrench,
  Clock,
  MapPin,
  Users2,
  PenSquare,
} from 'lucide-react';

const steps = [
  {
    icon: ClipboardCheck,
    title: 'Submit your details',
    description: 'Tell us about your skills, certifications, and work history.',
  },
  {
    icon: BadgeCheck,
    title: 'Background review',
    description: 'Our team validates your documents and previous experience.',
  },
  {
    icon: ShieldCheck,
    title: 'Platform orientation',
    description: 'Complete a quick walkthrough to learn how SmartTech works.',
  },
  {
    icon: Wrench,
    title: 'Start accepting jobs',
    description: 'Set your availability and begin receiving service requests.',
  },
];

const requirements = [
  {
    icon: PenSquare,
    title: 'Government ID',
    description: 'Upload a clear copy of a valid government-issued ID.',
  },
  {
    icon: Clock,
    title: 'Experience proof',
    description: 'Provide references, certifications, or portfolio samples.',
  },
  {
    icon: Users2,
    title: 'Two references',
    description: 'Share contacts for clients or supervisors who can vouch for your work.',
  },
  {
    icon: MapPin,
    title: 'Service radius',
    description: 'Specify the areas you can cover so we can match relevant jobs.',
  },
];

const TechnicianOnboarding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && user?.role === 'technician') {
      navigate('/technician-dashboard', { replace: true });
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} />

      <main className="mx-auto mt-16 w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-6 py-14 text-white sm:px-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur">
              Technician community
            </span>
            <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">
              Join the SmartTech Connect professional network
            </h1>
            <p className="mt-4 text-base text-white/85 sm:text-lg">
              We partner with trusted technicians to deliver reliable home service experiences.
              Complete the onboarding and unlock access to verified clients, instant payouts, and
              scheduling tools designed for field experts.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/user-registration', { state: { role: 'technician' } })}
              >
                Start application
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/60 text-white hover:border-white hover:bg-white/10"
                onClick={() => navigate('/help-center')}
              >
                Talk to support
              </Button>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 top-12 hidden h-48 w-48 rounded-full bg-white/15 blur-3xl sm:block" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 hidden h-56 w-56 rounded-full bg-white/10 blur-3xl sm:block" />
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Icon size={22} />
              </span>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{description}</p>
            </article>
          ))}
        </section>

        <section className="mt-20 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div className="grid gap-10 lg:grid-cols-[2fr,3fr]">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                What you need before you apply
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Having your documents ready helps us verify you faster. You can pause and resume the
                application at any point—just make sure each requirement is covered.
              </p>
              <div className="mt-6 rounded-2xl bg-slate-900 px-5 py-4 text-sm text-slate-200">
                <p className="font-medium">Already a verified technician?</p>
                <p className="mt-1 text-slate-300">
                  Sign in with your registered email to manage jobs, earnings, and availability.
                </p>
                <Button
                  variant="secondary"
                  className="mt-4 bg-white text-slate-900 hover:bg-blue-50"
                  onClick={() => navigate('/user-login')}
                >
                  Go to technician login
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {requirements.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={20} />
                  </span>
                  <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[3fr,2fr]">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                Why technicians choose SmartTech Connect
              </h2>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
                <li>
                  <strong className="text-slate-900">Earn what you deserve:</strong> set your pricing
                  and get dashboards that track payouts in real time.
                </li>
                <li>
                  <strong className="text-slate-900">Control your schedule:</strong> accept jobs that
                  match your specialty and availability—no penalties for declining.
                </li>
                <li>
                  <strong className="text-slate-900">Secure clients:</strong> work with verified
                  households and businesses; we handle discovery and communication.
                </li>
                <li>
                  <strong className="text-slate-900">Support that cares:</strong> 24/7 operations and
                  tools to manage ratings, reviews, and repeat customers.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-900/95 p-6 text-slate-100">
              <p className="text-sm uppercase tracking-wide text-slate-400">Need help?</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Onboarding concierge</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Email{' '}
                <a className="text-white underline" href="mailto:support@smarttechconnect.com">
                  support@smarttechconnect.com
                </a>{' '}
                or call <span className="font-medium text-white">+91 98765 43210</span>. Our team can
                help with document uploads, service categories, and compliance checks.
              </p>
              <Button
                className="mt-6 bg-white text-slate-900 hover:bg-blue-50"
                onClick={() => navigate('/help-center')}
              >
                Contact support
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TechnicianOnboarding;

