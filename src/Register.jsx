import {useState, useRef, useEffect} from 'react';

function Register({onSuccess, onLogin}){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const sendRegistration = async () => {
        if(email.trim() === '' || password.trim() === '' || username.trim() === ''){
            return console.error("veuillez remplir tout le formulaire !");
        }

        try{
            const res = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username:username, email:email, password:password})
            });

            onSuccess();
        }catch (error){
            console.error("Erreur lors de l'envoie du formulaire", error);
        }
    }

    return (
        <div style={{
            fontFamily: 'Arial',
            backgroundColor: '#e5e5f7',
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                backgroundColor: '#4a148c',
                textAlign: 'center',
                color: '#e5e5f7',
                padding: '1rem',
                fontSize: '1.7rem',
                fontWeight: 'bold',
                fontFamily: '"Poppins", sans-serif',
            }}>
                AghiMessenger
            </div>

            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '15px',
                    padding: '2rem',
                    width: '90%',
                    maxWidth: '400px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{
                        textAlign: 'center',
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        fontFamily: '"Poppins", sans-serif',
                        color: '#4a148c',
                        marginBottom: '0.5rem'
                    }}>
                        Inscription
                    </div>

                    <input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '10px',
                            border: '1px solid #ccc',
                            fontSize: '1rem',
                            fontFamily: 'Arial'
                        }}
                    />

                    <input
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '10px',
                            border: '1px solid #ccc',
                            fontSize: '1rem',
                            fontFamily: 'Arial'
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') sendRegistration(); }}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '10px',
                            border: '1px solid #ccc',
                            fontSize: '1rem',
                            fontFamily: 'Arial'
                        }}
                    />

                    <button onClick={sendRegistration} style={{
                        padding: '0.75rem',
                        border: 'none',
                        backgroundColor: '#4a148c',
                        color: '#fff',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}>
                        S'inscrire
                    </button>

                    <div style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                        <span
                            onClick={onLogin}
                            style={{ color: '#4a148c', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Se connecter
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register;