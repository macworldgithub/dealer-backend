// src/auth/guards/ai-key.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['x-ai-key'];
    const expected = process.env.AI_SERVICE_KEY;

    if (!expected) throw new UnauthorizedException('AI key not configured');
    if (!key || key !== expected)
      throw new UnauthorizedException('Invalid AI key');

    return true;
  }
}
