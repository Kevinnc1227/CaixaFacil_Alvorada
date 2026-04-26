# CaixaFacil Alvorada
## Documento de Especificação do Sistema

> **Alvorada Esporte Clube — Fundado em 1975 — Blumenau, SC**
> Projeto de Extensão — UNIASSELVI | Versão 1.0 MVP

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Objetivo e Justificativa](#2-objetivo-e-justificativa)
3. [Arquitetura e Stack](#3-arquitetura-e-stack)
4. [Módulo 01 — Estoque](#4-módulo-01--gestão-de-estoque)
5. [Módulo 02 — PDV](#5-módulo-02--pdv--ponto-de-venda)
6. [Módulo 03 — Fichas](#6-módulo-03--fichas--contas-de-clientes)
7. [Módulo 04 — Fechamento de Caixa](#7-módulo-04--fechamento-de-caixa)
8. [Módulo 05 — Suporte via Tickets](#8-módulo-05--suporte-via-tickets)
9. [Módulo 06 — Configurações e Auth](#9-módulo-06--configurações-e-autenticação)
10. [Banco de Dados](#10-banco-de-dados)
11. [Fluxo Operacional Diário](#11-fluxo-operacional-diário)
12. [Cronograma UNIASSELVI](#12-cronograma-uniasselvi-195h)
13. [Entregas Obrigatórias](#13-entregas-obrigatórias)

---

## 1. Visão Geral

O **CaixaFacil Alvorada** é um sistema web de gestão desenvolvido exclusivamente para a cantina e administração interna do Alvorada Esporte Clube, fundado em 1975 em Blumenau, Santa Catarina. O sistema substitui o controle manual em papel por uma plataforma digital moderna, rápida e acessível tanto em celular quanto em computador.

A solução centraliza quatro operações críticas do clube: venda de produtos (PDV), controle de estoque, gestão de fichas de clientes e fechamento de caixa diário, além de um canal de suporte via tickets para resolução de problemas do próprio sistema.

### Público-Alvo

| Perfil | Descrição |
|--------|-----------|
| **Operador de Caixa** | Responsável pelo atendimento direto na cantina. Usa o PDV para registrar vendas. |
| **Administrador do Clube** | Gerencia estoque, cadastra produtos, visualiza relatórios e fecha o caixa. |
| **Cliente com Ficha** | Membro do clube que consome e paga no final do evento ou do dia. |
| **Suporte Técnico** | Recebe e responde tickets abertos pelos usuários do sistema. |

---

## 2. Objetivo e Justificativa

### Objetivo Principal

Modernizar e digitalizar a operação da cantina do clube em dias de jogo e eventos, reduzindo erros de caixa, perdas de estoque e tempo de atendimento. O sistema deve ser simples o suficiente para que qualquer voluntário consiga usar sem treinamento extenso.

### Justificativa

- Atualmente o controle é feito manualmente em cadernos ou planilhas, sujeito a erros.
- Nos dias de jogo a cantina atende dezenas de pessoas em curto período de tempo, exigindo agilidade.
- O controle de fichas (pagamento no fim do dia) é feito de memória ou em papel, causando perda de receita.
- Não existe histórico de vendas, impossibilitando análise de consumo e reposição inteligente de estoque.
- O clube possui mais de 1.100 seguidores nas redes sociais e opera com patrocinadores (Kroll, Vottri, Vecom), indicando estrutura real que justifica a digitalização.

---

## 3. Arquitetura e Stack

### Stack Tecnológico Sugerido

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | React.js + Tailwind CSS | Interface rápida, responsiva, componentes reutilizáveis |
| Backend | Node.js + Express | Leve, rápido, JavaScript full-stack |
| Banco de Dados | PostgreSQL ou SQLite | Relacional, suporte a transações, confiável |
| Autenticação | JWT (JSON Web Token) | Simples e seguro para login de operadores |
| Hospedagem | Vercel (frontend) + Railway | Grátis no tier básico, ideal para MVP |
| Controle de Versão | GitHub | Obrigatório para evidência do projeto UNIASSELVI |

### Princípios de Design e UX

- **Mobile-first:** a maioria dos usuários acessará pelo celular no campo ou na cantina.
- **Dark theme** com cores do clube — azul marinho `#0D1B3E`, vermelho `#C0272D`, branco `#FFFFFF`.
- **Toque grande:** botões e cards generosos para uso em ambiente agitado (dia de jogo).
- **Zero fricção no PDV:** adicionar um produto ao carrinho deve ser 1 toque, sem confirmações desnecessárias.
- **Feedback visual imediato:** toast notifications para ações (produto adicionado, pedido fechado, etc).
- **Offline-friendly no PDV:** operações básicas devem funcionar mesmo com internet instável.

### Navegação Principal

```
[ PDV ] [ Estoque ] [ Fichas ] [ Fechamento ] [ Suporte ] [ Config ]
```

O módulo **PDV** é a tela inicial padrão, pois é a mais usada em dias de operação.

---

## 4. Módulo 01 — Gestão de Estoque

### Descrição

Centro de cadastro e controle de todos os produtos comercializados pela cantina. O administrador cadastra, edita e remove produtos, define preços e controla quantidades em estoque. Toda movimentação de venda desconta automaticamente o estoque.

### Telas

#### Lista de Produtos
Tabela com todos os produtos, foto (opcional), preço, quantidade atual e status (`disponível` / `esgotado`). Filtro por nome e categoria. Botões de editar e excluir em cada linha.

#### Cadastrar / Editar Produto
Formulário com:
- Nome do produto
- Categoria (bebida / comida / outro)
- Preço de venda
- Quantidade inicial em estoque
- Quantidade mínima para alerta
- Botão salvar

#### Alerta de Estoque Baixo
Painel ou badge na navegação indicando produtos abaixo da quantidade mínima. Lista com nome, quantidade atual e quantidade mínima.

### Campos do Produto (Banco de Dados)

```
id | nome | categoria | preco_venda | quantidade_estoque | quantidade_minima | ativo | criado_em | atualizado_em
```

### Regras de Negócio

- Ao fechar um pedido no PDV, o estoque de cada item é decrementado automaticamente.
- Produtos com estoque zero ficam visíveis no PDV mas marcados como `Esgotado` e não podem ser adicionados ao carrinho.
- O administrador pode fazer ajuste manual de estoque (entrada de mercadoria) com justificativa registrada.
- O histórico de ajustes manuais é guardado para auditoria no fechamento de caixa.

---

## 5. Módulo 02 — PDV — Ponto de Venda

### Descrição

Interface principal de atendimento ao cliente. Projetada para ser rápida e intuitiva, permitindo que o operador registre pedidos com o mínimo de toques possíveis. É a tela de maior uso do sistema, especialmente em dias de jogo.

### Layout da Tela

- **Metade esquerda** (ou tela cheia no mobile): grade de cards de produtos. Cada card mostra foto (se cadastrada), nome e preço. Toque no card = adiciona ao carrinho.
- **Metade direita** (painel lateral no desktop, modal deslizante no mobile): carrinho com lista de itens, quantidade de cada um (+/-), subtotal por item e total geral destacado.
- **Botão "Fechar Pedido"** (vermelho, grande): abre o modal de finalização.
- **Campo de busca** no topo: filtra produtos em tempo real pelo nome.
- **Filtro por categoria:** abas horizontais (Todos / Bebidas / Comidas / Outros).

### Fluxo de Uma Venda

1. Operador abre a tela PDV (tela inicial do app).
2. Toca no produto desejado — item é adicionado ao carrinho com quantidade 1.
3. Para adicionar mais unidades, toca no `+` dentro do carrinho.
4. Repete para todos os itens do pedido.
5. Toca em **"Fechar Pedido"**.
6. Modal exibe resumo: itens, quantidades, total.
7. Opções: **"Pagar Agora"** ou **"Lançar na Ficha"** (conta do cliente).
8. Ao confirmar: estoque decrementado, pedido salvo, carrinho limpo.

### Tela: Modal de Resumo do Pedido

Exibe de forma limpa e clara:
- Lista de itens comprados com quantidade e preço unitário
- Subtotal de cada item
- **Valor total** do pedido em destaque
- Horário do pedido
- Dois botões de ação: `Pagar Agora` e `Lançar na Ficha`

> Ao escolher **Lançar na Ficha**, abre seletor de cliente cadastrado.

---

## 6. Módulo 03 — Fichas — Contas de Clientes

### Descrição

Sistema de contas abertas para clientes que consomem durante o evento e pagam no final do dia. Muito comum em clubes e associações. O operador cadastra o cliente uma vez e pode lançar pedidos na conta dele ao longo do dia.

### Telas

#### Lista de Clientes
Cards ou lista com nome, iniciais (avatar), status da conta (`aberta` / `paga`) e valor acumulado. Botão para cadastrar novo cliente. Filtro por nome.

#### Perfil do Cliente / Conta
Mostra dados do cliente (nome, CPF, telefone), histórico de pedidos lançados na conta, total acumulado e botão **"Fechar Conta / Receber Pagamento"**.

#### Cadastrar Cliente
Formulário simples:
- Nome completo
- CPF
- Telefone / WhatsApp
- Observações (opcional)

#### Fechar Conta
Exibe total da conta, permite registrar forma de pagamento (dinheiro / pix / cartão) e confirmar o recebimento. Conta vai para status `Paga`.

### Campos do Cliente (Banco de Dados)

```
id | nome_completo | cpf | telefone | observacoes | criado_em
```

### Campos da Ficha/Conta (Banco de Dados)

```
id | cliente_id (FK) | data_abertura | status | total_acumulado | forma_pagamento | data_fechamento
```

---

## 7. Módulo 04 — Fechamento de Caixa

### Descrição

Relatório diário consolidado de toda a operação do dia. Permite ao administrador visualizar quanto entrou, quais produtos foram mais vendidos, o saldo de estoque e o status das fichas em aberto. É a tela de controle financeiro do clube.

### Cards de Métricas Principais

| Métrica | Descrição |
|---------|-----------|
| Total de Vendas | Soma de todos os pedidos pagos no dia, em reais |
| Total em Fichas Pagas | Soma das contas de clientes quitadas no dia |
| Fichas em Aberto | Quantidade e valor total de contas não pagas |
| Pedidos Realizados | Número total de pedidos do dia |
| Itens Vendidos | Quantidade total de unidades vendidas |
| Produto Mais Vendido | Nome e quantidade do item com maior saída |

### Seções do Relatório

#### Resumo Financeiro
Total bruto do dia, total recebido em fichas, total pendente em fichas abertas, receita líquida confirmada.

#### Movimentação de Estoque
Tabela com: produto, estoque inicial do dia, quantidade vendida, estoque final. Destacar produtos zerados ou abaixo do mínimo.

#### Lista de Pedidos do Dia
Histórico completo de todos os pedidos com hora, itens e valor. Filtrável por hora.

#### Fichas do Dia
Status de cada conta: cliente, valor consumido, status (paga/aberta), forma de pagamento.

#### Botão Fechar Caixa
Finaliza o dia. Congela os dados do dia para auditoria. **Não pode ser desfeito.**

### Regras de Negócio

- O caixa só pode ser fechado uma vez por dia. Após fechado, os dados ficam somente para leitura.
- Fichas em aberto não impedem o fechamento do caixa, mas são destacadas em amarelo no relatório.
- O sistema guarda histórico de todos os fechamentos para consulta posterior.
- Ao iniciar um novo dia, o estoque final do dia anterior vira o estoque inicial do novo dia automaticamente.

---

## 8. Módulo 05 — Suporte via Tickets

### Descrição

Canal oficial de atendimento técnico do sistema. Qualquer usuário (operador ou administrador) pode abrir um ticket descrevendo um problema encontrado. O desenvolvedor/suporte recebe, analisa e responde diretamente pela plataforma. **Este módulo é o núcleo do projeto de extensão UNIASSELVI.**

### Telas

#### Meus Tickets
Lista de todos os tickets abertos pelo usuário logado. Cards com: título, data, status e última atualização.

#### Abrir Novo Ticket
Formulário:
- Título (resumo do problema)
- Categoria (`Bug` / `Dúvida` / `Sugestão` / `Urgente`)
- Descrição detalhada
- Campo para anexar print (opcional)

#### Detalhe do Ticket
Visualização completa do ticket: descrição original, histórico de respostas em formato de chat, campo para adicionar nova mensagem e botão **"Marcar como Resolvido"**.

#### Painel Admin (Suporte)
Visível apenas para o perfil Suporte/Admin. Lista todos os tickets de todos os usuários. Pode filtrar por status e categoria. Pode responder e fechar tickets.

### Status dos Tickets

| Status | Cor | Descrição |
|--------|-----|-----------|
| `Aberto` | 🔴 Vermelho | Ticket criado, aguardando suporte |
| `Em Andamento` | 🟡 Amarelo | Suporte analisando / respondeu |
| `Resolvido` | 🟢 Verde | Problema solucionado |
| `Fechado` | ⚪ Cinza | Encerrado pelo usuário ou admin |

### Campos do Ticket (Banco de Dados)

```
id | usuario_id (FK) | titulo | categoria | descricao | status | criado_em | atualizado_em
```

### Campos de Mensagem do Ticket

```
id | ticket_id (FK) | autor_id (FK) | mensagem | criado_em
```

---

## 9. Módulo 06 — Configurações e Autenticação

### Perfis de Usuário

| Perfil | Acessos |
|--------|---------|
| **Operador** | PDV, visualização de estoque, abertura de tickets. Sem acesso ao fechamento ou configurações. |
| **Administrador** | Acesso total: PDV, estoque, fichas, fechamento, configurações e painel de suporte. |
| **Suporte** | Acesso ao painel de tickets para responder chamados. Sem acesso à operação. |

### Tela de Configurações

- **Gerenciar usuários:** criar, editar e remover operadores.
- **Configurações do clube:** nome, logo e informações de contato.
- **Backup de dados:** exportar relatório em PDF ou CSV.

---

## 10. Banco de Dados

### Entidades Principais

| Entidade | Principais Campos | Relacionamentos |
|----------|-------------------|-----------------|
| `usuarios` | id, nome, email, senha_hash, perfil, ativo | Tem muitos pedidos, tickets |
| `produtos` | id, nome, categoria, preco, qtd_estoque, qtd_minima, ativo | Aparece em itens_pedido |
| `pedidos` | id, usuario_id, status, total, tipo, criado_em | Tem muitos itens_pedido, pode ter ficha |
| `itens_pedido` | id, pedido_id, produto_id, quantidade, preco_unitario | Pertence a pedido e produto |
| `clientes` | id, nome, cpf, telefone, observacoes | Tem muitas fichas |
| `fichas` | id, cliente_id, data, status, total, forma_pgto, fechada_em | Tem muitos pedidos |
| `tickets` | id, usuario_id, titulo, categoria, descricao, status | Tem muitas mensagens_ticket |
| `mensagens_ticket` | id, ticket_id, autor_id, mensagem, criado_em | Pertence a ticket |
| `caixas` | id, data, total_vendas, total_fichas, fechado_por, fechado_em | Referência ao dia |
| `ajustes_estoque` | id, produto_id, quantidade, tipo, motivo, usuario_id | Auditoria de estoque |

---

## 11. Fluxo Operacional Diário

```
ABERTURA
  └─ Admin verifica estoque inicial, confirma produtos disponíveis
     e libera o sistema para os operadores.

OPERAÇÃO
  └─ Operadores usam o PDV para registrar vendas.
     Pedidos pagos na hora ou lançados em fichas.

MEIO DO DIA
  └─ Admin monitora estoque pelos alertas, reabastece
     se necessário via ajuste manual.

FIM DO DIA
  └─ Fichas são fechadas conforme clientes pagam.
     Admin acessa Fechamento de Caixa.

FECHAMENTO
  └─ Admin revisa relatório, confirma valores
     e clica em "Fechar Caixa". Dia encerrado.
```

---

## 12. Cronograma UNIASSELVI (195h)

| Bloco | Atividades | Horas |
|-------|-----------|-------|
| **Bloco 1 — Planejamento** | Kickoff, definição de escopo, pesquisa de mercado, levantamento de requisitos com o Alvorada EC, criação do backlog e definição das sprints. | 90h |
| **Bloco 2 — Design** | Prototipação das telas (Figma / Stitch), modelagem do banco de dados, definição da arquitetura e do fluxo de navegação. | 35h |
| **Bloco 3 — Desenvolvimento** | Codificação do MVP (todos os 6 módulos), testes com operadores reais do clube, correção de bugs e implantação piloto. | 55h |
| **Bloco 4 — Documentação** | Coleta de métricas, escrita do relatório técnico, produção do artigo científico e preparação do material final para submissão. | 15h |
| | **TOTAL** | **195h** |

---

## 13. Entregas Obrigatórias

### 1. Registro de Frequência
Documento assinado e datado conforme cronograma de sprints. Manter log semanal de horas dedicadas ao projeto.

### 2. Evidência do Sistema
- Link do repositório **GitHub** com commits regulares
- **Prints** de todas as telas funcionando
- **Vídeo demonstrativo** do fluxo completo (PDV → pedido → fechamento)

### 3. Artigo Científico
Texto técnico/acadêmico descrevendo o desenvolvimento, as tecnologias utilizadas e os resultados obtidos para a associação. Deve ser submetido conforme normas da UNIASSELVI.

### 4. Relatório Final
Descrição detalhada da experiência, impacto social (número de pessoas beneficiadas), dificuldades enfrentadas e dados do local:
- Nome: **Alvorada Esporte Clube**
- Cidade: **Blumenau, SC**
- Fundação: **1975**
- Responsável legal: *(preencher com nome do presidente do clube)*

### Métricas de Impacto a Coletar

- Número de membros e familiares do clube beneficiados pelo sistema.
- Redução de tempo médio de atendimento na cantina (antes vs depois).
- Número de pedidos registrados no período piloto.
- Número de tickets de suporte abertos e resolvidos.
- Economia estimada por redução de erros de caixa e perdas de estoque.

---

*CaixaFacil Alvorada — Documento de Especificação Técnica — Projeto de Extensão UNIASSELVI — 2025*
