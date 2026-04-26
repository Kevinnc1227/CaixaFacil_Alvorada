import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const usuarios = sqliteTable('usuarios', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    email: text('email').notNull().unique(),
    senhaHash: text('senha_hash').notNull(),
    perfil: text('perfil', { enum: ['OPERADOR', 'ADMINISTRADOR', 'SUPORTE'] }).notNull().default('OPERADOR'),
    ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const produtos = sqliteTable('produtos', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    categoria: text('categoria').notNull(),
    precoVenda: real('preco_venda').notNull(),
    qtdEstoque: integer('qtd_estoque').notNull().default(0),
    qtdMinima: integer('qtd_minima').notNull().default(0),
    ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
});

export const clientes = sqliteTable('clientes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nomeCompleto: text('nome_completo').notNull(),
    cpf: text('cpf').unique(),
    telefone: text('telefone'),
    observacoes: text('observacoes'),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const fichas = sqliteTable('fichas', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    clienteId: integer('cliente_id').notNull().references(() => clientes.id),
    dataAbertura: integer('data_abertura', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    status: text('status', { enum: ['ABERTA', 'PAGA'] }).notNull().default('ABERTA'),
    totalAcumulado: real('total_acumulado').notNull().default(0),
    formaPagamento: text('forma_pagamento'),
    fechadaEm: integer('fechada_em', { mode: 'timestamp' }),
});

export const pedidos = sqliteTable('pedidos', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
    status: text('status', { enum: ['PAGO', 'LANCADO_FICHA', 'CANCELADO'] }).notNull(),
    total: real('total').notNull(),
    tipo: text('tipo', { enum: ['PAGAR_AGORA', 'LANCAR_FICHA'] }).notNull(),
    fichaId: integer('ficha_id').references(() => fichas.id),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const itensPedido = sqliteTable('itens_pedido', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pedidoId: integer('pedido_id').notNull().references(() => pedidos.id),
    produtoId: integer('produto_id').notNull().references(() => produtos.id),
    quantidade: integer('quantidade').notNull(),
    precoUnitario: real('preco_unitario').notNull(),
});

export const tickets = sqliteTable('tickets', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
    titulo: text('titulo').notNull(),
    categoria: text('categoria', { enum: ['BUG', 'DUVIDA', 'SUGESTAO', 'URGENTE'] }).notNull(),
    descricao: text('descricao').notNull(),
    status: text('status', { enum: ['ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO', 'FECHADO'] }).notNull().default('ABERTO'),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    atualizadoEm: integer('atualizado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const mensagensTicket = sqliteTable('mensagens_ticket', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    ticketId: integer('ticket_id').notNull().references(() => tickets.id),
    autorId: integer('autor_id').notNull().references(() => usuarios.id),
    mensagem: text('mensagem').notNull(),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const caixas = sqliteTable('caixas', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    data: integer('data', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    totalVendas: real('total_vendas').notNull(),
    totalFichas: real('total_fichas').notNull(),
    fechadoPor: integer('fechado_por').notNull().references(() => usuarios.id),
    fechadoEm: integer('fechado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const ajustesEstoque = sqliteTable('ajustes_estoque', {
    id: integer('id').primaryKey({ autoIncrement: true }),
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
