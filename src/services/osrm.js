import config from 'config';
import OSRM from 'osrm';
import HTTPStatus from 'http-status';

import ExtError from '../utils/error/error';

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

export default {
  /**
   * Initialize the OSRM instances
   */
  init() {
    const data = config.get('osrm.data');
    console.log({ data });
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
    const profileSets = instances.filter((instance) => instance.profile === profile);
    for (let i = 0; i < profileSets.length; i++) {
      const instance = profileSets[i];
      if (Number.isFinite(longitude) && instance.longitude) {
        if (validateLongitudeRule(longitude, instance.longitude)) return instance;
      } else return instance;
    }
    return null;
  },

  /**
   * Perform the OSRM call based on the data-source
   * @param {*} options
   */
  req(options = {}) {
    return new Promise((resolve, reject) => {
      const { profile, service } = options;
      const dataSet = this.getDataSet(options);
      if (!dataSet) throw new ExtError(`Profile ${profile} not available`, { statusCode: HTTPStatus.BAD_REQUEST, logType: 'warn' });
      const params = { ...options };
      dataSet.instance[service](params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },
};
