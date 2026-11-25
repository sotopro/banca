import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import {
  calcularIntegridad,
  construirManifiesto,
  validarEntornoDespliegue,
} from './despliegue.mjs';

const REMOTOS = ['mfe-cuentas', 'mfe-transferencias'];
const MANIFIESTO = {
  'mfe-cuentas': 'https://qas.banca.example.com/mfe/cuentas/remoteEntry.json',
  'mfe-transferencias': {
    url: 'https://qas.banca.example.com/mfe/transferencias/remoteEntry.json',
  },
};
const sinLectura = () => {
  throw new Error('no debería leer archivos');
};

describe('calcularIntegridad', () => {
  it('genera un hash sha384 en base64 con el prefijo que exige SRI', () => {
    const bytes = Buffer.from('{"name":"mfe-cuentas"}');
    const esperado = createHash('sha384').update(bytes).digest('base64');
    expect(calcularIntegridad(bytes)).toBe(`sha384-${esperado}`);
  });
});

describe('construirManifiesto', () => {
  it('sin SRI deja cada remoto como URL simple', () => {
    expect(
      construirManifiesto(MANIFIESTO, {
        remotosEsperados: REMOTOS,
        sri: false,
        leerRemoteEntry: sinLectura,
      }),
    ).toEqual({
      'mfe-cuentas': 'https://qas.banca.example.com/mfe/cuentas/remoteEntry.json',
      'mfe-transferencias': 'https://qas.banca.example.com/mfe/transferencias/remoteEntry.json',
    });
  });

  it('con SRI agrega integrity calculado del remoteEntry.json compilado de cada remoto', () => {
    const leidos = [];
    const resultado = construirManifiesto(MANIFIESTO, {
      remotosEsperados: REMOTOS,
      sri: true,
      leerRemoteEntry: (remoto) => {
        leidos.push(remoto);
        return Buffer.from(remoto);
      },
    });
    expect(leidos).toEqual(REMOTOS);
    expect(resultado['mfe-cuentas']).toEqual({
      url: 'https://qas.banca.example.com/mfe/cuentas/remoteEntry.json',
      integrity: calcularIntegridad(Buffer.from('mfe-cuentas')),
    });
  });

  it('falla si falta un remoto', () => {
    expect(() =>
      construirManifiesto(
        { 'mfe-cuentas': MANIFIESTO['mfe-cuentas'] },
        { remotosEsperados: REMOTOS, sri: false },
      ),
    ).toThrow(/Faltan remotos.*mfe-transferencias/);
  });

  it('falla si hay un remoto desconocido', () => {
    expect(() =>
      construirManifiesto(
        { ...MANIFIESTO, 'mfe-pagos': 'https://x/remoteEntry.json' },
        { remotosEsperados: REMOTOS, sri: false },
      ),
    ).toThrow(/desconocidos.*mfe-pagos/);
  });

  it('falla si una URL no apunta a remoteEntry.json', () => {
    expect(() =>
      construirManifiesto(
        { ...MANIFIESTO, 'mfe-cuentas': 'https://qas.banca.example.com/mfe/cuentas/' },
        { remotosEsperados: REMOTOS, sri: false },
      ),
    ).toThrow(/URL inválida para mfe-cuentas/);
  });
});

describe('validarEntornoDespliegue', () => {
  it('acepta una configuración coherente con el entorno', () => {
    const config = { entorno: 'prod', apiUrl: '/api', logLevel: 'error' };
    expect(validarEntornoDespliegue('prod', config)).toBe(config);
  });

  it('rechaza un entorno desconocido', () => {
    expect(() => validarEntornoDespliegue('staging', {})).toThrow(/Entorno desconocido/);
  });

  it('rechaza un archivo de otro entorno (evita desplegar qas en prod)', () => {
    expect(() =>
      validarEntornoDespliegue('prod', { entorno: 'qas', apiUrl: '/api', logLevel: 'warn' }),
    ).toThrow(/declara entorno "qas"/);
  });

  it('rechaza un logLevel que el orchestrator no acepta', () => {
    expect(() =>
      validarEntornoDespliegue('dev', { entorno: 'dev', apiUrl: '/api', logLevel: 'info' }),
    ).toThrow(/logLevel/);
  });
});
