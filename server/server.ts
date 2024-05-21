import express, { Request, Response } from 'express';
import { fetchEstadosCidades } from './config/IbgeApi'
const bcrypt = require('bcrypt')
const db = require('./database')
const app = express();

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

const usuarios = async () => {
    const [query] = await db.execute(`
        SELECT * FROM usuario;
    `)

    return query
}

const campanhas = async (id: number | null = null) => {
    const sqlQuery = () => {
        if (id) {
            let rawQuery = `
                SELECT 
                    c.cd_campanha,
                    c.cd_usuario_campanha,
                    c.nm_titulo_campanha,
                    c.dt_encerramento_campanha,
                    TIMESTAMPDIFF(MINUTE, NOW(), c.dt_encerramento_campanha) AS minutos_restantes,
                    TIMESTAMPDIFF(HOUR, NOW(), c.dt_encerramento_campanha) AS horas_restantes,
                    TIMESTAMPDIFF(DAY, NOW(), c.dt_encerramento_campanha) AS dias_restantes,
                    TIMESTAMPDIFF(MONTH, NOW(), c.dt_encerramento_campanha) AS meses_restantes,
                    TIMESTAMPDIFF(YEAR, NOW(), c.dt_encerramento_campanha) AS anos_restantes,
                    c.nm_cidade_campanha,
                    c.sg_estado_campanha,
                    SUM(ac.qt_alimento_meta) AS qt_total_campanha,
                    IFNULL(SUM(ad2.qt_alimento_doado), 0) AS qt_doacoes_campanha,
                    c.ds_acao_campanha,
                    c.cd_imagem_campanha,
                    u.nm_usuario,
                    u.cd_foto_usuario,
                    JSON_ARRAYAGG(JSON_OBJECT(
                        'nm_alimento', a.nm_alimento,
                        'cd_alimento', a.cd_alimento,
                        'sg_medida_alimento', a.sg_medida_alimento,
                        'qt_alimento_meta', ac.qt_alimento_meta,
                        'qt_alimento_doado', IFNULL(ad2.qt_alimento_doado, 0)
                    )) AS alimentos
                FROM campanha c
                LEFT JOIN usuario u ON c.cd_usuario_campanha = u.cd_usuario 
                LEFT JOIN alimento_campanha ac ON c.cd_campanha = ac.cd_campanha  
                LEFT JOIN (
                    SELECT 
                        ad.cd_campanha,
                        ad.cd_alimento,
                        SUM(ad.qt_alimento_doado) AS qt_alimento_doado 
                    FROM alimento_doacao ad
                    JOIN campanha cam ON cam.cd_campanha = ad.cd_campanha
                    WHERE ad.cd_campanha = ${id}
                    GROUP BY ad.cd_campanha, ad.cd_alimento
                ) ad2 ON ac.cd_alimento = ad2.cd_alimento AND c.cd_campanha = ad2.cd_campanha
                LEFT JOIN alimento a ON ac.cd_alimento = a.cd_alimento 
                WHERE c.fg_campanha_deletada = 0
                AND u.fg_usuario_deletado = 0
                AND c.dt_encerramento_campanha > NOW()
                and c.cd_campanha = ${id}
                GROUP BY c.cd_campanha;  
            `

            return rawQuery
        } else {
            let rawQuery = `
                SELECT 
                    c.cd_campanha,
                    c.cd_usuario_campanha,
                    c.nm_titulo_campanha,
                    c.dt_encerramento_campanha,
                    TIMESTAMPDIFF(MINUTE, NOW(), c.dt_encerramento_campanha) AS minutos_restantes,
                    TIMESTAMPDIFF(HOUR, NOW(), c.dt_encerramento_campanha) AS horas_restantes,
                    TIMESTAMPDIFF(DAY, NOW(), c.dt_encerramento_campanha) AS dias_restantes,
                    TIMESTAMPDIFF(MONTH, NOW(), c.dt_encerramento_campanha) AS meses_restantes,
                    TIMESTAMPDIFF(YEAR, NOW(), c.dt_encerramento_campanha) AS anos_restantes,
                    c.nm_cidade_campanha,
                    c.sg_estado_campanha,
                    sum(ac.qt_alimento_meta) as qt_total_campanha,
                    sum(ad.qt_alimento_doado) as qt_doacoes_campanha,
                    c.ds_acao_campanha,
                    c.cd_imagem_campanha,
                    u.nm_usuario,
                    u.cd_foto_usuario,
                    JSON_ARRAYAGG(JSON_OBJECT(
                    'nm_alimento', a.nm_alimento,
                    'sg_medida_alimento', a.sg_medida_alimento
                    )) AS alimentos
                FROM campanha c
                    left join usuario u on c.cd_usuario_campanha = u.cd_usuario 
                    left join alimento_campanha ac on c.cd_campanha = ac.cd_campanha  
                    left join alimento_doacao ad ON c.cd_campanha = ad.cd_campanha
                    left join alimento a on ac.cd_alimento = a.cd_alimento 
                where c.fg_campanha_deletada = 0
                    and u.fg_usuario_deletado = 0
                    and c.dt_encerramento_campanha > now()
                group by c.cd_campanha   
                order by c.ts_criacao_campanha DESC
            `

            return rawQuery
        }
    }


    const [query] = await db.execute(sqlQuery())

    return query
}

const alimentosDoados = async () => {
    const [query] = await db.execute(`
        select * from alimento_doacao
    `)

    return query
}

const alimentos = async () => {
    const [query] = await db.execute(`
        select 
            cd_tipo_alimento,
            nm_tipo_alimento, 
            json_arrayagg(json_object( 
                'nm_alimento', nm_alimento,
                'sg_medida_alimento', sg_medida_alimento,
                'nm_alimento', nm_alimento,
                'cd_alimento', cd_alimento
        )) as alimentos
        from alimento p 
        group by nm_tipo_alimento, cd_tipo_alimento 
        order by cd_tipo_alimento asc
    `)

    return query
}

const insertAlimentosCampanha = (cdCampanha: number, alimentos: IAlimentoInsert[]) => {
    let query = 'INSERT INTO alimento_campanha (cd_alimento, cd_campanha, qt_alimento_meta) VALUES ';
    const values: string[] = [];

    alimentos.forEach(alimento => {
        const valuesString = `(${alimento.cd_alimento}, ${cdCampanha}, ${alimento.qt_alimento_meta})`;
        values.push(valuesString);
    });

    query += values.join(', ') + ';';
    return query;
}

const insertAlimentosDoacao = (cdCampanha: number, cdUsuario: number, alimentos: IAlimentoDoacao[]) => {
    let query = 'INSERT INTO alimento_doacao (cd_usuario, cd_alimento, cd_campanha, qt_alimento_doado) VALUES ';
    const values: string[] = [];

    alimentos.forEach(alimento => {
        const valuesString = `(${cdUsuario}, ${alimento.cd_alimento}, ${cdCampanha}, ${alimento.qt_alimento_doacao})`;
        values.push(valuesString);
    });

    query += values.join(', ') + ';';
    return query;
}

const insertUsuario = (user_infos: any) => {
    let campo_documento = '-'

    if (user_infos.tipo_usuario == 'pf') {
        campo_documento = 'ch_cpf_usuario'
    } else if (user_infos.tipo_usuario == 'pj') {
        campo_documento = 'ch_cnpj_usuario'
    }


    let query = `INSERT INTO usuario 
    (nm_usuario, ${campo_documento}, dt_nascimento_usuario, nr_celular_usuario, sg_estado_usuario, nm_cidade_usuario, cd_senha_usuario, cd_email_usuario) 
    VALUES 
    ('${user_infos.nm_usuario}', '${user_infos.ch_documento_usuario}', '${user_infos.dt_nascimento_usuario}', '${user_infos.nr_celular_usuario}', '${user_infos.sg_estado_usuario}', '${user_infos.nm_cidade_usuario}', '${user_infos.cd_senha_usuario}', '${user_infos.cd_email_usuario}')
    `;

    return query;
}

const validateLogin = (user_email: string, user_password?: string) => {
    let query = ''

    if (user_password) {
        query = `select * from usuario u where cd_email_usuario = '${user_email}' and cd_senha_usuario = '${user_password}'`;
    } else {
        query = `select * from usuario u where cd_email_usuario = '${user_email}'`;
    }

    return query;
}



app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/api/campanhas', async (req: Request, res: Response) => {
    const id = <string>req.query.id
    const campanhasResponse = await campanhas(parseInt(id));
    res.json(campanhasResponse)
})

app.get('/api/alimentos', async (req: Request, res: Response) => {
    const alimentosResponse = await alimentos();
    res.json(alimentosResponse)
})

app.get('/api/alimentosDoados', async (req: Request, res: Response) => {
    const alimentosResponse = await alimentos();
    res.json(alimentosResponse)
})

app.get('/api/usuarios', async (req: Request, res: Response) => {
    const usuariosResponse = await usuarios();
    res.json(usuariosResponse)
})

app.get('/api/estadosCidades', async (req: Request, res: Response) => {
    const estadosCidades = await fetchEstadosCidades();
    res.json(estadosCidades)
})

app.post('/api/campanhas', async (req: Request, res: Response) => {
    const infos_campanha = req.body.infos_campanha
    const cd_usuario_campanha = infos_campanha.cd_usuario_campanha
    const nm_titulo_campanha = infos_campanha.nm_titulo_campanha
    const dt_encerramento_campanha = infos_campanha.dt_encerramento_campanha
    const nm_cidade_campanha = infos_campanha.nm_cidade_campanha
    const sg_estado_campanha = infos_campanha.sg_estado_campanha
    const ds_acao_campanha = infos_campanha.ds_acao_campanha
    const cd_imagem_campanha = infos_campanha.cd_imagem_campanha

    const alimentos_campanha = req.body.alimentos_campanha

    const campanhaInserida = await db.execute(`
        INSERT INTO campanha 
            (cd_usuario_campanha, nm_titulo_campanha, dt_encerramento_campanha, nm_cidade_campanha, sg_estado_campanha, ds_acao_campanha, cd_imagem_campanha) 
        VALUES
            (?, ?, ?, ?, ?, ?, ?)`, [cd_usuario_campanha, nm_titulo_campanha, dt_encerramento_campanha, nm_cidade_campanha, sg_estado_campanha, ds_acao_campanha, cd_imagem_campanha]
    )


    const alimentosQuery = insertAlimentosCampanha(campanhaInserida[0].insertId, alimentos_campanha)

    const response = await db.execute(alimentosQuery)

    res.json(response)
})

app.post('/api/doacoes', async (req: Request, res: Response) => {
    const infos_doacao = req.body.infos_doacao
    const cd_usuario_doacao = infos_doacao.cd_usuario_doacao
    const cd_campanha_doacao = infos_doacao.cd_campanha_doacao

    const alimentos_doacao = req.body.alimentos_doacao

    const alimentosQuery = insertAlimentosDoacao(cd_campanha_doacao, cd_usuario_doacao, alimentos_doacao)

    const response = await db.execute(alimentosQuery)

    res.json(response)
})

app.post('/api/usuarioCadastro', async (req: Request, res: Response) => {
    const user_infos = req.body.user_infos;

    try {
        const hashedPassword = await bcrypt.hash(user_infos.cd_senha_usuario, salt);
        user_infos.cd_senha_usuario = hashedPassword; 

        const query = insertUsuario(user_infos); 
        const [user_response] = await db.execute(query);

        res.json(user_response);
    } catch (err) {
        console.error('Error while registering user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/usuarioLogin', async (req: Request, res: Response) => {
    const email = req.body.user_email
    const password = req.body.user_password

    const query = validateLogin(email)
    const user_response = await db.execute(query)

    if (!user_response[0] || user_response[0].length === 0) {
        res.status(400)
        res.json({
            user: null,
            authenticated: false,
            message: 'Email ou senha inválidos'
        })
    } else {
        const user = user_response[0][0]
        const hash_password_db = user.cd_senha_usuario

        if (password && hash_password_db) {
            const compare = await bcrypt.compare(password, hash_password_db)

            if (compare) {
                res.status(200)
                res.json({
                    user: user,
                    authenticated: true,
                    message: 'Usuário autenticado'
                })
            } else {
                res.status(400)
                res.json({
                    user: null,
                    authenticated: false,
                    message: 'Email ou senha inválidos'
                })
            }
        } else {
            res.status(400)
            res.json({
                user: null,
                authenticated: false,
                message: 'Erro ao resgatar dados'
            })
        }
    }
})


app.listen(5000, () => { console.log('Server started on port 5000') })

export { }