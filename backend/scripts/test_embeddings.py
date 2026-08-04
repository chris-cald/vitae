"""
Test script for embedding generation via backend's LiteLLM integration.
Usage:
  PYTHONPATH=backend .venv/bin/python3.11 backend/scripts/test_embeddings.py "your text here"
"""

import sys
from src.services.profile_category_detection import embedding_based_category_detection


def main():
    if len(sys.argv) < 2:
        print("Usage: python test_embeddings.py 'your text here'")
        sys.exit(1)
    text = sys.argv[1]
    result = embedding_based_category_detection(text)
    print("Category detection result:")
    print(result)


if __name__ == "__main__":
    main()
