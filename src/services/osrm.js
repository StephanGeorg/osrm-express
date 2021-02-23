import config from 'config';
import OSRM from 'osrm';
import HTTPStatus from 'http-status';

import ExtError, { extendError } from '../utils/error/error';

const osrmInstances = [];

const validateLongitudeRule = (longitude, rule = {}) => {
  const { value, compare } = rule;
  switch (compare) {
    case 'gt': return longitude > value;
    case 'gte': return longitude >= value;
    case 'lt': return longitude < value;
    case 'lte': return longitude <= value;
    default: return false;
  }
};

const getStatus = (result, error) => {
  if (result) return 'Ok';
  switch (error.message) {
    case 'test': return 'test';
    case 'Impossible route between points': return 'NoRoute';
    default: return 'error';
  }
};

export default {
  /**
   * Initialize the OSRM instances
   */
  init() {
    const data = config.get('osrm.data');
    data.forEach((dataSet) => {
      osrmInstances.push({
        ...dataSet,
        instance: new OSRM(dataSet),
      });
    });
  },

  /**
   * Getter for OSRM instances array
   */
  getInstances() {
    return osrmInstances;
  },

  /**
   * Getter for profile types
   */
  getProfiles() {
    const instances = this.getInstances();
    return instances.map((instance) => instance.profile);
  },

  /**
   * Get data-set based on service, profile and conditions
   * @param {*} options
   */
  getDataSet(options = {}) {
    const { profile, coordinates } = options;
    const longitude = coordinates[0][0];
    const instances = this.getInstances();
    const profileSets = instances.filter((instance = {}) => instance.profile === profile);
    for (let i = 0; i < profileSets.length; i++) {
      const instance = profileSets[i];
      if (Number.isFinite(longitude) && instance.longitude) {
        if (validateLongitudeRule(longitude, instance.longitude)) return instance;
      } else return instance;
    }
    return null;
  },

  reqTile(dataSet, xyz) {
    return new Promise((resolve, reject) => {
      dataSet.instance.tile(xyz, (err, result) => {
        const code = getStatus(result, err);
        if (err) {
          // errors are 400 errors
          reject(new ExtError(
            err.message,
            { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' },
          ));
          return;
        }
        resolve({
          code,
          ...result,
        });
      });
    });
  },

  reqDefault(dataSet, service = '', params = {}) {
    return new Promise((resolve, reject) => {
      dataSet.instance[service](params, (err, result) => {
        const code = getStatus(result, err);
        if (err) {
          // errors are 400 errors
          reject(new ExtError(
            err.message,
            { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' },
          ));
          return;
        }
        resolve({
          code,
          ...result,
        });
      });
    });
  },

  /**
   * Check if route contains more than one dataset
   * @param {object} options
   */
  validatePossibleRoute(options = {}) {
    const { profile, coordinates } = options;
    const instances = this.getInstances();
    const profileSets = instances.filter((instance = {}) => instance.profile === profile);
    const usedDatasets = [];
    coordinates.forEach((coordinate) => {
      const [longitude] = coordinate;
      for (let i = 0; i < profileSets.length; i++) {
        const instance = profileSets[i];
        const { path, dataset_name } = instance; // eslint-disable-line camelcase
        const name = dataset_name || path; // eslint-disable-line camelcase
        if (Number.isFinite(longitude) && instance.longitude) {
          if (validateLongitudeRule(longitude, instance.longitude)) usedDatasets.push(name);
        }
      }
    });
    const unique = [...new Set(usedDatasets)];
    return unique.length === 1;
  },

  /**
   * Perform the OSRM call based on the data-source
   * @param {*} options
   */
  async req(params = {}) {
    const { profile, service } = params;

    // Check if route is possible
    if (!this.validatePossibleRoute(params)) {
      const err = new ExtError(
        'Impossible route between points',
        { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' },
      );
      throw extendError(err, { code: getStatus(null, err) });
    }

    const dataSet = this.getDataSet(params);
    if (!dataSet) {
      throw new ExtError(
        `Profile ${profile} not available`,
        { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' },
      );
    }
    if (service === 'tile') return this.reqTile(dataSet, params.coordinates);
    return this.reqDefault(dataSet, service, params);
  },
};
