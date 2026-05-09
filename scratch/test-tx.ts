import { db } from '../backend/src/db/db';
import { reservasCampo, tickets, mensagensTicket, clientes } from '../backend/src/db/schema';
import { eq } from 'drizzle-orm';

try {
    const clienteDb = db.select().from(clientes).where(eq(clientes.id, 5)).get();
    
    let novaReservaId: number;
    let novoTicketId: number;

    console.log("Starting transaction...");
    db.transaction((tx) => {
        console.log("Inside transaction...");
        const reservaCriada = tx.insert(reservasCampo).values({
            clienteId: 5,
            dataReserva: '2026-05-09',
            horaInicio: '10:00',
            horaFim: '11:00',
            valorTotal: 100,
            status: 'CONFIRMADA',
            usuarioId: 1,
        }).returning().get();
        console.log("Reserva:", reservaCriada);

        novaReservaId = reservaCriada.id;

        const ticketCriado = tx.insert(tickets).values({
            usuarioId: 1,
            titulo: 'Test Ticket',
            categoria: 'DUVIDA',
            descricao: 'Test',
            status: 'ABERTO',
        }).returning().get();
        console.log("Ticket:", ticketCriado);

        novoTicketId = ticketCriado.id;

        tx.insert(mensagensTicket).values({
            ticketId: ticketCriado.id,
            autorId: 1,
            mensagem: 'Test',
        }).run();
        console.log("Mensagem inserted");

        tx.update(reservasCampo)
            .set({ ticketId: ticketCriado.id })
            .where(eq(reservasCampo.id, reservaCriada.id))
            .run();
        console.log("Reserva updated");
    });
    console.log("Transaction finished!");
    console.log("NovaReservaId:", novaReservaId!);
} catch (e) {
    console.error("Caught error:", e);
}
