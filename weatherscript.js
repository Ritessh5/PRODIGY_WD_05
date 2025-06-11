const apiKey = '78693d6688864bccabe64245251006'; // WeatherAPI Key

let currentTempC = null;
let currentTempF = null;
let showingCelsius = true;

function initializeAutocomplete() {
  const cityInput = document.getElementById("city-input");
  const autocompleteList = document.getElementById("autocomplete-list");

  cityInput.addEventListener("input", function () {
    const input = this.value.trim();
    autocompleteList.innerHTML = '';

    if (!input) return;

    fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${input}`)
      .then(res => res.json())
      .then(results => {
        results.forEach(city => {
          const item = document.createElement("div");
          item.textContent = `${city.name}, ${city.country}`;
          item.addEventListener("click", () => {
            cityInput.value = `${city.name}, ${city.country}`;
            autocompleteList.innerHTML = '';
          });
          autocompleteList.appendChild(item);
        });
      })
      .catch(err => {
        console.error('Autocomplete error:', err);
      });
  });

  document.addEventListener("click", function (e) {
    if (e.target !== cityInput) {
      autocompleteList.innerHTML = '';
    }
  });
}

function getWeatherByCity() {
  const city = document.getElementById("city-input").value.trim();
  if (city) {
    fetchWeatherData(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
  } else {
    alert("Please enter a city name.");
  }
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetchWeatherData(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}`);
    }, () => {
      alert("Unable to retrieve your location.");
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function fetchWeatherData(url) {
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Weather data not found.");
      return response.json();
    })
    .then(data => {
      const weatherDiv = document.getElementById("weather-info");

      const iconUrl = `https:${data.current.condition.icon}`;
      currentTempC = data.current.temp_c;
      currentTempF = data.current.temp_f;
      const humidity = data.current.humidity;
      const wind = data.current.wind_kph;
      const precip = data.current.precip_mm;
      const condition = data.current.condition.text;

      const localTime = new Date(data.location.localtime);
      const formattedDay = localTime.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedTime = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      const weatherHTML = `
        <div class="weather-container">
          <div class="left">
            <img src="${iconUrl}" class="weather-icon" alt="${condition}">
            <div>
              <div class="temperature" id="temperature">${currentTempC}°<span class="unit-toggle" onclick="toggleTemperature()">C | F</span></div>
              <div class="extra-info">
                <p>Precipitation: ${precip} mm</p>
                <p>Humidity: ${humidity}%</p>
                <p>Wind: ${wind} km/h</p>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="label">Weather</div>
            <div class="time">${formattedDay}, ${formattedTime}</div>
            <div class="condition">${condition}</div>
          </div>
        </div>
      `;
      showingCelsius = true;
      weatherDiv.innerHTML = weatherHTML;
    })
    .catch(error => {
      document.getElementById("weather-info").innerHTML = `<p style="color:red;">${error.message}</p>`;
    });
}

function toggleTemperature() {
  const tempElement = document.getElementById("temperature");
  if (showingCelsius) {
    tempElement.innerHTML = `${currentTempF}°<span class="unit-toggle" onclick="toggleTemperature()">F | C</span>`;
  } else {
    tempElement.innerHTML = `${currentTempC}°<span class="unit-toggle" onclick="toggleTemperature()">C | F</span>`;
  }
  showingCelsius = !showingCelsius;
}

document.addEventListener('DOMContentLoaded', initializeAutocomplete);
