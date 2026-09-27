export class CommercialMemory {
  constructor() { this.entries = []; }
  record(entry) {
    const row = { id: `memory-${this.entries.length + 1}`, createdAt: new Date().toISOString(), confidence: entry.confidence ?? 0.2, ...entry };
    this.entries.push(row);
    return row;
  }
  rank({ storeId, context }) {
    return this.entries.filter(item => item.storeId === storeId && (!context || item.context === context)).sort((a, b) => (b.confidence * (b.result === 'EFFECTIVE' ? 1.2 : 0.7)) - (a.confidence * (a.result === 'EFFECTIVE' ? 1.2 : 0.7)));
  }
  updateResult(id, { result, impactCents, confidence }) {
    const item = this.entries.find(row => row.id === id);
    if (!item) throw new Error('Memória comercial não encontrada.');
    Object.assign(item, { result, impactCents, confidence, measuredAt: new Date().toISOString() });
    return item;
  }
}

export class ExperimentRegistry {
  constructor() { this.items = new Map(); }
  create(input) {
    if (!input.hypothesis || !input.variantA || !input.variantB) throw new Error('Experimento precisa de hipótese e duas versões.');
    const experiment = { id: input.id ?? `experiment-${this.items.size + 1}`, status: 'PLANNED', createdAt: new Date().toISOString(), ...input };
    this.items.set(experiment.id, experiment);
    return experiment;
  }
  conclude(id, result) {
    const experiment = this.items.get(id);
    if (!experiment) throw new Error('Experimento não encontrado.');
    const enoughSample = Number(result.sampleA ?? 0) >= 30 && Number(result.sampleB ?? 0) >= 30;
    const conclusion = enoughSample ? result.conclusion : 'INCONCLUSIVO — amostra pequena';
    const updated = { ...experiment, status: 'CONCLUDED', result, conclusion, confidence: enoughSample ? result.confidence ?? 'MÉDIA' : 'BAIXA', concludedAt: new Date().toISOString() };
    this.items.set(id, updated);
    return updated;
  }
}
