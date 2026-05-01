import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is a member of the project
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: id, userId: session.user.id },
      },
    });

    if (!member) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, status, dueDate, assigneeId } = await request.json();

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    // Check if user is a member of the project
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: id, userId: session.user.id },
      },
    });

    if (!member) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Optional: Only admins can assign tasks? 
    // For now, any member can create a task.

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "PENDING",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: id,
        assigneeId: assigneeId || null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Tasks POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
