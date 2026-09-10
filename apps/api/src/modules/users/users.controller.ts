import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Patch,
  Res,
  UseGuards
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import type { SafeUser } from "./safe-user";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly config: ConfigService
  ) {}

  @Get("me")
  getMe(@CurrentUser() user: SafeUser): Promise<SafeUser> {
    return this.users.findById(user.id);
  }

  @Patch("me")
  updateMe(
    @CurrentUser() user: SafeUser,
    @Body() dto: UpdateUserDto
  ): Promise<SafeUser> {
    return this.users.update(user.id, dto);
  }

  @Get("me/export")
  @Header("Content-Type", "application/json")
  @Header(
    "Content-Disposition",
    'attachment; filename="meu-dim-dados.json"'
  )
  exportMyData(@CurrentUser() user: SafeUser): Promise<object> {
    return this.users.exportData(user.id);
  }

  @Delete("me")
  @HttpCode(HttpStatus.OK)
  async deleteMyAccount(
    @CurrentUser() user: SafeUser,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ message: string }> {
    await this.users.deleteAccount(user.id);
    response.clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: "strict",
      secure: this.config.get<string>("NODE_ENV") === "production",
      path: "/v1/auth"
    });

    return {
      message: "Conta excluída. Todos os seus dados foram removidos."
    };
  }
}
