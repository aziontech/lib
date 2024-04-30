import * as photonLib from './lib/index';

type Photon = typeof photonLib;

const photon: Partial<Photon> = {
  ...photonLib,
};

export default photon;
