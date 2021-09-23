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
  NotificationProducer,
  UtilsQueueModule
} from '@castcle-api/utils/queue';
import { Global, Module } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { env } from './environment';
import { AccountSchemaFactory } from './schemas/account.schema';
import { AccountActivationSchema } from './schemas/accountActivation.schema';
import { ContentSchemaFactory } from './schemas/content.schema';
import { CredentialSchemaFactory } from './schemas/credential.schema';
import { EngagementSchemaFactory } from './schemas/engagement.schema';
import { FeedItemSchemaFactory } from './schemas/feedItem.schema';
import { LanguageSchema } from './schemas/language.schema';
import { NotificationSchema } from './schemas/notification.schema';
import { OtpSchema } from './schemas/otp.schema';
import { RelationshipSchemaFactory } from './schemas/relationship.schema';
import { RevisionchemaFactory } from './schemas/revision.schema';
import { UserSchemaFactory } from './schemas/user.schema';
import { UxEngagementSchema } from './schemas/uxengagement.schema';
import { AuthenticationService } from './services/authentication.service';
import { ContentService } from './services/content.service';
import { LanguageService } from './services/language.service';
import { NotificationService } from './services/notification.service';
import { RankerService } from './services/ranker.service';
import { UserService } from './services/user.service';
import { UxEngagementService } from './services/uxengagement.service';

export const MongooseForFeatures = MongooseModule.forFeature([
  { name: 'AccountActivation', schema: AccountActivationSchema },
  { name: 'Otp', schema: OtpSchema },
  { name: 'UxEngagement', schema: UxEngagementSchema },
  { name: 'Notification', schema: NotificationSchema },
  { name: 'Language', schema: LanguageSchema }
]);

export const MongooseAsyncFeatures = MongooseModule.forFeatureAsync([
  { name: 'Credential', useFactory: CredentialSchemaFactory },
  { name: 'Relationship', useFactory: RelationshipSchemaFactory },
  { name: 'Revision', useFactory: RevisionchemaFactory },
  {
    name: 'FeedItem',
    useFactory: FeedItemSchemaFactory
  },
  {
    name: 'Content',
    useFactory: ContentSchemaFactory,
    inject: [
      getModelToken('Revision'),
      getModelToken('FeedItem'),
      getModelToken('User'),
      getModelToken('Relationship')
    ]
  },
  {
    name: 'Account',
    useFactory: AccountSchemaFactory,
    inject: [getModelToken('Credential'), getModelToken('User')]
  },
  {
    name: 'User',
    useFactory: UserSchemaFactory,
    inject: [getModelToken('Relationship')]
  },
  {
    name: 'Engagement',
    useFactory: EngagementSchemaFactory,
    inject: [getModelToken('Content')]
  }
]);

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(env.db_uri, env.db_options),
    MongooseAsyncFeatures,
    MongooseForFeatures,
    UtilsQueueModule
  ],
  controllers: [],
  providers: [
    AuthenticationService,
    UserService,
    ContentService,
    UxEngagementService,
    NotificationService,
    RankerService,
    NotificationProducer,
    LanguageService
  ],
  exports: [
    AuthenticationService,
    UserService,
    ContentService,
    UxEngagementService,
    NotificationService,
    RankerService,
    LanguageService
  ]
})
export class DatabaseModule {}

export {
  AuthenticationService,
  UserService,
  ContentService,
  UxEngagementService,
  NotificationService,
  RankerService,
  LanguageService
};
