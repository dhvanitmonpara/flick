import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const apps = [
  {
    name: "Web App",
    description: "Main application for college students",
    href: "https://flick.dhvanitm.in",
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    name: "Admin Dashboard",
    description: "Manage content, users & analytics",
    href: "https://flick-admin.dhvanitm.in",
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    name: "Documentation",
    description: "Technical docs & architecture",
    href: "/wiki",
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    ),
  },
  {
    name: "Landing Page",
    description: "Marketing & product overview",
    href: "https://tryflick.dhvanitm.in",
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
    ),
  },
];

const socials = [
  {
    name: "GitHub",
    href: "https://github.com/dhvanitmonpara/flick",
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "https://x.com/dhvanitcantcode",
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    name: "Dhvanit Monpara",
    href: "https://dhvanitm.in",
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12h.01" />
        <path d="M15 12h.01" />
        <path d="M7 6l-.5 2" />
        <path d="M17 6l.5 2" />
        <path d="M4 16h16c0 4-4 6-4 6H8s-4-2-4-6V8c0-3 3-5 3-5h10s3 2 3 5z" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 bg-background selection:bg-primary/20">
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(12px); filter: blur(2px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[420px] space-y-12 relative z-10 my-auto">
        {/* Header section */}
        <div
          className="text-center space-y-6 animate-fade-in-up"
          style={{ animationDelay: "0ms", opacity: 0 }}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-strong shadow-sm border border-border">
            <svg
              aria-hidden="true"
              className="h-10 w-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Flick
            </h1>
            <p className="text-muted text-base font-medium">
              The student engagement platform
            </p>
          </div>
        </div>

        {/* Links section */}
        <div className="space-y-3">
          {apps.map((app, index) => (
            <Link
              key={app.name}
              href={app.href}
              className="group flex items-center gap-4 rounded-xl bg-surface-strong p-4 border border-border transition-all hover:border-border-strong hover:bg-surface-soft animate-fade-in-up"
              style={{ animationDelay: `${100 + index * 50}ms`, opacity: 0 }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-strong border border-border transition-colors group-hover:text-primary group-hover:border-primary/20">
                {app.icon}
              </div>

              <div className="flex-1 min-w-0 py-0.5">
                <p className="text-[15px] font-medium text-foreground tracking-tight transition-colors group-hover:text-primary">
                  {app.name}
                </p>
                <p className="text-[14px] text-muted truncate mt-0.5">
                  {app.description}
                </p>
              </div>

              <div className="flex shrink-0 text-muted opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Socials & Footer */}
        <div
          className="space-y-8 pt-6 animate-fade-in-up"
          style={{ animationDelay: "300ms", opacity: 0 }}
        >
          <div className="flex justify-center gap-4">
            {socials.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="group flex h-10 w-10 items-center justify-center rounded-lg bg-surface-strong border border-border text-muted transition-all hover:text-foreground hover:bg-surface-soft hover:border-border-strong"
                aria-label={social.name}
              >
                <span className="transition-transform group-hover:scale-105">
                  {social.icon}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-muted">
              © {new Date().getFullYear()} Flick
            </p>
            <p className="text-xs text-muted/70 flex items-center gap-1.5">
              Built with
              <svg
                aria-hidden="true"
                className="h-3 w-3 text-muted-strong"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              for students
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
