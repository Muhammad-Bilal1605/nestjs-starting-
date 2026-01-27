import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from 'src/generated/prisma/internal/prismaNamespaceBrowser';


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService){}


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
            
            return user;
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
            
            
            return user;

        } catch (error) {
            throw error;
        }

        
    }

}

