import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt';
import 'dotenv/config';

import prisma from './plugins/prisma.js'
import mb from './plugins/Solar_Wash/modbus_solar.js'
import miele from './plugins/Solar_Wash/mieleWashing.js'
import weather from './plugins/Solar_Wash/weather.js'
import clim from './plugins/Clim/ClimHandler.js'
import jwt from './plugins/jwt_auth.js'
import webpush from './plugins/web-push.js'
// import MyQ from './plugins/Door_Cams/garageHandler.js'
// import ezviz from './plugins/Door_Cams/ezviz_cam.js'

import fs from 'fs'; //Logs
import path from 'path';
import util from 'util';
import cron from 'node-cron';

import routes from './routes/index.js'


const serverOn = async () => {

	const customStream = {
		write: (logString) => {
		const log = JSON.parse(logString)
		
		if (log.msg) {
			fs.writeSync(logsFd["Server"], 
			`[${new Date(log.time).toLocaleString('fr-FR', {timeZone: 'Europe/Paris'})}] FASTIFY: ${log.msg}\n`)
	}}}

	const server = Fastify({logger: {
		level: 'info',
		stream: customStream // On branche ton "intercepteur" ici
	}})



	const logsFile = ["Server.log", "Prisma.log", "Miele.log", "Request.log", "Error.log", "Test.log", "Cron.log"]
	const logsFd = Object.fromEntries(
		logsFile.map(name => [name.slice(0, -4), fs.openSync(path.join(process.cwd(), 'src', 'logs', name), 'a')]))
	const logsDir = path.join(process.cwd(), 'src', 'logs');
	fs.mkdirSync(logsDir, { recursive: true });
	
	server.decorate('logFd', logsFd);
	// console.log(server.logFd)


	server.decorate('writeLogs', (fds, ...args) => {
		fds.forEach(fd => {
		const timestamp = new Date().toLocaleString('fr-FR', {timeZone: 'Europe/Paris'});
		const formattedMessage = util.format(...args);
		const output = `[${timestamp}] ${formattedMessage}\n`;
		
		if (server.logFd?.[fd]) 
			fs.writeSync(server.logFd[fd], output);
		else {
			const errMsg = util.format("Error", fd, "unexistant", ...args);
			const errPut = `[${timestamp}] ${errMsg}\n`;
			fs.writeSync(server.logFd["Error"], errPut);
	}})})
	const cronLogger = {
		info: (msg) => server.writeLogs(["Cron", "Server"], `[INFO] - ${msg}\n`),
		warn: (msg) => server.writeLogs(["Cron", "Error"], `[WARN] - ${msg}\n`),
		error: (msg) => server.writeLogs(["Cron", "Error"], `[ERROR] - ${msg}\n`),
	};
	server.decorate("cronLogger", cronLogger)

	server.register(fastifyJwt, {secret: process.env.JWT_SECRET });

	const plugins = [jwt, prisma, mb, weather, webpush, miele, clim]
	plugins.forEach(plug => server.register(plug));

	server.register(routes, { prefix: '/api' });

	const sendNotif = async (server) => {
		// console.log("Notifs?", server.hasPendingNotifs)
		// if (!server.hasPendingNotifs) return;
		const notifs = await server.prisma.pushNotif.findMany({where : {sendAt : {lte : new Date()}}})
		for (const one of notifs)
		{
			await server.sendNotif(one.type)
			if (one.type == 3)
				await server.prisma.washing_Program.update({
					where : { id : one.programId},
					data : { finished : "Terminé"}
				})
			await server.prisma.pushNotif.delete({where :{id : one.id}})
		}
		const check = await server.prisma.pushNotif.findMany();
		if (check.length == 0) server.hasPendingNotifs = false;
		// console.log("Notifs?", server.hasPendingNotifs)
	}

	const launchWash = async (server) => {
		// console.log("Programs?", server.hasPendingPrgm)
		// if (!server.hasPendingPrgm) {server.writeLogs(["Test"], "noprgm"); return;}
		const prgm = await server.prisma.washing_Program.findFirst({
			where : {startAt: {lte: new Date()}, finished : "En attente"},
			orderBy: {createdAt: 'desc'},
		})
		if (prgm)
		{
			const tokenData = await server.miele.getToken(prgm.authorId, server)
			// console.log("rep", prgm.deviceId, tokenData, prgm.type)
			const rep = await fetch(`https://api.mcs3.miele.com/v1/devices/${prgm.deviceId}/programs`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${tokenData}`,
					'Content-Type': 'application/json',
					'Accept-Language': 'fr-FR',
				},
				body : JSON.stringify({
					"programId" : prgm.type
				}),
			});
			// console.log(rep)
			if (rep.ok) 
			{
				server.sendNotif(2);
				await server.prisma.washing_Program.update({
					where : { id : prgm.id},
					data : { finished : "En cours"}
				})
			}
			else server.sendNotif(4)
		}
		const check = await server.prisma.washing_Program.findMany({where : {finished : "En attente"}});
		if (check.length == 0) server.hasPendingPrgm = false;
		// console.log("Programs?", server.hasPendingPrgm)

	}
	
	const repeatTask = cron.schedule("* * * * *", async () => {
		await sendNotif(server);
		await launchWash(server);
	}, {scheduled: true, timezone: "Europe/Paris", logger: cronLogger})

	server.addHook('onClose', (instance, done) => {
        repeatTask.stop();
        done();
    });


  	return server
}


export default serverOn
