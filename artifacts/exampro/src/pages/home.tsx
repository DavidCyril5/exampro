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
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex flex-col relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 pt-12 pb-16 md:pt-20 md:pb-32">
        <motion.div
          className="w-full max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-5 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs md:text-sm font-medium text-primary backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            The Next Generation Platform
          </motion.div>

          {/* Hero headline */}
          <motion.div variants={itemVariants} className="mb-5 md:mb-6">
            <h1 className="text-2xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight leading-tight mb-4">
              Master your future with
            </h1>
            <BrandLogo
              withLink={false}
              className="inline-flex justify-center text-3xl sm:text-5xl md:text-8xl"
            />
          </motion.div>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-2"
          >
            The definitive professional examination environment. Experience zero lag, high-fidelity testing, and comprehensive analytics designed for elite certification bodies.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full h-12 md:h-14 px-8 text-sm md:text-base font-semibold shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all"
              >
                Create Free Account <ChevronRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full h-12 md:h-14 px-8 text-sm md:text-base font-semibold bg-background/50 backdrop-blur border-white/10 hover:bg-white/5"
              >
                Sign In to Portal
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full max-w-5xl mx-auto mt-16 md:mt-32 px-0"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="bg-card/50 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 md:mb-6">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 font-display">Zero-Lag Interface</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Our edge-optimized architecture guarantees millisecond response times during your most critical assessment moments.</p>
          </div>

          <div className="bg-card/50 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 md:mb-6">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 font-display">Bank-Grade Security</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">End-to-end encryption and advanced proctoring tools protect the integrity of every single examination session.</p>
          </div>

          <div className="bg-card/50 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-2xl hover:border-primary/50 transition-colors sm:col-span-2 md:col-span-1">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 md:mb-6">
              <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 font-display">Deep Analytics</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Gain unprecedented insights into performance patterns with our proprietary AI-driven scoring breakdown.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
