import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import express, { Request, Response } from 'express';
const { ObjectId } = require('mongodb');
import { fetchEstadosCidades } from './config/IbgeApi';
const bcrypt = require('bcrypt');
const app = express();

import { MongoClient, Db } from 'mongodb';
import { campanha } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL!;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}
const client = new MongoClient(databaseUrl);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to database');
        return client.db('nacao-nutrida'); // Nome do seu banco de dados
    } catch (err) {
        console.error('Failed to connect to the database:', err);
        throw err;
    }
}

let db: Db;

(async () => {
    db = await connectToDatabase();
})();

interface IAlimentoInsert {
    _id: string;
    qt_alimento_meta: number;
}

interface IAlimentoDoacao {
    _id: string;
    qt_alimento_doacao: number;
}

interface IUsuarioInsert {
    _id: string,
    nm_usuario: String,
    ch_documento_usuario: String,
    dt_nascimento_usuario: String,
    nr_celular_usuario: String,
    sg_estado_usuario: String,
    nm_cidade_usuario: String,
    cd_senha_usuario: String,
    cd_email_usuario: String,
}

const salt = bcrypt.genSaltSync(12);

// Função para buscar todos os usuários
const usuarios = async () => {
    const query = await db.collection('usuario').find({}).toArray(); 
    return query;
}

// Função para retornar campanhas
const campanhas = async (id: string | null = null) => {
  const now = new Date();

  if (id) {
    const campanhas = await db.collection('campanha').aggregate([
      // Etapa 1: Filtrar campanhas não deletadas e ainda ativas, além de verificar o ID da campanha
      {
        $match: {
          dt_encerramento_campanha: { $gt: new Date() },
          _id: new ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'usuario',
          localField: 'usuario_id',
          foreignField: '_id',
          as: 'usuario'
        }
      },
      { $unwind: { path: "$usuario", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          "usuario.fg_usuario_deletado": 0
        }
      },
      {
        $lookup: {
          from: 'alimento_campanha',
          localField: '_id',
          foreignField: 'campanha_id',
          as: 'alimentosCampanha'
        }
      },
      { $unwind: { path: "$alimentosCampanha", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'alimento_doacao',
          let: { campanhaId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$campanha_id", "$$campanhaId"] }
              }
            },
            {
              $group: {
                _id: { campanha_id: "$campanha_id", alimento_id: "$alimento_id" },
                qt_alimento_doado: { $sum: "$qt_alimento_doado" }
              }
            }
          ],
          as: 'doacoesAgregadas'
        }
      },
      { $unwind: { path: "$doacoesAgregadas", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'alimento',
          localField: 'alimentosCampanha.alimento_id',
          foreignField: '_id',
          as: 'detalhesAlimentos'
        }
      },
      { $unwind: { path: "$detalhesAlimentos", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          minutos_restantes: {
            $dateDiff: {
              startDate: new Date(),
              endDate: { $toDate: "$dt_encerramento_campanha" },
              unit: "minute"
            }
          },
          horas_restantes: {
            $dateDiff: {
              startDate: new Date(),
              endDate: { $toDate: "$dt_encerramento_campanha" },
              unit: "hour"
            }
          },
          dias_restantes: {
            $dateDiff: {
              startDate: new Date(),
              endDate: { $toDate: "$dt_encerramento_campanha" },
              unit: "day"
            }
          },
          meses_restantes: {
            $dateDiff: {
              startDate: new Date(),
              endDate: { $toDate: "$dt_encerramento_campanha" },
              unit: "month"
            }
          },
          anos_restantes: {
            $dateDiff: {
              startDate: new Date(),
              endDate: { $toDate: "$dt_encerramento_campanha" },
              unit: "year"
            }
          }
        }
      },
      {
        $group: {
          _id: "$_id",
          usuario_id: { $first: "$usuario_id" },
          nm_titulo_campanha: { $first: "$nm_titulo_campanha" },
          dt_encerramento_campanha: { $first: "$dt_encerramento_campanha" },
          minutos_restantes: { $first: "$minutos_restantes" },
          horas_restantes: { $first: "$horas_restantes" },
          dias_restantes: { $first: "$dias_restantes" },
          meses_restantes: { $first: "$meses_restantes" },
          anos_restantes: { $first: "$anos_restantes" },
          nm_cidade_campanha: { $first: "$nm_cidade_campanha" },
          sg_estado_campanha: { $first: "$sg_estado_campanha" },
          qt_total_campanha: { $sum: "$alimentosCampanha.qt_alimento_meta" },
          qt_doacoes_campanha: { $sum: "$doacoesAgregadas.qt_alimento_doado" },
          ds_acao_campanha: { $first: "$ds_acao_campanha" },
          cd_imagem_campanha: { $first: "$cd_imagem_campanha" },
          nm_usuario: { $first: "$usuario.nm_usuario" },
          cd_foto_usuario: { $first: "$usuario.cd_foto_usuario" },
          alimentos: {
            $push: {
              nm_alimento: "$detalhesAlimentos.nm_alimento",
              cd_alimento: "$detalhesAlimentos._id",
              sg_medida_alimento: "$detalhesAlimentos.sg_medida_alimento",
              qt_alimento_meta: "$alimentosCampanha.qt_alimento_meta",  // Incluindo qt_alimento_meta
              qt_alimento_doado: { $ifNull: [{ $sum: "$doacoesAgregadas.qt_alimento_doado" }, 0] }
            }
          }
        }
      }
    ]).toArray();

    if (campanhas.length === 0) {
      throw new Error('Campanha não encontrada');
    }

    return campanhas[0]; // Retorna a primeira campanha encontrada


  } else {
    const campanhas = await db.collection('campanha').aggregate([
      // Etapa 1: Filtrar campanhas ainda ativas
      {
        $match: {
          dt_encerramento_campanha: { $gt: new Date() } // Data de encerramento maior que a atual
        }
      },
      
      // Etapa 2: Realizar o lookup para unir com a coleção de usuários
      {
        $lookup: {
          from: 'usuario',
          localField: 'usuario_id',
          foreignField: '_id',
          as: 'usuario'
        }
      },
      
      // Etapa 3: Desestruturar o array de usuários (já que é um left join)
      { $unwind: { path: "$usuario", preserveNullAndEmptyArrays: true } },
      
      // Etapa 4: Filtrar usuários que não foram deletados
      // {
      //   $match: {
      //     "usuario.fg_usuario_deletado": 0
      //   }
      // },
    
      // Etapa 5: Lookup para unir com alimento_campanha
      {
        $lookup: {
          from: 'alimento_campanha',
          localField: '_id',
          foreignField: 'campanha_id',
          as: 'alimentosCampanha'
        }
      },

      { $unwind: { path: "$alimentosCampanha", preserveNullAndEmptyArrays: true } },
    
      // Etapa 6: Lookup para unir com alimento_doacao
      {
        $lookup: {
          from: 'alimento_doacao',
          localField: '_id',
          foreignField: 'campanha_id',
          as: 'doacoes'
        }
      },
    
      // Etapa 7: Lookup para unir com alimento (detalhes dos alimentos)
      {
        $lookup: {
          from: 'alimento',
          localField: 'alimentosCampanha.alimento_id',
          foreignField: '_id',
          as: 'detalhesAlimentos'
        }
      },
    
      { $unwind: { path: "$doacoes", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$detalhesAlimentos", preserveNullAndEmptyArrays: true } },



      // Etapa 8: Calcular os campos de tempo restantes
      {
        $addFields: {
          minutos_restantes: {
            $dateDiff: {
              startDate: new Date(),
              endDate: { $toDate: "$dt_encerramento_campanha" },
              unit: "minute"
            }
          },
          horas_restantes: {
            $dateDiff: {
              startDate: new Date(),
              endDate: { $toDate: "$dt_encerramento_campanha" },
              unit: "hour"
            }
          },
          dias_restantes: {
            $dateDiff: {
              startDate: new Date(),
              endDate: { $toDate: "$dt_encerramento_campanha" },
              unit: "day"
            }
          },
          meses_restantes: {
            $dateDiff: {
              startDate: new Date(),
              endDate: { $toDate: "$dt_encerramento_campanha" },
              unit: "month"
            }
          },
          anos_restantes: {
            $dateDiff: {
              startDate: new Date(),
              endDate: { $toDate: "$dt_encerramento_campanha" },
              unit: "year"
            }
          }
        }
      },
    
      // Etapa 9: Agrupar por campanha e somar as quantidades de alimentos
      {
        $group: {
          _id: "$_id",
          usuario_id: { $first: "$usuario_id" },
          nm_titulo_campanha: { $first: "$nm_titulo_campanha" },
          dt_encerramento_campanha: { $first: "$dt_encerramento_campanha" },
          minutos_restantes: { $first: "$minutos_restantes" },
          horas_restantes: { $first: "$horas_restantes" },
          dias_restantes: { $first: "$dias_restantes" },
          meses_restantes: { $first: "$meses_restantes" },
          anos_restantes: { $first: "$anos_restantes" },
          nm_cidade_campanha: { $first: "$nm_cidade_campanha" },
          sg_estado_campanha: { $first: "$sg_estado_campanha" },
          qt_total_campanha: { $sum: "$alimentosCampanha.qt_alimento_meta" },
          qt_doacoes_campanha: { $sum: "$doacoes.qt_alimento_doado" },
          ds_acao_campanha: { $first: "$ds_acao_campanha" },
          cd_imagem_campanha: { $first: "$cd_imagem_campanha" },
          nm_usuario: { $first: "$usuario.nm_usuario" },
          cd_foto_usuario: { $first: "$usuario.cd_foto_usuario" },
          alimentos: {
            $push: {
              nm_alimento: "$detalhesAlimentos.nm_alimento",
              sg_medida_alimento: "$detalhesAlimentos.sg_medida_alimento",
              qt_alimento_meta: "$alimentosCampanha.qt_alimento_meta",  // Incluindo qt_alimento_meta
              qt_alimento_doado: { $ifNull: [{ $sum: "$doacoes.qt_alimento_doado" }, 0] }
            }
          }
        }
      },
    
      // Etapa 10: Ordenar por data de criação da campanha
      {
        $sort: {
          dt_encerramento_campanha: -1
        }
      }
    ]).toArray();

    return campanhas;
  }
};

// Função para buscar todos os alimentos doados
const alimentosDoados = async () => {
    const query = await db.collection('alimento_doacao').find().toArray();
    return query;
};

// Função para buscar todos os alimentos agrupados por tipo
const alimentos = async () => {
  const query = await db.collection('alimento').aggregate([
    {
      $group: {
        _id: { cd_tipo_alimento: "$cd_tipo_alimento", nm_tipo_alimento: "$nm_tipo_alimento" }, // Agrupa pelo tipo de alimento
        alimentos: {
          $push: {
            nm_alimento: "$nm_alimento",
            sg_medida_alimento: "$sg_medida_alimento",
            _id: "$_id",
          },
        },
      },
    },
    { $sort: { "_id.cd_tipo_alimento": 1 } }, // Ordena pelo tipo de alimento
  ]).toArray();

  // Reestrutura os dados para retirar o campo _id e deixar o resultado mais próximo ao SQL
  const result = query.map(item => ({
    cd_tipo_alimento: item._id.cd_tipo_alimento,
    nm_tipo_alimento: item._id.nm_tipo_alimento,
    alimentos: item.alimentos,
  }));

  return result;
};


// Função para inserir alimentos em campanhas
const insertAlimentosCampanha = async (cdCampanha: string, alimentos: IAlimentoInsert[]) => {
    const alimentosCampanha = alimentos.map(alimento => ({
        alimento_id: alimento._id,
        campanha_id: new ObjectId(cdCampanha),
        qt_alimento_meta: alimento.qt_alimento_meta,
    }));

    const result = await db.collection('alimento_campanha').insertMany(alimentosCampanha);
    return result;
};

const insertAlimentosDoacao = async (cdCampanha: string, cdUsuario: string, alimentos: IAlimentoDoacao[]) => {
    const alimentosDoacao = alimentos.map((alimento) => ({
      usuario_id: cdUsuario,
      alimento_id: alimento._id,
      campanha_id: cdCampanha,
      qt_alimento_doado: alimento.qt_alimento_doacao,
    }));
  
    const result = await db.collection('alimento_doacao').insertMany(alimentosDoacao);
    return result;
  };
  
  const insertUsuario = async (userInfos: any) => {
    const campoDocumento = userInfos.tipo_usuario === 'pf' ? 'ch_cpf_usuario' : 'ch_cnpj_usuario';
  
    const usuario = {
      nm_usuario: userInfos.nm_usuario,
      [campoDocumento]: userInfos.ch_documento_usuario,
      dt_nascimento_usuario: userInfos.dt_nascimento_usuario,
      nr_celular_usuario: userInfos.nr_celular_usuario,
      sg_estado_usuario: userInfos.sg_estado_usuario,
      nm_cidade_usuario: userInfos.nm_cidade_usuario,
      cd_senha_usuario: userInfos.cd_senha_usuario,
      cd_email_usuario: userInfos.cd_email_usuario,
    };
  
    const result = await db.collection('usuario').insertOne(usuario);
    return result;
  };
  
  const validateLogin = async (user_email: string, user_password?: string) => {
    const query: any = { cd_email_usuario: user_email };  // Buscar pelo e-mail

    if (user_password) {
        query.cd_senha_usuario = user_password;  // Se a senha for fornecida, adicionar à query
    }

    try {
        const user = await db.collection('usuario').findOne(query);
        return user;  // Retorna o usuário encontrado, ou null se não encontrado
    } catch (error) {
        console.error('Erro ao validar login:', error);
        throw error;  // Lança o erro para ser tratado em outro lugar
    }
};
  
  // Express routes
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  app.get('/api/campanhas/:id?', async (req: Request, res: Response) => {
    const id = req.params.id || null;
    const campanhasResponse = await campanhas(id);
    res.json(campanhasResponse);
  });
  
  app.get('/api/alimentos', async (req: Request, res: Response) => {
    const alimentosResponse = await alimentos();
    res.json(alimentosResponse);
  });
  
  app.get('/api/alimentosDoados', async (req: Request, res: Response) => {
    const alimentosResponse = await alimentos();
    res.json(alimentosResponse);
  });
  
  app.get('/api/usuarios', async (req: Request, res: Response) => {
    const usuariosResponse = await usuarios();
    res.json(usuariosResponse);
  });
  
  app.get('/api/estadosCidades', async (req: Request, res: Response) => {
    const estadosCidades = await fetchEstadosCidades();
    res.json(estadosCidades);
  });
  
  app.post('/api/campanhas', async (req: Request, res: Response) => {
    const { infos_campanha, alimentos_campanha } = req.body;
    const campanhaData = {
      usuario_id: new ObjectId(infos_campanha.usuario_id),
      nm_titulo_campanha: infos_campanha.nm_titulo_campanha,
      dt_encerramento_campanha: new Date(infos_campanha.dt_encerramento_campanha),
      nm_cidade_campanha: infos_campanha.nm_cidade_campanha,
      sg_estado_campanha: infos_campanha.sg_estado_campanha,
      ds_acao_campanha: infos_campanha.ds_acao_campanha,
      cd_imagem_campanha: infos_campanha.cd_imagem_campanha,
    };
  
    try {
      const campanhaInserida = await db.collection('campanha').insertOne(campanhaData);
      const campanhaId = campanhaInserida.insertedId;
      let alimentosToInsert;
      let alimentosResponse;
      let inserted;
  
      // Verifica se alimentos_campanha é um array, caso contrário, transforma em array
      const alimentosArray = Array.isArray(alimentos_campanha) ? alimentos_campanha : [alimentos_campanha];
  
      // Se só tem um alimento, cadastra com insertOne, se tem mais de um, cadastra com insertMany
      if (alimentosArray.length === 1) {
        const alimento = alimentosArray[0];
        alimentosToInsert = {
          alimento_id: new ObjectId(alimento._id),
          campanha_id: campanhaId,
          qt_alimento_meta: alimento.qt_alimento_meta,
        };
        alimentosResponse = await db.collection('alimento_campanha').insertOne(alimentosToInsert);
        inserted = 1;
      } else {
        alimentosToInsert = alimentosArray.map((alimento: { _id: any; qt_alimento_meta: any }) => ({
          alimento_id: new ObjectId(alimento._id),
          campanha_id: campanhaId,
          qt_alimento_meta: alimento.qt_alimento_meta,
        }));
        alimentosResponse = await db.collection('alimento_campanha').insertMany(alimentosToInsert);
        inserted = alimentosResponse.insertedCount;
      }
  
      res.json({ campanhaId, alimentosInserted: inserted });
    } catch (error) {
      console.error('Error while inserting campanha:', error);
      res.status(500).json({ message: 'Error while inserting campanha' });
    }
  });
  
  
  app.post('/api/doacoes', async (req: Request, res: Response) => {
    const { infos_doacao, alimentos_doacao } = req.body;
    const { cd_usuario_doacao, cd_campanha_doacao } = infos_doacao;
  
    try {
      const alimentosToInsert = alimentos_doacao.map((alimento: { _id: any; qt_alimento_doado: any }) => ({
        usuario_id: cd_usuario_doacao,
        alimento_id: alimento._id,
        campanha_id: cd_campanha_doacao,
        qt_alimento_doado: alimento.qt_alimento_doado,
      }));
  
      const response = await db.collection('alimento_doacao').insertMany(alimentosToInsert);
      res.json({ insertedCount: response.insertedCount });
    } catch (error) {
      console.error('Error while processing doacoes:', error);
      res.status(500).json({ message: 'Error while processing doacoes' });
    }
  });
  
  app.post('/api/usuarioCadastro', async (req: Request, res: Response) => {
    const userInfos = req.body.user_infos;
  
    try {
      const hashedPassword = await bcrypt.hash(userInfos.cd_senha_usuario, salt);
      userInfos.cd_senha_usuario = hashedPassword;
      console.log("user: ", userInfos);
      const userResponse = await db.collection('usuario').insertOne(userInfos);
      
      // Como não existe mais o 'ops', utilize o insertedId
      res.json({ _id: userResponse.insertedId, ...userInfos });
    } catch (err) {
      console.error('Error while registering user:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  app.post('/api/usuarioLogin', async (req: Request, res: Response) => {
    const { user_email, user_password } = req.body;
  
    try {
      const userResponse = await db.collection('usuario').findOne({ cd_email_usuario: user_email });
  
      if (!userResponse) {
        return res.status(400).json({
          user: null,
          authenticated: false,
          message: 'Email ou senha inválidos',
        });
      }
  
      const hashPasswordDB = userResponse.cd_senha_usuario;
  
      if (user_password && hashPasswordDB) {
        const compare = await bcrypt.compare(user_password, hashPasswordDB);
  
        if (compare) {
          return res.status(200).json({
            user: userResponse,
            authenticated: true,
            message: 'Usuário autenticado',
          });
        } else {
          return res.status(400).json({
            user: null,
            authenticated: false,
            message: 'Email ou senha inválidos',
          });
        }
      } else {
        return res.status(400).json({
          user: null,
          authenticated: false,
          message: 'Erro ao resgatar dados',
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  app.listen(5000, () => {
    console.log('Server started on port 5000');
  });
  
  export {};
  