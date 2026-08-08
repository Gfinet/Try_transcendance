import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

import '../App.css'

function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => { setCredentials({ ...credentials, [e.target.name]: e.target.value }) };
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) navigate('/dashboard');
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Tentative de connexion avec :", credentials, JSON.stringify(credentials));
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            })
            const data = await response.json();

            if (response.ok && data.success)
            {
                localStorage.setItem('token', data.token);
                // localStorage.setItem('isAuthenticated', 'true');
                // localStorage.setItem('username', data.message);
                navigate('/dashboard')
            } 
            else alert("Erreur : " + data.message);
        } 
        catch (error) {
        // Si le back plante
            console.error("Erreur réseau :", error);
            alert("Impossible de contacter le serveur.");
        }
    };

    return (
        
        <div style={styles.container}>
        <form onSubmit={handleSubmit} style={styles.form}>
            <h2>Connexion</h2>
            
            <div style={styles.inputGroup}>
            <label>username</label>
            <input 
                type="text" 
                name="username" 
                value={credentials.username} 
                onChange={handleChange} 
                required 
                style={styles.input}
            />
            </div>

            <div style={styles.inputGroup}>
            <label>Mot de passe</label>
            <input 
                type="password" 
                name="password" 
                value={credentials.password} 
                onChange={handleChange} 
                required 
                style={styles.input}
            />
            </div>

            <button type="submit" style={styles.button}>Se connecter</button>
        </form>
        </div>
    )
}

const styles = {
    title : {
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
    },
    container: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
        },
    form: { 
        padding: '2rem', 
        border: '1px solid #ccc', 
        borderRadius: '10px', 
        width: '300px', 
        background: '#000' 
        },
    inputGroup: { 
        marginBottom: '1rem', 
        textAlign: 'left' 
        },
    input: { 
        width: '100%', 
        padding: '8px', 
        marginTop: '5px', 
        boxSizing: 'border-box' 
        },
    button: { 
        width: '100%', 
        padding: '10px', 
        background: '#007bff', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer' 
    },
};



export default Login

