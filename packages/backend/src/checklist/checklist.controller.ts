import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { ChecklistService } from "./checklist.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";

class CreateChecklistDto {
  @IsString() @MaxLength(500) title!: string;
}

class UpdateChecklistDto {
  @IsOptional() @IsString() @MaxLength(500) title?: string;
  @IsOptional() @IsBoolean() done?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class ChecklistController {
  constructor(private readonly checklist: ChecklistService) {}

  @Get("tasks/:taskId/checklist")
  list(@CurrentUser() user: AuthUser, @Param("taskId") taskId: string) {
    return this.checklist.list(user.id, taskId);
  }

  @Post("tasks/:taskId/checklist")
  add(
    @CurrentUser() user: AuthUser,
    @Param("taskId") taskId: string,
    @Body() dto: CreateChecklistDto,
  ) {
    return this.checklist.add(user.id, taskId, dto);
  }

  @Patch("checklist/:itemId")
  update(
    @CurrentUser() user: AuthUser,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateChecklistDto,
  ) {
    return this.checklist.update(user.id, itemId, dto);
  }

  @Delete("checklist/:itemId")
  remove(@CurrentUser() user: AuthUser, @Param("itemId") itemId: string) {
    return this.checklist.remove(user.id, itemId);
  }
}
