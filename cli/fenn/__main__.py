"""Entrypoint for running fenn as a module"""
from fenn.cli import cli

if __name__ == "__main__":
    raise SystemExit(cli())
