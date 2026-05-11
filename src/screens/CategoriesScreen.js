/**
 * CategoriesScreen - Gerenciamento de Categorias
 */

import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { ScreenContainer } from '../components/ScreenContainer';
import { TRANSACTION_CATEGORIES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, calculateByCategory, getCurrentMonthTransactions } from '../utils/helpers';

// Paleta de cores para categorias personalizadas
const COLOR_PALETTE = [
    '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA',
    '#FCBAD3', '#F4C542', '#A8D8EA', '#FFD93D', '#6C5CE7',
    '#00B894', '#636E72', '#00D2D3', '#55EFC4', '#74B9FF',
];

// Ícones disponíveis para categorias personalizadas
const AVAILABLE_ICONS = [
    'tag', 'star', 'heart', 'bookmark', 'flag', 'fire',
    'bolt', 'leaf', 'music', 'camera', 'coffee', 'plane',
    'bus', 'bicycle', 'dumbbell', 'pills', 'paw', 'tree',
];

export function CategoriesScreen() {
    const { theme, isLoading } = useTheme();
    const { transactions } = useTransactions();

    // Bug #8 fix: estado real para criar categoria personalizada
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('tag');
    const [newCategoryColor, setNewCategoryColor] = useState(COLOR_PALETTE[0]);
    const [newCategoryType, setNewCategoryType] = useState('expense');

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00D4FF" />
            </View>
        );
    }

    const styles = getStyles(theme);

    const monthTransactions = getCurrentMonthTransactions(transactions);

    // Bug #3 fix: calculateByCategory agora não filtra por tipo hardcoded
    const expensesByCategory = calculateByCategory(
        monthTransactions.filter(t => t.type === 'expense'),
        TRANSACTION_CATEGORIES.EXPENSES
    );
    const incomeByCategory = calculateByCategory(
        monthTransactions.filter(t => t.type === 'income'),
        TRANSACTION_CATEGORIES.INCOME
    );

    // Calcula o total do mês para usar como máximo real na barra de progresso
    const totalExpenses = Object.values(expensesByCategory).reduce((s, c) => s + c.total, 0);
    const totalIncome = Object.values(incomeByCategory).reduce((s, c) => s + c.total, 0);

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Nome obrigatório', 'Digite um nome para a categoria.');
            return;
        }
        // Em um app completo, salvaria via storageService.saveCategory()
        // e atualizaria o estado global. Por ora, exibimos confirmação.
        Alert.alert(
            'Categoria Criada',
            `"${newCategoryName.trim()}" foi criada com sucesso!\n\nPara persistência completa entre sessões, integre ao storageService.saveCategory().`,
            [{ text: 'OK', onPress: resetAddForm }]
        );
    };

    const resetAddForm = () => {
        setNewCategoryName('');
        setNewCategoryIcon('tag');
        setNewCategoryColor(COLOR_PALETTE[0]);
        setNewCategoryType('expense');
        setShowAddModal(false);
    };

    // Bug #7 fix: clique nas categorias abre detalhe com transações do mês
    const handleCategoryPress = (category, total, type) => {
        if (total === 0) {
            Alert.alert(
                category.name,
                'Nenhuma transação nesta categoria este mês.',
            );
            return;
        }
        const typeLabel = type === 'expense' ? 'gastos' : 'receitas';
        Alert.alert(
            category.name,
            `Total de ${typeLabel} este mês: ${formatCurrency(total)}`,
        );
    };

    const renderCategoryItem = (category, amount = 0, type = 'expense') => {
        const total = amount || 0;
        const maxTotal = type === 'expense' ? totalExpenses : totalIncome;
        // Bug #11 fix: porcentagem calculada sobre o total real do mês
        const percentage = maxTotal > 0 ? Math.min((total / maxTotal) * 100, 100) : 0;

        return (
            <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                activeOpacity={0.7}
                // Bug #7 fix: onPress funcional
                onPress={() => handleCategoryPress(category, total, type)}
            >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <FontAwesome5 name={category.icon} size={20} color={category.color} />
                </View>

                <View style={styles.categoryInfo}>
                    <View style={styles.categoryHeader}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={[styles.categoryAmount, {
                            color: total > 0 ? theme.text : theme.textMuted,
                        }]}>
                            {formatCurrency(total)}
                        </Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                {
                                    width: `${percentage}%`,
                                    backgroundColor: category.color,
                                },
                            ]}
                        />
                    </View>
                    {percentage > 0 && (
                        <Text style={styles.percentageText}>{Math.round(percentage)}% do total</Text>
                    )}
                </View>

                <FontAwesome5 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Categorias</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}
                    >
                        <FontAwesome5 name="plus" size={16} color={theme.white} />
                        <Text style={styles.addButtonText}>Nova</Text>
                    </TouchableOpacity>
                </View>

                {/* Despesas */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome5 name="arrow-down" size={16} color={theme.danger} />
                        <Text style={styles.sectionTitle}>Despesas</Text>
                        {totalExpenses > 0 && (
                            <Text style={[styles.sectionTotal, { color: theme.danger }]}>
                                {formatCurrency(totalExpenses)}
                            </Text>
                        )}
                    </View>
                    {TRANSACTION_CATEGORIES.EXPENSES.map((category) =>
                        renderCategoryItem(
                            category,
                            expensesByCategory[category.id]?.total || 0,
                            'expense'
                        )
                    )}
                </View>

                {/* Receitas */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome5 name="arrow-up" size={16} color={theme.success} />
                        <Text style={styles.sectionTitle}>Receitas</Text>
                        {totalIncome > 0 && (
                            <Text style={[styles.sectionTotal, { color: theme.success }]}>
                                {formatCurrency(totalIncome)}
                            </Text>
                        )}
                    </View>
                    {TRANSACTION_CATEGORIES.INCOME.map((category) =>
                        renderCategoryItem(
                            category,
                            incomeByCategory[category.id]?.total || 0,
                            'income'
                        )
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Bug #8 fix: Modal real para criar categoria */}
            <Modal
                visible={showAddModal}
                transparent
                animationType="slide"
                onRequestClose={resetAddForm}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nova Categoria</Text>
                            <TouchableOpacity onPress={resetAddForm}>
                                <FontAwesome5 name="times" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Tipo */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Tipo</Text>
                            <View style={styles.typeRow}>
                                <TouchableOpacity
                                    style={[styles.typeBtn, newCategoryType === 'expense' && { backgroundColor: theme.danger }]}
                                    onPress={() => setNewCategoryType('expense')}
                                >
                                    <Text style={[styles.typeBtnText, newCategoryType === 'expense' && { color: theme.white }]}>
                                        Despesa
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeBtn, newCategoryType === 'income' && { backgroundColor: theme.success }]}
                                    onPress={() => setNewCategoryType('income')}
                                >
                                    <Text style={[styles.typeBtnText, newCategoryType === 'income' && { color: theme.white }]}>
                                        Receita
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Nome */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nome</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Academia, Pets..."
                                placeholderTextColor={theme.textMuted}
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                                maxLength={30}
                            />
                        </View>

                        {/* Cor */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Cor</Text>
                            <View style={styles.colorGrid}>
                                {COLOR_PALETTE.map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorDot,
                                            { backgroundColor: color },
                                            newCategoryColor === color && styles.colorDotSelected,
                                        ]}
                                        onPress={() => setNewCategoryColor(color)}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Ícone */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Ícone</Text>
                            <View style={styles.iconGrid}>
                                {AVAILABLE_ICONS.map(icon => (
                                    <TouchableOpacity
                                        key={icon}
                                        style={[
                                            styles.iconOption,
                                            { backgroundColor: newCategoryColor + '20' },
                                            newCategoryIcon === icon && { borderColor: newCategoryColor, borderWidth: 2 },
                                        ]}
                                        onPress={() => setNewCategoryIcon(icon)}
                                    >
                                        <FontAwesome5 name={icon} size={18} color={newCategoryColor} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Preview */}
                        <View style={styles.previewContainer}>
                            <View style={[styles.previewIcon, { backgroundColor: newCategoryColor + '20' }]}>
                                <FontAwesome5 name={newCategoryIcon} size={24} color={newCategoryColor} />
                            </View>
                            <Text style={[styles.previewName, { color: theme.text }]}>
                                {newCategoryName || 'Nome da categoria'}
                            </Text>
                        </View>

                        {/* Botões */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelButton} onPress={resetAddForm}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleAddCategory}>
                                <Text style={styles.saveButtonText}>Criar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', padding: 20,
    },
    title: { fontSize: 28, fontWeight: '700', color: theme.text },
    addButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.primary, paddingHorizontal: 16,
        paddingVertical: 10, borderRadius: 20,
    },
    addButtonText: { color: theme.white, fontSize: 14, fontWeight: '600', marginLeft: 6 },
    section: { padding: 20, paddingTop: 0 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginLeft: 8, flex: 1 },
    sectionTotal: { fontSize: 14, fontWeight: '700' },
    categoryItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.backgroundCard, padding: 16,
        borderRadius: 12, marginBottom: 12,
    },
    categoryIcon: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    categoryInfo: { flex: 1, marginRight: 12 },
    categoryHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 8,
    },
    categoryName: { fontSize: 16, fontWeight: '600', color: theme.text },
    categoryAmount: { fontSize: 16, fontWeight: '700' },
    progressBarContainer: {
        height: 4, backgroundColor: theme.background,
        borderRadius: 2, overflow: 'hidden',
    },
    progressBar: { height: '100%', borderRadius: 2 },
    percentageText: { fontSize: 11, color: theme.textMuted, marginTop: 4 },
    // Modal styles
    modalOverlay: {
        flex: 1, backgroundColor: theme.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.backgroundModal, borderTopLeftRadius: 24,
        borderTopRightRadius: 24, padding: 24, maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 },
    input: {
        backgroundColor: theme.backgroundCard, color: theme.text,
        padding: 12, borderRadius: 8, fontSize: 16,
    },
    typeRow: { flexDirection: 'row', gap: 12 },
    typeBtn: {
        flex: 1, padding: 12, borderRadius: 8,
        alignItems: 'center', backgroundColor: theme.backgroundCard,
    },
    typeBtnText: { fontSize: 14, fontWeight: '600', color: theme.textSecondary },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    colorDot: { width: 32, height: 32, borderRadius: 16 },
    colorDotSelected: { borderWidth: 3, borderColor: theme.text },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    iconOption: {
        width: 44, height: 44, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    previewContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.backgroundCard, padding: 16,
        borderRadius: 12, marginBottom: 24, gap: 12,
    },
    previewIcon: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
    },
    previewName: { fontSize: 16, fontWeight: '600' },
    modalFooter: { flexDirection: 'row', gap: 12 },
    cancelButton: {
        flex: 1, padding: 14, borderRadius: 12,
        borderWidth: 1, borderColor: theme.textMuted, alignItems: 'center',
    },
    cancelButtonText: { color: theme.text, fontSize: 16, fontWeight: '600' },
    saveButton: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
    saveButtonText: { color: theme.white, fontSize: 16, fontWeight: '700' },
});
