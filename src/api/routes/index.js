import express from 'express';
import { celebrate } from 'celebrate';

import osrmController from '../../controllers/osrm';

const router = express.Router({
  mergeParams: true,
});

/**
 *  Get user by id
 */
router.get(
  '/*',
  // celebrate(osrmController.validate.reqOSRM),
  async (req, res, next) => {
    await osrmController.reqOSRM(req, res, next);
  },
);

export default router;
