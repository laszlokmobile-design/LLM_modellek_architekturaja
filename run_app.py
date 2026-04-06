import subprocess
import sys
import time
import os


def run_app():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # 1. Backend Python keresése (venv támogatás)
    python_bin = os.path.join(backend_dir, "venv", "Scripts", "python.exe") if os.name == "nt" else os.path.join(
        backend_dir, "venv", "bin", "python")
    backend_exec = python_bin if os.path.exists(python_bin) else sys.executable

    print(f"🚀 Indítás... (Python: {backend_exec})")

    try:
        # 2. Backend indítása
        print("📡 Backend indítása...")
        backend_process = subprocess.Popen([backend_exec, "main.py"], cwd=backend_dir)
        time.sleep(2)

        # 3. Frontend indítása
        print("💻 Frontend indítása...")
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        frontend_process = subprocess.Popen([npm_cmd, "start"], cwd=frontend_dir)

        print(f"\n✅ Rendszer üzemkész!")
        print(f"Backend: http://127.0.0.1:8000")
        print(f"Frontend: http://localhost:3000")

        while True:
            time.sleep(1)

    except FileNotFoundError:
        print("\n❌ Hiba: Az 'npm' vagy a Python nem található. Ellenőrizd a telepítést!")
    except KeyboardInterrupt:
        print("\n🛑 Leállítás folyamatban...")
        backend_process.terminate()
        frontend_process.terminate()
        print("👋 Sikeresen leállítva.")


if __name__ == "__main__":
    run_app()
