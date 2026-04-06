import { useState, useRef, useEffect } from 'react';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

function Login({onSuccess, onRegister}){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const passwordToKey = async (password) => {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
      );
      const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: encoder.encode('aghimessenger-salt'), iterations: 100000, hash: 'SHA-256' },
        keyMaterial, 256
      );
      return new Uint8Array(bits);
    };

    const sendLogins = async () => {
        if(email.trim() === '') {
            return console.error("adresse mail non fournie !");
        }

        if(password.trim() === ''){
            console.error('Mot de passe non fourni !');
        }

        try{
            const res = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({email: email, password: password})
            });

            const data = await res.json();
            
            if(data.token){
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);

            const keyRes = await fetch(`http://localhost:3001/users/mykey`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });
                const keyData = await keyRes.json();

            if (keyData.encrypted_private_key) {
              const passwordKey = await passwordToKey(password);
              const [nonceB64, encryptedB64] = keyData.encrypted_private_key.split(':');
              const nonce = decodeBase64(nonceB64);
              const encrypted = decodeBase64(encryptedB64);
              const decrypted = nacl.secretbox.open(encrypted, nonce, passwordKey);
              if (decrypted) {
                localStorage.setItem('private_key', encodeBase64(decrypted));
              }
            }

            onSuccess();
            
            }
            else{
                console.error('Identifiants incorrrectes');
            }
        } catch (error) {
            console.error("Erreur lors de l'envoie des informations au serveur", error);
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
                        Connexion
                    </div>

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
                        onKeyDown={(e) => { if(e.key === 'Enter') sendLogins(); }}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '10px',
                            border: '1px solid #ccc',
                            fontSize: '1rem',
                            fontFamily: 'Arial'
                        }}
                    />

                    <button onClick={sendLogins} style={{
                        padding: '0.75rem',
                        border: 'none',
                        backgroundColor: '#4a148c',
                        color: '#fff',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}>
                        Se connecter
                    </button>

                    <div style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                        Pas de compte ?{' '}
                        <span
                            onClick={onRegister}
                            style={{ color: '#4a148c', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            S'inscrire
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;