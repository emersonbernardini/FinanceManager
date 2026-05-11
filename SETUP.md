# Como rodar o projeto

## ⚠️ Importante: instalar dependências antes de rodar

O `pnpm-lock.yaml` foi removido pois estava com versões incompatíveis.
Execute um dos comandos abaixo para instalar as dependências corretas:

```bash
# Com npm (recomendado para Expo)
npm install

# Com yarn
yarn install

# Com pnpm
pnpm install
```

## Rodando no Expo Go

```bash
npx expo start
```

Escaneie o QR Code com o app **Expo Go** no celular.

## Versões utilizadas

- Expo SDK: **51**
- React: **18.2.0**
- React Native: **0.74.5**

> **Por que SDK 51 e não 54?**  
> O Expo SDK 54 com RN 0.81 não tem suporte no Expo Go público —  
> exige build customizado (EAS Build). O SDK 51 funciona direto no Expo Go.
