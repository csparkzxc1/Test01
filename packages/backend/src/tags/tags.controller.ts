import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { IsHexColor, IsOptional, IsString, MaxLength } from "class-validator";
import { TagsService } from "./tags.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";

class UpsertTagDto {
  @IsString() @MaxLength(32) name!: string;
  @IsOptional() @IsHexColor() colorHex?: string;
}

class RenameTagDto {
  @IsString() @MaxLength(32) name!: string;
}

@Controller("tags")
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tags: TagsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.tags.list(user.id);
  }

  @Post()
  upsert(@CurrentUser() user: AuthUser, @Body() dto: UpsertTagDto) {
    return this.tags.upsert(user.id, dto);
  }

  @Patch(":id")
  rename(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: RenameTagDto) {
    return this.tags.rename(user.id, id, dto.name);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.tags.remove(user.id, id);
  }
}
