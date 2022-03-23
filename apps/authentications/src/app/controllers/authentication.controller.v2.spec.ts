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
  AnalyticService,
  AuthenticationService,
  ContentService,
  HashtagService,
  MongooseAsyncFeatures,
  MongooseForFeatures,
  QueueName,
  UserService,
} from '@castcle-api/database';
import {
  AppleClient,
  FacebookClient,
  GoogleClient,
  TelegramClient,
  TwilioClient,
  TwitterClient,
} from '@castcle-api/utils/clients';
import { HttpModule } from '@nestjs/axios';
import { getQueueToken } from '@nestjs/bull';
import { CacheModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppService } from '../app.service';
import {
  AppleClientMock,
  DownloaderMock,
  FacebookClientMock,
  GoogleClientMock,
  TelegramClientMock,
  TwillioClientMock,
  TwitterClientMock,
} from '../client.mock';
import { RegisterByEmailDto } from '../dtos/dto';
import { AuthenticationControllerV2 } from './authentication.controller.v2';
import { Downloader, Image } from '@castcle-api/utils/aws';
import { AccountAuthenIdType } from '@castcle-api/database/schemas';
import { generateMockUsers, MockUserDetail } from '@castcle-api/database/mocks';
import { CastcleException, CastcleStatus } from '@castcle-api/utils/exception';

describe('AuthenticationControllerV2', () => {
  let mongod: MongoMemoryServer;
  let app: TestingModule;
  let controller: AuthenticationControllerV2;
  let authService: AuthenticationService;
  let appService: AppService;
  let userService: UserService;

  beforeAll(async () => {
    const FacebookClientProvider = {
      provide: FacebookClient,
      useClass: FacebookClientMock,
    };
    const DownloaderProvider = {
      provide: Downloader,
      useClass: DownloaderMock,
    };
    const TelegramClientProvider = {
      provide: TelegramClient,
      useClass: TelegramClientMock,
    };
    const TwitterClientProvider = {
      provide: TwitterClient,
      useClass: TwitterClientMock,
    };
    const TwillioClientProvider = {
      provide: TwilioClient,
      useClass: TwillioClientMock,
    };
    const AppleClientProvider = {
      provide: AppleClient,
      useClass: AppleClientMock,
    };
    const GoogleClientProvider = {
      provide: GoogleClient,
      useClass: GoogleClientMock,
    };

    mongod = await MongoMemoryServer.create();
    app = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        MongooseModule.forRoot(mongod.getUri()),
        MongooseAsyncFeatures,
        MongooseForFeatures,
        HttpModule,
      ],
      controllers: [AuthenticationControllerV2],
      providers: [
        AppService,
        AuthenticationService,
        FacebookClientProvider,
        DownloaderProvider,
        TelegramClientProvider,
        TwitterClientProvider,
        TwillioClientProvider,
        AppleClientProvider,
        GoogleClientProvider,
        UserService,
        ContentService,
        HashtagService,
        AnalyticService,
        {
          provide: getQueueToken(QueueName.CONTENT),
          useValue: { add: jest.fn() },
        },
        {
          provide: getQueueToken(QueueName.USER),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    controller = app.get<AuthenticationControllerV2>(
      AuthenticationControllerV2
    );
    authService = app.get<AuthenticationService>(AuthenticationService);
    appService = app.get<AppService>(AppService);
    userService = app.get<UserService>(UserService);

    jest.spyOn(appService, '_uploadImage').mockImplementation(async () => {
      console.log('---mock uri--image');
      const mockImage = new Image({
        original: 'test',
      });
      return mockImage;
    });
    jest
      .spyOn(appService, 'sendRegistrationEmail')
      .mockImplementation(async () => console.log('send email from mock'));
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('register', () => {
    let guestAccount: any;
    let guestAccountParent: any;

    beforeAll(async () => {
      guestAccount = await authService.createAccount({
        device: 'iphone13',
        deviceUUID: 'mockdeviceuuid',
        header: { platform: 'ios' },
        languagesPreferences: ['th'],
      });

      guestAccountParent = await authService.createAccount({
        device: 'iphone13',
        deviceUUID: 'mockdeviceuuid1',
        header: { platform: 'ios' },
        languagesPreferences: ['th'],
      });

      await controller.register(
        {
          $credential: guestAccountParent.credentialDocument,
          $account: guestAccountParent.accountDocument.account,
        } as any,
        {
          channel: 'email',
          payload: {
            email: 'referral@castcle.com',
            password: '12345678Aa',
            displayName: 'Referral',
            castcleId: 'referral',
          },
        } as RegisterByEmailDto,
        { ip: '127.0.0.1' }
      );
    });

    it('should create new account with email and new user with id ', async () => {
      const registerResponse = await controller.register(
        {
          $credential: guestAccount.credentialDocument,
          $account: guestAccount.accountDocument.account,
        } as any,
        {
          channel: 'email',
          referral: 'referral',
          payload: {
            email: 'reg2v2@castcle.com',
            password: '12345678Aa',
            displayName: 'reg2 v2',
            castcleId: 'reg2v2',
          },
        } as RegisterByEmailDto,
        { ip: '127.0.0.0' }
      );
      expect(registerResponse).toBeDefined();
      expect(registerResponse.accessToken).toBeDefined();
      expect(registerResponse.refreshToken).toBeDefined();
      expect(registerResponse.profile).toBeDefined();
      expect(registerResponse.pages).toBeDefined();
    });

    it('should get parent account referral count', async () => {
      const parentAccount = await authService._accountModel
        .findOne({
          _id: guestAccountParent.accountDocument._id,
        })
        .exec();

      expect(parentAccount).toBeDefined();
      expect(parentAccount.referralCount).toEqual(1);
    });

    it('should get account referral by parent', async () => {
      const parentAccount = await authService._accountModel
        .findOne({
          _id: guestAccount.accountDocument._id,
        })
        .exec();
      expect(parentAccount).toBeDefined();
      expect(String(parentAccount.referralBy)).toEqual(
        String(guestAccountParent.accountDocument._id)
      );
    });
    afterAll(() => {
      authService._accountModel.deleteMany({});
    });
  });

  describe('loginWithSocial', () => {
    let mockUsers: MockUserDetail[] = [];
    beforeAll(async () => {
      mockUsers = await generateMockUsers(4, 0, {
        accountService: authService,
        userService: userService,
      });
    });
    it('should create new account with new user by social ', async () => {
      const newCredentialGuest = {
        $credential: mockUsers[0].credential,
        $language: 'th',
      } as any;
      const result = await controller.loginWithSocial(
        newCredentialGuest,
        {
          provider: AccountAuthenIdType.Facebook,
          socialId: '109364223',
          displayName: 'test facebook',
          avatar: '',
          email: 'testfb@gmail.com',
          authToken: '',
        },
        { ip: '127.0.0.1', userAgent: 'castcle-app' }
      );
      const accountSocial = await authService.getAccountAuthenIdFromSocialId(
        '109364223',
        AccountAuthenIdType.Facebook
      );
      const activation = await authService.getAccountActivationFromCredential(
        newCredentialGuest.$credential
      );
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.profile.verified.email).toEqual(true);
      expect(result.profile.verified.social).toEqual(true);
      expect(accountSocial.socialId).toEqual('109364223');
      expect(activation).toBeDefined();
      expect(activation.activationDate).toBeDefined();
    });

    it('should create new account with generate castcle id', async () => {
      const newCredentialGuest = {
        $credential: mockUsers[1].credential,
        $language: 'th',
      } as any;

      await controller.loginWithSocial(
        newCredentialGuest,
        {
          provider: AccountAuthenIdType.Google,
          socialId: '109364223777',
        },
        { ip: '127.0.0.1', userAgent: 'castcle-app' }
      );
      const accountSocial = await authService.getAccountAuthenIdFromSocialId(
        '109364223777',
        AccountAuthenIdType.Google
      );
      const user = await userService.getUserAndPagesFromAccountId(
        accountSocial.account._id
      );

      expect(user).toBeDefined();
      expect(user[0].displayId).toEqual(mockUsers[1].user.displayId);
    });

    it('should get existing user and return', async () => {
      const newCredentialGuest = {
        $credential: mockUsers[2].credential,
        $language: 'th',
      } as any;
      const result = await controller.loginWithSocial(
        newCredentialGuest,
        {
          provider: AccountAuthenIdType.Facebook,
          socialId: '109364223',
          displayName: 'test facebook',
          avatar: '',
          email: 'testfb@gmail.com',
          authToken: '',
        },
        { ip: '127.0.0.1', userAgent: 'castcle-app' }
      );
      const accountSocial = await authService.getAccountAuthenIdFromSocialId(
        '109364223',
        AccountAuthenIdType.Facebook
      );

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(accountSocial.socialId).toEqual('109364223');
    });

    it('should return Exception when invalid use duplicate email', async () => {
      const newCredentialGuest = {
        $credential: mockUsers[3].credential,
        $language: 'th',
      } as any;

      await expect(
        controller.loginWithSocial(
          newCredentialGuest,
          {
            provider: AccountAuthenIdType.Twitter,
            socialId: '01234567892388',
            displayName: 'test twitter',
            avatar: '',
            email: 'testfb@gmail.com',
            authToken: '',
          },
          { ip: '127.0.0.1', userAgent: 'castcle-app' }
        )
      ).rejects.toEqual(new CastcleException(CastcleStatus.DUPLICATE_EMAIL));
    });
  });
});
