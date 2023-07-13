import { IUser } from "@entities/User";

declare module 'express' {
    export interface Request {
        body: {
            user: IUser,
            similarity: string,
            results: number,
            userId: number,
            movieId: number
        };
    }
}
