import axios from "axios";
import moment from "moment-timezone";

const movieShowingsUrl = "https://pastebin.com/raw/cVyp3McN";

const filterMovies = async (genre, targetTime) => {
  try {
    const response = await axios.get(movieShowingsUrl);
    const movies = response.data;

    const filteredMovies = movies.filter((movie) => {
      const showtimesIST = movie.showings.map((time) => {
        const parsedTime = moment(time, "HH:mm:ssZ").utcOffset("+11:00", true); // Parse time and set timezone offset

        if (!parsedTime.isValid()) {
          console.error(`Invalid showtime format: ${time}`);
          return null; // Skip invalid time
        }

        return parsedTime;
      });

      const targetDateTimeIST = moment(targetTime).utcOffset("+11:00", true); // Parse target time and set timezone offset

      const afterThreshold = showtimesIST.some((showtime) =>
        showtime.isAfter(targetDateTimeIST.clone().add(30, "minutes"))
      );

      return (
        movie.genres.some(
          (movieGenre) => movieGenre.toLowerCase() === genre.toLowerCase()
        ) && afterThreshold
      );
    });

    return filteredMovies;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Error fetching movie recommendations");
  }
};

const recommendationsController = async (req, res) => {
  const genre = req.query.genre;
  const time = req.query.time;

  if (!genre || !time) {
    return res.status(400).send("Missing required parameters: genre and time");
  }

  try {
    // Convert time parameter to ISO 8601 format
    const isoTime = moment(time, "HH:mm").toISOString();

    const recommendations = await filterMovies(genre, isoTime);

    if (recommendations.length > 0) {
      // Construct the response string with movie names and showtimes
      const responseString = recommendations
        .map(
          (movie) =>
            `${movie.name}, showing at ${moment(movie.showings[0], "HH:mm:ssZ")
              .utcOffset("+11:00", true)
              .format("h:mma")}`
        )
        .join("\n");
      res.send(responseString);
    } else {
      res.send("No movie recommendations");
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Internal server error");
  }
};

export default recommendationsController;
