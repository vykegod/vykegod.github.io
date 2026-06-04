import { useEffect, useState } from 'react';
import './App.css';
import ToDoForm from './AddTask';
import ToDo from './Task';
import axios from 'axios';

const TASKS_STORAGE_KEY = 'tasks-list-project-web';
const weatherApiKey = '1bd2708c42ef49ad8d862712261605';

function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch {
      return [];
    }
  });

  const [rates, setRates] = useState({
    USD: '',
    EUR: '',
  });

  const [weatherData, setWeatherData] = useState(null);

  const [countryQuery, setCountryQuery] = useState('');
  const [countryData, setCountryData] = useState(null);
  const [countryLoading, setCountryLoading] = useState(false);
  const [countryError, setCountryError] = useState('');

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    async function fetchRates() {
      try {
        const response = await axios.get(
          'https://www.cbr-xml-daily.ru/daily_json.js'
        );

        setRates({
          USD: response.data.Valute.USD.Value.toFixed(2),
          EUR: response.data.Valute.EUR.Value.toFixed(2),
        });
      } catch (error) {
        console.error('Ошибка загрузки валют:', error);
      }
    }

    function fetchWeather() {
      if (!navigator.geolocation) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const response = await axios.get(
              'https://api.weatherapi.com/v1/current.json',
              {
                params: {
                  key: weatherApiKey,
                  q: `${lat},${lon}`,
                  lang: 'ru',
                },
              }
            );

            setWeatherData(response.data);
          } catch (error) {
            console.error('Ошибка загрузки погоды:', error);
          }
        },
        (error) => {
          console.error('Ошибка геолокации:', error);
        }
      );
    }

    fetchRates();
    fetchWeather();
  }, []);

  function addTask(userInput) {
    if (!userInput.trim()) {
      return;
    }

    const newTask = {
      id: Date.now(),
      task: userInput,
      complete: false,
    };

    setTodos([...todos, newTask]);
  }

  function removeTask(id) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  function toggleTask(id) {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, complete: !todo.complete } : todo
      )
    );
  }

  async function fetchCountry(event) {
    event.preventDefault();

    if (!countryQuery.trim()) {
      setCountryError('Введите название страны');
      setCountryData(null);
      return;
    }

    try {
      setCountryLoading(true);
      setCountryError('');
      setCountryData(null);

      const response = await axios.get(
        `https://restcountries.com/v3.1/name/${countryQuery.trim()}`
      );

      setCountryData(response.data[0]);
    } catch (error) {
      console.error('Ошибка загрузки страны:', error);
      setCountryError('Страна не найдена. Введите название на английском.');
    } finally {
      setCountryLoading(false);
    }
  }

  function getCurrencies(country) {
    if (!country.currencies) {
      return 'Не указано';
    }

    return Object.values(country.currencies)
      .map((currency) => `${currency.name} ${currency.symbol || ''}`)
      .join(', ');
  }

  function getLanguages(country) {
    if (!country.languages) {
      return 'Не указано';
    }

    return Object.values(country.languages).join(', ');
  }

  return (
    <div className="App">
      <h1 className="list-header">Список задач: {todos.length}</h1>

      <div className="api-row">
        <div className="info-block currency-block">
          <h2>Курс валют</h2>
          <p>USD: {rates.USD || 'Загрузка...'}</p>
          <p>EUR: {rates.EUR || 'Загрузка...'}</p>
        </div>

        <div className="info-block weather-block">
          <h2>Погода</h2>

          {weatherData ? (
            <>
              <p>Город: {weatherData.location.name}</p>
              <p>Температура: {weatherData.current.temp_c}°C</p>
              <p>Ветер: {weatherData.current.wind_kph} км/ч</p>
              <p>Облачность: {weatherData.current.cloud}%</p>
              <p>Погода: {weatherData.current.condition.text}</p>
            </>
          ) : (
            <p>Загрузка погоды...</p>
          )}
        </div>

        <div className="info-block country-block">
          <h2>Поиск страны</h2>

          <form className="country-form" onSubmit={fetchCountry}>
            <input
              type="text"
              value={countryQuery}
              onChange={(event) => setCountryQuery(event.target.value)}
              placeholder="Например Latvia"
            />

            <button type="submit">Найти</button>
          </form>

          {countryLoading && <p>Загрузка страны...</p>}

          {countryError && <p className="error-text">{countryError}</p>}

          {countryData && (
            <div className="country-result">
              {countryData.flags && countryData.flags.png && (
                <img
                  className="country-flag"
                  src={countryData.flags.png}
                  alt="Флаг страны"
                />
              )}

              <p>Страна: {countryData.name.common}</p>
              <p>Официальное название: {countryData.name.official}</p>
              <p>
                Столица:{' '}
                {countryData.capital && countryData.capital.length > 0
                  ? countryData.capital[0]
                  : 'Не указана'}
              </p>
              <p>Регион: {countryData.region}</p>
              <p>Субрегион: {countryData.subregion || 'Не указан'}</p>
              <p>Население: {countryData.population.toLocaleString('ru-RU')}</p>
              <p>Валюта: {getCurrencies(countryData)}</p>
              <p>Языки: {getLanguages(countryData)}</p>
            </div>
          )}
        </div>
      </div>

      <ToDoForm addTask={addTask} />

      {todos.map((todo) => (
        <ToDo
          key={todo.id}
          todo={todo}
          removeTask={removeTask}
          toggleTask={toggleTask}
        />
      ))}
    </div>
  );
}

export default App;