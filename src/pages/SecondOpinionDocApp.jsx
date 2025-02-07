import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const SecondOpinionDocApp = () => {

    const appointment_img = 'https://res.cloudinary.com/dspuitf5t/image/upload/v1732230233/appointment_img_eryqsz.png'
    const arrow_icon = 'https://res.cloudinary.com/dspuitf5t/image/upload/v1732231523/arrow_icon_z237lb.svg'
    const info_icon = 'https://res.cloudinary.com/dspuitf5t/image/upload/v1732232006/info_icon_u0zxmb.svg'

    const navigate = useNavigate()
    const {token, backendUrl, departments, getAllDepartments} = useContext(AppContext)

    const [department, setDepartment] = useState('');
  const [filterSymptom, setFilterSymptom] = useState([]);
  const [userSymptoms, setUserSymptoms] = useState([]);
  const [reportFile, setReportFile] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkboxRefs = useRef([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setReportFile(file);
    } else {
      setReportFile(null);
    }
  };
    
    const setValue = (value, selectedIndex) => {
        setDepartment(value);
        if (selectedIndex === 0) {
          setFilterSymptom([]);
        } else {
          setFilterSymptom(departments[selectedIndex - 1].symptoms);
          setUserSymptoms([]);
        }
        checkboxRefs.current.forEach(ref => {
          if (ref) ref.checked = false;
        });
      };

      const addUserSymptoms = (symptom) => {
        setUserSymptoms(prev => 
          prev.includes(symptom) 
            ? prev.filter(s => s !== symptom)
            : [...prev, symptom]
        );
      };
    
    

    const bookSecondAppointment = async (event)=>{
        event.preventDefault()
        setIsLoading(true)

        if(!token){
          toast.warn('Login to Upload Report')
          return navigate('/login')
        }

        try {

            const formData = new FormData();
            formData.append('userSymptoms', userSymptoms);
            formData.append('department', department);

            reportFile && formData.append('file', reportFile)

            const {data} = await axios.post(backendUrl + '/api/user/book-second-opinion-appointment', formData, {headers:{token}})
            
            if(data.success){
                toast.success(data.message)
                navigate('/my-reports')
              } else {
                toast.error(data.message)
              }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        } finally {
            setIsLoading(false);
          }
        
      }

      useEffect(()=>{
        getAllDepartments()
      },[])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile First */}
      <div className="bg-primary rounded-lg mx-4 sm:mx-6 md:mx-10 my-6 sm:my-10 overflow-hidden">
        <div className="p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 text-white space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              Get A Second Opinion
              <br className="hidden sm:block" />
              On Your Reports With
              <br className="hidden sm:block" />
              Our Experienced Doctors
            </h1>
            <a
              href="#upload-report"
              className="inline-flex items-center px-6 py-3 bg-white text-primary rounded-full text-sm font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Upload Your Report
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
          
          <div className="w-full md:w-1/2 mt-8 md:mt-0">
            <img 
              src={appointment_img}
              alt="Medical consultation illustration"
              className="w-full max-w-md mx-auto"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div id="upload-report" className="px-4 sm:px-6 md:px-8 py-6 max-w-4xl mx-auto">
        <form onSubmit={bookSecondAppointment} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload Your Report</h2>

            {/* File Upload */}
            <div className="space-y-4">
              <div className="flex items-center">
                <label className="text-lg text-gray-700">Upload file</label>
                <button
                  type="button"
                  onClick={() => setShowInfo(!showInfo)}
                  className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              {showInfo && (
                <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  Only PDF files are supported
                </p>
              )}

              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                required
                className="block w-full text-sm text-gray-500 
                  file:mr-4 file:py-2 file:px-4 
                  file:rounded-full file:border-0 
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white 
                  hover:file:bg-primary/90"
              />
            </div>

            {/* Department Selection */}
            <div className="mt-8">
              <label className="text-lg text-gray-700">Select department</label>
              <select
                onChange={(e) => setValue(e.target.value, e.target.selectedIndex)}
                value={department}
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm 
                  focus:border-primary focus:ring-primary text-base"
              >
                <option value="">Not Selected</option>
                {departments.map((item, index) => (
                  <option key={index} value={item.speciality}>
                    {item.speciality}
                  </option>
                ))}
              </select>
            </div>

            {/* Symptoms Selection */}
            <div className="mt-8">
              <label className="text-lg text-gray-700">Select Symptoms</label>
              <div className="mt-4 flex flex-wrap gap-2">
                {filterSymptom[0] ? (
                  filterSymptom.map((item, index) => (
                    <label
                      key={index}
                      className="group flex items-center gap-2 border rounded-full px-4 py-2 
                        hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        ref={el => checkboxRefs.current[index] = el}
                        onChange={(e) => addUserSymptoms(e.target.value)}
                        value={item}
                        className="rounded-full text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {item}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No Symptoms Available</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 w-full sm:w-auto px-8 py-3 bg-primary text-white 
                rounded-full hover:bg-primary/90 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-primary
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200"
            >
              {isLoading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SecondOpinionDocApp