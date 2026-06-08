import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// ─── ORGANIZAÇÕES (Tenants / Clientes K-HUB) ─────────────────────────────────
export const organizacoes = sqliteTable('organizacoes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    slug: text('slug').notNull().unique(),
    emailContato: text('email_contato'),
    telefone: text('telefone'),
    cnpj: text('cnpj'),
    avisoRecibo: text('aviso_recibo').default('Obrigado pela preferência!'),
    temaPreferido: text('tema_preferido').default('amber-dark'),
    setupConcluido: integer('setup_concluido', { mode: 'boolean' }).notNull().default(false),
    setupToken: text('setup_token').unique(),
    ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── LEADS (Solicitações de Acesso via Landing Page) ─────────────────────────
export const leads = sqliteTable('leads', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nomeNegocio: text('nome_negocio').notNull(),
    email: text('email').notNull(),
    telefone: text('telefone'),
    mensagem: text('mensagem'),
    status: text('status', { enum: ['PENDENTE', 'CONTATADO', 'CONVERTIDO', 'DESCARTADO'] })
        .notNull()
        .default('PENDENTE'),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── USUÁRIOS ─────────────────────────────────────────────────────────────────
export const usuarios = sqliteTable('usuarios', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    email: text('email').notNull().unique(),
    username: text('username').unique(),
    senhaHash: text('senha_hash').notNull(),
    perfil: text('perfil', {
        enum: ['OPERADOR', 'ADMINISTRADOR', 'SUPORTE', 'SUPERADMIN'],
    }).notNull().default('OPERADOR'),
    // SUPERADMIN tem organizacaoId = null (acessa tudo)
    organizacaoId: integer('organizacao_id').references(() => organizacoes.id),
    ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── PRODUTOS ─────────────────────────────────────────────────────────────────
export const produtos = sqliteTable('produtos', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizacaoId: integer('organizacao_id').notNull().references(() => organizacoes.id),
    nome: text('nome').notNull(),
    categoria: text('categoria').notNull(),
    precoVenda: real('preco_venda').notNull(),
    precoCusto: real('preco_custo').notNull().default(0), // Custo de aquisição para calcular lucro líquido
    qtdEstoque: integer('qtd_estoque').notNull().default(0),
    qtdMinima: integer('qtd_minima').notNull().default(0),
    ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
});

// ─── CLIENTES ─────────────────────────────────────────────────────────────────
export const clientes = sqliteTable('clientes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizacaoId: integer('organizacao_id').notNull().references(() => organizacoes.id),
    nomeCompleto: text('nome_completo').notNull(),
    cpf: text('cpf'),
    telefone: text('telefone'),
    observacoes: text('observacoes'),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── FICHAS ──────────────────────────────────────────────────────────────────
export const fichas = sqliteTable('fichas', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizacaoId: integer('organizacao_id').notNull().references(() => organizacoes.id),
    clienteId: integer('cliente_id').notNull().references(() => clientes.id),
    dataAbertura: integer('data_abertura', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    status: text('status', { enum: ['ABERTA', 'PAGA'] }).notNull().default('ABERTA'),
    totalAcumulado: real('total_acumulado').notNull().default(0),
    formaPagamento: text('forma_pagamento'),
    fechadaEm: integer('fechada_em', { mode: 'timestamp' }),
});

// ─── PEDIDOS ──────────────────────────────────────────────────────────────────
export const pedidos = sqliteTable('pedidos', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizacaoId: integer('organizacao_id').notNull().references(() => organizacoes.id),
    usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
    status: text('status', { enum: ['PAGO', 'LANCADO_FICHA', 'CANCELADO'] }).notNull(),
    total: real('total').notNull(),
    tipo: text('tipo', { enum: ['PAGAR_AGORA', 'LANCAR_FICHA'] }).notNull(),
    fichaId: integer('ficha_id').references(() => fichas.id),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── ITENS DO PEDIDO ─────────────────────────────────────────────────────────
export const itensPedido = sqliteTable('itens_pedido', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pedidoId: integer('pedido_id').notNull().references(() => pedidos.id),
    produtoId: integer('produto_id').notNull().references(() => produtos.id),
    quantidade: integer('quantidade').notNull(),
    precoUnitario: real('preco_unitario').notNull(),
});

// ─── TICKETS (Suporte) ────────────────────────────────────────────────────────
export const tickets = sqliteTable('tickets', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizacaoId: integer('organizacao_id').notNull().references(() => organizacoes.id),
    usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
    titulo: text('titulo').notNull(),
    categoria: text('categoria', { enum: ['BUG', 'DUVIDA', 'SUGESTAO', 'URGENTE'] }).notNull(),
    descricao: text('descricao').notNull(),
    status: text('status', { enum: ['ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO', 'FECHADO'] }).notNull().default('ABERTO'),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    atualizadoEm: integer('atualizado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── MENSAGENS DO TICKET ─────────────────────────────────────────────────────
export const mensagensTicket = sqliteTable('mensagens_ticket', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    ticketId: integer('ticket_id').notNull().references(() => tickets.id),
    autorId: integer('autor_id').notNull().references(() => usuarios.id),
    mensagem: text('mensagem').notNull(),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── CAIXAS (Fechamentos Diários) ────────────────────────────────────────────
export const caixas = sqliteTable('caixas', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizacaoId: integer('organizacao_id').notNull().references(() => organizacoes.id),
    data: integer('data', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    totalVendas: real('total_vendas').notNull(),
    totalFichas: real('total_fichas').notNull(),
    totalReservas: real('total_reservas').notNull().default(0),
    totalBruto: real('total_bruto').notNull().default(0),
    totalCusto: real('total_custo').notNull().default(0),   // Custo de aquisição dos produtos vendidos
    lucroLiquido: real('lucro_liquido').notNull().default(0), // totalBruto - totalCusto
    fechadoPor: integer('fechado_por').notNull().references(() => usuarios.id),
    fechadoEm: integer('fechado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── AJUSTES DE ESTOQUE ──────────────────────────────────────────────────────
export const ajustesEstoque = sqliteTable('ajustes_estoque', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizacaoId: integer('organizacao_id').notNull().references(() => organizacoes.id),
    produtoId: integer('produto_id').notNull().references(() => produtos.id),
    usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
    quantidade: integer('quantidade').notNull(),
    tipo: text('tipo', { enum: ['ENTRADA', 'SAIDA'] }).notNull(),
    motivo: text('motivo').notNull(),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── RESERVA DE CAMPO ────────────────────────────────────────────────────────
// Fato gerador de atendimento: ao criar uma reserva, um Ticket de suporte é
// automaticamente aberto e o valor é computado no Caixa do dia.
export const reservasCampo = sqliteTable('reservas_campo', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    // Data e horário do aluguel
    dataReserva: text('data_reserva').notNull(),       // 'YYYY-MM-DD'
    horaInicio: text('hora_inicio').notNull(),          // 'HH:MM'
    horaFim: text('hora_fim').notNull(),                // 'HH:MM'
    valorTotal: real('valor_total').notNull(),
    status: text('status', { enum: ['PENDENTE', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA'] })
        .notNull()
        .default('CONFIRMADA'),
    // Relacionamentos
    clienteId: integer('cliente_id').notNull().references(() => clientes.id),
    ticketId: integer('ticket_id').references(() => tickets.id),   // OneToOne — criado automaticamente
    usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
