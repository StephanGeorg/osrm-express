import { Joi } from 'celebrate';
import HTTPStatus from 'http-status';

import osrmService from '../services/osrm';

import ExtError, { extendError } from '../utils/error/error';

/**
 * Parse query params based on service
 * @param {*} query
 */
const queryParser = (query = {}) => {
  const { annotations = '' } = query;
  return {
    ...query,
    annotations: annotations.split(','),
  };
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

/**
 * Parse URL params
 * @param {*} path
 */
const urlParser = (path) => {
  const pathRegex = /^\/([a-z0-9]*)\/([a-z0-9]*)\/([a-z0-9]*)\/(.*)/gi;
  const params = pathRegex.exec(path);
  if (!params || params.length !== 5) {
    throw new ExtError('Bad request!', { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' });
  }
  return {
    service: params[1],
    version: params[2],
    profile: params[3],
    coordinates: coordinatesParser(params[4]),
  };
};

export default {
  validate: {
    reqOSRM: {
      params: { },
    },
  },

  /**
   * Perform the OSRM call
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async reqOSRM(req, res, next) {
    const { query } = req;
    const finalQuery = queryParser(query);
    const reqPath = req.path;
    let options = {};
    try {
      const params = urlParser(reqPath);
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
