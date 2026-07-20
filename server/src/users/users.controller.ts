import { Controller, Get, Post, Delete, UseGuards, Req, Res } from "@nestjs/common";
import type { Response } from 'express';
import { UsersService } from "./users.service";
import { AuthService } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { LoggedInUser } from "../common/decorators/loggedin-user.decorator";
import type { UserDocument } from "../auth/schemas/user.schema";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('export/csv')
  @UseGuards(JwtAuthGuard)
  async exportToCSV(@Req() req, @Res() res: Response) {
    const { csv, filename } = await this.usersService.exportDataToCSV(req.user);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Post('api-key')
  @UseGuards(JwtAuthGuard)
  async generateApiKey(@LoggedInUser() user: UserDocument) {
    const apiKey = await this.authService.generateApiKey(user._id.toString());
    return { apiKey };
  }

  @Delete('api-key')
  @UseGuards(JwtAuthGuard)
  async revokeApiKey(@LoggedInUser() user: UserDocument) {
    await this.authService.revokeApiKey(user._id.toString());
    return { message: 'API key revoked' };
  }
}
