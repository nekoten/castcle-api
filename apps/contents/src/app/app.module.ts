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

import { Module } from '@nestjs/common';
import { ContentController } from './app.controller';
import { CommentController } from './controllers/comment.controller';
import { UtilsCacheModule } from '@castcle-api/utils/cache';
import { DatabaseModule } from '@castcle-api/database';
import {
  AwsXRayInterceptor,
  UtilsInterceptorsModule,
} from '@castcle-api/utils/interceptors';
import { UtilsQueueModule } from '@castcle-api/utils/queue';
import { UtilsPipesModule } from '@castcle-api/utils/pipes';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppService } from './app.service';
import { CaslModule } from '@castcle-api/casl';
import { HealthyModule } from '@castcle-api/healthy';
import { Environment } from '@castcle-api/environments';
import { TracingModule } from '@narando/nest-xray';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { CastcleThrottlerGuard } from '@castcle-api/utils/exception';

@Module({
  imports: [
    DatabaseModule,
    CaslModule,
    HealthyModule,
    UtilsInterceptorsModule,
    UtilsQueueModule,
    UtilsCacheModule,
    UtilsPipesModule,
    ThrottlerModule.forRoot({
      ttl: Environment.RATE_LIMIT_TTL,
      limit: Environment.RATE_LIMIT_LIMIT,
    }),
    TracingModule.forRoot({
      serviceName: 'contents',
      daemonAddress: Environment.AWS_XRAY_DAEMON_ADDRESS,
    }),
  ],
  controllers: [ContentController, CommentController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CastcleThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AwsXRayInterceptor,
    },
  ],
})
export class ContentModule {}
