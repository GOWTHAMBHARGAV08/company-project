import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { email, role } = await request.json();

    // Check if user is ADMIN of the project
    const currentMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: id, userId: session.user.id },
      },
    });

    if (!currentMember || currentMember.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden - Must be ADMIN to add members" }, { status: 403 });
    }

    // Find the user to add by email
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      return NextResponse.json({ message: "User not found with provided email" }, { status: 404 });
    }

    // Check if already a member
    const existingMembership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: id, userId: userToAdd.id },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ message: "User is already a member" }, { status: 400 });
    }

    const newMember = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: userToAdd.id,
        role: role || "MEMBER",
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Members POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
