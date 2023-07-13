export interface IRating {
    userId: number;
    movieId: number;
    score: number;
    hasSameMovie: (r: Rating) => boolean;
    hasSameUser: (r: Rating) => boolean;
}

class Rating implements IRating {

    public userId: number;
    public movieId: number;
    public score: number;

    constructor(userId: number, movieId: number, rating: number) {
        this.userId = userId;
        this.movieId = movieId;
        this.score = rating;
    }

    hasSameMovie(r: Rating): boolean {
        return r.movieId === this.movieId;
    }

    hasSameUser(r: Rating): boolean {
        return r.userId === this.userId;
    }
}

export default Rating;
