


export default async function weather(server) {

    server.get('/temptoday',
    { preHandler: [server.auth] },
    async (request, reply) => {
        server.writeLogs(["Request"], request.user.name, "GET /temptoday")
        const now = new Date()
        const start = new Date(now.getTime() - (12 * 60 * 60 * 1000))
        // start.setHours(22, 59, 59, 999);
        const end = new Date(now.getTime() + (11 * 60 * 60 * 1000))
        // console.log(now, start, end, "\n", now.getDate())
        const today = await server.prisma.weather_Forecast.findMany({ where: { time: {gte : start, lte: end }}, orderBy: {time: 'asc'}})
        // console.log("Waza", today)
        return {success : true, message: today}
    })
}