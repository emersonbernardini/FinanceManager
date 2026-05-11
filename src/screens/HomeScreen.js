/**
 * HomeScreen - Dashboard Principal
 * Tela com dashboard funcional mostrando saldo, receitas, despesas e gráficos
 */

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Alert,
    TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ScreenContainer } from '../components/ScreenContainer';
import { DashboardCard } from '../components/DashboardCard';
import { TransactionItem } from '../components/TransactionItem';
import { TransactionModal } from '../components/TransactionModal';
import { useTransactions } from '../hooks/useTransactions';
import { TRANSACTION_CATEGORIES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, getCurrentMonthTransactions, calculateByCategory } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width;

export function HomeScreen() {
    const { theme, isDark, isLoading } = useTheme();
    const navigation = useNavigation();

    const {
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getMonthTotals,
        getTotals,
        refresh,
    } = useTransactions();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00D4FF" />
            </View>
        );
    }

    const styles = getStyles(theme);

    // Mês atual para receitas/despesas; totais gerais para saldo acumulado real
    const { income, expenses } = getMonthTotals();
    const { balance } = getTotals();

    const monthTransactions = getCurrentMonthTransactions(transactions);
    const recentTransactions = transactions.slice(0, 5);

    // Gráfico de pizza — gastos do mês por categoria
    const expensesByCategory = calculateByCategory(
        monthTransactions.filter(t => t.type === 'expense'),
        [...TRANSACTION_CATEGORIES.EXPENSES]
    );
    const pieData = Object.entries(expensesByCategory).map(([, data]) => ({
        name: data.name,
        amount: data.total,
        color: data.color,
        legendFontColor: theme.text,
        legendFontSize: 11,
    }));

    // Gráfico de linha — movimentação diária dos últimos 7 dias
    const buildLineChartData = () => {
        const now = new Date();
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (6 - i));
            return d;
        });
        const labels = days.map(d => `${d.getDate()}/${d.getMonth() + 1}`);
        const data = days.map(day => {
            const dayStr = day.toISOString().split('T')[0];
            return transactions
                .filter(t => t.date.startsWith(dayStr))
                .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        });
        return {
            labels,
            datasets: [{
                data,
                color: (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
                strokeWidth: 2,
            }],
        };
    };
    const lineChartData = buildLineChartData();
    const hasLineData = lineChartData.datasets[0].data.some(v => v !== 0);

    const handleAddTransaction = async (transactionData) => {
        try {
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, transactionData);
            } else {
                await addTransaction(transactionData);
            }
            setModalVisible(false);
            setEditingTransaction(null);
        } catch (error) {
            console.error('Erro ao salvar transação:', error);
        }
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setModalVisible(true);
    };

    // Bug #17 fix: sempre pede confirmação antes de deletar
    const handleDeleteTransaction = (id) => {
        Alert.alert(
            'Excluir Transação',
            'Tem certeza que deseja excluir esta transação?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTransaction(id);
                        } catch (error) {
                            console.error('Erro ao deletar transação:', error);
                        }
                    },
                },
            ]
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    };

    return (
        <ScreenContainer>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Olá! 👋</Text>
                        <Text style={styles.subtitle}>Suas finanças de hoje</Text>
                    </View>
                    {/* Bug #6 fix: sino navega para Configurações */}
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => navigation.navigate('Configurações')}
                    >
                        <FontAwesome5 name="bell" size={20} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Cards de Resumo */}
                <View style={styles.cardsContainer}>
                    <DashboardCard
                        title="Saldo Acumulado"
                        value={balance}
                        icon="wallet"
                        color={balance >= 0 ? theme.primary : theme.danger}
                    />
                    <DashboardCard
                        title="Receitas do Mês"
                        value={income}
                        icon="arrow-up"
                        color={theme.success}
                    />
                    <DashboardCard
                        title="Despesas do Mês"
                        value={expenses}
                        icon="arrow-down"
                        color={theme.danger}
                    />
                </View>

                {/* Gráfico de Linha */}
                {hasLineData && (
                    <View style={styles.chartContainer}>
                        <Text style={styles.sectionTitle}>Movimentação Diária (7 dias)</Text>
                        <LineChart
                            data={lineChartData}
                            width={screenWidth - 40}
                            height={180}
                            chartConfig={{
                                backgroundColor: theme.backgroundCard,
                                backgroundGradientFrom: theme.backgroundCard,
                                backgroundGradientTo: theme.backgroundCard,
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
                                labelColor: (opacity = 1) => isDark
                                    ? `rgba(170, 170, 170, ${opacity})`
                                    : `rgba(80, 80, 80, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: { r: '4', strokeWidth: '2', stroke: theme.primary },
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                )}

                {/* Gráfico de Pizza */}
                <View style={styles.chartContainer}>
                    <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
                    {pieData.length > 0 ? (
                        <PieChart
                            data={pieData}
                            width={screenWidth - 40}
                            height={200}
                            chartConfig={{ color: (opacity = 1) => `rgba(255,255,255,${opacity})` }}
                            accessor="amount"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    ) : (
                        // Bug #22 fix: mensagem quando não há dados
                        <View style={styles.emptyChart}>
                            <FontAwesome5 name="chart-pie" size={32} color={theme.textMuted} />
                            <Text style={styles.emptyChartText}>
                                Nenhuma despesa categorizada este mês
                            </Text>
                        </View>
                    )}
                </View>

                {/* Transações Recentes */}
                <View style={styles.recentContainer}>
                    <View style={styles.recentHeader}>
                        <Text style={styles.sectionTitle}>Transações Recentes</Text>
                        {/* Bug #5 fix: navega para aba Transações */}
                        <TouchableOpacity onPress={() => navigation.navigate('Transações')}>
                            <Text style={styles.seeAllButton}>Ver todas</Text>
                        </TouchableOpacity>
                    </View>

                    {recentTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <FontAwesome5 name="inbox" size={48} color={theme.textMuted} />
                            <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
                            <Text style={styles.emptySubtext}>
                                Toque no botão + para adicionar sua primeira transação
                            </Text>
                        </View>
                    ) : (
                        recentTransactions.map((transaction) => (
                            <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                                onPress={() => handleEditTransaction(transaction)}
                                onLongPress={() => handleDeleteTransaction(transaction.id)}
                            />
                        ))
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    setEditingTransaction(null);
                    setModalVisible(true);
                }}
                activeOpacity={0.8}
            >
                <FontAwesome5 name="plus" size={24} color={theme.white} />
            </TouchableOpacity>

            <TransactionModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingTransaction(null);
                }}
                onSave={handleAddTransaction}
                transaction={editingTransaction}
            />
        </ScreenContainer>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 10,
    },
    greeting: { fontSize: 28, fontWeight: '700', color: theme.text },
    subtitle: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.backgroundCard,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardsContainer: { padding: 20, paddingTop: 0 },
    chartContainer: { padding: 20, paddingTop: 0 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 },
    chart: { borderRadius: 16 },
    emptyChart: {
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.backgroundCard,
        borderRadius: 16,
        gap: 8,
    },
    emptyChartText: { fontSize: 14, color: theme.textMuted, textAlign: 'center' },
    recentContainer: { padding: 20, paddingTop: 0 },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllButton: { color: theme.primary, fontSize: 14, fontWeight: '600' },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.textSecondary, marginTop: 16 },
    emptySubtext: { fontSize: 14, color: theme.textMuted, marginTop: 8, textAlign: 'center' },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
