import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateChecklistInput {
  title: string;
}

export interface UpdateChecklistInput {
  title?: string;
  done?: boolean;
  sortOrder?: number;
}

@Injectable()
export class ChecklistService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string, taskId: string) {
    await this.ensureTaskOwned(ownerId, taskId);
    return this.prisma.checklistItem.findMany({
      where: { taskId },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
  }

  async add(ownerId: string, taskId: string, input: CreateChecklistInput) {
    await this.ensureTaskOwned(ownerId, taskId);
    const count = await this.prisma.checklistItem.count({ where: { taskId } });
    return this.prisma.checklistItem.create({
      data: { taskId, title: input.title, sortOrder: count },
    });
  }

  async update(ownerId: string, itemId: string, input: UpdateChecklistInput) {
    const item = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: { task: { select: { ownerId: true } } },
    });
    if (!item) throw new NotFoundException("Checklist item not found");
    if (item.task.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.checklistItem.update({ where: { id: itemId }, data: input });
  }

  async remove(ownerId: string, itemId: string) {
    const item = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: { task: { select: { ownerId: true } } },
    });
    if (!item) throw new NotFoundException("Checklist item not found");
    if (item.task.ownerId !== ownerId) throw new ForbiddenException();
    await this.prisma.checklistItem.delete({ where: { id: itemId } });
    return { ok: true };
  }

  private async ensureTaskOwned(ownerId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, ownerId } });
    if (!task) throw new NotFoundException("Task not found");
  }
}
