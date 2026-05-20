import { Response } from 'express';
import { db } from '../db/db';
import { reservasCampo, tickets, mensagensTicket, clientes, usuarios } from '../db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { AuthRequest } from '../middlewares/authMiddleware';

// ─── LISTAR RESERVAS ─────────────────────────────────────────────────────────
export const listReservas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const criadores = alias(usuarios, 'criadores');
        const atualizadores = alias(usuarios, 'atualizadores');

        // JOIN com clientes para retornar o nome junto e usuarios para criador/atualizador
        const resultado = await db
            .select({
                id: reservasCampo.id,
                dataReserva: reservasCampo.dataReserva,
                horaInicio: reservasCampo.horaInicio,
                horaFim: reservasCampo.horaFim,
                valorTotal: reservasCampo.valorTotal,
                status: reservasCampo.status,
                clienteId: reservasCampo.clienteId,
                nomeCliente: clientes.nomeCompleto,
                ticketId: reservasCampo.ticketId,
                usuarioId: reservasCampo.usuarioId,
                criadoEm: reservasCampo.criadoEm,
                atualizadoPor: reservasCampo.atualizadoPor,
                atualizadoEm: reservasCampo.atualizadoEm,
                criadorNome: criadores.nome,
                atualizadorNome: atualizadores.nome,
            })
            .from(reservasCampo)
            .innerJoin(clientes, eq(reservasCampo.clienteId, clientes.id))
            .leftJoin(criadores, eq(reservasCampo.usuarioId, criadores.id))
            .leftJoin(atualizadores, eq(reservasCampo.atualizadoPor, atualizadores.id))
            .orderBy(desc(reservasCampo.id));

        res.json(resultado);
    } catch (error) {
        console.error('Erro ao listar reservas:', error);
        res.status(500).json({ error: 'Erro ao listar reservas de campo' });
    }
};

// ─── CRIAR RESERVA (FATO GERADOR DE ATENDIMENTO) ─────────────────────────────
// Fluxo atômico (transaction):
//   1. Busca nome do cliente
//   2. Cria a Reserva de Campo
//   3. Cria o Ticket de Suporte vinculado ('Reserva de Campo - [Nome]')
//   4. Adiciona a primeira mensagem ao chat do ticket (descrição da reserva)
//   5. Atualiza o ticketId na reserva (relacionamento OneToOne)
export const createReserva = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const usuarioId = req.user!.id;
        const { clienteId, dataReserva, horaInicio, horaFim, valorTotal } = req.body;

        if (!clienteId || !dataReserva || !horaInicio || !horaFim || !valorTotal) {
            res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            return;
        }

        // Validação: horaInicio deve ser menor que horaFim
        if (horaInicio >= horaFim) {
            res.status(400).json({ error: 'O horário de início deve ser anterior ao horário de término' });
            return;
        }

        // 1. Buscar se há conflito de horário no mesmo dia (desconsiderando reservas canceladas)
        const reservasDoDia = await db.select().from(reservasCampo)
            .where(
                and(
                    eq(reservasCampo.dataReserva, dataReserva),
                    ne(reservasCampo.status, 'CANCELADA')
                )
            );

        const temConflito = reservasDoDia.some(reserva => {
            // Nova reserva: [horaInicio, horaFim]
            // Reserva existente: [reserva.horaInicio, reserva.horaFim]
            // Conflito existe se: horaInicio < reserva.horaFim E horaFim > reserva.horaInicio
            return (horaInicio < reserva.horaFim && horaFim > reserva.horaInicio);
        });

        if (temConflito) {
            res.status(409).json({ error: 'O horário selecionado já está reservado por outro cliente neste dia.' });
            return;
        }

        // 1. Buscar o nome do cliente para compor o título do ticket
        const clienteDb = await db
            .select({ nomeCompleto: clientes.nomeCompleto })
            .from(clientes)
            .where(eq(clientes.id, clienteId))
            .get();

        if (!clienteDb) {
            res.status(404).json({ error: 'Cliente não encontrado' });
            return;
        }

        let novaReservaId: number;
        let novoTicketId: number;

        db.transaction((tx) => {
            // 2. Criar a reserva (ticketId ainda NULL)
            const reservaCriada = tx.insert(reservasCampo).values({
                clienteId,
                dataReserva,
                horaInicio,
                horaFim,
                valorTotal: Number(valorTotal),
                status: 'CONFIRMADA',
                usuarioId,
            }).returning().get();

            novaReservaId = reservaCriada.id;

            // 3. Criar o Ticket de Atendimento automaticamente
            const tituloTicket = `Reserva de Campo - ${clienteDb.nomeCompleto}`;
            const descricaoTicket =
                `Reserva de campo confirmada automaticamente.\n` +
                `Data: ${dataReserva} | ${horaInicio} → ${horaFim}\n` +
                `Valor: R$ ${Number(valorTotal).toFixed(2)}\n` +
                `Reserva ID: #${reservaCriada.id}`;

            const ticketCriado = tx.insert(tickets).values({
                organizacaoId: req.user!.organizacaoId!,
                usuarioId,
                titulo: tituloTicket,
                categoria: 'DUVIDA',
                descricao: descricaoTicket,
                status: 'ABERTO',
            }).returning().get();

            novoTicketId = ticketCriado.id;

            // 4. Adicionar a primeira mensagem do ticket (descrição da reserva)
            tx.insert(mensagensTicket).values({
                ticketId: ticketCriado.id,
                autorId: usuarioId,
                mensagem: descricaoTicket,
            }).run();

            // 5. Atualizar o ticketId na reserva — OneToOne
            tx.update(reservasCampo)
                .set({ ticketId: ticketCriado.id })
                .where(eq(reservasCampo.id, reservaCriada.id))
                .run();
        });

        res.status(201).json({
            message: 'Reserva criada com sucesso',
            reservaId: novaReservaId!,
            ticketId: novoTicketId!,
        });
    } catch (error) {
        console.error('Erro ao criar reserva:', error);
        res.status(500).json({ error: 'Erro ao criar reserva de campo' });
    }
};

// ─── ATUALIZAR STATUS DA RESERVA ─────────────────────────────────────────────
export const updateStatusReserva = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reservaId = Number(req.params.id);
        const { status } = req.body;

        const validos = ['PENDENTE', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA'];
        if (!validos.includes(status)) {
            res.status(400).json({ error: 'Status inválido' });
            return;
        }

        const [atualizada] = await db
            .update(reservasCampo)
            .set({ status })
            .where(eq(reservasCampo.id, reservaId))
            .returning();

        res.json(atualizada);
    } catch (error) {
        console.error('Erro ao atualizar reserva:', error);
        res.status(500).json({ error: 'Erro ao atualizar status da reserva' });
    }
};

// ─── ALTERAR HORÁRIO DA RESERVA ──────────────────────────────────────────────
export const updateReservaHorario = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reservaId = Number(req.params.id);
        const { dataReserva, horaInicio, horaFim } = req.body;
        const usuarioId = req.user!.id;

        if (!dataReserva || !horaInicio || !horaFim) {
            res.status(400).json({ error: 'Data de reserva, hora de início e hora de término são obrigatórias' });
            return;
        }

        if (horaInicio >= horaFim) {
            res.status(400).json({ error: 'O horário de início deve ser anterior ao horário de término' });
            return;
        }

        // Verificar se a reserva existe
        const reservaExistente = await db.select().from(reservasCampo).where(eq(reservasCampo.id, reservaId)).get();
        if (!reservaExistente) {
            res.status(404).json({ error: 'Reserva não encontrada' });
            return;
        }

        // Verificar se há conflito de horário no mesmo dia (desconsiderando a própria reserva e reservas canceladas)
        const conflitos = await db.select().from(reservasCampo)
            .where(
                and(
                    eq(reservasCampo.dataReserva, dataReserva),
                    ne(reservasCampo.status, 'CANCELADA'),
                    ne(reservasCampo.id, reservaId)
                )
            );

        const temConflito = conflitos.some(r => {
            return (horaInicio < r.horaFim && horaFim > r.horaInicio);
        });

        if (temConflito) {
            res.status(409).json({ error: 'O horário selecionado já está reservado por outro cliente neste dia.' });
            return;
        }

        // Atualizar a reserva
        const [atualizada] = await db.update(reservasCampo)
            .set({
                dataReserva,
                horaInicio,
                horaFim,
                atualizadoPor: usuarioId,
                atualizadoEm: new Date(),
            })
            .where(eq(reservasCampo.id, reservaId))
            .returning();

        res.json(atualizada);
    } catch (error) {
        console.error('Erro ao atualizar horário da reserva:', error);
        res.status(500).json({ error: 'Erro ao atualizar horário da reserva' });
    }
};
