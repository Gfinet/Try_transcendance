const realTimeRegister = 100;

export default async function modbus(server)
{
    server.get('/mb', 
    { preHandler: [server.auth] },
    async (request, reply)=>{
        server.writeLogs(["Request", "Server"], request.user.name, "GET /mb")
        try {
            const response = await server.mb.readInputRegisters(realTimeRegister, 2)

            const buffer = response.response.body.valuesAsBuffer;
            const power = buffer.readUInt32BE(0)
    
            console.log(`Production : ${power} Watts`)
            return {success : true, message: power}
        }
        catch (err)
        {
            server.writeLogs(["Error"], "erreur :", err)
            return {success : false, message: 0}
        }
    });

    server.get('/mbtoday',
    { preHandler: [server.auth] },
    async (request,reply) =>{
        server.writeLogs(["Request", "Server"], request.user.name, "GET /mbtoday")
        try {
            const now = new Date()
            const start = new Date(now.getTime() - (24 * 60 * 60 * 1000)) //24h
            const newStart = new Date() //24h
            newStart.setHours(0)
            newStart.setMinutes(0)
            newStart.setMilliseconds(0)

            const today = await server.prisma.Solar_Data.findMany({ where: { hour: {gte : newStart, lte: now}}, orderBy: {hour: 'asc'}})
            // console.log("Waza",start, end, today)
            const sec = today.map((record, index) => {
                return {
                    id : index, 
                    time : record.hour, 
                    watts : record.Watts,
                    total : record.total
                }
            })

            return {success : true, message: sec}
        } 
        catch (error) {
            server.writeLogs(["Error"], "erreur :", err)
            return {success : false, message: 0}
        }
    })
}