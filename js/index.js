///DOM variables
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const favoriteCities = document.getElementById("favoriteCities");
const inputMobile = document.querySelector("#inputMobile")
const inputCity = document.getElementById("inputCity")
const errorCity = document.getElementById("error")
const windSpeed = document.querySelector(".windSpeed")
const feelsLike = document.querySelector(".feelsLike")
const chanceRain = document.querySelector(".chanceRain")
const uvIndex = document.querySelector(".uvIndex")
const chanceRainHero = document.querySelector(".chanceRainHero")
const hourlyContainer = document.getElementById('hourlyForecast');
const dailyContainer = document.getElementById("dailyForecast");
let isAvailable = true;
let weatherData = null;
let arrCities = [];
let counter = 0;
const menuBtn = document.getElementById("menu-btn")
const mobileMenu = document.getElementById("mobile-menu")
///Icon which activates event
const searchMobile = document.getElementById("searchMobile")
const search = document.getElementById("search");
const starIcon = document.getElementById("starIcon");
const main = document.getElementById("main")

/*async function handleWeatherSearch(cityVal, inputEl) {
    if (!cityVal) return
    try {
        errorCity.textContent = ""
        errorCity.className = "hidden"
        await getWeather(cityVal);
        cityName.textContent = weatherData.city
        temperature.textContent = Math.round(weatherData.current.temperature)
        inputEl.value = "";

        // Success layout states
        if (!mobileMenu.classList.contains("hidden")) {
            main.className = "flex-1 flex overflow-hidden max-[550px]:mt-14"
            if (errorCity.textContent !== "") {
                main.classList.remove("max-[550px]:mt-14")
            }
        } else {
            main.className = "flex-1 flex overflow-hidden max-[550px]:mt-6"
        }
    }
    catch (error) {
        errorCity.textContent = "City not found"

        // 🔧 FIX: Check if the menu is open when the error drops
        if (!mobileMenu.classList.contains("hidden")) {
            // Menu is open: push it down past the absolute menu
            errorCity.className = "text-red-500 font-semibold px-8 max-[550px]:mt-18 mt-2"
        } else {
            // Menu is closed: normal spacing under the standard header
            errorCity.className = "text-red-500 font-semibold px-8 max-[550px]:mt-2 mt-2"
        }
    }
}
*/
async function handleWeatherSearch(cityVal, inputEl) {
    if (!cityVal) return;

    try {
        errorCity.textContent = "";
        errorCity.className = "hidden";

        await getWeather(cityVal);
        updateUI()
        inputEl.value = "";

        if (!mobileMenu.classList.contains("hidden")) {
            main.className = "flex-1 flex overflow-hidden max-[550px]:mt-14";
        } else {
            main.className = "flex-1 flex overflow-hidden max-[550px]:mt-6";
        }

    } catch (error) {
        errorCity.textContent = "City not found";

        if (!mobileMenu.classList.contains("hidden")) {
            //err
            errorCity.className =
                "text-red-500 font-semibold px-8 max-[550px]:mt-18 mt-2";

            //main.className = "flex-1 flex overflow-hidden";
            main.classList.remove("max-[550px]:mt-14")
        } else {
            errorCity.className =
                "text-red-500 font-semibold px-8 max-[550px]:mt-2 mt-2";
            main.classList.add("max-[550px]:mt-6")
            //main.className =
            //  "flex-1 flex overflow-hidden max-[550px]:mt-6";
        }
    }
}
search.addEventListener("click", () => handleWeatherSearch(inputCity.value, inputCity))
searchMobile.addEventListener("click", () => handleWeatherSearch(inputMobile.value, inputMobile))
starIcon.addEventListener("click", function () {
    renderFavorite()
});
document.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        const cityVal = inputCity.value.trim() || inputMobile.value.trim();
        const activeInput = inputCity.value.trim() ? inputCity : inputMobile;

        if (cityVal) {
            await handleWeatherSearch(cityVal, activeInput);
        }
    }
});
menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");

    const isMenuOpen = !mobileMenu.classList.contains("hidden");
    const hasError = errorCity.textContent !== "";

    if (isMenuOpen) {
        menuBtn.textContent = "X";

        if (hasError) {
            main.className = "flex-1 flex overflow-hidden";
            errorCity.className =
                "text-red-500 font-semibold px-8 max-[550px]:mt-18 mt-2";
        } else {
            main.className =
                "flex-1 flex overflow-hidden max-[550px]:mt-14";
        }

    } else {
        menuBtn.textContent = "☰";

        main.className =
            "flex-1 flex overflow-hidden max-[550px]:mt-6";

        if (hasError) {
            errorCity.className =
                "text-red-500 font-semibold px-8 max-[550px]:mt-2 mt-2";
        }
    }
});
favoriteCities.addEventListener("click", async (e) => {
    // Check if the clicked element (or its child like span) is inside an <a> tag
    const link = e.target.closest("a");

    if (link) {
        e.preventDefault(); // Stop page from refreshing/navigating

        // Extract city name (assuming attribute or data tag)
        const selectedCity = link.dataset.cityName;

        if (selectedCity) {
            try {
                await getWeather(selectedCity);
                updateUI();
            } catch (error) {
                console.error("Failed to load favorite city weather:", error);
            }
        }
    }
});
async function getWeather(cityName) {
    const location = await getCoordinates(cityName);
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=uv_index_max,temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_mean`
    );
    const data = await response.json();
    weatherData = {
        city: location.name,

        current: {
            temperature: data.current.temperature_2m,
            windSpeed: data.current.wind_speed_10m,
            apparentTemperature: data.current.apparent_temperature,
            weatherCode: data.current.weather_code,
            uvIndex: data.daily.uv_index_max[0]
        },
        hourly: {
            time: data.hourly.time,
            temperature: data.hourly.temperature_2m,
            precipitationProbability: data.hourly.precipitation_probability,
            weatherCode: data.hourly.weather_code,
        },
        daily: {
            date: data.daily.time,
            maxTemperature: data.daily.temperature_2m_max,
            minTemperature: data.daily.temperature_2m_min,
            weatherCode: data.daily.weather_code,
            uvIndex: data.daily.uv_index_max,
            precipitationProbability: data.daily.precipitation_probability_mean
        }
    };
    localStorage.setItem("lastCity", location.name);
    localStorage.setItem("cachedWeatherData", JSON.stringify(weatherData));
}
const getWeatherIcon = (code, isDay = true) => {
    // Weather-Icons mapping matching Open-Meteo weather codes with responsive font and color classes
    const icons = {
        // Clear Sky: Sun vs Moon
        0: isDay
            ? `<i class="wi wi-day-sunny text-5xl sm:text-6xl 2xl:text-5xl text-amber-400 block! my-3 mx-auto"></i>`
            : `<i class="wi wi-night-clear text-5xl sm:text-6xl 2xl:text-5xl text-amber-200 block! my-3 mx-auto"></i>`,

        // Mainly Clear: Day Cloud vs Night Cloud
        1: isDay
            ? `<i class="wi wi-day-cloudy text-5xl sm:text-6xl 2xl:text-5xl text-sky-300 block! my-3 mx-auto"></i>`
            : `<i class="wi wi-night-alt-cloudy text-5xl sm:text-6xl 2xl:text-5xl text-sky-200 block! my-3 mx-auto"></i>`,

        // Neutral conditions (same day or night)
        2: `<i class="wi wi-cloud text-5xl sm:text-6xl 2xl:text-5xl text-slate-300 block! my-3 mx-auto"></i>`,
        3: `<i class="wi wi-cloudy text-5xl sm:text-6xl 2xl:text-5xl text-slate-400 block! my-3 mx-auto"></i>`,
        45: `<i class="wi wi-fog text-5xl sm:text-6xl 2xl:text-5xl text-zinc-400 block! my-3 mx-auto"></i>`,
        51: `<i class="wi wi-sprinkle text-5xl sm:text-6xl 2xl:text-5xl text-blue-300 block! my-3 mx-auto"></i>`,
        61: `<i class="wi wi-rain text-5xl sm:text-6xl 2xl:text-5xl text-blue-400 block! my-3 mx-auto"></i>`,
        71: `<i class="wi wi-snow text-5xl sm:text-6xl 2xl:text-5xl text-indigo-200 block! my-3 mx-auto"></i>`,
        95: `<i class="wi wi-thunderstorm text-5xl sm:text-6xl 2xl:text-5xl text-amber-500 block! my-3 mx-auto"></i>`
    };

    // Fallback mapping for grouped weather codes
    if ([48].includes(code)) return icons[45];
    if ([53, 55, 63, 65, 80, 81, 82].includes(code)) return icons[61];
    if ([73, 75, 77, 85, 86].includes(code)) return icons[71];
    if ([96, 99].includes(code)) return icons[95];

    return icons[code] || icons[0];
};
async function getCoordinates(cityName) {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`)
    const data = await response.json()
    // console.log(data);
    if (!data.results) {
        throw new Error("City not found");
    }

    return {
        name: data.results[0].name,
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude
    };
}
// Load a default city on page load
async function initApp() {
    const cachedCity = localStorage.getItem("lastCity") || "Madrid";
    const cachedData = localStorage.getItem("cachedWeatherData");
    try {
        await getWeather(cachedCity); // Or any default city you like
        updateUI()
    } catch (error) {
        console.error("Failed to load initial weather:", error);
    } finally {
        document.body.classList.add("app-loaded");
    }
}
initApp();
const updateUI = () => {
    if (!weatherData) return
    renderCurrentWeather();
    renderAirConditions()
    renderHourlyWeather();
    renderDailyForecast()
}
const renderFavorite = () => {
    if (!isAvailable) return
    const favoriteCityName = cityName.textContent
    const favoriteCurrentTemp = temperature.textContent
    if (arrCities.includes(favoriteCityName)) {
        return
    }
    const link = document.createElement("a");
    link.href = "#";
    link.dataset.cityName = favoriteCityName;
    link.className = "inline-block hover:bg-white/10 rounded-lg transition-colors cursor-pointer";
    link.innerHTML = `<span>${favoriteCityName}</span><span>${favoriteCurrentTemp}°</span>`;
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        favoriteCities.insertBefore(link, resetBtn);
    } else {
        favoriteCities.appendChild(link);
    }
    const LIMIT = 2;
    if (counter >= LIMIT) {
        // Check if the button already exists to avoid duplicates
        if (!document.getElementById("resetBtn")) {
            const parent = document.createElement("div")
            const resetBtn = document.createElement("button");
            resetBtn.id = "resetBtn";
            resetBtn.textContent = "Reset Favorites";

            // Adding professional Tailwind classes
            resetBtn.className = "mt-4 w-full  text-sm text-red-400 border border-red-400/50 py-2 rounded-xl hover:bg-red-400 hover:text-white transition-all cursor-pointer";

            resetBtn.onclick = function () {
                favoriteCities.innerHTML = ""; // Clear the list
                counter = 0; // Reset counter
                arrCities = []; // Clear array
                this.remove(); // Remove the button itself
                isAvailable = true
            };

            favoriteCities.appendChild(resetBtn);
        }
        isAvailable = false
    }
    arrCities.push(favoriteCityName)
    counter++;
}
const renderCurrentWeather = () => {
    cityName.textContent = weatherData.city;
    chanceRainHero.textContent = `Chance of rain ${weatherData.daily.precipitationProbability[0]}%`
    temperature.textContent = Math.round(weatherData.current.temperature);
}
const renderAirConditions = () => {
    feelsLike.textContent = `${weatherData.current.apparentTemperature}°`
    windSpeed.textContent = `${weatherData.current.windSpeed} km/h`
    uvIndex.textContent = `${weatherData.current.uvIndex}`
    let currentHours = new Date().getHours();
    chanceRain.textContent =
        `${weatherData.daily.precipitationProbability[0]}%`;
    console.log(`${weatherData.daily.precipitationProbability[0]}%`);
}
const renderHourlyWeather = () => {
    if (!hourlyContainer || !weatherData) return;

    const now = new Date();
    now.setMinutes(0, 0, 0);

    const startIndex = weatherData.hourly.time.findIndex(
        (time) => new Date(time).getTime() >= now.getTime()
    );
    const validStartIndex = startIndex !== -1 ? startIndex : 0;

    let html = "";
    const hoursToDisplay = 6;
    for (let i = validStartIndex; i < validStartIndex + hoursToDisplay; i++) {
        if (!weatherData.hourly.time[i]) break;

        const dateObj = new Date(weatherData.hourly.time[i]);
        const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Check hour: 6:00 to 19:59 considered Day
        const hour = dateObj.getHours();
        const isDay = hour >= 6 && hour < 20;

        const temp = Math.round(weatherData.hourly.temperature[i]);
        const weatherCode = weatherData.hourly.weatherCode[i];

        // Pass isDay as the 2nd argument!
        const iconHtml = getWeatherIcon(weatherCode, isDay);

        const borderClass = i === (validStartIndex + hoursToDisplay - 1) ? '' : 'border-r-2 border-white/40';

        html += `<li class="text-center shrink-0 px-4 sm:px-0 sm:pr-8 ${borderClass}">
                <span class="inline-block text-[1.05rem]">${formattedTime}</span>
                ${iconHtml}
                <span class="block text-sm text-white/70 mt-6">${temp}°</span>
             </li>`;
    }
    hourlyContainer.innerHTML = html;
};
const renderDailyForecast = () => {
    if (!dailyContainer || !weatherData || !weatherData.daily.date) return;
    let html = "";
    const daysToDisplay = Math.min(7, weatherData.daily.date.length);
    for (let i = 0; i < daysToDisplay; i++) {
        const dateObj = new Date(weatherData.daily.date[i])
        let dayName = "Today"
        if (i != 0) {
            dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
        }
        const maxTemp = Math.round(weatherData.daily.maxTemperature[i])
        const minTemp = Math.round(weatherData.daily.minTemperature[i])
        const weatherCode = weatherData.daily.weatherCode[i]
        const iconHtml = getWeatherIcon(weatherCode)
        const borderClass = i === 0 ? "" : "border-t-2 border-[#ffffff75]"
        html += `<li class="py-3 px-2 flex items-center justify-between ${borderClass}">
                        <span class="text-[#f2f2f29f]">${dayName}</span>
                        ${iconHtml}
                        <span class="text-lg sm:text-2xl">${maxTemp}°<span
                                class="text-white/50 text-sm sm:text-base">${minTemp}°</span></span>
                    </li>`
        console.log(maxTemp);
        console.log(weatherCode);
        console.log(weatherData);
        console.log(iconHtml);
    }
    dailyContainer.innerHTML = html
}