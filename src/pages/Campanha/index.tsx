import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Footer } from '../../components/Footer'
import { Navbar } from '../../components/Navbar'

import campanhas from '../../data/campanhas.json'

import { ICampanha } from '../../types/ICampanha';


export const Campanha = () => {
  const navigate = useNavigate()
  const { cd_campanha } = useParams();

  const campanha: ICampanha = campanhas.find(item => item.cd_campanha == cd_campanha)!

  const [modalVisible, setModalVisible] = useState(false);

  const handleCloseModal = () => {
    setModalVisible(!modalVisible);
  };


  const replaceSpace = (str: string) => {
    return str.replace(/\s+/g, '');
  };

  function contarProgresso(qt_doacoes_campanha: number, qt_total_campanha: number) {
    let percentage = (qt_doacoes_campanha * 100) / qt_total_campanha

    if (percentage > 100) {
      return `100%`
    } else {
      return `${percentage}%`
    }

  }

  return (
    <>
      <Navbar user={{ 'cd_foto_usuario': '1', 'nm_usuario': 'Usuário 1' }} />

      <div className={`lyt_denuncia pg_contribuir campanha ${modalVisible ? 'visible' : ''}`}>
        <div className="form-container campanha column">
          <div className="closeWrapper">
            <img className="closeModal" src="/assets/img/icone_times_black.svg" alt="" onClick={handleCloseModal} />
          </div>
          <p className="sub titulo">Informe a quantidade da doação:</p>
          <form className="form-login column" method="GET">
            <div className="alimento column">
              <div className="desc row">
                <label>Alimento</label>
                <label>Quantidade</label>
              </div>
              <div className="qtdAlimentos">
                {campanha.alimentos.map((alimento, index) => (
                  <div key={index} className="row">
                    <div className="alimento-campanha">
                      <input
                        className="input-form nmAl"
                        type="text"
                        name={`nmAlimento${index}`}
                        value={alimento.nm_alimento}
                        readOnly
                      />
                    </div>
                    <div className="alimento-quantidade">
                      <div className="qtdAl">
                        <input className="input-form" type="number" name={`qtd${index}`} min="0" />
                        <h1 className="sub titulo">{alimento.nm_medida_alimento}</h1>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="comentario column">
              <label>Adicione um comentário (opcional)</label>
              <textarea className="input-form" name="descricao"></textarea>
            </div>
            <input className="btn blue" type="submit" value="Enviar" />
          </form>
        </div>
      </div>

      <main className="pg_campanha">
        <div className="container-campanha column">
          <div key={campanha.nm_titulo_campanha}>
            <h1 className="titulo black">{campanha.nm_titulo_campanha}</h1>
            <div className="subcontainer-campanha row">
              <div className="container-descricao">
                <div className="container-img">
                  <img src={`/assets/campanhas/${campanha.cd_imagem_campanha}.png`} alt="" />
                </div>
                <div className="descricao">
                  <h1 className="sub titulo black">Descrição</h1>
                  <p>{campanha.ds_acao_campanha}</p>
                  <div className="denunciar">
                    <Link className="row" to={`#`}>
                      <img src="/assets/img/icone_denounce_black.svg" alt="Denunciar" />
                      <span>Denunciar campanha</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="container-alimentos column">
                <header className="header-alimentos row">
                  <div className="usuario row">
                    <div className="img-wrapper">
                      <img src={`/assets/profile/${campanha.cd_foto_usuario}.png`} alt="Foto do usuário" />
                    </div>
                    <div>
                      <h2>{campanha.nm_usuario}</h2>
                      <p className="titulo-gray cidadeEstado">{`${campanha.nm_cidade_usuario}, ${campanha.sg_estado_usuario}`}</p>
                    </div>
                  </div>
                  <div className="header-campanha">
                    <div>
                      <img src="/assets/img/icone_pin.svg" alt="Icone pin" />
                      <p className="cidadeEstado">{`${campanha.nm_cidade_campanha}, ${campanha.sg_estado_campanha}`}</p>
                    </div>
                    <div>
                      <img src="/assets/img/icone_relogio.svg" alt="Icone relógio" />
                      <p>Expira em: {campanha.qt_tempo_restante}</p>
                    </div>
                  </div>
                </header>
                <div className="main-alimentos column">
                  <h2 className="titulo black">Alimentos:</h2>
                  <div className="alimento-container column">
                    {campanha.alimentos.map((alimento) => (
                      <div key={alimento.nm_alimento} className="alimento column">
                        <h2 className="sub titulo">{alimento.nm_alimento}</h2>
                        <div className="progresso-container row">
                          <div className="arrecadado">
                            <p><span className={`arrecadado-${replaceSpace(alimento.nm_alimento)}`}>{contarProgresso(alimento.qt_doada_alimento, alimento.qt_alimento)}</span></p>
                          </div>
                          <div className="porcentagem">
                            <div className="progresso-barra">
                              <div style={{ width: contarProgresso(alimento.qt_doada_alimento, alimento.qt_alimento) }} className={`progresso-atual progresso-atual-${replaceSpace(alimento.nm_alimento)}`}></div>
                            </div>
                          </div>
                        </div>
                        <div className="meta row">
                          <p>{`Arrecadado: ${alimento.qt_doada_alimento} ${alimento.nm_medida_alimento}`}</p>
                          <p>{`Meta: ${alimento.qt_alimento} ${alimento.nm_medida_alimento}`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn blue-light2 openModal" onClick={handleCloseModal}>Doar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer></Footer>
    </>

  );
};
