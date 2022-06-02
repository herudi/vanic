import { useState } from "vanic";

// example hook for handling input form.
export const useInput = (initState) => {
  const [input, handle] = useState(initState);
  return [
    // object input
    input,

    // handling
    (e) => handle({ 
      ...input, 
      [e.target.id]: e.target.value 
    }),

    // reset
    (obj = {}) => handle({ ...input, ...obj })
  ]
}