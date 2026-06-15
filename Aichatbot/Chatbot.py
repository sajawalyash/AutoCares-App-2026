import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

# 1. Load your dataset
# Assume your dataset is in CSV format with columns: Query, Intent, Keywords, Response
df = pd.read_csv("chatbot_dataset.csv")

# 2. Define features (X) and labels (y)
X = df["Query"]   # user queries
y = df["Intent"]  # target intents

# 3. Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Convert text into TF-IDF vectors
vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1,2))
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# 5. Train Logistic Regression classifier
clf = LogisticRegression(max_iter=1000)
clf.fit(X_train_tfidf, y_train)

# 6. Evaluate performance
y_pred = clf.predict(X_test_tfidf)
print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))

# 7. Example chatbot function
def chatbot_response(query):
    query_tfidf = vectorizer.transform([query])
    intent = clf.predict(query_tfidf)[0]
    response = df[df["Intent"] == intent]["Response"].sample(1).values[0]
    return response

# Test chatbot
print(chatbot_response("My bike is not starting"))
print(clf.coef_.shape)
print("Model coefficients shape:", clf.coef_.shape)

