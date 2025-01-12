const calculateChiSquared = (observed, expected) => {
    if (observed.length !== expected.length) {
      throw new Error('O número de observações e esperadas deve ser o mesmo.');
    }
  
    let chiSquared = 0;
  
    for (let i = 0; i < observed.length; i++) {
      if (expected[i] === 0) {
        throw new Error(`Valor esperado na posição ${i} não pode ser zero.`);
      }
      chiSquared += Math.pow(observed[i] - expected[i], 2) / expected[i];
    }
  
    return chiSquared;
  };
  
  // Função para obter o valor crítico do Qui-Quadrado
  const getChiSquareCriticalValue = (alpha, degreesOfFreedom) => {
    const chiSquareTable = {
      0.05: { 1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.070 }, // Valores críticos para alpha = 0.05
      0.01: { 1: 6.635, 2: 9.210, 3: 11.345, 4: 13.277, 5: 15.086 }, // Valores críticos para alpha = 0.01
    };
  
    const tableForAlpha = chiSquareTable[alpha];
    if (!tableForAlpha) {
      throw new Error('Valor de alfa não suportado. Use 0.05 ou 0.01.');
    }
  
    const criticalValue = tableForAlpha[degreesOfFreedom];
    if (!criticalValue) {
      throw new Error('Graus de liberdade não suportados.');
    }
  
    return criticalValue;
  };
  
  app.get('/api/qui-quadrado/:ano/:curso/:alfa', async (req, res) => {
    const { ano, curso, alfa } = req.params;
  
    if (!ano || !curso || !alfa) {
      return res.status(400).json({ error: 'Os parâmetros "ano", "curso" e "alfa" são obrigatórios.' });
    }
  
    try {
      // 1. Obter as frequências observadas para o ano e curso fornecidos
      const { data: observedData, error: observedError } = await supabase
        .from('vw_cond_sala') // Substitua pela view ou tabela correta
        .select('categoria, count(*) as frequencia')
        .eq('ano', ano)
        .eq('cod_curso', curso)
        .group('categoria'); // Agrupar por categoria (ajuste conforme necessário)
  
      if (observedError) throw observedError;
  
      if (!observedData || observedData.length === 0) {
        return res.status(404).json({ error: 'Nenhum dado encontrado para os parâmetros fornecidos.' });
      }
  
      // 2. Obter o total de observações
      const totalObservations = observedData.reduce((sum, item) => sum + item.frequencia, 0);
  
      // 3. Calcular os valores esperados (distribuição uniforme)
      const expectedData = observedData.map(item => {
        return {
          categoria: item.categoria,
          expected: totalObservations / observedData.length,
        };
      });
  
      // 4. Obter as frequências observadas
      const observed = observedData.map(item => item.frequencia);
  
      // 5. Obter os valores esperados
      const expected = expectedData.map(item => item.expected);
  
      // 6. Calcular o Qui-Quadrado
      const chiSquaredValue = calculateChiSquared(observed, expected);
  
      // 7. Calcular graus de liberdade
      const degreesOfFreedom = observed.length - 1;
  
      // 8. Obter o valor crítico para o alfa e graus de liberdade
      const criticalValue = getChiSquareCriticalValue(parseFloat(alfa), degreesOfFreedom);
  
      // 9. Determinar se o resultado é significativo
      const isSignificant = chiSquaredValue > criticalValue;
  
      // 10. Retornar o resultado
      res.json({
        chiSquared: chiSquaredValue,
        criticalValue,
        degreesOfFreedom,
        alpha: parseFloat(alfa),
        isSignificant,
      });
    } catch (error) {
      console.error('Erro ao calcular Qui-Quadrado:', error);
      res.status(500).json({ error: 'Erro ao calcular o Qui-Quadrado.' });
    }
  });
  