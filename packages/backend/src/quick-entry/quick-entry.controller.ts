import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { parseKoreanEntry } from "@haru/shared";
import { TasksService } from "../tasks/tasks.service";
import { IsOptional, IsString } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";

class QuickEntryDto {
  @IsString() raw!: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() areaId?: string;
}

class QuickEntryPreviewDto {
  @IsString() raw!: string;
}

/**
 * Quick Entry: 자연어 한 줄 입력으로 Task 생성.
 * 예) "내일 오후 3시 팀 회의 #회의"
 */
@Controller("quick-entry")
export class QuickEntryController {
  constructor(private readonly tasks: TasksService) {}

  @Post("preview")
  preview(@Body() dto: QuickEntryPreviewDto) {
    return parseKoreanEntry(dto.raw);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() dto: QuickEntryDto) {
    const parsed = parseKoreanEntry(dto.raw);
    return this.tasks.create(user.id, {
      title: parsed.title,
      when: parsed.when ?? undefined,
      deadline: parsed.deadline ?? undefined,
      allDay: parsed.allDay,
      tags: parsed.tags,
      projectId: dto.projectId,
      areaId: dto.areaId,
    });
  }
}
