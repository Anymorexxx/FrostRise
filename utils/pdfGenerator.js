// utils/pdfGenerator.js
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

export const generatePDF = async (calculationData, chartImageBase64 = '') => {
  try {
    const { inputData, result, date, calculationDetails, detailedCalculations } = calculationData;

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

          h1 {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin: 20px 0 10px 0;
          }

          h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 15px 0 8px 0;
          }

          .title-page {
            text-align: center;
            padding: 80px 0;
          }

          .section {
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            border: 1px solid #000;
          }

          th, td {
            padding: 8px;
            border: 1px solid #000;
            vertical-align: top;
          }

          th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
          }

          .result-box {
            background-color: #f9f9f9;
            border: 1px solid #ccc;
            padding: 15px;
            margin: 15px 0;
            text-align: center;
          }

          /* Футер — только на последней странице */
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-style: italic;
            font-size: 10pt;
            padding: 10px 0;
            background: white;
            border-top: 2px solid #000;
          }

          .page-break {
            page-break-after: always;
          }
        </style>
      </head>
      <body>

        <!-- Титульная страница -->
        <div class="title-page">
          <h1>FrostRise</h1>
          <h2>Отчёт о расчёте глубины промерзания</h2>
          <p>Дата расчета: ${date}</p>
        </div>

        <div class="page-break"></div>

        <!-- Исходные данные -->
        <div class="section">
          <h1>Исходные данные</h1>

          <h2>Параметры покрытия</h2>
          <table>
            <tr><th>Параметр</th><th>Значение</th></tr>
            <tr><td>Тип грунта (ИГЭ)</td><td>${inputData.selectedIGE || 'Не указано'}</td></tr>
            <tr><td>Теплопроводность (λ<sub>f</sub>)</td><td>${inputData.lambdaF || inputData.soilData?.lambdaF || 'Не указано'} Вт/(м·°C)</td></tr>
            <tr><td>Теплоёмкость (C<sub>f</sub>)</td><td>${inputData.cF || inputData.soilData?.cF || 'Не указано'} кДж/(м³·°C)</td></tr>
            <tr><td>Толщина покрытия</td><td>${inputData.layers?.[0]?.thickness || 'Не указано'} м</td></tr>
            <tr><td>Плотность покрытия</td><td>${inputData.layers?.[0]?.density || 'Не указано'} кг/м³</td></tr>
            <tr><td>Влажность покрытия</td><td>${inputData.layers?.[0]?.moisture || 'Не указано'} д.е.</td></tr>
          </table>

          <h2>Параметры грунта</h2>
          <table>
            <tr><th>Параметр</th><th>Значение</th></tr>
            <tr><td>Подстилающий грунт</td><td>${inputData.subsoilName || inputData.soilData?.subsoilName || 'Не указано'}</td></tr>
            <tr><td>Температура начала пучения (t<sub>0</sub>)</td><td>${inputData.t0 || inputData.soilData?.t0 || 'Не указано'} °C</td></tr>
            <tr><td>Плотность сухого грунта (ρ<sub>d</sub>)</td><td>${inputData.pd || inputData.soilData?.pd || 'Не указано'} кг/м³</td></tr>
            <tr><td>Влажность грунта (W)</td><td>${inputData.w || inputData.soilData?.w || 'Не указано'} д.е.</td></tr>
            <tr><td>Влажность на границе раскатывания (W<sub>p</sub>)</td><td>${inputData.wp || inputData.soilData?.wp || 'Не указано'} д.е.</td></tr>
            <tr><td>Число пластичности (J<sub>p</sub>)</td><td>${inputData.ip || inputData.soilData?.ip || 'Не указано'} д.е.</td></tr>
            <tr><td>Коэффициент k<sub>w</sub></td><td>${inputData.kw || 0.65}</td></tr>
          </table>

          <h2>Климатические параметры</h2>
          <table>
            <tr><th>Параметр</th><th>Значение</th></tr>
            <tr><td>Средняя температура (θ<sub>mp</sub>)</td><td>${inputData.tcp || inputData.climateData?.tcp || 'Не указано'} °C</td></tr>
            <tr><td>Продолжительность промерзания (τ<sub>f</sub>)</td><td>${inputData.tf || inputData.climateData?.tf || 'Не указано'} час</td></tr>
          </table>
        </div>

        <div class="page-break"></div>

        <!-- Результаты -->
        <div class="section">
          <h1>Результаты расчета</h1>
          <div class="result-box">
            <h2>Глубина промерзания H<sub>n</sub> = ${result.Hn} м</h2>
            <p>Оценка риска: ${result.riskLevel}</p>
          </div>

          <h2>Сравнение методик расчета</h2>
          <table>
            <tr><th>СП 121.13330.2012</th><th>ТСН МФ-97 МО</th></tr>
            <tr><td>${result.Hn} м</td><td>${result.Hn_TSN} м</td></tr>
          </table>
          <p style="text-align: center; margin-top: 10px;">
            <strong>Разница между методиками:</strong> ${Math.abs(result.Hn - result.Hn_TSN).toFixed(3)} м
          </p>
        </div>

        ${detailedCalculations ? `
        <div class="page-break"></div>
        <div class="section">
          <h1>Детали расчета</h1>

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

          <h2>2. Расчет суммы Σ</h2>
          <table>
            <tr><th>Параметр</th><th>Значение</th></tr>
            <tr><td>λ<sub>f</sub> грунта</td><td>${detailedCalculations.lambda_f_grunt}</td></tr>
            <tr><td>η<sub>f</sub> грунта</td><td>${detailedCalculations.eta_f_grunt?.toFixed(1)}</td></tr>
            <tr><td>Сумма Σ</td><td>${detailedCalculations.sum_sigma?.toFixed(3)}</td></tr>
          </table>

          <h2>3. Расчет глубины промерзания H<sub>n</sub></h2>
          <table>
            <tr><th>Параметр</th><th>Значение</th></tr>
            <tr><td>H<sub>n</sub></td><td>${detailedCalculations.Hn?.toFixed(3)} м</td></tr>
          </table>
        </div>
        ` : ''}

        <!-- Футер — только на последней странице -->
        <div class="footer">
          <p>Разработчик: Шишкина М.В.</p>
          <p>Научный руководитель: Шишкин В.Я.</p>
          <p>Методика: СП 121.13330.2012 "Аэродромы"</p>
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