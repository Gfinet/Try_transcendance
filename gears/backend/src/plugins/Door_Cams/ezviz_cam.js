import fp from 'fastify-plugin'


export default fp ( async (server) =>{
    // async function getEzvizAccessToken() {
    //     const response = await fetch('https://open.ezvizlife.com/api/lapp/token/get', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //         body: new URLSearchParams({
    //             'appKey': process.env.EZVIZ_KEY,
    //             'appSecret': process.env.EZVIZ_SECRET
    //         })
    //     });
    //     const data = await response.json();
    //     if (data.code !== "200") throw new Error("Erreur EZVIZ: " + data.msg);
    //     return data.data.accessToken;
    // }
})