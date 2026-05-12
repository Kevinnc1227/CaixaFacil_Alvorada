import { db } from './db';
import { organizacoes, usuarios, produtos } from './schema';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

async function seed() {
    console.log('🌱 Seeding K-HUB database...');

    // ─── Super Admins (credenciais lidas do .env — nunca hardcoded) ────────────
    const sa1Email    = process.env.SUPERADMIN_1_EMAIL;
    const sa1Username = process.env.SUPERADMIN_1_USERNAME;
    const sa1Senha    = process.env.SUPERADMIN_1_SENHA;

    const sa2Email    = process.env.SUPERADMIN_2_EMAIL;
    const sa2Username = process.env.SUPERADMIN_2_USERNAME;
    const sa2Senha    = process.env.SUPERADMIN_2_SENHA;

    if (!sa1Email || !sa1Username || !sa1Senha || !sa2Email || !sa2Username || !sa2Senha) {
        console.error('❌ Variáveis de ambiente dos Super Admins não encontradas.');
        console.error('   Crie o arquivo backend/.env com base em backend/.env.example');
        process.exit(1);
    }

    console.log('👑 Seeding Super Admins...');
    const [sa1Hash, sa2Hash] = await Promise.all([
        bcrypt.hash(sa1Senha, 12),
        bcrypt.hash(sa2Senha, 12),
    ]);

    await db.insert(usuarios).values([
        {
            nome: 'Kaue (K-HUB)',
            email: sa1Email,
            username: sa1Username,
            senhaHash: sa1Hash,
            perfil: 'SUPERADMIN',
            organizacaoId: null,
        },
        {
            nome: 'Kevin (K-HUB)',
            email: sa2Email,
            username: sa2Username,
            senhaHash: sa2Hash,
            perfil: 'SUPERADMIN',
            organizacaoId: null,
        },
    ]);

    // ─── Organização Demo ─────────────────────────────────────────────────────
    console.log('🏢 Seeding demo organization...');
    const demoSetupToken = crypto.randomUUID();

    const [demoOrg] = await db.insert(organizacoes).values({
        nome: 'Alvorada Esporte Clube',
        slug: 'alvorada-ec',
        emailContato: 'admin@alvorada.com',
        avisoRecibo: 'Obrigado por fortalecer o esporte local!',
        setupToken: demoSetupToken,
        setupConcluido: true,
    }).returning({ id: organizacoes.id });

    // ─── Usuários da org demo ─────────────────────────────────────────────────
    console.log('👤 Seeding demo users...');
    const [adminHash, opHash, supHash] = await Promise.all([
        bcrypt.hash('admin123', 12),
        bcrypt.hash('operador123', 12),
        bcrypt.hash('suporte123', 12),
    ]);

    await db.insert(usuarios).values([
        {
            nome: 'Administrador',
            email: 'admin@alvorada.com',
            username: 'admin.alvorada',
            senhaHash: adminHash,
            perfil: 'ADMINISTRADOR',
            organizacaoId: demoOrg.id,
        },
        {
            nome: 'Operador Caixa',
            email: 'operador@alvorada.com',
            username: 'operador.alvorada',
            senhaHash: opHash,
            perfil: 'OPERADOR',
            organizacaoId: demoOrg.id,
        },
        {
            nome: 'Suporte Técnico',
            email: 'suporte@alvorada.com',
            username: 'suporte.alvorada',
            senhaHash: supHash,
            perfil: 'SUPORTE',
            organizacaoId: demoOrg.id,
        },
    ]);

    // ─── Produtos demo ────────────────────────────────────────────────────────
    console.log('🍔 Seeding demo products...');
    await db.insert(produtos).values([
        { organizacaoId: demoOrg.id, nome: 'Cerveja Pilsen Lata 350ml',    categoria: 'Bebidas',  precoVenda: 12.0, qtdEstoque: 150, qtdMinima: 30 },
        { organizacaoId: demoOrg.id, nome: 'Água Mineral Sem Gás 500ml',   categoria: 'Bebidas',  precoVenda: 5.0,  qtdEstoque: 80,  qtdMinima: 20 },
        { organizacaoId: demoOrg.id, nome: 'Refrigerante Cola Lata 350ml', categoria: 'Bebidas',  precoVenda: 8.0,  qtdEstoque: 100, qtdMinima: 24 },
        { organizacaoId: demoOrg.id, nome: 'Coxinha de Frango',            categoria: 'Salgados', precoVenda: 8.5,  qtdEstoque: 50,  qtdMinima: 10 },
        { organizacaoId: demoOrg.id, nome: 'Combo Torcedor (2 Cerv + 1 Cox)', categoria: 'Combos', precoVenda: 30.0, qtdEstoque: 40, qtdMinima: 5 },
        { organizacaoId: demoOrg.id, nome: 'Halls Morango',                categoria: 'Doces',    precoVenda: 3.5,  qtdEstoque: 30,  qtdMinima: 5 },
        { organizacaoId: demoOrg.id, nome: 'Amendoim Japonês',             categoria: 'Outros',   precoVenda: 6.0,  qtdEstoque: 0,   qtdMinima: 10 },
    ]);

    console.log('✨ Seed completo!');
    console.log(`   Setup token demo: http://localhost:5173/setup/${demoSetupToken}`);
    process.exit(0);
}

seed().catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
});
