import { useState, useEffect } from 'react';
import './App.css';
import ToDoForm from './AddTask';
import ToDo from './Task';
import axios from 'axios';

const TASKS_STORAGE_KEY = 'tasks-list-project-web';
const weatherApiKey = 'c7616da4b68205c2f3ae73df2c31d177';

function App() {
  const [todos, setTodos] = useState(() => {
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [rates, setRates] = useState({});
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Валюта
        const currency = await axios.get(
          'https://www.cbr-xml-daily.ru/daily_json.js'
        );

        const USD = currency.data.Valute.USD.Value.toFixed(2);
        const EUR = currency.data.Valute.EUR.Value.toFixed(2);

        setRates({ USD, EUR });

        // Погода
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const weather = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`
            );

            setWeatherData(weather.data);
          },
          (error) => {
            console.error('Ошибка геолокации:', error);
            alert('Разреши доступ к геолокации');
          }
        );
      } catch (error) {
        console.error('Ошибка загрузки данных', error);
      }
    }

    fetchData();
  }, []);

  const addTask = (userInput) => {
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      task: userInput,
      complete: false,
    };

    setTodos([...todos, newItem]);
  };

  const removeTask = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleTask = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, complete: !todo.complete }
          : todo
      )
    );
  };

  return (
    <div className="App">
      <h1 className="list-header">Список задач: {todos.length}</h1>

      <div>
        <p>USD: {rates.USD}</p>
        <p>EUR: {rates.EUR}</p>
      </div>

      {weatherData ? (
        <div>
          <p>
            Температура: {(weatherData.main.temp - 273.15).toFixed(1)}°C
          </p>
          <p>Ветер: {weatherData.wind.speed} м/с</p>
          <p>Облачность: {weatherData.clouds.all}%</p>
        </div>
      ) : (
        <p>Загрузка погоды...</p>
      )}

      <ToDoForm addTask={addTask} />

      {todos.map((todo) => (
        <ToDo
          todo={todo}
          key={todo.id}
          removeTask={removeTask}
          toggleTask={toggleTask}
        />
      ))}
    </div>
  );
}

export default App;