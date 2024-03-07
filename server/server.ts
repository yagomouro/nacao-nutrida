import express, { Request, Response } from 'express';
const db = require('./database')


const usuarios = async () => {
    const [query] = await db.execute(`
        SELECT * FROM usuario;
    `)

    return query
}

const campanhas = async (id: string | null = null) => {
    const filtroCampanha = id ? `and c.cd_campanha = ${id}` : ''

    const [query] = await db.execute(`
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
            c.qt_total_campanha,
            c.ds_acao_campanha,
            c.qt_doacoes_campanha,
            c.cd_imagem_campanha,
            u.nm_usuario,
            u.cd_foto_usuario,
            JSON_ARRAYAGG(JSON_OBJECT(
            'nm_alimento', a.nm_alimento,
            'nm_medida_alimento', a.nm_medida_alimento,
            'qt_alimento', a.qt_alimento,
            'qt_doada_alimento', a.qt_doada_alimento
            )) AS alimentos
        FROM campanha c
            inner join alimento a ON c.cd_campanha = a.cd_campanha_alimento 
            inner join usuario u on c.cd_usuario_campanha = u.cd_usuario 
        where c.fg_deletada_campanha = 0
            and u.fg_deletado_usuario = 0
            ${filtroCampanha}
        group by c.cd_campanha 

    `)

    return query
}

const alimentos = async () => {
    const [query] = await db.execute(`
        SELECT * FROM alimento;
    `)

    return query
}


const app = express();

app.get('/api/campanhas', async (req: Request, res: Response) => {
    const id = <string>req.query.id
    const campanhasResponse = await campanhas(id);
    res.json(campanhasResponse)
})

app.get('/api/alimentos', async (req: Request, res: Response) => {
    const alimentosResponse = await alimentos();
    res.json(alimentosResponse)
})

app.get('/api/usuarios', async (req: Request, res: Response) => {
    const usuariosResponse = await usuarios();
    res.json(usuariosResponse)
})

app.listen(5000, () => { console.log('Server started on port 5000') })

export { }