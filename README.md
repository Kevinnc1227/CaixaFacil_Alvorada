## 📋 Requisitos do Sistema

### Requisitos Funcionais (RF)

#### 🔐 Autenticação
| ID | Descrição |
|----|-----------|
| RF-01.1 | Login com e-mail e senha |
| RF-01.2 | Token JWT com validade de 8 horas |
| RF-01.3 | Três perfis de acesso: **Operador**, **Administrador** e **Suporte** |
| RF-01.4 | Bloqueio de rotas não autorizadas por perfil |
| RF-01.5 | Administrador cria, edita e desativa contas de operadores |

#### 📦 Estoque
| ID | Descrição |
|----|-----------|
| RF-02.1 | Listagem de produtos com foto, preço, quantidade e status |
| RF-02.2 | Cadastro de produtos com categoria, preço, qtd. inicial e mínima |
| RF-02.3 | Produtos com estoque zero marcados como "Esgotado" automaticamente |
| RF-02.4 | Ajuste manual de estoque com justificativa obrigatória |
| RF-02.5 | Histórico de ajustes mantido para auditoria |
| RF-02.6 | Badge de alerta na navegação para produtos abaixo do mínimo |
| RF-02.7 | Estoque final do dia vira estoque inicial do próximo automaticamente |

#### 🛒 PDV — Ponto de Venda
| ID | Descrição |
|----|-----------|
| RF-03.1 | PDV como tela inicial do sistema |
| RF-03.2 | Grade de produtos com foto (se disponível), nome e preço |
| RF-03.3 | Um toque no produto adiciona ao carrinho com quantidade 1 |
| RF-03.4 | Carrinho com controle de quantidade (+/-) por item |
| RF-03.5 | Busca em tempo real por nome do produto |
| RF-03.6 | Filtro por categoria: Todos / Bebidas / Comidas / Outros |
| RF-03.7 | Produtos esgotados exibidos como desabilitados |
| RF-03.8 | Modal de finalização com itens, subtotais e total geral |
| RF-03.9 | Dois tipos de pagamento: **Pagar Agora** ou **Lançar na Ficha** |
| RF-03.10 | Estoque decrementado automaticamente ao confirmar pedido |
| RF-03.11 | Carrinho limpo e pedido salvo após confirmação |

#### 🪪 Fichas — Contas de Clientes
| ID | Descrição |
|----|-----------|
| RF-04.1 | Cadastro de clientes com nome completo, CPF e telefone |
| RF-04.2 | Uma ficha (conta) aberta por cliente por dia |
| RF-04.3 | Pedidos lançados acumulam no total da ficha |
| RF-04.4 | Perfil do cliente exibe histórico de pedidos e total acumulado |
| RF-04.5 | Fechamento de conta com registro de forma de pagamento |
| RF-04.6 | Ficha fechada fica em modo somente leitura |

#### 💰 Fechamento de Caixa
| ID | Descrição |
|----|-----------|
| RF-05.1 | Relatório com total de vendas, fichas, pedidos, itens e produto mais vendido |
| RF-05.2 | Seções: Resumo Financeiro, Movimentação de Estoque, Pedidos e Fichas do Dia |
| RF-05.3 | Botão "Fechar Caixa" que congela os dados para auditoria |
| RF-05.4 | Caixa fechável apenas **uma vez por dia** |
| RF-05.5 | Fichas em aberto destacadas em amarelo no relatório |
| RF-05.6 | Histórico de todos os fechamentos disponível para consulta |

#### 🎫 Suporte — Tickets
| ID | Descrição |
|----|-----------|
| RF-06.1 | Abertura de ticket com título, categoria e descrição |
| RF-06.2 | Categorias: Bug / Dúvida / Sugestão / Urgente |
| RF-06.3 | Histórico de respostas em formato de chat |
| RF-06.4 | Fluxo de status: Aberto → Em Andamento → Resolvido → Fechado |
| RF-06.5 | Painel de suporte com todos os tickets (perfil Admin/Suporte) |
| RF-06.6 | Filtro por status e categoria no painel admin |

#### ⚙️ Configurações
| ID | Descrição |
|----|-----------|
| RF-07.1 | Gerenciamento de usuários operadores |
| RF-07.2 | Configurações do clube: nome, logo e contato |
| RF-07.3 | Exportação de relatório em PDF ou CSV |

---

### Requisitos Não Funcionais (RNF)

| ID | Categoria | Descrição |
|----|-----------|-----------|
| RNF-01.1 | Desempenho | Ações no PDV respondem em menos de 300ms |
| RNF-01.2 | Desempenho | Carregamento inicial inferior a 3s em 3G |
| RNF-02.1 | Disponibilidade | Uptime mínimo de 99% durante eventos |
| RNF-02.2 | Confiabilidade | Operações básicas do PDV funcionam offline |
| RNF-03.1 | Segurança | Senhas com hash bcrypt (custo ≥ 12) |
| RNF-03.2 | Segurança | Todas as rotas exigem token JWT válido |
| RNF-03.3 | Segurança | Fechamento de caixa restrito ao perfil Administrador |
| RNF-03.4 | Segurança | CPF e telefone não expostos em logs |
| RNF-04.1 | Usabilidade | Sistema utilizável sem treinamento extenso |
| RNF-04.2 | Usabilidade | Adicionar produto ao carrinho com **1 toque** |
| RNF-04.3 | Usabilidade | Área de toque mínima de 48×48px nos botões |
| RNF-04.4 | Usabilidade | Feedback visual imediato via toast notifications |
| RNF-05.1 | Compatibilidade | Funciona em Android (Chrome) e iOS (Safari) |
| RNF-05.2 | Compatibilidade | Interface responsiva: mobile-first + desktop |
| RNF-06.2 | Manutenibilidade | Commits semânticos (Conventional Commits) |

---

### Regras de Negócio (RN)

| ID | Regra |
|----|-------|
| RN-01 | O caixa só pode ser fechado **uma vez por dia** e não pode ser reaberto |
| RN-02 | Produtos com estoque zero **não** podem ser adicionados ao carrinho |
| RN-03 | Decremento de estoque após pedido é irreversível — ajustes exigem justificativa |
| RN-04 | Fichas acumulam pedidos até o administrador efetuar o fechamento |
| RN-05 | Estoque final do dia vira estoque inicial do dia seguinte automaticamente |
| RN-06 | Histórico de ajustes manuais mantido para auditoria do fechamento de caixa |
