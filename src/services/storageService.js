/**
 * Serviço de Storage
 * Gerencia todas as operações de armazenamento local usando AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { Transaction, Category, BankAccount, Budget } from '../models';

class StorageService {
  // ==================== TRANSAÇÕES ====================
  
  /**
   * Busca todas as transações
   * @returns {Promise<Array<Transaction>>} Lista de transações
   */
  async getTransactions() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map(t => Transaction.fromJSON(t));
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
  }

  /**
   * Salva uma nova transação
   * @param {Transaction} transaction - Transação a ser salva
   * @returns {Promise<Transaction>} Transação salva
   */
  async saveTransaction(transaction) {
    try {
      const transactions = await this.getTransactions();
      transactions.push(transaction);
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions.map(t => t.toJSON()))
      );
      return transaction;
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma transação existente
   * @param {string} id - ID da transação
   * @param {Object} updates - Dados a atualizar
   * @returns {Promise<Transaction>} Transação atualizada
   */
  async updateTransaction(id, updates) {
    try {
      const transactions = await this.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error('Transação não encontrada');
      }

      transactions[index].update(updates);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions.map(t => t.toJSON()))
      );
      
      return transactions[index];
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
  }

  /**
   * Remove uma transação
   * @param {string} id - ID da transação
   * @returns {Promise<boolean>} true se removida com sucesso
   */
  async deleteTransaction(id) {
    try {
      const transactions = await this.getTransactions();
      const filtered = transactions.filter(t => t.id !== id);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(filtered.map(t => t.toJSON()))
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      throw error;
    }
  }

  // ==================== CATEGORIAS ====================

  /**
   * Busca todas as categorias (padrão + personalizadas)
   * @returns {Promise<Array<Category>>} Lista de categorias
   */
  async getCategories() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map(c => Category.fromJSON(c));
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  /**
   * Salva uma nova categoria personalizada
   * @param {Category} category - Categoria a ser salva
   * @returns {Promise<Category>} Categoria salva
   */
  async saveCategory(category) {
    try {
      const categories = await this.getCategories();
      categories.push(category);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(categories.map(c => c.toJSON()))
      );
      
      return category;
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      throw error;
    }
  }

  /**
   * Remove uma categoria personalizada
   * @param {string} id - ID da categoria
   * @returns {Promise<boolean>} true se removida com sucesso
   */
  async deleteCategory(id) {
    try {
      const categories = await this.getCategories();
      const filtered = categories.filter(c => c.id !== id);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(filtered.map(c => c.toJSON()))
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  }

  // ==================== CONTAS BANCÁRIAS ====================

  /**
   * Busca todas as contas bancárias conectadas
   * @returns {Promise<Array<BankAccount>>} Lista de contas
   */
  async getBankAccounts() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BANK_CONNECTIONS);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map(b => BankAccount.fromJSON(b));
    } catch (error) {
      console.error('Erro ao buscar contas bancárias:', error);
      return [];
    }
  }

  /**
   * Salva uma nova conta bancária
   * @param {BankAccount} account - Conta a ser salva
   * @returns {Promise<BankAccount>} Conta salva
   */
  async saveBankAccount(account) {
    try {
      const accounts = await this.getBankAccounts();
      accounts.push(account);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.BANK_CONNECTIONS,
        JSON.stringify(accounts.map(a => a.toJSON()))
      );
      
      return account;
    } catch (error) {
      console.error('Erro ao salvar conta bancária:', error);
      throw error;
    }
  }

  /**
   * Remove uma conta bancária
   * @param {string} id - ID da conta
   * @returns {Promise<boolean>} true se removida com sucesso
   */
  async deleteBankAccount(id) {
    try {
      const accounts = await this.getBankAccounts();
      const filtered = accounts.filter(a => a.id !== id);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.BANK_CONNECTIONS,
        JSON.stringify(filtered.map(a => a.toJSON()))
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar conta bancária:', error);
      throw error;
    }
  }

  // ==================== CONFIGURAÇÕES ====================

  /**
   * Busca o tipo de conta do usuário (PF ou PJ)
   * @returns {Promise<string>} Tipo de conta
   */
  async getAccountType() {
    try {
      const type = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_TYPE);
      return type || 'personal';
    } catch (error) {
      console.error('Erro ao buscar tipo de conta:', error);
      return 'personal';
    }
  }

  /**
   * Define o tipo de conta do usuário
   * @param {string} type - 'personal' ou 'business'
   * @returns {Promise<void>}
   */
  async setAccountType(type) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNT_TYPE, type);
    } catch (error) {
      console.error('Erro ao definir tipo de conta:', error);
      throw error;
    }
  }

  /**
   * Busca as configurações do usuário
   * @returns {Promise<Object>} Configurações
   */
  async getUserSettings() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return {};
    }
  }

  /**
   * Salva as configurações do usuário
   * @param {Object} settings - Configurações a serem salvas
   * @returns {Promise<void>}
   */
  async saveUserSettings(settings) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  }

  // ==================== ORÇAMENTOS ====================

  /**
   * Busca todos os orçamentos
   * @returns {Promise<Array<Budget>>} Lista de orçamentos
   */
  async getBudgets() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map(b => Budget.fromJSON(b));
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      return [];
    }
  }

  /**
   * Salva um novo orçamento
   * @param {Budget} budget - Orçamento a ser salvo
   * @returns {Promise<Budget>} Orçamento salvo
   */
  async saveBudget(budget) {
    try {
      const budgets = await this.getBudgets();
      budgets.push(budget);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.BUDGETS,
        JSON.stringify(budgets.map(b => b.toJSON()))
      );
      
      return budget;
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      throw error;
    }
  }

  // ==================== GENÉRICOS ====================

  /**
   * Busca um valor genérico pelo key
   * @param {string} key - Chave do AsyncStorage
   * @returns {Promise<string|null>} Valor armazenado
   */
  async get(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Erro ao buscar valor:', error);
      return null;
    }
  }

  /**
   * Salva um valor genérico pelo key
   * @param {string} key - Chave do AsyncStorage
   * @param {string} value - Valor a ser salvo
   * @returns {Promise<void>}
   */
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Erro ao salvar valor:', error);
      throw error;
    }
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Limpa todos os dados do app (usar com cautela!)
   * @returns {Promise<void>}
   */
  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }

  /**
   * Exporta todos os dados para backup
   * @returns {Promise<Object>} Objeto com todos os dados
   */
  async exportData() {
    try {
      const [transactions, categories, accounts, budgets, settings, accountType] = 
        await Promise.all([
          this.getTransactions(),
          this.getCategories(),
          this.getBankAccounts(),
          this.getBudgets(),
          this.getUserSettings(),
          this.getAccountType(),
        ]);

      return {
        transactions: transactions.map(t => t.toJSON()),
        categories: categories.map(c => c.toJSON()),
        accounts: accounts.map(a => a.toJSON()),
        budgets: budgets.map(b => b.toJSON()),
        settings,
        accountType,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }
}

// Exporta uma instância única do serviço (Singleton)
export default new StorageService();
