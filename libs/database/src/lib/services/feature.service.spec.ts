import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';

import {
  FeatureService,
  MongooseAsyncFeatures,
  MongooseForFeatures,
} from '../database.module';
import { FeaturePayloadDto } from '../dtos';

describe('FeatureService', () => {
  let mongod: MongoMemoryServer;
  let app: TestingModule;
  let service: FeatureService;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseAsyncFeatures,
        MongooseForFeatures,
      ],
      providers: [FeatureService],
    }).compile();
    service = app.get<FeatureService>(FeatureService);
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('#create and get all features', () => {
    it('should create new features in db', async () => {
      const newFeature: FeaturePayloadDto = {
        id: '623c4554a9a1253338438f9a',
        slug: 'feed',
        name: 'Feed',
        key: 'feed.Feed',
        createdAt: '2022-03-24T11:15:19.624+00:00',
        updatedAt: '2022-03-24T11:15:19.624+00:00',
      };
      const newFeature2: FeaturePayloadDto = {
        id: '623c4554a9a1253338438f9b',
        slug: 'photo',
        name: 'Photo',
        key: 'photo.Photo',
        createdAt: '2022-03-24T11:15:19.624+00:00',
        updatedAt: '2022-03-24T11:15:19.624+00:00',
      };
      const newFeature3: FeaturePayloadDto = {
        id: '623c4554a9a1253338438f9c',
        slug: 'Watch',
        name: 'watch',
        key: 'Watch.watch',
        createdAt: '2022-03-24T11:15:19.624+00:00',
        updatedAt: '2022-03-24T11:15:19.624+00:00',
      };
      const resultData = await service.create(newFeature);
      const resultData2 = await service.create(newFeature2);
      const resultData3 = await service.create(newFeature3);
      expect(resultData).toBeDefined();
      expect(resultData.slug).toEqual(newFeature.slug);
      expect(resultData.name).toEqual(newFeature.name);
      expect(resultData.key).toEqual(newFeature.key);
      expect(resultData2).toBeDefined();
      expect(resultData3).toBeDefined();
    });

    it('should get data in db', async () => {
      const result = await service.getAll();
      expect(result).toBeDefined();
      expect(result.length).toEqual(3);
    });

    it('should get data in db with search criteria', async () => {
      const result = await service.getAll();
      expect(result).toBeDefined();
      expect(result[0].slug).toEqual('feed');
    });
  });
});
