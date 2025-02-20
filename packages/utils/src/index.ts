// Importar todas as funções do edge
import * as edgeUtils from './edge/index';

// Importar todas as funções do node
import * as nodeUtils from './node/index';

// Exportar como objetos nomeados
export const edge = {
  ...edgeUtils,
};

export const node = {
  ...nodeUtils,
};
