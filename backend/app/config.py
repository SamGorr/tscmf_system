import os
from pydantic import BaseModel
from typing import Optional

class Settings(BaseModel):
    DATABASE_URL: Optional[str] = None
    DATABASE_HOST: str = os.getenv("DATABASE_HOST", "postgres")
    DATABASE_PORT: int = int(os.getenv("DATABASE_PORT", "5432"))
    DATABASE_USER: str = os.getenv("DATABASE_USER", "postgres")
    DATABASE_PASSWORD: str = os.getenv("DATABASE_PASSWORD", "postgres")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "tscmf_db")
    
    @property
    def get_database_url(self):
        if self.DATABASE_URL:
            return self.DATABASE_URL
        
        return f"postgres://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"

settings = Settings() 