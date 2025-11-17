
// Model loader for web interface
class ModelLoader {
    constructor() {
        this.model = null;
        this.scaler = null;
        this.featureNames = [];
    }
    
    async loadModel(modelPath = '/models/web_model.json') {
        try {
            const response = await fetch(modelPath);
            this.model = await response.json();
            console.log('Model loaded:', this.model.type);
            return true;
        } catch (error) {
            console.error('Failed to load model:', error);
            return false;
        }
    }
    
    async loadScaler(scalerPath = '/models/scaler.json') {
        try {
            const response = await fetch(scalerPath);
            this.scaler = await response.json();
            this.featureNames = this.scaler.feature_names;
            console.log('Scaler loaded');
            return true;
        } catch (error) {
            console.error('Failed to load scaler:', error);
            return false;
        }
    }
    
    predict(features) {
        if (!this.model) {
            throw new Error('Model not loaded');
        }
        
        if (this.model.type === 'logistic_regression') {
            return this.predictLogisticRegression(features);
        } else {
            // For tree-based models, use feature importance as proxy
            return this.predictWithFeatureImportance(features);
        }
    }
    
    predictLogisticRegression(features) {
        const coefficients = this.model.coefficients[0];
        const intercept = this.model.intercept[0];
        
        // Scale features if scaler is available
        let scaledFeatures = features;
        if (this.scaler) {
            scaledFeatures = features.map((val, idx) => 
                (val - this.scaler.mean[idx]) / this.scaler.scale[idx]
            );
        }
        
        // Compute linear combination
        let score = intercept;
        for (let i = 0; i < scaledFeatures.length; i++) {
            score += coefficients[i] * scaledFeatures[i];
        }
        
        // Convert to probability using sigmoid
        const probability = 1 / (1 + Math.exp(-score));
        return probability;
    }
    
    predictWithFeatureImportance(features) {
        // Simple heuristic based on feature importance
        const importances = this.model.feature_importances;
        let weightedSum = 0;
        let totalImportance = 0;
        
        for (let i = 0; i < features.length; i++) {
            weightedSum += features[i] * importances[i];
            totalImportance += importances[i];
        }
        
        // Normalize and convert to probability
        const normalizedScore = weightedSum / totalImportance;
        const probability = Math.max(0, Math.min(1, (normalizedScore + 1) / 2));
        return probability;
    }
    
    getRiskLevel(probability) {
        if (probability < 0.3) return 'low';
        if (probability < 0.6) return 'moderate';
        return 'high';
    }
}

// Export for use in web interface
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModelLoader;
} else if (typeof window !== 'undefined') {
    window.ModelLoader = ModelLoader;
}
