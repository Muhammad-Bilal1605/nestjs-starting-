import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from 'src/generated/prisma/internal/prismaNamespaceBrowser';
import { JwtService } from '@nestjs/jwt';
import { randomUUID, sign } from 'crypto';


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,private jwt: JwtService){}


    async signup(dto: AuthDto) {
        try {
             const hash = await argon.hash(dto.hash);
            // save the new user in the db
            
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                }
            });

            const jti=randomUUID();
            const expiresAt=new Date(Date.now()+15*60*1000);


            await this.prisma.session.create({
                data:{
                    jti,
                    userId:user.id,
                    expiresAt,
                }
            })
            
            return this.signToken(user.id,user.email,jti);

        } catch (error) {
            throw error;
        }
        // generate the password hash
       
    }

    async signin(dto: AuthDto){

        try {
            const user= await this.prisma.user.findUnique({
                where:{
                    email:dto.email
                },
                
            });
            //check if user exists
            if(!user) throw new ForbiddenException('Credentials incorrect: user not found');

            //compare password
            const pwMatches= await argon.verify(user.hash,dto.hash);

            //check if password correct
            if(!pwMatches) throw new ForbiddenException('Credentials incorrect: password mismatch');
            // session creation
            const jti=randomUUID();
            const expiresAt=new Date(Date.now()+15*60*1000);


            await this.prisma.session.create({
                data:{
                    jti,
                    userId:user.id,
                    expiresAt,
                }
            })
            
            return this.signToken(user.id,user.email,jti);

        } catch (error) {
            throw error;
        }

        
    }

    async signToken(userId: number, email: string, jti: string):Promise<{access_token:string}>{
        const payload={sub:userId,email,jti};
        const secret=process.env.JWT_SECRET as string;

        const token= await this.jwt.signAsync(payload,{
            expiresIn:'15m',
            secret:secret,
            
        });

        return{
            access_token:token,
        };
    }

    async revokeSession(jti:string){
        await this.prisma.session.update({
            where:{jti},
            data:{revokedAt:new Date()}
        })
    }

}

