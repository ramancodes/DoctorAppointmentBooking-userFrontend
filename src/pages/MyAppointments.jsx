import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import {useNavigate} from 'react-router-dom'

const MyAppointments = () => {

  const {backendUrl, token, getDoctorsData, currencySymbol} = useContext(AppContext)

  const [appointments, setAppointments] = useState([])
  
  const navigate = useNavigate()
  
  const months = ["","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const slotDateFormat = (sloatDate)=>{
    const dateArray = sloatDate.split("_")
    return dateArray[0]+" "+months[Number(dateArray[1])]+" "+dateArray[2]
  }

  const getUserAppointments = async ()=>{
    try {
      const {data} = await axios.get(backendUrl+'/api/user/appointments', {headers:{token}})

      if(data.success){
        setAppointments(data.appointments)
        console.log(data.appointments);
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      
      const {data} = await axios.post(backendUrl+'/api/user/cancel-appointment', {appointmentId}, {headers:{token}})
      if(data.success){
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
      
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const initPay = (order) => {
    const type = 'appointment'
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description:'Appointment Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response)=>{
        console.log(response)

        try {
          const {data} = await axios.post(backendUrl+'/api/user/verify-razorpay', {response, type}, {headers:{token}})
          if(data.success){
            getUserAppointments()
            navigate('/my-appointments')
          }
        } catch (error) {
          console.log(error)
          toast.error(error.message)
          
        }
        
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const type = 'appointment'
      const {data} = await axios.post(backendUrl+'/api/user/payment-razorpay', {appointmentId, type}, {headers:{token}})
      if(data.success){
        console.log(data.order)
        initPay(data.order)
        
      }
    } catch (error) {
      
    }
  }

  useEffect(()=>{
    if(token){
      getUserAppointments()
    }
  },[token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
      <div>
        {
          appointments.map((item, index)=>(
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
              <div>
                <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
              </div>
              <div className='flex gap-2 w-full items-start'>
                <div className='flex-1 text-sm text-zinc-600'>
                  <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                  <p>{item.docData.speciality}</p>
                  <p className='text-zinc-700 font-medium mt-1 '>Address:</p>
                  <p className='text-xs'>{item.docData.address.line1}</p>
                  <p className='text-xs'>{item.docData.address.line2}</p>
                  <p className='text-zinc-700 font-medium mt-1 '>Fees:</p>
                  <p className='text-xs'>{currencySymbol} {item.amount}</p>
                </div>
                <div className='flex-1 text-sm text-zinc-600'>
                  <p className='text-zinc-700 font-medium mt-1'>Booked Date & Time:</p>
                  <p className='text-xs'>{item.bookedDate ? `${slotDateFormat(item.bookedDate)} | ${item.bookedTime}` : 'Not Available'}</p> 
                  <p className='text-zinc-700 font-medium mt-1'>Appointment Date & Time:</p>
                  <p className='text-xs'>{slotDateFormat(item.slotDate)} | {item.slotTime}</p> 
                  <p className='text-zinc-700 font-medium mt-1'>Completed Date & Time:</p>
                  <p className='text-xs'>{item.completedDate ? `${slotDateFormat(item.completedDate)} | ${item.completedTime}` : 'Not Completed'}</p>
                </div>
              </div>
              <div></div>
              <div className='flex flex-col gap-2 justify-end'>
                { !item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50'>Paid</button> }
                { !item.cancelled && !item.payment && !item.isCompleted && <button onClick={()=>appointmentRazorpay(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                { !item.cancelled && !item.isCompleted && <button onClick={()=>cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>} 
                { item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-300 rounded text-red-500'>Appointment Cancelled</button>}
                { item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-300 rounded text-green-500'>Appointment Completed</button>}
              </div>
            </div>
          ))
        }

      </div>
    </div>
  )
}

export default MyAppointments