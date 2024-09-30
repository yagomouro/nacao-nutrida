import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { fetchEstadosCidades } from './config/IbgeApi';
const bcrypt = require('bcrypt');
const app = express();

import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const databaseUrl = process.env.DATABASE_URL!;

const url = databaseUrl;
const client = new MongoClient(url);

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
    cd_alimento: number;
    qt_alimento_meta: number;
}

interface IAlimentoDoacao {
    cd_alimento: number;
    qt_alimento_doacao: number;
}

interface IUsuarioInsert {
    cd_usuario: Number,
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
    const query = await db.collection('usuario').find({}).toArray(); // Uso correto do find() e toArray()
    return query;
}

// Tipagem da campanha com as propriedades corretas
type Campanha = {
  _id: string;
  usuario_id: string;
  nm_titulo_campanha: string;
  dt_encerramento_campanha: Date;
  ts_criacao_campanha: Date;
  nm_cidade_campanha: string;
  sg_estado_campanha: string;
  ds_acao_campanha: string;
  cd_imagem_campanha: string;
  fg_campanha_ativa: boolean;
};

// Função para retornar campanhas
const campanhas = async (id: string | null = null) => {
  if (id) {
    const objectId = new ObjectId(id); // Converte o ID para ObjectId
    const campanha = await db.collection('campanha').findOne<Campanha>({ _id: objectId }); // Usa findOne() com tipagem

    if (!campanha) {
      throw new Error('Campanha não encontrada');
    }

    const now = new Date();
    const encerramento = new Date(campanha.dt_encerramento_campanha);
    const diffMs = encerramento.getTime() - now.getTime();
    const minutos_restantes = Math.floor(diffMs / 60000);
    const horas_restantes = Math.floor(diffMs / 3600000);
    const dias_restantes = Math.floor(diffMs / 86400000);
    const meses_restantes = Math.floor(diffMs / 2592000000); // Aproximadamente 30 dias
    const anos_restantes = Math.floor(diffMs / 31536000000); // Aproximadamente 365 dias

    return {
      ...campanha,
      minutos_restantes,
      horas_restantes,
      dias_restantes,
      meses_restantes,
      anos_restantes,
    };
  } else {
    const campanhas = await db.collection('campanha').find<Campanha>({
      fg_campanha_ativa: true,
      dt_encerramento_campanha: { $gt: new Date() },
    }).toArray();

    return campanhas.map((campanha) => {
      const now = new Date();
      const encerramento = new Date(campanha.dt_encerramento_campanha);
      const diffMs = encerramento.getTime() - now.getTime();
      const minutos_restantes = Math.floor(diffMs / 60000);
      const horas_restantes = Math.floor(diffMs / 3600000);
      const dias_restantes = Math.floor(diffMs / 86400000);
      const meses_restantes = Math.floor(diffMs / 2592000000);
      const anos_restantes = Math.floor(diffMs / 31536000000);

      return {
        ...campanha,
        minutos_restantes,
        horas_restantes,
        dias_restantes,
        meses_restantes,
        anos_restantes,
      };
    });
  }
}


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
                _id: { cd_tipo_alimento: "$cd_tipo_alimento", nm_tipo_alimento: "$nm_tipo_alimento" },
                alimentos: {
                    $push: {
                        nm_alimento: "$nm_alimento",
                        sg_medida_alimento: "$sg_medida_alimento",
                        cd_alimento: "$cd_alimento",
                    },
                },
            },
        },
        { $sort: { "_id.cd_tipo_alimento": 1 } },
    ]).toArray();
  
    return query;
}

// Função para inserir alimentos em campanhas
const insertAlimentosCampanha = async (cdCampanha: any, alimentos: { cd_alimento: any; qt_alimento_meta: any; }[]) => {
    const alimentosCampanha = alimentos.map(alimento => ({
        cd_alimento: alimento.cd_alimento,
        cd_campanha: cdCampanha,
        qt_alimento_meta: alimento.qt_alimento_meta,
    }));

    const result = await db.collection('alimento_campanha').insertMany(alimentosCampanha);
    return result;
};

const insertAlimentosDoacao = async (cdCampanha: string, cdUsuario: string, alimentos: { cd_alimento: string; qt_alimento_doacao: number }[]) => {
    const alimentosDoacao = alimentos.map((alimento) => ({
      cd_usuario: cdUsuario,
      cd_alimento: alimento.cd_alimento,
      cd_campanha: cdCampanha,
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
  
  const validateLogin = (userEmail: string, userPassword?: string) => {
    let query = '';
  
    if (userPassword) {
      query = `SELECT * FROM usuario WHERE cd_email_usuario = '${userEmail}' AND cd_senha_usuario = '${userPassword}'`;
    } else {
      query = `SELECT * FROM usuario WHERE cd_email_usuario = '${userEmail}'`;
    }
  
    return query;
  };
  
  // Express routes
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  app.get('/api/campanhas', async (req: Request, res: Response) => {
    const id = <string>req.query.id;
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
      cd_usuario_campanha: infos_campanha.cd_usuario_campanha,
      nm_titulo_campanha: infos_campanha.nm_titulo_campanha,
      dt_encerramento_campanha: infos_campanha.dt_encerramento_campanha,
      nm_cidade_campanha: infos_campanha.nm_cidade_campanha,
      sg_estado_campanha: infos_campanha.sg_estado_campanha,
      ds_acao_campanha: infos_campanha.ds_acao_campanha,
      cd_imagem_campanha: infos_campanha.cd_imagem_campanha,
    };
  
    try {
      const campanhaInserida = await db.collection('campanha').insertOne(campanhaData);
      const campanhaId = campanhaInserida.insertedId;
  
      const alimentosToInsert = alimentos_campanha.map((alimento: { cd_alimento: any; qt_alimento_meta: any }) => ({
        cd_alimento: alimento.cd_alimento,
        cd_campanha: campanhaId,
        qt_alimento_meta: alimento.qt_alimento_meta,
      }));
  
      const alimentosResponse = await db.collection('alimento_campanha').insertMany(alimentosToInsert);
  
      res.json({ campanhaId, alimentosInserted: alimentosResponse.insertedCount });
    } catch (error) {
      console.error('Error while inserting campanha:', error);
      res.status(500).json({ message: 'Error while inserting campanha' });
    }
  });
  
  app.post('/api/doacoes', async (req: Request, res: Response) => {
    const { infos_doacao, alimentos_doacao } = req.body;
    const { cd_usuario_doacao, cd_campanha_doacao } = infos_doacao;
  
    try {
      const alimentosToInsert = alimentos_doacao.map((alimento: { cd_alimento: any; qt_alimento_doado: any }) => ({
        cd_usuario: cd_usuario_doacao,
        cd_alimento: alimento.cd_alimento,
        cd_campanha: cd_campanha_doacao,
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
  