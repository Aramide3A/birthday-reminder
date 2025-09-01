import type { Express, Request, Response } from 'express'
import express from 'express'
import { PrismaClient } from '@prisma/client'
import cron from 'node-cron'
import { sendEmail } from './services/emailService'
import path from 'path'

const prisma = new PrismaClient()
const app: Express = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'views', 'form.html'))
})

app.get('/birthday', async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany()
        res.status(200).json(users)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error fetching users', error: (error as Error).message })
    }
})

app.post('/birthday', async (req: Request, res: Response) => {
    try {
        console.log(req.body)
        const { email, username, birthday } = req.body

        const checkUser = await prisma.user.findUnique({
            where: { email },
        })

        if (checkUser) {
            return res.status(400).send('User already exists')
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                username: username.toLowerCase(),
                birthday: new Date(birthday),
            },
        })

        res.status(201).json({
            message: `Thank you, ${newUser.username}! Your birthday reminder has been registered.`,
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error Saving Birthday', error: (error as Error).message })
    }
})

cron.schedule('* 7 * * *', async () => {
    console.log('Running a task every day at 7:00 AM')
    try {
        const users = await prisma.user.findMany()
        users.forEach(user => {
            const birthday = user.birthday
            if (birthday) {
                const today = new Date()
                if (today.getDate() === birthday.getDate() && today.getMonth() === birthday.getMonth()) {
                    sendEmail(user.email, user.username)
                }
            }
        })
    } catch (error) {
        console.error('Error fetching users:', error)
    }
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})
