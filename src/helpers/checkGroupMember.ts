import { BadRequestException } from '@nestjs/common';

export function checkViewPostInGroup(members: any, userId: string, isPublic: boolean): boolean {

    if (isPublic) return true;
    
    const isMember = members.some((memberId: any) => memberId.equals(userId));

    if (!isMember) {
        throw new BadRequestException('User is not a group members');
    }

    return isMember;
}