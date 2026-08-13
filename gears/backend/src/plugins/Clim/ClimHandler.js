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

const formatCliError = (rawError) => {
  if (!rawError) return 'Erreur CLI inconnue';
  
  const lines = rawError.trim().split('\n').filter(line => line.trim().length > 0);
  const lastLine = lines[lines.length - 1] || rawError;
  const cleanMessage = lastLine.includes(':') 
    ? lastLine.split(':').slice(1).join(':').trim() 
    : lastLine.trim();

  return cleanMessage || 'Erreur de connexion à la climatisation';
};

const runCli = (subcommand, extraArgs = []) => {
	return new Promise((resolve, reject) => {
		execFile(CLI, [subcommand, ...BASE_ARGS_LOCAL, ...extraArgs], (err, stdout, stderr) => {
		if (err) {
      const conciseError = formatCliError(stderr || err.message);
      return reject(new Error(conciseError));
    }
		resolve(stdout);
		});
	});
};



// Parse la sortie texte en objet
const parseStatus = (raw) => {
  console.log("raw", raw)
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
    .catch(err => server.writeLogs(["Server", "Error"], 'Clim inaccessible au démarrage:', err.message));
});
