import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Zap, BarChart3, Users, Brain, Shield, Upload, ChevronRight,
  Moon, Sun, Globe,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ROUTES } from '../config/routes';
import { useTheme } from '../lib/theme';
import { getDirection } from '../lib/i18n';

export function Landing() {
  const { t, i18n } = useTranslation();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const dir = getDirection(i18n.language);

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    document.documentElement.setAttribute('dir', getDirection(next));
    document.documentElement.setAttribute('lang', next);
  };

  const features = [
    { icon: BarChart3, title: t('landing.feature_dashboards_title'), desc: t('landing.feature_dashboards_desc') },
    { icon: Brain, title: t('landing.feature_ai_title'), desc: t('landing.feature_ai_desc') },
    { icon: Users, title: t('landing.feature_hr_title'), desc: t('landing.feature_hr_desc') },
    { icon: Upload, title: t('landing.feature_analytics_title'), desc: t('landing.feature_analytics_desc') },
    { icon: Shield, title: t('landing.feature_security_title'), desc: t('landing.feature_security_desc') },
    { icon: Zap, title: t('landing.feature_collaboration_title'), desc: t('landing.feature_collaboration_desc') },
  ];

  const steps = [
    { num: '1', title: t('landing.step1_title'), desc: t('landing.step1_desc') },
    { num: '2', title: t('landing.step2_title'), desc: t('landing.step2_desc') },
    { num: '3', title: t('landing.step3_title'), desc: t('landing.step3_desc') },
  ];

  const testimonials = [
    { quote: t('landing.testimonial1_quote'), author: t('landing.testimonial1_author'), role: t('landing.testimonial1_role') },
    { quote: t('landing.testimonial2_quote'), author: t('landing.testimonial2_author'), role: t('landing.testimonial2_role') },
    { quote: t('landing.testimonial3_quote'), author: t('landing.testimonial3_author'), role: t('landing.testimonial3_role') },
  ];

  return (
    <div className="flex min-h-screen flex-col" dir={dir}>
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <Zap className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          <span className="text-lg font-bold">{t('app.name')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLang}
            title={t('language.switch')}
          >
            <Globe className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            title={t('theme.toggle')}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost">{t('nav.sign_in')}</Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button>{t('nav.get_started')}</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/5 via-transparent to-[hsl(var(--primary))]/5" />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-[hsl(var(--primary))]/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-[hsl(var(--primary))]/10 blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            <Zap className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
            {t('app.tagline')}
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
            {t('landing.hero_title')}{' '}
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-blue-400 bg-clip-text text-transparent">
              {t('landing.hero_highlight')}
            </span>{' '}
            {t('landing.hero_subtitle')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[hsl(var(--muted-foreground))]">
            {t('landing.hero_description')}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" className="gap-2 px-8">
                {t('landing.cta_trial')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button size="lg" variant="outline" className="px-8">
                {t('nav.sign_in')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">{t('landing.features_title')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[hsl(var(--muted-foreground))]">
            {t('landing.features_subtitle')}
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all hover:border-[hsl(var(--primary))]/30 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 transition-colors group-hover:bg-[hsl(var(--primary))]/20">
                  <Icon className="h-6 w-6 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">{t('landing.how_it_works_title')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[hsl(var(--muted-foreground))]">
            {t('landing.how_it_works_subtitle')}
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xl font-bold text-[hsl(var(--primary-foreground))]">
                  {num}
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">{t('landing.testimonials_title')}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {testimonials.map(({ quote, author, role }, i) => (
              <div
                key={i}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
              >
                <p className="text-sm italic text-[hsl(var(--muted-foreground))]">"{quote}"</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold">{author}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--primary))]/5 p-12 text-center">
          <h2 className="text-3xl font-bold">{t('landing.cta_section_title')}</h2>
          <p className="mx-auto mt-3 max-w-lg text-[hsl(var(--muted-foreground))]">
            {t('landing.cta_section_desc')}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" className="gap-2 px-10">
                {t('landing.cta_start')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {t('landing.cta_no_card')}
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] px-6 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        {t('app.copyright', { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
