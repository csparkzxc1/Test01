import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";

class RegisterDeviceDto {
  @IsString() token!: string;
  @IsIn(["ios", "android", "web"]) platform!: "ios" | "android" | "web";
  @IsOptional() @IsString() deviceLabel?: string;
}

class UpdatePreferencesDto {
  @IsOptional() @IsBoolean() push?: boolean;
  @IsOptional() @IsBoolean() kakaoAlimtalk?: boolean;
  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) quietStart?: string;
  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) quietEnd?: string;
  @IsOptional() @IsBoolean() dailyDigest?: boolean;
  @IsOptional() @IsInt() @Min(0) @Max(23) digestHour?: number;
}

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post("devices")
  registerDevice(@CurrentUser() user: AuthUser, @Body() dto: RegisterDeviceDto) {
    return this.notifications.registerDevice(user.id, dto);
  }

  @Delete("devices/:token")
  unregisterDevice(@CurrentUser() user: AuthUser, @Param("token") token: string) {
    return this.notifications.unregisterDevice(user.id, token);
  }

  @Get("preferences")
  getPreferences(@CurrentUser() user: AuthUser) {
    return this.notifications.getPreferences(user.id);
  }

  @Patch("preferences")
  updatePreferences(@CurrentUser() user: AuthUser, @Body() dto: UpdatePreferencesDto) {
    return this.notifications.updatePreferences(user.id, dto);
  }
}
