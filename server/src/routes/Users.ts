import StatusCodes from 'http-status-codes';
import { Request, Response } from 'express';

import UserDao, { MatchingPayload } from '@daos/User/UserDao';
import { paramMissingError } from '@shared/constants';
import { IUser } from '@entities/User';
import { SIMILARITY_IDS, SIMILARITY_KEYS } from 'src/const';
import RatingDao from '@daos/Rating/RatingDao';

const ratingDao = new RatingDao();
const userDao = new UserDao(ratingDao);
const { BAD_REQUEST, CREATED, OK } = StatusCodes;



/**
 * Get all users.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export function getAllUsers(req: Request, res: Response): void {
    userDao.getAll()
        .then((users: IUser[]) => res.status(OK).json(users));
}

/**
 * Get top matching users.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export function getTopMatchingUsers(req: Request, res: Response): void {
    // Process incoming data
    const { similarity, results, userId } = req.body;
    const payload: MatchingPayload = {
        similarity,
        results,
        userId,
    };

    // Return bad param error if similarity id is not supported
    if (!Object.prototype.hasOwnProperty.call(SIMILARITY_KEYS, similarity)) {
        res.status(BAD_REQUEST).send(`The similarity of type ${similarity} is not supported.`);
    }

    userDao.getTopMatchingUsers(payload)
        .then((users: IUser[]) => res.status(OK).json(users));
}

