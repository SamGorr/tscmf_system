from fastapi import APIRouter, HTTPException, Depends
from tortoise.exceptions import DoesNotExist
from typing import List, Optional
from pydantic import BaseModel
from app.models.product import Product, ProductType, ProductCategory

router = APIRouter()

# Pydantic models for request/response validation
class ProductCreate(BaseModel):
    name: str
    code: str
    product_type: ProductType
    category: ProductCategory
    description: Optional[str] = None
    is_active: bool = True

class ProductResponse(BaseModel):
    id: int
    name: str
    code: str
    product_type: ProductType
    category: ProductCategory
    description: Optional[str] = None
    is_active: bool

    class Config:
        orm_mode = True

@router.post("/", response_model=ProductResponse)
async def create_product(product: ProductCreate):
    product_obj = await Product.create(**product.dict())
    return await ProductResponse.from_tortoise_orm(product_obj)

@router.get("/", response_model=List[ProductResponse])
async def get_products(category: Optional[ProductCategory] = None, product_type: Optional[ProductType] = None):
    query = Product.all()
    if category:
        query = query.filter(category=category)
    if product_type:
        query = query.filter(product_type=product_type)
    return await ProductResponse.from_queryset(query)

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int):
    try:
        return await ProductResponse.from_queryset_single(Product.get(id=product_id))
    except DoesNotExist:
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product: ProductCreate):
    try:
        await Product.filter(id=product_id).update(**product.dict(exclude_unset=True))
        return await ProductResponse.from_queryset_single(Product.get(id=product_id))
    except DoesNotExist:
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")

@router.delete("/{product_id}")
async def delete_product(product_id: int):
    deleted_count = await Product.filter(id=product_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
    return {"message": f"Product with ID {product_id} deleted successfully"} 