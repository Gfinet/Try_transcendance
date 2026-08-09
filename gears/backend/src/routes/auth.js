import bcrypt from 'bcrypt'


export default async function auth(server) {

    server.post('/login', async (request, reply) => {
        const { username, password } = request.body
        server.writeLogs(["Request", "Server"], "POST /login")
        const user = await server.prisma.user.findUnique({ where: { username: username }})
        if (user)
        {
            if (await bcrypt.compare(password, user.password_hash))
            {
                const token = server.jwt.sign({ id: user.id, name: user.username },{ expiresIn: '7d' });
                return { success: true, token: token }
                // return { token };
            }
            else 
            {
                reply.code(401)
                return { success: false, message: "Mauvais mot de passe" }
            }
        }
        else
            return { success: false, message: "Utilisateur inexistant" }
        
    })
}

// fastify.bcrypt.hash('password')
//   .then(hash => fastify.bcrypt.compare('password', hash))
//   .then(match => console.log(match ? 'Matched!' : 'Not matched!'))
//   .catch(err => server.writeLogs(["Error"], err.message))
