import { Persistence } from '../src/db/persistence.js';

const persistence = new Persistence();
try {
  await persistence.migrate();
  console.log('Migração inicial aplicada com sucesso.');
} finally {
  await persistence.close();
}
