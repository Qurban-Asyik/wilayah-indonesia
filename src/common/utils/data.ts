import { District, Island, Province, Regency, Village } from '@prisma/client';
import { getData } from 'idn-area-data';

/**
 * Province codes on Java island (incl. Madura, part of Jawa Timur):
 * DKI Jakarta, Jawa Barat, Jawa Tengah, DI Yogyakarta, Jawa Timur, Banten.
 */
export const JAVA_PROVINCE_CODES = ['31', '32', '33', '34', '35', '36'];

/**
 * Check if an area code (any level, e.g. `35.26.01.2001`) belongs to a Java province.
 */
export function isJavaArea(code: string): boolean {
  return JAVA_PROVINCE_CODES.includes(code.split('.')[0]);
}

/**
 * Get customized provinces data.
 */
export function getProvinces() {
  return getData<Province>('provinces');
}

/**
 * Get customized regencies data.
 */
export function getRegencies() {
  return getData<Regency>('regencies', {
    transform: {
      headers: {
        province_code: 'provinceCode',
      },
    },
  });
}

/**
 * Get customized districts data.
 */
export function getDistricts() {
  return getData<District>('districts', {
    transform: {
      headers: {
        regency_code: 'regencyCode',
      },
    },
  });
}

/**
 * Get customized villages data.
 */
export function getVillages() {
  return getData<Village>('villages', {
    transform: {
      headers: {
        district_code: 'districtCode',
      },
    },
  });
}

/**
 * Get customized islands data.
 */
export function getIslands() {
  return getData<Island>('islands', {
    transform: {
      headers: {
        is_outermost_small: 'isOutermostSmall',
        is_populated: 'isPopulated',
        regency_code: 'regencyCode',
      },
      values: {
        regency_code: (value) => (value === '' ? null : value),
        is_outermost_small: (value) => !!Number.parseInt(value, 10),
        is_populated: (value) => !!Number.parseInt(value, 10),
      },
    },
  });
}
