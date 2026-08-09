

export default async function weatherPlugin(server){
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const dataToday = await server.prisma.weather_Forecast.findMany({where: {time: {gte: todayStart}}});
    if (dataToday.length === 0)
    {
        server.writeLogs(["Server"], "Weather : Getting new data")
        await fetchWeatherData(server);
    }
    else
    {server.writeLogs(["Server"], "Weather : Already got data")}

    async function fetchWeatherData(server) {
        const LAT=process.env.LAT;
        const LONG=process.env.LONG;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LONG}&hourly=temperature_2m,shortwave_radiation&timezone=UTC`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(data.error || 'Failed to fetch weather data');
        else console.log("connection to open-meteo ok");

        const data = await response.json();
        for (let i = 0; i < data.hourly.time.length; i++) {
            await server.prisma.weather_Forecast.upsert({
                where: { 
                    time: new Date(data.hourly.time[i]) 
                },
                update: {
                    temp: data.hourly.temperature_2m[i]
                },
                create: {
                    time: new Date(data.hourly.time[i]),
                    temp: data.hourly.temperature_2m[i],
                    SolarRay: data.hourly.shortwave_radiation[i]
                }
            });
        }
    }
}