import { Router } from "express";
import {
  findRecommendedMovies,
  findItemBasedRecommendedMovies,
  findRecommendedMoviesForMovie,
} from "./Movies";
import { getAllUsers, getTopMatchingUsers } from "./Users";

// User-route
const userRouter = Router();
userRouter.get("/all", getAllUsers);
userRouter.post("/top-matching-users", getTopMatchingUsers);

// Movie-route
const movieRouter = Router();
movieRouter.post("/recommended-movies", findRecommendedMovies);
movieRouter.post("/recommended-movies-for-movie", findRecommendedMoviesForMovie);
movieRouter.post("/item-based-recommended-movies", findItemBasedRecommendedMovies);

// Export the base-router
const baseRouter = Router();
baseRouter.use("/users", userRouter);
baseRouter.use("/movies", movieRouter);

export default baseRouter;
