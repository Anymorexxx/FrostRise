// constants/colors.js

const lightTheme = {
  // Фон и шапка
  background: '#F3DAD2',
  header: '#7234ED',
  backArrow: '#7236A7',

  // Текст
  text: '#000000',
  constantText: '#897D72',     // константы из БД
  inputText: '#474747',       // редактируемые поля
  sectionTitle: '#747473',    // заголовки разделов (настройки, справка)

  // Поля ввода и границы
  inputBackground: '#EEEEEE',
  inputBorder: 'rgba(0, 0, 0, 0.5)',

  // Ссылки и интерактив
  historyLink: '#7EA6D9',
  link: '#7EA6D9',            // для "Политика конфиденциальности"

  // Кнопки
  primaryButton: '#8660C9',   // "Рассчитать", "Новый расчёт", "Очистить кэш"
  secondaryButton: '#B1B1B1', // неактивное состояние
  exportButton: '#9E81F6',

  // Оценка риска
  risk: {
    low: '#52BC6A',
    medium: '#F3CC56',
    high: '#BD3F4B',
  },

  // График
  chart: {
    sp: '#7289F8',   // СП 121.13330
    penoplex: '#FF8652',  // Пеноплекса
  },

  // История расчётов
  tag: '#7234ED',     // фон тегов ИГЭ и df
  noResults: '#747473',
  clearHistory: '#BD3F4B',
};

const darkTheme = {
  background: '#2B2B2B',
  header: '#5173E2',
  backArrow: '#9EB6F6',
  
  text: '#FFFFFF',
  constantText: '#AAAAAA',
  inputText: '#CCCCCC',
  sectionTitle: '#AAAAAA',

  inputBackground: '#3A3A3A',
  inputBorder: 'rgba(255, 255, 255, 0.3)',

  historyLink: '#7EA6D9',
  link: '#9EB6F6',

  primaryButton: '#5173E2',
  secondaryButton: '#444444',
  exportButton: '#7289F8',

  risk: {
    low: '#52BC6A',
    medium: '#F3CC56',
    high: '#BD3F4B',
  },

  chart: {
    sp: '#7289F8',
    penoplex: '#FF8652',
  },

  tag: '#5173E2',
  noResults: '#AAAAAA',
  clearHistory: '#BD3F4B',
};

// Для использования в компонентах
export default {
  light: lightTheme,
  dark: darkTheme,
  system: lightTheme, // system будет использовать light как fallback
};