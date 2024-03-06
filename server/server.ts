import express, { Request, Response } from 'express';
const db = require('./database')


const usuarios = async () => {
    const [query] = await db.execute(`
        SELECT * FROM usuario;
    `)
    
    return query
}

const campanhas = async () => {
    const [query] = await db.execute(`
        SELECT * FROM campanha;
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

app.get('/api/campanhas', async(req: Request, res: Response) => {
    const campanhasResponse = await campanhas();
    res.json(campanhasResponse)
})

app.get('/api/alimentos', async(req: Request, res: Response) => {
    const alimentosResponse = await alimentos();
    res.json(alimentosResponse)
})

app.get('/api/usuarios', async(req: Request, res: Response) => {
    const usuariosResponse = await usuarios();
    res.json(usuariosResponse)
})

app.listen(5000, () => { console.log('Server started on port 5000') })

export { }