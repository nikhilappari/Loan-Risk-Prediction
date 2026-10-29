import pandas as pd
import numpy as np
import os

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
    precision_score,
    recall_score,
    f1_score
)

# 1. Load preprocessed numerical dataset
csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "preprocessed_features_scaled.csv")
if not os.path.exists(csv_path):
    csv_path = r"C:\Users\nikhi\Desktop\ML Project\data\preprocessed_features_scaled.csv"

data = pd.read_csv(csv_path)

# 2. Extract Features (x) and Target (y)
x = data.iloc[:, :-1].values
y = data.iloc[:, -1].values

# 3. Train-Test Split

xtrain, xtest, ytrain, ytest = train_test_split(x, y, test_size=0.2, random_state=42)

# 4. Train the Model
model = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42)
model.fit(xtrain, ytrain)

# 5. Predict on Test Set
ypred = model.predict(xtest)
yprob = model.predict_proba(xtest)[:, 1]

# 6. Evaluation Metrics
print("=" * 55)
print("MODEL EVALUATION & ACCURACY METRICS")
print("=" * 55)

print("\n1. Accuracy Score:")
print(f"   {accuracy_score(ytest, ypred) * 100:.2f}%")

print("\n2. Precision Score:")
print(f"   {precision_score(ytest, ypred, zero_division=0) * 100:.2f}%")

print("\n3. Recall Score (Default Capture):")
print(f"   {recall_score(ytest, ypred, zero_division=0) * 100:.2f}%")

print("\n4. F1 Score:")
print(f"   {f1_score(ytest, ypred, zero_division=0):.4f}")

print("\n5. ROC-AUC Discriminator Score:")
print(f"   {roc_auc_score(ytest, yprob):.4f}")

print("\n6. Confusion Matrix:")
cm = confusion_matrix(ytest, ypred)
print(cm)
print(f"   - True Negatives (Correctly predicted Non-Defaults): {cm[0][0]}")
print(f"   - False Positives (Falsely flagged Defaults):         {cm[0][1]}")
print(f"   - False Negatives (Missed Defaults):                  {cm[1][0]}")
print(f"   - True Positives (Correctly caught Defaults):         {cm[1][1]}")

print("\n7. Detailed Classification Report:")
print(classification_report(ytest, ypred, target_names=["Non-Default (0)", "Default (1)"]))
print("=" * 55)
