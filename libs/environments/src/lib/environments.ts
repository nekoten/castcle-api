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

import * as dotenv from 'dotenv';
import { MongooseOptions } from 'mongoose';
import { Configs } from './configs';

const env = dotenv.config();

if (!env) throw new Error('Env not found!');

export class Environment {
  static PRODUCTION = process.env.NODE_ENV === 'production';
  static NODE_ENV = process.env.NODE_ENV;
  static PORT = process.env.PORT;

  // Database
  private static DB_USERNAME = process.env.DB_USERNAME;
  private static DB_PASSWORD = process.env.DB_PASSWORD;
  private static DB_AUTHENTICATION =
    Environment.DB_USERNAME && Environment.DB_PASSWORD
      ? `${Environment.DB_USERNAME}:${Environment.DB_PASSWORD}@`
      : '';
  private static DB_HOST = process.env.DB_HOST || 'localhost';
  private static DB_USE_LOCAL = Environment.DB_HOST === 'localhost';
  private static DB_FORMAT = `mongodb${Environment.DB_USE_LOCAL ? '' : '+srv'}`;
  private static DB_DATABASE_NAME = process.env.DB_DATABASE_NAME || '';
  static DB_URI = `${Environment.DB_FORMAT}://${Environment.DB_AUTHENTICATION}${Environment.DB_HOST}/${Environment.DB_DATABASE_NAME}?retryWrites=true&w=majority`;
  static DB_OPTIONS: MongooseOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Mail Service
  static SMTP_ADMIN_EMAIL = process.env.SMTP_ADMIN_EMAIL;
  static SMTP_USERNAME = process.env.SMTP_USERNAME;
  static SMTP_PASSWORD = process.env.SMTP_PASSWORD;
  static SMTP_HOST = process.env.SMTP_HOST;
  static SMTP_PORT = Number(process.env.SMTP_PORT) || 465;

  // JWT
  static JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
  static JWT_ACCESS_EXPIRES_IN =
    Number(process.env.JWT_ACCESS_EXPIRES_IN) || 6001;
  static JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || 'refresh-secret';
  static JWT_REFRESH_EXPIRES_IN =
    Number(process.env.JWT_REFRESH_EXPIRES_IN) || 18000;
  static JWT_VERIFY_SECRET = process.env.JWT_VERIFY_SECRET || 'verify-secret';
  static JWT_VERIFY_EXPIRES_IN =
    Number(process.env.JWT_VERIFY_EXPIRES_IN) || 6002;
  static JWT_SIGNATURE_SECRET = process.env.JWT_SIGNATURE_SECRET;
  static JWT_SIGNATURE_EXPIRES_IN = Number(
    process.env.JWT_SIGNATURE_EXPIRES_IN
  );

  // Cloudfront
  static CLOUDFRONT_ACCESS_KEY_ID = process.env.CLOUDFRONT_ACCESS_KEY_ID;
  static CLOUDFRONT_PRIVATE_KEY = process.env.CLOUDFRONT_PRIVATE_KEY;

  // Redis
  static REDIS_HOST = process.env.REDIS_HOST;
  static REDIS_PORT = Number(process.env.REDIS_PORT);

  // Assets
  static ASSETS_BUCKET_NAME = process.env.ASSETS_BUCKET_NAME;
  static ASSETS_HOST =
    process.env.ASSETS_HOST || 'https://assets-dev.castcle.com';

  // Twitter Config
  static TWITTER_KEY = process.env.TWITTER_KEY;
  static TWITTER_SECRET_KEY = process.env.TWITTER_SECRET_KEY;
  static TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
  static TWITTER_HOST = process.env.TWITTER_HOST;

  // Otp
  /**
   * Display otp digits
   * @default 8
   */
  static OTP_DIGITS = Number(process.env.OTP_DIGITS) || 8;
  /**
   * second for otp to expire
   * @default 60 seconds
   */
  static OTP_EXPIRES_IN = Number(process.env.OTP_EXPIRES_IN) || 60;

  // Firebase
  static FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  static FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
  static FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;

  // HTTP
  static HTTP_TIME_OUT = Number(process.env.HTTP_TIME_OUT);

  // Facebook
  static FACEBOOK_HOST = process.env.FB_HOST;
  static FACEBOOK_CLIENT_ID = process.env.FB_CLIENT_ID;
  static FACEBOOK_CLIENT_SECRET = process.env.FB_CLIENT_SECRET;
  static FACEBOOK_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

  // Telegram
  static TELEGRAM_BOT_TOKEN = process.env.TG_BOT_TOKEN;

  // Apple
  static APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
  static APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
  static APPLE_KEY_IDENTIFIER = process.env.APPLE_KEY_IDENTIFIER;
  static APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY;

  // Twilio
  static TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  static TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  static TWILIO_OTP_SID = process.env.TWILIO_OTP_SID;
  static TWILIO_COUNTRY_CODE = process.env.TWILIO_COUNTRY_CODE;

  // Youtube
  static YOUTUBE_VERIFY_TOKEN = process.env.YOUTUBE_VERIFY_TOKEN;
  static YOUTUBE_WEBHOOK_CALLBACK = process.env.YOUTUBE_WEBHOOK_CALLBACK;

  // ip-api
  static IP_API_URL = process.env.IP_API_URL || 'https://ip-api.com/json';
  static IP_API_KEY = process.env.IP_API_KEY || null;

  // Google
  static GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  static GOOGLE_SECRET = process.env.GOOGLE_SECRET;

  // Feed Setting
  static AUTO_CREATE_GUEST_FEED = process.env.AUTO_CREATE_GUEST_FEED === '1';
  static FEED_FOLLOW_MAX = Number(
    process.env.FEED_FOLLOW_MAX || Configs.Feed.FollowFeedMax
  );
  static FEED_FOLLOW_RATIO = Number(
    process.env.FEED_FOLLOW_RATIO || Configs.Feed.FollowFeedRatio
  );
  static FEED_DECAY_DAYS = Number(
    process.env.FEED_DECAY_DAYS || Configs.Feed.DecayDays
  );
  static FEED_DUPLICATE_MAX = Number(
    process.env.FEED_DUPLICATE_MAX || Configs.Feed.DuplicateContentMax
  );

  // Links
  static LINK_INVITE_FRIENDS = process.env.LINK_INVITE_FRIENDS;
  static LINK_VERIFIED_EMAIL = process.env.LINK_VERIFIED_EMAIL;

  /**
   * Number of digits after the decimal point
   * @default 8
   */
  static DECIMALS_FLOAT = Number(process.env.DECIMALS_FLOAT || 8);

  // DS Service
  static DS_SERVICE_BASE_URL = process.env.DS_SERVICE_BASE_URL;

  static RATE_LIMIT_TTL = Number(process.env.RATE_LIMIT_TTL) || 300;
  static RATE_LIMIT_LIMIT = Number(process.env.RATE_LIMIT_LIMIT) || 200;
  static RATE_LIMIT_OTP_TTL = Number(process.env.RATE_LIMIT_OTP_TTL) || 300;
  static RATE_LIMIT_OTP_LIMT = Number(process.env.RATE_LIMIT_OTP_LIMIT) || 200;

  // AWS Xray
  static AWS_XRAY_DAEMON_ADDRESS = process.env.AWS_XRAY_DAEMON_ADDRESS;

  //RECAPCHA
  static RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY || 'asdsd';
  static RECAPTCHA_PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID || 'asdasd';
  static RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY || '1asdasd';
}
