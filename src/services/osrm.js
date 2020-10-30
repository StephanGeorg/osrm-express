import config from 'config';
import OSRM from 'osrm';

const osrmInstances = [];

export default {
  init() {
    const data = config.get('osrm.data');
    data.forEach((dataSet) => {
      osrmInstances.push(
        new OSRM(dataSet),
      );
    });
  },

  req(path, params) {
    return new Promise((resolve, reject) => {
      const osrm = osrmInstances[0];
      console.log({ osrmInstances });
      const params = { coordinates: [[13.438640, 52.519930], [13.415852, 52.513191]] };
      osrm.route(params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },
};
