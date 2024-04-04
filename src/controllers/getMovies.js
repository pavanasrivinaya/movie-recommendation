import axios from "axios";
import moment from "moment-timezone";

// Importing Moment Timezone for handling timezones
// Moment Timezone is used to parse and manipulate dates with timezone information

// URL for fetching movie showings data
const movieShowingsUrl = "https://pastebin.com/raw/cVyp3McN";

// Function to filter movies based on genre and target time
const filterMovies = async (genre, targetTime) => {
  try {
    // Fetch movie showings data from the provided URL
    const response = await axios.get(movieShowingsUrl);
    const movies = response.data;

    // Filter movies based on genre and target time
    const filteredMovies = movies.filter((movie) => {
      // Convert movie showtimes to IST timezone
      const showtimesIST = movie.showings.map((time) => {
        // Parse time and set timezone offset
        const parsedTime = moment(time, "HH:mm:ssZ").utcOffset("+11:00", true);

        // Skip invalid times
        if (!parsedTime.isValid()) {
          console.error(`Invalid showtime format: ${time}`);
          return null;
        }

        return parsedTime;
      });

      // Parse target time and set timezone offset
      const targetDateTimeIST = moment(targetTime, "HH:mm").utcOffset(
        "+11:00",
        true
      );

      // Check if any showtime is after the target time with a 30-minute threshold
      const afterThreshold = showtimesIST.some((showtime) =>
        showtime.isAfter(targetDateTimeIST.clone().add(30, "minutes"))
      );

      // Filter movies based on genre and showtime
      return (
        movie.genres.some(
          (movieGenre) => movieGenre.toLowerCase() === genre.toLowerCase()
        ) && afterThreshold
      );
    });

    // Return the filtered movies
    return filteredMovies;
  } catch (error) {
    // Handle errors while fetching movie data
    throw new Error("Error fetching movie recommendations");
  }
};

// Controller function to handle movie recommendation requests
const recommendationsController = async (req, res) => {
  // Extract genre and time from request parameters
  const genre = req.query.genre;
  const time = req.query.time;

  // Check if required parameters are missing
  if (!genre || !time) {
    return res.status(400).send("Missing required parameters: genre and time");
  }

  try {
    // Fetch and filter movie recommendations
    const recommendations = await filterMovies(genre, time);

    if (recommendations.length > 0) {
      // Sort recommendations by rating in descending order
      recommendations.sort((a, b) => b.rating - a.rating);

      // Generate response string with movie recommendations
      const responseString = recommendations
        .map((movie) => {
          // Use moment without considering timezone offset to format showing time
          const showingTime = moment(movie.showings[0], "HH:mm:ss").format(
            "h:mma"
          );
          return `${movie.name}, showing at ${showingTime}`;
        })
        .join("\n");

      // Send movie recommendations as response
      res.send(responseString);
    } else {
      // Send message when no movie recommendations are found
      res.send("No movie recommendations");
    }
  } catch (error) {
    // Handle internal server errors
    console.error("Error processing request:", error);
    res.status(500).send("Internal server error");
  }
};

// Export the recommendationsController function as default
export default recommendationsController;
