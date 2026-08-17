import { Request } from 'express';

export interface AdminJwtPayload {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  allowed_pages?: string[];
}

export interface AuthRequest extends Request {
  admin?: AdminJwtPayload;
  cookies: {
    [key: string]: string;
  };
}
