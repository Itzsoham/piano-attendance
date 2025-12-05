import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get("year") || "");
    const month = parseInt(searchParams.get("month") || "");

    if (!year || !month) {
      return NextResponse.json({ error: "Year and month are required" }, { status: 400 });
    }

    // Get start and end of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const lessons = await prisma.lesson.findMany({
      where: {
        teacherId: session.user.id,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        attendance: true,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}
