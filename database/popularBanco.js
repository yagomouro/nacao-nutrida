const { MongoClient } = require('mongodb');

const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const url = process.env.DATABASE_URL;
const dbName = 'nacao-nutrida';

const client = new MongoClient(url);

async function popularBanco() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB');

        const db = client.db(dbName);

        const alimentos = [
            { nm_alimento: 'Arroz', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Grão', cd_tipo_alimento: 1 },
            { nm_alimento: 'Feijão', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Grão', cd_tipo_alimento: 1 },
            { nm_alimento: 'Macarrão', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Massa', cd_tipo_alimento: 1 },
            { nm_alimento: 'Café', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Mais doados', cd_tipo_alimento: 1 },
            { nm_alimento: 'Açúcar', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Mais doados', cd_tipo_alimento: 1 },
            { nm_alimento: 'Óleo', sg_medida_alimento: 'l', nm_tipo_alimento: 'Mais doados', cd_tipo_alimento: 1 },
            { nm_alimento: 'Ovos', sg_medida_alimento: 'dz', nm_tipo_alimento: 'Mais doados', cd_tipo_alimento: 1 },
            { nm_alimento: 'Azeite', sg_medida_alimento: 'l', nm_tipo_alimento: 'Mais doados', cd_tipo_alimento: 1 },
            { nm_alimento: 'Sal', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Mais doados', cd_tipo_alimento: 1 },
            { nm_alimento: 'Farinha de trigo', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Mais doados', cd_tipo_alimento: 1 },
            { nm_alimento: 'Fubá', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Mais doados', cd_tipo_alimento: 1 },
            { nm_alimento: 'Carne Bovina', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Linguiça', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Carne de Porco', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Bisteca', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Mortadela', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Carne de Frango', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Carne de Peixe', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Alface', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Tomate', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Alho', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Cebola', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Batata', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Cenoura', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Pimentão', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Abóbora', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Aveia', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Batata-doce', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Beterraba', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Brócolis', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Cebolinha', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Couve', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Ervilha', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Espinafre', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Lentilha', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Mandioca', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Milho', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Pepino', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Rúcula', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Repolho', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Salsa', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Verduras e Legumes', cd_tipo_alimento: 3 },
            { nm_alimento: 'Laranja', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Mamão', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Maçã', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Melancia', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Limão', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Tangerina', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Manga', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Abacaxi', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Pêra', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Melão', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Banana', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Uva', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Maracujá', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Abacate', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Coco', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Caqui', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Frutas', cd_tipo_alimento: 4 },
            { nm_alimento: 'Bacon', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Peito de Frango', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Bife', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Hambúrguer', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Carne Moída', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Salsicha', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Peixe em Lata', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Carnes', cd_tipo_alimento: 2 },
            { nm_alimento: 'Pão', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Grão', cd_tipo_alimento: 1 },
            { nm_alimento: 'Iogurte', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Laticínios', cd_tipo_alimento: 5 },
            { nm_alimento: 'Queijo', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Laticínios', cd_tipo_alimento: 5 },
            { nm_alimento: 'Leite', sg_medida_alimento: 'l', nm_tipo_alimento: 'Laticínios', cd_tipo_alimento: 5 },
            { nm_alimento: 'Creme de Leite', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Laticínios', cd_tipo_alimento: 5 },
            { nm_alimento: 'Manteiga', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Laticínios', cd_tipo_alimento: 5 },
            { nm_alimento: 'Requeijão', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Laticínios', cd_tipo_alimento: 5 },
            { nm_alimento: 'Sour Cream', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Laticínios', cd_tipo_alimento: 5 },
            { nm_alimento: 'Pudim', sg_medida_alimento: 'kg', nm_tipo_alimento: 'Laticínios', cd_tipo_alimento: 5 }

        ];
        const result = await db.collection('alimento').insertMany(alimentos);
        console.log(`${result.insertedCount} alimentos inseridos com sucesso!`);

        const usuarios = [
            { nm_usuario:'Yago Silva', ch_cpf_usuario:'12345678901', dt_nascimento_usuario:'1990-05-15', nr_celular_usuario:'11987654321', sg_estado_usuario:'SP', nm_cidade_usuario:'São Paulo', cd_foto_usuario:'1.png', cd_senha_usuario:'$2a$12$qYnfcan1eAudlxLP0mfxVeNk8Qnu8PHwhirai94t1F8ppGtG3eNw2', cd_email_usuario:'yago@email.com', fg_admin:0, qt_advertencias_usuario:0, fg_usuario_deletado:0 },
            { nm_usuario: 'Maria Santos', ch_cpf_usuario: '98765432109', dt_nascimento_usuario: '1985-12-10', nr_celular_usuario: '11901234567', sg_estado_usuario: 'RJ', nm_cidade_usuario: 'Rio de Janeiro', cd_foto_usuario: '2.png', cd_senha_usuario: '$2a$12$qYnfcan1eAudlxLP0mfxVeNk8Qnu8PHwhirai94t1F8ppGtG3eNw2', cd_email_usuario: 'maria@example.com', fg_admin: 0, qt_advertencias_usuario: 0, fg_usuario_deletado: 0 },
            { nm_usuario: 'Pedro Oliveira', ch_cpf_usuario: '45678901234', dt_nascimento_usuario: '1978-08-20', nr_celular_usuario: '11955556666', sg_estado_usuario: 'MG', nm_cidade_usuario: 'Belo Horizonte', cd_foto_usuario: '3.png', cd_senha_usuario: '$2a$12$qYnfcan1eAudlxLP0mfxVeNk8Qnu8PHwhirai94t1F8ppGtG3eNw2', cd_email_usuario: 'pedro@example.com', fg_admin: 0, qt_advertencias_usuario: 0, fg_usuario_deletado: 0 },
            { nm_usuario: 'Empresa ABC Ltda', ch_cnpj_usuario: '12345678901234', nr_celular_usuario: '11999998888', sg_estado_usuario: 'SP', nm_cidade_usuario: 'São Paulo', cd_foto_usuario: '4.png', cd_senha_usuario: '$2a$12$qYnfcan1eAudlxLP0mfxVeNk8Qnu8PHwhirai94t1F8ppGtG3eNw2', cd_email_usuario: 'empresa@example.com', fg_admin: 0, qt_advertencias_usuario: 0, fg_usuario_deletado: 0 },
            { nm_usuario: 'Comércio XYZ Ltda', ch_cnpj_usuario: '98765432109876', nr_celular_usuario: '11888887777', sg_estado_usuario: 'RJ', nm_cidade_usuario: 'Rio de Janeiro', cd_foto_usuario: 'default.png', cd_senha_usuario: '$2a$12$qYnfcan1eAudlxLP0mfxVeNk8Qnu8PHwhirai94t1F8ppGtG3eNw2', cd_email_usuario: 'comercio@example.com', fg_admin: 0, qt_advertencias_usuario: 0, fg_usuario_deletado: 0 }
        ];

        const usuariosResult = await db.collection('usuario').insertMany(usuarios);
        console.log(`${usuariosResult.insertedCount} usuarios inseridos com sucesso!`);

        const usuaria = await db.collection('usuario').find({}).toArray();


        const campanhas = [
            {
              usuario_id: usuaria[0]._id, // ID do usuário 1
              nm_titulo_campanha: "Campanha da Solidariedade",
              dt_encerramento_campanha: new Date('2027-10-10T00:00:00Z'),
              ts_criacao_campanha: new Date('2024-03-15T19:59:04Z'),
              nm_cidade_campanha: "São Paulo",
              sg_estado_campanha: "SP",
              ds_acao_campanha: "Esta campanha visa arrecadar alimentos para famílias em situação de vulnerabilidade social. Junte-se a nós e faça a diferença na vida de quem mais precisa.",
              cd_imagem_campanha: "1.png",
              fg_campanha_ativa: false, 
            },
            {
              usuario_id: usuaria[1]._id, // ID do usuário 2
              nm_titulo_campanha: "Ajude a Alimentar Famílias",
              dt_encerramento_campanha: new Date('2026-08-15T00:00:00Z'),
              ts_criacao_campanha: new Date('2024-03-15T19:59:04Z'),
              nm_cidade_campanha: "Rio de Janeiro",
              sg_estado_campanha: "RJ",
              ds_acao_campanha: "Nossa missão é garantir que ninguém passe fome. Com sua doação, podemos proporcionar refeições nutritivas e esperança para aqueles que enfrentam dificuldades.",
              cd_imagem_campanha: "2.png",
              fg_campanha_ativa: false, 
            },
            {
              usuario_id: usuaria[4]._id, // ID do usuário 2
              nm_titulo_campanha: "Unidos Pela Nutrição",
              dt_encerramento_campanha: new Date('2024-07-20T00:00:00Z'),
              ts_criacao_campanha: new Date('2024-03-15T19:59:04Z'),
              nm_cidade_campanha: "Belo Horizonte",
              sg_estado_campanha: "MG",
              ds_acao_campanha: "A pandemia afetou muitas pessoas, e agora mais do que nunca, é importante estender a mão para ajudar. Participe desta campanha e faça parte da mudança positiva.",
              cd_imagem_campanha: "3.png",
              fg_campanha_ativa: false,
            },
            {
              usuario_id: usuaria[0]._id, // ID do usuário 1
              nm_titulo_campanha: "Doação de Alimentos Essenciais",
              dt_encerramento_campanha: new Date('2024-06-25T00:00:00Z'),
              ts_criacao_campanha: new Date('2024-03-15T19:59:04Z'),
              nm_cidade_campanha: "Franca",
              sg_estado_campanha: "SP",
              ds_acao_campanha: "Juntos podemos fazer a diferença! Com sua contribuição, podemos distribuir cestas básicas para comunidades carentes, proporcionando alívio imediato e esperança para o futuro.",
              cd_imagem_campanha: "4.png",
              fg_campanha_ativa: false,
            },
            {
              usuario_id: usuaria[0]._id, // ID do usuário 1
              nm_titulo_campanha: "Compaixão em Ação",
              dt_encerramento_campanha: new Date('2024-06-30T00:00:00Z'),
              ts_criacao_campanha: new Date('2024-03-15T19:59:04Z'),
              nm_cidade_campanha: "Franca",
              sg_estado_campanha: "SP",
              ds_acao_campanha: "A fome não espera. É por isso que estamos mobilizando recursos e voluntários para garantir que todos tenham acesso a alimentos nutritivos. Faça parte desta iniciativa transformadora.",
              cd_imagem_campanha: "5.png",
              fg_campanha_ativa: false,
            },
            {
                usuario_id: usuaria[0]._id, // ID do usuário 1
                nm_titulo_campanha: "Combate à Desnutrição",
                dt_encerramento_campanha: new Date('2028-06-30T00:00:00Z'),
                ts_criacao_campanha: new Date('2024-03-15T19:59:04Z'),
                nm_cidade_campanha: "Franca",
                sg_estado_campanha: "SP",
                ds_acao_campanha: "Nos ajude a eliminar a desnutrição desse país!",
                cd_imagem_campanha: "3.png",
                fg_campanha_ativa: false,
              },
        ];
        
          // Passo 2: Inserir as campanhas no banco de dados
          for (const campanha of campanhas) {
            await db.collection('campanha').insertOne(campanha);
          }

        console.log("Campanhas inseridas com sucesso!");

        const campanhasa = await db.collection('campanha').find({}).toArray();
        const aliment = await db.collection('alimento').find({}).toArray();

          const alimentos_campanha = [
            {
                campanha_id: campanhasa[0]._id, 
                alimento_id: aliment[0]._id, 
                quantidade: 100,
            },
            {
                campanha_id: campanhasa[0]._id, // ID da primeira campanha
                alimento_id: aliment[1]._id,
                quantidade: 50,
            },
            {
                campanha_id: campanhasa[0]._id, // ID da primeira campanha
                alimento_id: aliment[2]._id,
                quantidade: 200,
            },
            {
                campanha_id: campanhasa[1]._id, // ID da segunda campanha
                alimento_id: aliment[3]._id,
                quantidade: 150,
            },
            {
                campanha_id: campanhasa[1]._id, // ID da segunda campanha
                alimento_id: aliment[4]._id,
                quantidade: 80,
            },
            {
                campanha_id: campanhasa[1]._id, // ID da segunda campanha
                alimento_id: aliment[5]._id,
                quantidade: 120,
            },
            {
                campanha_id: campanhasa[2]._id, // ID da terceira campanha
                alimento_id: aliment[6]._id,
                quantidade: 120,
            },
            {
                campanha_id: campanhasa[2]._id, // ID da terceira campanha
                alimento_id: aliment[7]._id,
                quantidade: 90,
            },
            {
                campanha_id: campanhasa[2]._id, // ID da terceira campanha
                alimento_id: aliment[8]._id,
                quantidade: 180,
            },
            {
                campanha_id: campanhasa[3]._id, // ID da quarta campanha
                alimento_id: aliment[9]._id,
                quantidade: 100,
            },
            {
                campanha_id: campanhasa[3]._id, // ID da quarta campanha
                alimento_id: aliment[10]._id,
                quantidade: 50,
            },
            {
                campanha_id: campanhasa[3]._id, // ID da quarta campanha
                alimento_id: aliment[11]._id,
                quantidade: 200,
            },
            {
                campanha_id: campanhasa[4]._id, // ID da quinta campanha
                alimento_id: aliment[3]._id,
                quantidade: 150,
            },
            {
                campanha_id: campanhasa[4]._id, // ID da quinta campanha
                alimento_id: aliment[4]._id,
                quantidade: 80,
            },
            {
                campanha_id: campanhasa[4]._id, // ID da quinta campanha
                alimento_id: aliment[5]._id,
                quantidade: 120,
            },
            {
                campanha_id: campanhasa[5]._id, // ID da quinta campanha
                alimento_id: aliment[2]._id,
                quantidade: 150,
            },
            {
                campanha_id: campanhasa[4]._id, // ID da quinta campanha
                alimento_id: aliment[4]._id,
                quantidade: 150,
            },
        ];
        
        for (const ac of alimentos_campanha) {
            await db.collection('alimento_campanha').insertOne(ac);
          }

        console.log("Alimentos da campanha inseridas com sucesso!");
        

        const alimento_doacao = [
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[0]._id, // Alimento ID 1
                campanha_id: campanhasa[0]._id,  // ID da primeira campanha
                qt_alimento_doado: 100,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[1]._id, // Alimento ID 2
                campanha_id: campanhasa[0]._id,  // ID da primeira campanha
                qt_alimento_doado: 50,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[2]._id, // Alimento ID 3
                campanha_id: campanhasa[0]._id,  // ID da primeira campanha
                qt_alimento_doado: 200,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[3]._id, // Alimento ID 4
                campanha_id: campanhasa[1]._id,  // ID da segunda campanha
                qt_alimento_doado: 20,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[4]._id, // Alimento ID 5
                campanha_id: campanhasa[1]._id,  // ID da segunda campanha
                qt_alimento_doado: 200,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[5]._id, // Alimento ID 6
                campanha_id: campanhasa[1]._id,  // ID da segunda campanha
                qt_alimento_doado: 15,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[6]._id, // Alimento ID 7
                campanha_id: campanhasa[2]._id,  // ID da terceira campanha
                qt_alimento_doado: 15,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[7]._id, // Alimento ID 8
                campanha_id: campanhasa[2]._id,  // ID da terceira campanha
                qt_alimento_doado: 15,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[8]._id, // Alimento ID 9
                campanha_id: campanhasa[2]._id,  // ID da terceira campanha
                qt_alimento_doado: 20,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[9]._id, // Alimento ID 10
                campanha_id: campanhasa[3]._id,  // ID da quarta campanha
                qt_alimento_doado: 20,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[10]._id, // Alimento ID 11
                campanha_id: campanhasa[3]._id,  // ID da quarta campanha
                qt_alimento_doado: 200,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[11]._id, // Alimento ID 12
                campanha_id: campanhasa[3]._id,  // ID da quarta campanha
                qt_alimento_doado: 20,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[4]._id, // Alimento ID 5 (ajustado)
                campanha_id: campanhasa[4]._id,  // ID da quinta campanha
                qt_alimento_doado: 60,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[5]._id, // Alimento ID 6 (ajustado)
                campanha_id: campanhasa[4]._id,  // ID da quinta campanha
                qt_alimento_doado: 20,
            },
            {
                usuario_id: usuaria[3]._id, // ID do usuário (4 - ajustado para o índice 3)
                alimento_id: aliment[6]._id, // Alimento ID 7 (ajustado)
                campanha_id: campanhasa[4]._id,  // ID da quinta campanha
                qt_alimento_doado: 20,
            },
        ];
        
        // Passo 2: Inserir as doações de alimento no banco de dados
        for (const doacaoAlimento of alimento_doacao) {
            await db.collection('alimento_doacao').insertOne(doacaoAlimento);
        }
        console.log("Alimentos doados adicionados com sucesso!");

    } catch (error) {
        console.error('Erro ao conectar ou inserir dados:', error);
    } finally {
        await client.close();
    }
}

popularBanco();
