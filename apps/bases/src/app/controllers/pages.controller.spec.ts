/*
 * Copyright (c) 2021, Castcle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 3 only, as
 * published by the Free Software Foundation.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
 * version 3 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 3 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Castcle, 22 Phet Kasem 47/2 Alley, Bang Khae, Bangkok,
 * Thailand 10160, or visit www.castcle.com if you need additional information
 * or have any questions.
 */
import {
  AuthenticationService,
  ContentService,
  createCastcleMeta,
  HashtagService,
  MongooseAsyncFeatures,
  MongooseForFeatures,
  SocialProvider,
  SocialSyncService,
  UserService,
} from '@castcle-api/database';
import {
  Author,
  CastcleIncludes,
  ContentType,
  PageDto,
  SaveContentDto,
  ShortPayload,
} from '@castcle-api/database/dtos';
import { Content, Credential } from '@castcle-api/database/schemas';
import { Downloader, Image } from '@castcle-api/utils/aws';
import { CastcleException, CastcleStatus } from '@castcle-api/utils/exception';
import { CredentialRequest } from '@castcle-api/utils/interceptors';
import { UserProducer } from '@castcle-api/utils/queue';
import { CacheModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PagesController } from './pages.controller';

export class DownloaderMock {
  getImageFromUrl() {
    return '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';
  }
}

describe('PageController', () => {
  let mongod: MongoMemoryServer;
  let app: TestingModule;
  let pageController: PagesController;
  let authService: AuthenticationService;
  let contentService: ContentService;
  let userService: UserService;
  let userCredential: Credential;
  let socialSyncService: SocialSyncService;
  const pageDto: PageDto = {
    displayName: 'Super Page',
    castcleId: 'pageyo',
  };
  const pageDto2: PageDto = {
    displayName: 'Super Page2',
    castcleId: 'pageyo2',
  };
  beforeAll(async () => {
    const DownloaderProvider = {
      provide: Downloader,
      useClass: DownloaderMock,
    };

    mongod = await MongoMemoryServer.create();
    app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        CacheModule.register({
          store: 'memory',
          ttl: 1000,
        }),
        MongooseAsyncFeatures,
        MongooseForFeatures,
      ],
      controllers: [PagesController],
      providers: [
        UserService,
        AuthenticationService,
        ContentService,
        UserProducer,
        HashtagService,
        SocialSyncService,
        DownloaderProvider,
      ],
    }).compile();
    authService = app.get<AuthenticationService>(AuthenticationService);
    contentService = app.get<ContentService>(ContentService);
    userService = app.get(UserService);
    socialSyncService = app.get(SocialSyncService);
    pageController = app.get<PagesController>(PagesController);
    const result = await authService.createAccount({
      device: 'iPhone',
      deviceUUID: 'iphone12345',
      header: { platform: 'iphone' },
      languagesPreferences: ['th', 'th'],
    });
    const accountActivation = await authService.signupByEmail(
      result.accountDocument,
      {
        email: 'test@gmail.com',
        displayId: 'test1234',
        displayName: 'test',
        password: '1234AbcD',
      }
    );
    await authService.verifyAccount(accountActivation);
    jest.spyOn(pageController, '_uploadImage').mockImplementation(async () => {
      console.log('---mock uri--image');
      const mockImage = new Image({
        original: 'mockUri',
      });
      return mockImage;
    });
    userCredential = result.credentialDocument;
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('createPage', () => {
    it('should create new user that has the info from pageDTO', async () => {
      const newPageResponse = await pageController.createPage(
        { $credential: userCredential, $language: 'th' } as any,
        pageDto
      );
      expect(newPageResponse.images.avatar).toBeDefined();
      expect(newPageResponse.displayName).toEqual(pageDto.displayName);
      expect(newPageResponse.images.cover).toBeDefined();
      expect(newPageResponse.castcleId).toEqual(pageDto.castcleId);
      const testPage = await userService.getByIdOrCastcleId(pageDto.castcleId);
      const pageResponse = testPage.toPageResponse();
      expect(pageResponse.images.avatar).toBeDefined();
      expect(pageResponse.displayName).toEqual(pageDto.displayName);
      expect(pageResponse.images.cover).toBeDefined();
      expect(pageResponse.castcleId).toEqual(pageDto.castcleId);
    });
  });
  describe('updatePage', () => {
    it('should update some properly in updatePageDto to the created page', async () => {
      const testPage = await userService.getByIdOrCastcleId(pageDto.castcleId);
      const result = await pageController.updatePage(
        { $credential: userCredential, $language: 'th' } as any,
        testPage._id,
        {
          displayName: 'change baby',
          overview: 'yo',
          links: {
            website: 'https://castcle.com',
            facebook: 'https://facebook.com',
            twitter: 'https://twitter.com',
            youtube: 'https://youtube.com',
            medium: 'https://medium.com',
          },
        }
      );
      //expect(result).toEqual({ ...pageDto, displayName: 'change baby' });
      expect(result.displayName).toEqual('change baby');
      expect(result.links.website).toEqual('https://castcle.com');
      expect(result.links.facebook).toEqual('https://facebook.com');
      expect(result.links.twitter).toEqual('https://twitter.com');
      expect(result.links.youtube).toEqual('https://youtube.com');
      expect(result.links.medium).toEqual('https://medium.com');
      expect(result.overview).toEqual('yo');
    });
  });
  describe('deletePage', () => {
    it('should delete a page if user has permission', async () => {
      const testPage = await userService.getByIdOrCastcleId(pageDto.castcleId);
      const result = await pageController.deletePage(
        { $credential: userCredential, $language: 'th' } as any,
        testPage._id,
        {
          password: '1234AbcD',
        }
      );
      expect(result).toEqual('');
      const postPage = await userService.getByIdOrCastcleId(pageDto.castcleId);
      expect(postPage).toBeNull();
    });
  });
  describe('getPageFromId', () => {
    it('should be able to get page from user ID', async () => {
      await pageController.createPage(
        { $credential: userCredential, $language: 'th' } as any,
        pageDto2
      );
      const testPage = await userService.getByIdOrCastcleId(pageDto2.castcleId);
      const getResult = await pageController.getPageFromId(
        { $credential: userCredential, $language: 'th' } as any,
        testPage._id
      );
      expect(getResult).toEqual(testPage.toPageResponse());
    });
    it('should be able to get page from CastcleId', async () => {
      const testPage = await userService.getByIdOrCastcleId(pageDto2.castcleId);
      const getResult = await pageController.getPageFromId(
        { $credential: userCredential, $language: 'th' } as any,
        pageDto2.castcleId
      );
      expect(getResult).toEqual(testPage.toPageResponse());
    });
  });
  describe('getPageContents', () => {
    it('should return ContentsResponse that contain all contain that create by this page', async () => {
      const page = await userService.getByIdOrCastcleId(pageDto2.castcleId);
      const contentDtos: SaveContentDto[] = [
        {
          type: ContentType.Short,
          payload: {
            message: 'hello',
          } as ShortPayload,
          castcleId: page.displayId,
        },
        {
          type: ContentType.Short,
          payload: {
            message: 'hi',
          } as ShortPayload,
          castcleId: page.displayId,
        },
      ];
      const createResult: Content[] = [];
      createResult[0] = await contentService.createContentFromUser(
        page,
        contentDtos[0]
      );
      createResult[1] = await contentService.createContentFromUser(
        page,
        contentDtos[1]
      );
      const response = await pageController.getPageContents(
        page._id,
        { $credential: userCredential, $language: 'th' } as any,
        { hasRelationshipExpansion: false }
      );
      const items = createResult
        .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
        .map((c) => c.toContentPayloadItem());

      const expectedObject = {
        payload: items,
        includes: new CastcleIncludes({
          users: createResult.map(({ author }) => new Author(author)),
          casts: [],
        }),
        meta: createCastcleMeta(createResult),
      };

      expect(JSON.stringify(response)).toEqual(JSON.stringify(expectedObject));
    });
  });
  describe('getAllPages', () => {
    it('should display all pages that has been created', async () => {
      const result = await pageController.getAllPages({
        $credential: userCredential,
      } as CredentialRequest);
      console.log(result);
      expect(result.payload.length).toEqual(1);
      expect(result.pagination.self).toEqual(1);
      expect(result.pagination.limit).toEqual(25);
    });
  });

  describe('createPage with social', () => {
    it('should create new user that has the info from SocialPageDto', async () => {
      const newPageResponse = await pageController.createPageSocial(
        { $credential: userCredential, $language: 'th' } as any,
        {
          payload: [
            {
              provider: SocialProvider.Facebook,
              socialId: 'fb001',
              userName: 'fb_test1',
              displayName: 'test1',
              overview: 'facebook sync 1',
              avatar: '',
              cover: '',
              link: 'http://www.facebook.com/test1',
            },
            {
              provider: SocialProvider.Twitter,
              socialId: 'tw001',
              userName: 'tw_test1',
              displayName: 'test2',
              overview: 'twitter sync 1',
              avatar: '',
              cover: '',
              link: 'http://www.twitter.com/test2',
            },
          ],
        }
      );

      const page1 = await userService.getByIdOrCastcleId(
        newPageResponse.payload[0].castcleId
      );
      const page2 = await userService.getByIdOrCastcleId(
        newPageResponse.payload[1].castcleId
      );
      const syncSocial1 = await socialSyncService.getSocialSyncByUser(page1);
      const syncSocial2 = await socialSyncService.getSocialSyncByUser(page2);
      expect(newPageResponse.payload.length).toEqual(2);
      expect(newPageResponse.payload[0].links.facebook).toBeDefined();
      expect(newPageResponse.payload[0].socialSyncs).toBeDefined();
      expect(newPageResponse.payload[1].links.twitter).toBeDefined();
      expect(newPageResponse.payload[1].socialSyncs).toBeDefined();
      expect(syncSocial1.length).toEqual(1);
      expect(syncSocial2.length).toEqual(1);
      expect(syncSocial1[0].author.id).toEqual(page1.id);
      expect(syncSocial2[0].author.id).toEqual(page2.id);
    });

    it('should return Exception when use duplicate social id', async () => {
      await expect(
        pageController.createPageSocial(
          { $credential: userCredential, $language: 'th' } as any,
          {
            payload: [
              {
                provider: SocialProvider.Facebook,
                socialId: 'fb001',
                userName: 'fb_test1',
                displayName: 'test1',
                overview: 'facebook sync 1',
                avatar: '',
                cover: '',
                link: 'http://www.facebook.com/test1',
              },
            ],
          }
        )
      ).rejects.toEqual(
        new CastcleException(CastcleStatus.SOCIAL_PROVIDER_IS_EXIST)
      );
    });

    it('should return Exception when use guest account', async () => {
      const guest = await authService.createAccount({
        device: 'iPhone8+',
        deviceUUID: 'ios8abc',
        header: { platform: 'ios' },
        languagesPreferences: ['th'],
        geolocation: {
          countryCode: '+66',
          continentCode: '+66',
        },
      });

      const credentialGuest = {
        $credential: guest.credentialDocument,
        $language: 'th',
      } as any;

      await expect(
        pageController.createPageSocial(credentialGuest, {
          payload: [
            {
              provider: SocialProvider.Facebook,
              socialId: 'fb001',
              userName: 'fb_test1',
              displayName: 'test1',
              overview: 'facebook sync 1',
              avatar: '',
              cover: '',
              link: 'http://www.facebook.com/test1',
            },
          ],
        })
      ).rejects.toEqual(new CastcleException(CastcleStatus.FORBIDDEN_REQUEST));
    });
  });
});
