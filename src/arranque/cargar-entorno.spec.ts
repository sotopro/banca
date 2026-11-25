import { cargarEntorno, ENTORNO_POR_DEFECTO, validarEntorno } from './cargar-entorno';

const respuesta = (cuerpo: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => cuerpo }) as Response;

describe('validarEntorno', () => {
  it('acepta una configuración válida y quita la barra final de apiUrl', () => {
    expect(
      validarEntorno({ entorno: 'qas', apiUrl: 'https://api.qas/', logLevel: 'warn' }),
    ).toEqual({
      entorno: 'qas',
      apiUrl: 'https://api.qas',
      logLevel: 'warn',
    });
  });

  it.each([
    [{ entorno: 'staging', apiUrl: '/api', logLevel: 'error' }, /entorno inválido/],
    [{ entorno: 'prod', apiUrl: '', logLevel: 'error' }, /apiUrl/],
    [{ entorno: 'prod', apiUrl: '/api', logLevel: 'info' }, /logLevel inválido/],
    [null, /objeto/],
  ])('rechaza %j', (valor, mensaje) => {
    expect(() => validarEntorno(valor)).toThrow(mensaje);
  });
});

describe('cargarEntorno', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => undefined));

  it('lee env.config.json sin caché', async () => {
    const fetchFn = vi.fn(async () =>
      respuesta({ entorno: 'prod', apiUrl: '/api', logLevel: 'error' }),
    ) as unknown as typeof fetch;

    await expect(cargarEntorno('env.config.json', fetchFn)).resolves.toEqual({
      entorno: 'prod',
      apiUrl: '/api',
      logLevel: 'error',
    });
    expect(fetchFn).toHaveBeenCalledWith('env.config.json', { cache: 'no-store' });
  });

  it('usa la configuración local si el archivo no existe', async () => {
    const fetchFn = (async () => respuesta(null, 404)) as unknown as typeof fetch;
    await expect(cargarEntorno('env.config.json', fetchFn)).resolves.toEqual(ENTORNO_POR_DEFECTO);
  });

  it('usa la configuración local si el archivo es inválido', async () => {
    const fetchFn = (async () => respuesta({ entorno: 'x' })) as unknown as typeof fetch;
    await expect(cargarEntorno('env.config.json', fetchFn)).resolves.toEqual(ENTORNO_POR_DEFECTO);
    expect(console.warn).toHaveBeenCalled();
  });
});
