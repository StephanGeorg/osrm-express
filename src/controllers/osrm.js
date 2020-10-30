import { Joi } from 'celebrate';
import HTTPStatus from 'http-status';

import osrmService from '../services/osrm';

import ExtError, { extendError } from '../utils/error/error';

const parseCoordinates = (query = '') => query
  .toString()
  .split(';')
  .map((coordinates) => coordinates.split(',')
    .map((coordinate) => Number(coordinate)));

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
    coordinates: parseCoordinates(params[4]),
  };
};

export default {
  validate: {
    reqOSRM: {
      params: { },
    },
  },

  /**
   *  Get a particular user
   */
  async reqOSRM(req, res, next) {
    const { query } = req;
    const reqPath = req.path;
    let options = {};
    try {
      const params = urlParser(reqPath);
      options = {
        ...query,
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
