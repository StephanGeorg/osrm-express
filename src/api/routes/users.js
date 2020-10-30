import express from 'express';
import { celebrate } from 'celebrate';

import usersController from '../../controllers/users';

const router = express.Router({
  mergeParams: true,
});

/**
 *  List all users
 */
router.get(
  '/list',
  async (req, res, next) => {
    await usersController.listUsers(req, res, next);
  },
);

/**
 *  Get user by id
 */
router.get(
  '/get/:userId',
  celebrate(usersController.validate.getUser),
  async (req, res, next) => {
    await usersController.getUser(req, res, next);
  },
);

/**
 *  Create a new user
 */
router.post(
  '/create',
  celebrate(usersController.validate.createUser),
  async (req, res, next) => {
    await usersController.createUser(req, res, next);
  },
);

/**
 *  Update a particular user
 */
router.patch(
  '/update/:userId',
  celebrate(usersController.validate.updateUser),
  async (req, res, next) => {
    await usersController.updateUser(req, res, next);
  },
);

export default router;
