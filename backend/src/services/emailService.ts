/**
 * emailService.ts
 * Stub para envio de e-mails. Por agora apenas loga no console.
 * Quando Nodemailer for configurado, basta preencher MAIL_USER e MAIL_PASS no .env.
 */

interface LeadEmailData {
    nomeNegocio: string;
    email: string;
    telefone?: string | null;
    mensagem?: string | null;
}

export async function enviarEmailNovoLead(data: LeadEmailData): Promise<void> {
    const MAIL_DEST = process.env.MAIL_DEST || 'kaue.khubsolucoes@gmail.com';

    // Se Nodemailer não estiver configurado, apenas loga
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
        console.log('📧 [Email Stub] Novo lead registrado (e-mail não configurado):');
        console.log(`   Para: ${MAIL_DEST}`);
        console.log(`   Negócio: ${data.nomeNegocio}`);
        console.log(`   Email: ${data.email}`);
        console.log(`   Telefone: ${data.telefone ?? '—'}`);
        return;
    }

    // Nodemailer (ativado quando MAIL_USER e MAIL_PASS estiverem no .env)
    try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.default.createTransport({
            service: 'gmail',
            auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
        });

        await transporter.sendMail({
            from: `"K-HUB Sistema" <${process.env.MAIL_USER}>`,
            to: MAIL_DEST,
            subject: `🔔 Nova solicitação de acesso — ${data.nomeNegocio}`,
            html: `
                <div style="font-family:sans-serif;max-width:520px;margin:auto">
                    <h2 style="color:#d4a853">Nova Solicitação de Acesso — K-HUB</h2>
                    <table style="width:100%;border-collapse:collapse">
                        <tr><td style="padding:8px;font-weight:bold">Negócio</td><td style="padding:8px">${data.nomeNegocio}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold">E-mail</td><td style="padding:8px">${data.email}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold">Telefone</td><td style="padding:8px">${data.telefone ?? '—'}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold">Mensagem</td><td style="padding:8px">${data.mensagem ?? '—'}</td></tr>
                    </table>
                    <p style="color:#888;font-size:12px;margin-top:24px">Acesse o painel K-HUB para gerenciar este lead.</p>
                </div>
            `,
        });
        console.log(`📧 E-mail enviado para ${MAIL_DEST}`);
    } catch (err) {
        console.error('Erro ao enviar e-mail:', err);
    }
}
