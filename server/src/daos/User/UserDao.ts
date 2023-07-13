import User, { IUser } from "@entities/User";
import FileService, { Row } from "src/services/FileService";
import path from "path";
import { SIMILARITY_KEYS } from "src/const";
import { IRatingDao } from "@daos/Rating/RatingDao";
import Rating from "@entities/Rating";

export interface IUserDao {
  getAll: () => Promise<IUser[]>;
  getUserWithRatings: (userId: number) => Promise<IUser | null>;
  getUsersWithRatings: () => Promise<IUser[]>;
  getTopMatchingUsers: (payload: MatchingPayload) => Promise<IUser[]>;
  computeSimilarUsers: (userId: number, similarity: string) => Promise<IUser[]>;
}

export interface MatchingPayload {
  similarity: string;
  results: number;
  userId: number;
}

class UserDao implements IUserDao {
  private ratingDao: IRatingDao;
  ratingsMap: Map<number, Rating[]>;

  constructor(ratingDao: IRatingDao) {
    this.ratingDao = ratingDao;
    this.ratingsMap = new Map<number, Rating[]>();
  }

  public async getUsersWithRatings(): Promise<IUser[]> {
    // Get all ratings
    const allRatings = await this.ratingDao.getAll();
    this.ratingsMap = new Map<number, Rating[]>();

    // Populate map which stores ratings for each user
    for (const rating of allRatings) {
      if (this.ratingsMap.has(rating.userId)) {
        const ratings = this.ratingsMap.get(rating.userId);
        ratings?.push(rating);
      } else {
        const ratings: Rating[] = [rating];
        this.ratingsMap.set(rating.userId, ratings);
      }
    }

    // Iterate over users and set ratings to each user
    const users = await this.getAll();
    const usersWithRatings = users.map((user: IUser) => {
      const ratings: Rating[] = this.ratingsMap.get(user.id) || [];
      const userWithRating = new User(user.name, user.id, 0, ratings);
      return userWithRating;
    });

    return usersWithRatings;
  }

  /**
   * Returns all users.
   */
  public async getAll(): Promise<IUser[]> {
    const pathName = path.join(__dirname, "..", "..", "data", "movies_large", "users.csv");
    const userFileContent = await FileService.readCsvFile(pathName);

    const users: IUser[] = userFileContent.map((row: Row) => {
      const { Name: name, UserId: userId } = row;
      const user: IUser = new User(name, Number(userId));
      return user;
    });
    return users;
  }

  /**
   * Returns a given user.
   */
  public async getUserWithRatings(userId: number): Promise<IUser | null> {
    const usersWithRatings = await this.getUsersWithRatings();
    const user = usersWithRatings.find((u) => u.id === userId);
    if (user) {
      return user;
    }
    return null;
  }

  /**
   * Returns top matching users.
   */
  public async getTopMatchingUsers(payload: MatchingPayload): Promise<IUser[]> {
    // Compute similar users
    const similarUsers = await this.computeSimilarUsers(payload.userId, payload.similarity);

    // Return the top results
    return similarUsers
      .filter((user) => user.id !== payload.userId)
      .sort((a, b) => {
        if (!a.score || !b.score) {
          return 0;
        }
        return b.score - a.score;
      })
      .slice(0, payload.results);
  }

  public async computeSimilarUsers(userId: number, similarity: string): Promise<IUser[]> {
    let similarUsers: IUser[] = [];

    if (similarity === SIMILARITY_KEYS.EUCLIDEAN) {
      // TODO: Abstract away these two, and select euclidean() or pearson() further down instead
      similarUsers = await this.computeSimilarUsersByEuclidean(userId);
    } else if (similarity === SIMILARITY_KEYS.PEARSON) {
      similarUsers = await this.computeSimilarUsersByPearson(userId);
    }

    return similarUsers;
  }

  async computeSimilarUsersByEuclidean(userId: number): Promise<IUser[]> {
    const usersWithRatings = await this.getUsersWithRatings();

    const userRatings = this.ratingsMap.get(userId);
    if (!userRatings) throw new Error("User has no ratings.");

    // Compute similarity
    for (const user of usersWithRatings) {
      user.score = this.euclidean(user, userRatings);
    }

    return usersWithRatings;
  }

  async computeSimilarUsersByPearson(userId: number): Promise<IUser[]> {
    const usersWithRatings = await this.getUsersWithRatings();

    const userRatings = this.ratingsMap.get(userId);
    if (!userRatings) throw new Error("User has no ratings.");

    // Compute similarity
    for (const user of usersWithRatings) {
      user.score = this.pearson(user, userRatings);
    }

    return usersWithRatings;
  }

  euclidean(user: IUser, userRatings: Rating[]): number {
    let similarityScore = 0;
    let numberOfRatings = 0;
    for (const ratingA of userRatings) {
      for (const ratingB of user.ratings) {
        if (ratingA.hasSameUser(ratingB)) continue;

        if (ratingA.hasSameMovie(ratingB)) {
          // add sim score
          similarityScore += (ratingA.score - ratingB.score) ** 2;
          numberOfRatings++;
        }
      }
    }
    // No ratings in common
    if (!numberOfRatings) return 0;

    const inverted = 1 / (1 + similarityScore);
    return inverted;
  }

  pearson(user: IUser, userRatings: Rating[]): number {
    let sum1 = 0,
      sum2 = 0,
      sum1sq = 0,
      sum2sq = 0,
      pSum = 0,
      n = 0;

    // Iterate over all rating combinations
    for (const ratingA of userRatings) {
      for (const ratingB of user.ratings) {
        if (ratingA.hasSameUser(ratingB)) continue;

        if (ratingA.hasSameMovie(ratingB)) {
          sum1 += ratingA.score; // Sum of ratings for userA
          sum2 += ratingB.score; // Sum of ratings for userB
          sum1sq += ratingA.score ** 2; // Sum of squared ratings for A
          sum2sq += ratingB.score ** 2; // Sum of squared ratings for B
          pSum += ratingA.score * ratingB.score;
          n++; // Increment number of ratings in common
        }
      }
    }

    if (!n) return 0;

    const numerator = pSum - (sum1 * sum2) / n;
    const denominator = Math.sqrt((sum1sq - sum1 ** 2 / n) * (sum2sq - sum2 ** 2 / n));
    return numerator / denominator;
  }
}

export default UserDao;
