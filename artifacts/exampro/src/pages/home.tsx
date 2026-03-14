import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, BrainCircuit, ChevronRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Abstract tech background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 pt-20 pb-32">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            The Next Generation Platform
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6">
            Master your future with <br className="hidden md:block" />
            <BrandLogo withLink={false} className="inline-block mt-4 text-6xl md:text-8xl scale-110" />
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The definitive professional examination environment. Experience zero lag, high-fidelity testing, and comprehensive analytics designed for elite certification bodies.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-semibold shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all">
                Create Free Account <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-semibold bg-background/50 backdrop-blur border-white/10 hover:bg-white/5">
                Sign In to Portal
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-32"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="bg-card/50 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 font-display">Zero-Lag Interface</h3>
            <p className="text-muted-foreground leading-relaxed">Our edge-optimized architecture guarantees millisecond response times during your most critical assessment moments.</p>
          </div>

          <div className="bg-card/50 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 font-display">Bank-Grade Security</h3>
            <p className="text-muted-foreground leading-relaxed">End-to-end encryption and advanced proctoring tools protect the integrity of every single examination session.</p>
          </div>

          <div className="bg-card/50 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
              <BrainCircuit className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 font-display">Deep Analytics</h3>
            <p className="text-muted-foreground leading-relaxed">Gain unprecedented insights into performance patterns with our proprietary AI-driven scoring breakdown.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
