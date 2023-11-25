export interface IAlimento {
    nm_alimento: string;
    qt_doada_alimento: number;
    qt_alimento: number;
    nm_medida_alimento: string;
}

export interface ICampanha {
    cd_campanha: string,
    nm_titulo_campanha: string,
    alimentos: IAlimento[],
    cd_imagem_campanha: string,
    qt_doacoes_campanha: number,
    qt_total_campanha: number,
    ds_acao_campanha: string,
    qt_arrecadada: number,
    cd_foto_usuario: string,
    nm_usuario: string,
    nm_cidade_usuario: string,
    sg_estado_usuario: string,
    qt_tempo_restante: string,
    nm_cidade_campanha: string,
    sg_estado_campanha: string
}