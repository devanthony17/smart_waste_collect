import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "../components/layout/LanguageSwitcher";
import Hero from "../components/landing/Hero";
import Stats from "../components/landing/Stats";
import Features from "../components/landing/Features";
import Steps from "../components/landing/Steps";
import Testimonials from "../components/landing/Testimonials";
import Partners from "../components/landing/Partners";
import FAQ from "../components/landing/FAQ";
import Contact from "../components/landing/Contact";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher variant="light" />
      </div>

      <section className="relative text-white px-6 md:px-8 min-h-[600px] flex flex-col justify-center overflow-hidden">
        <Hero />
        
        <div className="relative z-20 w-full max-w-5xl mx-auto">

          <div className="mt-16 flex flex-wrap justify-center gap-4 relative z-20">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-1"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white font-bold hover:bg-white/20 transition-all hover:-translate-y-1"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      <Stats />
      <Features />
      <Steps />
      <Testimonials />
      <Partners />
      <FAQ />
      <Contact />
      <CTA />
      <Footer />
    </div>
  );
}
