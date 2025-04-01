import os
import sys
import subprocess

def create_initial_migration():
    try:
        # Ensure we're in the backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(backend_dir)
        
        print("Creating initial migration...")
        
        # Generate the initial migration
        subprocess.run(
            ["alembic", "revision", "--autogenerate", "-m", "initial_schema"],
            check=True
        )
        
        print("Initial migration created successfully!")
        print("To apply the migration, run: alembic upgrade head")
        
    except subprocess.CalledProcessError as e:
        print(f"Error creating migration: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_initial_migration() 