import Rating from "./Rating";

export interface IMovie {
    movieId: number;
    title: string;
    year: number;
    score: number;
    ratings: Rating[];
}

class Movie implements IMovie {

    public movieId: number;
    public title: string;
    public year: number;
    public score: number;
    public ratings: Rating[];

    constructor(movieId: number, title: string, year: number, ratings: Rating[] = []) {
        this.movieId = movieId;
        this.title = title;
        this.year = year;
        this.score = 0;
        this.ratings = ratings;
    }
}

export default Movie;
