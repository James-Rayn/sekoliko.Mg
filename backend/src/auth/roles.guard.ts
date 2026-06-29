import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from '@prisma/client';
import { ROLES_KEY } from "./decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflecotr: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflecotr.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) return true;
        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.includes(user.role)
    }
}