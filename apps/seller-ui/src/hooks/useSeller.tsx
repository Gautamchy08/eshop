'use client'

import {useQuery} from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';


// fetch user data 

const fetchSeller = async () => {
    const response = await axiosInstance.get('/api/logged-in-seller',);
    // console.log('response from fetch user',response.data)
    return response.data.seller;
}


const useSeller =  ()=>{
    const {
        data : seller, // data returned from the query
         isLoading, // boolean indicating if the query is loading
          isError, // boolean indicating if there was an error
           refetch // function to manually refetch the data
        } = useQuery(  {
        queryKey : ["seller"], // unique key for the query
       queryFn : fetchSeller, // function to call the api
        staleTime : 5 * 60 * 1000, // time before data is considered stale
        retry : 1, // number of retry attempts on failure
     });

     console.log('data retreive from useSeller',seller);
    return {seller, isLoading, isError, refetch};
}

export default useSeller;