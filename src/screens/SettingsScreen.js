/**
 * SettingsScreen - Configurações
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Switch, Alert, ActivityIndicator, Platform, Linking,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { ScreenContainer } from '../components/ScreenContainer';
import { ACCOUNT_TYPES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import storageService from '../services/storageService';

// Package ID real do app (do AndroidManifest.xml)
const APP_PACKAGE_ID = 'com.financemanagerpro';
// IDs de loja ainda não publicados — mantemos placeholder mas avisamos o usuário
const STORE_URLS = {
    ios: null,    // Substituir com ID real ao publicar na App Store
    android: `https://play.google.com/store/apps/details?id=${APP_PACKAGE_ID}`,
};

export function SettingsScreen() {
    const { theme, toggleTheme, isDark, isLoading } = useTheme();
    const [accountType, setAccountType] = useState(ACCOUNT_TYPES.PERSONAL);
    const [notifications, setNotifications] = useState(true);
    const [biometry, setBiometry] = useState(false);
    const [biometryAvailable, setBiometryAvailable] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        loadSettings();
        checkBiometry();
    }, []);

    const checkBiometry = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            setBiometryAvailable(compatible && enrolled);
        } catch (error) {
            setBiometryAvailable(false);
        }
    };

    const loadSettings = async () => {
        try {
            setLoadingSettings(true);
            const savedAccountType = await storageService.getAccountType();
            if (savedAccountType) setAccountType(savedAccountType);

            // Bug #1 fix: storageService.get() agora existe
            const savedNotifications = await storageService.get('settings_notifications');
            if (savedNotifications !== null) setNotifications(savedNotifications === 'true');

            const savedBiometry = await storageService.get('settings_biometry');
            if (savedBiometry !== null) setBiometry(savedBiometry === 'true');
        } catch (error) {
            console.log('Erro ao carregar configurações:', error);
        } finally {
            setLoadingSettings(false);
        }
    };

    if (isLoading || loadingSettings) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00D4FF" />
            </View>
        );
    }

    const styles = getStyles(theme);

    const handleAccountTypeChange = async (type) => {
        setAccountType(type);
        await storageService.setAccountType(type);
        Alert.alert(
            'Tipo de Conta Alterado',
            `Agora você está usando o modo ${type === 'personal' ? 'Pessoa Física' : 'Pessoa Jurídica'}`
        );
    };

    const handleNotificationsToggle = async (value) => {
        setNotifications(value);
        // Bug #1 fix: storageService.set() agora existe
        await storageService.set('settings_notifications', value.toString());
        if (value) {
            Alert.alert(
                'Notificações Ativadas',
                'Você receberá lembretes sobre suas transações.\n\nNota: para notificações push em background, integre o expo-notifications.'
            );
        }
    };

    const handleBiometryToggle = async (value) => {
        if (value && !biometryAvailable) {
            Alert.alert('Biometria Indisponível', 'Seu dispositivo não possui biometria configurada.');
            return;
        }

        if (value) {
            try {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Autentique para ativar a proteção biométrica',
                    fallbackLabel: 'Usar senha',
                    cancelLabel: 'Cancelar',
                });
                if (result.success) {
                    setBiometry(true);
                    await storageService.set('settings_biometry', 'true');
                    // Bug #12 fix: informamos o usuário que a proteção atua no próximo acesso
                    Alert.alert(
                        'Biometria Ativada',
                        'Na próxima abertura do app, a autenticação biométrica será solicitada.\n\nNota: implemente a verificação em App.js no evento onAppStateChange para ativação completa.'
                    );
                } else {
                    Alert.alert('Autenticação Cancelada', 'A biometria não foi ativada.');
                }
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível ativar a biometria.');
            }
        } else {
            setBiometry(false);
            await storageService.set('settings_biometry', 'false');
            Alert.alert('Biometria Desativada', 'A proteção biométrica foi removida.');
        }
    };

    const handleExportData = async () => {
        Alert.alert(
            'Exportar Dados',
            'Deseja exportar todas as suas transações em formato JSON?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Exportar',
                    onPress: async () => {
                        try {
                            const data = await storageService.exportData();
                            const fileName = `finance-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
                            const fileUri = FileSystem.documentDirectory + fileName;
                            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
                            const canShare = await Sharing.isAvailableAsync();
                            if (canShare) {
                                await Sharing.shareAsync(fileUri, {
                                    mimeType: 'application/json',
                                    dialogTitle: 'Exportar dados do Finance Manager',
                                });
                            } else {
                                Alert.alert('Dados Exportados', `Arquivo salvo em: ${fileUri}`);
                            }
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível exportar os dados');
                        }
                    },
                },
            ]
        );
    };

    const handleClearData = () => {
        Alert.alert(
            'Limpar Todos os Dados',
            'Esta ação não pode ser desfeita. Todos os seus dados serão excluídos permanentemente.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar Tudo',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await storageService.clearAll();
                            Alert.alert('Sucesso', 'Todos os dados foram removidos.', [
                                { text: 'OK', onPress: loadSettings },
                            ]);
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível limpar os dados');
                        }
                    },
                },
            ]
        );
    };

    const handleOpenGitHub = () => {
        Alert.alert(
            'Finance Manager',
            'Este é um projeto open source. Quer ver o código no GitHub?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Abrir GitHub', onPress: () => Linking.openURL('https://github.com/lumaXs/FinanceManager') },
            ]
        );
    };

    // Bug #14 fix: avisa que o app não está publicado quando URLs são null
    const handleRateApp = () => {
        const storeUrl = Platform.select(STORE_URLS);
        Alert.alert(
            'Avaliar App',
            storeUrl
                ? 'Sua avaliação é muito importante! Deseja avaliar o Finance Manager?'
                : 'O app ainda não está publicado nas lojas. Obrigado pelo interesse! 🙏',
            storeUrl
                ? [
                    { text: 'Mais Tarde', style: 'cancel' },
                    { text: 'Avaliar', onPress: () => Linking.openURL(storeUrl) },
                ]
                : [{ text: 'OK' }]
        );
    };

    const renderOption = (icon, title, subtitle, onPress, rightElement) => (
        <TouchableOpacity
            style={[styles.option, { borderBottomColor: theme.cardBorder }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={[styles.optionIcon, { backgroundColor: theme.primary + '20' }]}>
                <FontAwesome5 name={icon} size={18} color={theme.primary} />
            </View>
            <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
            </View>
            {rightElement !== undefined
                ? rightElement
                : <FontAwesome5 name="chevron-right" size={16} color={theme.textMuted} />}
        </TouchableOpacity>
    );

    const renderSection = (title, children) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: theme.backgroundCard }]}>
                {children}
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Configurações</Text>
                </View>

                {/* Aparência */}
                {renderSection('Aparência',
                    renderOption(
                        isDark ? 'moon' : 'sun',
                        'Tema',
                        isDark ? 'Modo Escuro' : 'Modo Claro',
                        toggleTheme,
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: theme.textMuted, true: theme.primary }}
                            thumbColor={theme.white}
                        />
                    )
                )}

                {/* Tipo de Conta */}
                {renderSection('Tipo de Conta',
                    <>
                        <TouchableOpacity
                            style={[
                                styles.accountTypeButton,
                                { borderBottomColor: theme.cardBorder },
                                accountType === ACCOUNT_TYPES.PERSONAL && { backgroundColor: theme.primary, borderBottomWidth: 0 },
                            ]}
                            onPress={() => handleAccountTypeChange(ACCOUNT_TYPES.PERSONAL)}
                        >
                            <FontAwesome5 name="user" size={20} color={accountType === ACCOUNT_TYPES.PERSONAL ? theme.white : theme.textSecondary} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={[styles.accountTypeTitle, { color: theme.text }, accountType === ACCOUNT_TYPES.PERSONAL && { color: theme.white }]}>
                                    Pessoa Física
                                </Text>
                                <Text style={[styles.accountTypeSubtitle, { color: theme.textSecondary }, accountType === ACCOUNT_TYPES.PERSONAL && { color: theme.white + '90' }]}>
                                    Para uso pessoal
                                </Text>
                            </View>
                            {accountType === ACCOUNT_TYPES.PERSONAL && (
                                <FontAwesome5 name="check-circle" size={20} color={theme.white} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.accountTypeButton,
                                { borderBottomColor: theme.cardBorder },
                                accountType === ACCOUNT_TYPES.BUSINESS && { backgroundColor: theme.primary, borderBottomWidth: 0 },
                            ]}
                            onPress={() => handleAccountTypeChange(ACCOUNT_TYPES.BUSINESS)}
                        >
                            <FontAwesome5 name="briefcase" size={20} color={accountType === ACCOUNT_TYPES.BUSINESS ? theme.white : theme.textSecondary} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={[styles.accountTypeTitle, { color: theme.text }, accountType === ACCOUNT_TYPES.BUSINESS && { color: theme.white }]}>
                                    Pessoa Jurídica
                                </Text>
                                <Text style={[styles.accountTypeSubtitle, { color: theme.textSecondary }, accountType === ACCOUNT_TYPES.BUSINESS && { color: theme.white + '90' }]}>
                                    Para empresas
                                </Text>
                            </View>
                            {accountType === ACCOUNT_TYPES.BUSINESS && (
                                <FontAwesome5 name="check-circle" size={20} color={theme.white} />
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {/* Preferências */}
                {renderSection('Preferências',
                    <>
                        {/* Bug #13 fix: avisa que notificações push requerem integração adicional */}
                        {renderOption(
                            'bell', 'Notificações',
                            notifications ? 'Ativadas' : 'Desativadas',
                            null,
                            <Switch
                                value={notifications}
                                onValueChange={handleNotificationsToggle}
                                trackColor={{ false: theme.textMuted, true: theme.primary }}
                                thumbColor={theme.white}
                            />
                        )}
                        {renderOption(
                            'fingerprint', 'Biometria',
                            biometry ? 'Protegido' : biometryAvailable ? 'Desativado' : 'Indisponível',
                            null,
                            <Switch
                                value={biometry}
                                onValueChange={handleBiometryToggle}
                                disabled={!biometryAvailable}
                                trackColor={{ false: theme.textMuted, true: theme.primary }}
                                thumbColor={theme.white}
                            />
                        )}
                    </>
                )}

                {/* Dados */}
                {renderSection('Dados',
                    <>
                        {renderOption('download', 'Exportar Dados', 'Fazer backup das suas transações', handleExportData)}
                        {renderOption('trash', 'Limpar Dados', 'Remover todas as transações', handleClearData)}
                    </>
                )}

                {/* Sobre */}
                {renderSection('Sobre',
                    <>
                        {renderOption('info-circle', 'Versão', '2.0.0', null, null)}
                        {renderOption('github', 'Open Source', 'Veja no GitHub', handleOpenGitHub)}
                        {renderOption('heart', 'Avaliar App', 'Deixe sua avaliação', handleRateApp)}
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenContainer>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20 },
    title: { fontSize: 28, fontWeight: '700' },
    section: { paddingHorizontal: 20, marginBottom: 32 },
    sectionTitle: {
        fontSize: 14, fontWeight: '600', marginBottom: 12,
        textTransform: 'uppercase', letterSpacing: 0.5,
    },
    sectionContent: { borderRadius: 16, overflow: 'hidden' },
    option: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, gap: 12, borderBottomWidth: 1,
    },
    optionIcon: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
    },
    optionContent: { flex: 1 },
    optionTitle: { fontSize: 16, fontWeight: '600' },
    optionSubtitle: { fontSize: 13, marginTop: 2 },
    accountTypeButton: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, gap: 12, borderBottomWidth: 1,
    },
    accountTypeTitle: { fontSize: 16, fontWeight: '600' },
    accountTypeSubtitle: { fontSize: 13, marginTop: 2 },
});
