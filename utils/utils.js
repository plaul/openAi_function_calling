
export async function getWeatherForCity(cityName) {
    const apiKey = 'fb8f932662770c2b28caf7594f0478c3'; // Replace with your actual API key from Weatherstack
    const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${cityName}&unit=m`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        return data
        // return {
        //   temperature: data.current.temperature,
        //   description: data.current.weather_descriptions[0],
        //   wind_speed: data.current.wind_speed,
        //   humidity: data.current.humidity,
        //   is_day: data.current.is_day
        // };
      } else {
        throw new Error(`Error: ${data.error.info}`);
      }
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
      return null;
    }
  }

  //console.log(await getWeatherForCity("Copenhagen"));
