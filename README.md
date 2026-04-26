\# 🚀 Projeto CaixaFácil Alvorada



Sistema de gestão de ponto de venda (PDV), estoque e fichas de clientes, desenvolvido como projeto de extensão acadêmica para a \*\*UNIASSELVI\*\*. O sistema visa atender às necessidades da cantina da Associação Alvorada em Blumenau/SC.



\---



\## 📋 Documentação de Requisitos



\### 1. Requisitos Funcionais (RF)

O que o sistema deve fazer.



| ID | Módulo | Requisito |

| :--- | :--- | :--- |

| \*\*RF-01.1\*\* | Autenticação | O sistema deve permitir login com e-mail e senha. |

| \*\*RF-01.2\*\* | Autenticação | O sistema deve emitir um token JWT com validade de 8 horas. |

| \*\*RF-01.3\*\* | Autenticação | Suporte a três perfis: Operador, Administrador e Suporte. |

| \*\*RF-01.4\*\* | Autenticação | Bloqueio de rotas não autorizadas conforme o perfil. |

| \*\*RF-01.5\*\* | Autenticação | Administrador pode gerenciar contas de operadores. |

| \*\*RF-02.1\*\* | Estoque | Exibição de produtos com nome, preço, quantidade e status. |

| \*\*RF-02.2\*\* | Estoque | Cadastro de produtos (nome, categoria, preço, qtd. inicial e mínima). |

| \*\*RF-02.3\*\* | Estoque | Marcação automática de "Esgotado" para estoque zero. |

| \*\*RF-02.4\*\* | Estoque | Ajuste manual de estoque com justificativa obrigatória. |

| \*\*RF-02.5\*\* | Estoque | Registro de histórico de ajustes para auditoria. |

| \*\*RF-02.6\*\* | Estoque | Alerta visual para produtos abaixo da quantidade mínima. |

| \*\*RF-03.1\*\* | PDV | O PDV deve ser a tela inicial ao abrir o sistema. |

| \*\*RF-03.2\*\* | PDV | Grade de produtos com foto, nome e preço. |

| \*\*RF-03.3\*\* | PDV | Adição ao carrinho com um toque (quantidade 1). |

| \*\*RF-03.4\*\* | PDV | Carrinho com controle de quantidade (+/-). |

| \*\*RF-03.5\*\* | PDV | Busca de produtos em tempo real por nome. |

| \*\*RF-03.6\*\* | PDV | Filtros por categoria (Bebidas, Comidas, Outros). |

| \*\*RF-03.9\*\* | PDV | Tipos de pagamento: Balcão ou Lançar na Ficha. |

| \*\*RF-03.10\*\*| PDV | Decremento automático de estoque ao confirmar pedido. |

| \*\*RF-04.1\*\* | Fichas | Cadastro de clientes (Nome, CPF, Telefone). |

| \*\*RF-04.3\*\* | Fichas | Acúmulo de pedidos no total da conta do cliente. |

| \*\*RF-04.5\*\* | Fichas | Fechamento de conta com informe de forma de pagamento. |

| \*\*RF-05.1\*\* | Caixa | Relatório: Vendas totais, fichas abertas e produto mais vendido. |

| \*\*RF-05.3\*\* | Caixa | Função "Fechar Caixa" congela os dados do dia. |

| \*\*RF-06.1\*\* | Suporte | Abertura de tickets (Bug, Dúvida, Sugestão, Urgente). |

| \*\*RF-06.3\*\* | Suporte | Histórico de respostas em formato de chat. |



\---



\### 2. Requisitos Não Funcionais (RNF)

Como o sistema deve se comportar.



| ID | Categoria | Requisito |

| :--- | :--- | :--- |

| \*\*RNF-01.1\*\* | Desempenho | Ações no PDV devem responder em menos de 300ms. |

| \*\*RNF-02.2\*\* | Disponibilidade| Operações básicas do PDV devem funcionar offline (offline-friendly). |

| \*\*RNF-03.1\*\* | Segurança | Senhas armazenadas com hash bcrypt (custo ≥ 12). |

| \*\*RNF-04.1\*\* | Usabilidade | Interface intuitiva para voluntários sem treinamento extenso. |

| \*\*RNF-04.3\*\* | Usabilidade | Área de toque mínima de 48x48px (ambiente agitado). |

| \*\*RNF-05.2\*\* | Compatibilidade| Interface responsiva (Mobile-first). |

| \*\*RNF-06.2\*\* | Manutenibilidade| Commits seguindo o padrão \*Conventional Commits\*. |



\---



\### 3. Regras de Negócio (RN)

As leis que regem o funcionamento do programa.



\* \*\*RN-01:\*\* O caixa só pode ser fechado uma vez por dia e não pode ser reaberto.

\* \*\*RN-02:\*\* Produtos com estoque zero não podem ser adicionados ao carrinho.

\* \*\*RN-03:\*\* Decremento de estoque é irreversível (correções apenas via ajuste manual justificado).

\* \*\*RN-04:\*\* O estoque final de um dia vira automaticamente o inicial do dia seguinte.

\* \*\*RN-05:\*\* Uso obrigatório do GitHub para evidenciar progresso acadêmico.



\---



\### 4. Requisitos de Interface (RI)

\* \*\*Identidade Visual:\*\* Dark theme com as cores do clube (Azul #0D1B3E, Vermelho #C0272D).

\* \*\*Tipografia:\*\* Fonte Inter (Google Fonts).

\* \*\*Navegação:\*\* Menu inferior em dispositivos móveis.

\* \*\*Feedback:\*\* Notificações (toasts) para toda ação realizada com sucesso ou erro.



\---



\## 👥 Atores do Sistema

\* \*\*Operador:\*\* Realiza vendas e abre tickets.

\* \*\*Administrador:\*\* Gerencia estoque, usuários e fecha o caixa.

\* \*\*Suporte (Kevin):\*\* Resolve problemas técnicos via tickets.



\---



\## 🛠️ Tecnologias Previstas

\* \*\*Frontend:\*\* HTML, CSS, JavaScript (Framework a definir).

\* \*\*Arquitetura:\*\* Padrão MVC.

\* \*\*Banco de Dados:\*\* Relacional (SQL).

