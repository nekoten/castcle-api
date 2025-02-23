import { getMongooseModuleOptions } from 'libs/database/src/lib/database.config';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { connect, disconnect } from 'mongoose';
import { initializeUsers } from './modules/authentications';
import { testUsersReporting, testUsersUpdateMobile } from './modules/users';
import {
  closeAuthenticationsModule,
  closeUsersModule,
  setupAuthenticationsModule,
  setupUsersModule,
} from './setups';

describe('Castcle E2E Tests', () => {
  let mongoMemoryReplSet: MongoMemoryReplSet;

  beforeAll(async () => {
    mongoMemoryReplSet = await MongoMemoryReplSet.create();
    (getMongooseModuleOptions as jest.Mock).mockReturnValue({
      uri: mongoMemoryReplSet.getUri(),
    });

    await connect(mongoMemoryReplSet.getUri('test'));
    await setupAuthenticationsModule();
    await initializeUsers();
  });

  afterAll(async () => {
    await closeAuthenticationsModule();
    await mongoMemoryReplSet.stop();
    await disconnect();
  });

  describe('# Users Microservice', () => {
    beforeAll(async () => {
      await setupUsersModule();
    });

    afterAll(async () => {
      await closeUsersModule();
    });

    describe('- Report User or Content', () => {
      testUsersReporting();
    });

    describe('- Update Mobile', () => {
      testUsersUpdateMobile();
    });
  });
});
