import colors from 'colors';
import mongoose from 'mongoose';
import { server } from './app';
import config from './app/config';
import seedSuperUser from './app/DB';
import { updateRanks } from './app/modules/AppSystem/Constants/updateRank';

async function main() {
  try {
    await mongoose.connect(config.database_url as string);

    seedSuperUser();

    setInterval(
      async () => {
        await updateRanks();
      },
      6 * 60 * 60 * 1000,
    ); // 6 hours in milliseconds

    server.listen(config.port, () => {
      console.log(colors.green(`Socket Server is listening on port ${config.port}`));
    });
  } catch (err) {
    console.log(err);
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unhandledRejection detected, shutting down...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log(`😈 uncaughtException detected, shutting down...`, err);
  process.exit(1);
});