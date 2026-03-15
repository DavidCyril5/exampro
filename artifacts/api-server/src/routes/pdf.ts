import { Router, type IRouter, type Request, type Response } from "express";
import PDFDocument from "pdfkit";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JAMB_LOGO = path.join(__dirname, "../assets/jamb-logo.png");

const router: IRouter = Router();

const ALOC_TOKENS: string[] = process.env.ALOC_TOKEN
  ? process.env.ALOC_TOKEN.split(",").map((t) => t.trim()).filter(Boolean)
  : [
      "QB-a426946c75c1e80cb2ef",
      "ALOC-49d828d7860d4fe4a4bc",
      "ALOC-10c7a23ffb79a58ba518",
      "ALOC-20fb18ea4b4a8b4d6cdf",
      "ALOC-f860074d17d703f22857",
    ];
function randomToken(): string {
  return ALOC_TOKENS[Math.floor(Math.random() * ALOC_TOKENS.length)];
}
const ALOC_BASE = "https://questions.aloc.com.ng/api/v2";

interface AlocQuestion {
  id: number;
  question: string;
  option: { a: string; b: string; c: string; d: string; e?: string | null };
  section?: string;
  image?: string;
  answer: string;
  solution?: string;
  examtype: string;
  examyear: string;
}

const JAMB_YEARS = ["2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"];

function randomYear(): string {
  return JAMB_YEARS[Math.floor(Math.random() * JAMB_YEARS.length)];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchQuestions(subject: string, _year: string, count: number): Promise<AlocQuestion[]> {
  const seenIds = new Set<number>();
  const results: AlocQuestion[] = [];
  const maxAttempts = count * 4;

  for (let i = 0; i < maxAttempts && results.length < count; i++) {
    const year = randomYear();
    const url = `${ALOC_BASE}/q?subject=${encodeURIComponent(subject)}&type=utme&year=${year}`;
    try {
      const res = await axios.get(url, { headers: { AccessToken: randomToken() }, timeout: 8000 });
      if (res.data?.status === 200 && res.data?.data) {
        const q = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
        if (q && !seenIds.has(q.id)) {
          seenIds.add(q.id);
          results.push(q);
        }
      }
      await sleep(500);
    } catch (e: any) {
      if (e.response?.status === 429) {
        console.warn(`[ALOC] 429 on ${subject}, cooling 10s`);
        await sleep(10000);
      } else {
        await sleep(500);
      }
    }
  }

  console.log(`[ALOC] ${subject}: got ${results.length}/${count}`);
  return results.slice(0, count);
}

function cleanText(text: string): string {
  return (text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
    .replace(/&#x2212;/g, "-").replace(/&#x2061;/g, "")
    .replace(/&#x[0-9a-fA-F]+;/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function drawPageHeader(doc: PDFKit.PDFDocument, title: string, jambRegNo: string, fullName: string, profileCode: string) {
  const W = doc.page.width;
  const margin = 42;
  const contentW = W - margin * 2;

  doc.rect(0, 0, W, 130).fill("#ffffff");

  // — Branding (left) —
  doc.fontSize(16).fillColor("#000000").font("Helvetica-Bold")
    .text("EXAMCORE", margin, 14);
  doc.fontSize(7).fillColor("#000000").font("Helvetica")
    .text(`${new Date().getFullYear()} UTME Q/A`, margin, 34);
  doc.fontSize(7).fillColor("#000000").font("Helvetica")
    .text("www.jamb.gov.ng", margin, 45);

  // — Exam title (centered, bold) —
  doc.fontSize(15).fillColor("#000000").font("Helvetica-Bold")
    .text(title.toUpperCase(), margin + 90, 16, { width: contentW - 90, align: "center" });

  // — Divider between branding/title and info fields —
  doc.rect(margin, 62, contentW, 0.75).fill("#000000");

  // — Info row: FULL NAME | JAMB REG NO | PROFILE CODE —
  const infoY = 70;
  const thirdW = contentW / 3;

  // Full Name
  doc.fontSize(8).fillColor("#000000").font("Helvetica-Bold")
    .text("FULL NAME:", margin, infoY);
  doc.fontSize(9).fillColor("#000000").font("Helvetica-Bold")
    .text(fullName || "________________________________", margin, infoY + 12, { width: thirdW - 10 });

  // JAMB REG NO
  const regX = margin + thirdW;
  doc.fontSize(8).fillColor("#000000").font("Helvetica-Bold")
    .text("JAMB REG NO:", regX, infoY);
  doc.fontSize(9).fillColor("#000000").font("Helvetica-Bold")
    .text(jambRegNo || "________________________________", regX, infoY + 12, { width: thirdW - 10 });

  // Profile Code
  const profX = margin + thirdW * 2;
  doc.fontSize(8).fillColor("#000000").font("Helvetica-Bold")
    .text("PROFILE CODE:", profX, infoY);
  doc.fontSize(9).fillColor("#000000").font("Helvetica-Bold")
    .text(profileCode || "________________________________", profX, infoY + 12, { width: thirdW - 4 });

  // — Bottom border —
  doc.rect(margin, 126, contentW, 1).fill("#000000");
  doc.y = 142;
}

function drawPageFooter(doc: PDFKit.PDFDocument, pageNum: number, totalPages: number, schoolName: string) {
  const W = doc.page.width;
  const H = doc.page.height;
  const margin = 42;

  doc.rect(margin, H - 36, W - margin * 2, 1).fill("#000000");

  doc.fontSize(7.5).fillColor("#000000").font("Helvetica")
    .text(schoolName || "ExamCore Admin", margin, H - 22, { width: 160, align: "left" });

  doc.fontSize(7.5).fillColor("#000000").font("Helvetica-Bold")
    .text("GENERATED BY EXAMCORE X EXAMCORE", 0, H - 22, { width: W, align: "center" });

  doc.fontSize(7.5).fillColor("#000000").font("Helvetica")
    .text(`Page ${pageNum} of ${totalPages}`, W - margin - 80, H - 22, { width: 80, align: "right" });
}

function drawSectionBanner(doc: PDFKit.PDFDocument, subject: string, _year: string, count: number) {
  const W = doc.page.width;
  const margin = 42;
  const y = doc.y + 4;

  doc.rect(margin, y, W - margin * 2, 26).fill("#f0f0f0").stroke("#000000");

  doc.fontSize(12).fillColor("#000000").font("Helvetica-Bold")
    .text(`${subject.toUpperCase()}`, margin + 10, y + 7, { width: 250 });

  doc.fontSize(9).fillColor("#000000").font("Helvetica")
    .text(`UTME  •  ${count} Questions`, W - margin - 180, y + 8, { width: 180, align: "right" });

  doc.y = y + 36;
}

function drawQuestion(doc: PDFKit.PDFDocument, q: AlocQuestion, num: number, showAnswers: boolean) {
  const W = doc.page.width;
  const margin = 42;
  const contentW = W - margin * 2;
  const innerW = contentW - 32;

  const pageH = doc.page.height;
  if (doc.y > pageH - 160) {
    doc.addPage();
  }

  const qText = cleanText(q.question);
  const opts = ["a", "b", "c", "d"] as const;
  const validOpts = opts.filter((l) => q.option[l] && String(q.option[l]).trim());

  const estHeight = 24 + qText.length * 0.06 * 10 + validOpts.length * 22 + 16;
  if (doc.y + estHeight > pageH - 50) {
    doc.addPage();
  }

  const startY = doc.y;

  doc.rect(margin, startY, contentW, 0.5).fill("#000000");
  doc.y = startY + 6;

  const numY = doc.y;
  doc.fontSize(10).fillColor("#000000").font("Helvetica-Bold")
    .text(`${num}.`, margin, numY, { width: 20 });

  doc.fontSize(10).fillColor("#000000").font("Helvetica")
    .text(qText, margin + 22, numY, { width: innerW });

  doc.y += 6;

  validOpts.forEach((letter) => {
    const val = cleanText(String(q.option[letter]));
    if (!val) return;

    if (doc.y > pageH - 60) doc.addPage();

    const isCorrect = showAnswers && q.answer.toLowerCase() === letter;
    const optY = doc.y;

    doc.rect(margin + 22, optY, innerW, 18).fill("#ffffff").stroke("#cccccc");

    doc.fontSize(8.5).fillColor("#000000").font("Helvetica-Bold")
      .text(`${letter.toUpperCase()}.`, margin + 28, optY + 4, { width: 16 });

    doc.fontSize(8.5).fillColor("#000000").font("Helvetica")
      .text(val, margin + 46, optY + 4, { width: innerW - 28 });

    if (isCorrect) {
      doc.fontSize(8.5).fillColor("#000000").font("Helvetica-Bold")
        .text("✓", margin + innerW + 8, optY + 4, { width: 14 });
    }

    doc.y = optY + 22;
  });

  if (showAnswers && q.solution) {
    const sol = cleanText(q.solution);
    if (sol && sol.length > 5) {
      const solY = doc.y + 2;
      doc.y = solY + 4;
      doc.fontSize(8).fillColor("#000000").font("Helvetica-Oblique")
        .text(`Solution: ${sol.slice(0, 300)}`, margin + 22, doc.y, { width: innerW });
      doc.y += 4;
    }
  }

  doc.y += 10;
}

router.post("/generate", async (req: Request, res: Response) => {
  const {
    title,
    subtitle,
    schoolName,
    profileCode,
    examDate,
    includeAnswers,
    includeAnswerKey,
    subjectDetails,
  } = req.body;

  if (!subjectDetails || !Array.isArray(subjectDetails) || subjectDetails.length === 0) {
    res.status(400).json({ error: "subjectDetails array is required" });
    return;
  }

  try {
    const questionSets: { subject: string; year: string; questions: AlocQuestion[] }[] = [];
    for (let i = 0; i < subjectDetails.length; i++) {
      if (i > 0) await sleep(3000);
      const detail = subjectDetails[i];
      const qs = await fetchQuestions(detail.subject, detail.year || "", detail.count || 10);
      questionSets.push({ subject: detail.subject, year: detail.year || "Mixed", questions: qs });
    }

    // — Build PDF buffer —
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 158, bottom: 46, left: 42, right: 42 },
        bufferPages: true,
        info: {
          Title: title || "ExamCore Practice Paper",
          Author: "ExamCore Platform",
          Subject: "JAMB Past Questions",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // — Draw all question content —
      for (const { subject, year, questions } of questionSets) {
        drawSectionBanner(doc, subject, year, questions.length);
        let qNum = 1;
        for (const q of questions) {
          drawQuestion(doc, q, qNum++, includeAnswers === true);
        }
      }

      // — Answer key: one page per subject —
      if (includeAnswerKey && !includeAnswers && questionSets.some((s) => s.questions.length > 0)) {
        const W = doc.page.width;
        const margin = 42;
        const contentW = W - margin * 2;
        const cols = 6;
        const colW = contentW / cols;

        for (const { subject, questions } of questionSets) {
          if (questions.length === 0) continue;

          doc.addPage();
          doc.y = 158;

          // Subject banner
          const bannerY = doc.y;
          doc.rect(margin, bannerY, contentW, 36).fill("#000000");
          doc.fontSize(13).fillColor("#ffffff").font("Helvetica-Bold")
            .text("ANSWER KEY", margin + 12, bannerY + 5, { width: contentW - 24, lineBreak: false });
          doc.fontSize(10).fillColor("#cccccc").font("Helvetica")
            .text(subject.toUpperCase(), margin + 12, bannerY + 21, { width: contentW - 24, lineBreak: false });
          doc.y = bannerY + 52;

          // Grid of answers
          let col = 0;
          let rowY = doc.y;
          let keyNum = 1;

          questions.forEach((q) => {
            if (col === cols) { col = 0; rowY += 22; }
            const x = margin + col * colW;

            // subtle alternating cell background
            if (Math.floor((keyNum - 1) / cols) % 2 === 0) {
              doc.rect(x, rowY - 2, colW, 20).fill("#f5f5f5");
            }

            doc.fontSize(9).fillColor("#555555").font("Helvetica")
              .text(`${keyNum}.`, x + 4, rowY + 2, { width: 20, lineBreak: false });
            doc.fontSize(10).fillColor("#000000").font("Helvetica-Bold")
              .text(q.answer.toUpperCase(), x + 24, rowY + 2, { width: colW - 28, lineBreak: false });

            keyNum++;
            col++;
          });

          doc.y = rowY + 32;
        }
      }

      // — Watermark on every page —
      const { start: wmStart, count: wmCount } = doc.bufferedPageRange();
      for (let i = wmStart; i < wmStart + wmCount; i++) {
        doc.switchToPage(i);
        const pW = doc.page.width;
        const pH = doc.page.height;
        const logoSize = pW * 0.82;
        const x = (pW - logoSize) / 2;
        const y = (pH - logoSize) / 2;
        doc.save();
        doc.opacity(0.05);
        doc.image(JAMB_LOGO, x, y, { fit: [logoSize, logoSize], align: "center", valign: "center" });
        doc.restore();
      }

      // — Stamp header on page 1 only —
      doc.switchToPage(0);
      drawPageHeader(doc, title || "JAMB CBT Practice Paper", subtitle || "", schoolName || "", profileCode || "");

      doc.flushPages();
      doc.end();
    });

    // — Upload to CDN —
    const safeName = (schoolName || "student").replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "_");
    const safeRegNo = (subtitle || Date.now().toString()).replace(/[^a-zA-Z0-9-]/g, "");
    const filename = `${safeName}-${safeRegNo}.pdf`;
    const formData = new FormData();
    formData.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), filename);
    formData.append("filename", filename);

    const uploadRes = await fetch("https://rynekoo-api.hf.space/tools/uploader/alibaba", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(60000),
    });

    if (!uploadRes.ok) throw new Error("CDN upload failed");
    const uploadData = await uploadRes.json() as any;
    if (!uploadData.success || !uploadData.result) throw new Error("CDN upload failed: no URL returned");

    const totalQuestions = questionSets.reduce((sum, s) => sum + s.questions.length, 0);
    res.json({
      success: true,
      url: uploadData.result,
      filename,
      title: title || "JAMB CBT Practice Paper",
      subjects: questionSets.map((s) => ({ subject: s.subject, count: s.questions.length })),
      totalQuestions,
      generatedAt: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF", message: err.message });
  }
});

// — Send PDF link to admin email via Resend —
router.post("/send-email", async (req: Request, res: Response) => {
  const { url, filename, title, subjects, totalQuestions, generatedAt } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing PDF URL" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "infocheelee01@gmail.com";
  const RESEND_FROM = process.env.RESEND_FROM || "ExamPro <noreply@jamb.anita.name.ng>";

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Resend API key not configured" });
  }

  const subjectList = Array.isArray(subjects)
    ? subjects.map((s: any) => `<li style="margin:4px 0">${s.subject} &mdash; ${s.count} questions</li>`).join("")
    : "";

  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })
    : new Date().toLocaleString();

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e0e0e0">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center">
            <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px">
              EXAMPRO &times; EXAMCORE
            </h1>
            <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:2px;text-transform:uppercase">
              PDF Ready for Download
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px">
            <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#f0f0f0">${title || "JAMB CBT Practice Paper"}</h2>
            <p style="margin:0 0 24px;font-size:13px;color:#888">Generated on ${formattedDate}</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;border-radius:8px;padding:20px;margin-bottom:24px">
              <tr>
                <td>
                  <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#6366f1;letter-spacing:1.5px;text-transform:uppercase">Subjects</p>
                  <ul style="margin:0;padding-left:16px;font-size:14px;color:#ccc;line-height:1.7">
                    ${subjectList}
                  </ul>
                  <p style="margin:16px 0 0;font-size:13px;color:#888">
                    Total: <strong style="color:#f0f0f0">${totalQuestions || "—"} questions</strong>
                  </p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 40px;border-radius:8px;letter-spacing:0.3px">
                    Download PDF
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:12px;color:#555;text-align:center">
              Or copy this link: <a href="${url}" style="color:#6366f1;word-break:break-all">${url}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center">
            <p style="margin:0;font-size:11px;color:#444">ExamPro &times; ExamCore &mdash; Admin PDF Generator</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [ADMIN_EMAIL],
        subject: `PDF Ready: ${title || "JAMB CBT Practice Paper"} (${totalQuestions || "?"} questions)`,
        html,
      }),
    });

    const emailData = await emailRes.json() as any;

    if (!emailRes.ok) {
      console.error("Resend error:", emailData);
      return res.status(500).json({ error: "Failed to send email", details: emailData.message });
    }

    res.json({ success: true, id: emailData.id, sentTo: ADMIN_EMAIL });
  } catch (err: any) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send email", message: err.message });
  }
});

export default router;
