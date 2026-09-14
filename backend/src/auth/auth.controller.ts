import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Role } from "@prisma/client";
import { CurrentUser } from "./decorators/current-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    login(@Body() body: {email: string; password: string}) {
        return this.authService.login(body.email, body.password);
    }

    @Post('register')
    register(@Body() body: {email: string; password: string; role: Role}) {
        return this.authService.register(body.email, body.password, body.role)
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@CurrentUser() user: any) {
        return this.authService.getProfile(user.id)
    }

    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    changePassword(
    @CurrentUser() user: any,
    @Body() body: { currentPassword: string; newPassword: string },
    ) {
    return this.authService.changePassword(
        user.id,
        body.currentPassword,
        body.newPassword,
    );
    }
}