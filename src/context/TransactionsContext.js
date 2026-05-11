/**
 * TransactionsContext
 * Estado global de transações compartilhado entre todas as telas.
 * Resolve o problema de cada tela instanciar useTransactions() de forma isolada.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storageService from '../services/storageService';
import { Transaction } from '../models';
import { sortByDate, getCurrentMonthTransactions, calculateTotal } from '../utils/helpers';

const TransactionsContext = createContext(null);

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storageService.getTransactions();
      setTransactions(sortByDate(data));
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar transações:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = useCallback(async (transactionData) => {
    try {
      const newTransaction = new Transaction(transactionData);
      if (!newTransaction.isValid()) throw new Error('Dados da transação inválidos');
      await storageService.saveTransaction(newTransaction);
      setTransactions(prev => sortByDate([newTransaction, ...prev]));
      return newTransaction;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateTransaction = useCallback(async (id, updates) => {
    try {
      const updated = await storageService.updateTransaction(id, updates);
      setTransactions(prev => sortByDate(prev.map(t => (t.id === id ? updated : t))));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await storageService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteMultipleTransactions = useCallback(async (ids) => {
    try {
      await Promise.all(ids.map(id => storageService.deleteTransaction(id)));
      setTransactions(prev => prev.filter(t => !ids.includes(t.id)));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getTransactionsByType = useCallback((type) =>
    transactions.filter(t => t.type === type), [transactions]);

  const getTransactionsByCategory = useCallback((categoryId) =>
    transactions.filter(t => t.category === categoryId), [transactions]);

  const searchTransactions = useCallback((query) => {
    const lowerQuery = query.toLowerCase();
    return transactions.filter(t =>
      t.description.toLowerCase().includes(lowerQuery) ||
      t.notes?.toLowerCase().includes(lowerQuery)
    );
  }, [transactions]);

  const getMonthTransactions = useCallback(() =>
    getCurrentMonthTransactions(transactions), [transactions]);

  const getTotals = useCallback(() => {
    const income = calculateTotal(transactions, 'income');
    const expenses = calculateTotal(transactions, 'expense');
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const getMonthTotals = useCallback(() => {
    const monthTransactions = getCurrentMonthTransactions(transactions);
    const income = calculateTotal(monthTransactions, 'income');
    const expenses = calculateTotal(monthTransactions, 'expense');
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const refresh = useCallback(() => loadTransactions(), []);
  const clearError = useCallback(() => setError(null), []);

  return (
    <TransactionsContext.Provider value={{
      transactions, loading, error,
      addTransaction, updateTransaction, deleteTransaction, deleteMultipleTransactions,
      getTransactionsByType, getTransactionsByCategory, searchTransactions,
      getMonthTransactions, getTotals, getMonthTotals,
      refresh, clearError,
    }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error('useTransactions deve ser usado dentro de TransactionsProvider');
  return context;
}
