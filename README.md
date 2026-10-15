# Finance Manager Pro

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](CHANGELOG.md)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020?logo=expo)](https://expo.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Aplicativo mobile de gestão financeira para pessoa física e jurídica, com categorias personalizáveis, dashboard de análises e uma camada de integração com Open Finance.

## Screenshots

<p>
  <img src="assets/01-homepage.png" width="22%" alt="Início" />
  <img src="assets/02-transaction-page.png" width="22%" alt="Transações" />
  <img src="assets/03-categories-page.png" width="22%" alt="Categorias" />
  <img src="assets/04-settings-page.png" width="22%" alt="Configurações" />
</p>

## Funcionalidades

- **Transações:** registro de receitas e despesas, edição, exclusão, busca e filtros.
- **Dashboard:** saldo, receitas versus despesas, análise por categoria e tendências mensais.
- **Categorias:** 12 de despesa e 7 de receita pré-definidas, mais categorias próprias com ícone e cor.
- **Modos PF e PJ:** categorias e relatórios adaptados a cada perfil.
- **Offline:** dados armazenados localmente com AsyncStorage.
- **Tema escuro.**

### Estado da integração Open Finance

A estrutura do serviço (`src/services/openFinanceService.js`) está pronta, mas a integração ainda exige a configuração de um provedor (por exemplo Belvo ou Pluggy) e não está ativa por padrão.

## Stack

- React Native 0.81 e Expo SDK 54
- AsyncStorage para persistência local
- Arquitetura em camadas: `models`, `services`, `hooks`, `screens` e `components`

## Instalação

Requisitos: Node.js 18+ (ou Bun), Expo CLI e um dispositivo Android/iOS ou emulador.

```bash
git clone https://github.com/emersonbernardini/FinanceManager.git
cd FinanceManager
bun install        # ou: npm install
npx expo start
```

Escaneie o QR Code com o Expo Go, ou pressione `a` (Android) ou `i` (iOS) para abrir no emulador.

Builds de produção usam EAS Build (configuração em `eas.json`):

```bash
npx eas-cli build --platform android
npx eas-cli build --platform ios
```

## Estrutura

```
src/
├── components/   # Componentes reutilizáveis
├── screens/      # Telas (Home, Transactions, Categories, Settings)
├── services/     # storageService, openFinanceService
├── hooks/        # useTransactions
├── models/       # Transaction, Category
├── constants/    # Cores, tipos e configuração
└── utils/        # Funções utilitárias
```

## Próximos passos

- Ativar a integração Open Finance com um provedor
- Sincronização em nuvem
- Subcategorias
- Exportação de relatórios (PDF e Excel)
- Notificações e metas avançadas

O histórico de versões está em [CHANGELOG.md](CHANGELOG.md) e o guia de contribuição em [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

MIT. Veja [LICENSE](LICENSE).
