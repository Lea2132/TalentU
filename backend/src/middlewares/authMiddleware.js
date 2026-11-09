import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);  
    req.userId = decoded.id; 
    req.isAdmin = decoded.isAdmin === true;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ message: "Acceso solo para administradores" });
  }
  next();
};

export const optionalVerifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) return next();

  const token = authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin === true;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
