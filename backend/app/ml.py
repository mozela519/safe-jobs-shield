"""
Safe Jobs Shield - ML Baseline Classifier.
TF-IDF + Logistic Regression baseline with an extensible interface for multilingual transformers.

IMPORTANT AI HONESTY NOTE:
Before claiming that any multilingual transformer (e.g., XLM-RoBERTa, Afro-XLMR)
generalizes to ChiShona or isiNdebele job recruitment scams, its zero-shot and
fine-tuned vocabulary coverage for Zimbabwean languages MUST be empirically benchmarked
against annotated local corpora. Do not assume out-of-the-box multilingual models
handle vernacular job scam nuances without validation.
"""

import os
import pickle
from typing import Dict, Any, List, Tuple
from abc import ABC, abstractmethod
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


class BaseJobClassifier(ABC):
    """Abstract interface allowing seamless swap between Scikit-Learn baseline and Hugging Face transformer."""
    
    @abstractmethod
    def fit(self, texts: List[str], labels: List[int]):
        pass

    @abstractmethod
    def predict_proba(self, texts: List[str]) -> List[float]:
        pass

    @abstractmethod
    def predict(self, texts: List[str]) -> List[int]:
        pass


class TfidfLogisticClassifier(BaseJobClassifier):
    """
    Lightweight, deterministic baseline running on constrained CPU infrastructure.
    Uses sublinear TF scaling and word n-grams (1, 2) to capture scam phrases.
    """
    def __init__(self):
        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=2500,
                sublinear_tf=True,
                token_pattern=r"(?u)\b\w+\b"
            )),
            ("clf", LogisticRegression(
                C=1.5,
                max_iter=1000,
                class_weight="balanced",
                random_state=42
            ))
        ])
        self.is_fitted = False

    def fit(self, texts: List[str], labels: List[int]):
        self.pipeline.fit(texts, labels)
        self.is_fitted = True

    def predict_proba(self, texts: List[str]) -> List[float]:
        if not self.is_fitted:
            # Fallback uniform probability if un-trained
            return [0.5 for _ in texts]
        # Return probability of class 1 (scam)
        probs = self.pipeline.predict_proba(texts)
        return [float(p[1]) for p in probs]

    def predict(self, texts: List[str]) -> List[int]:
        if not self.is_fitted:
            return [0 for _ in texts]
        return [int(p) for p in self.pipeline.predict(texts)]

    def save(self, filepath: str):
        with open(filepath, "wb") as f:
            pickle.dump(self.pipeline, f)

    def load(self, filepath: str):
        if os.path.exists(filepath):
            with open(filepath, "rb") as f:
                self.pipeline = pickle.load(f)
            self.is_fitted = True


class MultilingualTransformerInterface(BaseJobClassifier):
    """
    Placeholder/adapter interface for future Hugging Face transformers (e.g. Afro-XLMR).
    NOTE: Requires verifying Shona/Ndebele tokenizer representation before production activation.
    """
    def __init__(self, model_name: str = "Davlan/afro-xlmr-mini"):
        self.model_name = model_name
        self.verified_shona_coverage = False  # Must be verified before setting to True

    def fit(self, texts: List[str], labels: List[int]):
        raise NotImplementedError(
            "Transformer fine-tuning requires verified local ChiShona/isiNdebele annotated dataset. "
            "Use TfidfLogisticClassifier baseline until human-annotated dataset reaches >= 500 consented samples."
        )

    def predict_proba(self, texts: List[str]) -> List[float]:
        raise NotImplementedError("Transformer inference adapter pending local fine-tuning.")

    def predict(self, texts: List[str]) -> List[int]:
        raise NotImplementedError("Transformer inference adapter pending local fine-tuning.")
