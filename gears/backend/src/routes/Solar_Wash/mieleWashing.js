import 'dotenv/config';

export default async function miele(server) {

    server.post('/list',
    { preHandler: [server.auth] },
    async (request, reply) =>{
        server.writeLogs(["Request", "Server", "Miele"], request.user.name, "POST /miele/list")
        const number = request.body
        const line = await server.prisma.washing_Program.findMany( {take: number, orderBy: { createdAt: 'desc'}, include: {author: {select: {username: true}}}})
        if (line)
            return { success: true, message: line }
        else
            return { success: false, message: "No Data" }
    })
    server.get('/list',
    { preHandler: [server.auth] },
    async (request, reply) =>{
        server.writeLogs(["Request", "Server", "Miele"], request.user.name, "GET /miele/list")
        const line = await server.prisma.washing_Program.findMany( {
            take: 5, 
            orderBy: { createdAt: 'desc'}, 
            include: {author: {select: {username: true}}}}
        )
        if (line)
            return { success: true, message: line }
        else
            return { success: false, message: "No Data" }
    })


    server.get('/callback', 
    async (request, reply) =>{
        server.writeLogs(["Request", "Server", "Miele"], "GET /miele/callback")
        const {code, state} = request.query
        

        const decoded = server.jwt.verify(state);
        const userId = decoded.id;

        if (!code) return reply.status(400).send({ error: "Code manquant" });
        
        const response = await fetch('https://api.mcs3.miele.com/thirdparty/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.MIELE_ID,
            client_secret: process.env.MIELE_SECRET,
            code: code,
            redirect_uri: process.env.MIELE_REDIRECT_URI,
            grant_type: 'authorization_code'
        })
        });
        const tokens = await response.json();
        // console.log("tok tok", tokens, "\n", process.env.MIELE_ID, "\n", process.env.MIELE_SECRET)
        if (tokens.error)
        {
            server.writeLogs(["Miele", "Error"], tokens.message + " - " + tokens.error)
            return reply.redirect('/schedule?miele=failure')
        }
        const today = new Date()
        today.setHours(today.getHours() + 2)
        await server.prisma.miele_Token.upsert({
            where: { userId: userId }, //TO DO changer userId en Id utilisateur
            update: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(today + tokens.expires_in * 1000)
            },
            create: {
            userId: userId,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(today + tokens.expires_in * 1000)
            }
        });
        server.writeLogs(["Miele", "Server"], "Connexion à Miele réussie et sauvegardée !")
        return reply.redirect('/schedule?miele=success');
    })

    server.get('/token', 
    { preHandler: [server.auth] },
    async (request, reply) =>{
        server.writeLogs(["Request", "Server", "Miele"], request.user.name, "GET /miele/token")
        const userId = request.user.id;
        const mieleTok = await server.prisma.user.findUnique({
            where : {id : userId}, 
            select : {
                mieleToken : true
        }})
        // console.log("TOKMIELE", mieleTok)
        return { success: (mieleTok.mieleToken !== null) }

    })

    server.get('/connect', 
    { preHandler: [server.auth] }, 
    async (request, reply) => {
        server.writeLogs(["Request", "Server", "Miele"], request.user.name, "GET /miele/connect")
        try {
            const stateToken = server.jwt.sign(
                { id: request.user.id, purpose: 'miele-auth' }, 
                { expiresIn: '15m' }
            );
            const clientId = process.env.MIELE_ID;
            const redirectUri = process.env.MIELE_REDIRECT_URI;
            const authUrl = `https://api.mcs3.miele.com/thirdparty/login?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${stateToken}&scope=all&language=fr`;
            server.writeLogs(["Test"], clientId, redirectUri, authUrl)
            return {url :authUrl};
        } 
        catch (error) {
            return {url : '/dashboard', message : "Error"}
        }
        
    })

    server.get('/devices', 
    { preHandler: [server.auth] }, 
    async (request, reply) => {
        server.writeLogs(["Request", "Server", "Miele"], request.user.name, "GET /miele/devices")
        const userId = request.user.id;
        const tokenData = await server.miele.getToken(userId, server)
        
        const response = await fetch('https://api.mcs3.miele.com/v1/short/devices?language=fr', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'fr-FR' // Pour avoir les noms des programmes en français !
            }
        });

        const devices = await response.json();

        if (response.ok) return devices;
        server.writeLogs(["Error", "Miele", "Server"], "Miele error response", response);
        return [];
    });

    server.get('/devices/:deviceId', //?language=fr
    { preHandler: [server.auth] },
    async (request, reply) => {
        server.writeLogs(["Request", "Server", "Miele"], request.user.name, "GET /miele/devices/:deviceId")
        const { deviceId } = request.params;
        const userId = request.user.id;
        const tokenData = await server.miele.getToken(userId, server)        

        const response = await fetch(`https://api.mcs3.miele.com/v1/devices/${deviceId}?language=fr`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'fr-FR' // Pour avoir les noms des programmes en français !
            }
        });

        const devices = await response.json();
        
        if (response.ok) return devices; //testDeviceMiele;
        server.writeLogs(["Error", "Miele", "Server"], "Miele error response", response);
        return []; 
    });

    server.get('/devices/:deviceId/programs', //?language=fr
    { preHandler: [server.auth] },
    async (request, reply) => {

        server.writeLogs(["Request", "Server", "Miele"], request.user.name, "GET /miele/devices/:deviceId/programs")
        const { deviceId } = request.params;
        const userId = request.user.id;
        const tokenData = await server.miele.getToken(userId, server)        

        const response = await fetch(`https://api.mcs3.miele.com/v1/devices/${deviceId}/programs?language=fr`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'fr-FR' // Pour avoir les noms des programmes en français !
            }
        });

        const devices = await response.json();
        // console.log(response, "\n\n", devices)
        
        if (response.ok) return devices; //testDeviceMiele;
        if (response.status !== 400) 
            server.writeLogs(["Error", "Miele", "Server"], "Miele GET :deviceId/programs error response", response);
        return []; 
    });
    

    server.put('/devices/:deviceId/actions', //?language=fr
    { preHandler: [server.auth] },
    async (request, reply) => {
        server.writeLogs(["Request", "Server", "Miele"], request.user.name, "PUT /miele/devices/:deviceId/actions")
        const { deviceId } = request.params;
        const userId = request.user.id;
        const tokenData = await server.miele.getToken(userId, server)        

        const response = await fetch(`https://api.mcs3.miele.com/v1/devices/${deviceId}/actions`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${tokenData}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'fr-FR',
            },
            body : JSON.stringify(request.body),
        });

        if (response.status !== 204) await response.json();
        
        if (response.ok) 
        {
            await server.miele.saveDb(server, userId, request.body)
            return { success: true }; //testDeviceMiele;
        }
        server.writeLogs(["Error", "Miele", "Server"], "Miele PUT :deviceId/actions error response", response);
        return { success: false }; 
    });


    server.get('/devices/:deviceId/actions', //?language=fr
    { preHandler: [server.auth] },
    async (request, reply) => {
        server.writeLogs(["Request", "Server", "Miele"], request.user.name, "GET /miele/devices/:deviceId/actions")
        const { deviceId } = request.params;
        const userId = request.user.id;
        const tokenData = await server.miele.getToken(userId, server)        

        const response = await fetch(`https://api.mcs3.miele.com/v1/devices/${deviceId}/actions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'fr-FR',
            },
        });
        let data;
        if (response.status !== 204) data = await response.json();
        server.writeLogs(["Error", "Miele"], "Miele GET :deviceId/actions response", response, "\n", data);
        
        if (response.ok) 
        {
            await server.miele.saveDb(server, userId, request.body)
            return { success: true }; //testDeviceMiele;
        }
        server.writeLogs(["Error", "Miele"], "Miele GET :deviceId/actions error response", response);
        return { success: false }; 
    });

    server.put('/devices/:deviceId/programs', //?language=fr
    { preHandler: [server.auth] },
    async (request, reply) => {
        server.writeLogs(["Request", "Server", "Miele"], request.user.name, "PUT /miele/devices/:deviceId/programs")
        try {
            server.hasPendingPrgm = true;
            const userId = request.user.id;
            await server.miele.saveDb(server, userId, request)
            return { success: true, message : "Program saved to db" }; 
        } catch (error) {
            server.writeLogs(["Test", "Server", "Miele"], error)
            return { success: false, message : "Error while getting to db" }; 
        }
        
    });
}
    


