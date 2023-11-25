import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';

export const Cadastro = () => {
    const [pessoa, setPessoa] = useState<string>('pf');
    const navigate = useNavigate()

    function redirectLogin() {
        navigate('/login')
    }

    const handlePessoaChange = (value: string) => {
        setPessoa(value);
    };

    const replaceSpace = (str: string) => {
        return str.replace(/\s+/g, '');
    };



    return (
        <>
            <Navbar page='Cadastro' />
            <main className="lyt_forms pg_cadastro">
                <div className="form-container column">
                    <p className="sub titulo">Cadastrar-se</p>
                    <form className="form-login column" action="/cadastro" method="POST">
                        <div className="row cpfj">
                            <div className="row">
                                <input
                                    type="radio"
                                    name="pessoa"
                                    id="pf"
                                    value="pf"
                                    checked={pessoa === 'pf'}
                                    onChange={() => handlePessoaChange('pf')}
                                />
                                <label htmlFor="pf">Pessoa Física</label>
                            </div>
                            <div className="row">
                                <input
                                    type="radio"
                                    name="pessoa"
                                    id="pj"
                                    value="pj"
                                    checked={pessoa === 'pj'}
                                    onChange={() => handlePessoaChange('pj')}
                                />
                                <label htmlFor="pj">Pessoa Jurídica</label>
                            </div>
                        </div>
                        <label className="lblNome" htmlFor="">
                            {pessoa === 'pf' ? 'Nome completo' : 'Nome da instituição'}
                        </label>
                        <input className="input-form" type="text" name="username" />

                        <label className="lblCpf" htmlFor="">
                            {pessoa === 'pf' ? 'CPF' : 'CNPJ'}
                        </label>
                        <input className="input-form" type="text" name={pessoa === 'pf' ? 'cpf' : 'cnpj'} />

                        <label htmlFor="">Email</label>
                        <input className="input-form" type="email" name="email" placeholder="exemplo@email.com" />

                        <label htmlFor="">Celular</label>
                        <input className="input-form" type="tel" name="cel" />

                        {pessoa === 'pf' && (
                            <div className="column nascWrapper">
                                <label className="lblDtNasc" htmlFor="">
                                    Data de nascimento
                                </label>
                                <input className="input-form" type="date" name="dtuser" />
                            </div>
                        )}

                        <div className="column passWrapper">
                            <label htmlFor="">Senha</label>
                            <input className="input-form" type="password" name="pass" />
                        </div>

                        <label htmlFor="">Confirme sua senha</label>
                        <input className="input-form" type="password" name="passConf" />

                        <div className="row">
                            <div className="column">
                                <label htmlFor="">Estado</label>
                                <select name="estado" className="input-form">
                                    <option value="0">Selecione o Estado</option>
                                </select>
                            </div>
                            <div className="column">
                                <label htmlFor="">Cidade</label>

                                <input type="hidden" name="state" />
                                <select name="cidade" disabled={true} className="input-form">
                                    <option value="0">Seleciona a Cidade</option>
                                </select>
                            </div>
                        </div>

                        <input className="btn btn blue" type="submit" value="Cadastrar" onClick={redirectLogin} />
                    </form>
                </div>
            </main>
        </>
    );
};