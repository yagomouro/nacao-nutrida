import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import axios from 'axios';
import { IEstadoCidades } from '../../types/IEstadoCidade';

export const Cadastro = () => {
    const [tipo_usuario, setTipoUsuario] = useState<string>('pf');
    const navigate = useNavigate()
    const [listaEstadosCidades, setListaEstadosCidades] = useState<IEstadoCidades[]>([])
    const [listaCidades, setListaCidades] = useState<string[]>([])
    const [cidadeSelecionada, setCidadeSelecionada] = useState<string>('')

    useEffect(() => {
        axios.get('/api/estadosCidades').then((response) => {
            setListaEstadosCidades(response.data)
        }).catch((err) => {
            console.log('Error: ' + err)
        })
    }, [])

    const handleChangeEstadoSelecionado = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedEstado = event.target.value;

        const estado = listaEstadosCidades.find(estado => estado.sg_estado === selectedEstado)!.cidades;
        setListaCidades(estado);
    };

    const handleChangeCidadeSelecionada = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectCidade = event.target.value;

        const cidade = listaCidades.find(cidade => cidade === selectCidade)!;
        setCidadeSelecionada(cidade);
    };

    function handleSubmit(event: any) {
        event.preventDefault()

        const cd_senha_usuario_confirmacao = event.target.cd_senha_usuario_confirmacao.value
        const cd_senha_usuario = event.target.cd_senha_usuario.value

        if (cd_senha_usuario_confirmacao !== cd_senha_usuario) {
            alert('As confirmação da senha deve ser igual!')
        } else {
            const user_infos = {
                tipo_usuario: tipo_usuario,
                nm_usuario: event.target.nm_usuario.value,
                ch_documento_usuario: event.target.ch_documento_usuario.value,
                cd_email_usuario: event.target.cd_email_usuario.value,
                nr_celular_usuario: event.target.nr_celular_usuario.value,
                dt_nascimento_usuario: event.target.dt_nascimento_usuario.value,
                cd_senha_usuario: event.target.cd_senha_usuario.value,
                sg_estado_usuario: event.target.sg_estado_usuario.value,
                nm_cidade_usuario: event.target.nm_cidade_usuario.value
            }

            console.log(user_infos)

            const dbInsert = async () => {
                try {
                    const response = await axios.post('/api/usuarioCadastro', {
                        user_infos: user_infos,
                    });
                    return [response.status, response.data];
                } catch (error) {
                    console.error('Erro:', error);
                    throw error;
                }
            }

            const handleDBInsert = async () => {
                try {
                    const [responseStatus, responseData] = await dbInsert();
                    if (responseStatus != 200) {
                        console.log('Erro ao salvar dados no banco')
                    } else {
                        console.log('Sucesso ao salvar dados no banco ', responseData)
                        navigate('/login')
                    }
                } catch (error) {
                    console.error('Erro ao inserir dados:', error);
                }
            }

            handleDBInsert();

        }




    }

    const handleTipoUsuarioChange = (value: string) => {
        setTipoUsuario(value);
    };



    return (
        <>
            <Navbar page='Cadastro' />
            <main className="lyt_forms pg_cadastro">
                <div className="form-container column">
                    <p className="sub titulo">Cadastrar-se</p>
                    <form className="form-login column" method="POST" onSubmit={handleSubmit}>
                        <div className="row cpfj">
                            <div className="row">
                                <input
                                    type="radio"
                                    name="tipo_usuario"
                                    id="pf"
                                    value="pf"
                                    checked={tipo_usuario === 'pf'}
                                    onChange={() => handleTipoUsuarioChange('pf')}
                                />
                                <label htmlFor="pf">Pessoa Física</label>
                            </div>
                            <div className="row">
                                <input
                                    type="radio"
                                    name="tipo_usuario"
                                    id="pj"
                                    value="pj"
                                    checked={tipo_usuario === 'pj'}
                                    onChange={() => handleTipoUsuarioChange('pj')}
                                />
                                <label htmlFor="pj">Pessoa Jurídica</label>
                            </div>
                        </div>
                        <label className="lblNome" htmlFor="">
                            {tipo_usuario === 'pf' ? 'Nome completo' : 'Nome da instituição'}
                        </label>
                        <input className="input-form" type="text" name="nm_usuario" />

                        <label className="lblCpf" htmlFor="">
                            {tipo_usuario === 'pf' ? 'CPF' : 'CNPJ'}
                        </label>
                        <input className="input-form" type="text" name='ch_documento_usuario' />

                        <label htmlFor="">Email</label>
                        <input className="input-form" type="email" name="cd_email_usuario" placeholder="exemplo@email.com" />

                        <label htmlFor="">Celular</label>
                        <input className="input-form" type="tel" name="nr_celular_usuario" />

                        {tipo_usuario === 'pf' && (
                            <div className="column nascWrapper">
                                <label className="lblDtNasc" htmlFor="">
                                    Data de nascimento
                                </label>
                                <input className="input-form" type="date" name="dt_nascimento_usuario" />
                            </div>
                        )}

                        <div className="column passWrapper">
                            <label htmlFor="">Senha</label>
                            <input className="input-form" type="password" name="cd_senha_usuario" />
                        </div>

                        <label htmlFor="">Confirme sua senha</label>
                        <input className="input-form" type="password" name="cd_senha_usuario_confirmacao" />

                        <div className="row">
                            <div className="column">
                                <label htmlFor="">Estado</label>
                                <select name="sg_estado_usuario" className="input-form" id="estadoCampanha" onChange={handleChangeEstadoSelecionado}>
                                    <option value="0" disabled={true}>Selecione o Estado</option>
                                    {listaEstadosCidades.map((estado) => (
                                        <option value={estado.sg_estado}>
                                            {estado.sg_estado}
                                        </option>
                                    ))}
                                </select>

                            </div>
                            <div className="column">
                                <label htmlFor="">Cidade</label>
                                <select name="nm_cidade_usuario" className="input-form" id="cidadeCampanha" onChange={handleChangeCidadeSelecionada}>
                                    <option value="0" disabled={true}>Selecione a Cidade</option>
                                    {listaCidades.map((cidade) => (
                                        <option value={cidade}>
                                            {cidade}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <input className="btn btn blue" type="submit" value="Cadastrar" />
                    </form>
                </div>
            </main>
        </>
    );
};