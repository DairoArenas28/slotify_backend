import jwt from 'jsonwebtoken'

export const generateJWT = (id: string, role: string) => {
    const token = jwt.sign({id, role}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
    return token
}