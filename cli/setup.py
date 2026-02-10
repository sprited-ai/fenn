"""Setup configuration for Fenn CLI"""
from setuptools import setup, find_packages

with open("requirements.txt") as f:
    requirements = [line.strip() for line in f if line.strip() and not line.startswith("#")]

setup(
    name="fenn",
    version="0.1.0",
    description="Portfolio Download and Archive System",
    packages=find_packages(),
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "fenn=fenn.cli:cli",
        ],
    },
    python_requires=">=3.8",
)
