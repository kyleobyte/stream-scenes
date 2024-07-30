const minLat = 63.8;
const maxLat = 63.9;
const minLon = -22.5;
const maxLon = -22.35;
const quakesContainerId = 'quakes';
const geoapifyApiKey = 'fe520527fd824957b7ff4ca2ede7f36a'; // Your Geoapify API key

// Function to fetch earthquake data
async function fetchEarthquakeData() {
    try {
        const response = await fetch('https://vafri.is/quake/list/index.js');
        const textData = await response.text();

        // Extract the data inside the `quakes` variable
        const dataMatch = textData.match(/var quakes = (.*);/);
        if (dataMatch && dataMatch[1]) {
            const quakesData = dataMatch[1];

            // Parse the extracted data
            const parsedData = JSON.parse(quakesData);
            console.log('Parsed Data:', parsedData); // Debugging: Log the parsed data
            return Object.values(parsedData); // Convert the parsed object to an array
        } else {
            throw new Error('Failed to extract earthquake data');
        }
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        return [];
    }
}

// Function to filter earthquakes based on area settings
function filterEarthquakes(data) {
    return data.filter(quake => {
        const lat = parseFloat(quake.lat);
        const lon = parseFloat(quake.lon);
        return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
    });
}

// Function to create a map image URL with a location marker
function createMapImageUrl(lat, lon) {
    return `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:${lon},${lat}&zoom=10&marker=lonlat:${lon},${lat};color:%23ff0000;size:medium&apiKey=${geoapifyApiKey}`;
}

// Function to update the quakes container with the last quake information
function updateQuakesContainer(quake, isNew) {
    const quakesContainer = document.getElementById(quakesContainerId);
    if (!quakesContainer) return;

    const quakeTime = new Date(quake.time * 1000).toLocaleString();
    const magnitudeUnit = quake.magnitude_type === 'autmag' ? 'aM' : 'mlw';
    const quakeInfo = `
        <div class="quake-info ${isNew ? 'new-quake' : 'last-quake'}">
            <div class="quake-text">
                <h2>${isNew ? 'NEW quake' : 'Last quake'}</h2>
                <p><strong>Time:</strong> ${quakeTime}</p>
                <p><strong>Magnitude:</strong> ${quake.magnitude} ${magnitudeUnit}</p>
                <p><strong>Depth:</strong> ${quake.depth} km</p>
                <p><strong>Location:</strong> (${quake.lat}, ${quake.lon})</p>
            </div>
            <div class="quake-map">
                <img src="${createMapImageUrl(quake.lat, quake.lon)}" alt="Map showing earthquake location" />
            </div>
        </div>
    `;

    quakesContainer.innerHTML = quakeInfo;
}

// Function to check if the quake is new
function isNewQuake(quake) {
    const quakeTime = new Date(quake.time * 1000);
    const currentTime = new Date();
    const timeDiff = (currentTime - quakeTime) / 1000 / 60; // Time difference in minutes
    return timeDiff <= 1;
}

// Function to play the earthquake alert audio
function playEarthquakeAlert() {
    const audioElement = document.getElementById('quakeAlertAudio');
    if (audioElement) {
        audioElement.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    }
}

// Function to simulate a new earthquake for testing
function simulateNewEarthquake() {
    const testQuake = {
        time: Math.floor(Date.now() / 1000), // Current time in seconds
        lat: "63.85",
        lon: "-22.45",
        depth: "7.4",
        magnitude: "1.0",
        magnitude_type: "autmag"
    };
    updateQuakesContainer(testQuake, true);
    playEarthquakeAlert();
    console.log('Simulated New Earthquake:', testQuake); // Debugging: Log the simulated quake
}

// Fetch and process earthquake data on page load
window.addEventListener('load', async function () {
    const earthquakeData = await fetchEarthquakeData();
    const filteredData = filterEarthquakes(earthquakeData);
    console.log('Filtered Data:', filteredData); // Debugging: Log the filtered data
    if (filteredData.length > 0) {
        // Sort the filtered data by time in descending order
        filteredData.sort((a, b) => b.time - a.time);
        const latestQuake = filteredData[0]; // Get the latest quake
        console.log('Latest Quake:', latestQuake); // Debugging: Log the latest quake
        const isNew = isNewQuake(latestQuake);
        updateQuakesContainer(latestQuake, isNew);
        if (isNew) {
            playEarthquakeAlert();
        }
        const message = `Earthquake detected! Location: ${latestQuake.lat}, Magnitude: ${latestQuake.magnitude} ${latestQuake.magnitude_type === 'autmag' ? 'aM' : 'mlw'}`;
        announceEarthquake(message);
        showAlert(message);
    }
});

// Optionally, you can set an interval to check for new earthquakes periodically
setInterval(async function () {
    const earthquakeData = await fetchEarthquakeData();
    const filteredData = filterEarthquakes(earthquakeData);
    console.log('Filtered Data (Interval):', filteredData); // Debugging: Log the filtered data
    if (filteredData.length > 0) {
        // Sort the filtered data by time in descending order
        filteredData.sort((a, b) => b.time - a.time);
        const latestQuake = filteredData[0]; // Get the latest quake
        console.log('Latest Quake (Interval):', latestQuake); // Debugging: Log the latest quake
        const isNew = isNewQuake(latestQuake);
        updateQuakesContainer(latestQuake, isNew);
        if (isNew) {
            playEarthquakeAlert();
        }
        const message = `Earthquake detected! Location: ${latestQuake.lat}, Magnitude: ${latestQuake.magnitude} ${latestQuake.magnitude_type === 'autmag' ? 'aM' : 'mlw'}`;
        announceEarthquake(message);
        showAlert(message);
    }
}, 60000); // Check every 60 seconds
