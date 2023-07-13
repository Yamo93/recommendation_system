import StatusCodes from 'http-status-codes';
import { Request, Response } from 'express';

import UserDao from '@daos/User/UserDao';
import RatingDao from '@daos/Rating/RatingDao';
import MovieDao, { Payload } from '@daos/Movie/MovieDao';
import { IMovie } from '@entities/Movie';

const ratingDao = new RatingDao();
const userDao = new UserDao(ratingDao);
const movieDao = new MovieDao(userDao, ratingDao);
const { OK } = StatusCodes;



/**
 * Get all recommended movies.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export function findRecommendedMovies(req: Request, res: Response): void {
    const payload: Payload = {
        userId: req.body.userId,
        similarity: req.body.similarity,
        results: req.body.results,
        movieId: 0
    }
    movieDao.findRecommendedMovies(payload)
        .then((movies: IMovie[]) => res.status(OK).json(movies));
}

/**
 * Get all recommended movies for movie.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export function findRecommendedMoviesForMovie(req: Request, res: Response): void {
    const payload: Payload = {
        userId: req.body.userId,
        similarity: req.body.similarity,
        results: req.body.results,
        movieId: req.body.movieId
    }
    movieDao.findRecommendedMoviesForMovie(payload)
        .then((movies: IMovie[]) => res.status(OK).json(movies));
}


/**
 * Get all item-based recommended movies.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export function findItemBasedRecommendedMovies(req: Request, res: Response): void {
    const payload: Payload = {
        userId: req.body.userId,
        similarity: req.body.similarity,
        results: req.body.results,
        movieId: 0
    }
    movieDao.findItemBasedRecommendedMovies(payload)
        .then((movies: IMovie[]) => res.status(OK).json(movies));
}