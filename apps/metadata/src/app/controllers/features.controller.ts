import { Configs } from '@castcle-api/environments';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiHeader, ApiOkResponse } from '@nestjs/swagger';
import { FeatureService } from '@castcle-api/database';
import { CastLogger } from '@castcle-api/logger';
import {
  FeatureResponse,
  DEFAULT_FEATURE_QUERY_OPTIONS,
} from '@castcle-api/database/dtos';
import { SortByPipe } from '@castcle-api/utils/pipes';

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
@ApiOkResponse({
  type: FeatureResponse,
})
@Controller()
export class FeaturesController {
  private logger = new CastLogger(FeaturesController.name);

  constructor(private featureService: FeatureService) {}
  @Get('feature')
  async getAllFeature(
    @Query('sortBy', SortByPipe)
    sortByOption = DEFAULT_FEATURE_QUERY_OPTIONS.sortBy
  ): Promise<FeatureResponse> {
    this.logger.log('Start get all features');
    const result = await this.featureService.getAll({
      sortBy: sortByOption,
    });
    this.logger.log('Success get all features');
    return {
      payload: result.map((feature) => feature.toFeaturePayload()),
    };
  }
}
