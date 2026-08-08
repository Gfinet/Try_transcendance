import fp from 'fastify-plugin';
import { execFile } from 'child_process';

const CLI = 'midea-beautiful-air-cli';
// const CLI = '/root/.local/bin/midea-beautiful-air-cli';
const BASE_ARGS_LOCAL = [
  '--ip',    process.env.CLIM_IP,
  '--key',   process.env.CLIM_KEY,
  '--token', process.env.CLIM_TOK,
];

const BASE_ARGS_CLOUD = [
  '--account', process.env.CLIM_ACCOUNT,
  '--password', process.env.CLIM_PSWD,
  '--appkey', '3742e9e5842d4ad59c2db887e12449f9',
  '--appid',  '1017',
  '--ip',     process.env.CLIM_IP,
];

const runCli = (subcommand, extraArgs = []) => {
	return new Promise((resolve, reject) => {
		execFile(CLI, [subcommand, ...BASE_ARGS_LOCAL, ...extraArgs], (err, stdout, stderr) => {
		if (err) return reject(new Error(stderr || err.message));
		resolve(stdout);
		});
	});
};



// Parse la sortie texte en objet
const parseStatus = (raw) => {
  const result = {};
  for (const line of raw.split('\n')) {
    const match = line.match(/^\s{2}(\w+)\s+=\s+(.+)$/);
    if (match) result[match[1].trim()] = match[2].trim();
  }
  return result;
};

export default fp(async (server) => {
  server.decorate('clim', {
    getStatus: async () => parseStatus(await runCli('status')),
    setTemp:   (temp)  => runCli('set', ['--target-temperature', String(temp)]),
    setMode:   (mode)  => runCli('set', ['--mode', String(mode)]),
    setOn:     ()      => runCli('set', ['--running', 'true']),
    setOff:    ()      => runCli('set', ['--running', 'false']),
  });

  server.clim.getStatus()
    .then(s => server.writeLogs(["Server"],'Clim connectée:', s.name, '| temp:', s.indoor, '°C'))
    .catch(err => console.warn('Clim inaccessible au démarrage:', err.message));
});
