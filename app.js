// Spotify API credentials
const clientId = 'a112ce4f5b554d3ab88739338c6c3d3a';
const clientSecret = 'eb74260a969c412b86f7bd64e861a7b1';

// Google Books API Key
const googleBooksApiKey = 'AIzaSyDs7BDEo_7GJ-RHIyE7Xohfwt82VFZ17_o';

// Genre mappings for Spotify search
const genreMappings = {
  fiction: ["pop", "rock", "indie"], 
  fantasy: ["epic", "folk"], 
  romance: ["acoustic", "pop", "indie"], 
  mystery: ["jazz", "blues"],
  gothic: ["grunge"], 
  horror: ["metal"] 
};

// Function to get Spotify access token
async function getSpotifyAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    console.error('Failed to get Spotify access token:', response.status, response.statusText);
    return null;
  }

  const data = await response.json();
  return data.access_token;
}

// Function to fetch Spotify recommendations based on query (genre or book name)
async function getSpotifyRecommendations(query) {
  const token = await getSpotifyAccessToken();

  if (!token) {
    alert('Failed to retrieve Spotify access token. Please check your Spotify credentials.');
    return [];
  }

  const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch Spotify recommendations:', response.status, response.statusText);
    return [];
  }

  const data = await response.json();
  return data.tracks.items || [];
}

// Function to fetch book recommendations
async function getBookRecommendations(query) {
  const endpoint = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${googleBooksApiKey}`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    console.error('Failed to fetch book recommendations');
    return [];
  }

  const data = await response.json();
  return data.items || [];
}

// Function to display recommendations
async function showRecommendations(input) {
  const genre = genreMappings[input.toLowerCase()] ? input.toLowerCase() : null;

  const queryForSpotify = genre ? `genre:${genreMappings[genre].join(',')}` : input;
  const queryForBooks = genre || input;

  const [songs, books] = await Promise.all([
    getSpotifyRecommendations(queryForSpotify),
    getBookRecommendations(queryForBooks),
  ]);

  const resultsSection = document.getElementById('results-section');
  resultsSection.innerHTML = ''; // Clear previous results

  // Display song recommendations
  if (songs && songs.length > 0) {
    let songOutput = `<h2>Recommended Songs for "${input}"</h2><ul>`;
    songs.forEach((track) => {
      songOutput += `
        <li>
          <strong>${track.name}</strong> by ${track.artists[0].name}
          <iframe src="https://open.spotify.com/embed/track/${track.id}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe> 
        </li>
      `;
    });
    songOutput += '</ul>';
    resultsSection.innerHTML += songOutput;
  } else {
    resultsSection.innerHTML += `<p>No song recommendations found for "${input}".</p>`;
  }

  // Display book recommendations
  if (books && books.length > 0) {
    let bookOutput = `<h2>Recommended Books for "${input}"</h2><ul>`;
    books.forEach((book) => {
      const title = book.volumeInfo.title || 'Unknown Title';
      const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author';
      const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : '';

      bookOutput += `
        <li>
          <img src="${thumbnail}" alt="Book Cover" style="max-width: 80px; margin-right: 10px;">
          <strong>${title}</strong> by ${authors}
          <br>
          <a href="${book.volumeInfo.previewLink || '#'}" target="_blank">View on Google Books</a>
        </li>
      `;
    });
    bookOutput += '</ul>';
    resultsSection.innerHTML += bookOutput;
  } else {
    resultsSection.innerHTML += `<p>No book recommendations found for "${input}".</p>`;
  }
}

// Event listener for the "Search" button
document.getElementById('search-button').addEventListener('click', () => {
  const userInput = document.getElementById('genre-select').value.trim();

  if (!userInput) {
    alert('Please enter a book name or genre.');
    return;
  }

  showRecommendations(userInput);
});
