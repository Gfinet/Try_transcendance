import fp from 'fastify-plugin'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'



const createUsers = async (server) => {

	const users = Object.keys(process.env)
		.filter(key => key.startsWith('USER_'))
		.map(key => process.env[key]);
	
	const pswds = Object.keys(process.env)
		.filter(key => key.startsWith('PSWD_'))
		.map(key => process.env[key]);
	for (let i = 0; i < users.length; i++)
	{
		const user = await server.prisma.user.findUnique({ where: { username: users[i] }})
		if (!user)
		{
			const mdp = await bcrypt.hash(pswds[i], 12)
			await server.prisma.User.create({data: {username: users[i], password_hash: mdp }})
		}

	}
}


export default fp(async (server) => {
  

  const prisma = new PrismaClient({ log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },] })
  
  prisma.$on('query', (e) => {
    server.writeLogs(["Prisma"], `PRISMA: ${e.query.substring(0, 100)}`, 
                                 `-Params: ${e.params}`, 
                                 `-Duration: ${e.duration}ms`)
  })
  server.decorate('prisma', prisma)
  server.addHook('onClose', async (server) => {
    await server.prisma.$disconnect()
  })
  createUsers(server);
})