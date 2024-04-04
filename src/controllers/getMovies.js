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

      const targetDateTimeIST = moment(targetTime, "HH:mm").utcOffset(
        "+11:00",
        true
      ); // Parse target time and set timezone offset

      const afterThreshold = showtimesIST.some((showtime) =>
        showtime.isAfter(targetDateTimeIST.clone().add(30, "minutes"))
      );

      return (
        movie.genres.some(
          (movieGenre) => movieGenre.toLowerCase() === genre.toLowerCase()
        ) && afterThreshold
      );
    });

    // console.log("Filtered movies:", filteredMovies); // Log filtered movies

    return filteredMovies;
  } catch (error) {
    // console.error("Error fetching movies:", error);
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
    const recommendations = await filterMovies(genre, time);

    if (recommendations.length > 0) {
      const responseString = recommendations
        .map((movie) => {
          // Use moment without considering timezone offset
          const showingTime = moment(movie.showings[0], "HH:mm:ss").format(
            "h:mma"
          );
          return `${movie.name}, showing at ${showingTime}`;
        })
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
