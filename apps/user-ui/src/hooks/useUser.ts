'use client'

import {useQuery} from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';


// fetch user data 

const fetchUser = async () => {
    const response = await axiosInstance.get('/api/logged-in-user',);
    console.log('response from fetch user',response.data)
    return response.data.user;
}


const useUser =  ()=>{
    const {
        data : user, // data returned from the query
         isLoading, // boolean indicating if the query is loading
          isError, // boolean indicating if there was an error
           refetch // function to manually refetch the data
        } = useQuery(  {
        queryKey : ["user"], // unique key for the query
       queryFn : fetchUser, // function to call the api
        staleTime : 5 * 60 * 1000, // time before data is considered stale
        retry : 1, // number of retry attempts on failure
     });
    return {user, isLoading, isError, refetch};
}

export default useUser;