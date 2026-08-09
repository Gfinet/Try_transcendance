


export default async function getVal(server)
{
    const base_url = "https://sandbox.smaapis.de/monitoring/v1/devices/14496865/lean"

    server.get('/sma',
    { preHandler: [server.auth] },
    async (request, reply)=>
    {
        server.writeLogs(["Request"], request.user.name, "GET /sma")
        let data = {};  
        try
        {
            const response = await fetch (base_url, {
                method: 'GET',
                headers: {
                'Authorization': 'Bearer test1234', // À récupérer sur le Swagger
                'Accept': 'application/json'
                }
            })
            if (!response.ok) {
                throw new Error(`Erreur: ${response.status}`);
            }

            data = await response.json();
            console.log("Installations trouvées :", data);
        } 
        catch (error) 
        {
            server.writeLogs(["Error"], "Erreur lors de l'appel API :", error);
        }
        return { success: true, message: data }
    })
}