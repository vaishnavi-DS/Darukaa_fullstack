from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
def register_user(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    
    if "@" not in clean_email or "." not in clean_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid Gmail or email address (e.g. name@gmail.com)"
        )

    existing_user = db.query(models.User).filter(models.User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{clean_email}' already exists. Please sign in."
        )
    
    # Infer full name if not provided
    name = user_in.full_name
    if not name or not name.strip():
        name = clean_email.split("@")[0].replace(".", " ").title()

    hashed_pwd = auth.get_password_hash(user_in.password)
    user = models.User(
        email=clean_email,
        hashed_password=hashed_pwd,
        full_name=name,
        role=user_in.role or "admin"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = auth.create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=schemas.Token)
def login_user(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    clean_email = credentials.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == clean_email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"No account found for '{clean_email}'. Please register your Gmail account first.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
