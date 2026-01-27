import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService){}
    signUp(dto) {
        return {msg:"I am signed up", dto:dto}
    }

    signin(){
        return {msg:"I am signed in"}
    }

}

