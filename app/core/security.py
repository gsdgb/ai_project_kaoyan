from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """
    将明文密码加密为哈希值 (使用原生 bcrypt)
    """
    # bcrypt 要求输入为 bytes 类型，先进行编码
    pwd_bytes = password.encode('utf-8')
    # 生成随机盐值
    salt = bcrypt.gensalt()
    # 进行哈希加密
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    # 存入数据库通常为字符串，所以需要 decode 转换回 string
    return hashed_password.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    校验明文密码与数据库中的哈希密码是否匹配 (使用原生 bcrypt)
    """
    # bcrypt 校验对比时，要求两端都必须是 bytes 类型
    password_bytes = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')

    # 返回布尔值结果
    return bcrypt.checkpw(password_bytes, hashed_password_bytes)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.now(timezone.utc) + expires_delta

    payload = {
        "sub": subject,
        "exp": expire,
    }

    encoded_jwt = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    return encoded_jwt


def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        subject = payload.get("sub")

        if subject is None:
            return None

        return subject

    except JWTError:
        return None


