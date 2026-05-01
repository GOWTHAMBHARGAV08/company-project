import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, memberId } = await params;

    // Check if user is ADMIN of the project
    const currentMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: id, userId: session.user.id },
      },
    });

    if (!currentMember || currentMember.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden - Must be ADMIN to remove members" }, { status: 403 });
    }

    // Cannot remove oneself
    if (memberId === session.user.id) {
      return NextResponse.json({ message: "Cannot remove yourself. Use leave project instead." }, { status: 400 });
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId: id, userId: memberId },
      },
    });

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Members DELETE error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
