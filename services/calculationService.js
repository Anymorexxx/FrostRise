// services/calculationService.js
import { DatabaseService } from '../database/database';

export const CalculationService = {
  // Основная функция расчета глубины промерзания Hn
  calculateFreezingDepth: async (inputData) => {
    return new Promise((resolve, reject) => {
      // Получаем данные выбранного грунта из БД
      DatabaseService.getSoilByCode(inputData.selectedIGE)
        .then(soilData => {
          if (!soilData) {
            reject(new Error('Грунт не найден в БД'));
            return;
          }

          // Получаем коэффициент kw
          DatabaseService.getKwByIp(soilData.ip)
            .then(kwData => {
              // Получаем константы
              DatabaseService.getConstants()
                .then(constantsData => {
                  try {
                    // Преобразуем константы в объект
                    const constants = {};
                    constantsData.forEach(constant => {
                      constants[constant.name] = constant.value;
                    });

                    // 1. Расчет Ww = kw * Wp (только для грунта)
                    const kw = kwData?.kw || 0.65; // Защита от undefined
                    const Ww = kw * (parseFloat(inputData.wp) || soilData.wp);

                    // Создаем слои конструкции
                    const layers = [
                      // Расчетный слой (материал покрытия)
                      {
                        name: inputData.materialName || 'Цементобетон',
                        thickness: parseFloat(inputData.thickness) || 0.2,
                        lambda_f: parseFloat(inputData.lambdaF) || 1.9,
                        Cf: parseFloat(inputData.cF) || 1675,
                        pd: parseFloat(inputData.density) || 2300,
                        w: parseFloat(inputData.moisture) || 0.03,
                        ww: 0 // Для всех слоев кроме грунта ww = 0
                      },
                      // Грунт (последний слой)
                      {
                        name: soilData.name,
                        thickness: 1.0, // Толщина грунта принимается 1м для расчета
                        lambda_f: soilData.lambda_f || 1.5,
                        Cf: soilData.c_f || 2135,
                        pd: parseFloat(inputData.pd) || soilData.rho_d || 1640,
                        w: parseFloat(inputData.w) || soilData.w || 0.21,
                        wp: parseFloat(inputData.wp) || soilData.wp || 0.18,
                        ww: Ww // ww = kw * wp для грунта
                      }
                    ];

                    // 2. Расчет ηf для каждого слоя по формуле: ηf = 0.5 * θmp * Cf + ρd * (w - ww) * L
                    layers.forEach(layer => {
                      layer.eta_f = CalculationService.calculateEtaF(
                        constants.theta_mp || 12.51,
                        layer.Cf,
                        layer.pd,
                        layer.w,
                        layer.ww,
                        constants.L || 334
                      );
                    });

                    // 3. Расчет сумматора Σ для всех слоев кроме грунта
                    let summation = 0;
                    const lambda_f = layers[0].lambda_f;  // λf для расчетного слоя (первый слой)
                    const eta_f = layers[0].eta_f;        // ηf для расчетного слоя (первый слой)

                    for (let i = 0; i < layers.length - 1; i++) {
                      const layer = layers[i];
                      const term = layer.thickness * Math.sqrt(
                        (lambda_f * layer.eta_f) / (layer.lambda_f * eta_f)
                      );
                      summation += term;
                    }

                    // 4. Расчет ηf0 для грунта (последний слой)
                    const eta_f0 = layers[layers.length - 1].eta_f;

                    // 5. Расчет Hn по основной формуле E.1
                    const tau_f = constants.tau_f || 3624;
                    const theta_mp = constants.theta_mp || 12.51;
                    const t0 = soilData.t0 || 1.5;

                    const part1 = 1.9 * Math.sqrt(2 * lambda_f * tau_f);
                    const part2 = Math.sqrt(theta_mp / eta_f) - Math.sqrt(t0 / eta_f0);
                    const Hn = part1 * part2 - summation;

                    // 6. Расчет по методике ТСН МФ-97 МО для сравнения
                    const Hn_TSN = Hn * 0.8;

                    // 7. Расчет высоты промороженной толщи Hf
                    let Hf = 0;
                    layers.forEach(layer => {
                      Hf += layer.thickness;
                    });
                    Hf += Hn;

                    // 8. Расчет коэффициента mz и деформации пучения sf
                    const Hi_Hf_ratio = Hn / Hf;
                    const mz = CalculationService.calculateMz(Hi_Hf_ratio);
                    const kf = 0.10; // Коэффициент из таблицы Е.3
                    const sf = Hn * mz * kf;

                    // 9. Оценка риска
                    const riskLevel = CalculationService.assessRisk(Hn);

                    const result = {
                      Hn: Math.max(0, Hn).toFixed(3), // Не допускаем отрицательные значения
                      Hn_TSN: Math.max(0, Hn_TSN).toFixed(3),
                      Hf: Hf.toFixed(3),
                      Hi_Hf_ratio: Hi_Hf_ratio.toFixed(3),
                      mz: mz.toFixed(3),
                      sf: (sf * 100).toFixed(1), // в см
                      riskLevel: riskLevel.level,
                      riskColor: riskLevel.color,
                      calculationDetails: {
                        layers,
                        constants: {
                          ...constants,
                          Ww: Ww.toFixed(3),
                          kw: kw
                        },
                        summation: summation.toFixed(3),
                        part1: part1.toFixed(3),
                        part2: part2.toFixed(3),
                        eta_f0: eta_f0.toFixed(0)
                      }
                    };

                    resolve(result);

                  } catch (error) {
                    console.error('❌ Ошибка в расчете:', error);
                    reject(error);
                  }
                })
                .catch(error => {
                  console.error('❌ Ошибка получения констант:', error);
                  reject(error);
                });
            })
            .catch(error => {
              console.error('❌ Ошибка получения коэффициента kw:', error);
              reject(error);
            });
        })
        .catch(error => {
          console.error('❌ Ошибка получения грунта:', error);
          reject(error);
        });
    });
  },

  // Расчет ηf = 0.5 * θmp * Cf + ρd * (w - ww) * L
  calculateEtaF: (theta_mp, Cf, pd, w, ww, L) => {
    return 0.5 * theta_mp * Cf + pd * (w - ww) * L;
  },

  // Расчет коэффициента mz по графику Е.2
  calculateMz: (Hi_Hf_ratio) => {
    // Аппроксимация графика Е.2
    if (Hi_Hf_ratio <= 0.1) return 1.0;
    if (Hi_Hf_ratio <= 0.2) return 0.9;
    if (Hi_Hf_ratio <= 0.3) return 0.8;
    if (Hi_Hf_ratio <= 0.4) return 0.7;
    if (Hi_Hf_ratio <= 0.5) return 0.6;
    if (Hi_Hf_ratio <= 0.6) return 0.5;
    return 0.4;
  },

  // Оценка риска на основе глубины промерзания
  assessRisk: (Hn) => {
    if (Hn < 0.5) {
      return { level: 'Низкий риск', color: '#52BC6A' };
    } else if (Hn < 1.0) {
      return { level: 'Средний риск', color: '#F3CC56' };
    } else {
      return { level: 'Высокий риск', color: '#BD3F4B' };
    }
  },

  // Сохранение расчета в историю
  saveCalculation: async (calculationData) => {
    try {
      return await DatabaseService.saveCalculation(calculationData);
    } catch (error) {
      console.error('❌ Ошибка сохранения расчета:', error);
      throw error;
    }
  },

  // Получение истории расчетов
  getCalculationHistory: async () => {
    try {
      return await DatabaseService.getCalculationHistory();
    } catch (error) {
      console.error('❌ Ошибка получения истории:', error);
      throw error;
    }
  }
};