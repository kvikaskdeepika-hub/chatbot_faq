from flask import Flask, render_template, request
import json
import re

import nltk

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


app = Flask(__name__)


# -----------------------------
# NLTK
# -----------------------------

nltk.download("stopwords", quiet=True)
nltk.download("wordnet", quiet=True)
nltk.download("omw-1.4", quiet=True)


# -----------------------------
# Load FAQ data
# -----------------------------

with open(
    "data/faqs.json",
    "r",
    encoding="utf-8"
) as file:

    faqs = json.load(file)


# -----------------------------
# NLP
# -----------------------------

stop_words = set(
    stopwords.words("english")
)

lemmatizer = WordNetLemmatizer()


def preprocess_text(text):

    text = text.lower()

    text = re.sub(
        r"[^a-zA-Z\s]",
        "",
        text
    )

    words = text.split()

    result = []

    for word in words:

        if word not in stop_words:

            word = lemmatizer.lemmatize(word)

            result.append(word)

    return " ".join(result)


# -----------------------------
# Prepare FAQ questions
# -----------------------------

questions = [
    faq["question"]
    for faq in faqs
]


processed_questions = [
    preprocess_text(question)
    for question in questions
]


# -----------------------------
# TF-IDF
# -----------------------------

vectorizer = TfidfVectorizer()

faq_vectors = vectorizer.fit_transform(
    processed_questions
)


# -----------------------------
# Home page
# -----------------------------

@app.route("/")
def home():

    return render_template(
        "index.html",
        question="",
        answer=""
    )


# -----------------------------
# Chat
# -----------------------------

@app.route(
    "/chat",
    methods=["POST"]
)
def chat():

    user_question = request.form.get(
        "question",
        ""
    ).strip()


    if not user_question:

        return render_template(
            "index.html",
            question="",
            answer="Please enter a question."
        )


    # Process question

    processed_question = preprocess_text(
        user_question
    )


    # TF-IDF

    user_vector = vectorizer.transform(
        [processed_question]
    )


    # Similarity

    scores = cosine_similarity(
        user_vector,
        faq_vectors
    )[0]


    # Best match

    best_index = scores.argmax()

    best_score = scores[best_index]


    # Threshold

    if best_score < 0.15:

        answer = (
            "Sorry, I couldn't find a suitable "
            "answer. Please ask your question differently."
        )

    else:

        answer = faqs[
            best_index
        ]["answer"]


    return render_template(
        "index.html",
        question=user_question,
        answer=answer
    )


# -----------------------------
# Run
# -----------------------------

if __name__ == "__main__":

    app.run(
        debug=True
    )