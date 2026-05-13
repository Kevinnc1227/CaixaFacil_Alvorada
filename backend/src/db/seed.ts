import { db } from './db';
import { usuarios, produtos } from './schema';
import bcrypt from 'bcrypt';

async function seed() {
    console.log('🌱 Seeding database...');

    // Admin and Operador passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const operatorPasswordHash = await bcrypt.hash('operador123', 12);
    const supportPasswordHash = await bcrypt.hash('suporte123', 12);

    console.log('👤 Seeding users...');
    await db.insert(usuarios).values([
        {
            nome: 'Administrador',
            email: 'admin@alvorada.com',
            senhaHash: adminPasswordHash,
            perfil: 'ADMINISTRADOR',
        },
        {
            nome: 'Operador Caixa',
            email: 'operador@alvorada.com',
            senhaHash: operatorPasswordHash,
            perfil: 'OPERADOR',
        },
        {
            nome: 'Suporte Técnico',
            email: 'suporte@alvorada.com',
            senhaHash: supportPasswordHash,
            perfil: 'SUPORTE',
        },
    ]);

    console.log('🍔 Seeding products...');
    await db.insert(produtos).values([
        {
            nome: 'Cerveja Pilsen Lata 350ml',
            categoria: 'Bebidas',
            precoVenda: 12.0,
            qtdEstoque: 150,
            qtdMinima: 30,
        },
        {
            nome: 'Água Mineral Sem Gás 500ml',
            categoria: 'Bebidas',
            precoVenda: 5.0,
            qtdEstoque: 80,
            qtdMinima: 20,
        },
        {
            nome: 'Refrigerante Cola Lata 350ml',
            categoria: 'Bebidas',
            precoVenda: 8.0,
            qtdEstoque: 100,
            qtdMinima: 24,
        },
        {
            nome: 'Coxinha de Frango',
            categoria: 'Salgados',
            precoVenda: 8.5,
            qtdEstoque: 50,
            qtdMinima: 10,
        },
        {
            nome: 'Combo Torcedor (2 Cerv + 1 Cox)',
            categoria: 'Combos',
            precoVenda: 30.0,
            qtdEstoque: 40,
            qtdMinima: 5,
        },
        {
            nome: 'Halls Morango',
            categoria: 'Doces',
            precoVenda: 3.5,
            qtdEstoque: 30,
            qtdMinima: 5,
        },
        {
            nome: 'Amendoim Japonês',
            categoria: 'Outros',
            precoVenda: 6.0,
            qtdEstoque: 0, // Mock for sold-out
            qtdMinima: 10,
        },
    ]);

    console.log('✨ Seeding complete!');
    process.exit(0);
}

seed().catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
});
