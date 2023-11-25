import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';

import alimentos from '../../data/alimentos.json'

interface FoodProps {
    id: number;
}

const Food: React.FC<FoodProps> = ({ id }) => {
    return (
        <div className="alimento row" id={id.toString()}>
            <div className="tipo-input">
                <label>Tipo</label>
                <select className="input-form tpf" name="tpf">
                    <option value="0" disabled={true}>
                        Selecione um tipo
                    </option>
                </select>
            </div>

            <div className="alimento-input">
                <label>Alimento</label>
                <select className="input-form alimentoInput" name="alimentoInput"></select>
            </div>

            <div className="quantidade-input">
                <label>Quantidade</label>
                <div className="qtdAl row">
                    <input className="input-form quantidade" type="number" min="1" name="quantidade" />
                    <h1 className="sub titulo medidaAlimento"></h1>
                </div>
            </div>

            <button className="btn red excluir" type="button">
                <img src="/assets/img/trash.svg" alt="excluir" />
            </button>
        </div>
    );
};

export const CriacaoCampanha = () => {
    const navigate = useNavigate()

    function redirectCampanha() {
        navigate('/descobrir')
    }

    const addFood = () => {
    };

    const delFood = () => {
    };

    const addSelectFoods = () => {
    };

    return (
        <>
            <Navbar user={{ 'cd_foto_usuario': '1', 'nm_usuario': 'Usuário 1' }} />

            <main className="lyt_forms pg_cadastro-campanha">
                <div className="form-container column">
                    <h1 className="titulo">Cadastrar campanha</h1>
                    <form className="form-login column" id="formCampanha" method="POST" action="/criar" encType="multipart/form-data">

                        <h2 className="sub titulo">Dados iniciais</h2>
                        <div className="dados-iniciais row">
                            <div>
                                <label htmlFor="">Título</label>
                                <input className="input-form" type="text" name="titulo" id="titId" maxLength={30} />
                            </div>
                            <div>
                                <label>Data de encerramento</label>
                                <input className="input-form" type="date" name="dtCampanha" id="dtPed" />
                            </div>
                        </div>

                        <h2 className="sub titulo">Local de entrega do alimento</h2>
                        <div className=" local-entrega row">
                            <div className="column">
                                <label htmlFor="">Estado</label>
                                <select name="estado" className="input-form" id="estadoPed">
                                    <option value="0">Selecione o Estado</option>
                                </select>
                            </div>
                            <div className="column">
                                <label htmlFor="">Cidade</label>

                                <input type="hidden" name="state" />
                                <select name="cidade" disabled={true} className="input-form" id="cidadePed">
                                    <option value="0">Seleciona a Cidade</option>
                                </select>
                            </div>
                        </div>

                        <h2 className="sub titulo">Alimentos</h2>
                        <div className="alimentos-container">
                            <div className="alimentos-wrapper column">
                                <Food id={1}/>
                                <Food id={2}/>
                                <Food id={3}/>
                            </div>

                            <button className="btn blue-light2 adicionar" type="button">
                                Adicionar mais um alimento
                            </button>
                        </div>

                        <h2 className="sub titulo">Dados finais</h2>

                        <div className="texts column">
                            <div className="column">
                                <label htmlFor="">Adicionar descrição da sua ação social</label>
                                <textarea id="descPed" className="input-form" name="descPed" cols={30} rows={10}
                                    placeholder="Insira a relevância por trás da sua campanha, descrevendo-a com detalhes. Exemplo: Irei montar cestas básicas para distribuir para a comunidade do morro nova cintra no dia 7 de julho, preciso muito da sua ajuda com os alimentos! Me ajude com o que você puder."></textarea>
                            </div>

                            <label htmlFor="">Adicionar imagem de capa</label>
                            <input className="input-form imagePed" type="file" accept="image/*" name="picPed" />

                            <input className="btn blue-light2" type="submit" value="Cadastrar campanha" onClick={redirectCampanha} />
                        </div>
                    </form>
                </div>
            </main>

        </>
    );
};
