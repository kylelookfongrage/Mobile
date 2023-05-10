import { DataStore } from "aws-amplify"
import { useEffect, useState } from "react"
import { User } from "../aws/models"
import { useCommonAWSIds } from "./useCommonContext"



export const useDefaultData = () => {
    const {userId} = useCommonAWSIds()
    const [admin, setAdmin] = useState<User | undefined>(undefined)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    useEffect(() => {
        DataStore.query(User, u => u.username.eq('rage')).then(x => setAdmin(x[0]))
    }, [])
    
    useEffect(() => {
        if (admin?.id === userId) {
            setIsAdmin(true)
        }
    }, [admin])

    const checkForUser = () => {
        if (!admin || !isAdmin) {
            alert('Access denied or no admin user found')
        }
    }

    const seedEquptment = async () => {
        const equptment = [
            {name: 'Barbell', img: 'https://images.unsplash.com/photo-1620188526357-ff08e03da266?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80' },
            {name: 'Squat Rack', img: 'https://images.unsplash.com/photo-1577992805669-c80be3285f36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80'},
            {name: 'Dumbbells', img: 'https://images.unsplash.com/photo-1562771242-a02d9090c90c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80'},
            {name: 'Smith Machine', img: 'https://plus.unsplash.com/premium_photo-1670505061070-2664ed450cda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=828&q=80'}, 
            {name: 'Treadmill', img: 'https://images.unsplash.com/photo-1591940765155-0604537032a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'}, 
            {name: 'Weights', img: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'}, 
            {name: '', img: ''}, 
        ]
    }
    const seedExercises = async () => {}
    const seedWorkoutsAndDetails = async () => {}
    const seedFood = async () => {}
    const seedMeals = async () => {}

    return {isAdmin}
}