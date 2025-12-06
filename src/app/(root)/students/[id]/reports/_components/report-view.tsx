"use client";

import { useState, useTransition } from "react";
import { Student, MonthlyReport, Lesson, Attendance, AttendanceStatus } from "@/lib/generated/client";
import { upsertReport } from "@/lib/actions/reports";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getWeekOfMonth, getDate, format } from "date-fns";
import { Loader2, Save, Printer } from "lucide-react";

interface ReportViewProps {
  student: Student;
  report: MonthlyReport | null;
  lessons: (Lesson & { attendance: Attendance | null })[];
  month: number;
  year: number;
}

export function ReportView({ student, report, lessons, month, year }: ReportViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [summary, setSummary] = useState(report?.summary || "");
  const [comments, setComments] = useState(report?.comments || "");
  const [nextMonthPlan, setNextMonthPlan] = useState(report?.nextMonthPlan || "");

  const handleSave = () => {
    startTransition(async () => {
      try {
        await upsertReport(student.id, month, year, {
          summary,
          comments,
          nextMonthPlan,
        });
        toast.success("Report saved successfully");
      } catch (error) {
        toast.error("Failed to save report");
      }
    });
  };

  const handleMonthChange = (val: string) => {
    const newMonth = parseInt(val);
    router.push(`?month=${newMonth}&year=${year}`);
  };

  const handleYearChange = (val: string) => {
    const newYear = parseInt(val);
    router.push(`?month=${month}&year=${newYear}`);
  };

  // Calculate Stats
  const validLessons = lessons.filter((l) => l.attendance?.status === "PRESENT" || l.attendance?.status === "MAKEUP");
  // Or should we just count all non-absent?
  // Let's assume Present + Makeup = Billable.
  const totalSessions = validLessons.length;
  const totalFee = totalSessions * (student.hourlyRateCents || 0); // Assuming rate is per session or hourly?
  // The model says `hourlyRateCents`.
  // The screenshot says "Học phí 10 buổi x 200.000".
  // `hourlyRateCents` might be misleading if it's per lesson?
  // Actually, standard is usually per hour, but here it looks like per "buổi" (session).
  // I'll use `hourlyRateCents` (converted to main currency) as the multiplier.
  // Note: stored in cents. displayed in VND (usually just number).
  // 200.000 VND -> 200000. Cents would be 200000 * 100? No, VND doesn't use cents usually.
  // Often devs store VND directly in `Int` or `Float` but name it `Cents` by habit or use 1 unit = 1 VND.
  // Let's assume `hourlyRateCents` stores the raw value or I need to divide by 1.
  // Given `hourlyRateCents` name, maybe it's USD based schema reused?
  // I'll display formatted currency.

  // Attendance Grid Logic
  const weeksData: Record<number, { day: number; status: string }[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [], // Some months have 6 weeks
  };

  lessons.forEach((lesson) => {
    const week = getWeekOfMonth(lesson.scheduledAt, { weekStartsOn: 1 });
    const day = getDate(lesson.scheduledAt);
    const status = lesson.attendance?.status || "PENDING";
    if (weeksData[week]) {
      weeksData[week].push({ day, status });
    }
  });

  const hasWeek6 = weeksData[6] && weeksData[6].length > 0;
  const weeks = hasWeek6 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Controls - Hidden on Print */}
      <div className="bg-card flex flex-col items-center justify-between gap-4 rounded-lg border p-4 shadow-sm sm:flex-row print:hidden">
        <div className="flex items-center gap-2">
          <Select value={month.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  Month {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Report Paper */}
      <div className="mx-auto min-h-[297mm] max-w-[210mm] bg-white p-8 font-serif text-black shadow-lg print:m-0 print:w-full print:p-0 print:shadow-none">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-xl font-bold uppercase">
            TỔNG KẾT THÁNG {month}/{year}
          </h1>
          <p className="font-semibold">Tên học sinh : {student.name}</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-lg font-bold">I. Tổng kết tháng.</h2>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[100px] w-full resize-none border-none bg-transparent p-0 font-serif text-base leading-relaxed shadow-none focus-visible:ring-0"
              placeholder="- Con hoàn thành..."
            />
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">II. Nhận xét.</h2>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[150px] w-full resize-none border-none bg-transparent p-0 font-serif text-base leading-relaxed shadow-none focus-visible:ring-0"
              placeholder="- Kỹ thuật..."
            />
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">III. Hoạt động tháng tới</h2>
            <Textarea
              value={nextMonthPlan}
              onChange={(e) => setNextMonthPlan(e.target.value)}
              className="min-h-[100px] w-full resize-none border-none bg-transparent p-0 font-serif text-base leading-relaxed shadow-none focus-visible:ring-0"
              placeholder="- Học bài mới..."
            />
          </section>

          {/* Attendance Table */}
          <section className="pt-4">
            <h2 className="mb-4 text-center text-lg font-bold">BẢNG ĐIỂM DANH THÁNG {month}</h2>

            <div className="border border-black">
              {/* Header Row */}
              <div
                className="grid divide-x divide-black border-b border-black text-center font-bold"
                style={{ gridTemplateColumns: `50px 100px repeat(${weeks.length}, 1fr)` }}
              >
                <div className="flex items-center justify-center p-2">STT</div>
                <div className="flex items-center justify-center p-2">TÊN HS</div>
                {weeks.map((w) => (
                  <div key={w} className="p-2">
                    Tuần {w}
                  </div>
                ))}
              </div>

              {/* Data Row */}
              <div
                className="grid min-h-[60px] divide-x divide-black text-center"
                style={{ gridTemplateColumns: `50px 100px repeat(${weeks.length}, 1fr)` }}
              >
                <div className="flex items-center justify-center p-2">1</div>
                <div className="flex items-center justify-center p-2 font-bold uppercase">{student.name}</div>
                {weeks.map((w) => (
                  <div key={w} className="flex h-full flex-wrap content-center items-center justify-center gap-2 p-2">
                    {weeksData[w]?.map((item, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex h-8 w-8 items-center justify-center border border-gray-300 text-sm font-semibold ${item.status === "ABSENT" ? "bg-yellow-300" : ""} ${item.status === "MAKEUP" ? "bg-blue-300" : ""} ${item.status === "PRESENT" ? "bg-white" : ""} `}
                      >
                        {item.day}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend & Stats */}
            <div className="mt-4 space-y-2">
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span>Ghi chú : buổi vắng:</span>
                  <div className="h-4 w-4 border border-gray-400 bg-yellow-300"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span>buổi dạy bù :</span>
                  <div className="h-4 w-4 border border-gray-400 bg-blue-300"></div>
                </div>
              </div>

              <div className="mt-4 text-lg font-bold italic">TỔNG : {totalSessions} BUỔI</div>

              <div className="text-lg italic">
                Học phí {totalSessions} buổi x {new Intl.NumberFormat("vi-VN").format(student.hourlyRateCents)} ={" "}
                {new Intl.NumberFormat("vi-VN").format(totalFee)}
              </div>
            </div>

            <div className="mt-12 mb-12 text-right italic">Đà Nẵng, Ngày {format(new Date(), "dd/MM/yyyy")}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
