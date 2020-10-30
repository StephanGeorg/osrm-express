import { Joi } from 'celebrate';
import HTTPStatus from 'http-status';

import UsersService from '../services/users';

import ExtError, { extendError } from '../utils/error/error';

export default {
  validate: {
    getUser: {
      params: { userId: Joi.string().required() },
    },
    createUser: {
      body: {
        name: Joi.string().required(),
        email: Joi.string().email(),
      },
    },
    updateUser: {
      body: {
        name: Joi.string().required(),
        email: Joi.string().email(),
      },
    },
  },

  /**
   *  List all available users
   */
  async listUsers(req, res, next) {
    try {
      const users = await UsersService.listUsers();
      res.status(HTTPStatus.OK);
      res.json(users);
    } catch (error) {
      next(extendError(error, { task: 'Controller/listUsers' }));
    }
  },

  /**
   *  Get a particular user
   */
  async getUser(req, res, next) {
    const { userId } = req.params;
    try {
      const user = await UsersService.getUser(userId);
      if (user) res.json(user);
      else throw new ExtError('User not found!', { statusCode: HTTPStatus.NOT_FOUND, logType: 'warn' });
    } catch (error) {
      next(extendError(error, { task: 'Controller/getUser', context: { userId } }));
    }
  },

  /**
   *  Create a new user
   */
  async createUser(req, res, next) {
    const { body } = req;
    try {
      await UsersService.createUser({ ...body });
      res.status(HTTPStatus.CREATED);
      res.json({ success: true });
    } catch (error) {
      next(extendError(error, { task: 'Controller/createUser', context: { body } }));
    }
  },

  /**
   *  Create a new user
   */
  async updateUser(req, res, next) {
    const { userId } = req.params;
    const { body } = req;
    try {
      await UsersService.updateUser(userId, { ...body });
      res.json({ success: true });
    } catch (error) {
      next(extendError(error, { task: 'Controller/updateUser', context: { body } }));
    }
  },
};
