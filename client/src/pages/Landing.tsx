import { Link } from 'react-router-dom';
import { Zap, BarChart3, Users, Brain } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ROUTES } from '../config/routes';

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-[hsl(var(--primary))]" />
          <span className="text-lg font-bold">SME InsightX</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Business Intelligence{' '}
          <span className="text-[hsl(var(--primary))]">+</span>{' '}
          AI-Powered HR
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[hsl(var(--muted-foreground))]">
          Empower your small business with data-driven insights and an intelligent
          HR assistant. All in one platform.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to={ROUTES.REGISTER}>
            <Button size="lg">Start Free Trial</Button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-[hsl(var(--muted))]/50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">Everything you need</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: 'Smart Dashboards',
                desc: 'Upload data, auto-generate charts, and track KPIs in real-time.',
              },
              {
                icon: Brain,
                title: 'AI Insights',
                desc: 'Get trend analysis, anomaly detection, and smart recommendations.',
              },
              {
                icon: Users,
                title: 'HR Assistant',
                desc: 'Manage job postings, track candidates, and streamline hiring.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border bg-[hsl(var(--card))] p-6">
                <Icon className="h-10 w-10 text-[hsl(var(--primary))]" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()} SME InsightX. All rights reserved.
      </footer>
    </div>
  );
}
