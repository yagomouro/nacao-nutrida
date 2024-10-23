import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import express, { Request, Response } from 'express';
import { fetchEstadosCidades } from './config/IbgeApi';
const bcrypt = require('bcrypt');
const app = express();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

interface IAlimentoInsert {
    _id: string;
    qt_alimento_meta: number;
}

interface IAlimentoDoacao {
    _id: string;
    qt_alimento_doacao: number;
}

const salt = bcrypt.genSaltSync(12);

// Função para buscar todos os usuários
const usuarios = async () => {
  const query = await prisma.usuario.findMany(); 
  return query;
}

// Função para retornar campanhas
const campanhas = async (id: string | null = null) => {
  const now = new Date();

  if (id) {
    const campanhas = await prisma.campanha.findMany({
      where: {
        dt_encerramento_campanha: {
          gt: new Date(), // Filtra campanhas ativas
        },
        id: id, // Verifica o ID da campanha
      },
      include: {
        usuario: {
          where: {
            fg_usuario_deletado: 0, // Filtra usuários não deletados
          },
          select: {
            nm_usuario: true,
            cd_foto_usuario: true,
          },
        },
        alimentosCampanha: {
          include: {
            alimento: {
              select: {
                nm_alimento: true,
                sg_medida_alimento: true,
                id: true,
              },
            },
            doacoes: {
              select: {
                alimento_id: true,
                campanha_id: true,
                qt_alimento_doado: true,
              },
            },
          },
        },
      },
    });
    
    const campanhasAgregadas = campanhas.map((campanha: any) => {
      const now = new Date();
      const dtEncerramento = campanha.dt_encerramento_campanha;
    
      const minutosRestantes = Math.floor((dtEncerramento.getTime() - now.getTime()) / (1000 * 60));
      const horasRestantes = Math.floor((dtEncerramento.getTime() - now.getTime()) / (1000 * 60 * 60));
      const diasRestantes = Math.floor((dtEncerramento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const mesesRestantes = Math.floor((dtEncerramento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const anosRestantes = Math.floor((dtEncerramento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365));
    
      const qt_total_campanha = campanha.alimentosCampanha.reduce(
        (total: any, alimento: any) => total + alimento.qt_alimento_meta,
        0
      );
    
      const qt_doacoes_campanha = campanha.alimentosCampanha.reduce(
        (total: any, alimento: any) =>
          total + (alimento.doacoes.length > 0 ? alimento.doacoes[0].qt_alimento_doado : 0),
        0
      );
    
      return {
        ...campanha,
        minutos_restantes: minutosRestantes,
        horas_restantes: horasRestantes,
        dias_restantes: diasRestantes,
        meses_restantes: mesesRestantes,
        anos_restantes: anosRestantes,
        qt_total_campanha: qt_total_campanha,
        qt_doacoes_campanha: qt_doacoes_campanha,
        alimentos: campanha.alimentosCampanha.map((alimento: any) => ({
          nm_alimento: alimento.alimento.nm_alimento,
          alimento_id: alimento.alimento.id,
          sg_medida_alimento: alimento.alimento.sg_medida_alimento,
          qt_alimento_meta: alimento.qt_alimento_meta,
          qt_alimento_doado: alimento.doacoes.length > 0 ? alimento.doacoes[0].qt_alimento_doado : 0,
        })),
      };
    });
    
    if (campanhasAgregadas.length === 0) {
      throw new Error('Campanha não encontrada');
    }
    
    return campanhasAgregadas[0];
    


  } else {
    const campanhas = await prisma.campanha.findMany({
      where: {
        dt_encerramento_campanha: {
          gt: new Date(), // Filtra campanhas ativas
        },
      },
      orderBy: {
        dt_encerramento_campanha: 'desc', // Ordena pela data de encerramento
      },
    });
    
    // Adiciona campos calculados manualmente
    const campanhasComCamposCalculados = await Promise.all(campanhas.map(async (campanha) => {
      const now = new Date();
      const dtEncerramento = new Date(campanha.dt_encerramento_campanha);
    
      // Calcula o tempo restante em diferentes unidades
      const minutos_restantes = Math.floor((dtEncerramento.getTime() - now.getTime()) / (1000 * 60));
      const horas_restantes = Math.floor((dtEncerramento.getTime() - now.getTime()) / (1000 * 60 * 60));
      const dias_restantes = Math.floor((dtEncerramento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const meses_restantes = (dtEncerramento.getFullYear() - now.getFullYear()) * 12 + (dtEncerramento.getMonth() - now.getMonth());
      const anos_restantes = dtEncerramento.getFullYear() - now.getFullYear();
    
      // Busca as doações relacionadas a esta campanha
      const doacoes = await prisma.alimento_doacao.findMany({
        where: { campanha_id: campanha.id },
      });
    
      // Busca os alimentos relacionados a esta campanha
      const alimentosCampanha = await prisma.alimento_campanha.findMany({
        where: { campanha_id: campanha.id },
      });
    
      // Busca detalhes dos alimentos em uma consulta separada
      const alimentosIds = alimentosCampanha.map(alimento => alimento.alimento_id); // Supondo que alimento_id exista em alimento_campanha
      const detalhesAlimentos = await prisma.alimento.findMany({
        where: { id: { in: alimentosIds } },
      });
    
      // Mapeia os detalhes dos alimentos
      const alimentosComDetalhes = alimentosCampanha.map((alimentoCampanha:any) => {
        const detalheAlimento = detalhesAlimentos.find(alimento => alimento.id === alimentoCampanha.alimento_id);
        
        return {
          nm_alimento: detalheAlimento.nm_alimento,
          alimento_id: detalheAlimento.id,
          sg_medida_alimento: detalheAlimento.sg_medida_alimento,
          qt_alimento_meta: alimentoCampanha.qt_alimento_meta,
          qt_alimento_doado: doacoes
            .filter(doacao => doacao.campanha_id === campanha.id)
            .reduce((sum:any, doacao:any) => sum + doacao.qt_alimento_doado, 0), // Soma as doações relacionadas
        };
      });
    
      return {
        ...campanha,
        minutos_restantes,
        horas_restantes,
        dias_restantes,
        meses_restantes,
        anos_restantes,
        // Calcula o total de alimentos e doações
        qt_total_campanha: alimentosCampanha.reduce((sum:any, alimento:any) => sum + alimento.qt_alimento_meta, 0),
        qt_doacoes_campanha: doacoes.reduce((sum:any, doacao:any) => sum + doacao.qt_alimento_doado, 0),
        alimentos: alimentosComDetalhes,
      };
    }));
    
    return campanhasComCamposCalculados;
    
    
    
  }
};

// Função para buscar todos os alimentos doados
const alimentosDoados = async () => {
    const query = await prisma.alimento_doacao.findMany();
    return query;
};

// Função para buscar todos os alimentos agrupados por tipo
const alimentos = async () => {
  const query = await prisma.alimento.findMany({
    select: {
      cd_tipo_alimento: true,
      nm_tipo_alimento: true,
      nm_alimento: true,
      sg_medida_alimento: true,
      id: true,
    },
    orderBy: {
      cd_tipo_alimento: 'asc', // Ordena pelo tipo de alimento
    },
  });
  
  // Agrupa os alimentos pelo tipo
  const groupedResult = query.reduce((acc: any, item: any) => {
    const tipoAlimentoKey = item.cd_tipo_alimento;
    const tipoAlimentoNome = item.nm_tipo_alimento;
  
    if (!acc[tipoAlimentoKey]) {
      acc[tipoAlimentoKey] = {
        cd_tipo_alimento: tipoAlimentoKey,
        nm_tipo_alimento: tipoAlimentoNome,
        alimentos: [],
      };
    }
  
    acc[tipoAlimentoKey].alimentos.push({
      nm_alimento: item.nm_alimento,
      sg_medida_alimento: item.sg_medida_alimento,
      id: item.id,
    });
  
    return acc;
  }, {});
  
  // Converte o resultado em um array
  const result = Object.values(groupedResult);
  
  return result;  
};


// Função para inserir alimentos em campanhas
const insertAlimentosCampanha = async (cdCampanha: string, alimentos: IAlimentoInsert[]) => {
    const alimentosCampanha = alimentos.map(alimento => ({
        alimento_id: alimento._id,
        campanha_id: cdCampanha,
        qt_alimento_meta: alimento.qt_alimento_meta,
    }));

    const result = await prisma.alimento_campanha.create({
      data: alimentosCampanha
    });
    return result;
};

const insertAlimentosDoacao = async (cdCampanha: string, cdUsuario: string, alimentos: IAlimentoDoacao[]) => {
    const alimentosDoacao = alimentos.map((alimento) => ({
      usuario_id: cdUsuario,
      alimento_id: alimento._id,
      campanha_id: cdCampanha,
      qt_alimento_doado: alimento.qt_alimento_doacao,
    }));
  
    const result = await prisma.alimento_doacao.create({
      data: alimentosDoacao
    });
    return result;
  };
  
  const insertUsuario = async (userInfos: any) => {
    let usuario = {}
    if(userInfos.tipo_usuario === "pf"){
      usuario = {
        nm_usuario: userInfos.nm_usuario,
        ch_cpf_usuario: userInfos.ch_documento_usuario,
        dt_nascimento_usuario: new Date(userInfos.dt_nascimento_usuario).toISOString(),
        nr_celular_usuario: userInfos.nr_celular_usuario,
        sg_estado_usuario: userInfos.sg_estado_usuario,
        nm_cidade_usuario: userInfos.nm_cidade_usuario,
        cd_senha_usuario: userInfos.cd_senha_usuario,
        cd_email_usuario: userInfos.cd_email_usuario,
      };
    } else {
      usuario = {
        nm_usuario: userInfos.nm_usuario,
        ch_cnpj_usuario: userInfos.ch_documento_usuario,
        dt_nascimento_usuario: new Date(userInfos.dt_nascimento_usuario).toISOString(),
        nr_celular_usuario: userInfos.nr_celular_usuario,
        sg_estado_usuario: userInfos.sg_estado_usuario,
        nm_cidade_usuario: userInfos.nm_cidade_usuario,
        cd_senha_usuario: userInfos.cd_senha_usuario,
        cd_email_usuario: userInfos.cd_email_usuario,
      };
    }
  
    const result = await prisma.usuario.create({
      data: usuario,
    });
    return result;
  };
  
  const validateLogin = async (user_email: string, user_password?: string) => {
    const query: any = { cd_email_usuario: user_email };  // Buscar pelo e-mail

    if (user_password) {
        query.cd_senha_usuario = user_password;  // Se a senha for fornecida, adicionar à query
    }

    try {
      const user = await prisma.usuario.findFirst({
        where: {
          cd_email_usuario: user_email, // ou qualquer outra chave única
        },
      });
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
      usuario_id: infos_campanha.usuario_id,
      nm_titulo_campanha: infos_campanha.nm_titulo_campanha,
      dt_encerramento_campanha: new Date(infos_campanha.dt_encerramento_campanha),
      nm_cidade_campanha: infos_campanha.nm_cidade_campanha,
      sg_estado_campanha: infos_campanha.sg_estado_campanha,
      ds_acao_campanha: infos_campanha.ds_acao_campanha,
      cd_imagem_campanha: infos_campanha.cd_imagem_campanha,
    };
  
    try {
      const campanhaInserida = await prisma.campanha.create({
        data: campanhaData
      });
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
          alimento_id: alimento._id,
          campanha_id: campanhaId,
          qt_alimento_meta: alimento.qt_alimento_meta,
        };
        alimentosResponse = await prisma.alimento_campanha.create({
          data: alimentosToInsert
        });
        inserted = 1;
      } else {
        alimentosToInsert = alimentosArray.map((alimento: { _id: any; qt_alimento_meta: any }) => ({
          alimento_id: alimento._id,
          campanha_id: campanhaId,
          qt_alimento_meta: alimento.qt_alimento_meta,
        }));
        alimentosResponse = await prisma.alimento_campanha.create({
          data: alimentosToInsert
        });
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
      const alimentosToInsert = alimentos_doacao.map((alimento: any) => ({
        usuario_id: infos_doacao.usuario_id,
        alimento_id: alimento.alimento_id,
        campanha_id: cd_campanha_doacao,
        qt_alimento_doado: alimento.qt_alimento_doacao,
      }));
  
      const response = await prisma.alimento_doacao.create({
        data: alimentosToInsert
      });

      for (const alimento of alimentos_doacao) {
        if (!alimento || !alimento.alimento_id) {
          console.error(`Alimento inválido: ${JSON.stringify(alimento)}`);
          continue; // Ignora alimentos inválidos
        }
      
        if (typeof alimento.qt_alimento_doacao !== 'number' || isNaN(alimento.qt_alimento_doacao)) {
          console.error(`Quantidade inválida de alimento ${alimento._id}: ${alimento.qt_alimento_doado}`);
          continue; // Ignora doações com quantidade inválida
        }
      
        try {
          await prisma.campanha.updateOne(
            { _id: cd_campanha_doacao, "alimentos.alimento_id": alimento.alimento_id },
            {
              $inc: {
                "alimentos.$.qt_alimento_doado": alimento.qt_alimento_doacao,
                qt_doacoes_campanha: alimento.qt_alimento_doacao
              }
            }
          );
        } catch (error) {
          console.error(`Erro ao atualizar a campanha para o alimento ${alimento._id}:`, error);
        }
      }

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
      const userResponse = await prisma.usuario.create({
        data: userInfos
      });
      
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
      const userResponse = await prisma.usuario.findFirst({ 
        where: {
          cd_email_usuario: user_email 
    },
  });
  
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
  