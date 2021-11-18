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

import { Environment } from '@castcle-api/environments';
import { CastLogger, CastLoggerOptions } from '@castcle-api/logger';
import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';
import { TwillioChannel } from './twillio.message';
@Injectable()
export class TwillioClient {
  private readonly env = {
    twilioAccountSid: Environment.twilio_account_sid
      ? Environment.twilio_account_sid
      : 'ACd501e',
    twilioAuthToken: Environment.twilio_auth_token
      ? Environment.twilio_auth_token
      : 'secrect',
    twilioOtpSid: Environment.twilio_otp_sid
      ? Environment.twilio_otp_sid
      : 'VA356353'
  };

  private readonly logger = new CastLogger(
    TwillioClient.name,
    CastLoggerOptions
  );

  private readonly client = new Twilio.Twilio(
    this.env.twilioAccountSid,
    this.env.twilioAuthToken
  );

  async requestOtp(receiver: string, channel: TwillioChannel) {
    return this.client.verify
      .services(this.env.twilioOtpSid)
      .verifications.create({
        to: receiver,
        channel: channel
      })
      .then((verification) => {
        return verification;
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async verifyOtp(receiver: string, otp: string) {
    return this.client.verify
      .services(this.env.twilioOtpSid)
      .verificationChecks.create({ to: receiver, code: otp })
      .then((verification) => {
        return verification;
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
}