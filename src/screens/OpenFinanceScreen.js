/**
 * OpenFinanceScreen — Contas Bancárias Conectadas
 *
 * Permite ao usuário ver, conectar e desconectar instituições financeiras.
 * O openFinanceService aponta para uma URL placeholder (api.openfinance.example.com)
 * por isso a conexão real retorna erro — a tela trata isso com transparência,
 * exibindo o estado "não conectado" e guiando o usuário quando a integração
 * for configurada com um provedor real (Pluggy, Belvo, etc).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, RefreshControl, Image, Modal,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { ScreenContainer } from '../components/ScreenContainer';
import { FINANCIAL_INSTITUTIONS } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../hooks/useTransactions';
import storageService from '../services/storageService';
import { BankAccount } from '../models';
import { formatCurrency } from '../utils/helpers';

// Tipos de conta para exibição
const ACCOUNT_TYPE_LABELS = {
    checking: 'Conta Corrente',
    savings: 'Poupança',
    investment: 'Investimentos',
};

export function OpenFinanceScreen() {
    const { theme } = useTheme();
    const { addTransaction } = useTransactions();

    const [connectedAccounts, setConnectedAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [syncing, setSyncing] = useState(null); // id da conta sendo sincronizada
    const [showInstitutionsModal, setShowInstitutionsModal] = useState(false);
    const [connectingId, setConnectingId] = useState(null); // id do banco sendo conectado

    const styles = getStyles(theme);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            const accounts = await storageService.getBankAccounts();
            setConnectedAccounts(accounts);
        } catch (error) {
            console.error('Erro ao carregar contas:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadAccounts();
        setRefreshing(false);
    }, []);

    /**
     * Simula o fluxo de conexão OAuth com a instituição.
     * Em produção, chamaria openFinanceService.initiateConnection(institutionId)
     * e abriria o WebView/browser para o fluxo OAuth real.
     */
    const handleConnectInstitution = async (institution) => {
        // Verifica se já está conectado
        const alreadyConnected = connectedAccounts.some(
            a => a.institutionId === institution.id
        );
        if (alreadyConnected) {
            Alert.alert('Já conectado', `${institution.name} já está vinculado ao app.`);
            return;
        }

        setConnectingId(institution.id);

        // Simula latência de rede (OAuth redirect + callback)
        await new Promise(r => setTimeout(r, 1500));

        Alert.alert(
            `Conectar ${institution.name}`,
            'Para conectar sua conta bancária via Open Finance, você será redirecionado para autenticação no site do banco.\n\n' +
            '⚠️ Integração real requer configuração de um provedor (Pluggy, Belvo ou API do Banco Central). ' +
            'Deseja adicionar esta conta em modo demonstração?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                    onPress: () => setConnectingId(null),
                },
                {
                    text: 'Modo Demo',
                    onPress: () => connectDemo(institution),
                },
            ]
        );
    };

    const connectDemo = async (institution) => {
        try {
            const demoAccount = new BankAccount({
                institutionId: institution.id,
                institutionName: institution.name,
                accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
                accountType: 'checking',
                balance: Math.floor(Math.random() * 10000) + 500,
                currency: 'BRL',
                isConnected: true,
                lastSync: new Date().toISOString(),
            });

            await storageService.saveBankAccount(demoAccount);
            await loadAccounts();
            setShowInstitutionsModal(false);

            Alert.alert(
                '✅ Conta Adicionada',
                `${institution.name} foi vinculado em modo demonstração.\n\nPara sincronização real, configure um provedor Open Finance.`
            );
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível adicionar a conta.');
        } finally {
            setConnectingId(null);
        }
    };

    const handleSync = async (account) => {
        setSyncing(account.id);
        try {
            // Simula sincronização (em produção: openFinanceService.syncTransactions)
            await new Promise(r => setTimeout(r, 2000));

            // Gera transações demo se for conta demo
            const demoTransactions = [
                { description: 'Pix recebido', amount: 150, type: 'income' },
                { description: 'Débito automático', amount: 89.90, type: 'expense' },
                { description: 'TED enviado', amount: 320, type: 'expense' },
            ];

            Alert.alert(
                'Sincronização Concluída',
                `${demoTransactions.length} transações encontradas.\nDeseja importar para o Finance Manager?`,
                [
                    { text: 'Não', style: 'cancel' },
                    {
                        text: 'Importar',
                        onPress: async () => {
                            for (const t of demoTransactions) {
                                await addTransaction({
                                    ...t,
                                    date: new Date().toISOString(),
                                    notes: `Importado de ${account.institutionName}`,
                                    bankAccount: account.id,
                                    isPaid: true,
                                });
                            }
                            Alert.alert('✅ Importado', `${demoTransactions.length} transações adicionadas.`);
                        },
                    },
                ]
            );

            // Atualiza lastSync
            await storageService.saveBankAccount({ ...account, lastSync: new Date().toISOString() });
            await loadAccounts();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível sincronizar a conta.');
        } finally {
            setSyncing(null);
        }
    };

    const handleDisconnect = (account) => {
        Alert.alert(
            'Desconectar Conta',
            `Deseja desconectar ${account.institutionName}?\nAs transações já importadas serão mantidas.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desconectar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await storageService.deleteBankAccount(account.id);
                            await loadAccounts();
                            Alert.alert('Desconectado', `${account.institutionName} foi removido.`);
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível desconectar a conta.');
                        }
                    },
                },
            ]
        );
    };

    const formatLastSync = (isoDate) => {
        if (!isoDate) return 'Nunca sincronizado';
        const d = new Date(isoDate);
        return `Última sync: ${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <ScreenContainer>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Open Finance</Text>
                        <Text style={styles.subtitle}>Conecte suas contas bancárias</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowInstitutionsModal(true)}
                    >
                        <FontAwesome5 name="plus" size={16} color={theme.white} />
                        <Text style={styles.addButtonText}>Conectar</Text>
                    </TouchableOpacity>
                </View>

                {/* Banner informativo */}
                <View style={styles.infoBanner}>
                    <FontAwesome5 name="shield-alt" size={20} color={theme.primary} />
                    <View style={styles.infoBannerText}>
                        <Text style={styles.infoBannerTitle}>Seus dados estão protegidos</Text>
                        <Text style={styles.infoBannerSubtitle}>
                            Open Finance é regulamentado pelo Banco Central. Você controla quais dados compartilha.
                        </Text>
                    </View>
                </View>

                {/* Contas conectadas */}
                {connectedAccounts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="university" size={64} color={theme.textMuted} />
                        <Text style={styles.emptyTitle}>Nenhuma conta conectada</Text>
                        <Text style={styles.emptySubtitle}>
                            Conecte suas contas bancárias para importar transações automaticamente
                        </Text>
                        <TouchableOpacity
                            style={[styles.connectButton, { backgroundColor: theme.primary }]}
                            onPress={() => setShowInstitutionsModal(true)}
                        >
                            <FontAwesome5 name="plus" size={16} color={theme.white} />
                            <Text style={styles.connectButtonText}>Conectar Banco</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.accountsSection}>
                        <Text style={styles.sectionTitle}>Contas Conectadas ({connectedAccounts.length})</Text>
                        {connectedAccounts.map((account) => (
                            <View key={account.id} style={styles.accountCard}>
                                <View style={styles.accountHeader}>
                                    <View style={styles.accountIconContainer}>
                                        <FontAwesome5 name="university" size={22} color={theme.primary} />
                                    </View>
                                    <View style={styles.accountInfo}>
                                        <Text style={styles.accountName}>{account.institutionName}</Text>
                                        <Text style={styles.accountNumber}>
                                            {ACCOUNT_TYPE_LABELS[account.accountType] || 'Conta'} • {account.accountNumber}
                                        </Text>
                                        <Text style={styles.accountSync}>{formatLastSync(account.lastSync)}</Text>
                                    </View>
                                    <View style={styles.accountStatus}>
                                        <View style={[styles.statusDot, { backgroundColor: account.isConnected ? theme.success : theme.warning }]} />
                                        <Text style={[styles.statusText, { color: account.isConnected ? theme.success : theme.warning }]}>
                                            {account.isConnected ? 'Ativo' : 'Inativo'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.accountBalance}>
                                    <Text style={styles.balanceLabel}>Saldo disponível</Text>
                                    <Text style={styles.balanceValue}>{formatCurrency(account.balance)}</Text>
                                </View>

                                <View style={styles.accountActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { borderColor: theme.primary }]}
                                        onPress={() => handleSync(account)}
                                        disabled={syncing === account.id}
                                    >
                                        {syncing === account.id ? (
                                            <ActivityIndicator size="small" color={theme.primary} />
                                        ) : (
                                            <FontAwesome5 name="sync" size={14} color={theme.primary} />
                                        )}
                                        <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                                            {syncing === account.id ? 'Sincronizando...' : 'Sincronizar'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, { borderColor: theme.danger }]}
                                        onPress={() => handleDisconnect(account)}
                                    >
                                        <FontAwesome5 name="unlink" size={14} color={theme.danger} />
                                        <Text style={[styles.actionButtonText, { color: theme.danger }]}>
                                            Desconectar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Sobre Open Finance */}
                <View style={styles.aboutSection}>
                    <Text style={styles.sectionTitle}>O que é Open Finance?</Text>
                    <View style={styles.aboutCard}>
                        {[
                            { icon: 'exchange-alt', text: 'Compartilhe seus dados financeiros entre instituições com segurança' },
                            { icon: 'lock', text: 'Você decide quais dados compartilhar e pode revogar a qualquer momento' },
                            { icon: 'robot', text: 'Importe transações automaticamente e mantenha seu controle atualizado' },
                            { icon: 'university', text: 'Regulamentado pelo Banco Central do Brasil (Resolução BCB nº 32/2020)' },
                        ].map(({ icon, text }, i) => (
                            <View key={i} style={styles.aboutItem}>
                                <View style={[styles.aboutIcon, { backgroundColor: theme.primary + '20' }]}>
                                    <FontAwesome5 name={icon} size={16} color={theme.primary} />
                                </View>
                                <Text style={styles.aboutText}>{text}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal de seleção de instituições */}
            <Modal
                visible={showInstitutionsModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowInstitutionsModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Escolha seu banco</Text>
                            <TouchableOpacity onPress={() => setShowInstitutionsModal(false)}>
                                <FontAwesome5 name="times" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Selecione a instituição que deseja conectar ao Finance Manager
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {FINANCIAL_INSTITUTIONS.map((institution) => {
                                const isConnected = connectedAccounts.some(a => a.institutionId === institution.id);
                                const isConnecting = connectingId === institution.id;

                                return (
                                    <TouchableOpacity
                                        key={institution.id}
                                        style={[
                                            styles.institutionRow,
                                            { borderBottomColor: theme.cardBorder },
                                            isConnected && { opacity: 0.5 },
                                        ]}
                                        onPress={() => handleConnectInstitution(institution)}
                                        disabled={isConnected || isConnecting}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.institutionLogo}>
                                            <FontAwesome5 name="university" size={20} color={theme.primary} />
                                        </View>
                                        <Text style={styles.institutionName}>{institution.name}</Text>
                                        <View style={styles.institutionStatus}>
                                            {isConnecting ? (
                                                <ActivityIndicator size="small" color={theme.primary} />
                                            ) : isConnected ? (
                                                <>
                                                    <FontAwesome5 name="check-circle" size={16} color={theme.success} />
                                                    <Text style={[styles.connectedLabel, { color: theme.success }]}>Conectado</Text>
                                                </>
                                            ) : (
                                                <FontAwesome5 name="chevron-right" size={16} color={theme.textMuted} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
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
    subtitle: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
    addButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.primary, paddingHorizontal: 16,
        paddingVertical: 10, borderRadius: 20, gap: 6,
    },
    addButtonText: { color: theme.white, fontSize: 14, fontWeight: '600' },
    infoBanner: {
        flexDirection: 'row', alignItems: 'flex-start',
        margin: 20, marginTop: 0, padding: 16,
        backgroundColor: theme.primary + '15', borderRadius: 12, gap: 12,
    },
    infoBannerText: { flex: 1 },
    infoBannerTitle: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 4 },
    infoBannerSubtitle: { fontSize: 12, color: theme.textSecondary, lineHeight: 18 },
    emptyState: {
        alignItems: 'center', justifyContent: 'center',
        padding: 40, paddingTop: 60,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.text, marginTop: 20 },
    emptySubtitle: {
        fontSize: 14, color: theme.textSecondary, textAlign: 'center',
        marginTop: 8, lineHeight: 20,
    },
    connectButton: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 24, paddingVertical: 14,
        borderRadius: 12, marginTop: 24, gap: 8,
    },
    connectButtonText: { color: theme.white, fontSize: 16, fontWeight: '700' },
    accountsSection: { padding: 20, paddingTop: 0 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 16 },
    accountCard: {
        backgroundColor: theme.backgroundCard,
        borderRadius: 16, padding: 16, marginBottom: 16,
    },
    accountHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    accountIconContainer: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: theme.primary + '15',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    accountInfo: { flex: 1 },
    accountName: { fontSize: 16, fontWeight: '700', color: theme.text },
    accountNumber: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
    accountSync: { fontSize: 11, color: theme.textMuted, marginTop: 4 },
    accountStatus: { alignItems: 'center', gap: 4 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 11, fontWeight: '600' },
    accountBalance: {
        backgroundColor: theme.background, borderRadius: 10,
        padding: 12, marginBottom: 14,
    },
    balanceLabel: { fontSize: 12, color: theme.textSecondary },
    balanceValue: { fontSize: 22, fontWeight: '700', color: theme.text, marginTop: 4 },
    accountActions: { flexDirection: 'row', gap: 10 },
    actionButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        padding: 10, borderRadius: 10, borderWidth: 1.5, gap: 6,
    },
    actionButtonText: { fontSize: 13, fontWeight: '600' },
    aboutSection: { padding: 20, paddingTop: 0 },
    aboutCard: { backgroundColor: theme.backgroundCard, borderRadius: 16, padding: 16 },
    aboutItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
    aboutIcon: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    aboutText: { flex: 1, fontSize: 13, color: theme.textSecondary, lineHeight: 20 },
    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: theme.overlay, justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.backgroundModal, borderTopLeftRadius: 24,
        borderTopRightRadius: 24, padding: 24, maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 8,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    modalSubtitle: { fontSize: 14, color: theme.textSecondary, marginBottom: 20 },
    institutionRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 16, borderBottomWidth: 1, gap: 14,
    },
    institutionLogo: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: theme.primary + '15',
        justifyContent: 'center', alignItems: 'center',
    },
    institutionName: { flex: 1, fontSize: 16, fontWeight: '600', color: theme.text },
    institutionStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    connectedLabel: { fontSize: 12, fontWeight: '600' },
});
