import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

// Configuração do Supabase
const supabaseUrl = 'https://yonxzkpeawyzeytbnslt.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// API ANO
app.get('/api/ano', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dim_ano')
      .select('ano');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar ano:', error);
    res.status(500).json({ error: 'Erro ao buscar ano no banco de dados.' });
  }
});

// API IES
// http://localhost:3001/api/ies/2022
app.get('/api/ies/:ano', async (req, res) => {
  const { ano } = req.params;

  if (!ano) {
    return res.status(400).json({ error: 'O parâmetro "ano" é obrigatório.' });
  }

  try {
    // Consultar a view que já tem o filtro para ano
    const { data, error } = await supabase
      .from('vw_ies_ano') // Consultando a view
      .select('cod_ies')
      .eq('ano', ano) // Filtrando pela coluna 'ano'
      .limit(10); // Limite de resultados se necessário

    if (error) throw error;

    res.json(data); // Retorna os dados da view
  } catch (error) {
    console.error('Erro ao buscar ies:', error);
    res.status(500).json({ error: 'Erro ao buscar ies no banco de dados.' });
  }
});

// API CURSO
// http://localhost:3001/api/curso/2022/1
app.get('/api/curso/:year/:ies', async (req, res) => {
  const { year, ies } = req.params;

  if (!year || !ies) {
    return res.status(400).json({ error: 'Os parâmetros "ano" e "ies" são obrigatórios.' });
  }

  try {
    // Consultar a view que já tem o filtro para ano e cod_ies
    const { data, error } = await supabase
      .from('vw_curso_ano_ies') // Consultando a view
      .select('cod_curso')
      .eq('ano', year) // Filtrando pelo ano
      .eq('cod_ies', ies) // Filtrando pela instituição de ensino
      .limit(10); // Limite de resultados

    if (error) throw error;

    res.json(data); // Retorna os cursos
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    res.status(500).json({ error: 'Erro ao buscar cursos no banco de dados.' });
  }
});


// API CONDIÇÃO DE SALA
// http://localhost:3001/api/cond_sala/2022/65435
app.get('/api/cond_sala/:year/:curso', async (req, res) => {
  const { year, curso } = req.params;

  if (!year || !curso) {
    return res.status(400).json({ error: 'Os parâmetros "year" e "curso" são obrigatórios.' });
  }

  try {
    // Consultar a view que já tem os filtros para ano, curso e tipo de presença
    const { data, error } = await supabase
      .from('vw_cond_sala') // Consultando a view
      .select()
      .eq('ano', year) // Filtrando pelo ano
      .eq('cod_curso', curso) // Filtrando pelo código do curso
      .limit(10); // Limite de resultados

    if (error) throw error;

    res.json(data); // Retorna a condição de sala
  } catch (error) {
    console.error('Erro ao buscar condição do curso:', error);
    res.status(500).json({ error: 'Erro ao buscar condição do curso no banco de dados.' });
  }
});


// API BOX PLOT
// http://localhost:3001/api/boxplot/2022/117004
app.get('/api/boxplot/:ano/:curso', async (req, res) => {
  const { ano, curso } = req.params;

  try {
    // Consultar a view que já tem a junção e os filtros para o tipo de presença '555'
    const { data, error } = await supabase
      .from('vw_cond_sala') // Consultando a view
      .select('nota')
      .eq('ano', ano) // Filtrando pelo ano
      .eq('cod_curso', curso) // Filtrando pelo código do curso
    
    if (error) throw error;

    const notas = data.map(row => row.nota);
    
    console.log('Notas:', notas);  // Verificar as notas obtidas

    // Ordenar as notas para calcular os quartis
    const sortedNotas = [...notas].sort((a, b) => a - b);

    const calculatePercentile = (arr, percentile) => {
      const index = (percentile / 100) * (arr.length - 1);
      if (Number.isInteger(index)) {
        return arr[index];
      } else {
        const lower = arr[Math.floor(index)];
        const upper = arr[Math.ceil(index)];
        return (lower + upper) / 2;
      }
    };

    const Q1 = calculatePercentile(sortedNotas, 25);
    const Q3 = calculatePercentile(sortedNotas, 75);
    const median = calculatePercentile(sortedNotas, 50);  // Mediana
    const IQR = Q3 - Q1;

    const min = sortedNotas[0];
    const max = sortedNotas[sortedNotas.length - 1];

    // Ajustar o cálculo de outliers
    const lowerFence = Q1 - 1.5 * IQR;
    const upperFence = Q3 + 1.5 * IQR;

    const outliers = notas.filter(nota => nota < lowerFence || nota > upperFence);

    console.log('Outliers:', outliers); // Verificar quais notas são identificadas como outliers

    res.json({
      data: {
        box: [min, Q1, median, Q3, max],  // Retorna os 5 valores do boxplot
        outliers: outliers,               // Retorna os outliers
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados para boxplot:', error);
    res.status(500).json({ error: 'Erro ao buscar os dados para boxplot.' });
  }
});

// app.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });

export default app;