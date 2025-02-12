import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import ExcelJS from 'exceljs';
import jstat from 'jstat';

dotenv.config();

const app = express();
const PORT = 3000;

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
  port: 3306,
  waitForConnections: true,
  connectionLimit: 255,
  queueLimit: 0,
});

app.get("/", (req, res) => res.send("Express on Vercel"));

// Rota GET Ano
app.get('/anos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT ano FROM curso_notas'); // Substitua 'sua_tabela' pelo nome da sua tabela
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

/// FILTER

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
    let query = 
    `SELECT DISTINCT 
    ${colunaSelecionada} 
    FROM curso_notas 
    WHERE 
    cod_tipo_presenca = '555' 
    AND 1=1
    `;  // Usa a coluna selecionada
  
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
    query += 
    `ORDER BY
    ${colunaSelecionada}
    ASC 
    `;
  
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
    let query = '';
    const params = [];

    // Condições específicas para o ano
    if (ano === '2022' || ano === '2021') {
      // Query para 2021 e 2022
      query = `SELECT 
                ano AS Ano,
                cod_ies AS 'Codigo da IES',
                dsc_cat_adm AS 'Categoria Administrativa',
                cod_curso AS 'Codigo do Curso',
                dsc_municipio AS 'Municipio',
                dsc_regiao AS 'Regiao',
                dsc_uf AS 'UF',
                cod_grupo AS 'Codigo do Grupo',
                dsc_grupo AS 'Curso',
                dsc_tipo_presenca AS 'Tipo de Presenca',
                nota_geral AS 'Nota Geral',
                CASE 
                  WHEN plano_ensino = 'NULL' THEN 'Não respondeu'
                  ELSE plano_ensino END AS 'Plano de Ensino',
                CASE 
                  WHEN cond_sala = 'NULL' THEN 'Não respondeu'
                  ELSE cond_sala END AS 'Condicao da Sala',
                CASE 
                  WHEN dsc_turno = 'NULL' THEN 'Não respondeu'
                  ELSE dsc_turno END AS 'Turno'
                FROM curso_notas 
                WHERE 1=1`;
    } else {
        // Query para outros anos
        query = 'SELECT * FROM curso_notas WHERE 1=1';
    }
  
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

app.get('/notas/download/csv', async (req, res) => {
  const { cod_ies, cat_adm, municipio, regiao, uf, grp, ano, presenca } = req.query;

  let query = '';
  const params = [];

  if (ano === '2022' || ano === '2021') {
    query = `SELECT 
              ano AS Ano,
              cod_ies AS 'Codigo da IES',
              dsc_cat_adm AS 'Categoria Administrativa',
              cod_curso AS 'Codigo do Curso',
              dsc_municipio AS 'Municipio',
              dsc_regiao AS 'Regiao',
              dsc_uf AS 'UF',
              cod_grupo AS 'Codigo do Grupo',
              dsc_grupo AS 'Curso',
              dsc_tipo_presenca AS 'Tipo de Presenca',
              nota_geral AS 'Nota Geral',
              CASE 
                WHEN plano_ensino = 'NULL' THEN 'Não respondeu'
                ELSE plano_ensino END AS 'Plano de Ensino',
              CASE 
                WHEN cond_sala = 'NULL' THEN 'Não respondeu'
                ELSE cond_sala END AS 'Condicao da Sala',
              CASE 
                WHEN dsc_turno = 'NULL' THEN 'Não respondeu'
                ELSE dsc_turno END AS 'Turno'
              FROM curso_notas 
              WHERE 1=1`;
  } else {
    query = 'SELECT * FROM curso_notas WHERE 1=1';
  }

  // Adicionando os filtros à consulta
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
  if (presenca) {
    query += ' AND cod_tipo_presenca = ?';
    params.push(presenca);
  }

  try {
    const [rows] = await db.query(query, params);
    
    if (rows.length > 0) {
      // Usando o 'parse' para gerar CSV a partir dos dados
      const csvData = parse(rows);
      
      const nomeArquivo = `notas_${Date.now()}.csv`;
      
      // Configurando o cabeçalho para o download do arquivo CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${nomeArquivo}`);
      
      // Envia o arquivo CSV para o cliente
      res.send(csvData);
    } else {
      res.status(404).send('Nenhum dado encontrado para os filtros fornecidos');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao gerar o arquivo CSV');
  }
});

// ENDPOINT TABLE
app.get('/notas', async (req, res) => {
  // Pegando os parâmetros de filtro da query string
  const { cod_ies, cat_adm, municipio, regiao, uf, grp, ano, presenca } = req.query;

    // Inicia a consulta SQL
    let query = '';
    const params = [];

    // Condições específicas para o ano
    if (ano === '2022' || ano === '2021') {
      // Query para 2021 e 2022
      query = `SELECT 
                ano AS Ano,
                cod_ies AS 'Codigo da IES',
                dsc_cat_adm AS 'Categoria Administrativa',
                cod_curso AS 'Codigo do Curso',
                dsc_municipio AS 'Municipio',
                dsc_regiao AS 'Regiao',
                dsc_uf AS 'UF',
                cod_grupo AS 'Codigo do Grupo',
                dsc_grupo AS 'Curso',
                dsc_tipo_presenca AS 'Tipo de Presenca',
                nota_geral AS 'Nota Geral',
                CASE 
                  WHEN plano_ensino = 'NULL' THEN 'Não respondeu'
                  ELSE plano_ensino END AS 'Plano de Ensino',
                CASE 
                  WHEN cond_sala = 'NULL' THEN 'Não respondeu'
                  ELSE cond_sala END AS 'Condicao da Sala',
                CASE 
                  WHEN dsc_turno = 'NULL' THEN 'Não respondeu'
                  ELSE dsc_turno END AS 'Turno'
                FROM curso_notas 
                WHERE 1=1`;
    } else {
        // Query para outros anos
        query = 'SELECT * FROM curso_notas WHERE 1=1';
    }

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
        CASE
          WHEN ${variavel} = 'NULL' THEN 'Não respondeu'
          ELSE ${variavel} END AS variavel, 
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


// Função para calcular o teste qui-quadrado de contingência com regra para Fisher
function chiSquareContingency(observed) {
    // Calcular totais das linhas e colunas
    const rowTotals = observed.map(row => row.reduce((sum, val) => sum + val, 0));
    const colTotals = observed[0].map((_, colIndex) => observed.reduce((sum, row) => sum + row[colIndex], 0));
    const total = rowTotals.reduce((sum, val) => sum + val, 0);

    // Calcular frequências esperadas
    const expected = observed.map((row, rowIndex) =>
        row.map((_, colIndex) => (rowTotals[rowIndex] * colTotals[colIndex]) / total)
    );

    // Verificar se é uma tabela 2x2 e se há valores esperados menores que 5
    if (observed.length === 2 && observed[0].length === 2) {
        let hasSmallExpected = false;
        for (let i = 0; i < expected.length; i++) {
            for (let j = 0; j < expected[i].length; j++) {
                if (expected[i][j] < 5) {
                    hasSmallExpected = true;
                    break;
                }
            }
            if (hasSmallExpected) break;
        }

        if (hasSmallExpected) {
            // Usar Fisher se for 2x2 e tiver valor esperado menor que 5
            const [a, b] = observed[0];
            const [c, d] = observed[1];
            const fisherPValue = fisherExactTestPValue(a, b, c, d);
            return {
                method: "Fisher Exact Test",
                pValue: fisherPValue,
                expected
            };
        }
    }

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

    return {
        method: "Chi-Square Test",
        chi2,
        pValue,
        dof,
        expected
    };
}

// Função para calcular fatoriais
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Função para calcular a probabilidade de uma tabela no Teste de Fisher
function fisherExactTest(a, b, c, d) {
    const total = a + b + c + d;
    const prob =
        (factorial(a + b) * factorial(c + d) * factorial(a + c) * factorial(b + d)) /
        (factorial(a) * factorial(b) * factorial(c) * factorial(d) * factorial(total));
    return prob;
}

// Função para calcular o p-valor do Teste de Fisher
function fisherExactTestPValue(a, b, c, d) {
    const row1 = a + b;
    const row2 = c + d;
    const col1 = a + c;
    const col2 = b + d;
    const total = row1 + row2;

    let pObserved = fisherExactTest(a, b, c, d);
    let pValue = 0;

    for (let x = 0; x <= Math.min(row1, col1); x++) {
        const y = row1 - x;
        const z = col1 - x;
        const w = row2 - z;

        if (w >= 0 && y >= 0 && z >= 0) {
            const p = fisherExactTest(x, y, z, w);
            if (p <= pObserved) {
                pValue += p;
            }
        }
    }

    return pValue;
}



app.get('/quiquadrado', async (req, res) => {
  const { ano, regiao, uf, municipio, catAdm, ies, curso, presenca, variavel, alfa } = req.query;

  if (!variavel) {
      return res.status(400).json({ message: 'O parâmetro "variavel" é obrigatório' });
  }

  const colunasValidas = ['sexo', 'raca', 'cond_sala', 'plano_ensino'];
  if (!colunasValidas.includes(variavel)) {
      return res.status(400).json({ message: `A coluna '${variavel}' não é válida. Escolha entre: ${colunasValidas.join(', ')}` });
  }

  try {
      // Query sem agrupamento
      let querySemAgrupamento = 
      `SELECT 
      ${variavel}
      , nota_geral 
      FROM \`mktd0358_enade_pcc\`.\`curso_notas\` 
      WHERE 1 = 1`;
      const params = [];

      if (ano) querySemAgrupamento += ' AND ano = ?', params.push(ano);
      if (regiao) querySemAgrupamento += ' AND dsc_regiao = ?', params.push(regiao);
      if (uf) querySemAgrupamento += ' AND dsc_uf = ?', params.push(uf);
      if (municipio) querySemAgrupamento += ' AND dsc_municipio = ?', params.push(municipio);
      if (catAdm) querySemAgrupamento += ' AND dsc_cat_adm = ?', params.push(catAdm);
      if (ies) querySemAgrupamento += ' AND cod_ies = ?', params.push(ies);
      if (curso) querySemAgrupamento += ' AND dsc_grupo = ?', params.push(curso);
      if (presenca) querySemAgrupamento += ' AND cod_tipo_presenca = ?', params.push(presenca);

      const [resultadosSemAgrupamento] = await db.query(querySemAgrupamento, params);

      const valoresNotas = resultadosSemAgrupamento.map(row => row.nota_geral);
      const { valoresSemOutliers } = findOutliers(valoresNotas);

      let queryComAgrupamento = `
      SELECT
            CASE
                WHEN ${variavel} = 'NULL' THEN 'Não respondeu'  
                ELSE ${variavel} END AS ${variavel}, 
             CASE
                 WHEN nota_geral < 50 THEN 'BAIXO'
                 WHEN nota_geral >= 50 AND nota_geral < 70 THEN 'MEDIO'
                 ELSE 'ALTO'
             END AS faixa_nota,
             COUNT(*) as count
      FROM \`mktd0358_enade_pcc\`.\`curso_notas\`
      WHERE 1 = 1
      `;

      const params_agrp = [];
      if (ano) queryComAgrupamento += ' AND ano = ?', params_agrp.push(ano);
      if (regiao) queryComAgrupamento += ' AND dsc_regiao = ?', params_agrp.push(regiao);
      if (uf) queryComAgrupamento += ' AND dsc_uf = ?', params_agrp.push(uf);
      if (municipio) queryComAgrupamento += ' AND dsc_municipio = ?', params_agrp.push(municipio);
      if (catAdm) queryComAgrupamento += ' AND dsc_cat_adm = ?', params_agrp.push(catAdm);
      if (ies) queryComAgrupamento += ' AND cod_ies = ?', params_agrp.push(ies);
      if (curso) queryComAgrupamento += ' AND dsc_grupo = ?', params_agrp.push(curso);
      if (presenca) queryComAgrupamento += ' AND cod_tipo_presenca = ?', params_agrp.push(presenca);

      const valoresNumericos = valoresSemOutliers.filter(val => typeof val === 'number');
      if (valoresNumericos.length > 0) {
          queryComAgrupamento += ' AND ROUND(nota_geral, 1) IN (' + valoresNumericos.map(() => '?').join(', ') + ')';
          params_agrp.push(...valoresNumericos);
      }

      queryComAgrupamento += `
          GROUP BY ??, faixa_nota
          ORDER BY ??, faixa_nota
      `;
      params_agrp.push(variavel, variavel);

      const [resultados] = await db.query(queryComAgrupamento, params_agrp);

      // Verificando se algum valor para a variável é NULL
      if (resultados.every(row => row[variavel] === "NULL")) {
        return res.status(400).json({ message: `Não houveram respostas para a variável '${variavel}' selecionada. Então não é possível realizar o cálculo do qui-quadrado.` });
      }

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

      // Filtragem das colunas (não células) com todos os valores zero
      const tabelaContingenciaArrayFiltrada = tabelaContingenciaArray[0].map((_, colIndex) => {
          return tabelaContingenciaArray.map(row => row[colIndex]);
      }).filter(col => col.some(val => val > 0)); // Filtrar colunas com todos os valores zero

      if (tabelaContingenciaArrayFiltrada.length === 0) {
          return res.status(400).json({ message: "Não há dados suficientes para realizar o teste qui-quadrado." });
      }

      // Realizar o teste de contingência
      const { method, chi2, pValue, dof, expected } = chiSquareContingency(tabelaContingenciaArrayFiltrada);
      const resultadoSignificativo = pValue < alfa;

      const resposta = {
          metodo: method,
          qui2: method === "Chi-Square Test" ? parseFloat(chi2.toFixed(2)) : undefined,
          valor_p: parseFloat(pValue.toFixed(4)),
          graus_de_liberdade: method === "Chi-Square Test" ? dof : undefined,
          frequencias_esperadas: {
            colunas: Object.keys(tabelaContingenciaFiltrada),
            linhas: ["BAIXO", "MEDIO", "ALTO"],
            matriz: expected.map(row => row.map(value => parseFloat(value.toFixed(2))))
          },          
          frequencias_observadas: {
            colunas: Object.keys(tabelaContingenciaFiltrada),
            linhas: ["BAIXO", "MEDIO", "ALTO"],
            matriz: tabelaContingenciaArrayFiltrada,
          },
          resultado_significativo: resultadoSignificativo
      };

      res.json(resposta);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao processar a requisição' });
  }
});


// Rota GET Variavel com parâmetro 'ano'
app.get('/variavel/:ano', async (req, res) => {
  const ano = req.params.ano; // Obtém o valor do parâmetro 'ano' na URL
  
  try {
    // Consulta SQL com parâmetro 'ano' na cláusula WHERE
    const [rows] = await db.query('SELECT DISTINCT variavel FROM variavel_ano WHERE ano = ?', [ano]);
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar dados do banco de dados');
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
