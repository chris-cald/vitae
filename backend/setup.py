from setuptools import setup, find_packages

setup(
    name="vitae-backend",
    version="0.1.0",
    description="Vitae Backend API",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlmodel",
        "markitdown",
        "litellm",
        "aiosqlite",
        "python-multipart",
        "pdfminer.six",
        "python-docx",
        "python-dotenv",
    ],
    extras_require={
        "dev": [
            "pytest",
            "pytest-asyncio",
            "alembic",
        ]
    },
    include_package_data=True,
    python_requires=">=3.8",
)
