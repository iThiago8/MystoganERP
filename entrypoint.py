# entrypoint.py
import subprocess
import sys

print("Rodando seed...")
subprocess.run([sys.executable, "-m", "Utils.seed"])

print("Iniciando servidor...")
subprocess.run([
    "uvicorn", "main:app",
    "--host", "0.0.0.0",
    "--port", "8000",
    "--reload"
])