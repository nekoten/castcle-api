import { Configs } from '@castcle-api/environments';
import { Controller, Get, UseInterceptors, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOkResponse } from '@nestjs/swagger';
import { FeatureService } from '@castcle-api/database';
import { CastLogger } from '@castcle-api/logger';
import {
  CredentialInterceptor,
  IpTrackerInterceptor,
} from '@castcle-api/utils/interceptors';
// import { CastcleTrack } from '@castcle-api/utils/decorators';
import { FeatureResponse } from '@castcle-api/database/dtos';
// import { CacheKeyName } from '@castcle-api/utils/cache';
// import { GuestInterceptor } from './interceptors/guest.interceptor';
@ApiHeader({
  name: Configs.RequiredHeaders.AcceptLanguage.name,
  description: Configs.RequiredHeaders.AcceptLanguage.description,
  example: Configs.RequiredHeaders.AcceptLanguage.example,
  required: true,
})
@ApiHeader({
  name: Configs.RequiredHeaders.AcceptVersion.name,
  description: Configs.RequiredHeaders.AcceptVersion.description,
  example: Configs.RequiredHeaders.AcceptVersion.example,
  required: true,
})
@Controller({
  version: '1.0',
})
@Controller()
export class FeaturesController {
  private logger = new CastLogger(FeaturesController.name);

  constructor(private featureService: FeatureService) {}
  @ApiBearerAuth()
  @ApiOkResponse({
    type: FeatureResponse,
  })
  @UseInterceptors(CredentialInterceptor) //is user credential?
  @UseInterceptors(IpTrackerInterceptor) //is guest credential?
  @Get('feature')
  @HttpCode(200)
  async getAllFeature(): Promise<FeatureResponse> {
    this.logger.log('Start get all features');
    const result = await this.featureService.getAll();
    this.logger.log('Success get all features');

    return {
      message: 'success',
      payload: result.map((feature) => feature.toFeaturePayload()),
    };
  }
}
