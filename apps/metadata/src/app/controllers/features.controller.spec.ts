import { Test, TestingModule } from '@nestjs/testing';
import { FeaturesController } from './features.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CacheModule } from '@nestjs/common';

import {
  FeatureService,
  MongooseAsyncFeatures,
  MongooseForFeatures,
} from '@castcle-api/database';
describe('FeaturesController', () => {
  let mongod: MongoMemoryServer;
  let app: TestingModule;
  let appController: FeaturesController;
  let countryService: FeatureService;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseAsyncFeatures,
        MongooseForFeatures,
        CacheModule.register({
          store: 'memory',
          ttl: 1000,
        }),
      ],
      controllers: [FeaturesController],
      providers: [FeatureService],
    }).compile();

    appController = app.get<FeaturesController>(FeaturesController);
    countryService = app.get<FeatureService>(FeatureService);

    await countryService.create({
      slug: 'feed',
      name: 'Feed',
      key: 'feed.Feed',
    });
    await countryService.create({
      slug: 'photo',
      name: 'Photo',
      key: 'photo.Photo',
    });
    await countryService.create({
      slug: 'Watch',
      name: 'watch',
      key: 'Watch.watch',
    });
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('getAllFeature', () => {
    it('should get all features in db', async () => {
      const result = await appController.getAllFeature();
      const expectResult = {
        payload: [
          {
            slug: 'feed',
            name: 'Feed',
            key: 'feed.Feed',
          },
          {
            slug: 'photo',
            name: 'Photo',
            key: 'photo.Photo',
          },
          {
            slug: 'Watch',
            name: 'watch',
            key: 'Watch.watch',
          },
        ],
      };
      console.log(result);

      expect(expectResult).toEqual(result);
    });
  });
});
