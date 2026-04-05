import { useState, useRef, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState('login');
  const bottomRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const loadMessages = async () => {
    try {
      const res = await fetch('http://localhost:3001/messages');
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
        const res = await fetch('http://localhost:3001/messages');
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data.map(msg => ({ ...msg, time: new Date(msg.time).toISOString() })));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);  
      }
    };

    loadMessages();
  }, []);

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
      const userMessage = {
        text: message,
        sender: 'user',
        time: now.toISOString()
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessage('');

      // Appelle le backend pour enregistrer
      try {
        await fetch('http://localhost:3001/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userMessage)
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi au backend :", error);
      }

      // Simule une réponse du bot
      setTimeout(() => {
        const botMessage = {
          text: 'Réponse bot : je teste ;)',
          sender: 'bot',
          time: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMessage]);

        // Envoie aussi la réponse bot au backend
        fetch('http://localhost:3001/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(botMessage)
        }).catch(err => console.error("Erreur envoi bot :", err));
      }, 1000);
    }
  };


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
        padding: '1rem',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#fff',
        gap: '1rem'
      }}>
        <img 
          src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" 
          alt="Destinataire" 
          style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%' 
          }} 
        />
        <div style={{
          fontWeight: 'bold',
          fontSize: '1.1rem',
          fontFamily: '"Poppins", sans-serif',
          color: '#333'
        }}>
          Bot
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
        const isUser = msg.sender === 'user';

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
                  marginBottom: '0.5rem'
                }}
              >
                {msg.text}
              
                {selectedIndex === index && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-1.2rem',
                    right: isUser ? '0' : 'unset',
                    left: isUser ? 'unset' : '0',
                    fontSize: '0.7rem',
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