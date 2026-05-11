from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserFile(Base):
    __tablename__ = "user_files"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)

    file_size = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False)

    file_path = Column(String(500), nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    owner = relationship("User")