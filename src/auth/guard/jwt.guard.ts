import { AuthGuard } from "@nestjs/passport";

export class JWT_Guard extends AuthGuard('jwt') {
    constructor(){
        super();
    }
}