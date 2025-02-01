import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import ExcelJS from 'exceljs';

dotenv.config();

const app = express();
const PORT = 3001;

// Configuração do middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
}));
app.use(express.json());

// Configuração da conexão com o banco de dados
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 255,
  queueLimit: 0,
});

// Rota GET Ano
app.get('/anos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT ano FROM curso_notas'); // Substitua 'sua_tabela' pelo nome da sua tabela
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar dados do banco de dados');
  }
});

// Rota GET Regiao com parâmetro 'ano'
app.get('/regiao/:ano', async (req, res) => {
    const ano = req.params.ano; // Obtém o valor do parâmetro 'ano' na URL
    
    try {
      // Consulta SQL com parâmetro 'ano' na cláusula WHERE
      const [rows] = await db.query('SELECT DISTINCT dsc_regiao_completo FROM curso_notas WHERE ano = ?', [ano]);
      
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar dados do banco de dados');
    }
});
  

// Rota GET UF com parâmetro 'ano' e 'regiao'
app.get('/uf/:ano/:regiao', async (req, res) => {
    const ano = req.params.ano; // Obtém o valor do parâmetro 'ano' na URL
    const regiao = req.params.regiao; // Obtém o valor do parâmetro 'ano' na URL
    
    try {
      // Consulta SQL com parâmetro 'ano' na cláusula WHERE
      const [rows] = await db.query('SELECT DISTINCT dsc_uf FROM vw_curso_completo WHERE ano = ? AND dsc_regiao_completo = ?', [ano, regiao]);
      
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar dados do banco de dados');
    }
});

// Rota GET Municipio com parâmetro 'ano' e 'regiao' e 'uf'
app.get('/municipio/:ano/:regiao/:uf', async (req, res) => {
    const ano = req.params.ano; // Obtém o valor do parâmetro 'ano' na URL
    const regiao = req.params.regiao; // Obtém o valor do parâmetro 'regiao' na URL
    const uf = req.params.uf; // Obtém o valor do parâmetro 'uf' na URL
    
    try {
      // Consulta SQL com parâmetro 'ano' na cláusula WHERE
      const [rows] = await db.query('SELECT DISTINCT dsc_municipio FROM vw_curso_completo WHERE ano = ? AND dsc_regiao_completo = ? AND dsc_uf = ?', [ano, regiao, uf]);
      
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar dados do banco de dados');
    }
});

// Rota GET Categoria administrativa com parâmetro 'ano' e 'regiao' e 'uf'
app.get('/cat_adm/:ano/:regiao/:uf/:municipio', async (req, res) => {
    const ano = req.params.ano; // Obtém o valor do parâmetro 'ano' na URL
    const regiao = req.params.regiao; // Obtém o valor do parâmetro 'regiao' na URL
    const uf = req.params.uf; // Obtém o valor do parâmetro 'uf' na URL
    const municipio = req.params.municipio; // Obtém o valor do parâmetro 'uf' na URL
    
    try {
      // Consulta SQL com parâmetro 'ano' na cláusula WHERE
      const [rows] = await db.query('SELECT DISTINCT dsc_cat_adm FROM vw_curso_completo WHERE ano = ? AND dsc_regiao_completo = ? AND dsc_uf = ? AND dsc_municipio = ?', [ano, regiao, uf, municipio]);
      
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar dados do banco de dados');
    }
});

// Rota GET IES administrativa com parâmetro 'ano' e 'regiao' e 'uf', 'MUNICIPIO' e cattegoria adm
app.get('/ies/:ano/:regiao/:uf/:municipio/:cat_adm', async (req, res) => {
    const ano = req.params.ano; // Obtém o valor do parâmetro 'ano' na URL
    const regiao = req.params.regiao; // Obtém o valor do parâmetro 'regiao' na URL
    const uf = req.params.uf; // Obtém o valor do parâmetro 'uf' na URL
    const municipio = req.params.municipio; // Obtém o valor do parâmetro 'uf' na URL
    const cat_adm = req.params.cat_adm; // Obtém o valor do parâmetro 'uf' na URL
    
    try {
      // Consulta SQL com parâmetro 'ano' na cláusula WHERE
      const [rows] = await db.query('SELECT DISTINCT cod_ies FROM vw_curso_completo WHERE ano = ? AND dsc_regiao_completo = ? AND dsc_uf = ? AND dsc_municipio = ? AND dsc_cat_adm = ?', [ano, regiao, uf, municipio, cat_adm]);
      
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar dados do banco de dados');
    }
});

// Rota GET Grupo com parâmetro 'ano' e 'regiao' e 'uf', 'municipio' e 'categoria adm'
app.get('/grupo/:ano/:regiao/:uf/:municipio/:cat_adm/:cod_ies', async (req, res) => {
    const ano = req.params.ano; // Obtém o valor do parâmetro 'ano' na URL
    const regiao = req.params.regiao; // Obtém o valor do parâmetro 'regiao' na URL
    const uf = req.params.uf; // Obtém o valor do parâmetro 'uf' na URL
    const municipio = req.params.municipio; // Obtém o valor do parâmetro 'uf' na URL
    const cat_adm = req.params.cat_adm; // Obtém o valor do parâmetro 'uf' na URL
    const cod_ies = req.params.cod_ies; // Obtém o valor do parâmetro 'uf' na URL
    
    try {
      // Consulta SQL com parâmetro 'ano' na cláusula WHERE
      const [rows] = await db.query('SELECT DISTINCT dsc_grp FROM vw_curso_completo WHERE ano = ? AND dsc_regiao_completo = ? AND dsc_uf = ? AND dsc_municipio = ? AND dsc_cat_adm = ? AND cod_ies = ?', [ano, regiao, uf, municipio, cat_adm, cod_ies]);
      
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar dados do banco de dados');
    }
});


// FILTER

app.get('/filter', async (req, res) => {
    // Desestruturando os parâmetros da query string
    const { cod_ies, cat_adm, municipio, regiao, uf, grp, ano, coluna } = req.query;
  
    // Definindo as colunas permitidas para evitar injeção de SQL
    const colunasPermitidas = [
      'dsc_regiao',
      'dsc_cat_adm',
      'dsc_municipio',
      'dsc_uf',
      'dsc_grupo',
      'cod_ies',
      'ano'
    ];
  
    // Validando se a coluna passada é uma das colunas permitidas
    const colunaSelecionada = colunasPermitidas.includes(coluna) ? coluna : 'dsc_regiao_completo';
  
    // Inicia a consulta SQL base
    let query = `SELECT DISTINCT ${colunaSelecionada} FROM curso_notas WHERE cod_tipo_presenca = '555' AND 1=1`;  // Usa a coluna selecionada
  
    // Array para armazenar os parâmetros da consulta
    const params = [];
  
    // Adiciona as condições para os outros filtros
    if (cod_ies) {
      query += ' AND cod_ies = ?';
      params.push(cod_ies);
    }
  
    if (cat_adm) {
      query += ' AND dsc_cat_adm = ?';
      params.push(cat_adm);
    }
  
    if (municipio) {
      query += ' AND dsc_municipio = ?';
      params.push(municipio);
    }
  
    if (regiao) {
      query += ' AND dsc_regiao = ?';
      params.push(regiao);
    }
  
    if (uf) {
      query += ' AND dsc_uf = ?';
      params.push(uf);
    }
  
    if (grp) {
      query += ' AND dsc_grupo = ?';
      params.push(grp);
    }
  
    if (ano) {
      query += ' AND ano = ?';
      params.push(ano);
    }
  
    try {
      // Executa a consulta com os parâmetros dinâmicos
      const [rows] = await db.query(query, params);
      res.json(rows);  // Retorna os resultados filtrados
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar dados do banco de dados');
    }
  });

//   baixar notas
app.get('/notas/download', async (req, res) => {
    // Pegando os parâmetros de filtro da query string
    const { cod_ies, cat_adm, municipio, regiao, uf, grp, ano, presenca } = req.query;
  
    // Inicia a consulta SQL
    let query = 'SELECT * FROM curso_notas WHERE 1=1';
    const params = [];
  
    // Adicionando filtros à consulta
    if (cod_ies) {
      query += ' AND cod_ies = ?';
      params.push(cod_ies);
    }
  
    if (cat_adm) {
      query += ' AND dsc_cat_adm = ?';
      params.push(cat_adm);
    }
  
    if (municipio) {
      query += ' AND dsc_municipio = ?';
      params.push(municipio);
    }
  
    if (regiao) {
      query += ' AND dsc_regiao = ?';
      params.push(regiao);
    }
  
    if (uf) {
      query += ' AND dsc_uf = ?';
      params.push(uf);
    }
  
    if (grp) {
      query += ' AND dsc_grupo = ?';
      params.push(grp);
    }
  
    if (ano) {
      query += ' AND ano = ?';
      params.push(ano);
    }
  
    // Filtro para tipo_presenca, se fornecido
    if (presenca) {
      query += ' AND cod_tipo_presenca = ?';
      params.push(presenca);
    }
  
    try {
      // Executa a consulta SQL para pegar os dados
      const [rows] = await db.query(query, params);
  
      // Cria um novo workbook e uma worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Notas');
  
      // Adiciona as colunas no arquivo Excel
      if (rows.length > 0) {
        const colunas = Object.keys(rows[0]);
        worksheet.columns = colunas.map(coluna => ({ header: coluna, key: coluna }));
  
        // Adiciona os dados na worksheet
        rows.forEach(row => {
          worksheet.addRow(row);
        });
  
        // Define o nome do arquivo Excel
        const nomeArquivo = `notas_${Date.now()}.xlsx`;
  
        // Define os headers para download do arquivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${nomeArquivo}`);
  
        // Envia o arquivo Excel para o cliente
        await workbook.xlsx.write(res);
        res.end();
      } else {
        res.status(404).send('Nenhum dado encontrado para os filtros fornecidos');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao gerar o arquivo Excel');
    }
  });

// ENDPOINT TABLE
app.get('/notas', async (req, res) => {
  // Pegando os parâmetros de filtro da query string
  const { cod_ies, cat_adm, municipio, regiao, uf, grp, ano, presenca } = req.query;

  // Inicia a consulta SQL
  let query = `SELECT * FROM curso_notas WHERE 1=1`;
  const params = [];

  // Adicionando filtros à consulta
  if (cod_ies) {
      query += ' AND cod_ies = ?';
      params.push(cod_ies);
  }

  if (cat_adm) {
      query += ' AND dsc_cat_adm = ?';
      params.push(cat_adm);
  }

  if (municipio) {
      query += ' AND dsc_municipio = ?';
      params.push(municipio);
  }

  if (regiao) {
      query += ' AND dsc_regiao = ?';
      params.push(regiao);
  }

  if (uf) {
      query += ' AND dsc_uf = ?';
      params.push(uf);
  }

  if (grp) {
      query += ' AND dsc_grupo = ?';
      params.push(grp);
  }

  if (ano) {
      query += ' AND ano = ?';
      params.push(ano);
  }

  // Filtro para tipo_presenca, se fornecido
  if (presenca) {
      query += ' AND cod_tipo_presenca = ?';
      params.push(presenca);
  }

  try {
      // Executa a consulta SQL para pegar os dados
      const [rows] = await db.query(query, params);

      // Verifica se encontrou registros
      if (rows.length > 0) {
          res.status(200).json(rows); // Retorna os dados em formato JSON
      } else {
          res.status(404).json({ message: 'Nenhum dado encontrado para os filtros fornecidos' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar os dados', error: error.message });
  }
});

app.get('/LineChart', async (req, res) => {
  // Pegando os parâmetros da query string
  const { regiao, uf, municipio, catAdm, ies, curso, presenca } = req.query;
  
  // Cria a consulta SQL base
  let query = `
      SELECT 
          ano, 
          AVG(nota_geral) AS media_nota_geral 
      FROM 
          curso_notas 
      WHERE 
          1=1`;

  // Array de parâmetros para consulta
  const params = [];

  // Adicionando condições dinamicamente com base nos filtros fornecidos
  // if (ano) {
  //     query += ' AND ano = ?';
  //     params.push(ano);
  // }
  if (regiao) {
      query += ' AND dsc_regiao = ?';
      params.push(regiao);
  }
  if (uf) {
      query += ' AND dsc_uf = ?';
      params.push(uf);
  }
  if (municipio) {
      query += ' AND dsc_municipio = ?';
      params.push(municipio);
  }
  if (catAdm) {
      query += ' AND dsc_cat_adm = ?';
      params.push(catAdm);
  }
  if (ies) {
      query += ' AND cod_ies = ?';
      params.push(ies);
  }
  if (curso) {
      query += ' AND dsc_grupo = ?';
      params.push(curso);
  }

  // Filtro para tipo_presenca, se fornecido
  if (presenca) {
    query += ' AND cod_tipo_presenca = ?';
    params.push(presenca);
  }

  // Adicionar agrupamento por ano
  query += ' GROUP BY ano';

  try {
      // Executa a consulta no banco de dados
      const [rows] = await db.query(query, params);

      // Verifica se encontrou registros
      if (rows.length > 0) {
          res.status(200).json(rows); // Retorna os dados encontrados
      } else {
          res.status(404).json({ message: 'Nenhum dado encontrado para os filtros fornecidos' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar os dados', error: error.message });
  }
});

// Novo endpoint para identificar e remover outliers
app.get('/boxplot', async (req, res) => {

  const { ano, regiao, uf, municipio, catAdm, ies, curso, presenca } = req.query;


  let query = `
      SELECT 
          nota_geral 
      FROM 
          curso_notas 
      WHERE 
          cod_tipo_presenca = '555' AND 1=1`;

  const params = [];

  // Adicionando condições dinamicamente com base nos filtros fornecidos
  if (ano) {
    query += ' AND ano = ?';
    params.push(ano);
  }
  if (regiao) {
      query += ' AND dsc_regiao = ?';
      params.push(regiao);
  }
  if (uf) {
      query += ' AND dsc_uf = ?';
      params.push(uf);
  }
  if (municipio) {
      query += ' AND dsc_municipio = ?';
      params.push(municipio);
  }
  if (catAdm) {
      query += ' AND dsc_cat_adm = ?';
      params.push(catAdm);
  }
  if (ies) {
      query += ' AND cod_ies = ?';
      params.push(ies);
  }
  if (curso) {
      query += ' AND dsc_grupo = ?';
      params.push(curso);
  }

  // Filtro para tipo_presenca, se fornecido
  if (presenca) {
    query += ' AND cod_tipo_presenca = ?';
    params.push(presenca);
  }

  try {
    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum dado encontrado para os filtros fornecidos' });
    }

    const valores = rows.map(row => row.nota_geral);

    // Cálculo do IQR (Interquartile Range)
    const sortedValues = [...valores].sort((a, b) => a - b);
    const q1Index = Math.floor((sortedValues.length / 4));
    const q3Index = Math.floor((sortedValues.length * 3) / 4);
    const q1 = sortedValues[q1Index];
    const q3 = sortedValues[q3Index];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Identificar os outliers
    const outliers = sortedValues.filter(val => {
      if (typeof val !== 'number' || isNaN(val)) {
        return false; // Ignorar valores não numéricos
      }
      return val < lowerBound || val > upperBound;
    });

    // Filtrar os valores dentro do intervalo aceitável
    const valoresSemOutliers = sortedValues.filter(val => val >= lowerBound && val <= upperBound);

    // Retornar os resultados
    res.status(200).json({
      valores: valoresSemOutliers,
      outliers,
      limites: { q1, q3, lowerBound, upperBound }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar os dados', error: error.message });
  }
});

app.get('/graficos', async (req, res) => {
  const { ano, regiao, uf, municipio, catAdm, ies, curso, presenca, variavel } = req.query;

  console.log(req.query);

  if (!variavel) {
    return res.status(400).json({ message: 'O parâmetro "variavel" é obrigatório' });
  }

  let query = `
    SELECT 
        ${variavel} AS variavel, 
        COUNT(*) AS quantidade, 
        COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM curso_notas 
            WHERE cod_tipo_presenca = '555' AND 1=1`;

  const params = [];

  // Filtros para o subquery (total)
  if (ano) {
    query += ' AND ano = ?';
    params.push(ano);
  }
  if (regiao) {
    query += ' AND dsc_regiao = ?';
    params.push(regiao);
  }
  if (uf) {
    query += ' AND dsc_uf = ?';
    params.push(uf);
  }
  if (municipio) {
    query += ' AND dsc_municipio = ?';
    params.push(municipio);
  }
  if (catAdm) {
    query += ' AND dsc_cat_adm = ?';
    params.push(catAdm);
  }
  if (ies) {
    query += ' AND cod_ies = ?';
    params.push(ies);
  }
  if (curso) {
    query += ' AND dsc_grupo = ?';
    params.push(curso);
  }
  if (presenca) {
    query += ' AND cod_tipo_presenca = ?';
    params.push(presenca);
  }

  query += `
        ) AS percentual 
    FROM curso_notas 
    WHERE 1=1`;

  // Filtros para a query principal
  if (ano) {
    query += ' AND ano = ?';
    params.push(ano);
  }
  if (regiao) {
    query += ' AND dsc_regiao = ?';
    params.push(regiao);
  }
  if (uf) {
    query += ' AND dsc_uf = ?';
    params.push(uf);
  }
  if (municipio) {
    query += ' AND dsc_municipio = ?';
    params.push(municipio);
  }
  if (catAdm) {
    query += ' AND dsc_cat_adm = ?';
    params.push(catAdm);
  }
  if (ies) {
    query += ' AND cod_ies = ?';
    params.push(ies);
  }
  if (curso) {
    query += ' AND dsc_grupo = ?';
    params.push(curso);
  }
  if (presenca) {
    query += ' AND tipo_presenca = ?';
    params.push(presenca);
  }

  query += `
    GROUP BY ${variavel};
  `;
  
  console.log(query);

  try {
    const [rows] = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum dado encontrado para os filtros fornecidos' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar os dados', error: error.message });
  }
});


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
