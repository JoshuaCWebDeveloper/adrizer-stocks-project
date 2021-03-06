import util from 'util';
import fs from 'fs';
import path from 'path';
import {ApplicationConfig, AdrizerStocksProjectApplication} from './application';

interface AdRizerConfig {
  ALPHA_API_KEY: string;
}

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  
  const configFile = await util.promisify(fs.readFile)(
    path.join(__dirname, "../config.json")
  );
  const configData = <AdRizerConfig>JSON.parse(configFile.toString());
  
  const app = new AdrizerStocksProjectApplication(options);
  await app.boot();
  await app.start();
  
  Object.entries(configData).forEach(([k, v]) => app.bind(`config.${k}`).to(v));

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
