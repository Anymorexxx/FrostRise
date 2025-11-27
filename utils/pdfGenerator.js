// utils/pdfGenerator.js
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

export const generatePDF = async (calculationData, chartImageBase64 = '') => {
  try {
    const { inputData, result, date, calculationDetails, detailedCalculations } = calculationData;

    // Функция для безопасного получения числового значения
    const safeFloat = (value) => parseFloat(value) || 0;

    const hfSoil = safeFloat(result.Hf);
    const hfPenoplex = safeFloat(result.Hf_Penoplex);
    const hnSoil = safeFloat(result.Hn);
    const hnPenoplex = safeFloat(result.Hn_Penoplex || 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page {
            margin: 2cm;
            size: A4;
          }

          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
          }

          .title-page {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            text-align: center;
            position: relative;
            padding: 0 2cm;
            page-break-after: always;
          }

          .title-header {
            font-size: 11pt;
            text-align: left;
            margin-bottom: 0;
            line-height: 1.4;
            padding-top: 1cm;
            font-style: italic;
          }

          .title-header p {
            margin: 2px 0;
          }

          .title-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin-top: -50px;
          }

          .signature-container {
            width: 100%;
            margin: 30px 0 0 0;
          }

          .signature-line {
            display: flex;
            align-items: center;
            margin: 0 0 15px 0;
            white-space: nowrap;
          }

          .label {
            width: 180px;
            text-align: left;
            flex-shrink: 0;
          }

          .name {
            text-align: left;
            margin-left: 20px;
          }

          .content-page {
            padding: 0 2cm;
          }

          h1 {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin: 0 0 20px 0;
            padding-top: 0;
          }

          h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 25px 0 15px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0 25px 0;
            border: 1px solid #000;
          }

          th, td {
            padding: 8px;
            border: 1px solid #000;
            vertical-align: top;
            text-align: center;
          }

          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }

          .result-box {
            background-color: #f9f9f9;
            border: 1px solid #ccc;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }

          .calculation-block {
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            padding: 15px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            font-size: 11pt;
          }

          .page-break {
            page-break-after: always;
          }

          .no-break {
            page-break-inside: avoid;
          }

          .risk-medium {
            background-color: #fff3cd;
            color: #856404;
            padding: 5px 10px;
            border-radius: 3px;
            display: inline-block;
          }

          .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }

          .comparison-table td {
            padding: 12px;
            border: 1px solid #ddd;
            text-align: center;
          }

          .comparison-table th {
            background-color: #f5f5f5;
            font-weight: bold;
            padding: 12px;
            border: 1px solid #ddd;
          }

          .summary-box {
            background-color: #e8f5e8;
            border: 1px solid #4CAF50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }

          .value-highlight {
            font-size: 14pt;
            font-weight: bold;
            color: #2E7D32;
            margin: 5px 0;
          }
        </style>
      </head>
      <body>

        <!-- Страница 1: Титульный лист -->
        <div class="title-page">
          <div class="title-header">
            <p>Расчёты выполнены в рамках индивидуального проекта</p>
            <p>по дисциплине: МДК.01.03 Разработка мобильных приложений</p>
            <p>КМПО РАНХиГС</p>
          </div>

          <div class="title-main">
            <h1 style="font-size: 18pt; margin: 0 0 20px 0;">FrostRise</h1>
            
            <h2 style="font-size: 14pt; margin: 0 0 10px 0;">Отчёт о расчёте глубины промерзания</h2>
            <p style="font-size: 12pt; margin: 0 0 40px 0;">Методика: СП 121.13330.2012 "Аэродромы"</p>
            
            <div class="signature-container">
              <div class="signature-line">
                <span class="label">Разработчик:</span>
                <span class="name">Шишкина М.В.</span>
              </div>
              <div class="signature-line">
                <span class="label">Научный руководитель:</span>
                <span class="name">Шишкин В.Я.</span>
              </div>
            </div>

            <div style="margin-top: 60px;">
              <p>Дата расчета: ${date}</p>
            </div>
          </div>
        </div>

        <!-- Страница 2: Исходные данные и результаты -->
        <div class="content-page">
          <h1>Исходные данные</h1>

          <div class="no-break">
            <h2>Параметры грунта</h2>
            <table>
              <tr><th>Параметр</th><th>Значение</th></tr>
              <tr><td>Тип грунта (ИГЭ)</td><td>${inputData.selectedIGE || 'Не указано'}</td></tr>
              <tr><td>Подстилающий грунт</td><td>${inputData.subsoilName || inputData.soilData?.subsoilName || 'Не указано'}</td></tr>
              <tr><td>Теплопроводность (λ<sub>f</sub>)</td><td>${inputData.lambdaF || inputData.soilData?.lambdaF || 'Не указано'} Вт/(м·°C)</td></tr>
              <tr><td>Теплоёмкость (C<sub>f</sub>)</td><td>${inputData.cF || inputData.soilData?.cF || 'Не указано'} кДж/(м³·°C)</td></tr>
              <tr><td>Температура начала пучения (t<sub>0</sub>)</td><td>${inputData.t0 || inputData.soilData?.t0 || 'Не указано'} °C</td></tr>
              <tr><td>Плотность сухого грунта (ρ<sub>d</sub>)</td><td>${inputData.pd || inputData.soilData?.pd || 'Не указано'} кг/м³</td></tr>
              <tr><td>Влажность грунта (W)</td><td>${inputData.w || inputData.soilData?.w || 'Не указано'} д.е.</td></tr>
              <tr><td>Влажность на границе раскатывания (W<sub>p</sub>)</td><td>${inputData.wp || inputData.soilData?.wp || 'Не указано'} д.е.</td></tr>
              <tr><td>Число пластичности (I<sub>p</sub>)</td><td>${inputData.ip || inputData.soilData?.ip || 'Не указано'} д.е.</td></tr>
              <tr><td>Коэффициент k<sub>w</sub></td><td>${inputData.kw || 0.65}</td></tr>
            </table>
          </div>

          <div class="no-break">
            <h2>Климатические параметры</h2>
            <table>
              <tr><th>Параметр</th><th>Значение</th></tr>
              <tr><td>Средняя температура (θ<sub>mp</sub>)</td><td>${inputData.tcp || inputData.climateData?.tcp || 'Не указано'} °C</td></tr>
              <tr><td>Продолжительность периода отрицательных температур (τ<sub>f</sub>)</td><td>${inputData.tf || inputData.climateData?.tf || 'Не указано'} час</td></tr>
            </table>
          </div>

          <div class="no-break">
            <h2>Расчетные слои</h2>
            <table>
              <tr>
                <th>Слой</th>
                <th>Толщина, м</th>
                <th>Плотность, кг/м³</th>
                <th>Влажность, д.е.</th>
                <th>λ<sub>f</sub>, Вт/(м·°C)</th>
                <th>C<sub>f</sub>, кДж/(м³·°C)</th>
              </tr>
              ${inputData.layers?.filter(layer => layer.thickness && layer.density && layer.moisture).map((layer, index) => `
                <tr>
                  <td>${layer.name || `Слой ${index + 1}`}</td>
                  <td>${layer.thickness}</td>
                  <td>${layer.density}</td>
                  <td>${layer.moisture}</td>
                  <td>${layer.lambdaF || layer.lambda_f || '—'}</td>
                  <td>${layer.cF || layer.Cf || '—'}</td>
                </tr>
              `).join('') || '<tr><td colspan="6" style="text-align: center;">Нет данных о слоях</td></tr>'}
            </table>
            
            <div style="margin-top: 15px;">
              <p><strong>Общее количество слоев:</strong> ${inputData.layers?.filter(layer => layer.thickness && layer.density && layer.moisture).length || 0}</p>
              <p><strong>Общая толщина конструкционных слоев:</strong> ${inputData.layers?.filter(layer => layer.thickness && layer.density && layer.moisture).reduce((sum, layer) => sum + parseFloat(layer.thickness), 0).toFixed(3) || '0'} м</p>
            </div>
          </div>
        </div>

        <div class="page-break"></div>

        <!-- Страница 3: Результаты расчета -->
        <div class="content-page">
          <h1>Результаты расчета</h1>
          
          <div class="result-box">
            <div class="value-highlight">Глубина промерзания H<sub>n</sub> = ${result.Hn} м</div>
            <div class="value-highlight">Высота промороженной толщи H<sub>f</sub> = ${result.Hf} м</div>
            <p style="font-size: 12pt; margin: 15px 0;">
              <strong>Оценка риска:</strong> <span class="risk-medium">${result.riskLevel}</span>
            </p>
          </div>

          <h2>Сравнение параметров промерзания</h2>
          
          <table class="comparison-table">
            <tr>
              <th>Параметр</th>
              <th>${inputData.subsoilName || inputData.soilData?.subsoilName || 'Грунт'}</th>
              <th>Пеноплекс</th>
              <th>Разница</th>
              <th>Эффективность</th>
            </tr>
            <tr>
              <td><strong>H<sub>f</sub> (м)</strong><br/>Высота промороженной толщи</td>
              <td><strong>${result.Hf}</strong></td>
              <td><strong>${result.Hf_Penoplex}</strong></td>
              <td><strong>${Math.abs(hfSoil - hfPenoplex).toFixed(3)} м</strong></td>
              <td><strong style="color: #2E7D32;">${(hfSoil > 0 ? ((1 - hfPenoplex / hfSoil) * 100).toFixed(1) : '0')}%</strong></td>
            </tr>
            <tr>
              <td><strong>H<sub>n</sub> (м)</strong><br/>Глубина промерзания</td>
              <td><strong>${result.Hn}</strong></td>
              <td><strong>${result.Hn_Penoplex || '0'}</strong></td>
              <td><strong>${Math.abs(hnSoil - hnPenoplex).toFixed(3)} м</strong></td>
              <td><strong style="color: #2E7D32;">${(hnSoil > 0 ? ((1 - hnPenoplex / hnSoil) * 100).toFixed(1) : '0')}%</strong></td>
            </tr>
          </table>

          <div class="summary-box">
            <h3>Итоги применения Пеноплекса:</h3>
            <p>• Снижение высоты промороженной толщи на <strong>${Math.abs(hfSoil - hfPenoplex).toFixed(3)} м</strong></p>
            <p>• Снижение глубины промерзания на <strong>${Math.abs(hnSoil - hnPenoplex).toFixed(3)} м</strong></p>
            <p>• Общая эффективность теплоизоляции: <strong>${(hfSoil > 0 ? ((1 - hfPenoplex / hfSoil) * 100).toFixed(1) : '0')}%</strong></p>
          </div>
        </div>

        <div class="page-break"></div>

        <!-- Страница 4: Детали расчета -->
        <div class="content-page">
          <h1>Детали расчета</h1>

          ${detailedCalculations ? `
          <h2>1. Расчет η<sub>f</sub> для слоев</h2>
          <table>
            <tr>
              <th>Слой</th>
              <th>Толщина, м</th>
              <th>λ<sub>f</sub></th>
              <th>C<sub>f</sub></th>
              <th>ρ<sub>d</sub></th>
              <th>w</th>
              <th>η<sub>f</sub></th>
            </tr>
            ${detailedCalculations.layers?.map(layer => `
              <tr>
                <td>${layer.name || 'Слой'}</td>
                <td>${layer.thickness}</td>
                <td>${layer.lambda_f}</td>
                <td>${layer.Cf}</td>
                <td>${layer.pd}</td>
                <td>${layer.w}</td>
                <td>${layer.eta_f?.toFixed(1) || ''}</td>
              </tr>
            `).join('')}
          </table>

          <h2>2. Параметры расчета</h2>
          <div class="calculation-block">
            <p>Теплота фазового перехода (L) = ${detailedCalculations.L || 334} кДж/кг</p>
            <p>Коэффициент k<sub>w</sub> = ${detailedCalculations.kw || 0.65}</p>
            <p>Влажность незамерзающей воды (w<sub>w</sub>) = ${detailedCalculations.ww_soil?.toFixed(3)} д.е.</p>
            <p>Сумма Σ = ${detailedCalculations.sum_sigma?.toFixed(3)}</p>
          </div>

          <h2>3. Расчет глубины промерзания</h2>
          <div class="calculation-block">
            <p>Часть 1: 1.9 × √(2 × λ<sub>f</sub> × τ<sub>f</sub>) = ${detailedCalculations.part1?.toFixed(3)}</p>
            <p>Часть 2: √(θ<sub>mp</sub>/η<sub>f</sub>) - √(t<sub>0</sub>/η<sub>f0</sub>) = ${detailedCalculations.part2?.toFixed(6)}</p>
            <p>H<sub>n</sub> = Часть1 × Часть2 - Σ = ${detailedCalculations.Hn?.toFixed(3)} м</p>
          </div>
          ` : '<p>Детали расчета недоступны</p>'}
        </div>

      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false
    });

    return uri;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};