/**
 * Constantes da aplicação
 * Arquivo centralizado com todas as constantes utilizadas no app
 */

// ==================== CORES ====================
export const COLORS = {
    light: {
        // Cores principais
        primary: '#00D4FF',
        primaryDark: '#0099CC',
        secondary: '#7C3AED',

        // Fundo claro
        background: '#FFFFFF',
        backgroundCard: '#F5F5F5',
        backgroundModal: '#FFFFFF',

        // Texto escuro
        text: '#000000',
        textSecondary: '#333333',
        textMuted: '#666666',

        // Funcionais
        success: '#00C851',
        danger: '#FF4444',
        warning: '#FFBB33',
        info: '#33B5E5',

        // Neutras
        white: '#FFFFFF',
        black: '#000000',
        gray: '#888888',

        // Transparências
        overlay: 'rgba(0,0,0,0.5)',
        cardBorder: '#E0E0E0',
    },

    dark: {
        // Cores principais
        primary: '#00D4FF',
        primaryDark: '#0099CC',
        secondary: '#7C3AED',

        // Fundo escuro
        background: '#0A0A0A',
        backgroundCard: '#141414',
        backgroundModal: '#1A1A1A',

        // Texto claro
        text: '#EEEEEE',
        textSecondary: '#AAAAAA',
        textMuted: '#666666',

        // Funcionais
        success: '#00FF88',
        danger: '#FF4444',
        warning: '#FFB800',
        info: '#00BFFF',

        // Neutras
        white: '#FFFFFF',
        black: '#000000',
        gray: '#888888',

        // Transparências
        overlay: 'rgba(0,0,0,0.7)',
        cardBorder: '#333333',
    },
};

// ==================== CATEGORIAS DE TRANSAÇÕES ====================
export const TRANSACTION_CATEGORIES = {
    // Categorias de Despesas
    EXPENSES: [
        { id: 'alimentacao', name: 'Alimentação', icon: 'utensils', color: '#FF6B6B' },
        { id: 'transporte', name: 'Transporte', icon: 'car', color: '#4ECDC4' },
        { id: 'moradia', name: 'Moradia', icon: 'home', color: '#95E1D3' },
        { id: 'saude', name: 'Saúde', icon: 'heartbeat', color: '#F38181' },
        { id: 'educacao', name: 'Educação', icon: 'graduation-cap', color: '#AA96DA' },
        { id: 'lazer', name: 'Lazer', icon: 'gamepad', color: '#FCBAD3' },
        { id: 'compras', name: 'Compras', icon: 'shopping-bag', color: '#F4C542' },
        { id: 'vestuario', name: 'Vestuário', icon: 'tshirt', color: '#A8D8EA' },
        { id: 'servicos', name: 'Serviços', icon: 'wrench', color: '#FFD93D' },
        { id: 'impostos', name: 'Impostos', icon: 'file-alt', color: '#6C5CE7' },
        { id: 'investimentos', name: 'Investimentos', icon: 'chart-line', color: '#00B894' },
        { id: 'outros_gastos', name: 'Outros', icon: 'ellipsis-h', color: '#636E72' },
    ],

    // Categorias de Receitas
    INCOME: [
        { id: 'salario', name: 'Salário', icon: 'briefcase', color: '#00D2D3' },
        { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#55EFC4' },
        { id: 'investimentos_renda', name: 'Rendimentos', icon: 'chart-line', color: '#74B9FF' },
        { id: 'vendas', name: 'Vendas', icon: 'shopping-cart', color: '#A29BFE' },
        { id: 'aluguel', name: 'Aluguel', icon: 'key', color: '#FD79A8' },
        { id: 'bonus', name: 'Bônus', icon: 'gift', color: '#FDCB6E' },
        { id: 'outros_ganhos', name: 'Outros', icon: 'ellipsis-h', color: '#636E72' },
    ],
};

// ==================== TIPOS DE CONTA ====================
export const ACCOUNT_TYPES = {
    PERSONAL: 'personal', // Pessoa Física
    BUSINESS: 'business', // Pessoa Jurídica
};

// ==================== TIPOS DE TRANSAÇÃO ====================
export const TRANSACTION_TYPES = {
    INCOME: 'income',    // Receita/Ganho
    EXPENSE: 'expense',  // Despesa/Gasto
};

// ==================== PERIODICIDADE ====================
export const RECURRENCE_TYPES = {
    NONE: 'none',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
};

// ==================== INSTITUIÇÕES FINANCEIRAS ====================
// Lista das principais instituições para integração Open Finance
export const FINANCIAL_INSTITUTIONS = [
    { id: 'bb', name: 'Banco do Brasil', logo: 'https://logo.clearbit.com/bb.com.br' },
    { id: 'caixa', name: 'Caixa Econômica', logo: 'https://logo.clearbit.com/caixa.gov.br' },
    { id: 'itau', name: 'Itaú Unibanco', logo: 'https://logo.clearbit.com/itau.com.br' },
    { id: 'bradesco', name: 'Bradesco', logo: 'https://logo.clearbit.com/bradesco.com.br' },
    { id: 'santander', name: 'Santander', logo: 'https://logo.clearbit.com/santander.com.br' },
    { id: 'nubank', name: 'Nubank', logo: 'https://logo.clearbit.com/nubank.com.br' },
    { id: 'inter', name: 'Banco Inter', logo: 'https://logo.clearbit.com/bancointer.com.br' },
    { id: 'c6', name: 'C6 Bank', logo: 'https://logo.clearbit.com/c6bank.com.br' },
    { id: 'original', name: 'Banco Original', logo: 'https://logo.clearbit.com/original.com.br' },
    { id: 'safra', name: 'Banco Safra', logo: 'https://logo.clearbit.com/safra.com.br' },
];

// ==================== CONFIGURAÇÕES DE STORAGE ====================
export const STORAGE_KEYS = {
    TRANSACTIONS: '@finance_transactions',
    ACCOUNT_TYPE: '@finance_account_type',
    USER_SETTINGS: '@finance_user_settings',
    BANK_CONNECTIONS: '@finance_bank_connections',
    CATEGORIES: '@finance_categories',
    BUDGETS: '@finance_budgets',
};

// ==================== CONFIGURAÇÕES DE API ====================
export const API_CONFIG = {
    // Open Finance API (quando implementada)
    OPEN_FINANCE_BASE_URL: 'https://api.openfinance.example.com',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
};

// ==================== FORMATOS ====================
export const FORMATS = {
    DATE: 'dd/MM/yyyy',
    DATE_TIME: 'dd/MM/yyyy HH:mm',
    CURRENCY: 'pt-BR',
};

// ==================== LIMITES ====================
export const LIMITS = {
    MAX_TRANSACTION_DESCRIPTION: 100,
    MAX_CATEGORY_NAME: 30,
    TRANSACTIONS_PER_PAGE: 20,
};
