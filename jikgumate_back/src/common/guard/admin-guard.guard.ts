import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuardGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const isNotAdmin = !(user && user.isAdmin);

    // 1. context를 통해 현재 HTTP 요청 객체를 가져옵니다.
    // 2. 요청 객체에 담긴 사용자(user) 정보를 확인합니다.
    // 3. 사용자가 존재하지 않거나, 관리자 권한(isAdmin)이 없는 경우 UnauthorizedException을 던져 접근을 제한합니다.
    if (isNotAdmin) {
      throw new UnauthorizedException('관리자 권한이 필요합니다.');
    }
    return true;
  }
}
