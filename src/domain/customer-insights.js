export function classifyCustomer({ orderCount = 0, daysSinceLastOrder = Infinity, previousOrderCount = 0 }) {
  if (orderCount === 1) return 'NOVO';
  if (previousOrderCount > 0 && daysSinceLastOrder > 30) return 'REATIVADO';
  if (orderCount > 1) return 'RECORRENTE';
  return 'INDETERMINADO';
}

export function suggestCustomerMessage({ classification, storeName }) {
  const messages = {
    NOVO: `Obrigado por conhecer a ${storeName}! Esperamos que sua experiência tenha sido especial.`,
    RECORRENTE: 'Que bom ter você com a gente novamente! Obrigado por escolher nossa loja mais uma vez. ❤️',
    REATIVADO: 'Sentimos sua falta! Que bom ter você de volta. Estamos preparando tudo com carinho.'
  };
  return messages[classification] ?? 'Obrigado por escolher nossa loja!';
}

export function classifyReview(text = '') {
  const value = text.toLowerCase();
  if (/fria|frio|temperatura|gelad/.test(value)) return 'TEMPERATURA';
  if (/embalagem|amassad|vazou/.test(value)) return 'EMBALAGEM';
  if (/atras|demor|esper/.test(value)) return 'ATRASO';
  if (/quantidade|pouco|faltou/.test(value)) return 'QUANTIDADE';
  if (/errado|incorreto|faltando/.test(value)) return 'PEDIDO INCORRETO';
  if (/atendimento|atendente/.test(value)) return 'ATENDIMENTO';
  if (/comida|sabor|gosto/.test(value)) return 'COMIDA';
  return 'OUTROS';
}
