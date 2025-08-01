import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Search, Thermometer, Droplets, Wind, Eye, Gauge } from "lucide-react";
import { toast } from "sonner";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  sys: {
    country: string;
  };
}

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [backgroundClass, setBackgroundClass] = useState("bg-cloudy-sky bg-cover bg-center");

  const API_KEY = "895284fb2d2c50a520ea537456963d9c"; // OpenWeatherMap demo key

  const getTemperatureBackground = (temp: number) => {
    if (temp <= 0) return "bg-weather-freezing";
    if (temp <= 10) return "bg-weather-cold";
    if (temp <= 20) return "bg-weather-cool";
    if (temp <= 25) return "bg-weather-default";
    if (temp <= 30) return "bg-weather-mild";
    if (temp <= 35) return "bg-weather-warm";
    if (temp <= 40) return "bg-weather-hot";
    return "bg-weather-extreme";
  };

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error("City not found");
      }
      
      const data = await response.json();
      setWeatherData(data);
      setBackgroundClass(getTemperatureBackground(data.main.temp));
      toast.success(`Weather data loaded for ${data.name}`);
    } catch (error) {
      toast.error("Failed to fetch weather data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    setLoading(true);
    toast.info("Getting your location...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          toast.info("Fetching weather for your location...");
          
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          
          if (!response.ok) {
            throw new Error("Failed to fetch location weather");
          }
          
          const data = await response.json();
          setWeatherData(data);
          setBackgroundClass(getTemperatureBackground(data.main.temp));
          setCity(data.name);
          toast.success(`Weather loaded for your location: ${data.name}`);
        } catch (error) {
          toast.error("Failed to fetch weather for your location");
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied. Please enable location permissions and try again.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable. Please try searching for your city manually.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out. Please try again.");
            break;
          default:
            toast.error("An unknown error occurred while getting your location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city.trim());
    }
  };

  // Remove auto-loading to show cloudy background initially
  // useEffect(() => {
  //   fetchWeather("Delhi");
  // }, []);

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ease-in-out ${backgroundClass} flex flex-col`}>
      {/* Header */}
      <div className="p-6 text-center">
        <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          SkyVue
        </h1>
        <p className="text-xl text-white/90 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          Advanced weather intelligence platform
        </p>
      </div>

      {/* Search Section */}
      <div className="px-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-3 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-white/70 text-lg font-medium focus:bg-white/30 transition-all duration-300"
          />
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30 text-white font-semibold px-6 transition-all duration-300 hover:scale-105"
          >
            <Search className="h-5 w-5" />
          </Button>
        </form>
        
        <Button
          onClick={getCurrentLocation}
          disabled={loading}
          variant="outline"
          className="mt-4 mx-auto flex items-center justify-center bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 font-medium transition-all duration-300 hover:scale-105"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Use Current Location
        </Button>
      </div>

      {/* Weather Display */}
      {weatherData && (
        <div className="flex-1 px-6 pb-6">
          <Card className="max-w-lg mx-auto bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl">
            <div className="p-8 text-center">
              {/* Location */}
              <h2 className="text-3xl font-display font-bold mb-2 drop-shadow-lg">
                {weatherData.name}
              </h2>
              <p className="text-lg font-medium text-white/80 mb-1 capitalize drop-shadow-md">
                {weatherData.weather[0].description}
              </p>
              <p className="text-sm text-white/70 mb-6 font-medium">
                {weatherData.sys.country}
              </p>

              {/* Weather Icon and Temperature */}
              <div className="flex items-center justify-center mb-8">
                <img
                  src={getWeatherIcon(weatherData.weather[0].icon)}
                  alt={weatherData.weather[0].description}
                  className="w-24 h-24 animate-float drop-shadow-lg"
                />
                <div className="text-right ml-4">
                  <div className="text-6xl font-display font-bold drop-shadow-lg">
                    {Math.round(weatherData.main.temp)}°
                  </div>
                  <div className="text-lg text-white/80 font-medium drop-shadow-md">
                    Feels like {Math.round(weatherData.main.feels_like)}°
                  </div>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <Droplets className="h-6 w-6 text-blue-200" />
                  </div>
                  <div className="text-sm text-white/70 font-medium">Humidity</div>
                  <div className="text-2xl font-bold drop-shadow-md">{weatherData.main.humidity}%</div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <Wind className="h-6 w-6 text-blue-200" />
                  </div>
                  <div className="text-sm text-white/70 font-medium">Wind Speed</div>
                  <div className="text-2xl font-bold drop-shadow-md">{Math.round(weatherData.wind.speed * 3.6)} km/h</div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <Eye className="h-6 w-6 text-blue-200" />
                  </div>
                  <div className="text-sm text-white/70 font-medium">Visibility</div>
                  <div className="text-2xl font-bold drop-shadow-md">{Math.round(weatherData.visibility / 1000)} km</div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <Gauge className="h-6 w-6 text-blue-200" />
                  </div>
                  <div className="text-sm text-white/70 font-medium">Pressure</div>
                  <div className="text-2xl font-bold drop-shadow-md">{weatherData.main.pressure} hPa</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
            <p className="text-white font-medium text-lg drop-shadow-md">Loading weather data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;