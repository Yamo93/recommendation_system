export const SIMILARITY_KEYS = {
    EUCLIDEAN: 'EUCLIDEAN',
    PEARSON: 'PEARSON'
}

export const SIMILARITY_IDS = {
    [SIMILARITY_KEYS.EUCLIDEAN]: 1,
    [SIMILARITY_KEYS.PEARSON]: 2
};

export const similarities = {
    [SIMILARITY_IDS.EUCLIDEAN]: { id: SIMILARITY_IDS.EUCLIDEAN, text: 'Euclidean' },
    [SIMILARITY_IDS.PEARSON]: { id: SIMILARITY_IDS.PEARSON, text: 'Pearson' }
};
