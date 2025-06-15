import consola from 'consola';

export const createLogger = (prefix?: string) => {
  return consola.create({ defaults: { tag: prefix } });
};

export const moduleLogger = createLogger('REPORT-MODULE');
