import FileService, { Row } from "src/services/FileService";
import path from "path";
import Rating, { IRating } from "@entities/Rating";

export interface IRatingDao {
  getAll: () => Promise<IRating[]>;
}

class RatingDao implements IRatingDao {
  /**
   * Returns all ratings.
   */
  public async getAll(): Promise<IRating[]> {
    // TODO: Handle pathname internally in FileService
    const pathName = path.join(__dirname, "..", "..", "data", "movies_large", "ratings.csv");
    const ratingFileContent = await FileService.readCsvFile(pathName);

    const ratings: IRating[] = ratingFileContent.map((row: Row) => {
      const { MovieId: movieId, Rating: r, UserId: userId } = row;
      const rating = new Rating(Number(userId), Number(movieId), parseFloat(r));
      return rating;
    });
    return ratings;
  }
}

export default RatingDao;
