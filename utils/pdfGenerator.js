// utils/pdfGenerator.js
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

export const generatePDF = async (calculationData) => {
  try {
    const { inputData, result, date, calculationDetails } = calculationData;

    // Создаем HTML контент для PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
          }
          .data-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .data-label {
            font-weight: bold;
            color: #555;
          }
          .result-box {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #7234ED;
          }
          .risk-${result.riskLevel.includes('Низкий') ? 'low' : result.riskLevel.includes('Средний') ? 'medium' : 'high'} {
            background-color: ${result.riskLevel.includes('Низкий') ? '#d4edda' : result.riskLevel.includes('Средний') ? '#fff3cd' : '#f8d7da'};
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
          }
          .comparison {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
          }
          .method {
            text-align: center;
            padding: 10px;
          }
          .calculation-details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
          }
          .formula {
            font-family: monospace;
            background-color: #e9ecef;
            padding: 10px;
            border-radius: 3px;
            margin: 10px 0;
            font-size: 14px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .sub-section {
            margin-left: 20px;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FrostRise</h1>
          <h2>Отчёт о расчёте глубины промерзания</h2>
          <p>Дата расчета: ${date}</p>
        </div>

        <div class="section">
          <div class="section-title">Исходные данные</div>
          
          <div class="sub-section">
            <div class="section-title" style="font-size: 16px;">Параметры покрытия</div>
            <div class="data-row">
              <span class="data-label">Тип грунта (ИГЭ):</span>
              <span>${inputData.selectedIGE}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Теплопроводность (λf):</span>
              <span>${inputData.lambdaF} Вт/(м·°C)</span>
            </div>
            <div class="data-row">
              <span class="data-label">Теплоёмкость (Cf):</span>
              <span>${inputData.cF} кДж/(м³·°C)</span>
            </div>
            <div class="data-row">
              <span class="data-label">Толщина покрытия:</span>
              <span>${inputData.thickness} м</span>
            </div>
            <div class="data-row">
              <span class="data-label">Плотность покрытия:</span>
              <span>${inputData.density} кг/м³</span>
            </div>
            <div class="data-row">
              <span class="data-label">Влажность покрытия:</span>
              <span>${inputData.moisture} д.е.</span>
            </div>
          </div>

          <div class="sub-section">
            <div class="section-title" style="font-size: 16px;">Параметры грунта</div>
            <div class="data-row">
              <span class="data-label">Подстилающий грунт:</span>
              <span>${inputData.subsoilName}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Температура начала пучения (t0):</span>
              <span>${inputData.t0} °C</span>
            </div>
            <div class="data-row">
              <span class="data-label">Плотность сухого грунта (pd):</span>
              <span>${inputData.pd} кг/м³</span>
            </div>
            <div class="data-row">
              <span class="data-label">Влажность грунта (W):</span>
              <span>${inputData.w} д.е.</span>
            </div>
            <div class="data-row">
              <span class="data-label">Влажность на границе раскатывания (Wp):</span>
              <span>${inputData.wp} д.е.</span>
            </div>
            <div class="data-row">
              <span class="data-label">Число пластичности (Jp):</span>
              <span>${inputData.ip} д.е.</span>
            </div>
          </div>

          <div class="sub-section">
            <div class="section-title" style="font-size: 16px;">Климатические параметры</div>
            <div class="data-row">
              <span class="data-label">Средняя температура (Tcp):</span>
              <span>${inputData.tcp} °C</span>
            </div>
            <div class="data-row">
              <span class="data-label">Продолжительность промерзания (Tf):</span>
              <span>${inputData.tf} час</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Результаты расчета</div>
          <div class="result-box">
            <div style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 10px;">
              Глубина промерзания Hₙ = ${result.Hn} м
            </div>
            <div class="risk-${result.riskLevel.includes('Низкий') ? 'low' : result.riskLevel.includes('Средний') ? 'medium' : 'high'}">
              Оценка риска: ${result.riskLevel}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Сравнение методик</div>
          <div class="comparison">
            <div class="method">
              <div style="font-weight: bold;">СП 121.13330.2012</div>
              <div style="font-size: 18px;">${result.Hn} м</div>
            </div>
            <div class="method">
              <div style="font-weight: bold;">ТСН МФ-97 МО</div>
              <div style="font-size: 18px;">${result.Hn_TSN} м</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Методика расчета</div>
          <div class="calculation-details">
            <p><strong>Формула E.1 СП 121.13330.2012:</strong></p>
            <div class="formula">
              Hₙ = 1.9 × √(2λfτf) × (√(θmp/ηf) - √(t₀/ηf₀)) - Σ[tᵢ × √(λfηfᵢ/λfᵢηf)]
            </div>
            <p><strong>Расчет количества тепла фазовых переходов:</strong></p>
            <div class="formula">
              ηf = 0.5 × θmp × Cf + ρd × (w - ww) × 334
            </div>
            ${calculationDetails ? `
              <p><strong>Детали расчета:</strong></p>
              <div class="data-row">
                <span class="data-label">Сумма слоев (Σ):</span>
                <span>${calculationDetails.summation}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Часть 1 (1.9√(2λfτf)):</span>
                <span>${calculationDetails.part1}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Часть 2 (√(θmp/ηf) - √(t₀/ηf₀)):</span>
                <span>${calculationDetails.part2}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="footer">
          <p>Сгенерировано приложением FrostRise</p>
          <p>Разработчик: Шишкина М.В.</p>
          <p>Научный руководитель: Шишкин В.Я.</p>
          <p>Методика: СП 121.13330.2012 "Аэродромы"</p>
        </div>
      </body>
      </html>
    `;

    // Генерируем PDF
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