import AsyncStorage from "@react-native-async-storage/async-storage";
const DB_KEYS = {
  SOILS: "@frostrise_soils",
  MATERIALS: "@frostrise_materials",
  COEFFICIENTS: "@frostrise_coefficients",
  CONSTANTS: "@frostrise_constants",
  HISTORY: "@frostrise_history",
};
const INITIAL_DATA = {
  soils: [
    {
      code: "11_1",
      name: "Песок гравелистый и крупный",
      t0: 0.0,
      soil_type: "sand",
      consistency: null,
      ip: 0.01,
      wp: 0.08,
      lambda_f: 2.1,
      c_f: 2100,
      rho_d: 1500,
      w: 0.12,
    },
    {
      code: "11_2",
      name: "Песок мелкий и пылеватый",
      t0: 0.2,
      soil_type: "sand",
      consistency: null,
      ip: 0.015,
      wp: 0.09,
      lambda_f: 1.8,
      c_f: 1800,
      rho_d: 1550,
      w: 0.13,
    },
    {
      code: "12_1",
      name: "Супесь",
      t0: 0.4,
      soil_type: "sandy_loam",
      consistency: null,
      ip: 0.04,
      wp: 0.12,
      lambda_f: 1.5,
      c_f: 1700,
      rho_d: 1600,
      w: 0.16,
    },
    {
      code: "13_1",
      name: "Суглинок мягкопластичный",
      t0: 0.6,
      soil_type: "loam",
      consistency: "soft_plastic",
      ip: 0.08,
      wp: 0.15,
      lambda_f: 1.3,
      c_f: 1500,
      rho_d: 1700,
      w: 0.19,
    },
    {
      code: "13_2",
      name: "Суглинок тугопластичный",
      t0: 0.8,
      soil_type: "loam",
      consistency: "stiff_plastic",
      ip: 0.1,
      wp: 0.16,
      lambda_f: 1.2,
      c_f: 1400,
      rho_d: 1750,
      w: 0.2,
    },
    {
      code: "13_3",
      name: "Суглинок полутвердый",
      t0: 1.0,
      soil_type: "loam",
      consistency: "semi_hard",
      ip: 0.12,
      wp: 0.17,
      lambda_f: 1.1,
      c_f: 1300,
      rho_d: 1800,
      w: 0.21,
    },
    {
      code: "14_1",
      name: "Глина мягкопластичная",
      t0: 1.1,
      soil_type: "clay",
      consistency: "soft_plastic",
      ip: 0.14,
      wp: 0.18,
      lambda_f: 1.0,
      c_f: 1200,
      rho_d: 1850,
      w: 0.22,
    },
    {
      code: "14_2",
      name: "Глина тугопластичная",
      t0: 1.3,
      soil_type: "clay",
      consistency: "stiff_plastic",
      ip: 0.16,
      wp: 0.19,
      lambda_f: 0.9,
      c_f: 1100,
      rho_d: 1900,
      w: 0.23,
    },
    {
      code: "14_3",
      name: "Глина полутвердая",
      t0: 1.5,
      soil_type: "clay",
      consistency: "semi_hard",
      ip: 0.18,
      wp: 0.18,
      lambda_f: 1.5,
      c_f: 2135,
      rho_d: 1640,
      w: 0.21,
    },
  ],
  materials: [
    {
      id: 1,
      material_type: "Цементобетон",
      rho_d: 2300,
      w: 0.03,
      lambda_r: 1.85,
      lambda_f: 1.9,
      C_i: 2010,
      C_f: 1675,
    },
    {
      id: 2,
      material_type: "Асфальтобетон",
      rho_d: 2200,
      w: 0.03,
      lambda_r: 1.3,
      lambda_f: 1.4,
      C_i: 3685,
      C_f: 3390,
    },
    {
      id: 3,
      material_type: "Пескоцемент",
      rho_d: 2000,
      w: 0.05,
      lambda_r: 1.65,
      lambda_f: 1.8,
      C_i: 2010,
      C_f: 1840,
    },
    {
      id: 4,
      material_type: "Грунтоцемент",
      rho_d: 2000,
      w: 0.05,
      lambda_r: 1.4,
      lambda_f: 1.5,
      C_i: 1925,
      C_f: 1780,
    },
    {
      id: 5,
      material_type: "Шлакобетон (1600)",
      rho_d: 1600,
      w: 0.05,
      lambda_r: 0.65,
      lambda_f: 0.8,
      C_i: 1800,
      C_f: 1675,
    },
    {
      id: 6,
      material_type: "Шлакобетон (1300)",
      rho_d: 1300,
      w: 0.05,
      lambda_r: 0.45,
      lambda_f: 0.6,
      C_i: 1465,
      C_f: 1360,
    },
    {
      id: 7,
      material_type: "Шлакобетон (1000)",
      rho_d: 1000,
      w: 0.05,
      lambda_r: 0.35,
      lambda_f: 0.4,
      C_i: 1130,
      C_f: 1045,
    },
    {
      id: 8,
      material_type: "Шлакобетон (900)",
      rho_d: 900,
      w: 0.05,
      lambda_r: 0.3,
      lambda_f: 0.35,
      C_i: 1005,
      C_f: 920,
    },
    {
      id: 9,
      material_type: "Керамзитобетон (1600)",
      rho_d: 1600,
      w: 0.05,
      lambda_r: 0.6,
      lambda_f: 0.7,
      C_i: 2345,
      C_f: 2180,
    },
    {
      id: 10,
      material_type: "Керамзитобетон (1400)",
      rho_d: 1400,
      w: 0.05,
      lambda_r: 0.45,
      lambda_f: 0.6,
      C_i: 2050,
      C_f: 1905,
    },
    {
      id: 11,
      material_type: "Керамзитобетон (1200)",
      rho_d: 1200,
      w: 0.05,
      lambda_r: 0.35,
      lambda_f: 0.4,
      C_i: 1760,
      C_f: 1635,
    },
    {
      id: 12,
      material_type: "Пенобетон (1200)",
      rho_d: 1200,
      w: 0.05,
      lambda_r: 0.35,
      lambda_f: 0.45,
      C_i: 1510,
      C_f: 1405,
    },
    {
      id: 13,
      material_type: "Пенобетон (1000)",
      rho_d: 1000,
      w: 0.05,
      lambda_r: 0.3,
      lambda_f: 0.4,
      C_i: 1255,
      C_f: 1170,
    },
    {
      id: 14,
      material_type: "Пенобетон (500)",
      rho_d: 500,
      w: 0.1,
      lambda_r: 0.2,
      lambda_f: 0.25,
      C_i: 630,
      C_f: 565,
    },
    {
      id: 15,
      material_type: "Песок, супесь и суглинок, укрепленные золой уноса",
      rho_d: 1900,
      w: 0.05,
      lambda_r: 1.15,
      lambda_f: 1.4,
      C_i: 1935,
      C_f: 1730,
    },
    {
      id: 16,
      material_type: "Песок, супесь и суглинок, укрепленные битумом",
      rho_d: 1800,
      w: 0.05,
      lambda_r: 0.95,
      lambda_f: 1.15,
      C_i: 1840,
      C_f: 1675,
    },
    {
      id: 17,
      material_type: "Галька (щебень) с песком",
      rho_d: 1800,
      w: 0.1,
      lambda_r: 1.85,
      lambda_f: 2.2,
      C_i: 2260,
      C_f: 1885,
    },
    {
      id: 18,
      material_type: "Галька (щебень) с глиной",
      rho_d: 1800,
      w: 0.1,
      lambda_r: 2.0,
      lambda_f: 2.35,
      C_i: 2345,
      C_f: 1970,
    },
    {
      id: 19,
      material_type: "Гравий, щебень гранитный",
      rho_d: 1800,
      w: 0.1,
      lambda_r: 2.0,
      lambda_f: 2.35,
      C_i: 1840,
      C_f: 1675,
    },
    {
      id: 20,
      material_type: "Щебень осадочных пород",
      rho_d: 1600,
      w: 0.1,
      lambda_r: 1.4,
      lambda_f: 2.05,
      C_i: 1760,
      C_f: 1590,
    },
    {
      id: 21,
      material_type: "Шлак",
      rho_d: 800,
      w: 0.1,
      lambda_r: 0.3,
      lambda_f: 0.35,
      C_i: 1090,
      C_f: 985,
    },
    {
      id: 22,
      material_type: "Мохоторф под насыпью",
      rho_d: null,
      w: 3.55,
      lambda_r: 0.5,
      lambda_f: 0.8,
      C_i: null,
      C_f: null,
    },
  ],
  coefficients: [
    { id: 1, soil_type: "Пески и супеси", ip_min: 0, ip_max: 0.02, kw: 0 },
    { id: 2, soil_type: "Супеси", ip_min: 0.02, ip_max: 0.07, kw: 0.35 },
    { id: 3, soil_type: "Суглинки", ip_min: 0.07, ip_max: 0.13, kw: 0.5 },
    { id: 4, soil_type: "Суглинки", ip_min: 0.13, ip_max: 0.17, kw: 0.55 },
    { id: 5, soil_type: "Глины", ip_min: 0.17, ip_max: 1.0, kw: 0.65 },
  ],
  constants: [
    {
      id: 1,
      name: "L",
      value: 334,
      unit: "кДж/кг",
      description: "Теплота фазового перехода воды",
    },
    {
      id: 2,
      name: "theta_mp",
      value: 12.51,
      unit: "°C",
      description: "Абсолютная средняя температура на поверхности",
    },
    {
      id: 3,
      name: "tau_f",
      value: 3624,
      unit: "ч",
      description: "Продолжительность периода отрицательных температур",
    },
    {
      id: 4,
      name: "kf",
      value: 0.1,
      unit: "",
      description: "Коэффициент из таблицы Е.3",
    },
    {
      id: 5,
      name: "g",
      value: 9.81,
      unit: "м/с²",
      description: "Ускорение свободного падения",
    },
  ],
  history: [],
};
export const forceReinitializeDatabase = async () => {
  try {
    await AsyncStorage.removeItem(DB_KEYS.SOILS);
    await AsyncStorage.removeItem(DB_KEYS.MATERIALS);
    await AsyncStorage.removeItem(DB_KEYS.COEFFICIENTS);
    await AsyncStorage.removeItem(DB_KEYS.CONSTANTS);
    await AsyncStorage.removeItem(DB_KEYS.HISTORY);
    await seedDatabase();
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};
export const initDatabase = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const testKey = "@test_" + Date.now();
      await AsyncStorage.setItem(testKey, "test");
      const testValue = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
    } catch (storageError) {
      console.error("Error:", storageError);
      return false;
    }
    try {
      const existingSoils = await AsyncStorage.getItem(DB_KEYS.SOILS);
      const soilsCount = existingSoils ? JSON.parse(existingSoils).length : 0;
      if (!existingSoils || soilsCount === 0) {
        await seedDatabase();
      } else {
      }
    } catch (dataError) {
      console.error("Error:", dataError);
      await seedDatabase();
    }
    const verifySoils = await AsyncStorage.getItem(DB_KEYS.SOILS);
    const finalCount = verifySoils ? JSON.parse(verifySoils).length : 0;
    if (finalCount === 0) {
      console.error(
        "❌ КРИТИЧЕСКАЯ ОШИБКА: База данных пуста после инициализации!",
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error:", error);
    console.error("Error:", error.stack);
    return false;
  }
};
const seedDatabase = async () => {
  try {
    if (!INITIAL_DATA.soils || INITIAL_DATA.soils.length === 0) {
      throw new Error("INITIAL_DATA.soils is empty or undefined");
    }
    await AsyncStorage.setItem(
      DB_KEYS.SOILS,
      JSON.stringify(INITIAL_DATA.soils),
    );
    await AsyncStorage.setItem(
      DB_KEYS.MATERIALS,
      JSON.stringify(INITIAL_DATA.materials),
    );
    console.log(
      "📊 Сохранение коэффициентов:",
      INITIAL_DATA.coefficients.length,
    );
    await AsyncStorage.setItem(
      DB_KEYS.COEFFICIENTS,
      JSON.stringify(INITIAL_DATA.coefficients),
    );
    await AsyncStorage.setItem(
      DB_KEYS.CONSTANTS,
      JSON.stringify(INITIAL_DATA.constants),
    );
    await AsyncStorage.setItem(
      DB_KEYS.HISTORY,
      JSON.stringify(INITIAL_DATA.history),
    );
    return true;
  } catch (error) {
    console.error("Error:", error);
    console.error("Error:", error.stack);
    return false;
  }
};
export const DatabaseService = {
  getAllSoils: async () => {
    try {
      const soilsJson = await AsyncStorage.getItem(DB_KEYS.SOILS);
      const soils = soilsJson ? JSON.parse(soilsJson) : INITIAL_DATA.soils;
      return soils;
    } catch (error) {
      console.error("Error:", error);
      return INITIAL_DATA.soils;
    }
  },
  getSoilByCode: async (code) => {
    try {
      const soils = await DatabaseService.getAllSoils();
      const soil = soils.find((soil) => soil.code === code) || null;
      return soil;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  },
  getAllMaterials: async () => {
    try {
      const materialsJson = await AsyncStorage.getItem(DB_KEYS.MATERIALS);
      return materialsJson ? JSON.parse(materialsJson) : INITIAL_DATA.materials;
    } catch (error) {
      console.error("Error:", error);
      return INITIAL_DATA.materials;
    }
  },
  getMaterialByType: async (materialType) => {
    try {
      const materials = await DatabaseService.getAllMaterials();
      return (
        materials.find((material) => material.material_type === materialType) ||
        null
      );
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  },
  getKwByIp: async (ip) => {
    try {
      const coefficientsJson = await AsyncStorage.getItem(DB_KEYS.COEFFICIENTS);
      const coefficients = coefficientsJson
        ? JSON.parse(coefficientsJson)
        : INITIAL_DATA.coefficients;
      const foundCoeff = coefficients.find(
        (coeff) => ip >= coeff.ip_min && ip <= coeff.ip_max,
      );
      return foundCoeff || { kw: 0.65 };
    } catch (error) {
      console.error("Error:", error);
      return { kw: 0.65 };
    }
  },
  getConstants: async () => {
    try {
      const constantsJson = await AsyncStorage.getItem(DB_KEYS.CONSTANTS);
      const constants = constantsJson
        ? JSON.parse(constantsJson)
        : INITIAL_DATA.constants;
      return constants;
    } catch (error) {
      console.error("Error:", error);
      return INITIAL_DATA.constants;
    }
  },
  saveCalculation: async (calculationData) => {
    try {
      const historyJson = await AsyncStorage.getItem(DB_KEYS.HISTORY);
      const history = historyJson ? JSON.parse(historyJson) : [];
      const newCalculation = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...calculationData,
      };
      history.unshift(newCalculation);
      const limitedHistory = history.slice(0, 100);
      await AsyncStorage.setItem(
        DB_KEYS.HISTORY,
        JSON.stringify(limitedHistory),
      );
      return newCalculation;
    } catch (error) {
      console.error("Save error:", error.message);
      throw error;
    }
  },
  getCalculationHistory: async () => {
    try {
      const historyJson = await AsyncStorage.getItem(DB_KEYS.HISTORY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error("History fetch error:", error.message);
      return [];
    }
  },
  clearHistory: async () => {
    try {
      await AsyncStorage.setItem(DB_KEYS.HISTORY, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  },
  clearDatabase: async () => {
    try {
      await AsyncStorage.removeItem(DB_KEYS.SOILS);
      await AsyncStorage.removeItem(DB_KEYS.MATERIALS);
      await AsyncStorage.removeItem(DB_KEYS.COEFFICIENTS);
      await AsyncStorage.removeItem(DB_KEYS.CONSTANTS);
      await AsyncStorage.removeItem(DB_KEYS.HISTORY);
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  },
  reinitializeDatabase: async () => {
    try {
      await DatabaseService.clearDatabase();
      await seedDatabase();
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  },
  forceReinitialize: forceReinitializeDatabase,
  getSoilNames: async () => {
    try {
      const soils = await DatabaseService.getAllSoils();
      return soils.map((soil) => ({
        code: soil.code,
        name: soil.name,
        fullName: `${soil.code} - ${soil.name}`,
        displayName: soil.name,
      }));
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  },
  getMaterialNames: async () => {
    try {
      const materials = await DatabaseService.getAllMaterials();
      return materials.map((material) => ({
        id: material.id,
        name: material.material_type,
        displayName: material.material_type,
      }));
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  },
  getConstantNames: async () => {
    try {
      const constants = await DatabaseService.getConstants();
      return constants.map((constant) => ({
        id: constant.id,
        name: constant.name,
        description: constant.description,
        unit: constant.unit,
      }));
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  },
  getSoilByName: async (name) => {
    try {
      const soils = await DatabaseService.getAllSoils();
      return (
        soils.find(
          (soil) =>
            soil.name === name ||
            soil.code === name ||
            `${soil.code} - ${soil.name}` === name,
        ) || null
      );
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  },
  getMaterialById: async (id) => {
    try {
      const materials = await DatabaseService.getAllMaterials();
      return materials.find((material) => material.id === id) || null;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  },
  getConstantByName: async (constantName) => {
    try {
      const constants = await DatabaseService.getConstants();
      return (
        constants.find((constant) => constant.name === constantName) || null
      );
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  },
};
export const checkDatabaseHealth = async () => {
  try {
    const soils = await AsyncStorage.getItem(DB_KEYS.SOILS);
    const materials = await AsyncStorage.getItem(DB_KEYS.MATERIALS);
    const soilsCount = soils ? JSON.parse(soils).length : 0;
    const materialsCount = materials ? JSON.parse(materials).length : 0;
    return {
      healthy: soilsCount > 0 && materialsCount > 0,
      soilsCount,
      materialsCount,
    };
  } catch (error) {
    console.error("Error:", error);
    return { healthy: false, soilsCount: 0, materialsCount: 0 };
  }
};
export default DatabaseService;
