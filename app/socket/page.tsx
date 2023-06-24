// import React from 'react';

// const page = () => {

//   return <div>page</div>;
// };

// export default page;

import React, { useEffect } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3000'; // replace with your server's URL

const page = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // Connect on component mount and disconnect on unmount
    const socket = io(SOCKET_SERVER_URL);

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>MyComponent</div>;
};

export default page;
