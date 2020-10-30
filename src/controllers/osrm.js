import { Joi } from 'celebrate';
import HTTPStatus from 'http-status';

import osrmService from '../services/osrm';

import ExtError, { extendError } from '../utils/error/error';

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
    const { params } = req;
    const reqPath = req.path;
    try {
      const result = await osrmService.req(reqPath, params);
      if (result) res.json(result);
      else throw new ExtError('User not found!', { statusCode: HTTPStatus.NOT_FOUND, logType: 'warn' });
    } catch (error) {
      next(extendError(error, { task: 'Controller/getUser', context: { reqPath, params } }));
    }
  },
};
