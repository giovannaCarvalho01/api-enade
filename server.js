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
// http://localhost:3001/api/cond_sala/2022/65435
app.get('/api/cond_sala/:year/:curso', async (req, res) => {

  if (!req.params.year || !req.params.curso) {
    return res.status(400).json({ error: 'O parâmetro "year" e "curso" é obrigatório.' });
  }

  try {
    const query = `
      SELECT A.ANO, C.COD_CURSO, AVAL.COND_SALA, NT.NOTA
      FROM FATO_NOTAS NT
      LEFT JOIN DIM_ANO A ON A.ID = NT.ID_ANO
      LEFT JOIN DIM_CURSO C ON C.ID = NT.ID_CURSO
      LEFT JOIN DIM_AVAL_CURSO AVAL ON AVAL.ID_CURSO = C.ID
      WHERE NT.TIPO_PRESENCA = '555'
        AND C.COD_CURSO = $1
        AND A.ANO = $2
      LIMIT 10
    `;
    const { rows } = await pool.query(query, [req.params.curso, req.params.year]);

    res.json(rows);
    
  } catch (error) {
    console.error('Erro ao buscar condição do curso:', error);
    res.status(500).json({ error: 'Erro ao buscar condição do curso no banco de dados.' });
  }
});

function calculatePercentile(arr, percentile) {
  // Ordena o array de menor para maior
  arr.sort((a, b) => a - b);
  
  // Calcula a posição do percentil no array ordenado
  const index = (percentile / 100) * (arr.length - 1);
  
  // Se o índice for inteiro, retorna o valor no índice
  if (Number.isInteger(index)) {
    return arr[index];
  } else {
    // Caso contrário, retorna a média entre os dois valores mais próximos
    const lower = arr[Math.floor(index)];
    const upper = arr[Math.ceil(index)];
    return (lower + upper) / 2;
  }
}

// http://localhost:3001/api/boxplot/2022/65435
app.get('/api/boxplot/:ano/:curso', async (req, res) => {

  const { ano, curso } = req.params;
  
  // Query SQL para obter os dados das notas
  const query = `
    SELECT nota
    FROM fato_notas f
    JOIN dim_ano a ON f.id_ano = a.id
    JOIN dim_curso c ON f.id_curso = c.id
    WHERE a.ano = $1 AND c.cod_curso = $2 AND f.tipo_presenca = '555'
  `;
  
  try {
    const result =  await pool.query(query, [ano, curso]);
    const notas = result.rows.map(row => row.nota);

    // Calcular os quartis, IQR e identificar outliers
    const Q1 = calculatePercentile(notas, 25);
    const Q3 = calculatePercentile(notas, 75);
    const IQR = Q3 - Q1;
    const lowerFence = Q1 - 1.5 * IQR;
    const upperFence = Q3 + 1.5 * IQR;

    const outliers = notas.filter(nota => nota < lowerFence || nota > upperFence);

    // Montar a resposta para o boxplot
    res.json({
      data: {
        box: [Q1, Q3, IQR],
        outliers: outliers,
      },
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Erro ao buscar os dados');
  }
});



app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});