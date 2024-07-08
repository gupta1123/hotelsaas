import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Frontdesk from './pages/Frontdesk';
import CreateBooking from './pages/CreateBooking';
import BookingList from './pages/BookingList';
import Housekeeping from './pages/Housekeeping';
import Settings from './pages/Settings';
import Ledgers from './pages/Ledgers';
import Rooms from './pages/Rooms';
import BookingConfirmation from './pages/BookingConfirmation';
import Report from './pages/Report';
import Offers from './pages/Offers';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import Invoice from './pages/Invoice';
import CombinedSettlementPage from './pages/CombinedSettlementPage';

 
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const expiryTime = localStorage.getItem('expiryTime');
  
    if (token && expiryTime) {
      const currentTime = new Date().getTime();
      if (currentTime < parseInt(expiryTime)) {
        setIsLoggedIn(true);
        setAuthToken(token);
      } else {
        // Token has expired, remove it from localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('expiryTime');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('expiryTime');
    setAuthToken('');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Flex direction={{ base: 'column', md: 'row' }} minHeight="100vh" bg={bgColor}>
        {isLoggedIn && <Sidebar display={{ base: 'none', md: 'block' }} />}
        <Box flex="1" ml={{ base: 0, md: isLoggedIn ? "250px" : "0" }}>
          {isLoggedIn && <Navbar handleLogout={handleLogout} />}
          <Box as="main" pt="70px" px={4}> {/* Added top padding to prevent overlap */}
            <Switch>
            <Route path="/login">
  <Login setIsLoggedIn={setIsLoggedIn} setAuthToken={setAuthToken} />
</Route>
              {isLoggedIn ? (
                <>
                  <Route path="/frontdesk">
                    <Frontdesk authToken={authToken} />
                  </Route>
                  <Route path="/create-booking">
                    <CreateBooking authToken={authToken} />
                  </Route>
                  <Route path="/booking-list">
                    <BookingList authToken={authToken} />
                  </Route>
                  <Route path="/housekeeping">
                    <Housekeeping authToken={authToken} />
                  </Route>
                  <Route path="/settings">
                    <Settings authToken={authToken} />
                  </Route>
                  <Route path="/ledgers">
                    <Ledgers authToken={authToken} />
                  </Route>
                  <Route path="/invoice">
                    <Invoice authToken={authToken} />
                  </Route>
                  <Route path="/rooms">
                    <Rooms authToken={authToken} />
                  </Route>
                  <Route path="/report">
                    <Report authToken={authToken} />
                  </Route>
                  <Route path="/offers">
                    <Offers authToken={authToken} />
                  </Route>
                  <Route path="/bookings">
                    <Bookings authToken={authToken} />
                  </Route>
                  <Route path="/bookingDetails">
                    <BookingDetails authToken={authToken} />  
                  </Route>
                  <Route path="/combined-settlement">
                    <CombinedSettlementPage authToken={authToken} />  
                  </Route>
                  <Route exact path="/">
                    <Redirect to="/frontdesk" />
                  </Route>
                  <Route path="/booking/:bookingId" render={(props) => <BookingConfirmation {...props} authToken={authToken} />} />
                  <Route path="/group-booking/:groupId" render={(props) => <BookingConfirmation {...props} authToken={authToken} />} />
                  
                </>
              ) : (
                <Redirect to="/login" />
              )}
            </Switch>
          </Box>
        </Box>
      </Flex>
    </Router>
  );
}

export default App;