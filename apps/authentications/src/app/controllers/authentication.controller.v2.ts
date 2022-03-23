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
import { AnalyticService, AuthenticationService } from '@castcle-api/database';
import { CastLogger } from '@castcle-api/logger';
import { Host } from '@castcle-api/utils/commons';
import {
  CastcleBasicAuth,
  CastcleController,
  CastcleTrack,
  RequestMeta,
  RequestMetadata,
} from '@castcle-api/utils/decorators';
import {
  CastcleException,
  CastcleStatus,
  ErrorMessages,
} from '@castcle-api/utils/exception';
import {
  CredentialInterceptor,
  CredentialRequest,
} from '@castcle-api/utils/interceptors';
import {
  Body,
  HttpException,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';

import { AppService } from '../app.service';
import {
  LoginResponse,
  RegisterByEmailDto,
  SocialConnectDto,
} from '../dtos/dto';

@CastcleController({ path: 'authentications', version: '2.0' })
export class AuthenticationControllerV2 {
  constructor(
    private analyticService: AnalyticService,
    private appService: AppService,
    private authService: AuthenticationService
  ) {}

  private logger = new CastLogger(AuthenticationControllerV2.name);

  @UseInterceptors(CredentialInterceptor)
  @Post('register')
  async register(
    @Req() req: CredentialRequest,
    @Body() body: RegisterByEmailDto,
    @RequestMeta() { ip }: RequestMetadata
  ) {
    this.logger.log(`Register channel ${body.channel}`);
    if (body.channel !== 'email') {
      throw new CastcleException(
        CastcleStatus.PAYLOAD_CHANNEL_MISMATCH,
        req.$language
      );
    }

    this.logger.log('Check current account.');
    const currentAccount = await this.authService.getAccountFromCredential(
      req.$credential
    );

    if (
      currentAccount &&
      currentAccount.email &&
      currentAccount.email === body.payload.email
    )
      throw new CastcleException(
        CastcleStatus.EMAIL_OR_PHONE_IS_EXIST,
        req.$language
      );

    this.logger.log('Check email or phone is exist.');
    console.log(body.payload.email);
    if (await this.authService.getAccountFromEmail(body.payload.email))
      throw new CastcleException(
        CastcleStatus.EMAIL_OR_PHONE_IS_EXIST,
        req.$language
      );

    this.logger.log('Validation email.');
    if (!this.authService.validateEmail(body.payload.email))
      throw new CastcleException(CastcleStatus.INVALID_EMAIL, req.$language);

    this.logger.log('Check castcleId is exist.');
    const user = await this.authService.getExistedUserFromCastcleId(
      body.payload.castcleId
    );

    if (user) throw new CastcleException(CastcleStatus.USER_ID_IS_EXIST);

    this.logger.log('Validation password.');
    this.appService.validatePassword(body.payload.password, req.$language);

    this.logger.log('Register with email.');
    const accountActivation = await this.authService.signupByEmail(
      currentAccount,
      {
        displayId: body.payload.castcleId,
        displayName: body.payload.displayName,
        email: body.payload.email,
        password: body.payload.password,
        referral: body.referral,
        ip,
      }
    );

    await Promise.all([
      this.logger.log('Track registration.'),
      await this.analyticService.trackRegistration(ip, currentAccount._id),
      this.logger.log(
        `Send email with token. ${accountActivation.verifyToken}`
      ),
      await this.appService.sendRegistrationEmail(
        Host.getHostname(req),
        body.payload.email,
        accountActivation.verifyToken
      ),
    ]);

    //TODO !!! Need to improve this performance
    req.$credential.account.isGuest = false;

    this.logger.log('Get payload access token.');
    const accessTokenPayload =
      await this.authService.getAccessTokenPayloadFromCredential(
        req.$credential
      );

    this.logger.log('Get profile and renew token.');
    const [userProfile, renewToken] = await Promise.all([
      this.appService.getUserProfile(req.$credential),
      req.$credential.renewTokens(accessTokenPayload, {
        id: currentAccount._id as unknown as string,
      }),
    ]);
    return {
      profile: userProfile.profile
        ? await userProfile.profile.toUserResponse()
        : null,
      pages: userProfile.pages
        ? userProfile.pages.items.map((item) => item.toPageResponse())
        : null,
      accessToken: renewToken.accessToken,
      refreshToken: renewToken.refreshToken,
    } as LoginResponse;
  }

  @CastcleBasicAuth()
  @UseInterceptors(CredentialInterceptor)
  @CastcleTrack()
  @Post('login-with-social')
  async loginWithSocial(
    @Req() req: CredentialRequest,
    @Body() body: SocialConnectDto,
    @RequestMeta() { ip, userAgent }: RequestMetadata
  ) {
    this.logger.log(`login with social: ${JSON.stringify(body)}`);

    const { token, users, account, isNewUser } =
      await this.appService.socialLogin(body, req, { ip, userAgent });

    if (isNewUser) {
      await this.analyticService.trackRegistration(ip, userAgent);
    }

    if (!token) {
      this.logger.log(`response merge account.`);
      const error = ErrorMessages[CastcleStatus.DUPLICATE_EMAIL];
      throw new HttpException(
        {
          ...error,
          ...{
            payload: {
              profile: users.profile
                ? await users.profile.toUserResponse({
                    passwordNotSet: account.password ? false : true,
                  })
                : null,
            },
          },
        },
        400
      );
    }

    return {
      profile: users.profile
        ? await users.profile.toUserResponse({
            passwordNotSet: account.password ? false : true,
          })
        : null,
      pages: users.pages
        ? users.pages.items.map((item) => item.toPageResponse())
        : null,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    } as LoginResponse;
  }
}
