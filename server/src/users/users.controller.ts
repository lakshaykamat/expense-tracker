import { Controller, Get, UseGuards, Req, Res } from "@nestjs/common";
import type { Response } from 'express';
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Get('export/csv')
  @UseGuards(JwtAuthGuard)
  async exportToCSV(@Req() req, @Res() res: Response) {
    const { csv, filename } = await this.usersService.exportDataToCSV(req.user);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
