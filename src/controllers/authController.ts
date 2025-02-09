import prisma from '../config/prisma';
import { Request, Response } from 'express';
import { comparePassword, generateToken, hashPassword } from '../utils/auth';


// user signup
export const signup = async (req: Request, res: Response) => {

  try {

    const { email, password } = req.body;
    if(!email || !password){
      res.status(400).json('Email or Password cannot be empty');
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json("User already exists");
        return;
      }

      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

    res.status(201).json({ user });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
};


// user login
export const login = async (req: Request, res: Response) => {

  try {
    const { email, password } = req.body;

    if(!email || !password){
      res.status(400).json('Email or Password cannot be empty');
      return;
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json("User not found");
      return;
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json("Invalid Credentials");
      return;
    }

    const token = generateToken(user.id);

    // Set token in a cookie
    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', 
      maxAge: 3600000, // 1 hour expiration
    });

    res.status(200).json({ user, token });

    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
};

// user logout
export const logout = async (req: Request, res: Response) => {

  try {

      // Clear the token cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    
      res.status(200).json("Logout Successfully");

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }

};