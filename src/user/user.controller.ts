import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { JWT_Guard } from 'src/auth/guard';

@Controller('user')
export class UserController {

    constructor(private authService: AuthService) {}

    @UseGuards(JWT_Guard)
    @Get('profile')
    getProfile(@Req() req: any) {
        return req.user;
    }

    @Post('logout')
    @UseGuards(JWT_Guard)
    async logout(@Req() req: any){
    const jti = req.user.jti;
    await this.authService.revokeSession(jti);
    return { ok: true };
    }

}
