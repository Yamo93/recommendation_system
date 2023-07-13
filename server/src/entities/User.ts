import Rating from "./Rating";

export interface IUser {
    id: number;
    name: string;
    ratings: Rating[];
    score: number;
    hasRated: (rating: Rating) => boolean;
}

class User implements IUser {

    public id: number;
    public name: string;
    score: number;
    ratings: Rating[];

    constructor(nameOrUser: string | IUser, id: number, score = 0, ratings: Rating[] = []) {
        this.score = score;
        this.ratings = ratings;
        if (typeof nameOrUser === 'string') {
            this.name = nameOrUser;
            this.id = id;
        } else {
            this.name = nameOrUser.name;
            this.id = nameOrUser.id;
        }
    }

    public hasRated(rating: Rating): boolean {
        return this.ratings.some(r => r.movieId === rating.movieId);
    }
}

export default User;
