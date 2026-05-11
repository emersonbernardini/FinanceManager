/**
 * Funções Utilitárias
 * Conjunto de funções auxiliares usadas em todo o app
 */

import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FORMATS } from '../constants';

// ==================== FORMATAÇÃO DE MOEDA ====================

/**
 * Formata um valor para moeda brasileira
 * @param {number} value - Valor a formatar
 * @param {boolean} showSymbol - Mostrar símbolo R$
 * @returns {string} Valor formatado
 */
export const formatCurrency = (value, showSymbol = true) => {
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

  return showSymbol ? `R$ ${formatted}` : formatted;
};

/**
 * Remove formatação de moeda e retorna número
 * @param {string} formattedValue - Valor formatado
 * @returns {number} Valor numérico
 */
export const parseCurrency = (formattedValue) => {
  if (typeof formattedValue === 'number') return formattedValue;
  
  const cleaned = formattedValue.replace(/[^0-9,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

// ==================== FORMATAÇÃO DE DATA ====================

/**
 * Formata uma data para formato brasileiro
 * @param {string|Date} date - Data a formatar
 * @param {string} formatString - Formato desejado
 * @returns {string} Data formatada
 */
export const formatDate = (date, formatString = FORMATS.DATE) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Retorna uma data relativa (hoje, ontem, etc)
 * @param {string|Date} date - Data a formatar
 * @returns {string} Data relativa
 */
export const getRelativeDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Hoje';
    } else if (format(dateObj, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Ontem';
    } else {
      return formatDate(dateObj);
    }
  } catch (error) {
    return formatDate(date);
  }
};

// ==================== CÁLCULOS FINANCEIROS ====================

/**
 * Calcula o total de uma lista de transações
 * @param {Array} transactions - Lista de transações
 * @param {string} type - Tipo de transação ('income', 'expense', ou null para todas)
 * @returns {number} Total
 */
export const calculateTotal = (transactions, type = null) => {
  return transactions
    .filter(t => !type || t.type === type)
    .reduce((sum, t) => sum + (t.amount || 0), 0);
};

/**
 * Calcula gastos por categoria
 * @param {Array} transactions - Lista de transações
 * @param {Array} categories - Lista de categorias
 * @returns {Object} Objeto com total por categoria
 */
export const calculateByCategory = (transactions, categories) => {
  const result = {};
  
  categories.forEach(cat => {
    const total = transactions
      .filter(t => t.category === cat.id)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    if (total > 0) {
      result[cat.id] = {
        name: cat.name,
        total,
        color: cat.color,
        icon: cat.icon,
      };
    }
  });

  return result;
};

/**
 * Calcula a porcentagem de um valor em relação ao total
 * @param {number} value - Valor
 * @param {number} total - Total
 * @returns {number} Porcentagem (0-100)
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Filtra transações por período
 * @param {Array} transactions - Lista de transações
 * @param {Date} startDate - Data inicial
 * @param {Date} endDate - Data final
 * @returns {Array} Transações filtradas
 */
export const filterByPeriod = (transactions, startDate, endDate) => {
  return transactions.filter(t => {
    const date = parseISO(t.date);
    return isWithinInterval(date, { start: startDate, end: endDate });
  });
};

/**
 * Retorna transações do mês atual
 * @param {Array} transactions - Lista de transações
 * @returns {Array} Transações do mês
 */
export const getCurrentMonthTransactions = (transactions) => {
  const now = new Date();
  return filterByPeriod(
    transactions,
    startOfMonth(now),
    endOfMonth(now)
  );
};

// ==================== VALIDAÇÃO ====================

/**
 * Valida um email
 * @param {string} email - Email a validar
 * @returns {boolean} true se válido
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida um CPF
 * @param {string} cpf - CPF a validar
 * @returns {boolean} true se válido
 */
export const isValidCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
};

/**
 * Valida um CNPJ
 * @param {string} cnpj - CNPJ a validar
 * @returns {boolean} true se válido
 */
export const isValidCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]/g, '');

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

// ==================== FORMATAÇÃO DE TEXTO ====================

/**
 * Formata CPF para exibição
 * @param {string} cpf - CPF a formatar
 * @returns {string} CPF formatado (000.000.000-00)
 */
export const formatCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata CNPJ para exibição
 * @param {string} cnpj - CNPJ a formatar
 * @returns {string} CNPJ formatado (00.000.000/0000-00)
 */
export const formatCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]/g, '');
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Trunca um texto para um tamanho máximo
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Tamanho máximo
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ==================== GERAÇÃO DE CORES ====================

/**
 * Gera uma cor hexadecimal baseada em uma string
 * @param {string} str - String base
 * @returns {string} Cor hexadecimal
 */
export const generateColorFromString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const color = Math.floor(Math.abs((Math.sin(hash) * 16777215) % 1) * 16777215);
  return '#' + color.toString(16).padStart(6, '0');
};

/**
 * Escurece uma cor hexadecimal
 * @param {string} color - Cor hexadecimal
 * @param {number} percent - Porcentagem (0-100)
 * @returns {string} Cor escurecida
 */
export const darkenColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

// ==================== UTILITÁRIOS DE ARRAY ====================

/**
 * Agrupa um array por uma propriedade
 * @param {Array} array - Array a agrupar
 * @param {string} key - Propriedade para agrupar
 * @returns {Object} Objeto com arrays agrupados
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Ordena transações por data (mais recente primeiro)
 * @param {Array} transactions - Transações a ordenar
 * @returns {Array} Transações ordenadas
 */
export const sortByDate = (transactions) => {
  return [...transactions].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
};

// ==================== DEBOUNCE ====================

/**
 * Cria uma função debounced
 * @param {Function} func - Função a debounce
 * @param {number} delay - Delay em ms
 * @returns {Function} Função debounced
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};
