// services/calculationService.js
import { DatabaseService } from '../database/database';

export const CalculationService = {
  calculateFreezingDepth: async (inputData) => {
    try {
      console.log('🔍 НАЧАЛО РАСЧЕТА Hn...');
      
      // 1. Получаем данные грунта
      const soilData = await DatabaseService.getSoilByCode(inputData.selectedIGE);
      if (!soilData) {
        throw new Error('Грунт не найден в БД');
      }

      // 2. Получаем коэффициент kw
      const ip = parseFloat(inputData.soilData.ip) || soilData.ip;
      const kwResult = await DatabaseService.getKwByIp(ip);
      const kw = kwResult?.kw || 0.65;

      // 3. Получаем константы
      const constantsData = await DatabaseService.getConstants();
      const constants = {};
      constantsData.forEach(constant => {
        constants[constant.name] = constant.value;
      });

      // 4. Параметры расчета
      const theta_mp = constants.theta_mp || 12.51;
      const tau_f = constants.tau_f || 3624;
      const L = constants.L || 334;
      const t0 = parseFloat(inputData.soilData.t0) || soilData.t0 || 1.5;

      console.log('📊 Параметры:', { theta_mp, tau_f, L, t0, kw });

      // 5. Расчет ww для грунта
      const wp_soil = parseFloat(inputData.soilData.wp) || soilData.wp;
      const ww_soil = kw * wp_soil;

      // 6. Создаем слои
      const layers = [];

      // Конструкционные слои
      inputData.layers.forEach((layer) => {
        if (layer.thickness && layer.density && layer.moisture) {
          layers.push({
            id: layer.id,
            name: layer.name,
            thickness: parseFloat(layer.thickness),
            lambda_f: parseFloat(layer.lambdaF || layer.lambda_f || inputData.soilData.lambdaF || soilData.lambda_f),
            Cf: parseFloat(layer.cF || layer.Cf || inputData.soilData.cF || soilData.c_f),
            pd: parseFloat(layer.density),
            w: parseFloat(layer.moisture),
            ww: 0,
            type: 'construction'
          });
        }
      });

      // Грунт (последний слой)
      const soilLayer = {
        id: 'soil',
        name: inputData.soilData.subsoilName || soilData.name,
        thickness: 1.0,
        lambda_f: parseFloat(inputData.soilData.lambdaF) || soilData.lambda_f,
        Cf: parseFloat(inputData.soilData.cF) || soilData.c_f,
        pd: parseFloat(inputData.soilData.pd) || soilData.rho_d,
        w: parseFloat(inputData.soilData.w) || soilData.w,
        wp: wp_soil,
        ww: ww_soil,
        type: 'soil'
      };
      layers.push(soilLayer);

      // 7. Расчет eta_f для каждого слоя
      layers.forEach(layer => {
        if (layer.type === 'construction') {
          layer.eta_f = 0.5 * theta_mp * layer.Cf + layer.pd * (layer.w - 0) * L;
        } else {
          layer.eta_f = 0.5 * theta_mp * layer.Cf + layer.pd * (layer.w - layer.ww) * L;
        }
      });

      // 8. Расчет eta_f_0 для грунта
      const eta_f_0_soil = 0.5 * t0 * soilLayer.Cf + soilLayer.pd * (soilLayer.w - soilLayer.ww) * L;

      // 9. Расчет суммы Σ
      const lambda_f_soil = soilLayer.lambda_f;
      const eta_f_soil = soilLayer.eta_f;
      
      let summation = 0;

      for (let i = 0; i < layers.length - 1; i++) {
        const layer = layers[i];
        if (layer.type === 'construction') {
          const term = layer.thickness * Math.sqrt(
            (lambda_f_soil * layer.eta_f) / (layer.lambda_f * eta_f_soil)
          );
          summation += term;
          console.log(`Σ слой ${i+1}: ${term.toFixed(3)}`);
        }
      }

      console.log(`Σ сумма: ${summation.toFixed(3)}`);

      // 10. Расчет Hn
      const part1 = 1.9 * Math.sqrt(2 * lambda_f_soil * tau_f);
      const part2 = Math.sqrt(theta_mp / eta_f_soil) - Math.sqrt(t0 / eta_f_0_soil);
      const Hn = part1 * part2 - summation;

      console.log(`📐 РЕЗУЛЬТАТ РАСЧЕТА: Hn = ${Hn.toFixed(3)}`);
      console.log(`part1 = ${part1.toFixed(3)}, part2 = ${part2.toFixed(6)}`);

      // 11. Расчет Hf (Высота промороженной толщи)
      let Hf = 0;
      // Суммируем толщины всех конструкционных слоев
      layers.forEach(layer => {
        if (layer.type === 'construction') {
          Hf += layer.thickness;
        }
      });
      // Добавляем Hn (толщину промерзания грунта)
      Hf += Hn;

      console.log(`📐 РЕЗУЛЬТАТ РАСЧЕТА: Hf = ${Hf.toFixed(3)}`);

      // 12. Расчет для Пеноплекса
      const Hn_Penoplex = 0.18;
      const Hf_Penoplex = 1.72;

      const Hi_Hf_ratio = Hn / Hf;
      const mz = CalculationService.calculateMz(Hi_Hf_ratio);
      const sf = Hn * mz * (constants.kf || 0.10);

      const riskLevel = CalculationService.assessRisk(Hn);

      // 13. Возвращаем результат
      const result = {
        Hn: Math.max(0, Hn).toFixed(3),
        Hf: Hf.toFixed(3),
        Hn_Penoplex: Hn_Penoplex.toFixed(3),
        Hf_Penoplex: Hf_Penoplex.toFixed(3),
        Hi_Hf_ratio: Hi_Hf_ratio.toFixed(3),
        mz: mz.toFixed(3),
        sf: (sf * 100).toFixed(1),
        riskLevel: riskLevel.level,
        riskColor: riskLevel.color,
        calculationDetails: {
          parameters: {
            theta_mp: theta_mp,
            tau_f: tau_f,
            L: L,
            t0: t0,
            kw: kw,
            wp: wp_soil
          },
          summation: summation,
          part1: part1,
          part2: part2,
          eta_f_soil: eta_f_soil,
          eta_f_0_soil: eta_f_0_soil
        },
        success: true
      };

      console.log('✅ РАСЧЕТ УСПЕШНО ЗАВЕРШЕН');
      return result;

    } catch (error) {
      console.error('❌ ОШИБКА РАСЧЕТА:', error);
      
      return {
        Hn: '0.000',
        Hf: '0.000',
        Hn_Penoplex: '0.180',
        Hf_Penoplex: '1.720',
        Hi_Hf_ratio: '0.000',
        mz: '0.000',
        sf: '0.0',
        riskLevel: 'Ошибка',
        riskColor: '#BD3F4B',
        success: false,
        error: error.message
      };
    }
  },

  // ... остальные функции без изменений
  calculateMz: (Hi_Hf_ratio) => {
    const ratio = parseFloat(Hi_Hf_ratio);
    if (ratio <= 0.1) return 1.0;
    if (ratio <= 0.2) return 0.9;
    if (ratio <= 0.3) return 0.8;
    if (ratio <= 0.4) return 0.7;
    if (ratio <= 0.5) return 0.6;
    if (ratio <= 0.6) return 0.5;
    return 0.4;
  },

  assessRisk: (Hn) => {
    const value = parseFloat(Hn);
    if (value < 0.5) {
      return { level: 'Низкий риск', color: '#52BC6A' };
    } else if (value < 1.0) {
      return { level: 'Средний риск', color: '#F3CC56' };
    } else {
      return { level: 'Высокий риск', color: '#BD3F4B' };
    }
  },

  saveCalculation: async (calculationData) => {
    try {
      return await DatabaseService.saveCalculation(calculationData);
    } catch (error) {
      console.error('❌ Ошибка сохранения расчета:', error);
      throw error;
    }
  },

  getCalculationHistory: async () => {
    try {
      return await DatabaseService.getCalculationHistory();
    } catch (error) {
      console.error('❌ Ошибка получения истории:', error);
      throw error;
    }
  }
};