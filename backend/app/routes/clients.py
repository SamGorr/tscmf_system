from fastapi import APIRouter, HTTPException, Depends
from tortoise.exceptions import DoesNotExist
from typing import List, Optional
from pydantic import BaseModel
from app.models.client import Client, ClientType

router = APIRouter()

# Pydantic models for request/response validation
class ClientCreate(BaseModel):
    name: str
    code: str
    client_type: ClientType
    country: str
    sector: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: bool = True

class ClientResponse(BaseModel):
    id: int
    name: str
    code: str
    client_type: ClientType
    country: str
    sector: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: bool

    class Config:
        orm_mode = True

@router.post("/", response_model=ClientResponse)
async def create_client(client: ClientCreate):
    client_obj = await Client.create(**client.dict())
    return await ClientResponse.from_tortoise_orm(client_obj)

@router.get("/", response_model=List[ClientResponse])
async def get_clients(client_type: Optional[ClientType] = None):
    if client_type:
        return await ClientResponse.from_queryset(Client.filter(client_type=client_type))
    return await ClientResponse.from_queryset(Client.all())

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: int):
    try:
        return await ClientResponse.from_queryset_single(Client.get(id=client_id))
    except DoesNotExist:
        raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(client_id: int, client: ClientCreate):
    try:
        await Client.filter(id=client_id).update(**client.dict(exclude_unset=True))
        return await ClientResponse.from_queryset_single(Client.get(id=client_id))
    except DoesNotExist:
        raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")

@router.delete("/{client_id}")
async def delete_client(client_id: int):
    deleted_count = await Client.filter(id=client_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")
    return {"message": f"Client with ID {client_id} deleted successfully"} 