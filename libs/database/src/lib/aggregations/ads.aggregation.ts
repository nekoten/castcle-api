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

import { AdsAuctionAggregateDto } from '../dtos/ads.dto';
import { AdsBoostStatus, AdsObjective, AdsStatus } from '../models';

export const mockPipe2AdsAuctionAggregate = () => {
  const temp: AdsAuctionAggregateDto = {
    auctionPrice: 0.005,
    campaign: {
      _id: 'testId',
      objective: AdsObjective.Engagement,
      boostStatus: AdsBoostStatus.Running,
      status: AdsStatus.Approved,
      detail: {
        code: 'ADS001',
        dailyBudget: 1,
        duration: 2 * 24 * 60, //2 days = 2 * 24 * 60 minutes
        message: 'Test Please Follow me',
        name: 'Sompop',
      },
      statistics: {
        cpm: 0,
        dailySpent: 0,
        durationSpent: 0,
        engagements: {},
        impressions: 0,
        reaches: 0,
      },
      owner: {
        _id: 'mockAccountId',
      } as any,
      adsRef: {
        $ref: 'users',
        $id: 'testId',
      },
    } as any,
  };
  return temp;
};

export const pipe2AdsAuctionAggregate = mockPipe2AdsAuctionAggregate; //will change once proof aggregate
