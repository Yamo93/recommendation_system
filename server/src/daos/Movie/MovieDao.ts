import FileService, { Row } from "src/services/FileService";
import path from "path";
import Movie, { IMovie } from "@entities/Movie";
import { IUserDao } from "@daos/User/UserDao";
import { IRatingDao } from "@daos/Rating/RatingDao";
import Rating from "@entities/Rating";
import { SIMILARITY_KEYS } from "src/const";

class Result {
  weightedScoreSum: number;
  similaritySum: number;

  constructor() {
    this.weightedScoreSum = 0;
    this.similaritySum = 0;
  }
}

export interface Payload {
  userId: number;
  similarity: string;
  results: number;
  movieId: number;
}

class Comparable {
  source: Rating;
  target: Rating;
  constructor(source: Rating, target: Rating) {
    this.source = source;
    this.target = target;
  }

  hasBeenCompared(r1: Rating, r2: Rating): boolean {
    return (r1 === this.source && r2 === this.target) || (r2 === this.source && r2 === this.target);
  }
}

export interface IMovieDao {
  getAll: () => Promise<IMovie[]>;
  findItemBasedRecommendedMovies: (payload: Payload) => Promise<IMovie[]>;
}

class MovieDao implements IMovieDao {
  userDao: IUserDao;
  movieMap: Map<number, Movie>;
  ratingDao: IRatingDao;
  ratingsMap: Map<number, Rating[]>;
  allRatings: Rating[];

  constructor(userDao: IUserDao, ratingDao: IRatingDao) {
    this.userDao = userDao;
    this.ratingDao = ratingDao;
    this.movieMap = new Map<number, Movie>();
    this.ratingsMap = new Map<number, Rating[]>();
    this.allRatings = [];
  }

  /**
   * Returns all movies.
   */
  public async getAll(): Promise<IMovie[]> {
    // TODO: Handle pathname internally in FileService
    const pathName = path.join(__dirname, "..", "..", "data", "movies_large", "movies.csv");
    const movieFileContent = await FileService.readCsvFile(pathName);

    this.movieMap = new Map<number, Movie>();

    const movies: IMovie[] = movieFileContent.map((row: Row): Movie => {
      const { MovieId: movieId, Title: title, Year: year } = row;
      const movie = new Movie(Number(movieId), title, Number(year));
      this.movieMap.set(Number(movieId), movie);
      return movie;
    });
    return movies;
  }

  /**
   * Finds recommended movies for a given user.
   */
  public async findRecommendedMovies(payload: Payload): Promise<IMovie[]> {
    // Store all movies
    await this.getAll();

    // Find similar users
    let similarUsers = await this.userDao.computeSimilarUsers(payload.userId, payload.similarity);

    // Get current user
    const currentUser = similarUsers.find((u) => u.id === payload.userId);
    if (!currentUser) throw new Error("Cannot find current user.");

    // Filter out the user itself and unsimilar users
    similarUsers = similarUsers
      .filter((u) => u.id !== payload.userId)
      .filter((u) => u.score && u.score > 0);

    /**
     * movieMap: <movieId, RecommendationResult>
     *
     * RecommendationResult = { weightedScoreSum, similaritySum }
     */

    // Store recommendation computations in map
    const map = new Map<number, Result>();

    // Calculate weighted score for every movie rating
    for (const user of similarUsers) {
      for (const rating of user.ratings) {
        // If the given user has already rated it, don't add it to the map
        if (currentUser.hasRated(rating)) continue;
        // For each movie rating, increment sum of weighted scores for the given movie
        // Also, increment similaritySum with user's similarity
        let result = map.get(rating.movieId);
        if (result) {
          result.weightedScoreSum += rating.score * user.score;
          result.similaritySum += user.score;
        } else {
          result = new Result();
          result.weightedScoreSum += rating.score * user.score;
          result.similaritySum += user.score;
          map.set(rating.movieId, result);
        }
      }
    }

    // Process collected data
    const movies: Movie[] = [];
    for (const [movieId, result] of map) {
      // Divide sum of weighted scores with sum of similarity
      const movie = this.movieMap.get(movieId);
      if (movie) {
        const recommendationScore = result.weightedScoreSum / result.similaritySum;
        movie.score = recommendationScore;
        movies.push(movie);
      }
    }

    // Sort movies by score in-place
    movies.sort((a, b) => b.score - a.score);

    return movies.slice(0, payload.results);
  }

  public async findItemBasedRecommendedMovies(payload: Payload): Promise<Movie[]> {
    const movies = await this.getAll();

    // WIP: Implement

    // Sort movies by score in-place
    movies.sort((a, b) => b.score - a.score);

    return movies.slice(0, payload.results);
  }

  /**
   * Finds recommended movies for a given movie.
   */
  public async findRecommendedMoviesForMovie(payload: Payload): Promise<IMovie[]> {
    // Store all movies
    await this.getAll();

    // Find similar movies
    let similarMovies = await this.computeSimilarMovies(payload.movieId, payload.similarity);

    // Get current movie
    const currentMovie = similarMovies.find((m) => m.movieId === payload.movieId);
    if (!currentMovie) throw new Error("Cannot find current movie.");

    // Filter out the movie itself and unsimilar movies
    similarMovies = similarMovies
      .filter((m) => m.movieId !== payload.movieId)
      .filter((m) => m.score && m.score > 0);

    /**
     * movieMap: <movieId, RecommendationResult>
     *
     * RecommendationResult = { weightedScoreSum, similaritySum }
     */

    // Store recommendation computations in map
    const map = new Map<number, Result>();

    // Calculate weighted score for every movie rating
    for (const movie of similarMovies) {
      // TODO: Do I need a guard here?
      if (currentMovie.movieId === movie.movieId) continue;
      for (const rating of movie.ratings) {
        // For each movie rating, increment sum of weighted scores for the given movie
        // Also, increment similaritySum with user's similarity
        let result = map.get(rating.movieId);
        if (result) {
          result.weightedScoreSum += rating.score * movie.score;
          result.similaritySum += movie.score;
        } else {
          result = new Result();
          result.weightedScoreSum += rating.score * movie.score;
          result.similaritySum += movie.score;
          map.set(rating.movieId, result);
        }
      }
    }

    // Process collected data
    const movies: Movie[] = [];
    for (const [movieId, result] of map) {
      // Divide sum of weighted scores with sum of similarity
      const movie = this.movieMap.get(movieId);
      if (movie) {
        const recommendationScore = result.weightedScoreSum / result.similaritySum;
        movie.score = recommendationScore;
        movies.push(movie);
      }
    }

    // Sort movies by score in-place
    movies.sort((a, b) => b.score - a.score);

    return movies.slice(0, payload.results);
  }

  async getMoviesWithRatings(): Promise<Movie[]> {
    // Get all ratings
    const allRatings = await this.ratingDao.getAll();
    this.allRatings = allRatings;

    // Populate map which stores ratings for each movie
    this.ratingsMap = new Map<number, Rating[]>();
    for (const rating of allRatings) {
      if (this.ratingsMap.has(rating.movieId)) {
        const ratings = this.ratingsMap.get(rating.movieId);
        ratings?.push(rating);
      } else {
        const ratings: Rating[] = [rating];
        this.ratingsMap.set(rating.movieId, ratings);
      }
    }

    // Iterate over movies and set ratings to each movie
    const movies = await this.getAll();
    const moviesWithRatings = movies.map((movie: Movie) => {
      const ratings: Rating[] = this.ratingsMap.get(movie.movieId) || [];
      const movieWithRatings = new Movie(movie.movieId, movie.title, movie.year, ratings);
      return movieWithRatings;
    });

    return moviesWithRatings;
  }

  euclidean(movie: IMovie, movieRatings: Rating[]): number {
    let similarityScore = 0;
    let numberOfRatings = 0;
    const visited = new Set<Comparable>();
    // given superman, is lady similar to superman??
    // find ratings for users who have rated both lady and superman
    // check for other users who have also rated movie X
    for (const ratingA of movie.ratings) {
      for (const ratingB of movie.ratings) {
        if (ratingA.hasSameUser(ratingB)) continue;
        // TODO: check if this computation has already been done
        // has the user of this rating (lady) also rated superman?
        if (movieRatings.some((r) => r.userId === ratingB.userId)) {
          // TODO: compute their ratings on lady
          similarityScore += (ratingA.score - ratingB.score) ** 2;
          numberOfRatings++;
          visited.add(new Comparable(ratingA, ratingB));
        }
      }
    }
    // No ratings in common
    if (!numberOfRatings) return 0;

    const inverted = 1 / (1 + similarityScore);
    return inverted;
  }

  pearson(movie: IMovie, moviesWithRatings: Movie[]): number {
    let sum1 = 0,
      sum2 = 0,
      sum1sq = 0,
      sum2sq = 0,
      pSum = 0,
      n = 0;

    for (const m of moviesWithRatings) {
      // Iterate over all rating combinations
      for (const ratingA of m.ratings) {
        for (const ratingB of movie.ratings) {
          if (ratingA.hasSameUser(ratingB)) continue;

          if (ratingA.hasSameMovie(ratingB)) {
            sum1 += ratingA.score; // Sum of ratings for movieA
            sum2 += ratingB.score; // Sum of ratings for movieB
            sum1sq += ratingA.score ** 2; // Sum of squared ratings for A
            sum2sq += ratingB.score ** 2; // Sum of squared ratings for B
            pSum += ratingA.score * ratingB.score;
            n++; // Increment number of ratings in common
          }
        }
      }
    }

    if (!n) return 0;

    const numerator = pSum - (sum1 * sum2) / n;
    const denominator = Math.sqrt((sum1sq - sum1 ** 2 / n) * (sum2sq - sum2 ** 2 / n));
    return numerator / denominator;
  }

  public async computeSimilarMovies(movieId: number, similarity: string): Promise<IMovie[]> {
    let similarMovies: IMovie[] = [];

    if (similarity === SIMILARITY_KEYS.EUCLIDEAN) {
      // TODO: Abstract away these two, and select euclidean() or pearson() further down instead
      similarMovies = await this.computeSimilarMoviesByEuclidean(movieId);
    } else if (similarity === SIMILARITY_KEYS.PEARSON) {
      similarMovies = await this.computeSimilarMoviesByPearson(movieId);
    }

    return similarMovies;
  }

  async computeSimilarMoviesByEuclidean(movieId: number): Promise<IMovie[]> {
    const moviesWithRatings = await this.getMoviesWithRatings();

    const movieRatings = this.ratingsMap.get(movieId);
    if (!movieRatings) throw new Error("Movie has no ratings.");

    // Compute similarity
    for (const movie of moviesWithRatings) {
      movie.score = this.euclidean(movie, movieRatings);
    }

    return moviesWithRatings;
  }

  async computeSimilarMoviesByPearson(movieId: number): Promise<IMovie[]> {
    const moviesWithRatings = await this.getMoviesWithRatings();

    const movieRatings = this.ratingsMap.get(movieId);
    if (!movieRatings) throw new Error("Movie has no ratings.");

    // Compute similarity
    for (const movie of moviesWithRatings) {
      movie.score = this.pearson(movie, moviesWithRatings);
    }

    return moviesWithRatings;
  }
}

export default MovieDao;
