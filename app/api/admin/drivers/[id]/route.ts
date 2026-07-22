import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateDriverExperienceYears } from "@/lib/driver";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, phone, address } = body;

    const existingDriver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!existingDriver) {
      return NextResponse.json(
        { error: "Driver tidak ditemukan" },
        { status: 404 }
      );
    }

    const updateData: { name?: string; phone?: string; address?: string | null } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { error: "Nama driver tidak boleh kosong" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || !phone.trim()) {
        return NextResponse.json(
          { error: "Nomor handphone driver tidak boleh kosong" },
          { status: 400 }
        );
      }
      updateData.phone = phone.trim();
    }

    if (address !== undefined) {
      updateData.address = address ? address.trim() : null;
    }

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: updateData,
    });

    const expYears = calculateDriverExperienceYears(
      updatedDriver.initialExperience,
      updatedDriver.createdAt
    );

    return NextResponse.json({
      success: true,
      message: "Data driver berhasil diperbarui",
      data: {
        ...updatedDriver,
        experienceYears: expYears,
        experience: `${expYears} Tahun`,
      },
    });
  } catch (error: any) {
    console.error("PATCH driver error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data driver" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existingDriver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!existingDriver) {
      return NextResponse.json(
        { error: "Driver tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.driver.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Driver berhasil dihapus",
    });
  } catch (error: any) {
    console.error("DELETE driver error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus driver" },
      { status: 500 }
    );
  }
}
