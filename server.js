const { Pool } = require('pg'); // Para conectar ao PostgreSQL
const cors = require('cors');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,          
  user: process.env.DB_USER,          
  password: process.env.DB_PASSWORD,  
  database: process.env.DB_NAME,      
  port: process.env.DB_PORT
});

app.use(cors());
app.use(express.json());

// API ANO
app.get('/api/ano', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT DISTINCT ano FROM dim_ano;');
    res.json(rows); // Retorna os anos
  } catch (error) {
    console.error('Erro ao buscar ano:', error);
    res.status(500).json({ error: 'Erro ao buscar ano no banco de dados.' });
  }
});

// API IES
// http://localhost:3001/api/ies/2022
app.get('/api/ies/:id', async (req, res) => {

  if (!req.params.id) {
    return res.status(400).json({ error: 'O parâmetro "ano" é obrigatório.' });
  }

  try {
    const { rows } = await pool.query('SELECT DISTINCT COD_IES FROM DIM_CURSO CURSO LEFT JOIN DIM_ANO ANO ON ANO.ID = CURSO.ID_ANO WHERE ANO.ANO = $1 LIMIT 10', [req.params.id]);
    res.json(rows); // Retorna os anos
  } catch (error) {
    console.error('Erro ao buscar ies:', error);
    res.status(500).json({ error: 'Erro ao buscar ies no banco de dados.' });
  }
});


// API CURSO
// http://localhost:3001/api/curso/2022/1
app.get('/api/curso/:year/:ies', async (req, res) => {

  if (!req.params.year || !req.params.year) {
    return res.status(400).json({ error: 'O parâmetro "ano" e "ies" é obrigatório.' });
  }

  try {
    const { rows } = await pool.query('SELECT DISTINCT COD_CURSO FROM DIM_CURSO CURSO LEFT JOIN DIM_ANO ANO ON ANO.ID = CURSO.ID_ANO WHERE ANO.ANO = $1 AND COD_IES = $2 LIMIT 10', [req.params.year, req.params.ies]);
    res.json(rows); // Retorna os anos
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    res.status(500).json({ error: 'Erro ao buscar curso no banco de dados.' });
  }
});

// API CONDIÇÃO DE SALA
app.get('/api/cond_sala/:year/:ies/:curso', async (req, res) => {

  if (!req.params.year || !req.params.ies || !req.params.curso) {
    return res.status(400).json({ error: 'O parâmetro "ano" e "ies" é obrigatório.' });
  }

  try {
    const { rows } = await pool.query('SELECT DISTINCT COD_CURSO FROM DIM_CURSO CURSO LEFT JOIN DIM_ANO ANO ON ANO.ID = CURSO.ID_ANO WHERE ANO.ANO = $1 AND COD_IES = $2 LIMIT 10', [req.params.year, req.params.ies]);
    res.json(rows); // Retorna os anos
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    res.status(500).json({ error: 'Erro ao buscar curso no banco de dados.' });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
