import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
} from "@clerk/react";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter, Link } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { Wrench, ShieldCheck, ClipboardList } from "lucide-react";

const queryClient = new QueryClient();
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#ffb800",
    colorBackground: "#ffffff",
    colorInputBackground: "#f8fafc",
    colorText: "#0f172a",
    colorTextSecondary: "#475569",
    colorInputText: "#0f172a",
    colorNeutral: "#334155",
    borderRadius: "0.75rem",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontFamilyButtons: "Plus Jakarta Sans, sans-serif",
    fontSize: "14px",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "rounded-2xl w-full overflow-hidden border border-slate-200 shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: { color: "#0f172a" },
    headerSubtitle: { color: "#475569" },
    socialButtonsBlockButtonText: { color: "#0f172a" },
    formFieldLabel: { color: "#0f172a" },
    footerActionLink: { color: "#334155" },
    footerActionText: { color: "#475569" },
    dividerText: { color: "#64748b" },
    identityPreviewEditButton: { color: "#334155" },
    formFieldSuccessText: { color: "#059669" },
    alertText: { color: "#7f1d1d" },
    logoBox: "h-16 justify-center",
    logoImage: "h-14 w-14",
    socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50",
    formButtonPrimary: "bg-slate-700 text-white hover:bg-slate-800",
    formFieldInput: "bg-slate-50 border-slate-200 focus:border-amber-400 focus:ring-amber-400",
    footerAction: "bg-slate-50",
    dividerLine: "bg-slate-200",
    alert: "bg-red-50 border-red-200",
    otpCodeFieldInput: "border-slate-200",
    formFieldRow: "gap-3",
    main: "gap-4",
  },
};

function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="bg-secondary text-secondary-foreground py-4 px-6 border-b border-secondary-border shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SCANIA</h1>
              <p className="text-xs text-secondary-foreground/70 font-mono">PARTES TÉCNICOS Y SUPERVISIÓN</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/sign-in"><Button>Ingresar</Button></Link>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6 md:p-10 grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
        <section className="space-y-6">
          <div className="inline-flex items-center rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold text-secondary">
            Control de horas extras por perfil
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-secondary">Carga de partes para técnicos y revisión para supervisores.</h2>
            <p className="text-lg text-muted-foreground">Cada técnico accede a su propio historial. El supervisor puede ver el equipo completo, revisar notas y aprobar partes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/sign-in"><Button size="lg" className="font-bold">Ingresar al panel</Button></Link>
          </div>
        </section>
        <section className="grid gap-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <ClipboardList className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-bold text-lg">Perfil técnico</h3>
            <p className="text-sm text-muted-foreground mt-2">Carga nuevo parte y consulta solo sus registros personales.</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mb-4" />
            <h3 className="font-bold text-lg">Perfil supervisor</h3>
            <p className="text-sm text-muted-foreground mt-2">Visualiza el dashboard del equipo completo y aprueba partes pendientes.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function SignInPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/app" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function AppRoute() {
  return (
    <>
      <Show when="signed-in">
        <Home />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/app" component={AppRoute} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      localization={{
        signIn: {
          start: {
            title: "Ingresar a SCANIA",
            subtitle: "Accedé a tus partes técnicos",
          },
        },
        signUp: {
          start: {
            title: "Crear cuenta",
            subtitle: "Registrate para cargar y revisar partes",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
