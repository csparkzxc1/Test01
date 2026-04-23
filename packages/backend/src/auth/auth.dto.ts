import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) @MaxLength(128) password!: string;
  @IsString() @MinLength(1) @MaxLength(40) nickname!: string;
  @IsBoolean() privacyAgreed!: boolean;
  @IsBoolean() termsAgreed!: boolean;
  @IsOptional() @IsBoolean() marketingOptIn?: boolean;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}

export class KakaoLoginDto {
  /** 카카오 OAuth access_token (프론트에서 받아 전달) */
  @IsString() accessToken!: string;
  @IsOptional() @IsBoolean() privacyAgreed?: boolean;
  @IsOptional() @IsBoolean() termsAgreed?: boolean;
  @IsOptional() @IsBoolean() marketingOptIn?: boolean;
}

export class RefreshDto {
  @IsString() refreshToken!: string;
}
