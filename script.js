// Константы
const apiKey = '25324c8224a28a2b23fdb35ce923947e';
// const apiKey = 'a32183a7174bdb59dc61d9ab8a7874b8';
const baseUrl = 'https://api.openweathermap.org/data/2.5';
const iconUrl = 'https://openweathermap.org/img/wn/';

// DOM элементы
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const dateTime = document.getElementById('date-time');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast-container');

// Обработчики событий
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getCurrentWeather(city);
        getForecast(city);
    }
});

cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getCurrentWeather(city);
            getForecast(city);
        }
    }
});

// Функция для получения текущей погоды
async function getCurrentWeather(city) {
    try {
        const response = await fetch(`${baseUrl}/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`);
        
        if (!response.ok) {
            if (response.status === 404) {
                alert('Город не найден. Проверьте название города.');
            } else {
                alert('Произошла ошибка при получении данных о погоде.');
            }
            return;
        }
        
        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при получении данных о погоде.');
    }
}

// Функция для получения прогноза на 5 дней
async function getForecast(city) {
    try {
        const response = await fetch(`${baseUrl}/forecast?q=${city}&appid=${apiKey}&units=metric&lang=ru`);
        
        if (!response.ok) {
            return;
        }
        
        const data = await response.json();
        updateForecastUI(data);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Функция для обновления UI текущей погоды
function updateWeatherUI(data) {
    // Обновляем название города
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    
    // Обновляем дату и время
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateTime.textContent = new Date().toLocaleDateString('ru-RU', dateOptions);
    
    // Обновляем иконку погоды
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `${iconUrl}${iconCode}@2x.png`;
    
    // Обновляем температуру
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    
    // Обновляем описание погоды
    weatherDescription.textContent = data.weather[0].description;
    
    // Обновляем ощущаемую температуру
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    
    // Обновляем влажность
    humidity.textContent = `${data.main.humidity}%`;
    
    // Обновляем скорость ветра
    windSpeed.textContent = `${data.wind.speed} м/с`;
    
    // Обновляем давление (переводим из гПа в мм рт. ст.)
    const pressureInMmHg = Math.round(data.main.pressure * 0.750062);
    pressure.textContent = `${pressureInMmHg} мм`;
}

// Функция для обновления UI прогноза погоды
function updateForecastUI(data) {
    forecastContainer.innerHTML = '';
    
    // Получаем прогноз на каждый день
    // OpenWeatherMap предоставляет прогноз с интервалом 3 часа
    // Мы будем фильтровать данные на 12:00 каждого дня
    
    const dailyForecasts = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toISOString().split('T')[0];
        const hour = date.getHours();
        
        // Если это полдень или мы еще не записали данные на этот день
        if (hour === 12 || !dailyForecasts[day]) {
            dailyForecasts[day] = item;
        }
    });
    
    // Создаем элементы для каждого дня (максимум 5 дней)
    Object.values(dailyForecasts).slice(0, 5).forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = getDayName(date);
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        forecastItem.innerHTML = `
            <h3>${dayName}</h3>
            <img src="${iconUrl}${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
            <p>${Math.round(forecast.main.temp)}°C</p>
            <span>${forecast.weather[0].description}</span>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Функция для получения названия дня недели
function getDayName(date) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[date.getDay()];
}

// Загружаем погоду для Москвы по умолчанию при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    getCurrentWeather('Москва');
    getForecast('Москва');
}); 