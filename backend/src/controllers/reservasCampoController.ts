import { Response } from 'express';
import { db } from '../db/db';
import { reservasCampo, tickets, mensagensTicket, clientes } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

// ─── LISTAR RESERVAS ─────────────────────────────────────────────────────────
export const listReservas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // JOIN com clientes para retornar o nome junto
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
            })
            .from(reservasCampo)
            .innerJoin(clientes, eq(reservasCampo.clienteId, clientes.id))
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

        await db.transaction(async (tx) => {
            // 2. Criar a reserva (ticketId ainda NULL)
            const [reservaCriada] = await tx.insert(reservasCampo).values({
                clienteId,
                dataReserva,
                horaInicio,
                horaFim,
                valorTotal: Number(valorTotal),
                status: 'CONFIRMADA',
                usuarioId,
            }).returning();

            novaReservaId = reservaCriada.id;

            // 3. Criar o Ticket de Atendimento automaticamente
            const tituloTicket = `Reserva de Campo - ${clienteDb.nomeCompleto}`;
            const descricaoTicket =
                `Reserva de campo confirmada automaticamente.\n` +
                `Data: ${dataReserva} | ${horaInicio} → ${horaFim}\n` +
                `Valor: R$ ${Number(valorTotal).toFixed(2)}\n` +
                `Reserva ID: #${reservaCriada.id}`;

            const [ticketCriado] = await tx.insert(tickets).values({
                usuarioId,
                titulo: tituloTicket,
                categoria: 'DUVIDA',   // Categoria neutra — indica atendimento de serviço
                descricao: descricaoTicket,
                status: 'ABERTO',
            }).returning();

            novoTicketId = ticketCriado.id;

            // 4. Adicionar a primeira mensagem do ticket (descrição da reserva)
            await tx.insert(mensagensTicket).values({
                ticketId: ticketCriado.id,
                autorId: usuarioId,
                mensagem: descricaoTicket,
            });

            // 5. Atualizar o ticketId na reserva — OneToOne
            await tx.update(reservasCampo)
                .set({ ticketId: ticketCriado.id })
                .where(eq(reservasCampo.id, reservaCriada.id));
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
