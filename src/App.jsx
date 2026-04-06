import { useState, useRef, useEffect } from 'react';
import nacl from 'tweetnacl';
import {encodeBase64, decodeBase64} from 'tweetnacl-util'

import Login from './Login.jsx';
import Register from './Register.jsx';
import Contacts from './Contacts.jsx';

function App() {
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const [page, setPage] = useState(() => {
    if (!localStorage.getItem('token')) return 'login';
    return localStorage.getItem('page') || 'contacts'});

  const [selectedContact, setSelectedContact] = useState(() => {
    return localStorage.getItem('selectedContact');
  });

  const [contactPublicKey, setContactPublicKey] = useState(() => {
    return localStorage.getItem('contactPublicKey');
  });
  
  const bottomRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const loadMessages = async () => {
    try {
      const res = await fetch('http://localhost:3001/messages', {headers : {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
      const data = await res.json();
      if(Array.isArray(data)){
        setMessages(data.map(msg => ({...msg, time: new Date(msg.time).toISOString()
        })));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth'});
    }
  }, [messages]
  );

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3001/messages?with=${selectedContact}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
        const data = await res.json();
        if (Array.isArray(data)) {
          const decryptedMessages = await Promise.all(
            data.map(async (msg) => ({
              ...msg,
              text: msg.sender === localStorage.getItem('username')
              ? (JSON.parse(localStorage.getItem('sentCache') || '{}')[msg.text] || '[mon message]') 
              : await decryptMessage(msg.text, msg.sender),
              time: new Date(msg.time).toISOString()
            }))
          );
          setMessages(decryptedMessages);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);  
      }
    };
    if(page === 'chat'){
      loadMessages();

      const interval = setInterval(loadMessages, 3000); 

      return () => clearInterval(interval);
    }
  }, [page]);

  function formatDateForHeader(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString( 'fr-FR',{
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  }

  const sendMessage = async () => {
    if (message.trim() !== '') {
      const now = new Date();

      const keyRes = await fetch(`http://localhost:3001/users/key/${selectedContact}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const keyData = await keyRes.json();
      const recipientPublicKey = decodeBase64(keyData.public_key.public_key);

      const senderPrivateKey = decodeBase64(localStorage.getItem('private_key'));
      const nonce = nacl.randomBytes(24);
      const messageBytes = new TextEncoder().encode(message);

      const encrypted = nacl.box(
        messageBytes,
        nonce,
        recipientPublicKey,
        senderPrivateKey
      );

      const encryptedText = encodeBase64(nonce) + ':' + encodeBase64(encrypted);

      const userMessage = {
        text: encryptedText,
        sender: localStorage.getItem('username'),
        receiver: selectedContact,
        time: now.toISOString()
      };

      const sentCache = JSON.parse(localStorage.getItem('sentCache') || '{}');
      sentCache[encryptedText] = message;
      localStorage.setItem('sentCache', JSON.stringify(sentCache));
      
      setMessages((prev) => [...prev, {...userMessage, text: message}]);
      setMessage('');

      // Appelle le backend pour enregistrer
      try {
        await fetch('http://localhost:3001/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(userMessage)
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi au backend :", error);
      }
    }
  };

  const decryptMessage = async (encryptedText, senderUsername) => {
    try {
      const res = await fetch(`http://localhost:3001/users/key/${senderUsername}`, {
        headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
      });

      const data = await res.json();

      console.log('Clé publique reçue:', data);
      console.log('Ma clé privée:', localStorage.getItem('private_key'));
      console.log('senderUsername:', senderUsername);
      console.log('myUsername:', localStorage.getItem('username'));

      const senderPublicKey = decodeBase64(data.public_key.public_key);

      const [nonceB64, encryptedB64] = encryptedText.split(':');
      const nonce = decodeBase64(nonceB64);
      const encrypted = decodeBase64(encryptedB64);
      const myPrivateKey = decodeBase64(localStorage.getItem('private_key'));

      const decrypted = nacl.box.open(encrypted, nonce, senderPublicKey, myPrivateKey);
      if(!decrypted) return '[message illisible]'

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      return '[erreur de déchiffrement]';
    }
  };

  const changePage = (newPage) => {
    localStorage.setItem('page', newPage);
    setPage(newPage);
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    changePage('login');
  }

  if (page === 'login'){
    return <Login onSuccess={() => changePage('contacts')} onRegister={() => changePage('register')}/>;
  }

  if (page === 'register'){
    return <Register onSuccess={() => changePage('contacts')} onLogin={() => changePage('login')} />;
  }

  if (page === 'contacts'){
    return <Contacts onSelectedContact={(username, publicKey) => {
      setSelectedContact(username);
      setContactPublicKey(publicKey);
      localStorage.setItem('selectedContact', username);
      localStorage.setItem('contactPublicKey', publicKey); 
      changePage('chat');
    }}
      onLogout={logout}/>
  }

  return (
    <div 
      style={{
        //padding: '2rem', 
        fontFamily: 'Arial', 
        backgroundColor: '#e5e5f7', 
        height:'100vh',
        width: '100vw',
        display:'flex',
        flexDirection: 'column',
        overflow : 'hidden',
        overflowX: 'hidden',
        maxWidth:'100vw'
      }}
    > 
      <div style={{
            backgroundColor: '#4a148c',
            textAlign: 'center',
            color: '#e5e5f7',
            padding: '1rem',
            fontSize: '1.7rem',
            fontWeight: 'bold',
            fontFamily: '"Poppins", sans-serif',
            borderBottom: '1px solid #ccc'
      }}>
         AghiMessenger 
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.2rem',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#fff',
        gap: '1rem',
        justifyContent: 'space-between'
      }}>
        
        <div style={{
          display:'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          fontFamily: '"Poppins", sans-serif',
          color: '#333',
        }}>
          <button onClick={() => changePage('contacts')} style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#4a148c'
          }}>
            &lt;
          </button>
          <img 
          src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" 
          alt="Destinataire" 
          style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%' 
          }} 
        />
          {selectedContact}
        </div>
        
        <div style= {{
          alignItems: 'right'
        }}>
          <button onClick={logout} style= {{
            padding: 'rem 1rem',
            border: 'none',
            backgroundColor: '#4a148c',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Deconnecter
          </button>
        </div>
      
      </div>

      <div style={{ 
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 1rem',
            maxHeight: 'calc(100vh - 160px)'
          }}
      >
      {messages.map((msg, index) => {
        const currentDate = formatDateForHeader(msg.time);
        const previousDate = index > 0 ? formatDateForHeader(messages[index - 1].time) : null;
        const showDate = index === 0 || currentDate !== previousDate;
        const isUser = msg.sender === localStorage.getItem('username');

        return (
          <div key={index}>
            {showDate && (
              <div style={{
                textAlign: 'center',
                margin: '1rem 0 0.5rem',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: '#666'
              }}>
                {currentDate}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              <div 
                onClick={() => setSelectedIndex(index === selectedIndex ? null : index)}
                style={{ 
                  background: isUser ? '#d1e7dd' : '#bbdefb', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '20px', 
                  color: '#000',
                  maxWidth: '60%',
                  overflowWrap: 'break-word',
                  width: 'fit-content',
                  textAlign: 'left',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  cursor: 'pointer',
                  position: 'relative',
                  marginLeft: isUser ? '20%':'0',
                  marginRight: isUser ? '0': '20%',
                  marginBottom: selectedIndex === index ? '1.5rem' : '0.5rem'
                }}
              >
                {msg.text}
              
                {selectedIndex === index && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-1.2rem',
                    right: isUser ? '0' : 'unset',
                    left: isUser ? 'unset' : '0',
                    fontSize: '0.65rem',
                    color: '#666'
                  }}>
                    {new Date(msg.time).toLocaleTimeString([], {hour:'2-digit', minute: '2-digit'})}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      })}

      <div ref={bottomRef} />
      </div>

      <div style={{
        display: 'flex',
        padding: '1rem',
        borderTop: '1px solid #ccc',
        backgroundColor: '#e5e5f7',
        borderRadius: '10px'
      }}>
        <textarea 
          placeholder='Écrire...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            padding: '0.75rem',
            marginRight: '0.5rem',
            borderRadius: '10px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            lineHeight: '1.4',
            fontFamily: 'Arial'
          }}
        />

        <button onClick={sendMessage} 
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            backgroundColor: '#4a148c',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
          Envoyer
        </button>
      </div>
    </div> 
  )
}

export default App;