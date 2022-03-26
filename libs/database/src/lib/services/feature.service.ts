import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeaturePayloadDto } from '../dtos';
import { Feature } from '../schemas';

@Injectable()
export class FeatureService {
  constructor(@InjectModel('Feature') public _featureModel: Model<Feature>) {}

  /**
   * get all data from feature Document
   *
   * @returns {Feature[]} return all feature Document
   */
  async getAll() {
    // console.log(options);
    const query = this._featureModel.find();
    return query.exec();
  }

  /**
   * create new feature
   * @param {FeaturePayloadDto} feature feature payload
   * @returns {Feature} return new feature document
   */
  async create(feature: FeaturePayloadDto) {
    const createResult = await new this._featureModel(feature).save();
    return createResult;
  }
}
