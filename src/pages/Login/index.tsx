import { Footer } from '../../components/Footer'
import { Navbar } from '../../components/Navbar'

import { Link, useNavigate } from 'react-router-dom';

import campanhas from '../../data/campanhas.json'
import { useState } from 'react';

export const Login = () => {
    const [visiblePass, setVisiblePass] = useState(false)
    const navigate = useNavigate()

    function redirectLogin(){
        navigate('/descobrir')
    }

    function showPassword(){
        setVisiblePass(!visiblePass)
    }

    return (
        <>
            <Navbar page='Login'/>

            <main className="lyt_forms pg_login">
                <div className="form-container column">
                    <p className="sub titulo">Login</p>
                    <form className="form-login column" action="/descobrir" method="POST">
                        <label htmlFor="">Email</label>
                        <input className="input-form" type="email" name="email" />
                        <div className="chkbx-container exibir row" id="">
                            <input className="checkbox-form" type="checkbox" name="" id="ckbExibir" onChange={showPassword}/>
                            <label className="" htmlFor="ckbExibir">Exibir senha</label>
                        </div>
                        <label htmlFor="">Senha</label>
                        <input className="input-form pass" type={visiblePass ? 'text' : 'password'} name="pass" />
                        <Link className="titulo-link" to="#">Esqueci minha senha</Link>
                        <input className="btn btn blue" type="submit" value="Entrar" onClick={redirectLogin} />
                    </form>
                </div>
            </main>

        </>
    );
};