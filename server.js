import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import ExcelJS from 'exceljs';
import jstat from 'jstat';

// const jstat = require('jstat');

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
    query += ' AND cod_tipo_presenca = ?';
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



// // Novo endpoint para o cálculo do Qui-Quadrado
// app.get('/quiquadrado', async (req, res) => {
//   const { ano, regiao, uf, municipio, catAdm, ies, curso, presenca, filtro, alpha } = req.query;

//   // Verificando se o filtro (variável) foi fornecido
//   if (!filtro) {
//     return res.status(400).json({ message: 'Filtro de variável (ex. "sexo") é necessário' });
//   }

//   // Verificando se o alfa foi fornecido
//   if (!alpha) {
//     return res.status(400).json({ message: 'Alfa (nível de significância) é necessário' });
//   }

//   let query = `
//       SELECT 
//           nota_geral, ${filtro}
//       FROM 
//           curso_notas 
//       WHERE 
//           cod_tipo_presenca = '555' AND 1=1`;

//   const params = [];

//   // Adicionando condições dinamicamente com base nos filtros fornecidos
//   if (ano) {
//     query += ' AND ano = ?';
//     params.push(ano);
//   }
//   if (regiao) {
//     query += ' AND dsc_regiao = ?';
//     params.push(regiao);
//   }
//   if (uf) {
//     query += ' AND dsc_uf = ?';
//     params.push(uf);
//   }
//   if (municipio) {
//     query += ' AND dsc_municipio = ?';
//     params.push(municipio);
//   }
//   if (catAdm) {
//     query += ' AND dsc_cat_adm = ?';
//     params.push(catAdm);
//   }
//   if (ies) {
//     query += ' AND cod_ies = ?';
//     params.push(ies);
//   }
//   if (curso) {
//     query += ' AND dsc_grupo = ?';
//     params.push(curso);
//   }
//   if (presenca) {
//     query += ' AND cod_tipo_presenca = ?';
//     params.push(presenca);
//   }

//   try {
//     const [rows] = await db.query(query, params);
//     if (rows.length === 0) {
//       return res.status(404).json({ message: 'Nenhum dado encontrado para os filtros fornecidos' });
//     }

//     // Extraímos as notas e aplicamos o filtro de outliers
//     const notas = rows.map(row => row.nota_geral);
//     const { valoresSemOutliers, outliers } = findOutliers(notas);

//     // Filtramos os dados para pegar as linhas sem os outliers
//     const filteredData = rows.filter(row => valoresSemOutliers.includes(row.nota_geral));

//     // Agora calculamos o qui-quadrado com base na variável fornecida
//     const chiSquareResult = calculateChiSquare(filteredData, filtro, parseFloat(alpha));

//     // Retornamos a resposta com os resultados
//     res.status(200).json({
//       valoresSemOutliers,
//       outliers,
//       chiSquare: {
//         chiSquared: chiSquareResult.chiSquared,
//         degreesOfFreedom: chiSquareResult.degreesOfFreedom,
//         criticalValue: chiSquareResult.criticalValue,
//         rejectNullHypothesis: chiSquareResult.rejectNullHypothesis
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Erro ao buscar os dados', error: error.message });
//   }
// });


// Função para encontrar os outliers (boxplot)
function findOutliers(data) {
  const sortedValues = [...data].sort((a, b) => a - b);
  const q1Index = Math.floor(sortedValues.length / 4);
  const q3Index = Math.floor((sortedValues.length * 3) / 4);
  const q1 = sortedValues[q1Index];
  const q3 = sortedValues[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Identificar os outliers
  const outliers = sortedValues.filter(val => val < lowerBound || val > upperBound);

  // Filtrar os valores dentro do intervalo aceitável
  const valoresSemOutliers = sortedValues.filter(val => val >= lowerBound && val <= upperBound);

  return { valoresSemOutliers, outliers };
}

// Função para calcular o teste qui-quadrado de contingência
function chiSquareContingency(observed) {
    // Calcular totais das linhas e colunas
    const rowTotals = observed.map(row => row.reduce((sum, val) => sum + val, 0));
    const colTotals = observed[0].map((_, colIndex) => observed.reduce((sum, row) => sum + row[colIndex], 0));
    const total = rowTotals.reduce((sum, val) => sum + val, 0);

    // Calcular frequências esperadas
    const expected = observed.map((row, rowIndex) =>
        row.map((_, colIndex) => (rowTotals[rowIndex] * colTotals[colIndex]) / total)
    );

    // Calcular a estatística qui-quadrado
    let chi2 = 0;
    for (let i = 0; i < observed.length; i++) {
        for (let j = 0; j < observed[i].length; j++) {
            if (expected[i][j] !== 0) {
                chi2 += Math.pow(observed[i][j] - expected[i][j], 2) / expected[i][j];
            }
        }
    }

    // Calcular graus de liberdade
    const dof = (observed.length - 1) * (observed[0].length - 1);

    // Calcular o valor-p usando a CDF da distribuição qui-quadrado
    const pValue = 1 - jstat.chisquare.cdf(chi2, dof);

    return { chi2, pValue, dof, expected };
}

// Endpoint para análise qui-quadrado
app.get('/quiquadrado', async (req, res) => {
  const { ano, regiao, uf, municipio, catAdm, ies, curso, presenca, variavel, alfa = 0.05 } = req.query;

  if (!variavel) {
      return res.status(400).json({ message: 'O parâmetro "variavel" é obrigatório' });
  }

  const colunasValidas = ['sexo', 'nota_geral', 'outro_nome_de_coluna'];
  if (!colunasValidas.includes(variavel)) {
      return res.status(400).json({ message: `A coluna '${variavel}' não é válida. Escolha entre: ${colunasValidas.join(', ')}` });
  }

  try {
      // Query sem agrupamento
      let querySemAgrupamento = `SELECT ${variavel}, nota_geral FROM \`mktd0358_enade_pcc\`.\`curso_notas\` WHERE 1 = 1`;
      const params = [];

      if (ano) querySemAgrupamento += ' AND ano = ?', params.push(ano);
      if (regiao) querySemAgrupamento += ' AND regiao = ?', params.push(regiao);
      if (uf) querySemAgrupamento += ' AND uf = ?', params.push(uf);
      if (municipio) querySemAgrupamento += ' AND dsc_municipio = ?', params.push(municipio);
      if (catAdm) querySemAgrupamento += ' AND catAdm = ?', params.push(catAdm);
      if (ies) querySemAgrupamento += ' AND ies = ?', params.push(ies);
      if (curso) querySemAgrupamento += ' AND dsc_grupo = ?', params.push(curso);
      if (presenca) querySemAgrupamento += ' AND cod_tipo_presenca = ?', params.push(presenca);

      const [resultadosSemAgrupamento] = await db.query(querySemAgrupamento, params);

      const valoresNotas = resultadosSemAgrupamento.map(row => row.nota_geral);
      const { valoresSemOutliers } = findOutliers(valoresNotas);

      let queryComAgrupamento = `
      SELECT ${variavel}, 
             CASE
                 WHEN nota_geral < 50 THEN 'BAIXO'
                 WHEN nota_geral >= 50 AND nota_geral < 80 THEN 'MEDIO'
                 ELSE 'ALTO'
             END AS faixa_nota,
             COUNT(*) as count
      FROM \`mktd0358_enade_pcc\`.\`curso_notas\`
      WHERE 1 = 1
      `;
  
      const params_agrp = [];
      
      // Adicionando filtros para cada parâmetro recebido
      if (ano) {
          queryComAgrupamento += ' AND ano = ?';
          params_agrp.push(ano);
      }
      if (regiao) {
          queryComAgrupamento += ' AND regiao = ?';
          params_agrp.push(regiao);
      }
      if (uf) {
          queryComAgrupamento += ' AND uf = ?';
          params_agrp.push(uf);
      }
      if (municipio) {
          queryComAgrupamento += ' AND dsc_municipio = ?';
          params_agrp.push(municipio);
      }
      if (catAdm) {
          queryComAgrupamento += ' AND catAdm = ?';
          params_agrp.push(catAdm);
      }
      if (ies) {
          queryComAgrupamento += ' AND ies = ?';
          params_agrp.push(ies);
      }
      if (curso) {
          queryComAgrupamento += ' AND dsc_grupo = ?';
          params_agrp.push(curso);
      }
      if (presenca) {
          queryComAgrupamento += ' AND cod_tipo_presenca = ?';
          params_agrp.push(presenca);
      }
      
      // Filtrando para remover os outliers da consulta com agrupamento
      const valoresNumericos = valoresSemOutliers.filter(val => typeof val === 'number');
      if (valoresNumericos.length > 0) {
          queryComAgrupamento += ' AND ROUND(nota_geral, 1) IN (' + valoresNumericos.map(() => '?').join(', ') + ')';
          params_agrp.push(...valoresNumericos);
      }
      
      // Adicionando agrupamento e ordenação
      queryComAgrupamento += `
          GROUP BY ??, faixa_nota
          ORDER BY ??, faixa_nota
      `;
      
      params_agrp.push(variavel, variavel);
      
      // Agora, a execução da consulta:
      const [resultados] = await db.query(queryComAgrupamento, params_agrp);
  
      // Construir tabela de contingência
      const tabelaContingencia = {};
      for (const row of resultados) {
          const varValue = row[variavel];
          const faixa = row.faixa_nota;
          const count = row.count;

          if (!tabelaContingencia[varValue]) {
              tabelaContingencia[varValue] = {};
          }

          tabelaContingencia[varValue][faixa] = count;
      }

      const tabelaContingenciaFiltrada = Object.fromEntries(
          Object.entries(tabelaContingencia).filter(([_, valores]) => Object.values(valores).some(count => count > 0))
      );

      if (Object.keys(tabelaContingenciaFiltrada).length < 2) {
          return res.status(400).json({ message: "Não há dados suficientes para realizar o teste." });
      }

      const tabelaContingenciaArray = Object.values(tabelaContingenciaFiltrada).map(v => [
          v.BAIXO || 0,
          v.MEDIO || 0,
          v.ALTO || 0
      ]);

      const tabelaContingenciaArrayFiltrada = tabelaContingenciaArray.filter(row => row.some(val => val > 0));

      if (tabelaContingenciaArrayFiltrada.length < 2) {
          return res.status(400).json({ message: "Não há dados suficientes para realizar o teste qui-quadrado." });
      }

      // Realizar o teste qui-quadrado de contingência
      const { chi2, pValue, dof, expected } = chiSquareContingency(tabelaContingenciaArrayFiltrada);
      const resultadoSignificativo = pValue < alfa;

      const resposta = {
          qui2: parseFloat(chi2.toFixed(2)),
          valor_p: parseFloat(pValue.toFixed(2)),
          graus_de_liberdade: dof,
          frequencias_esperadas: expected,
          resultado_significativo: resultadoSignificativo
      };

      res.json(resposta);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao processar a requisição' });
  }
});


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
