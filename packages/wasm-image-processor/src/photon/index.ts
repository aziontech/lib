import * as photonLib from './lib/index';

console.log('*** DEBUG photonLib:');
console.log(photonLib);

type Photon = typeof photonLib;

const photon: Partial<Photon> = {
  ...photonLib,
};

export default photon;
