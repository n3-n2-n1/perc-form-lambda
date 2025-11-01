import { Controller, Get, Post, Req, Body } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  @Post('get-ip')
  getIp(@Req() req: Request) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const connectionRemoteAddress = req.socket?.remoteAddress;

    const ip =
      (Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor) ||
      realIp ||
      connectionRemoteAddress ||
      'unknown';

    return { ip };
  }
}

