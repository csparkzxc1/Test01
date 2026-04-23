import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AreasService } from "./areas.service";
import { CreateAreaDto, UpdateAreaDto } from "./areas.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";

@Controller("areas")
@UseGuards(JwtAuthGuard)
export class AreasController {
  constructor(private readonly areas: AreasService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.areas.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAreaDto) {
    return this.areas.create(user.id, dto);
  }

  @Patch(":id")
  update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateAreaDto) {
    return this.areas.update(user.id, id, dto);
  }

  @Post(":id/archive")
  archive(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.areas.archive(user.id, id);
  }
}
