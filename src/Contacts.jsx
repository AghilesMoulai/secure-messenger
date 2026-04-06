import { useState, useEffect } from "react";

function Contacts({onSelectedContact, onLogout}) {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        const loadContacts = async () => {
            try {
                const res = await fetch('http://localhost:3001/users', {
                    headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
                });

                const data = await res.json();
                if(Array.isArray(data)){
                    setContacts(data);
                }
            } catch (error) {
                console.error('erreur lors de la récupération des contacts', error);
            }
        };

        loadContacts();
    }, []);

    return (
        <div style={{
            fontFamily: 'Arial',
            backgroundColor: '#e5e5f7',
            height: '100vh',
            width: '100vw',
            display: 'column',
            overflow: 'hidden'
        }}>
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
                justifyContent: 'space-between'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    fontFamily: '"Poppins", sans-serif',
                    color: '#333'
                }}>
                    <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="Photo de profile" style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%' 
                    }}/>
                    {localStorage.getItem('username')}
                </div>
                <button onClick={onLogout} style={{
                    padding: 'rem 1rem',
                    border: 'none',
                    backgroundColor: '#4a148c',
                    color: '#fff',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                    Déconnecter
                </button>
            </div>

            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '1rem'
            }}>
                {contacts.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: '#666',
                        marginTop: '2rem'
                    }}>
                        Aucun contact pour l'instant
                    </div>
                ) : (
                    contacts.map((contact, index) => (
                        <div
                            key={index}
                            onClick={() => onSelectedContact(contact.username, contact.public_key)}
                            style={{
                                display: 'flex',
                                alignItems:'center',
                                gap: '1rem',
                                padding: '1rem',
                                marginBottom: '0.5rem',
                                backgroundColor: '#fff',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: '#4a148c',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '1.2rem'
                            }}>
                                {contact.username[0].toUpperCase()}
                            </div>
                            <div style={{
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                fontFamily: '"Poppins", sans-serif',
                                color: '#333'
                            }}>
                                {contact.username}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Contacts;