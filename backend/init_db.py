import os
import sys
import subprocess
import time
import shutil

def init_database():
    try:
        # Ensure we're in the backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(backend_dir)
        
        # Clean up existing migration versions
        versions_dir = os.path.join(backend_dir, "migrations", "versions")
        if os.path.exists(versions_dir):
            print(f"Cleaning up existing migrations in {versions_dir}")
            for file in os.listdir(versions_dir):
                if file.endswith('.py'):
                    os.remove(os.path.join(versions_dir, file))
        
        print("Creating initial migration...")
        
        # Generate the initial migration
        subprocess.run(
            ["alembic", "revision", "--autogenerate", "-m", "initial_schema"],
            check=True
        )
        
        print("Initial migration created successfully!")
        
        # Apply the migration
        print("Applying migration...")
        subprocess.run(
            ["alembic", "upgrade", "head"],
            check=True
        )
        
        print("Database initialized successfully!")
        
    except subprocess.CalledProcessError as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database() 