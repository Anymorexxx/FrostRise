import { PDFDocument, StandardFonts, rgb } from 'react-native-pdf-lib';

export const generatePDF = async (calculation) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    // Загружаем оба шрифта заранее
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 12;
    let y = 750;

    // Синхронная функция — без await
    const addText = (text, size = fontSize, useBold = false) => {
      page.drawText(text, {
        x: 50,
        y: y,
        size: size,
        font: useBold ? boldFont : regularFont,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    };

    addText('Отчет о расчёте глубины промерзания', 16, true);
    addText(`Дата: ${calculation.date}`);
    addText(`ИГЭ: ${calculation.inputData.selectedIGE}`);
    addText(`Толщина: ${calculation.inputData.thickness} м`);
    addText(`Плотность: ${calculation.inputData.density} кг/м³`);
    addText(`Влажность: ${calculation.inputData.moisture} д.е.`);
    addText(`df = ${calculation.result.df} м`, 14, true);
    addText(`Оценка риска: ${calculation.result.riskLevel}`, 14, true);

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Ошибка генерации PDF:', error);
    throw error;
  }
};