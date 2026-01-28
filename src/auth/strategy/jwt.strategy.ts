
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: any) {
    try {
      const jti=payload.jti;
      if(!jti){
        throw new Error('jti not present in token');
      }

      const session= await this.prisma.session.findUnique({
        where:{jti}
      })
      if(!session || session.revokedAt || session.expiresAt < new Date()){
        throw new Error('Invalid session');
      }
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (user) {
        const { hash, ...result } = user;
        return {result, jti};
      }

    } catch (error) {
      throw error;
    }
    
  }
}
