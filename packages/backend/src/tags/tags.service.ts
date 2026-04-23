import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface UpsertTagInput {
  name: string;
  colorHex?: string;
}

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  list(ownerId: string) {
    return this.prisma.tag.findMany({
      where: { ownerId },
      include: { _count: { select: { taskTags: true } } },
      orderBy: { name: "asc" },
    });
  }

  upsert(ownerId: string, input: UpsertTagInput) {
    return this.prisma.tag.upsert({
      where: { ownerId_name: { ownerId, name: input.name } },
      update: { colorHex: input.colorHex },
      create: { ownerId, name: input.name, colorHex: input.colorHex },
    });
  }

  async rename(ownerId: string, id: string, name: string) {
    const existing = await this.prisma.tag.findFirst({ where: { id, ownerId } });
    if (!existing) throw new NotFoundException("Tag not found");
    return this.prisma.tag.update({ where: { id }, data: { name } });
  }

  async remove(ownerId: string, id: string) {
    const existing = await this.prisma.tag.findFirst({ where: { id, ownerId } });
    if (!existing) throw new NotFoundException("Tag not found");
    await this.prisma.tag.delete({ where: { id } });
    return { ok: true };
  }
}
