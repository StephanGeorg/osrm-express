import { Joi } from 'celebrate';
import HTTPStatus from 'http-status';

import osrmService from '../services/osrm';

import ExtError, { extendError } from '../utils/error/error';
import { isLat, isLng } from '../utils/helper/num';

/**
 * Parse query params based on service
 * @param {*} query
 */
const queryParser = (query = {}) => {
  const finalQuery = { ...query };
  if (query.annotations) finalQuery.annotations = query.annotations.split(',');
  return {
    ...finalQuery,
  };
};

/**
 * Validate coordinates based on service
 * @param {Array} coordinates
 * @param {String} service
 */
const validateCoordinates = (coordinates = [], service = '') => {
  if (!Array.isArray(coordinates) || coordinates.length < 1) {
    throw new ExtError(
      'Coordinates must be an array of (lon/lat) pairs',
      { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' },
    );
  }
  // Check if all coordinate pairs are valid
  coordinates.forEach((coordinate) => {
    if (coordinate.length < 2) {
      throw new ExtError(
        'Coordinates must be an array of (lon/lat) pairs',
        { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' },
      );
    }
    if (!isLng(coordinate[0] || !isLat(coordinate[1]))) {
      throw new ExtError(
        'Coordinates must be an array of (lon/lat) pairs',
        { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' },
      );
    }
  });
  // Check coordinates length
  if (service === 'nearest') {
    if (coordinates.length !== 1) {
      throw new ExtError(
        'Exactly one coordinate pair must be provided',
        { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' },
      );
    }
  }
};

/**
 * Parse coordinates parameter
 * @param {*} query
 */
const coordinatesParser = (query = '') => query
  .toString()
  .split(';')
  .map((coordinates) => coordinates.split(',')
    .map((coordinate) => Number(coordinate)));

export default {
  validate: {
    reqOSRM: {
      params: Joi.object().keys({
        service: Joi.string().valid('nearest', 'route', 'table', 'match', 'trip', 'tile').required(),
        version: Joi.string().valid('v1').required(),
        profile: Joi.string().valid(...osrmService.getProfiles()).required(),
        coordinates: Joi.string().custom(coordinatesParser).required(),
      }),
    },
  },

  /**
   * Perform the OSRM call
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async reqOSRM(req, res, next) {
    const { query, params } = req;
    const { coordinates, service } = params;
    const finalQuery = queryParser(query);
    const reqPath = req.path;
    let options = {};
    try {
      validateCoordinates(coordinates, service);
      options = {
        ...finalQuery,
        ...params,
      };
      const result = await osrmService.req(options);
      if (result) res.json(result);
      else throw new ExtError('User not found!', { statusCode: HTTPStatus.NOT_FOUND, logType: 'warn' });
    } catch (error) {
      next(extendError(error, { task: 'osrmController/req', context: { reqPath, query, options } }));
    }
  },
};
