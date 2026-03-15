import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  FileText, Download, Loader2, Plus, Trash2, Settings2,
  BookOpen, CheckSquare, Eye, Key, History, ExternalLink, Mail, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const JAMB_SUBJECTS = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "Literature",
  "Geography",
  "Agricultural Science",
  "Commerce",
  "Accounting",
  "Christian Religious Studies",
  "Islamic Studies",
  "History",
  "Yoruba",
  "Igbo",
  "Hausa",
  "French",
  "Further Mathematics",
  "Technical Drawing",
  "Home Economics",
  "Health Education",
  "Physical Education",
  "Civic Education",
];

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30, 40, 50, 60];

interface SubjectEntry {
  id: string;
  subject: string;
  count: number;
}

interface HistoryItem {
  id: string;
  title: string;
  studentName: string;
  regNo: string;
  subjects: { subject: string; count: number }[];
  url: string;
  filename: string;
  totalQuestions: number;
  generatedAt: string;
}

const HISTORY_KEY = "examcore-history";

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("JAMB CBT Practice Examination");
  const [subtitle, setSubtitle] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [profileCode, setProfileCode] = useState("");
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { id: generateId(), subject: "English", count: 60 },
    { id: generateId(), subject: "Mathematics", count: 40 },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendToEmail, setSendToEmail] = useState(false);
  const [lastResult, setLastResult] = useState<HistoryItem | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  const addSubject = () => {
    if (subjects.length >= 4) {
      toast({ title: "Maximum 4 subjects", description: "JAMB allows a maximum of 4 subjects.", variant: "destructive" });
      return;
    }
    setSubjects((prev) => [...prev, { id: generateId(), subject: "Physics", count: 40 }]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length <= 1) {
      toast({ title: "At least 1 subject required", variant: "destructive" });
      return;
    }
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof Omit<SubjectEntry, "id">, value: string | number) => {
    setSubjects((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const totalQuestions = subjects.reduce((sum, s) => sum + s.count, 0);

  const getBaseUrl = () => {
    const base = import.meta.env.BASE_URL || "/";
    return base.endsWith("/") ? base.slice(0, -1) : base;
  };

  const handleGenerate = async () => {
    if (subjects.length === 0) {
      toast({ title: "Add at least one subject", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setLastResult(null);
    toast({ title: "Generating PDF...", description: "Fetching questions from JAMB database. Please wait..." });

    try {
      const payload = {
        title,
        subtitle,
        schoolName,
        profileCode,
        subjects: subjects.map((s) => s.subject.toLowerCase()),
        questionsPerSubject: subjects[0]?.count || 10,
        year: "",
        includeAnswers,
        includeAnswerKey,
        subjectDetails: subjects.map((s) => ({
          subject: s.subject.toLowerCase(),
          year: "",
          count: s.count,
        })),
      };

      const res = await fetch(`${getBaseUrl()}/api/pdf/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to generate PDF" }));
        throw new Error(err.message || "Failed to generate PDF");
      }

      const data = await res.json();
      const item: HistoryItem = {
        id: Date.now().toString(),
        title: data.title || title,
        studentName: schoolName || "",
        regNo: subtitle || "",
        subjects: data.subjects || subjects.map((s) => ({ subject: s.subject, count: s.count })),
        url: data.url,
        filename: data.filename,
        totalQuestions: data.totalQuestions || totalQuestions,
        generatedAt: data.generatedAt || new Date().toISOString(),
      };

      setLastResult(item);
      setHistory((prev) => [item, ...prev].slice(0, 50));
      toast({ title: "PDF Ready!", description: `${item.totalQuestions} questions generated. Click the download button below.` });

      if (sendToEmail) {
        handleSendEmail(item);
      }
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async (item: HistoryItem) => {
    setSendingEmailId(item.id);
    try {
      const res = await fetch(`${getBaseUrl()}/api/pdf/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          url: item.url,
          filename: item.filename,
          title: item.title,
          subjects: item.subjects,
          totalQuestions: item.totalQuestions,
          generatedAt: item.generatedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Failed to send email");
      toast({ title: "Email Sent!", description: `PDF link sent to ${data.sentTo}` });
    } catch (err: any) {
      toast({ title: "Email Failed", description: err.message || "Could not send email.", variant: "destructive" });
    } finally {
      setSendingEmailId(null);
    }
  };

  return (
    <div className="flex-1 bg-background px-4 py-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Key className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Admin Panel</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              PDF Question Generator
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate professional JAMB past question papers for your students
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-medium">JAMB Database Connected</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2 space-y-5"
          >

            {/* Paper Information */}
            <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-primary" />
                  Paper Information
                </CardTitle>
                <CardDescription className="text-xs">Customize the header of your question paper</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-medium">Exam Title</Label>
                    <Select value={title} onValueChange={setTitle}>
                      <SelectTrigger className="h-10 bg-background/50 border-white/10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JAMB CBT Practice Examination">JAMB CBT Practice Examination</SelectItem>
                        <SelectItem value="DE- Direct Entry">DE- Direct Entry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">JAMB REG NO</Label>
                    <Input
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Enter JAMB Registration Number"
                      className="h-10 bg-background/50 border-white/10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Profile Code</Label>
                    <Input
                      value={profileCode}
                      onChange={(e) => setProfileCode(e.target.value)}
                      placeholder="Enter profile code"
                      className="h-10 bg-background/50 border-white/10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Full Name</Label>
                    <Input
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Enter full name"
                      className="h-10 bg-background/50 border-white/10 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject Selection */}
            <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Subjects & Questions
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">Select up to 4 JAMB subjects</CardDescription>
                  </div>
                  <Button
                    onClick={addSubject}
                    variant="outline"
                    size="sm"
                    disabled={subjects.length >= 4}
                    className="h-8 text-xs border-white/10 hover:border-primary/50 hover:bg-primary/10"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Subject
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjects.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-background/40 border border-white/5"
                  >
                    <div className="col-span-1 text-center">
                      <span className="text-xs font-bold text-primary/60">S{idx + 1}</span>
                    </div>

                    <div className="col-span-7">
                      <Select value={entry.subject} onValueChange={(v) => updateSubject(entry.id, "subject", v)}>
                        <SelectTrigger className="h-9 text-xs bg-background/60 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {JAMB_SUBJECTS.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3">
                      <Select value={String(entry.count)} onValueChange={(v) => updateSubject(entry.id, "count", parseInt(v))}>
                        <SelectTrigger className="h-9 text-xs bg-background/60 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_COUNTS.map((c) => (
                            <SelectItem key={c} value={String(c)} className="text-xs">{c} Qs</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeSubject(entry.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {subjects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No subjects added yet. Click "Add Subject" to start.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PDF Options */}
            <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Answer Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Eye className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Show Answers Inline</p>
                      <p className="text-xs text-muted-foreground">Highlight correct answer in each question</p>
                    </div>
                  </div>
                  <Switch
                    checked={includeAnswers}
                    onCheckedChange={setIncludeAnswers}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Include Answer Key Page</p>
                      <p className="text-xs text-muted-foreground">Add a separate answer key at the end of the PDF</p>
                    </div>
                  </div>
                  <Switch
                    checked={includeAnswerKey}
                    onCheckedChange={setIncludeAnswerKey}
                    disabled={includeAnswers}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT: Summary + Generate */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-5"
          >
            {/* Summary */}
            <Card className="border-white/10 bg-card/60 backdrop-blur-sm sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Paper Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {subjects.map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {i + 1}
                        </div>
                        <span className="font-medium">{s.subject}</span>
                      </div>
                      <span className="text-primary font-bold">{s.count}Q</span>
                    </div>
                  ))}
                </div>

                {subjects.length > 0 && (
                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Questions</span>
                      <span className="font-bold text-primary text-lg">{totalQuestions}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Subjects</span>
                      <span>{subjects.length} / 4</span>
                    </div>
                    {includeAnswers && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 rounded-lg px-2 py-1.5">
                        <Eye className="w-3 h-3" />
                        Answers shown inline
                      </div>
                    )}
                    {includeAnswerKey && !includeAnswers && (
                      <div className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 rounded-lg px-2 py-1.5">
                        <CheckSquare className="w-3 h-3" />
                        Answer key included
                      </div>
                    )}
                  </div>
                )}

                {/* Email delivery toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">Send to email when ready</p>
                      <p className="text-xs text-muted-foreground mt-1">Auto-email PDF link after generation</p>
                    </div>
                  </div>
                  <Switch checked={sendToEmail} onCheckedChange={setSendToEmail} />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || subjects.length === 0}
                  className="w-full h-12 font-bold text-sm shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate PDF
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <p className="text-center text-xs text-muted-foreground">
                    Fetching {totalQuestions} questions &amp; uploading to CDN...
                  </p>
                )}

                {lastResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2"
                  >
                    <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      PDF Ready — {lastResult.totalQuestions} questions
                    </p>
                    <a
                      href={lastResult.url}
                      download={lastResult.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </a>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-white/10 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tips</p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    JAMB allows exactly 4 subject combinations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    English Language is compulsory for most courses
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Generation may take 10–30 seconds depending on question count
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Download History
                  </CardTitle>
                  <button
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem(HISTORY_KEY);
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <CardDescription className="text-xs">Previously generated PDFs — click to re-download</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {history.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-white/5 hover:border-white/15 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {item.studentName || "Unknown Student"}
                        {item.regNo && <span className="text-primary ml-1.5 font-normal text-xs">· {item.regNo}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.title} · {item.subjects.map((s) => `${s.subject} (${s.count}Q)`).join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {new Date(item.generatedAt).toLocaleString()} · {item.totalQuestions} questions
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleSendEmail(item)}
                        disabled={sendingEmailId === item.id}
                        title="Send PDF link to email"
                        className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-white/10 bg-background/40 hover:bg-background/70 text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {sendingEmailId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                        Email
                      </button>
                      <a
                        href={item.url}
                        download={item.filename}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                      <button
                        onClick={() => setHistory((prev) => prev.filter((h) => h.id !== item.id))}
                        title="Delete from history"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}
