/* scripting file for the movie recommendations*/
const form = document.getElementById("movieForm");
const recommendationsDiv = document.getElementById("recommendations");

// Initially hide the recommendations div
recommendationsDiv.style.display = "none";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const genre = form.genre.value.trim();
  const time = form.time.value.trim();

  try {
    const response = await fetch(
      `/recommendations?genre=${genre}&time=${time}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();

    // Clear previous recommendations
    recommendationsDiv.innerHTML = "";

    // Check if there are recommendations
    if (data.trim() === "No movie recommendations") {
      recommendationsDiv.textContent = data;
    } else {
      // Create a bulleted list
      const ul = document.createElement("ul");
      // Split recommendations by line breaks and create list items
      data.split("\n").forEach((recommendation) => {
        const li = document.createElement("li");
        li.textContent = recommendation;
        ul.appendChild(li);
      });
      // Append the list to the recommendations div
      recommendationsDiv.appendChild(ul);

      // Show the recommendations div
      recommendationsDiv.style.display = "block";
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    recommendationsDiv.textContent =
      "An error occurred while fetching recommendations.";
  }
});
