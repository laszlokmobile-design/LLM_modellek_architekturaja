#backend/database.py
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./chat.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    temperature = Column(Float, default=0.7)
    top_p = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    conv_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String) # 'user' vagy 'assistant'
    content = Column(String)
    file_path = Column(String, nullable=True)
    conversation = relationship("Conversation", back_populates="messages")
    usage = relationship("UsageStats", back_populates="message", uselist=False)

class UsageStats(Base):
    __tablename__ = "usage_stats"
    id = Column(Integer, primary_key=True, index=True)
    msg_id = Column(Integer, ForeignKey("messages.id"))
    prompt_tokens = Column(Integer)
    completion_tokens = Column(Integer)
    total_tokens = Column(Integer)
    message = relationship("Message", back_populates="usage")

Base.metadata.create_all(bind=engine)
