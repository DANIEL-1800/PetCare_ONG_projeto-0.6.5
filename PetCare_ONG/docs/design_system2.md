# Design System — Finanças Pessoais

**Versão:** 1.1  
**Tecnologias:** HTML, CSS, JavaScript Vanilla, Tailwind CSS, Supabase e SweetAlert2.

## 1. Objetivo

Padronizar a aparência e a experiência do aplicativo de gestão de despesas pessoais, garantindo consistência nos modos claro (light) e escuro (dark).

## 2. Cores

### 2.1 Identidade visual

| Papel | Cor | Hexadecimal | Utilização |
|---|---|---|---|
| Primária | Roxo (inspirado no Nubank) | `#820AD1` | Botões principais, links e elementos ativos |
| Secundária | Verde-turquesa | `#0D9488` | Destaques e ações complementares |

### 2.2 Cores neutras

| Elemento | Light mode | Dark mode |
|---|---|---|
| Fundo da página | `#F8FAFC` | `#0F172A` |
| Fundo de cartões | `#FFFFFF` | `#1E293B` |    
| Texto principal | `#0F172A` | `#F8FAFC` |
| Texto secundário | `#64748B` | `#94A3B8` |
| Bordas | `#E2E8F0` | `#334155` |

### 2.3 Cores semânticas

| Significado | Light mode | Dark mode | Exemplo |
|---|---|---|---|
| Sucesso | `#16A34A` | `#4ADE80` | Receita recebida |
| Erro / despesa | `#DC2626` | `#F87171` | Despesa ou falha |
| Atenção | `#D97706` | `#FBBF24` | Conta próxima do vencimento |
| Informação | `#0284C7` | `#38BDF8` | Mensagem informativa |

**Regra:** nunca utilizar somente a cor para transmitir um significado; acrescentar texto ou ícone. Verificar contraste adequado entre texto e fundo.

## 3. Fontes e tipografia

- **Títulos:** Poppins, com alternativa `sans-serif`.
- **Textos e formulários:** Inter, com alternativa `sans-serif`.
- **Título principal (H1):** 32 px, peso 700.
- **Título de seção (H2):** 24 px, peso 600.
- **Título de cartão (H3):** 20 px, peso 600.
- **Texto padrão:** 16 px, peso 400, altura de linha 1,5.
- **Texto auxiliar:** 14 px, peso 400.
- **Valores financeiros:** 24 px, peso 600; alinhamento decimal consistente.

## 4. Espaçamento — 8pt Grid

Usar uma escala baseada em múltiplos de 8 px. O valor de 4 px pode ser usado para ajustes pequenos.

| Token | Valor | Exemplo |
|---|---|---|
| XS | 4 px | Espaço entre ícone e texto |
| SM | 8 px | Elementos relacionados |
| MD | 16 px | Espaço interno de campos |
| LG | 24 px | Espaço interno de cartões |
| XL | 32 px | Separação entre seções |
| 2XL | 48 px | Separação entre grandes blocos |

**No Tailwind:** `gap-2` = 8 px, `p-4` = 16 px, `p-6` = 24 px e `mb-8` = 32 px, considerando a escala padrão.

## 5. Arredondamentos

| Elemento | Raio | Tailwind |
|---|---|---|
| Campos e botões | 8 px | `rounded-lg` |
| Cartões | 12 px | `rounded-xl` |
| Modais | 16 px | `rounded-2xl` |
| Avatares e indicadores circulares | 50% | `rounded-full` |

## 6. Alinhamento e white space

- Alinhar títulos, rótulos, campos e tabelas a uma mesma linha de referência.
- Priorizar alinhamento à esquerda para textos e à direita para valores monetários em tabelas.
- Manter 24 px de espaço interno nos cartões, quando houver espaço disponível.
- Separar seções com pelo menos 32 px em telas amplas.
- Evitar interfaces excessivamente preenchidas: o espaço vazio faz parte da organização visual.
- Em telas pequenas, reduzir espaçamentos proporcionalmente, preservando a escala.

## 7. Componentes básicos

- **Botão principal:** cor primária, texto de alto contraste e cantos de 8 px.
- **Botão secundário:** cor secundária, com contraste adequado.
- **Campo de formulário:** rótulo visível, borda neutra e destaque ao receber foco.
- **Cartão financeiro:** fundo de cartão, cantos de 12 px e espaçamento interno de 24 px.
- **Tabela de despesas:** valores monetários alinhados à direita; situação acompanhada de texto.
- **Feedback:** utilizar SweetAlert2 para confirmação, sucesso, erro e aviso, respeitando as cores e o tema ativo.

## 8. Light e dark mode

- Usar as cores da tabela de cada tema; não inverter cores automaticamente.
- Alternar o tema aplicando ou removendo a classe `dark` no elemento `<html>`.
- Utilizar as variantes `dark:` do Tailwind quando apropriado.
- Manter a escolha do usuário ao retornar ao aplicativo.
- Aplicar também o tema correspondente aos diálogos do SweetAlert2.

## 9. Regras gerais

1. Reutilizar cores, fontes, espaçamentos e arredondamentos definidos neste documento.
2. Evitar valores diferentes para componentes visualmente equivalentes.
3. Usar o Tailwind CSS para estilização e JavaScript Vanilla para interações.
4. Utilizar o Supabase para autenticação e persistência de dados, sem expor credenciais privilegiadas no frontend.
5. Garantir boa leitura e navegação por teclado em ambos os temas.

---

**Critério de avaliação:** consistência entre telas, hierarquia visual, espaçamento, legibilidade e aplicação correta dos dois temas.
