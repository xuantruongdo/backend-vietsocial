import { BadRequestException } from '@nestjs/common';

export function checkGroupAdmin(admin: any, userId: string): boolean {
    const isAdmin = admin.some((adminId: any) => adminId.equals(userId));

    if (!isAdmin) {
        throw new BadRequestException('User is not a group admin');
    }

    return isAdmin;
}