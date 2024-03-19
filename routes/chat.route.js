import express from 'express'
import { SendMessage } from '../controller/chat.js'



const router=express.Router()


router.post('/',SendMessage)



export default router