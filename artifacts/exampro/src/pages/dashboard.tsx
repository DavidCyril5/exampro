import { useAuth } from "@/context/AuthContext";
import { BookOpen, Clock, Award, ChevronRight, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();

  // Placeholder data
  const upcomingExams = [
    { id: 1, title: "Advanced Cloud Architecture", date: "Oct 24, 2025", time: "10:00 AM", duration: "120 min" },
    { id: 2, title: "Cybersecurity Fundamentals", date: "Nov 05, 2025", time: "2:00 PM", duration: "90 min" },
  ];

  const recentResults = [
    { id: 1, title: "React Core Certification", score: 94, date: "Sep 12, 2025" },
    { id: 2, title: "Database Systems", score: 88, date: "Aug 30, 2025" },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Welcome back, <span className="text-primary">{user?.fullName.split(' ')[0]}</span>
            </h1>
            <p className="text-muted-foreground text-lg">Here's your examination overview.</p>
          </div>
          <Button className="rounded-full shadow-lg shadow-primary/20 px-6">
            Browse Catalog
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Exams Completed</p>
                <h3 className="text-2xl font-bold">12</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <h3 className="text-2xl font-bold">91%</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Global Percentile</p>
                <h3 className="text-2xl font-bold">Top 5%</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upcoming Exams */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Upcoming Sessions
              </h2>
              <Button variant="link" className="text-primary pr-0">View All</Button>
            </div>

            <div className="grid gap-4">
              {upcomingExams.map((exam, i) => (
                <motion.div 
                  key={exam.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-white/5 bg-card hover:border-primary/30 transition-colors group cursor-pointer">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">{exam.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exam.date} • {exam.time}</span>
                          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {exam.duration}</span>
                        </div>
                      </div>
                      <Button variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Prepare <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Results */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Recent Results
              </h2>
            </div>
            
            <Card className="border-white/5 bg-card/50 backdrop-blur">
              <CardContent className="p-0 divide-y divide-white/5">
                {recentResults.map((result) => (
                  <div key={result.id} className="p-6 hover:bg-white/[0.02] transition-colors cursor-pointer flex items-center justify-between">
                    <div>
                      <h4 className="font-medium mb-1">{result.title}</h4>
                      <p className="text-xs text-muted-foreground">{result.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald-400">{result.score}%</div>
                      <p className="text-xs text-muted-foreground">Passed</p>
                    </div>
                  </div>
                ))}
                <div className="p-4 text-center">
                  <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-primary">
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
