import { useAuth } from "@/context/AuthContext";
import { BookOpen, Clock, Award, ChevronRight, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();

  const upcomingExams = [
    { id: 1, title: "Advanced Cloud Architecture", date: "Oct 24, 2025", time: "10:00 AM", duration: "120 min" },
    { id: 2, title: "Cybersecurity Fundamentals", date: "Nov 05, 2025", time: "2:00 PM", duration: "90 min" },
  ];

  const recentResults = [
    { id: 1, title: "React Core Certification", score: 94, date: "Sep 12, 2025" },
    { id: 2, title: "Database Systems", score: 88, date: "Aug 30, 2025" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] bg-background px-4 py-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-display font-bold mb-1">
              Welcome back,{" "}
              <span className="text-primary">{user?.fullName.split(" ")[0]}</span>
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground">Here's your examination overview.</p>
          </div>
          <Button className="rounded-full shadow-lg shadow-primary/20 px-6 self-start md:self-auto text-sm">
            Browse Catalog
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-blue-500" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] md:text-sm font-medium text-muted-foreground leading-tight">Exams Done</p>
                <h3 className="text-xl md:text-2xl font-bold">12</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 md:w-6 md:h-6 text-emerald-500" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] md:text-sm font-medium text-muted-foreground leading-tight">Avg Score</p>
                <h3 className="text-xl md:text-2xl font-bold">91%</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 md:w-6 md:h-6 text-purple-500" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] md:text-sm font-medium text-muted-foreground leading-tight">Percentile</p>
                <h3 className="text-xl md:text-2xl font-bold">Top 5%</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Upcoming Exams */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-xl font-display font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Upcoming Sessions
              </h2>
              <Button variant="link" className="text-primary pr-0 text-sm">View All</Button>
            </div>

            <div className="grid gap-3 md:gap-4">
              {upcomingExams.map((exam, i) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-white/5 bg-card hover:border-primary/30 transition-colors group cursor-pointer">
                    <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-bold text-sm md:text-lg leading-snug">{exam.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {exam.date} · {exam.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {exam.duration}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 text-xs md:text-sm"
                      >
                        Prepare <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Results */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-xl font-display font-bold flex items-center gap-2">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Recent Results
              </h2>
            </div>

            <Card className="border-white/5 bg-card/50 backdrop-blur">
              <CardContent className="p-0 divide-y divide-white/5">
                {recentResults.map((result) => (
                  <div
                    key={result.id}
                    className="px-4 md:px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm leading-snug mb-0.5 truncate">{result.title}</h4>
                      <p className="text-xs text-muted-foreground">{result.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg md:text-xl font-bold text-emerald-400">{result.score}%</div>
                      <p className="text-xs text-muted-foreground">Passed</p>
                    </div>
                  </div>
                ))}
                <div className="p-3 md:p-4 text-center">
                  <Button variant="ghost" className="w-full text-xs md:text-sm text-muted-foreground hover:text-primary">
                    View Full Transcript
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
