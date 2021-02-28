import HTTPStatus from 'http-status';

import osrmService from '../../../services/osrm';

import ExtError from '../../../utils/error/error';

export default (req, res, next) => {
  const { params } = req;
  const { service, version, profile } = params;

  if (!['nearest', 'route', 'table', 'match', 'trip', 'tile'].includes(service)) {
    throw new ExtError('InvalidService', { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' });
  }

  if (version !== 'v1') {
    throw new ExtError('InvalidVersion', { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' });
  }

  console.log({ profile });
  console.log(osrmService.getProfiles().includes(profile));

  if (!osrmService.getProfiles().includes(profile)) {
    throw new ExtError('InvalidOptions', { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' });
  }
  next();
};
