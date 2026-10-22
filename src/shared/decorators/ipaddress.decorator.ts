import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as requestIp from 'request-ip';

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    if (data) console.log('no data');
    const req = ctx.switchToHttp().getRequest();
    if (req.clientIp) return req.clientIp;
    return requestIp.getClientIp(req);
  },
);
