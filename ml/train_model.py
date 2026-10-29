import pandas as pd
import numpy as np
import os

# 1. Load the preprocessed numerical dataset
csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "preprocessed_features_scaled.csv")
if not os.path.exists(csv_path):
    csv_path = r"C:\Users\nikhi\Desktop\ML Project\data\preprocessed_features_scaled.csv"

data = pd.read_csv(csv_path)

# Data Inspection
# print(data.shape)
# print(data.head(5))
# print(data.info())
# print(data.tail(5))
# print(data.columns)
# print(data.isnull().sum())

# 2. Extract Features (x) and Target (y)
x = data.iloc[:, :-1].values
y = data.iloc[:, -1].values

# 3. Split into Train and Test sets
from sklearn.model_selection import train_test_split
xtrain, xtest, ytrain, ytest = train_test_split(x, y, test_size=0.2, random_state=42)

# 4. Train the Model (Random Forest Classifier)
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42)
model.fit(xtrain, ytrain)

# 5. Predict on Test Set
ypred = model.predict(xtest)

print("Predictions on Test Set:")
print(ypred)

from sklearn.metrics import accuracy_score
print("Accuracy Score:", accuracy_score(ytest, ypred))

# 6. Predict on a Single Applicant Sample
print("Single Sample Applicant Prediction (0 = Repaid / Approved, 1 = Default / Risk):")
print(model.predict([xtest[0]]))
