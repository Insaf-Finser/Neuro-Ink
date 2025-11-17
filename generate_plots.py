import os
import warnings
warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # non-interactive backend for saving figures
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    confusion_matrix,
    roc_curve,
    roc_auc_score,
    precision_recall_curve,
    average_precision_score,
)
import lightgbm as lgb


def ensure_dir(path: str) -> None:
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)


def train_final_model(X_train, y_train):
    model = lgb.LGBMClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=6,
        num_leaves=31,
        random_state=42,
        verbose=-1,
    )
    model.fit(X_train, y_train)
    return model


def plot_confusion_matrix(cm: np.ndarray, out_path: str) -> None:
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Healthy', 'Patient'],
                yticklabels=['Healthy', 'Patient'])
    plt.title('Confusion Matrix - LightGBM')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()


def plot_roc(y_true, y_score, out_path: str) -> None:
    fpr, tpr, _ = roc_curve(y_true, y_score)
    auc = roc_auc_score(y_true, y_score)
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, color='crimson', lw=2, label=f'AUC = {auc:.3f}')
    plt.plot([0, 1], [0, 1], color='navy', lw=1, ls='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve - LightGBM')
    plt.legend(loc='lower right')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()


def plot_pr(y_true, y_score, out_path: str) -> None:
    precision, recall, _ = precision_recall_curve(y_true, y_score)
    ap = average_precision_score(y_true, y_score)
    plt.figure(figsize=(6, 5))
    plt.plot(recall, precision, color='darkgreen', lw=2, label=f'AP = {ap:.3f}')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve - LightGBM')
    plt.legend(loc='lower left')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()


def plot_feature_importance(model, feature_names, out_path: str, top_n: int = 20) -> None:
    importances = model.feature_importances_
    fi_df = pd.DataFrame({'feature': feature_names, 'importance': importances})
    fi_df = fi_df.sort_values('importance', ascending=False).head(top_n)
    plt.figure(figsize=(8, 8))
    plt.barh(range(len(fi_df)), fi_df['importance'], color='skyblue')
    plt.yticks(range(len(fi_df)), fi_df['feature'])
    plt.gca().invert_yaxis()
    plt.xlabel('Importance')
    plt.title(f'Top {top_n} Features - LightGBM')
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()


def main():
    np.random.seed(42)
    out_dir = os.path.join('reports')
    ensure_dir(out_dir)

    # Load data
    df = pd.read_csv(os.path.join('training', 'data', 'darwin', 'data.csv'))
    X = df.drop(['ID', 'class'], axis=1)
    y = df['class'].map({'H': 0, 'P': 1})

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = train_final_model(X_train, y_train)
    y_pred = model.predict(X_test)
    y_score = model.predict_proba(X_test)[:, 1]

    cm = confusion_matrix(y_test, y_pred)

    # Save plots
    plot_confusion_matrix(cm, os.path.join(out_dir, 'confusion_matrix.png'))
    plot_roc(y_test, y_score, os.path.join(out_dir, 'roc_curve.png'))
    plot_pr(y_test, y_score, os.path.join(out_dir, 'pr_curve.png'))
    plot_feature_importance(model, X.columns, os.path.join(out_dir, 'feature_importance_top20.png'))

    # Also save raw confusion matrix values
    pd.DataFrame(cm, index=['True_Healthy', 'True_Patient'], columns=['Pred_Healthy', 'Pred_Patient']) \
        .to_csv(os.path.join(out_dir, 'confusion_matrix.csv'))

    # Print paths
    print('Saved:')
    for fname in [
        'confusion_matrix.png',
        'roc_curve.png',
        'pr_curve.png',
        'feature_importance_top20.png',
        'confusion_matrix.csv',
    ]:
        print(f"- {os.path.join(out_dir, fname)}")


if __name__ == '__main__':
    main()




