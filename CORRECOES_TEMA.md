# Correções de Tema - Finance Manager Pro

## ✅ Correções Já Implementadas

1. **ThemeContext** - Sistema completo de temas criado em `/src/context/ThemeContext.js`
   - Suporte a dark/light mode
   - Persistência da preferência do usuário
   - Toggle manual de tema

2. **App.js** - Atualizado para usar ThemeProvider

3. **ScreenContainer** - Atualizado para usar tema e respeitar status bar

4. **SettingsScreen** - Botão de toggle de tema adicionado na seção "Aparência"

5. **DashboardCard** - Atualizado para usar ThemeContext

6. **TransactionItem** - Atualizado para usar ThemeContext

7. **app.json** - Configurações de status bar corrigidas:
   - `statusBarTranslucent: false` (Android)
   - `statusBarBackgroundColor` configurado
   - `UIViewControllerBasedStatusBarAppearance: false` (iOS)

## 📝 Arquivos Que Precisam de Atualização

Os seguintes arquivos ainda usam `COLORS` diretamente e precisam ser atualizados para usar `useTheme`:

### HomeScreen.js
```javascript
// Adicionar no topo do componente:
import { useTheme } from '../context/ThemeContext';

// Dentro do componente:
const { theme, isDark } = useTheme();

// Substituir todas as referências:
COLORS.text → theme.text
COLORS.primary → theme.primary
COLORS.background → theme.background
// etc...
```

### TransactionModal.js
Mesmo padrão do HomeScreen

### TransactionsScreen.js
Mesmo padrão do HomeScreen

### CategoriesScreen.js
Mesmo padrão do HomeScreen

## 🔧 Como Usar o Tema

```javascript
import { useTheme } from '../context/ThemeContext';

function MeuComponente() {
    const { theme, isDark, toggleTheme } = useTheme();
    
    return (
        <View style={{ backgroundColor: theme.background }}>
            <Text style={{ color: theme.text }}>Texto com cor dinâmica</Text>
        </View>
    );
}
```

## 🎨 Cores Disponíveis no Tema

- `theme.primary` - Cor primária
- `theme.background` - Fundo da tela
- `theme.backgroundCard` - Fundo de cards
- `theme.text` - Texto principal
- `theme.textSecondary` - Texto secundário
- `theme.textMuted` - Texto esmaecido
- `theme.success` - Verde (sucesso/receitas)
- `theme.danger` - Vermelho (erro/despesas)
- `theme.warning` - Amarelo (avisos)
- E todas as outras cores definidas em `/src/constants/index.js`

## 🚀 Status Bar

A configuração da status bar foi corrigida:
- Não sobrepõe mais a barra de notificações
- Cor dinâmica baseada no tema (light/dark)
- Funciona corretamente em Android e iOS
